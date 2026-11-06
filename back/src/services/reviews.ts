import { prisma } from '../db'
import { conflict, forbidden, notFound, unprocessable } from '../lib/errors'
import { OPT } from '../lib/options'
import { fdtSP } from '../lib/dates'

type Eligible = { userId: string; name: string; type: string; context: string; ok: boolean; rated?: { stars: number; tags: string[]; comment: string | null } }

/** Parcerias avaliáveis: campanha concluída (pagamento liberado) ou negociação realizada (contraproposta ou acordo). */
export async function reviewCandidates(userId: string, role: string) {
  const asCreator = role === 'CREATOR'
  const props = await prisma.proposal.findMany({
    where: asCreator ? { creatorId: userId } : { contractorId: userId },
    include: { rounds: { select: { seq: true } }, contract: { select: { delivery: { select: { state: true, releasedAt: true } } } }, creator: { select: { id: true, name: true, creator: { select: { gender: true } } } }, contractor: { select: { id: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const given = await prisma.review.findMany({ where: { authorId: userId } })
  const map = new Map<string, Eligible>()
  for (const p of props) {
    const targetId = asCreator ? p.contractorId : p.creatorId
    const done = p.contract?.delivery?.state === 'LIBERADO'
    const negotiated = p.rounds.length > 1 || p.status === 'ACCEPTED' || p.status === 'CONTRACT'
    const ok = done || negotiated
    const ctx = done ? `${p.campaignName} · concluída em ${fdtSP(p.contract!.delivery!.releasedAt ?? p.updatedAt)}` : negotiated ? `Negociação realizada · ${p.campaignName}` : p.status === 'OPEN' ? 'Só convite enviado, sem resposta' : 'Ainda sem campanha ou negociação'
    const prev = map.get(targetId)
    if (prev && (prev.ok || !ok)) continue
    const type = asCreator ? (p.contractor.role === 'AGENCY' ? 'Agência' : 'Empresa') : (p.creator.creator?.gender === 'Mulher' ? 'Criadora' : 'Criador')
    map.set(targetId, { userId: targetId, name: asCreator ? p.brandName : p.creator.name, type, context: ctx, ok })
  }
  for (const r of given) { const e = map.get(r.targetUserId); if (e) e.rated = { stars: r.stars, tags: r.tags as string[], comment: r.comment } }
  const all = [...map.values()]
  return { pending: all.filter((x) => x.ok && !x.rated), done: all.filter((x) => x.ok && x.rated), locked: all.filter((x) => !x.ok), tags: asCreator ? OPT.tags.c : OPT.tags.k }
}

export async function createReview(userId: string, role: string, i: { targetUserId: string; stars: number; tags: string[]; comment?: string }) {
  const allowed = role === 'CREATOR' ? OPT.tags.c : OPT.tags.k
  if (i.tags.some((t) => !allowed.includes(t))) throw unprocessable('TAGS', 'Etiqueta inválida.')
  const cand = await reviewCandidates(userId, role)
  const hit = [...cand.pending, ...cand.done, ...cand.locked].find((x) => x.userId === i.targetUserId)
  if (!hit) throw notFound('Parceria não encontrada.')
  if (!hit.ok) throw forbidden('A avaliação libera depois de uma campanha concluída ou de uma negociação realizada.')
  if (hit.rated) throw conflict('ALREADY_RATED', 'Você já avaliou esta parceria.')
  await prisma.$transaction(async (tx) => {
    try { await tx.review.create({ data: { authorId: userId, targetUserId: i.targetUserId, stars: i.stars, tags: i.tags, comment: i.comment?.trim() || null } }) }
    catch (e: any) { if (e?.code === 'P2002') throw conflict('ALREADY_RATED', 'Você já avaliou esta parceria.'); throw e }
    const agg = await tx.review.aggregate({ where: { targetUserId: i.targetUserId }, _avg: { stars: true } })
    await tx.creatorProfile.updateMany({ where: { userId: i.targetUserId }, data: { ratingAvg: Math.round((agg._avg.stars ?? 0) * 10) / 10 } })
  })
}

/** Avaliações recebidas: nota média, etiquetas mais citadas e comentários. */
export async function receivedReviews(userId: string) {
  const rows = await prisma.review.findMany({ where: { targetUserId: userId }, include: { author: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' }, take: 100 })
  const tags = new Map<string, number>()
  rows.forEach((r) => (r.tags as string[]).forEach((t) => tags.set(t, (tags.get(t) ?? 0) + 1)))
  const avg = rows.length ? rows.reduce((s, r) => s + r.stars, 0) / rows.length : null
  return {
    count: rows.length, average: avg === null ? null : Math.round(avg * 10) / 10,
    tags: [...tags.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count })),
    items: rows.filter((r) => r.comment).map((r) => ({ author: r.author.name, stars: r.stars, comment: r.comment, at: r.createdAt })),
  }
}
