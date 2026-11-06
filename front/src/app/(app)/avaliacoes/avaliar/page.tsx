'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { applyApiError } from '@/lib/forms'
import type { ReviewsPending } from '@/lib/types'
import { BackLink, Button, Card, Chips, ErrorState, LinkButton, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { Textarea } from '@/components/ui/form'
import { BrandAvatar } from '@/components/domain'
import { Icon } from '@/components/Icon'

export default function Avaliar() {
  const qc = useQueryClient(); const toast = useToast()
  const q = useQuery({ queryKey: ['reviews-candidates'], queryFn: () => api<ReviewsPending>('reviews/candidates') })
  const [who, setWho] = useState<string>(''); const [stars, setStars] = useState(0); const [tags, setTags] = useState<string[]>([]); const [cmt, setCmt] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false)
  if (q.isPending) return <PageSkeleton />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const d = q.data
  async function send() {
    setErr('')
    if (!who) return setErr('Escolha quem você quer avaliar.')
    if (!stars) return setErr('Toque nas estrelas para dar a sua nota.')
    setBusy(true)
    try { await post('reviews', { targetUserId: who, stars, tags, comment: cmt.trim() || undefined }); ['reviews-candidates', 'reviews-received', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast('Avaliação registrada.'); setDone(true) }
    catch (e) { setErr(applyApiError(e)) } finally { setBusy(false) }
  }
  if (done) return <div className="mx-auto max-w-xl space-y-4"><Title>Avaliação registrada</Title><Card className="space-y-3 text-center" role="status"><p>Obrigado! A sua nota ajuda a construir reputação na Triskel.</p><LinkButton href="/avaliacoes" block>Voltar às avaliações</LinkButton></Card></div>
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/avaliacoes">Avaliações</BackLink>
      <Title sub="Avalie em poucos toques. Só aparecem pessoas e negócios com campanha concluída ou negociação realizada.">Avaliar parcerias</Title>
      <Card className="space-y-4">
        <fieldset><legend className="h-sec mb-2">Quem você quer avaliar?</legend>
          {d.pending.length === 0 ? <p className="cap">Você não tem parcerias para avaliar agora.</p> : <div role="radiogroup" className="space-y-2">{d.pending.map((c) => <label key={c.userId} className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${who === c.userId ? 'border-teal-2 bg-ok-bg' : 'border-line'}`}><input type="radio" className="sr-only" name="who" checked={who === c.userId} onChange={() => setWho(c.userId)} /><BrandAvatar name={c.name} /><span className="min-w-0"><b className="block truncate text-ink">{c.name}</b><span className="cap block">{c.type} · {c.context}</span></span></label>)}</div>}
        </fieldset>
        <fieldset><legend className="h-sec mb-1">Sua nota</legend>
          <div role="radiogroup" aria-label="Nota de 1 a 5" className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`} onClick={() => setStars(n)} className="rounded-lg p-1"><Icon n="star" size={36} strokeWidth={1.6} style={{ fill: n <= stars ? '#f5b301' : 'none', color: n <= stars ? '#f5b301' : '#cfd6e4' }} /></button>)}</div>
          <p className="cap">{stars ? `${stars} de 5` : 'Toque nas estrelas'}</p></fieldset>
        <fieldset><legend className="h-sec mb-2">O que mais marcou? <span className="cap font-normal">(opcional)</span></legend><Chips label="Etiquetas" options={d.tags} value={tags} onChange={setTags} max={4} /></fieldset>
        <Textarea label="Comentário" optional rows={3} maxLength={300} value={cmt} onChange={(e) => setCmt(e.target.value)} />
        {err && <Note tone="danger" role="alert">{err}</Note>}
        <Button block loading={busy} disabled={d.pending.length === 0} onClick={send}>Enviar avaliação</Button>
      </Card>
      {d.locked.length > 0 && <section aria-labelledby="nd"><h2 id="nd" className="h-sec mb-2">Ainda não disponíveis</h2><ul className="space-y-2">{d.locked.map((c) => <li key={c.userId}><Card className="flex items-center gap-3 opacity-80"><BrandAvatar name={c.name} /><div><b className="text-ink">{c.name}</b><p className="cap">{c.context}</p></div></Card></li>)}</ul><p className="cap mt-2">A avaliação libera depois de uma campanha concluída ou de uma negociação realizada.</p></section>}
    </div>
  )
}
