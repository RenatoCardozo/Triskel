import { prisma } from '../db'
import { compat, ccompat, nearReg, notaMin, nz, porteK } from '../lib/compat'
import { exTxt } from '../lib/exclusivity'
import { isoDate, parseISODate } from '../lib/dates'
import { breakdown } from '../lib/money'
import { REGIAO_PELOTAS } from '../lib/options'
import { campaignContext } from './campaigns'
import { creatorConflict } from './exclusivity'
import { CampaignData } from './campaignGen'

export const creatorCard = (u: any, c: any) => ({
  id: u.id, name: u.name, niches: c.niches as string[], city: c.city, uf: c.uf, rating: c.ratingAvg, jobs: c.jobsCount, sizeBand: c.sizeBand,
  followers: ((c.networkStats as any) || {}).Instagram ?? c.followersBand, vminCents: c.vminCents, vmaxCents: c.vmaxCents, avgDelivery: c.avgDelivery,
  avatarUrl: u.avatarFileId ? `/files/${u.avatarFileId}` : null,
})


export interface CreatorFilters { campaignId?: string; q?: string; nich?: string[]; reg?: string; porte?: string[]; nota?: string; vmax?: number; ord: 'compat' | 'nota' | 'valor' | 'trab'; entrega?: string }
export async function searchCreators(userId: string, f: CreatorFilters) {
      const ctx = f.campaignId ? await campaignContext(f.campaignId, userId) : null
  const pz = (f.entrega && parseISODate(f.entrega)) || ctx?.delivery || null
  const rows = await prisma.user.findMany({ where: { role: 'CREATOR', listed: true }, include: { creator: true } })
  const q = nz(f.q?.trim() || '')
  const items = []
  for (const u of rows) {
    const c = u.creator!
    const niches = c.niches as string[]
    if (q && !(nz(u.name).includes(q) || niches.some((n) => nz(n).includes(q)) || nz(c.city || '').includes(q))) continue
    if (f.nich?.length && !niches.some((n) => f.nich!.includes(n))) continue
    if (!nearReg(c.nearPelotas, f.reg)) continue
    if (f.porte?.length && !f.porte.map(porteK).includes(c.sizeBand || '')) continue
    if (c.ratingAvg < notaMin(f.nota)) continue
    if (f.vmax && (c.vminCents ?? 0) > f.vmax) continue
    const cp = ctx ? compat({ niches, near: c.nearPelotas, rating: c.ratingAvg, sizeBand: c.sizeBand || '', vminCents: c.vminCents ?? 0 }, ctx.compatInput) : { pct: 0, why: [] as string[] }
    let conflict: string | null = null
    if (ctx && pz) { const cf = await creatorConflict(u.id, { brandName: ctx.brandKey, segment: ctx.segment, dias: ctx.exclusiveDays, delivery: pz }); if (cf) conflict = exTxt(cf, 'k') }
    const existing = ctx ? await prisma.proposal.findFirst({ where: { campaignId: ctx.id, creatorId: u.id, status: { in: ['OPEN', 'ACCEPTED', 'CONTRACT'] } }, select: { id: true } }) : null
    items.push({ ...creatorCard(u, c), compat: cp, conflict, proposalId: existing?.id ?? null })
  }
  items.sort((a, b) => f.ord === 'nota' ? b.rating - a.rating : f.ord === 'valor' ? (a.vminCents ?? 0) - (b.vminCents ?? 0) : f.ord === 'trab' ? b.jobs - a.jobs : b.compat.pct - a.compat.pct)
  return { items, total: items.length, campaign: ctx ? { id: ctx.id, name: ctx.name, valueCents: ctx.valueCents } : null }
}

export const isNearCity = (city?: string | null) => REGIAO_PELOTAS.includes(nz(city || ''))
export interface OppFilters { q?: string; nich?: string[]; reg?: string; vmin?: number; ord: 'compat' | 'valor' | 'prazo' }
export function oppDto(c: any, me: { niches: string[]; vminCents: number }, near: boolean, conflict: string | null, prop: { id: string } | null) {
  const d = c.data as CampaignData
  const total = c.valueCents * c.videos
  const cp = ccompat({ niches: d.nichosCr, near, valueCents: total, videos: c.videos }, me)
  return {
    id: c.id, name: c.name, brandName: c.brandName, segment: c.segment, city: c.owner.company?.city ?? null, uf: c.owner.company?.uf ?? null,
    niches: d.nichosCr, objective: c.objective, description: c.description, format: (d.fmt || []).join(', '), videos: c.videos, deliveryDate: isoDate(c.deliveryDate),
    imageUse: c.imageUse, platforms: d.plat, revisions: d.rev, exclusiveDays: c.exclusiveDays,
    youReceiveCents: total, feeCents: breakdown(total).feeCents, compat: cp, conflict, proposalId: prop?.id ?? null,
  }
}
export async function listOpportunities(userId: string, f: OppFilters) {
  const me = await prisma.creatorProfile.findUniqueOrThrow({ where: { userId } })
  const rows = await prisma.campaign.findMany({ where: { status: 'OPEN', ownerId: { not: userId }, deliveryDate: { gt: new Date(Date.now() - 86_400_000) } }, include: { owner: { include: { company: true } } }, orderBy: { createdAt: 'desc' }, take: 200 })
  const mine = await prisma.proposal.findMany({ where: { creatorId: userId, status: { in: ['OPEN', 'ACCEPTED', 'CONTRACT'] } }, select: { id: true, campaignId: true } })
  const q = nz(f.q?.trim() || '')
  const items = []
  for (const c of rows) {
    const d = c.data as unknown as CampaignData
    const city = c.owner.company?.city || ''
    if (q && !(nz(c.name).includes(q) || nz(c.brandName).includes(q) || d.nichosCr.some((n) => nz(n).includes(q)) || nz(city).includes(q))) continue
    if (f.nich?.length && !d.nichosCr.some((n) => f.nich!.includes(n))) continue
    const near = isNearCity(city)
    if (!nearReg(near, f.reg)) continue
    if (f.vmin && c.valueCents * c.videos < f.vmin) continue
    const prop = mine.find((p) => p.campaignId === c.id) || null
    const cf = prop ? null : await creatorConflict(userId, { brandName: c.brandName, segment: c.segment, dias: c.exclusiveDays, delivery: c.deliveryDate })
    items.push(oppDto(c, { niches: me.niches as string[], vminCents: me.vminCents ?? 0 }, near, cf ? exTxt(cf, 'c') : null, prop))
  }
  items.sort((a, b) => f.ord === 'valor' ? b.youReceiveCents - a.youReceiveCents : f.ord === 'prazo' ? a.deliveryDate.localeCompare(b.deliveryDate) : b.compat.pct - a.compat.pct)
  return { items, total: items.length }
}
void campaignContext; void parseISODate; void compat; void notaMin; void porteK
