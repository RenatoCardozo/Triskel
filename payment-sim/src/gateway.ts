import crypto from 'node:crypto'
import QRCode from 'qrcode'
import { env } from './env'
import type { Db } from './db'
import { brandOf, brCode, cnpjOk, cpfOk, DECL, luhn, ruleOf, TDS_CODE, TDS_MAX_TRIES, validExp, Rule } from './rules'
import { enqueue, newId } from './webhooks'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public fields?: Record<string, string>) { super(message) }
}
const now = () => Date.now()
const e2eId = () => 'E' + crypto.randomBytes(16).toString('hex').slice(0, 31).toUpperCase()
const digits = (s: string) => String(s ?? '').replace(/\D/g, '')

// ---------------- tokens (navegador → gateway) ----------------
export interface TokenInput { number?: string; exp?: string; cvv?: string; holder?: string; document?: string; type?: 'credito' | 'debito'; cardRef?: string }
export function createToken(db: Db, i: TokenInput) {
  const cvv = digits(i.cvv || '')
  const id = newId('tok', 16), exp10 = now() + 10 * 60_000
  if (i.cardRef) {
    const c = db.prepare('SELECT * FROM cards WHERE ref = ?').get(i.cardRef) as any
    if (!c) throw new ApiError(404, 'CARD_NOT_FOUND', 'Cartão não encontrado.')
    if (!/^\d{3,4}$/.test(cvv)) throw new ApiError(422, 'VALIDATION', 'Informe o código de segurança.', { cvv: 'Informe o código de segurança.' })
    db.prepare('INSERT INTO tokens (id, brand, last4, exp, holder, type, rule, card_ref, expires_at) VALUES (?,?,?,?,?,?,?,?,?)').run(id, c.brand, c.last4, c.exp, c.holder, c.type, c.rule, c.ref, exp10)
    return { token: id, brand: c.brand, last4: c.last4, exp: c.exp, type: c.type as string, expiresAt: new Date(exp10).toISOString() }
  }
  const n = digits(i.number || ''), brand = brandOf(n), f: Record<string, string> = {}
  if (!luhn(n)) f.num = 'Número de cartão inválido. Confira os dígitos.'
  if (!validExp(i.exp || '')) f.val = 'Validade inválida.'
  if (!/^\d{3,4}$/.test(cvv) || (brand === 'Amex' ? cvv.length !== 4 : cvv.length !== 3)) f.cvv = brand === 'Amex' ? '4 dígitos.' : '3 dígitos.'
  if ((i.holder || '').trim().length < 3) f.nome = 'Informe o nome como está no cartão.'
  if (!(cpfOk(i.document || '') || cnpjOk(i.document || ''))) f.doc = 'Informe um CPF ou CNPJ válido.'
  if (Object.keys(f).length) throw new ApiError(422, 'VALIDATION', Object.values(f)[0], f)
  const type = i.type === 'debito' ? 'debito' : 'credito'
  // O número e o CVV NÃO são gravados: só marca, final, validade e a regra de teste derivada do número.
  db.prepare('INSERT INTO tokens (id, brand, last4, exp, holder, type, rule, expires_at) VALUES (?,?,?,?,?,?,?,?)').run(id, brand, n.slice(-4), i.exp!, i.holder!.trim().toUpperCase(), type, ruleOf(n), exp10)
  return { token: id, brand, last4: n.slice(-4), exp: i.exp!, type, expiresAt: new Date(exp10).toISOString() }
}

// ---------------- cobranças ----------------
type Row = Record<string, any>
export async function serialize(r: Row, withQr = false) {
  const out: Record<string, any> = { id: r.id, status: r.status, method: r.method, amountCents: r.amount_cents, externalRef: r.external_ref, createdAt: new Date(r.created_at).toISOString() }
  if (r.method === 'pix') {
    out.pix = { payload: r.pix_payload, expiresAt: new Date(r.expires_at).toISOString(), e2e: r.pix_e2e }
    if (withQr && r.status === 'pending') out.pix.qrSvg = await QRCode.toString(r.pix_payload, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
  } else {
    out.card = { brand: r.card_brand, last4: r.card_last4, type: r.card_type, exp: r.card_exp, holder: r.card_holder, ...(r.card_ref && r.status === 'paid' ? { ref: r.card_ref } : {}) }
    if (r.status === 'requires_action') out.action = { type: '3ds', id: r.id, attemptsLeft: TDS_MAX_TRIES - r.tds_tries }
  }
  if (r.status === 'failed') out.failure = { code: r.failure_code, message: r.failure_message }
  return out
}
const getRow = (db: Db, id: string) => db.prepare('SELECT * FROM charges WHERE id = ?').get(id) as Row | undefined
const emit = async (db: Db, r: Row) => {
  const type = r.status === 'paid' ? 'charge.paid' : r.status === 'failed' ? 'charge.failed' : r.status === 'expired' ? 'charge.expired' : null
  if (type) enqueue(db, type, await serialize(r))
}

export interface ChargeInput { amountCents: number; method: 'pix' | 'card'; externalRef: string; cardToken?: string; saveCard?: boolean; expectCardRef?: string }
export async function createCharge(db: Db, i: ChargeInput): Promise<{ charge: Record<string, any>; created: boolean }> {
  const prev = db.prepare('SELECT * FROM charges WHERE external_ref = ?').get(i.externalRef) as Row | undefined
  if (prev) {
    if (prev.amount_cents !== i.amountCents || prev.method !== i.method) throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'Já existe uma cobrança com esta referência e dados diferentes.')
    return { charge: await serialize(prev, true), created: false }
  }
  const id = newId('ch', 10), t = now()
  if (i.method === 'pix') {
    const txid = 'TRISKELSIM' + crypto.randomBytes(5).toString('hex').toUpperCase()
    db.prepare('INSERT INTO charges (id, external_ref, method, amount_cents, status, pix_payload, pix_txid, pix_e2e, expires_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .run(id, i.externalRef, 'pix', i.amountCents, 'pending', brCode(i.amountCents, txid, env.PIX_KEY), txid, e2eId(), t + env.PIX_TTL_SECONDS * 1000, t, t)
    return { charge: await serialize(getRow(db, id)!, true), created: true }
  }
  if (!i.cardToken) throw new ApiError(422, 'VALIDATION', 'Informe o token do cartão.')
  const tok = db.prepare('SELECT * FROM tokens WHERE id = ?').get(i.cardToken) as Row | undefined
  if (!tok || tok.expires_at < t) throw new ApiError(400, 'TOKEN_INVALID', 'Token de cartão inválido ou expirado.')
  if (i.expectCardRef && tok.card_ref !== i.expectCardRef) throw new ApiError(400, 'TOKEN_MISMATCH', 'O token não corresponde ao cartão salvo.')
  const used = db.prepare('UPDATE tokens SET used_at = ? WHERE id = ? AND used_at IS NULL').run(t, tok.id)
  if (Number(used.changes) !== 1) throw new ApiError(400, 'TOKEN_USED', 'Este token de cartão já foi utilizado.')
  const rule = tok.rule as Rule
  const status = rule === '3ds' ? 'requires_action' : rule === 'ok' ? 'paid' : 'failed'
  const fail = rule === 'ok' || rule === '3ds' ? null : DECL[rule]
  db.prepare('INSERT INTO charges (id, external_ref, method, amount_cents, status, card_brand, card_last4, card_type, card_exp, card_holder, card_ref, save_card, rule, failure_code, failure_message, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, i.externalRef, 'card', i.amountCents, status, tok.brand, tok.last4, tok.type, tok.exp, tok.holder, tok.card_ref, i.saveCard ? 1 : 0, rule, fail?.[0] ?? null, fail?.[1] ?? null, t, t)
  if (status === 'paid') await onPaid(db, id)
  const r = getRow(db, id)!
  await emit(db, r)
  return { charge: await serialize(r), created: true }
}
/** Pagamento aprovado: se o cliente pediu para salvar o cartão, guarda só a referência do cofre simulado. */
async function onPaid(db: Db, id: string) {
  const r = getRow(db, id)!
  let ref = r.card_ref as string | null
  if (r.method === 'card' && r.save_card && !ref) {
    ref = newId('card', 10)
    db.prepare('INSERT INTO cards (ref, brand, last4, exp, holder, type, rule, created_at) VALUES (?,?,?,?,?,?,?,?)').run(ref, r.card_brand, r.card_last4, r.card_exp, r.card_holder, r.card_type, r.rule, now())
  }
  db.prepare("UPDATE charges SET status = 'paid', card_ref = ?, updated_at = ?, pix_e2e = COALESCE(pix_e2e, NULL) WHERE id = ?").run(ref, now(), id)
}
export async function getCharge(db: Db, id: string) {
  const r = getRow(db, id)
  if (!r) throw new ApiError(404, 'NOT_FOUND', 'Cobrança não encontrada.')
  return serialize(r, true)
}
export async function confirm3ds(db: Db, id: string, code: string) {
  const r = getRow(db, id)
  if (!r) throw new ApiError(404, 'NOT_FOUND', 'Cobrança não encontrada.')
  if (r.status !== 'requires_action') throw new ApiError(409, 'NOT_PENDING', 'Esta cobrança não aguarda autenticação.')
  if (code === TDS_CODE) { await onPaid(db, id); const n = getRow(db, id)!; await emit(db, n); return serialize(n) }
  const tries = r.tds_tries + 1
  if (tries >= TDS_MAX_TRIES) {
    db.prepare("UPDATE charges SET status = 'failed', tds_tries = ?, failure_code = ?, failure_message = ?, updated_at = ? WHERE id = ?").run(tries, DECL.tds[0], DECL.tds[1], now(), id)
    const n = getRow(db, id)!; await emit(db, n); return serialize(n)
  }
  db.prepare('UPDATE charges SET tds_tries = ?, updated_at = ? WHERE id = ?').run(tries, now(), id)
  const out = await serialize(getRow(db, id)!)
  const left = TDS_MAX_TRIES - tries
  out.action.message = `Código incorreto. ${left === 1 ? 'Resta 1 tentativa.' : `Restam ${left} tentativas.`}`
  return out
}

// ---- ações do painel / simulação do banco ----
export async function adminCharge(db: Db, id: string, action: 'pay' | 'decline' | 'expire') {
  const r = getRow(db, id)
  if (!r) throw new ApiError(404, 'NOT_FOUND', 'Cobrança não encontrada.')
  if (r.status !== 'pending' && r.status !== 'requires_action') throw new ApiError(409, 'NOT_PENDING', 'Esta cobrança já foi finalizada.')
  if (action === 'pay') await onPaid(db, id)
  else if (action === 'expire') db.prepare("UPDATE charges SET status = 'expired', updated_at = ? WHERE id = ?").run(now(), id)
  else db.prepare("UPDATE charges SET status = 'failed', failure_code = ?, failure_message = ?, updated_at = ? WHERE id = ?").run(r.method === 'pix' ? '05' : DECL.tds[0], r.method === 'pix' ? 'Pagamento recusado pelo banco (simulado).' : DECL.tds[1], now(), id)
  const n = getRow(db, id)!
  await emit(db, n)
  return serialize(n)
}

// ---------------- saques ----------------
export const maskKey = (k: string) => (/^\d{11}$/.test(k) ? `CPF •••.${k.slice(3, 6)}.${k.slice(6, 9)}-••` : k.includes('@') ? 'E-mail ' + k.replace(/^(.)[^@]*/, '$1•••••') : 'Chave ' + k.slice(0, 3) + '•••')
const serPayout = (p: Row) => ({ id: p.id, status: p.status, amountCents: p.amount_cents, externalRef: p.external_ref, ...(p.reason ? { reason: p.reason } : {}) })
export function createPayout(db: Db, i: { amountCents: number; pixKey: string; externalRef: string }) {
  const prev = db.prepare('SELECT * FROM payouts WHERE external_ref = ?').get(i.externalRef) as Row | undefined
  if (prev) {
    if (prev.amount_cents !== i.amountCents) throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'Já existe um saque com esta referência e valor diferente.')
    return { payout: serPayout(prev), created: false }
  }
  const id = newId('po', 10), t = now()
  db.prepare('INSERT INTO payouts (id, external_ref, amount_cents, pix_key_masked, status, due_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, i.externalRef, i.amountCents, maskKey(i.pixKey), 'processing', env.PAYOUT_AUTO ? t + env.PAYOUT_DELAY_MS : null, t, t)
  return { payout: serPayout(db.prepare('SELECT * FROM payouts WHERE id = ?').get(id) as Row), created: true }
}
export function adminPayout(db: Db, id: string, action: 'complete' | 'fail') {
  const p = db.prepare('SELECT * FROM payouts WHERE id = ?').get(id) as Row | undefined
  if (!p) throw new ApiError(404, 'NOT_FOUND', 'Saque não encontrado.')
  if (p.status !== 'processing') throw new ApiError(409, 'NOT_PENDING', 'Este saque já foi finalizado.')
  const status = action === 'complete' ? 'completed' : 'failed', reason = action === 'fail' ? 'O banco não concluiu o Pix (simulado).' : null
  db.prepare('UPDATE payouts SET status = ?, reason = ?, due_at = NULL, updated_at = ? WHERE id = ?').run(status, reason, now(), id)
  const n = db.prepare('SELECT * FROM payouts WHERE id = ?').get(id) as Row
  enqueue(db, `payout.${status}`, serPayout(n))
  return serPayout(n)
}

// ---------------- relógio do gateway ----------------
export async function tick(db: Db) {
  const t = now()
  for (const r of db.prepare("SELECT id FROM charges WHERE method = 'pix' AND status = 'pending' AND expires_at <= ?").all(t) as Row[]) await adminCharge(db, r.id, 'expire')
  if (env.PIX_AUTOPAY_SECONDS > 0)
    for (const r of db.prepare("SELECT id FROM charges WHERE method = 'pix' AND status = 'pending' AND created_at <= ?").all(t - env.PIX_AUTOPAY_SECONDS * 1000) as Row[]) await adminCharge(db, r.id, 'pay')
  for (const p of db.prepare("SELECT id FROM payouts WHERE status = 'processing' AND due_at IS NOT NULL AND due_at <= ?").all(t) as Row[]) adminPayout(db, p.id, 'complete')
}
export function overview(db: Db) {
  const charges = db.prepare('SELECT * FROM charges ORDER BY created_at DESC LIMIT 100').all() as Row[]
  const payouts = db.prepare('SELECT * FROM payouts ORDER BY created_at DESC LIMIT 100').all() as Row[]
  const events = db.prepare('SELECT id, type, status, attempts, last_status, last_error, created_at FROM events ORDER BY created_at DESC LIMIT 100').all() as Row[]
  return {
    charges: charges.map((r) => ({ id: r.id, externalRef: r.external_ref, method: r.method, amountCents: r.amount_cents, status: r.status, detail: r.method === 'pix' ? `Pix · expira ${new Date(r.expires_at).toLocaleTimeString('pt-BR')}` : `${r.card_brand} •••• ${r.card_last4} · ${r.card_type}`, failure: r.failure_message, createdAt: r.created_at })),
    payouts: payouts.map((p) => ({ id: p.id, externalRef: p.external_ref, amountCents: p.amount_cents, status: p.status, key: p.pix_key_masked, createdAt: p.created_at })),
    events: events.map((e) => ({ id: e.id, type: e.type, status: e.status, attempts: e.attempts, lastStatus: e.last_status, lastError: e.last_error, createdAt: e.created_at })),
  }
}
