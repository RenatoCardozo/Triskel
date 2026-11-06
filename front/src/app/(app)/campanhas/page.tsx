'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { brl, fdate, plural } from '@/lib/format'
import type { CampaignListItem } from '@/lib/types'
import { useMe } from '@/hooks/queries'
import { BrandAvatar } from '@/components/domain'
import { EmptyState, ErrorState, LinkButton, PageSkeleton, Pill, Title } from '@/components/ui'

export default function Campanhas() {
  const me = useMe()
  const q = useQuery({ queryKey: ['campaigns'], queryFn: () => api<{ items: CampaignListItem[] }>('campaigns') })
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title sub="Crie o briefing, confirme os requisitos e envie propostas aos criadores.">{me.data?.role === 'AGENCY' ? 'Campanhas' : 'Minhas campanhas'}</Title>
      <LinkButton href="/campanhas/nova" block>+ Criar campanha</LinkButton>
      {q.isPending ? <PageSkeleton rows={2} /> : q.isError ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : q.data.items.length === 0 ? (
        <EmptyState title="Nenhuma campanha ainda" action={<LinkButton href="/campanhas/nova">Criar campanha</LinkButton>}>Crie a primeira campanha para a Triskel recomendar criadores compatíveis.</EmptyState>
      ) : (
        <ul className="space-y-2">{q.data.items.map((c) => (
          <li key={c.id}><Link href={`/campanhas/${c.id}`} className="card flex items-center gap-3 no-underline hover:shadow-md">
            <BrandAvatar name={c.clientName ?? c.brandName} size={46} />
            <div className="min-w-0 flex-1"><b className="block truncate text-ink">{c.name}</b><p className="cap truncate">{c.clientName ?? c.brandName} · {plural(c.videos, 'vídeo', 'vídeos')} · {brl(c.valueCents)} por vídeo · entrega {fdate(c.deliveryDate)}</p>
              <div className="mt-1 flex flex-wrap gap-1.5"><Pill tone={c.status === 'OPEN' ? 'ok' : 'warn'}>{c.status === 'OPEN' ? 'Aberta' : 'Rascunho'}</Pill>{c.proposals > 0 && <Pill tone="ink">{plural(c.proposals, 'proposta', 'propostas')}</Pill>}{c.contracts > 0 && <Pill>{plural(c.contracts, 'contrato', 'contratos')}</Pill>}</div></div>
          </Link></li>
        ))}</ul>
      )}
    </div>
  )
}
