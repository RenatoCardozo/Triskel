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
      <Tabs chips label="Filtrar conversas" tabs={TABS} value={f} onChange={setF} />
      {q.isPending || me.isPending ? <PageSkeleton rows={3} /> : q.isError ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : q.data.items.length === 0 ? (
        <EmptyState title={f === 'all' ? 'Nenhuma conversa ainda' : 'Nada por aqui'}>{f === 'all' ? (me.data?.role === 'CREATOR' ? 'Quando uma empresa enviar uma proposta, ou você se candidatar a uma campanha, a conversa aparece aqui.' : 'Envie uma proposta a um criador para começar uma conversa.') : 'Nenhuma conversa neste filtro.'}</EmptyState>
      ) : (
        <ul className="space-y-2">{q.data.items.map((p) => {
          const [label, tone] = PROP_STATUS[p.status]
          return (
            <li key={p.id}>
              <Link href={`/contatos/${p.id}`} className="card relative flex items-start gap-3 no-underline hover:shadow-md">
                {p.unread && <span className="absolute left-[66px] top-[14px] h-[7px] w-[7px] rounded-full bg-[#ff7a45]" role="img" aria-label="Nova mensagem" />}
                <Avatar name={p.counterpart} src={p.avatarUrl} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><b className="text-[16px] font-bold leading-tight text-[#4c5dca]">{p.counterpart}</b><span className="flex-none"><Pill tone={p.needsYou ? 'warn' : tone}>{p.needsYou ? 'Sua vez de responder' : label}</Pill></span></div>
                  <p className="cap truncate">{p.campaignName}{p.clientName ? ` · ${p.clientName}` : ''}</p>
                  <div className="flex items-end justify-between gap-2"><p className="cap min-w-0 truncate">{p.preview}</p><span className="cap flex-none">{fshort(p.lastActivity)}</span></div>
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
