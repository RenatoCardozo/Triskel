'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { rating } from '@/lib/format'
import type { ReviewsPending, ReviewsReceived } from '@/lib/types'
import { Card, EmptyState, ErrorState, Kpi, LinkButton, PageSkeleton, Stars, Title } from '@/components/ui'
import { fdate } from '@/lib/format'

export default function Avaliacoes() {
  const rec = useQuery({ queryKey: ['reviews-received'], queryFn: () => api<ReviewsReceived>('reviews/received') })
  const pend = useQuery({ queryKey: ['reviews-candidates'], queryFn: () => api<ReviewsPending>('reviews/candidates') })
  if (rec.isPending || pend.isPending) return <PageSkeleton rows={3} />
  if (rec.isError || pend.isError) return <ErrorState error={rec.error ?? pend.error} onRetry={() => { rec.refetch(); pend.refetch() }} />
  const r = rec.data, p = pend.data
  const tags = r.tags as Array<{ tag: string; count: number }>
  const max = Math.max(1, ...tags.map((t) => t.count))
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title>Avaliações</Title>
      {p.pending.length > 0 && (
        <section className="rounded-[20px] bg-gradient-to-br from-mint to-teal-2 p-4 text-white"><h2 className="text-lg font-extrabold !text-white">Avalie suas parcerias</h2><p className="text-white/95">{p.pending.length} {p.pending.length === 1 ? 'parceria aguarda' : 'parcerias aguardam'} a sua avaliação. Leva menos de 1 minuto.</p><LinkButton href="/avaliacoes/avaliar" className="mt-3 !bg-white !text-tealtext" block>Avaliar agora</LinkButton></section>
      )}
      <div className="grid grid-cols-2 gap-3"><Kpi value={r.count ? '★ ' + rating(r.average) : '—'} label="Nota média" hint={`${r.count} ${r.count === 1 ? 'avaliação' : 'avaliações'}`} />{p.done.length > 0 && <Kpi value={String(p.done.length)} label="Avaliações enviadas" />}</div>
      {tags.length > 0 && <Card as="section" aria-labelledby="pc"><h2 id="pc" className="h-sec mb-2">O que mais marcou</h2><ul className="space-y-2">{tags.map((t) => <li key={t.tag}><div className="flex justify-between text-sm"><span className="font-semibold text-ink">{t.tag}</span><b className="text-tealtext">{t.count}</b></div><div className="mt-1 h-2 rounded-full bg-page"><div className="h-2 rounded-full bg-gradient-to-r from-teal-2 to-mint" style={{ width: `${(t.count / max) * 100}%` }} /></div></li>)}</ul></Card>}
      <section aria-labelledby="cm"><h2 id="cm" className="h-sec mb-2">Comentários recebidos</h2>
        {r.items.length === 0 ? <EmptyState title="Nenhuma avaliação recebida ainda">Quando uma parceria for concluída, você recebe avaliações aqui.</EmptyState> : <ul className="space-y-2">{r.items.map((c, i) => <li key={i}><Card><div className="flex items-center justify-between gap-2"><b className="text-ink">{c.author}</b><Stars value={c.stars} /></div><p className="cap">{fdate(c.at)}</p>{c.comment && <p className="mt-1 text-[15px]">{c.comment}</p>}</Card></li>)}</ul>}
      </section>
    </div>
  )
}
