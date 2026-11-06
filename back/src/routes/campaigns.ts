import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth, roles } from '../plugins/auth'
import { notFound, unprocessable } from '../lib/errors'
import { ccompat, nearReg, nz } from '../lib/compat'
import { isNearCity, listOpportunities, oppDto } from '../services/search'
import { exTxt } from '../lib/exclusivity'
import { breakdown } from '../lib/money'
import { isoDate, parseISODate } from '../lib/dates'
import { creatorConflict } from '../services/exclusivity'
import { campaignDto, campaignInput, brandOf, checkCampaign, ensureEditable, ownCampaign, toRow, exclDays } from '../services/campaigns'
import { loadProfile } from '../services/profile'
import { generate, CampaignData } from '../services/campaignGen'
import { Prisma } from '../generated/prisma/client'

const csv = z.string().max(500).transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))

export async function campaignRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['campanhas']
  const ctr = roles('BUSINESS', 'AGENCY')
  const id = z.object({ id: z.string() })

  /** Valores iniciais do formulário a partir do perfil (protótipo: CD0, perfil novo). */
  app.get('/campaigns/defaults', { preHandler: ctr, schema: { tags } }, async (req) => {
    const p = (await loadProfile(req.user!.id)).api as any
    return { pIdade: p.pIdade || [], pGen: p.pGen || '', pReg: p.pReg || p.reg || '', pInt: p.pInt || [], nichosCr: p.nichosCr || [], porteCr: p.porteCr || [], regCr: p.pReg || p.reg || '', qCr: 1, qVid: 1 }
  })

  app.get('/campaigns', { preHandler: ctr, schema: { tags } }, async (req) => {
    const rows = await prisma.campaign.findMany({
      where: { ownerId: req.user!.id }, orderBy: { createdAt: 'desc' },
      include: { client: true, proposals: { select: { id: true, status: true, contract: { select: { signedAt: true, delivery: { select: { state: true } } } } } } },
    })
    return { items: rows.map((c) => ({
      id: c.id, name: c.name, status: c.status, brandName: c.brandName, clientName: c.client?.name ?? null, videos: c.videos, creatorsQty: c.creatorsQty,
      valueCents: c.valueCents, deliveryDate: isoDate(c.deliveryDate), createdAt: c.createdAt,
      proposals: c.proposals.length, accepted: c.proposals.filter((p) => p.status === 'ACCEPTED').length,
      contracts: c.proposals.filter((p) => p.status === 'CONTRACT').length,
      deliveryStates: c.proposals.map((p) => p.contract?.delivery?.state).filter(Boolean),
    })) }
  })

  /** Pré-visualização da campanha gerada, sem gravar (botão "Gerar campanha"). */
  app.post('/campaigns/preview', { preHandler: ctr, schema: { tags, body: campaignInput } }, async (req) => {
    checkCampaign(req.body)
    const brand = await brandOf({ id: req.user!.id, role: req.user!.role, name: '' }, req.body.clientId)
    const { valueCents, clientId: _c, ...d } = req.body
    const g = generate(d as unknown as CampaignData, brand.brandName)
    const per = valueCents * req.body.qVid
    return { generated: { headline: g.headline, creators: g.creators, content: g.content }, requirements: g.defaultRequirements, conditions: { perCreator: breakdown(per), total: breakdown(per * req.body.qCr), perVideoCents: valueCents }, brandName: brand.brandName }
  })

  app.post('/campaigns', { preHandler: ctr, schema: { tags, body: campaignInput } }, async (req, reply) => {
    checkCampaign(req.body)
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
    const brand = await brandOf(u, req.body.clientId)
    const c = await prisma.campaign.create({ data: { ownerId: u.id, clientId: brand.clientId, brandName: brand.brandName, segment: brand.segment, ...toRow(req.body, brand), status: 'DRAFT' }, include: { client: true } })
    return reply.status(201).send({ campaign: campaignDto(c) })
  })

  app.get('/campaigns/:id', { preHandler: ctr, schema: { tags, params: id } }, async (req) => ({ campaign: campaignDto(await ownCampaign(req.params.id, req.user!.id)) }))

  app.put('/campaigns/:id', { preHandler: ctr, schema: { tags, params: id, body: campaignInput } }, async (req) => {
    const cur = await ownCampaign(req.params.id, req.user!.id)
    await ensureEditable(cur)
    checkCampaign(req.body)
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
    const brand = await brandOf(u, req.body.clientId ?? cur.clientId ?? undefined)
    const c = await prisma.campaign.update({ where: { id: cur.id }, data: { clientId: brand.clientId, brandName: brand.brandName, segment: brand.segment, ...toRow(req.body, brand), status: 'DRAFT' }, include: { client: true } })
    return { campaign: campaignDto(c) }
  })

  /** "Confirmar e buscar criadores": publica a campanha e fixa os requisitos que a IA vai conferir. */
  app.post('/campaigns/:id/confirm', {
    preHandler: ctr,
    schema: { tags, params: id, body: z.object({ requirements: z.array(z.string().trim().min(2).max(160)).min(1).max(20) }) },
  }, async (req) => {
    const cur = await ownCampaign(req.params.id, req.user!.id)
    const c = await prisma.campaign.update({ where: { id: cur.id }, data: { status: 'OPEN', requirements: req.body.requirements as Prisma.InputJsonValue }, include: { client: true } })
    return { campaign: campaignDto(c) }
  })

  app.delete('/campaigns/:id', { preHandler: ctr, schema: { tags, params: id } }, async (req, reply) => {
    const cur = await ownCampaign(req.params.id, req.user!.id)
    await ensureEditable(cur)
    await prisma.campaign.delete({ where: { id: cur.id } })
    return reply.status(204).send()
  })

  // ---------- criador: oportunidades (campanhas abertas) ----------
  const open = roles('CREATOR')
  app.get('/opportunities', {
    preHandler: open,
    schema: { tags, querystring: z.object({ q: z.string().max(60).optional(), nich: csv.optional(), reg: z.string().max(40).optional(), vmin: z.coerce.number().int().min(0).optional(), ord: z.enum(['compat', 'valor', 'prazo']).default('compat') }) },
  }, async (req) => listOpportunities(req.user!.id, req.query))
  app.get('/opportunities/:id', { preHandler: open, schema: { tags, params: id } }, async (req) => {
    const c = await prisma.campaign.findFirst({ where: { id: req.params.id, status: 'OPEN' }, include: { owner: { include: { company: true } } } })
    if (!c) throw notFound('Campanha não encontrada.')
    const me = await prisma.creatorProfile.findUniqueOrThrow({ where: { userId: req.user!.id } })
    const prop = await prisma.proposal.findFirst({ where: { campaignId: c.id, creatorId: req.user!.id, status: { in: ['OPEN', 'ACCEPTED', 'CONTRACT'] } }, select: { id: true } })
    const cf = prop ? null : await creatorConflict(req.user!.id, { brandName: c.brandName, segment: c.segment, dias: c.exclusiveDays, delivery: c.deliveryDate })
    const dto = oppDto(c, { niches: me.niches as string[], vminCents: me.vminCents ?? 0 }, isNearCity(c.owner.company?.city), cf ? exTxt(cf, 'c') : null, prop)
    const ex = c.exclusiveDays ? { days: c.exclusiveDays, from: isoDate(c.deliveryDate), to: isoDate(new Date(c.deliveryDate.getTime() + c.exclusiveDays * 86_400_000)) } : null
    return { campaign: dto, exclusivity: ex }
  })
  void parseISODate; void unprocessable; void exclDays
}
