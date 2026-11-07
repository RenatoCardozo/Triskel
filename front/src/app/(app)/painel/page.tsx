'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ProposalListItem } from '@/lib/types'
import { useDashboard, useMe } from '@/hooks/queries'
import { CompleteBanner, ProfileSummary } from '@/components/ProfileSummary'
import { Card, ErrorState, Kpi, PageSkeleton, Title } from '@/components/ui'

export default function Painel() {
  const me = useMe(); const d = useDashboard()
  const props = useQuery({ queryKey: ['proposals', 'all'], queryFn: () => api<{ items: ProposalListItem[]; counts: { all: number; needsYou: number } }>('proposals?filter=all') })
  if (d.isPending || me.isPending) return <PageSkeleton rows={4} />
  if (d.isError || !d.data || !me.data) return <ErrorState error={d.error ?? me.error} onRetry={() => d.refetch()} />
  const u = me.data, x = d.data
  const first = u.name.split(' ')[0]
  const href = (a: { kind: string; id: string }) => (a.kind === 'delivery' ? `/entregas/${a.id}` : a.kind === 'contract' ? `/contratos/${a.id}` : `/contatos/${a.id}`)
  const cta = (a: { kind: string; title: string }) => (a.kind === 'delivery' ? (u.role === 'CREATOR' ? 'Enviar entrega' : 'Revisar') : /pagar/i.test(a.title) ? 'Pagar' : /assinar/i.test(a.title) ? 'Assinar' : 'Responder')
  const counts = props.data?.counts
  return (
    <div className="space-y-4">
      <Title sub={`Olá, ${first}. Veja o que pede a sua atenção hoje.`}>Painel</Title>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-4">
          <CompleteBanner u={u} />
          <ProfileSummary u={u} />
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">{x.kpis.map((k) => <Kpi key={k.label} value={k.value} label={k.label} hint={k.hint} />)}</div>
          {x.reviewsPending > 0 && (
            <section className="rounded-[20px] bg-gradient-to-br from-mint to-teal-2 p-4 text-white">
              <h2 className="text-lg font-extrabold !text-white">Avalie suas parcerias</h2>
              <p className="text-white/95">{x.reviewsPending} {x.reviewsPending === 1 ? 'parceria aguarda' : 'parcerias aguardam'} a sua avaliação. Leva menos de 1 minuto.</p>
              <Link href="/avaliacoes" className="btn mt-3 bg-white text-tealtext btn-block">Avaliar agora</Link>
            </section>
          )}
          <section aria-labelledby="atn">
            <h2 id="atn" className="h-sec mb-2">Precisa da sua atenção</h2>
            {x.attention.length === 0 ? <Card className="cap">Nada pendente por aqui. Quando houver proposta, pagamento ou entrega para você, aparece neste lugar.</Card> : (
              <ul className="space-y-3">{x.attention.map((a) => (
                <li key={a.kind + a.id}><Link href={href(a)} className="card block no-underline"><b className="block text-[16px] font-bold text-ink">{a.title}</b><span className="cap block">{a.subtitle}</span><span className="mt-1 block text-[14px] font-bold text-tealtext">{cta(a)}</span></Link></li>
              ))}</ul>
            )}
          </section>
          <Link href="/contatos" className="card block no-underline">
            <h2 className="text-[16px] font-bold text-ink">Contatos</h2>
            <p className="cap">{counts ? `${counts.all} ${counts.all === 1 ? 'conversa' : 'conversas'} · ${counts.needsYou} ${counts.needsYou === 1 ? 'aguarda' : 'aguardam'} você` : 'Carregando…'}</p>
            <span className="mt-1 block text-[14px] font-bold text-tealtext">Abrir contatos</span>
          </Link>
          {x.suggestion && (
            <section aria-labelledby="sug">
              <h2 id="sug" className="h-sec mb-2">{u.role === 'CREATOR' ? 'Sugeridas pela IA para o seu perfil' : 'Sugerido pela IA para você'}</h2>
              <Link href={x.suggestion.kind === 'campaign' ? `/oportunidades/${x.suggestion.id}` : `/criadores/${x.suggestion.id}`} className="card block no-underline"><b className="block text-ink">{x.suggestion.title}</b><span className="cap">{x.suggestion.subtitle}</span></Link>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
