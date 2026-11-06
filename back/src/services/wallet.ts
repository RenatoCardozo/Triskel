import { Prisma } from '../generated/prisma/client'
import { prisma, Db, Tx } from '../db'
import { AppError, conflict, notFound, unprocessable } from '../lib/errors'
import { RECHARGE_MAX_CENTS, RECHARGE_MIN_CENTS, WITHDRAW_MIN_CENTS, brl } from '../lib/money'
import { trxId, randomToken } from '../lib/crypto'
import { gateway, GatewayCharge } from '../lib/payment'
import { notify } from '../lib/emails'
import { fire } from './proposals'
import { logger } from '../lib/logger'

// ---------- primitivas de saldo + ledger (sempre dentro de transação) ----------
export async function ensureWallet(db: Db, userId: string) {
  await db.wallet.upsert({ where: { userId }, update: {}, create: { userId } })
}
async function ledger(tx: Tx, userId: string, txId: string, kind: string, amountCents: number) {
  const w = await tx.wallet.findUniqueOrThrow({ where: { userId } })
  await tx.ledgerEntry.create({ data: { walletUserId: userId, txId, kind, amountCents, balanceAfterCents: w.balanceCents } })
}
export async function credit(tx: Tx, userId: string, amountCents: number, txId: string, kind: string) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new Error('crédito inválido')
  await ensureWallet(tx, userId)
  await tx.wallet.update({ where: { userId }, data: { balanceCents: { increment: amountCents } } })
  await ledger(tx, userId, txId, kind, amountCents)
}
/** Débito atômico: só aplica se houver saldo (decremento condicional), nunca deixa o saldo negativo. */
export async function debit(tx: Tx, userId: string, amountCents: number, txId: string, kind: string) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) throw new Error('débito inválido')
  const r = await tx.wallet.updateMany({ where: { userId, balanceCents: { gte: amountCents } }, data: { balanceCents: { decrement: amountCents } } })
  if (r.count !== 1) {
    const w = await tx.wallet.findUnique({ where: { userId } })
    throw unprocessable('INSUFFICIENT_FUNDS', 'Saldo insuficiente.', { balanceCents: w?.balanceCents ?? 0, neededCents: amountCents })
  }
  await ledger(tx, userId, txId, kind, -amountCents)
}

// ---------- recargas (Pix e cartão) ----------
const cardDetail = (c?: GatewayCharge['card']) => (c ? `${c.brand} •••• ${c.last4} · ${c.type === 'credito' ? 'crédito' : 'débito'}` : 'Cartão')

export interface RechargeInput {
  amountCents: number; method: 'pix' | 'card'; cardToken?: string; cardType?: 'credito' | 'debito'; save?: boolean; savedCardId?: string; idempotencyKey?: string
}
export async function createRecharge(userId: string, i: RechargeInput) {
  if (i.amountCents < RECHARGE_MIN_CENTS) throw unprocessable('AMOUNT_MIN', `O valor mínimo é ${brl(RECHARGE_MIN_CENTS)}.`)
  if (i.amountCents > RECHARGE_MAX_CENTS) throw unprocessable('AMOUNT_MAX', `O limite por adição é ${brl(RECHARGE_MAX_CENTS)}.`)
  if (i.method === 'card' && !i.cardToken) throw unprocessable('CARD_TOKEN', 'Informe os dados do cartão.')
  const idem = `${userId}:${i.idempotencyKey || randomToken(12)}`
  const prev = await prisma.moneyTx.findUnique({ where: { idempotencyKey: idem } })
  if (prev) return rechargeView(prev)
  let expectCardRef: string | undefined
  if (i.savedCardId) {
    const c = await prisma.savedCard.findFirst({ where: { id: i.savedCardId, userId } })
    if (!c) throw notFound('Cartão não encontrado.')
    expectCardRef = c.gatewayRef
  }
  const tx = await prisma.moneyTx.create({
    data: { id: trxId(), userId, kind: 'RECHARGE', status: 'PENDENTE', description: 'Adição de saldo', valueCents: i.amountCents, feeCents: 0, totalCents: i.amountCents, method: i.method === 'pix' ? 'pix' : (i.cardType || 'credito'), detail: i.method === 'pix' ? 'Pix' : 'Cartão', idempotencyKey: idem },
  })
  let charge: GatewayCharge
  try {
    charge = await gateway.createCharge({ amountCents: i.amountCents, method: i.method, externalRef: tx.id, cardToken: i.cardToken, saveCard: !!i.save && !i.savedCardId, expectCardRef, cardType: i.cardType })
  } catch (e) {
    await prisma.moneyTx.update({ where: { id: tx.id }, data: { status: 'FALHOU', message: 'Não foi possível concluir com o gateway. Nada foi cobrado.' } })
    throw e
  }
  return rechargeView(await applyCharge(tx.id, charge))
}

/** Aplica o estado do gateway à transação. Idempotente: só transiciona a partir de PENDENTE. */
export async function applyCharge(txId: string, c: GatewayCharge) {
  const settled = await prisma.$transaction(async (db) => {
    const tx = await db.moneyTx.findUniqueOrThrow({ where: { id: txId } })
    const base = { gatewayRef: c.id }
    if (c.status === 'paid') {
      const r = await db.moneyTx.updateMany({ where: { id: txId, status: 'PENDENTE' }, data: { ...base, status: 'CONCLUIDO', detail: c.method === 'pix' ? 'Pix' : cardDetail(c.card), method: c.method === 'pix' ? 'pix' : c.card?.type || tx.method, e2e: c.pix?.e2e ?? null, message: null } })
      if (r.count === 1) {
        await credit(db, tx.userId, tx.valueCents, tx.id, 'RECHARGE')
        if (c.card?.ref && !(await db.savedCard.findFirst({ where: { userId: tx.userId, gatewayRef: c.card.ref } })) && c.card.exp)
          await db.savedCard.create({ data: { userId: tx.userId, gatewayRef: c.card.ref, brand: c.card.brand, last4: c.card.last4, exp: c.card.exp, holder: c.card.holder || '' } })
        return true
      }
    } else if (c.status === 'failed') {
      await db.moneyTx.updateMany({ where: { id: txId, status: 'PENDENTE' }, data: { ...base, status: 'RECUSADO', detail: cardDetail(c.card), method: c.card?.type || tx.method, message: c.failure?.message ?? 'Pagamento recusado.', code: c.failure?.code ?? null } })
    } else if (c.status === 'expired') {
      await db.moneyTx.updateMany({ where: { id: txId, status: 'PENDENTE' }, data: { ...base, status: 'EXPIRADO', message: 'Pix expirado sem pagamento. Nada foi cobrado.', e2e: c.pix?.e2e ?? tx.e2e } })
    } else {
      await db.moneyTx.updateMany({ where: { id: txId, status: 'PENDENTE' }, data: { ...base, e2e: c.pix?.e2e ?? tx.e2e, ...(c.method === 'card' ? { detail: cardDetail(c.card) } : {}) } })
    }
    return false
  })
  const row = await prisma.moneyTx.findUniqueOrThrow({ where: { id: txId } })
  if (settled) {
    const w = await prisma.wallet.findUniqueOrThrow({ where: { userId: row.userId } })
    fire(notify(row.userId, 'topup', { title: 'Saldo adicionado', body: `${brl(row.valueCents)} foram adicionados à sua carteira via ${row.detail}. Novo saldo: ${brl(w.balanceCents)}.`, link: '/pagamentos' }))
  }
  rememberCharge(row.id, c)
  return row
}
// Dados efêmeros do gateway (QR/ação 3DS) que não precisam ser persistidos; reconsultados no gateway quando faltam.
const chargeCache = new Map<string, GatewayCharge>()
function rememberCharge(id: string, c: GatewayCharge) { chargeCache.set(id, c); if (chargeCache.size > 500) chargeCache.delete(chargeCache.keys().next().value!) }

type Row = Awaited<ReturnType<typeof prisma.moneyTx.findUniqueOrThrow>>
export function txDto(t: Row) {
  return { id: t.id, kind: t.kind, status: t.status, description: t.description, counterparty: t.counterparty, valueCents: t.valueCents, feeCents: t.feeCents, totalCents: t.totalCents, method: t.method, detail: t.detail, message: t.message, code: t.code, e2e: t.e2e, createdAt: t.createdAt }
}
async function rechargeView(t: Row) {
  let c = chargeCache.get(t.id)
  if (!c && t.status === 'PENDENTE' && t.gatewayRef) c = await gateway.getCharge(t.gatewayRef).catch(() => undefined)
  return { transaction: txDto(t), pix: t.status === 'PENDENTE' ? c?.pix ?? null : null, action: t.status === 'PENDENTE' ? c?.action ?? null : null }
}

export async function getRecharge(userId: string, id: string) {
  let t = await prisma.moneyTx.findFirst({ where: { id, userId, kind: 'RECHARGE' } })
  if (!t) throw notFound('Transação não encontrada.')
  if (t.status === 'PENDENTE' && t.gatewayRef) {
    // se o webhook atrasou, reconcilia direto com o gateway
    const c = await gateway.getCharge(t.gatewayRef).catch(() => null)
    if (c && c.status !== 'pending' && c.status !== 'requires_action') t = await applyCharge(t.id, c)
  }
  return rechargeView(t)
}
export async function confirm3ds(userId: string, id: string, code: string) {
  const t = await prisma.moneyTx.findFirst({ where: { id, userId, kind: 'RECHARGE', status: 'PENDENTE' } })
  if (!t || !t.gatewayRef) throw notFound('Não há autenticação pendente para esta transação.')
  const c = await gateway.confirm3ds(t.gatewayRef, code)
  return rechargeView(await applyCharge(t.id, c))
}

// ---------- saque (criador) ----------
export const maskMail = (s: string) => s.replace(/^(.)[^@]*/, '$1•••••')
export async function pixKeyOf(userId: string, key: 'cpf' | 'mail') {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { creator: true } })
  if (key === 'cpf') {
    const d = (u.creator?.cpf || '').replace(/\D/g, '')
    if (d.length !== 11) throw unprocessable('NO_CPF', 'CPF não informado no perfil.')
    return { value: d, label: `Pix · CPF •••.${d.slice(3, 6)}.${d.slice(6, 9)}-••` }
  }
  return { value: u.email, label: `Pix · E-mail ${maskMail(u.email)}` }
}
export async function createWithdrawal(userId: string, i: { amountCents: number; key: 'cpf' | 'mail'; idempotencyKey?: string }) {
  if (i.amountCents < WITHDRAW_MIN_CENTS) throw unprocessable('AMOUNT_MIN', 'O valor mínimo para saque é R$ 10,00.')
  const idem = `${userId}:${i.idempotencyKey || randomToken(12)}`
  const prev = await prisma.moneyTx.findUnique({ where: { idempotencyKey: idem } })
  if (prev) return txDto(prev)
  const key = await pixKeyOf(userId, i.key)
  const tx = await prisma.$transaction(async (db) => {
    const id = trxId()
    try { await debit(db, userId, i.amountCents, id, 'WITHDRAWAL') } catch (e) {
      if (e instanceof AppError && e.code === 'INSUFFICIENT_FUNDS') throw unprocessable('INSUFFICIENT_FUNDS', `O valor é maior que o saldo disponível (${brl((e.details as any)?.balanceCents ?? 0)}).`, e.details)
      throw e
    }
    return db.moneyTx.create({ data: { id, userId, kind: 'WITHDRAWAL', status: 'PROCESSANDO', description: 'Saque via Pix', valueCents: i.amountCents, feeCents: 0, totalCents: i.amountCents, method: 'pix', detail: key.label, idempotencyKey: idem } })
  })
  try {
    const po = await gateway.createPayout({ amountCents: i.amountCents, pixKey: key.value, externalRef: tx.id })
    await prisma.moneyTx.update({ where: { id: tx.id }, data: { gatewayRef: po.id } })
    if (po.status === 'completed') await applyPayout(tx.id, 'completed')
    else if (po.status === 'failed') await applyPayout(tx.id, 'failed')
  } catch (e) {
    await applyPayout(tx.id, 'failed', 'Não foi possível enviar o Pix. O valor voltou ao seu saldo.')
    throw e
  }
  return txDto(await prisma.moneyTx.findUniqueOrThrow({ where: { id: tx.id } }))
}
/** payout.completed / payout.failed. Falha estorna o saldo (uma única vez). */
export async function applyPayout(txId: string, result: 'completed' | 'failed', reason?: string) {
  await prisma.$transaction(async (db) => {
    const t = await db.moneyTx.findUnique({ where: { id: txId } })
    if (!t || t.kind !== 'WITHDRAWAL') return
    const r = await db.moneyTx.updateMany({ where: { id: txId, status: 'PROCESSANDO' }, data: result === 'completed' ? { status: 'CONCLUIDO' } : { status: 'FALHOU', message: reason || 'O banco não concluiu o Pix. O valor voltou ao seu saldo.' } })
    if (r.count === 1 && result === 'failed') await credit(db, t.userId, t.valueCents, t.id, 'WITHDRAWAL_REVERSAL')
  })
}

// ---------- custódia ----------
/** Libera a custódia ao criador: Escrow HELD→RELEASED (uma vez) + crédito na carteira + tx do contratante LIBERADO. */
export async function releaseEscrow(tx: Tx, contractId: string) {
  const esc = await tx.escrow.findUniqueOrThrow({ where: { contractId } })
  const r = await tx.escrow.updateMany({ where: { id: esc.id, status: 'HELD' }, data: { status: 'RELEASED', releasedAt: new Date() } })
  if (r.count !== 1) return false
  const mt = await tx.moneyTx.findUnique({ where: { contractId } })
  await credit(tx, esc.creatorId, esc.amountCents, mt?.id ?? esc.id, 'ESCROW_RELEASE')
  if (mt) await tx.moneyTx.update({ where: { id: mt.id }, data: { status: 'LIBERADO' } })
  await tx.creatorProfile.update({ where: { userId: esc.creatorId }, data: { jobsCount: { increment: 1 } } })
  return true
}

// ---------- consultas ----------
export async function walletSummary(userId: string, role: string) {
  await ensureWallet(prisma, userId)
  const w = await prisma.wallet.findUniqueOrThrow({ where: { userId } })
  if (role === 'CREATOR') {
    const esc = await prisma.escrow.findMany({ where: { creatorId: userId }, include: { contract: { include: { tx: true, proposal: { select: { campaignName: true, brandName: true } } } } }, orderBy: { createdAt: 'desc' }, take: 100 })
    const wd = await prisma.moneyTx.findMany({ where: { userId, kind: 'WITHDRAWAL' }, orderBy: { createdAt: 'desc' }, take: 100 })
    const movements = [
      ...esc.map((e) => ({ id: e.contract.tx?.id ?? e.id, kind: 'PAY' as const, status: e.status === 'HELD' ? 'CUSTODIA' : 'LIBERADO', description: e.contract.proposal.campaignName, counterparty: e.contract.proposal.brandName, valueCents: e.amountCents, createdAt: e.createdAt })),
      ...wd.map((t) => ({ id: t.id, kind: 'WITHDRAWAL' as const, status: t.status, description: t.description, counterparty: null, valueCents: t.valueCents, createdAt: t.createdAt })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    return { role, availableCents: w.balanceCents, custodyCents: esc.filter((e) => e.status === 'HELD').reduce((s, e) => s + e.amountCents, 0), movements }
  }
  const [txs, esc, cards] = await Promise.all([
    prisma.moneyTx.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.escrow.findMany({ where: { payerId: userId }, select: { amountCents: true, status: true } }),
    prisma.savedCard.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ])
  return {
    role, balanceCents: w.balanceCents,
    custodyCents: esc.filter((e) => e.status === 'HELD').reduce((s, e) => s + e.amountCents, 0),
    releasedCents: esc.filter((e) => e.status === 'RELEASED').reduce((s, e) => s + e.amountCents, 0),
    cards: cards.map((c) => ({ id: c.id, ref: c.gatewayRef, brand: c.brand, last4: c.last4, exp: c.exp })), // ref: id do cofre do gateway (o navegador usa para tokenizar com o CVV)
    movements: txs.map(txDto),
  }
}
export async function receipt(userId: string, role: string, id: string) {
  const own = await prisma.moneyTx.findFirst({ where: { id, userId } })
  if (own) return { receipt: txDto(own) }
  if (role === 'CREATOR') {
    const t = await prisma.moneyTx.findFirst({ where: { id, contract: { creatorId: userId } }, include: { contract: { include: { proposal: { select: { campaignName: true, brandName: true } } } } } })
    if (t) return { receipt: { id: t.id, kind: 'PAY', status: t.status, description: t.contract!.proposal.campaignName, counterparty: t.contract!.proposal.brandName, valueCents: t.contract!.valueCents, createdAt: t.createdAt } }
  }
  throw notFound('Comprovante não encontrado.')
}
export async function removeCard(userId: string, id: string) {
  const r = await prisma.savedCard.deleteMany({ where: { id, userId } })
  if (!r.count) throw notFound('Cartão não encontrado.')
}
void conflict; void logger; void ({} as Prisma.JsonValue)
