import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth, roles } from '../plugins/auth'
import { conflict, notFound, unprocessable } from '../lib/errors'
import { OPT } from '../lib/options'
import { brl } from '../lib/money'
import { exTxt } from '../lib/exclusivity'
import { isoDate, parseISODate, todaySP, DAY_MS } from '../lib/dates'
import { leak, leakMessage } from '../lib/leak'
import { creatorConflict, signedInfos } from '../services/exclusivity'
import { ownCampaign } from '../services/campaigns'
import {
  addSystemMessage, FullProposal, loadMine, lockTurn, mailProposal, numberLabel, proposalConflict, proposalDto, sideOf, turnOf, validateTerms, Side,
} from '../services/proposals'
import { CampaignData } from '../services/campaignGen'

const isoD = z.string().refine((s) => !!parseISODate(s), 'data inválida (aaaa-mm-dd)')
const uso = z.string().refine((v) => OPT.uso.includes(v), 'opção inválida')
const id = z.object({ id: z.string() })

export async function proposalRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['propostas']
  const sideOfReq = (role: string): Side => sideOf(role)

  const contractorName = async (userId: string, fallback: string) => (await prisma.companyProfile.findUnique({ where: { userId }, select: { tradeName: true } }))?.tradeName || fallback

  // ---------- lista (Contatos) ----------
  app.get('/proposals', { schema: { tags, querystring: z.object({ filter: z.enum(['all', 'me', 'open', 'closed']).default('all') }) } }, async (req) => {
    const side = sideOfReq(req.user!.role), me = req.user!.id
    const rows = await prisma.proposal.findMany({
      where: side === 'C' ? { creatorId: me } : { contractorId: me },
      include: { rounds: { orderBy: { seq: 'asc' } }, messages: { orderBy: { createdAt: 'asc' } }, creator: { select: { name: true, avatarFileId: true } }, contractor: { select: { avatarFileId: true } } },
    })
    const items = rows.map((p) => {
      const last = p.rounds[p.rounds.length - 1], turn = turnOf(p)
      const ev = [...p.rounds.map((r) => ({ at: r.createdAt, t: `${r.seq === 1 ? 'Proposta' : 'Contraproposta'} de ${brl(r.valueCents)}` })), ...p.messages.map((m) => ({ at: m.createdAt, t: m.text }))].sort((a, b) => b.at.getTime() - a.at.getTime())[0]
      const needs = (p.status === 'OPEN' && turn === side) || (p.status === 'ACCEPTED' && side === 'K')
      return {
        id: p.id, number: numberLabel(p.number), status: p.status, yourTurn: turn === side, needsYou: needs, unread: side === 'C' ? p.unreadCreator : p.unreadContractor,
        counterpart: side === 'C' ? p.brandName : p.creator.name, clientName: p.clientName, avatarUrl: side === 'K' && p.creator.avatarFileId ? `/files/${p.creator.avatarFileId}` : null,
        campaignName: p.campaignName, lastValueCents: last.valueCents, preview: ev?.t ?? '', lastActivity: ev?.at ?? p.createdAt,
      }
    }).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
    const f = req.query.filter
    const out = items.filter((x) => f === 'me' ? x.needsYou : f === 'open' ? ['OPEN', 'ACCEPTED'].includes(x.status) : f === 'closed' ? ['CONTRACT', 'DECLINED', 'CLOSED'].includes(x.status) : true)
    let exclusivities: unknown[] = []
    if (side === 'C') {
      const hoje = todaySP()
      exclusivities = (await signedInfos(me)).filter((e) => e.dias && e.fim && e.fim >= hoje).map((e) => ({ brand: e.coName, segment: e.seg, until: isoDate(e.fim!) }))
    }
    return { items: out, counts: { all: items.length, needsYou: items.filter((x) => x.needsYou).length }, exclusivities }
  })

  app.get('/proposals/:id', { schema: { tags, params: id } }, async (req) => {
    const side = sideOfReq(req.user!.role)
    const p = await loadMine(req.params.id, req.user!.id)
    if (side === 'C' ? p.unreadCreator : p.unreadContractor) await prisma.proposal.update({ where: { id: p.id }, data: side === 'C' ? { unreadCreator: false } : { unreadContractor: false }, select: { id: true } })
    return { proposal: { ...(await proposalDto(p, side)), unread: false } }
  })

  // ---------- contratante: enviar proposta (1 ou vários criadores) ----------
  app.post('/proposals', {
    preHandler: roles('BUSINESS', 'AGENCY'),
    schema: { tags, body: z.object({
      campaignId: z.string(), creatorIds: z.array(z.string()).min(1).max(20), valueCents: z.number().int(), delivery: isoD, imageUse: uso, message: z.string().max(1000),
    }).strict() },
  }, async (req, reply) => {
    const b = req.body, me = req.user!
    if (me.role === 'BUSINESS' && b.creatorIds.length > 1) throw unprocessable('ONE_CREATOR', 'Seu perfil envia a proposta a um criador por vez.')
    const camp = await ownCampaign(b.campaignId, me.id)
    if (camp.status !== 'OPEN') throw conflict('CAMPAIGN_DRAFT', 'Confirme a campanha antes de enviar propostas.')
    const delivery = parseISODate(b.delivery)!
    validateTerms({ valueCents: b.valueCents, delivery, message: b.message }, true)
    const u = await prisma.user.findUniqueOrThrow({ where: { id: me.id } })
    const brandName = await contractorName(me.id, u.name)
    const d = camp.data as unknown as CampaignData
    const sent: Array<{ proposalId: string; creatorId: string; reused: boolean }> = []
    const blocked: Array<{ creatorId: string; message: string }> = []
    for (const creatorId of [...new Set(b.creatorIds)]) {
      const cr = await prisma.user.findFirst({ where: { id: creatorId, role: 'CREATOR', listed: true }, select: { id: true } })
      if (!cr) { blocked.push({ creatorId, message: 'Este criador não está disponível.' }); continue }
      const dup = await prisma.proposal.findFirst({ where: { campaignId: camp.id, creatorId, status: { in: ['OPEN', 'ACCEPTED', 'CONTRACT'] } }, select: { id: true } })
      if (dup) { sent.push({ proposalId: dup.id, creatorId, reused: true }); continue }
      const cf = await creatorConflict(creatorId, { brandName: camp.brandName, segment: camp.segment, dias: camp.exclusiveDays, delivery })
      if (cf) { blocked.push({ creatorId, message: exTxt(cf, 'k') }); continue }
      const p = await prisma.proposal.create({
        data: {
          campaignId: camp.id, contractorId: me.id, creatorId, origin: 'INVITE', brandName, clientName: me.role === 'AGENCY' ? camp.brandName : null, segment: camp.segment,
          exclusiveDays: camp.exclusiveDays, videos: camp.videos, campaignName: camp.name, objective: camp.objective, format: (d.fmt || []).join(', '), unreadCreator: true,
          rounds: { create: { seq: 1, by: 'K', valueCents: b.valueCents, deliveryDate: delivery, imageUse: b.imageUse, message: b.message.trim() } },
        },
      })
      sent.push({ proposalId: p.id, creatorId, reused: false })
      mailProposal('proposal', creatorId, { id: p.id, campaignName: camp.name }, brandName, `Valor: ${brl(b.valueCents)}.`)
    }
    if (!sent.length) throw unprocessable('EXCLUSIVITY', blocked[0]?.message || 'Nenhum criador disponível.', { blocked })
    return reply.status(201).send({ sent, blocked })
  })

  // ---------- criador: candidatura a uma campanha aberta ----------
  app.post('/opportunities/:id/apply', {
    preHandler: roles('CREATOR'),
    schema: { tags, params: id, body: z.object({ valueCents: z.number().int(), message: z.string().max(1000) }).strict() },
  }, async (req, reply) => {
    const me = req.user!.id
    const camp = await prisma.campaign.findFirst({ where: { id: req.params.id, status: 'OPEN', ownerId: { not: me } }, include: { owner: { include: { company: true } } } })
    if (!camp) throw notFound('Campanha não encontrada.')
    const dup = await prisma.proposal.findFirst({ where: { campaignId: camp.id, creatorId: me, status: { in: ['OPEN', 'ACCEPTED', 'CONTRACT'] } }, select: { id: true } })
    if (dup) throw conflict('ALREADY_APPLIED', 'Você já tem uma conversa para esta campanha.', { proposalId: dup.id })
    validateTerms({ valueCents: req.body.valueCents, delivery: camp.deliveryDate, message: req.body.message }, true)
    const cf = await creatorConflict(me, { brandName: camp.brandName, segment: camp.segment, dias: camp.exclusiveDays, delivery: camp.deliveryDate })
    if (cf) throw unprocessable('EXCLUSIVITY', exTxt(cf, 'c'))
    const d = camp.data as unknown as CampaignData
    const brandName = camp.owner.company?.tradeName || camp.owner.name
    const p = await prisma.proposal.create({
      data: {
        campaignId: camp.id, contractorId: camp.ownerId, creatorId: me, origin: 'APPLICATION', brandName, clientName: camp.owner.role === 'AGENCY' ? camp.brandName : null, segment: camp.segment,
        exclusiveDays: camp.exclusiveDays, videos: camp.videos, campaignName: camp.name, objective: camp.objective, format: (d.fmt || []).join(', '), unreadContractor: true,
        rounds: { create: { seq: 1, by: 'C', valueCents: req.body.valueCents, deliveryDate: camp.deliveryDate, imageUse: camp.imageUse, message: req.body.message.trim() } },
      },
    })
    const creator = await prisma.user.findUniqueOrThrow({ where: { id: me }, select: { name: true } })
    mailProposal('proposal', camp.ownerId, { id: p.id, campaignName: camp.name }, creator.name, `Valor: ${brl(req.body.valueCents)}.`)
    return reply.status(201).send({ proposalId: p.id })
  })

  // ---------- aceitar ----------
  app.post('/proposals/:id/accept', { schema: { tags, params: id } }, async (req) => {
    const out = await prisma.$transaction(async (tx) => {
      const { p, side } = await lockTurn(tx, req.params.id, req.user!.id)
      const last = p.rounds[p.rounds.length - 1]
      const cf = await proposalConflict(p, last.deliveryDate, tx)
      if (cf) throw unprocessable('EXCLUSIVITY', exTxt(cf, side === 'C' ? 'c' : 'k'))
      const who = side === 'C' ? p.creator.name : p.brandName
      await tx.proposal.update({ where: { id: p.id }, data: { status: 'ACCEPTED', acceptedBy: side === 'C' ? 'C' : 'K', acceptedAt: new Date(), ...(side === 'C' ? { unreadContractor: true } : { unreadCreator: true }) } })
      await addSystemMessage(tx, p.id, `Proposta aceita por ${who} em ${brl(last.valueCents)}.`)
      return { p, side, who, last }
    })
    mailProposal('accepted', out.side === 'C' ? out.p.contractorId : out.p.creatorId, { id: out.p.id, campaignName: out.p.campaignName }, out.who, ` em ${brl(out.last.valueCents)}`)
    return { proposal: await proposalDto(await loadMine(req.params.id, req.user!.id), out.side) }
  })

  // ---------- recusar (criador) / encerrar (contratante) ----------
  app.post('/proposals/:id/decline', { schema: { tags, params: id } }, async (req) => {
    const out = await prisma.$transaction(async (tx) => {
      const { p, side } = await lockTurn(tx, req.params.id, req.user!.id)
      const status = side === 'C' ? 'DECLINED' : 'CLOSED'
      await tx.proposal.update({ where: { id: p.id }, data: { status, ...(side === 'C' ? { unreadContractor: true } : { unreadCreator: true }) } })
      await addSystemMessage(tx, p.id, side === 'C' ? `${p.creator.name} recusou a proposta.` : `${p.brandName} encerrou a negociação.`)
      return { p, side }
    })
    mailProposal('declined', out.side === 'C' ? out.p.contractorId : out.p.creatorId, { id: out.p.id, campaignName: out.p.campaignName }, out.side === 'C' ? out.p.creator.name : out.p.brandName)
    return { proposal: await proposalDto(await loadMine(req.params.id, req.user!.id), out.side) }
  })

  // ---------- contraproposta ----------
  app.post('/proposals/:id/counter', {
    schema: { tags, params: id, body: z.object({ valueCents: z.number().int(), delivery: isoD, imageUse: uso, message: z.string().max(1000).default('') }).strict() },
  }, async (req) => {
    const b = req.body
    const delivery = parseISODate(b.delivery)!
    validateTerms({ valueCents: b.valueCents, delivery, message: b.message }, false)
    const out = await prisma.$transaction(async (tx) => {
      const { p, side } = await lockTurn(tx, req.params.id, req.user!.id)
      const last = p.rounds[p.rounds.length - 1]
      if (b.valueCents === last.valueCents && delivery.getTime() === last.deliveryDate.getTime() && b.imageUse === last.imageUse && !b.message.trim())
        throw unprocessable('NO_CHANGE', 'Altere uma condição ou escreva uma mensagem.')
      await tx.proposalRound.create({ data: { proposalId: p.id, seq: last.seq + 1, by: side, valueCents: b.valueCents, deliveryDate: delivery, imageUse: b.imageUse, message: b.message.trim() || null } })
      await tx.proposal.update({ where: { id: p.id }, data: side === 'C' ? { unreadContractor: true } : { unreadCreator: true } })
      return { p, side }
    })
    mailProposal('counter', out.side === 'C' ? out.p.contractorId : out.p.creatorId, { id: out.p.id, campaignName: out.p.campaignName }, out.side === 'C' ? out.p.creator.name : out.p.brandName, `Valor: ${brl(b.valueCents)}.`)
    return { proposal: await proposalDto(await loadMine(req.params.id, req.user!.id), out.side) }
  })

  // ---------- mensagens ----------
  app.post('/proposals/:id/messages', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    schema: { tags, params: id, body: z.object({ text: z.string().trim().min(2, 'Escreva a mensagem antes de enviar.').max(1000) }).strict() },
  }, async (req, reply) => {
    const p: FullProposal = await loadMine(req.params.id, req.user!.id)
    if (!['OPEN', 'ACCEPTED', 'CONTRACT'].includes(p.status)) throw conflict('CLOSED', 'Esta negociação já foi encerrada.')
    const lk = leak(req.body.text)
    if (lk) throw unprocessable('LEAK', leakMessage(lk), { kind: lk })
    const side: Side = p.creatorId === req.user!.id ? 'C' : 'K'
    await prisma.$transaction([
      prisma.message.create({ data: { proposalId: p.id, by: side, text: req.body.text } }),
      prisma.proposal.update({ where: { id: p.id }, data: side === 'C' ? { unreadContractor: true } : { unreadCreator: true } }),
    ])
    return reply.status(201).send({ proposal: await proposalDto(await loadMine(p.id, req.user!.id), side) })
  })
  void DAY_MS
}
