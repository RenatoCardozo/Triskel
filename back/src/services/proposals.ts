import { Prisma } from '../generated/prisma/client'
import { prisma, Db, Tx } from '../db'
import { AppError, conflict, forbidden, notFound, unprocessable } from '../lib/errors'
import { breakdown, MIN_OFFER_CENTS } from '../lib/money'
import { isoDate, todaySP } from '../lib/dates'
import { leak, leakMessage } from '../lib/leak'
import { exTxt } from '../lib/exclusivity'
import { brl } from '../lib/money'
import { brandKey, creatorConflict } from './exclusivity'
import { notify } from '../lib/emails'
import { logger } from '../lib/logger'

export type Side = 'C' | 'K'
export const sideOf = (role: string): Side => (role === 'CREATOR' ? 'C' : 'K')
export const numberLabel = (n: number) => `PR-${n}`
export const fire = (p: Promise<unknown>) => { p.catch((e) => logger.warn({ err: (e as Error).message }, 'notificação falhou')) }

const full = {
  campaign: true,
  rounds: { orderBy: { seq: 'asc' as const } },
  messages: { orderBy: { createdAt: 'asc' as const } },
  contract: { select: { id: true, number: true, signedAt: true } },
  creator: { select: { id: true, name: true, avatarFileId: true, creator: { select: { niches: true, city: true, uf: true, ratingAvg: true, jobsCount: true } } } },
  contractor: { select: { id: true, name: true, avatarFileId: true } },
} satisfies Prisma.ProposalInclude
export type FullProposal = Prisma.ProposalGetPayload<{ include: typeof full }>

/** 404 também para proposta de terceiros (sem enumeração de IDs). */
export async function loadMine(id: string, userId: string, db: Db = prisma): Promise<FullProposal> {
  const p = await db.proposal.findFirst({ where: { id, OR: [{ contractorId: userId }, { creatorId: userId }] }, include: full })
  if (!p) throw notFound('Proposta não encontrada.')
  return p
}
export const lastRound = (p: { rounds: Array<{ seq: number }> }) => p.rounds[p.rounds.length - 1] as any
/** Turno: quem deve responder agora (só em negociação aberta). */
export const turnOf = (p: { status: string; rounds: Array<{ by: string }> }): Side | null =>
  p.status !== 'OPEN' ? null : p.rounds[p.rounds.length - 1].by === 'K' ? 'C' : 'K'

export async function proposalConflict(p: FullProposal | { creatorId: string; brandName: string; clientName: string | null; segment: string; exclusiveDays: number; id: string }, delivery: Date, db: Db = prisma) {
  return creatorConflict(p.creatorId, { brandName: brandKey(p), segment: p.segment, dias: p.exclusiveDays, delivery }, p.id, db)
}

export function roundDto(r: FullProposal['rounds'][number]) {
  return { seq: r.seq, by: r.by, ...breakdown(r.valueCents), deliveryDate: isoDate(r.deliveryDate), imageUse: r.imageUse, message: r.message, at: r.createdAt }
}

export async function proposalDto(p: FullProposal, side: Side, db: Db = prisma) {
  const last = p.rounds[p.rounds.length - 1]
  const turn = turnOf(p)
  const live = p.status === 'OPEN' || p.status === 'ACCEPTED'
  const cf = live ? await proposalConflict(p, last.deliveryDate, db) : null
  const conflictTxt = cf ? exTxt(cf, side === 'C' ? 'c' : 'k') : null
  const gen = p.campaign.generated as any
  const reqs = p.campaign.requirements as string[]
  const cr = p.creator.creator
  return {
    id: p.id, number: numberLabel(p.number), status: p.status, origin: p.origin, createdAt: p.createdAt, updatedAt: p.updatedAt,
    turn, yourTurn: turn === side, unread: side === 'C' ? p.unreadCreator : p.unreadContractor,
    campaign: { id: p.campaignId, name: p.campaignName, objective: p.objective, format: p.format, videos: p.videos, generated: gen, requirements: reqs, revisions: (p.campaign.data as any)?.rev ?? '2 rodadas' },
    brandName: p.brandName, clientName: p.clientName,
    counterpart: side === 'C'
      ? { name: p.brandName + (p.clientName ? ` · cliente ${p.clientName}` : ''), shortName: p.brandName, avatarUrl: p.contractor.avatarFileId ? `/files/${p.contractor.avatarFileId}` : null }
      : { id: p.creator.id, name: p.creator.name, shortName: p.creator.name, avatarUrl: p.creator.avatarFileId ? `/files/${p.creator.avatarFileId}` : null, niches: cr?.niches ?? [], city: cr?.city ?? null, rating: cr?.ratingAvg ?? 0 },
    rounds: p.rounds.map(roundDto),
    messages: p.messages.map((m) => ({ id: m.id, by: m.by, text: m.text, at: m.createdAt })),
    acceptedBy: p.acceptedBy, acceptedAt: p.acceptedAt,
    conflict: conflictTxt,
    contract: p.contract ? { id: p.contract.id, number: p.contract.number, signed: !!p.contract.signedAt } : null,
    can: { accept: turn === side && !cf, counter: turn === side, decline: turn === side, message: p.status !== 'DECLINED' && p.status !== 'CLOSED', pay: side === 'K' && p.status === 'ACCEPTED' },
    exclusivity: { days: p.exclusiveDays, from: isoDate(last.deliveryDate), to: p.exclusiveDays ? isoDate(new Date(last.deliveryDate.getTime() + p.exclusiveDays * 86_400_000)) : null },
    lastActivity: [last.createdAt, ...p.messages.map((m) => m.createdAt)].reduce((a, b) => (b > a ? b : a)),
  }
}

export function validateTerms(i: { valueCents: number; delivery: Date; message?: string | null }, requireMessage: boolean) {
  if (i.valueCents < MIN_OFFER_CENTS) throw unprocessable('VALUE_MIN', 'Informe o valor (mínimo R$ 10,00).')
  if (i.delivery <= todaySP()) throw unprocessable('DELIVERY_PAST', 'O prazo de entrega precisa ser uma data futura.')
  const m = (i.message || '').trim()
  if (requireMessage && !m) throw unprocessable('MESSAGE_REQUIRED', 'Escreva uma mensagem.')
  const lk = leak(m)
  if (lk) throw unprocessable('LEAK', leakMessage(lk), { kind: lk })
}

/** Trava a linha da proposta e revalida o turno dentro da transação (evita aceitar e contrapropor ao mesmo tempo). */
export async function lockTurn(tx: Tx, id: string, userId: string) {
  await tx.$queryRaw`SELECT id FROM \`Proposal\` WHERE id = ${id} FOR UPDATE`
  const p = await loadMine(id, userId, tx)
  const side: Side = p.creatorId === userId ? 'C' : 'K'
  if (turnOf(p) !== side) throw conflict('NOT_YOUR_TURN', 'Não há proposta para você responder agora.')
  return { p, side }
}

export async function addSystemMessage(tx: Db, proposalId: string, text: string) {
  await tx.message.create({ data: { proposalId, by: 'S', text } })
}

export function mailProposal(kind: 'proposal' | 'counter' | 'accepted' | 'declined', toUserId: string, p: { id: string; campaignName: string }, who: string, extra = '') {
  const titles = { proposal: 'Nova proposta na Triskel', counter: 'Contraproposta recebida', accepted: 'Proposta aceita', declined: 'Negociação encerrada' } as const
  const bodies = {
    proposal: `${who} enviou uma proposta para a campanha “${p.campaignName}”. ${extra}`,
    counter: `${who} respondeu com uma contraproposta na campanha “${p.campaignName}”. ${extra}`,
    accepted: `${who} aceitou a proposta da campanha “${p.campaignName}”${extra}.`,
    declined: `${who} encerrou a negociação da campanha “${p.campaignName}”.`,
  } as const
  fire(notify(toUserId, kind, { title: titles[kind], body: bodies[kind], link: `/contatos/${p.id}` }))
}
export { brl, AppError }
