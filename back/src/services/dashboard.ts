import { prisma } from '../db'
import { brl } from '../lib/money'
import { todaySP } from '../lib/dates'
import { listDeliveries } from './deliveries'
import { listOpportunities, searchCreators } from './search'
import { reviewCandidates, receivedReviews } from './reviews'
import { loadProfile } from './profile'

/** "Doce Vale Confeitaria" -> "Doce Vale"; "Clínica Sorriso Sul" -> "Sorriso Sul" (rótulo curto do protótipo). */
const shortName = (n: string) => n.replace(/^(Clínica|Studio|Estúdio|Loja)\s+/i, '').replace(/\s+(Confeitaria|Studio)$/i, '')

/** Valor do KPI: sem centavos quando inteiro ("R$ 420"), como no protótipo. */
const brlShort = (cents: number) => (cents % 100 === 0 ? brl(cents).replace(/,00$/, '') : brl(cents))

/** Painel inicial por perfil: KPIs, itens que pedem atenção e uma sugestão (compatibilidade). Os rótulos seguem o protótipo. */
export async function dashboard(userId: string, role: 'CREATOR' | 'BUSINESS' | 'AGENCY') {
  const prof = await loadProfile(userId)
  const w = await prisma.wallet.findUnique({ where: { userId } })
  const deliveries = await listDeliveries(userId, role)
  const needDeliveries = deliveries.filter((d) => d.needsYou)
  const cand = await reviewCandidates(userId, role)
  const reviewsPending = cand.pending.length
  const monthStart = new Date(Date.UTC(todaySP().getUTCFullYear(), todaySP().getUTCMonth(), 1))
  const base = { fresh: false, profile: { complete: prof.complete, verified: prof.verified, visible: prof.visible, missing: prof.missing }, reviewsPending, wallet: { balanceCents: w?.balanceCents ?? 0 } }

  if (role === 'CREATOR') {
    const [open, esc, rec, cp] = await Promise.all([
      prisma.proposal.findMany({ where: { creatorId: userId, status: 'OPEN' }, include: { rounds: { select: { by: true }, orderBy: { seq: 'asc' } } }, orderBy: { updatedAt: 'desc' } }),
      prisma.escrow.aggregate({ where: { creatorId: userId, status: 'HELD' }, _sum: { amountCents: true } }),
      receivedReviews(userId),
      prisma.creatorProfile.findUnique({ where: { userId }, select: { ratingAvg: true } }),
    ])
    const mine = open.filter((p) => p.rounds[p.rounds.length - 1].by === 'K')
    const activeList = deliveries.filter((d) => d.state !== 'LIBERADO')
    const active = activeList.length
    const nextDue = activeList.map((d) => d.deliveryDate).filter(Boolean).sort()[0] as string | undefined
    const opp = (await listOpportunities(userId, { ord: 'compat' })).items.find((o) => !o.proposalId && !o.conflict)
    return {
      ...base, role,
      kpis: [
        { label: 'Propostas novas', value: String(mine.length), hint: mine.length > 0 ? 'Aguarda a sua resposta' : 'Nada pendente' },
        { label: active === 1 ? 'Campanha ativa' : 'Campanhas ativas', value: String(active), ...(nextDue ? { hint: `Entrega em ${nextDue.slice(8, 10)}/${nextDue.slice(5, 7)}` } : {}) },
        { label: 'A receber', value: brlShort(esc._sum.amountCents ?? 0), hint: (esc._sum.amountCents ?? 0) > 0 ? 'Libera após aprovação' : 'Nada pendente' },
        { label: 'Nota média', value: (cp?.ratingAvg ?? 0) > 0 ? '★ ' + String(cp!.ratingAvg).replace('.', ',') : rec.average === null ? '—' : String(rec.average).replace('.', ','), ...(rec.count ? { hint: `${rec.count} ${rec.count > 1 ? 'avaliações' : 'avaliação'}` } : {}) },
      ],
      attention: [
        ...needDeliveries.slice(0, 2).map((d) => ({ kind: 'delivery' as const, id: d.id, title: !d.signed ? 'Assine o contrato' : d.state === 'PROD' ? (d.adjust.comment ? `Ajustes pedidos por ${d.campaign.brandName}` : 'Entrega em produção') : d.state === 'IA' ? 'Análise da IA concluída' : 'Entrega aprovada', subtitle: d.campaign.name })),
        ...mine.slice(0, 2).map((p) => ({ kind: 'proposal' as const, id: p.id, title: 'Sua vez de responder', subtitle: `${p.campaignName} · ${p.brandName}` })),
      ],
      suggestion: opp ? { kind: 'campaign' as const, id: opp.id, title: opp.name, subtitle: `${opp.brandName} · ${brl(opp.youReceiveCents)} · ${opp.videos} ${opp.videos > 1 ? 'vídeos' : 'vídeo'} · ${opp.compat.pct}% compatível` } : null,
    }
  }

  const [campaigns, invites, spent, contracted, clients] = await Promise.all([
    prisma.campaign.findMany({ where: { ownerId: userId, status: 'OPEN' }, include: { proposals: { select: { status: true, contract: { select: { delivery: { select: { state: true } } } } } } } }),
    prisma.proposal.count({ where: { contractorId: userId, status: 'OPEN', origin: 'INVITE' } }),
    prisma.moneyTx.aggregate({ where: { userId, kind: 'CONTRACT', createdAt: { gte: monthStart } }, _sum: { totalCents: true } }),
    prisma.proposal.findMany({ where: { contractorId: userId, status: 'CONTRACT' }, select: { creatorId: true } }),
    role === 'AGENCY' ? prisma.agencyClient.findMany({ where: { agencyId: userId }, select: { id: true, name: true, _count: { select: { campaigns: true } } } }) : Promise.resolve([]),
  ])
  const active = campaigns.filter((c) => c.proposals.some((p) => ['OPEN', 'ACCEPTED'].includes(p.status) || (p.status === 'CONTRACT' && p.contract?.delivery?.state !== 'LIBERADO'))).length
  const review = deliveries.filter((d) => d.state === 'APROV').length
  const accepted = await prisma.proposal.findMany({ where: { contractorId: userId, status: 'ACCEPTED' }, include: { creator: { select: { name: true } }, rounds: { select: { valueCents: true }, orderBy: { seq: 'asc' } } }, orderBy: { updatedAt: 'desc' }, take: 2 })
  const responded = await prisma.proposal.findMany({ where: { contractorId: userId, status: 'OPEN' }, include: { creator: { select: { name: true } }, rounds: { select: { by: true, valueCents: true }, orderBy: { seq: 'asc' } } }, take: 10, orderBy: { updatedAt: 'desc' } })
  const activeClients = (clients as any[]).filter((c) => c._count.campaigns > 0) as Array<{ name: string }>
  const inProd = deliveries.filter((d) => d.state === 'PROD').length
  const sent = await prisma.proposal.count({ where: { contractorId: userId } })
  const replied = responded.filter((p) => p.rounds[p.rounds.length - 1].by === 'C').length
  const waiting = deliveries.filter((d) => d.state !== 'LIBERADO').length
  const approvedVideos = deliveries.filter((d) => d.state === 'LIBERADO' || d.state === 'APROVADO').reduce((n, d) => n + (d.campaign.videos || 0), 0)
  const kpis = role === 'AGENCY'
    ? [
        { label: 'Clientes ativos', value: String(activeClients.length), hint: activeClients.map((c) => shortName(c.name)).join(', ') || 'Nenhum cliente com campanha' },
        { label: 'Campanhas ativas', value: String(active), hint: inProd > 0 ? `${inProd} em produção` : 'Nenhuma em produção' },
        { label: 'Propostas enviadas', value: String(sent), hint: replied > 0 ? `${replied} ${replied === 1 ? 'respondeu' : 'responderam'}` : 'Nenhuma resposta ainda' },
        { label: 'Entregas para revisar', value: String(review), hint: review > 0 ? 'Aguardam a sua revisão' : 'Nenhuma pendente' },
      ]
    : [
        { label: 'Campanhas ativas', value: String(active), hint: waiting > 0 ? `${waiting} aguardando entrega` : 'Nenhuma aguardando entrega' },
        { label: 'Propostas enviadas', value: String(sent), hint: replied > 0 ? `${replied} ${replied === 1 ? 'respondeu' : 'responderam'}` : 'Nenhuma resposta ainda' },
        { label: 'Entregas para revisar', value: String(review), hint: review > 0 ? 'Aguardam a sua revisão' : 'Nenhuma pendente' },
        { label: 'Investido no mês', value: brlShort(spent._sum.totalCents ?? 0), hint: approvedVideos > 0 ? `${approvedVideos} ${approvedVideos === 1 ? 'vídeo aprovado' : 'vídeos aprovados'}` : 'Nenhum vídeo aprovado' },
      ]
  const latest = campaigns.length ? campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] : null
  let suggestion = null as null | { kind: 'creator'; id: string; title: string; subtitle: string }
  if (latest) {
    const top = (await searchCreators(userId, { campaignId: latest.id, ord: 'compat' })).items.find((x) => !x.proposalId && !x.conflict)
    if (top) suggestion = { kind: 'creator', id: top.id, title: top.name, subtitle: `${top.niches.join(', ')} · ${top.city ?? ''} · ★ ${String(top.rating).replace('.', ',')} · ${top.compat.pct}% compatível` }
  }
  return {
    ...base, role, kpis,
    attention: [
      ...needDeliveries.slice(0, 2).map((d) => ({ kind: 'delivery' as const, id: d.id, title: `${d.counterpart} enviou a entrega`, subtitle: `${d.campaign.name}${d.campaign.clientName ? ' · ' + d.campaign.clientName : ''} · relatório da IA pronto` })),
      ...accepted.map((p) => ({ kind: 'proposal' as const, id: p.id, title: `${p.creator.name} aceitou a proposta`, subtitle: `${p.campaignName} · ${brl(p.rounds[p.rounds.length - 1]?.valueCents ?? 0)} · falta confirmar e pagar` })),
      ...responded.filter((p) => p.rounds[p.rounds.length - 1].by === 'C').slice(0, 2).map((p) => ({ kind: 'proposal' as const, id: p.id, title: `Contraproposta de ${p.creator.name}`, subtitle: `${p.campaignName} · ${brl(p.rounds[p.rounds.length - 1]?.valueCents ?? 0)}` })),
    ].slice(0, 4),
    suggestion,
  }
}
