'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { brl, fshort } from '@/lib/format'
import type { ProposalListItem } from '@/lib/types'
import { Avatar, EmptyState, ErrorState, PageSkeleton, Pill, Tabs, Title } from '@/components/ui'
import { SafetyNote, PROP_STATUS } from '@/components/domain'
import { useMe } from '@/hooks/queries'

type Filter = 'all' | 'me' | 'open' | 'closed'
const TABS: Array<[Filter, string]> = [['all', 'Todas'], ['me', 'Aguardam você'], ['open', 'Em andamento'], ['closed', 'Fechadas']]

export default function Contatos() {
  const me = useMe(); const [f, setF] = useState<Filter>('all')
  const q = useQuery({ queryKey: ['proposals', f], queryFn: () => api<{ items: ProposalListItem[]; counts: { all: number; needsYou: number }; exclusivities: Array<{ brandName?: string; until?: string; text?: string }> }>('proposals?filter=' + f), refetchInterval: 20_000 })
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title sub="Propostas, contrapropostas e mensagens ficam só aqui. Ninguém precisa passar telefone, e-mail ou rede social.">Contatos</Title>
      {q.data && <div className="grid grid-cols-2 gap-3"><div className="kpi"><b>{q.data.counts.all}</b><span>Conversas</span></div><div className="kpi"><b>{q.data.counts.needsYou}</b><span>Aguardam você</span><i>Responda para não perder</i></div></div>}
      <Tabs label="Filtrar conversas" tabs={TABS} value={f} onChange={setF} />
      {q.isPending || me.isPending ? <PageSkeleton rows={3} /> : q.isError ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : q.data.items.length === 0 ? (
        <EmptyState title={f === 'all' ? 'Nenhuma conversa ainda' : 'Nada por aqui'}>{f === 'all' ? (me.data?.role === 'CREATOR' ? 'Quando uma empresa enviar uma proposta, ou você se candidatar a uma campanha, a conversa aparece aqui.' : 'Envie uma proposta a um criador para começar uma conversa.') : 'Nenhuma conversa neste filtro.'}</EmptyState>
      ) : (
        <ul className="space-y-2">{q.data.items.map((p) => {
          const [label, tone] = PROP_STATUS[p.status]
          return (
            <li key={p.id}>
              <Link href={`/contatos/${p.id}`} className="card flex items-center gap-3 no-underline hover:shadow-md">
                <Avatar name={p.counterpart} src={p.avatarUrl} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><b className={`truncate ${p.unread ? 'text-ink' : 'text-ink'}`}>{p.counterpart}</b><span className="cap flex-none">{fshort(p.lastActivity)}</span></div>
                  <p className="cap truncate">{p.campaignName}{p.clientName ? ` · ${p.clientName}` : ''} · {brl(p.lastValueCents)}</p>
                  <p className="truncate text-sm text-[#56608f]">{p.preview}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5"><Pill tone={p.needsYou ? 'warn' : tone}>{p.needsYou ? 'Sua vez de responder' : label}</Pill>{p.unread && <Pill tone="ink">Nova</Pill>}</div>
                </div>
              </Link>
            </li>
          )
        })}</ul>
      )}
      <SafetyNote />
    </div>
  )
}
