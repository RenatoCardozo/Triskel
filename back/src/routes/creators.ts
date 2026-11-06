import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth, roles } from '../plugins/auth'
import { compat, nearReg, notaMin, nz, porteK } from '../lib/compat'
import { notFound } from '../lib/errors'
import { OPT } from '../lib/options'
import { exTxt } from '../lib/exclusivity'
import { creatorConflict } from '../services/exclusivity'
import { breakdown } from '../lib/money'
import { parseISODate, isoDate } from '../lib/dates'
import { campaignContext } from '../services/campaigns'
import { searchCreators, creatorCard } from '../services/search'

const csv = z.string().max(500).transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
export async function creatorRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['criadores']

  /** Busca de criadores (comércio e agência). Nunca devolve @ de redes, e-mail ou telefone. */
  app.get('/creators', {
    preHandler: roles('BUSINESS', 'AGENCY'),
    schema: { tags, querystring: z.object({
      campaignId: z.string().optional(), q: z.string().max(60).optional(), nich: csv.optional(), reg: z.string().max(40).optional(), porte: csv.optional(),
      nota: z.string().max(20).optional(), vmax: z.coerce.number().int().min(0).optional(), ord: z.enum(['compat', 'nota', 'valor', 'trab']).default('compat'),
      entrega: z.string().optional(),
    }) },
  }, async (req) => searchCreators(req.user!.id, req.query))

  app.get('/creators/:id', {
    preHandler: roles('BUSINESS', 'AGENCY'),
    schema: { tags, params: z.object({ id: z.string() }), querystring: z.object({ campaignId: z.string().optional(), entrega: z.string().optional() }) },
  }, async (req) => {
    const u = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CREATOR', listed: true }, include: { creator: true, portfolio: { orderBy: { createdAt: 'desc' } } } })
    if (!u) throw notFound('Criador não encontrado.')
    const c = u.creator!
    const ctx = req.query.campaignId ? await campaignContext(req.query.campaignId, req.user!.id) : null
    const pz = (req.query.entrega && parseISODate(req.query.entrega)) || ctx?.delivery || null
    const cp = ctx ? compat({ niches: c.niches as string[], near: c.nearPelotas, rating: c.ratingAvg, sizeBand: c.sizeBand || '', vminCents: c.vminCents ?? 0 }, ctx.compatInput) : null
    let conflict: string | null = null
    if (ctx && pz) { const cf = await creatorConflict(u.id, { brandName: ctx.brandKey, segment: ctx.segment, dias: ctx.exclusiveDays, delivery: pz }); if (cf) conflict = exTxt(cf, 'k') }
    const stats = (c.networkStats as Record<string, string>) || {}
    const nets: Array<[string, string | null]> = [['Instagram', c.instagram], ['TikTok', c.tiktok], ['YouTube', c.youtube]]
    const existing = ctx ? await prisma.proposal.findFirst({ where: { campaignId: ctx.id, creatorId: u.id, status: { in: ['OPEN', 'ACCEPTED', 'CONTRACT'] } }, select: { id: true } }) : null
    return {
      creator: { ...creatorCard(u, c), about: c.about, networks: nets.filter(([, h]) => h).map(([n]) => ({ name: n, followers: stats[n] ?? c.followersBand })),
        prices: c.showPrices ? { fromCents: c.vminCents, toCents: c.vmaxCents } : null, portfolio: u.portfolio.map((p) => ({ id: p.id, title: p.title, description: p.description, views: p.views })) },
      compat: cp, conflict, proposalId: existing?.id ?? null,
      withCampaign: ctx ? breakdown(ctx.valueCents * ctx.videos) : null,
      delivery: pz ? isoDate(pz) : null,
    }
  })
  void OPT
}
