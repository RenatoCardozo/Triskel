import { Prisma } from '../generated/prisma/client'
import { prisma, Db, Tx } from '../db'
import { conflict, forbidden, notFound, unprocessable } from '../lib/errors'
import { breakdown, brl } from '../lib/money'
import { trxId } from '../lib/crypto'
import { fdt, fdtSP, isoDate } from '../lib/dates'
import { buildContractModel, ContractModel, makeSignature, PartyContractor, PartyCreator, Signature } from '../lib/contractModel'
import { buildContractPdf } from '../lib/contractPdf'
import { exTxt } from '../lib/exclusivity'
import { newStorageKey, storage } from '../lib/storage'
import { notify } from '../lib/emails'
import { debit } from './wallet'
import { addSystemMessage, FullProposal, fire, loadMine, proposalConflict } from './proposals'
import { brandKey } from './exclusivity'

const brt = (d: Date) => Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric' }).format(d))
export const contractNumber = (p: { number: number }, dt: Date) => `TRK-${brt(dt)}-${String(p.number).padStart(4, '0')}`

export async function loadParties(p: { contractorId: string; creatorId: string; brandName: string; clientName: string | null; segment: string }, db: Db = prisma) {
  const [ku, cu] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: p.contractorId }, include: { company: true } }),
    db.user.findUniqueOrThrow({ where: { id: p.creatorId }, include: { creator: true } }),
  ])
  const co = ku.company, cr = cu.creator
  // Decisão: e-mail e perfil social da outra parte NÃO entram no contrato (a plataforma não expõe contato entre as partes).
  const k: PartyContractor = { nome: p.brandName, doc: co?.cnpj || '', resp: co?.responsible || '', cidade: co?.city || '', uf: co?.uf || '', ag: ku.role === 'AGENCY', cli: p.clientName || '', seg: p.segment }
  const c: PartyCreator = { nome: cu.name, doc: cr?.cpf || '', nasc: cr?.birthDate ? fdt(cr.birthDate) : '', cidade: cr?.city || '', uf: cr?.uf || '' }
  const missK: string[] = [], missC: string[] = []
  if (!k.doc) missK.push('CNPJ')
  if (!k.resp) missK.push('nome do responsável')
  if (!k.cidade || !k.uf) missK.push('cidade e estado')
  if (!c.doc) missC.push('CPF')
  if (!c.cidade || !c.uf) missC.push('cidade e estado')
  return { k, c, missK, missC }
}

export function modelFor(p: FullProposal, parties: { k: PartyContractor; c: PartyCreator }): ContractModel {
  const last = p.rounds[p.rounds.length - 1]
  const dt = p.acceptedAt ?? last.createdAt
  const bd = breakdown(last.valueCents)
  return buildContractModel({
    num: contractNumber(p, dt), dt, k: parties.k, c: parties.c, videos: p.videos, format: p.format, campaignName: p.campaignName, objective: p.objective,
    delivery: last.deliveryDate, imageUse: last.imageUse, exclusiveDays: p.exclusiveDays, valueCents: bd.valueCents, feeCents: bd.feeCents, totalCents: bd.totalCents,
  })
}
const join = (m: string[]) => m.join(' e ')

// ---------- pagamento com o saldo da carteira ----------
export async function payContract(proposalId: string, userId: string) {
  const out = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Proposal\` WHERE id = ${proposalId} FOR UPDATE`
    const p = await loadMine(proposalId, userId, tx)
    if (p.contractorId !== userId) throw forbidden('Somente o contratante paga o contrato.')
    if (p.status === 'CONTRACT' && p.contract) return { contractId: p.contract.id, created: false }
    if (p.status !== 'ACCEPTED') throw conflict('NOT_ACCEPTED', 'Não há proposta aceita para pagar.')
    const last = p.rounds[p.rounds.length - 1]
    const cf = await proposalConflict(p, last.deliveryDate, tx)
    if (cf) throw unprocessable('EXCLUSIVITY', exTxt(cf, 'k'))
    const parties = await loadParties(p, tx)
    if (parties.missK.length) throw unprocessable('PROFILE_INCOMPLETE', `Complete ${join(parties.missK)} no seu perfil para assinar o contrato.`, { missing: parties.missK })
    const bd = breakdown(last.valueCents)
    const trx = trxId()
    try { await debit(tx, userId, bd.totalCents, trx, 'CONTRACT_PAYMENT') } catch (e: any) {
      if (e?.code === 'INSUFFICIENT_FUNDS') throw unprocessable('INSUFFICIENT_FUNDS', 'Saldo insuficiente. Adicione saldo para pagar.', { ...e.details, missingCents: bd.totalCents - (e.details?.balanceCents ?? 0) })
      throw e
    }
    const now = new Date()
    const model = modelFor(p, parties)
    const contract = await tx.contract.create({
      data: {
        number: model.num, proposalId: p.id, contractorId: p.contractorId, creatorId: p.creatorId, ...bd, deliveryDate: last.deliveryDate, imageUse: last.imageUse, exclusiveDays: p.exclusiveDays,
        segment: p.segment, brandName: brandKey(p), contractorPaidAt: now,
      },
    })
    await tx.moneyTx.create({
      data: { id: trx, userId, kind: 'CONTRACT', status: 'CUSTODIA', description: p.campaignName, counterparty: p.creator.name, valueCents: bd.valueCents, feeCents: bd.feeCents, totalCents: bd.totalCents, method: 'saldo', detail: 'Saldo da carteira', contractId: contract.id, idempotencyKey: `contract:${contract.id}` },
    })
    await tx.escrow.create({ data: { contractId: contract.id, payerId: userId, creatorId: p.creatorId, amountCents: bd.valueCents } })
    await tx.delivery.create({ data: { contractId: contract.id } })
    await tx.proposal.update({ where: { id: p.id }, data: { status: 'CONTRACT', unreadCreator: true } })
    await addSystemMessage(tx, p.id, `Contrato confirmado por ${p.brandName}. ${brl(bd.valueCents)} ficam em custódia até a aprovação da entrega.`)
    // Dados do criador completos: o contrato é congelado e a assinatura do contratante registrada agora.
    // Senão, a assinatura do contratante fica pendente (guarda o horário do pagamento) até o criador completar o perfil e assinar.
    if (!parties.missC.length) {
      await tx.contract.update({ where: { id: contract.id }, data: { snapshot: model as unknown as Prisma.InputJsonValue, sha256: model.hash, contractorSig: makeSignature(model, 'k', now) as unknown as Prisma.InputJsonValue } })
    }
    return { contractId: contract.id, created: true, p, bd, number: model.num }
  })
  if (out.created) {
    const { p, bd } = out as any
    fire(notify(p.creatorId, 'paid', { title: 'Contrato confirmado: assine para começar', body: `${p.brandName} confirmou o contrato da campanha “${p.campaignName}” (${brl(bd.valueCents)}). O valor está em custódia. Abra o contrato e assine para começar a produzir.`, link: `/contratos/${out.contractId}` }))
    fire(notify(p.contractorId, 'paid', { title: 'Contrato pago', body: `${brl(bd.totalCents)} foram debitados da sua carteira (${brl(bd.valueCents)} ao criador + ${brl(bd.feeCents)} de taxa) e ficam em custódia até a aprovação da entrega.`, link: `/contratos/${out.contractId}` }))
  }
  return out.contractId
}

// ---------- assinatura do criador ----------
export async function signAsCreator(contractId: string, userId: string) {
  const res = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM \`Contract\` WHERE id = ${contractId} FOR UPDATE`
    const c = await tx.contract.findFirst({ where: { id: contractId, creatorId: userId } })
    if (!c) throw notFound('Contrato não encontrado.')
    if (c.creatorSig) return { already: true as const, c }
    const p = await loadMine(c.proposalId, userId, tx)
    const cf = await proposalConflict(p, c.deliveryDate, tx)
    if (cf) throw unprocessable('EXCLUSIVITY', exTxt(cf, 'c'))
    const parties = await loadParties(p, tx)
    if (parties.missC.length) throw unprocessable('PROFILE_INCOMPLETE', `Complete ${join(parties.missC)} no seu perfil para assinar o contrato.`, { missing: parties.missC })
    const now = new Date()
    const model = (c.snapshot as unknown as ContractModel | null) ?? modelFor(p, parties)
    const kSig = (c.contractorSig as unknown as Signature | null) ?? makeSignature(model, 'k', c.contractorPaidAt)
    const cSig = makeSignature(model, 'c', now)
    const upd = await tx.contract.update({ where: { id: c.id }, data: { snapshot: model as unknown as Prisma.InputJsonValue, sha256: model.hash, contractorSig: kSig as unknown as Prisma.InputJsonValue, creatorSig: cSig as unknown as Prisma.InputJsonValue, signedAt: now } })
    await addSystemMessage(tx, p.id, `Contrato assinado por ${p.creator.name}. As duas partes assinaram e o PDF com as assinaturas digitais está disponível.`)
    await tx.proposal.update({ where: { id: p.id }, data: { unreadContractor: true } })
    return { already: false as const, c: upd, model, kSig, cSig, p }
  })
  if (!res.already) {
    const pdf = await buildContractPdf({ model: res.model, sigs: { k: res.kSig, c: res.cSig }, final: true, doneAt: res.c.signedAt })
    const key = newStorageKey('.pdf')
    await storage.put(key, Buffer.from(pdf))
    await prisma.contract.update({ where: { id: res.c.id }, data: { pdfKey: key } })
    const att = [{ filename: `Contrato-${res.model.num}-assinado.pdf`, content: Buffer.from(pdf), contentType: 'application/pdf' }]
    for (const uid of [res.p.contractorId, res.p.creatorId])
      fire(notify(uid, 'signedFinal', { title: `Contrato ${res.model.num} assinado pelas duas partes`, body: `O contrato da campanha “${res.p.campaignName}” foi assinado por ${res.p.brandName} e ${res.p.creator.name}. O PDF com as assinaturas digitais está em anexo.`, link: `/contratos/${res.c.id}`, attachments: att }))
  }
  return res.c.id
}

// ---------- leitura ----------
export async function loadContractFor(id: string, userId: string, db: Db = prisma) {
  const c = await db.contract.findFirst({ where: { id, OR: [{ contractorId: userId }, { creatorId: userId }] } })
  if (!c) throw notFound('Contrato não encontrado.')
  return c
}
const fmtSig = (s: Signature | null) => (s ? { nome: s.nome, org: s.org, doc: s.doc, papel: s.papel, at: s.dt, code: s.cod } : null)

export async function contractView(id: string, userId: string) {
  const c = await loadContractFor(id, userId)
  const side = c.creatorId === userId ? 'C' : 'K'
  const p = await loadMine(c.proposalId, userId)
  const parties = await loadParties(p)
  const model = (c.snapshot as unknown as ContractModel | null) ?? modelFor(p, parties)
  const kSig = c.contractorSig as unknown as Signature | null, cSig = c.creatorSig as unknown as Signature | null
  const miss = side === 'C' ? parties.missC : parties.missK
  const live = !c.signedAt
  const cf = live ? await proposalConflict(p, c.deliveryDate) : null
  return {
    contract: {
      id: c.id, number: c.number, proposalId: c.proposalId, side, signed: !!c.signedAt, signedAt: c.signedAt, paidAt: c.contractorPaidAt,
      valueCents: c.valueCents, ...(side === 'K' ? { feeCents: c.feeCents, totalCents: c.totalCents } : {}),
      deliveryDate: isoDate(c.deliveryDate), imageUse: c.imageUse, exclusiveDays: c.exclusiveDays, campaignName: p.campaignName,
      parties: { contractor: { name: model.k.nome, doc: model.k.doc, resp: model.k.resp, client: model.k.cli || null }, creator: { name: model.c.nome, doc: model.c.doc, city: [model.c.cidade, model.c.uf].filter(Boolean).join('/') } },
      signatures: { contractor: fmtSig(kSig), creator: fmtSig(cSig), contractorPending: !kSig },
      sha256: model.hash, frozen: !!c.snapshot, blocks: model.B,
    },
    missing: live ? miss : [],
    conflict: cf ? exTxt(cf, side === 'C' ? 'c' : 'k') : null,
    canSign: side === 'C' && !c.creatorSig,
    pdf: { kind: c.signedAt ? 'final' : 'minuta' },
  }
}

/** Resumo e minuta de uma proposta aceita, antes do pagamento (tela "Contrato"). */
export async function proposalContractPreview(proposalId: string, userId: string) {
  const p = await loadMine(proposalId, userId)
  if (p.contract) return { contractId: p.contract.id }
  if (p.status !== 'ACCEPTED') throw conflict('NOT_ACCEPTED', 'O contrato aparece quando as partes chegam a um acordo.')
  const side = p.creatorId === userId ? 'C' : 'K'
  const last = p.rounds[p.rounds.length - 1]
  const bd = breakdown(last.valueCents)
  const parties = await loadParties(p)
  const cf = await proposalConflict(p, last.deliveryDate)
  const model = modelFor(p, parties)
  const w = side === 'K' ? await prisma.wallet.findUnique({ where: { userId } }) : null
  return {
    contractId: null as string | null,
    summary: {
      number: model.num, side, campaignName: p.campaignName, brandName: p.brandName, clientName: p.clientName, creatorName: p.creator.name,
      valueCents: bd.valueCents, ...(side === 'K' ? { feeCents: bd.feeCents, totalCents: bd.totalCents } : {}),
      deliveryDate: isoDate(last.deliveryDate), imageUse: last.imageUse, revisions: (p.campaign.data as any)?.rev ?? '2 rodadas', exclusiveDays: p.exclusiveDays,
    },
    conflict: cf ? exTxt(cf, side === 'C' ? 'c' : 'k') : null,
    missing: side === 'K' ? parties.missK : [],
    wallet: side === 'K' ? { balanceCents: w?.balanceCents ?? 0, enough: (w?.balanceCents ?? 0) >= bd.totalCents, missingCents: Math.max(0, bd.totalCents - (w?.balanceCents ?? 0)), afterCents: (w?.balanceCents ?? 0) - bd.totalCents } : null,
    blocks: model.B,
  }
}

export async function contractPdf(id: string, userId: string) {
  const c = await loadContractFor(id, userId)
  if (c.signedAt && c.pdfKey) return { name: `Contrato-${c.number}-assinado.pdf`, data: await storage.get(c.pdfKey) }
  const p = await loadMine(c.proposalId, userId)
  const parties = await loadParties(p)
  const model = (c.snapshot as unknown as ContractModel | null) ?? modelFor(p, parties)
  const kSig = c.contractorSig as unknown as Signature | null, cSig = c.creatorSig as unknown as Signature | null
  const final = !!(kSig && cSig)
  const data = Buffer.from(await buildContractPdf({ model, sigs: { k: kSig, c: cSig }, final, doneAt: c.signedAt }))
  return { name: `Contrato-${c.number}-${final ? 'assinado' : 'minuta'}.pdf`, data }
}
void fdtSP; void ({} as Tx)
