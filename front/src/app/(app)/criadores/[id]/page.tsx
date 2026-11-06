'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { brl, fdate, plural, rating } from '@/lib/format'
import type { CreatorDetail } from '@/lib/types'
import { CompatBlock, Money, SafetyNote } from '@/components/domain'
import { Avatar, BackLink, Card, ErrorState, LinkButton, Note, PageSkeleton, Pill } from '@/components/ui'

export default function Page() { return <Suspense fallback={<PageSkeleton />}><Perfil /></Suspense> }

function Perfil() {
  const { id } = useParams<{ id: string }>(); const camp = useSearchParams().get('campanha') ?? ''
  const q = useQuery({ queryKey: ['creator', id, camp], queryFn: () => api<CreatorDetail>(`creators/${id}${camp ? `?campaignId=${camp}` : ''}`) })
  if (q.isPending) return <PageSkeleton />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const { creator: c, compat, conflict, proposalId, withCampaign, delivery } = q.data
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href={camp ? `/criadores?campanha=${camp}` : '/criadores'}>Voltar à busca</BackLink>
      <Card className="space-y-3">
        <div className="flex items-center gap-3"><Avatar name={c.name} src={c.avatarUrl} size={72} /><div className="min-w-0"><h1 className="text-2xl font-extrabold text-ink">{c.name}</h1><p className="cap">{c.niches.join(', ')} · {[c.city, c.uf].filter(Boolean).join(', ')}</p><p className="text-sm font-bold text-ink">★ {rating(c.rating)} · {plural(c.jobs, 'trabalho', 'trabalhos')}</p></div></div>
        <div className="flex flex-wrap gap-1.5"><Pill tone="ink">{c.sizeBand}</Pill>{c.avgDelivery && <Pill tone="grey">Entrega: {c.avgDelivery}</Pill>}</div>
        {camp && <CompatBlock compat={compat} />}
      </Card>
      {conflict && <Note tone="warn" role="alert"><b>Conflito de exclusividade.</b> {conflict}</Note>}
      {c.about && <Card><h2 className="h-sec mb-1">Sobre</h2><p className="text-[15px]">{c.about}</p></Card>}
      <Card className="space-y-2"><h2 className="h-sec">Redes e valores</h2>
        {c.networks.length ? <ul className="flex flex-wrap gap-2">{c.networks.map((n) => <li key={n.name} className="pl pl-ink">{n.name}{n.followers ? ` · ${n.followers}` : ''}</li>)}</ul> : <p className="cap">Sem redes informadas.</p>}
        <p className="text-[15px]">{c.prices?.fromCents != null ? <>Valores: <b>{brl(c.prices.fromCents)}{c.prices.toCents ? ` a ${brl(c.prices.toCents)}` : ''}</b> por vídeo</> : <>Valores: <b>sob consulta</b></>}</p>
        <p className="cap">Telefone, e-mail e @ das redes não aparecem: toda a conversa acontece pela Triskel.</p></Card>
      <Card as="section" aria-labelledby="pf"><h2 id="pf" className="h-sec mb-2">Portfólio</h2>{c.portfolio.length ? <ul className="divide-y divide-line">{c.portfolio.map((p) => <li key={p.id} className="py-2"><b className="block text-ink">{p.title}</b><span className="cap block">{p.description}</span>{p.views && <span className="text-xs font-bold text-tealtext">{p.views}</span>}</li>)}</ul> : <p className="cap">Sem trabalhos no portfólio.</p>}</Card>
      {withCampaign && <Card className="space-y-2"><h2 className="h-sec">Com a sua campanha</h2><p className="cap">Entrega prevista: {delivery ? fdate(delivery) : '—'}</p><Money side="K" {...withCampaign} note={false} /></Card>}
      {proposalId ? <LinkButton href={`/contatos/${proposalId}`} block>Ver conversa</LinkButton> : camp && !conflict ? <LinkButton href={`/criadores/proposta?campanha=${camp}&c=${id}`} block>Enviar proposta</LinkButton> : !camp ? <Note>Escolha uma campanha na busca para enviar proposta a este criador.</Note> : null}
      <SafetyNote />
    </div>
  )
}
