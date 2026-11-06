'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { brl, fdate } from '@/lib/format'
import type { Delivery } from '@/lib/types'
import { BrandAvatar, DEL_STATE, SafetyNote } from '@/components/domain'
import { EmptyState, ErrorState, PageSkeleton, Pill, Title } from '@/components/ui'

export default function Entregas() {
  const q = useQuery({ queryKey: ['deliveries'], queryFn: () => api<{ items: Delivery[]; counts: { all: number; needsYou: number } }>('deliveries'), refetchInterval: 20_000 })
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title sub="Do envio do vídeo à liberação do pagamento, tudo acontece aqui, pela Triskel.">Entregas</Title>
      {q.isPending ? <PageSkeleton rows={2} /> : q.isError ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : (
        <>
          <div className="grid grid-cols-2 gap-3"><div className="kpi"><b>{q.data.counts.all}</b><span>Contratos</span></div><div className="kpi"><b>{q.data.counts.needsYou}</b><span>Aguardam você</span><i>Veja abaixo</i></div></div>
          {q.data.items.length === 0 ? <EmptyState title="Nenhuma entrega ainda">Quando um contrato for fechado, a entrega aparece aqui.</EmptyState> : (
            <ul className="space-y-2">{q.data.items.map((d) => (
              <li key={d.id}><Link href={`/entregas/${d.id}`} className="card flex items-center gap-3 no-underline hover:shadow-md">
                <BrandAvatar name={d.side === 'C' ? d.campaign.brandName : d.counterpart} size={46} />
                <div className="min-w-0 flex-1"><b className="block truncate text-ink">{d.counterpart}</b><p className="cap truncate">{d.campaign.name} · {brl(d.valueCents)}</p><p className="cap">Prazo {fdate(d.deliveryDate)}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5"><Pill tone={DEL_STATE[d.state][1]}>{DEL_STATE[d.state][0]}</Pill>{!d.signed && <Pill tone="warn">Contrato sem assinatura</Pill>}{d.needsYou && <Pill tone="warn">Sua vez</Pill>}</div></div>
              </Link></li>
            ))}</ul>
          )}
        </>
      )}
      <SafetyNote />
    </div>
  )
}
