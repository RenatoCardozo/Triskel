'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { brl, fdate, fdatetime, plural } from '@/lib/format'
import type { ProposalDetail, Round } from '@/lib/types'
import { applyApiError } from '@/lib/forms'
import { useMe } from '@/hooks/queries'
import { Avatar, BackLink, Button, Card, Confirm, ErrorState, LinkButton, Note, PageSkeleton, Pill, useToast } from '@/components/ui'
import { Textarea } from '@/components/ui/form'
import { Facts, Money, PROP_STATUS, SafetyNote } from '@/components/domain'

export default function Conversa() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const qc = useQueryClient(); const toast = useToast()
  const me = useMe()
  const q = useQuery({ queryKey: ['proposal', id], queryFn: () => api<{ proposal: ProposalDetail }>('proposals/' + id).then((r) => r.proposal), refetchInterval: 15_000 })
  const [confirm, setConfirm] = useState<'accept' | 'decline' | null>(null); const [busy, setBusy] = useState(false)
  const [text, setText] = useState(''); const [terr, setTerr] = useState(''); const [sending, setSending] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { if (q.data) qc.invalidateQueries({ queryKey: ['proposals'] }) }, [q.data?.id, qc]) // eslint-disable-line react-hooks/exhaustive-deps
  if (q.isPending || me.isPending) return <PageSkeleton rows={4} />
  if (q.isError || !me.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const p = q.data; const side = me.data.role === 'CREATOR' ? 'C' : 'K'
  const last = p.rounds[p.rounds.length - 1]
  const [statusLabel, statusTone] = PROP_STATUS[p.status]

  const act = async (kind: 'accept' | 'decline') => {
    setBusy(true)
    try { const r = await post<{ proposal: ProposalDetail }>(`proposals/${id}/${kind}`); qc.setQueryData(['proposal', id], r.proposal); qc.invalidateQueries({ queryKey: ['proposals'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast(kind === 'accept' ? 'Proposta aceita.' : side === 'C' ? 'Proposta recusada.' : 'Negociação encerrada.'); setConfirm(null) }
    catch (e) { toast((e as Error).message, 'err'); setConfirm(null); q.refetch() } finally { setBusy(false) }
  }
  async function send(e: React.FormEvent) {
    e.preventDefault(); setTerr('')
    if (text.trim().length < 2) return setTerr('Escreva a mensagem antes de enviar.')
    setSending(true)
    try { const r = await post<{ proposal: ProposalDetail }>(`proposals/${id}/messages`, { text: text.trim() }); qc.setQueryData(['proposal', id], r.proposal); setText(''); setTimeout(() => end.current?.scrollIntoView({ behavior: 'smooth' }), 50) }
    catch (x) { setTerr(applyApiError(x)) } finally { setSending(false) }
  }

  type Entry = { at: string; kind: 'round'; r: Round } | { at: string; kind: 'msg'; m: ProposalDetail['messages'][number] }
  const timeline: Entry[] = [...p.rounds.map((r) => ({ at: r.at, kind: 'round' as const, r })), ...p.messages.map((m) => ({ at: m.at, kind: 'msg' as const, m }))].sort((a, b) => +new Date(a.at) - +new Date(b.at))
  const whoOf = (r: Round) => (r.by === side ? 'você' : side === 'C' ? p.counterpart.shortName : p.counterpart.shortName)
  const g = p.campaign.generated

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href="/contatos">Contatos</BackLink>
      <Card className="flex items-center gap-3">
        <Avatar name={p.counterpart.shortName} src={p.counterpart.avatarUrl} size={52} />
        <div className="min-w-0 flex-1"><h1 className="truncate text-xl font-extrabold text-ink">{p.counterpart.name}</h1><p className="cap truncate">{p.campaign.name} · {plural(p.campaign.videos, 'vídeo', 'vídeos')} · {p.number}</p></div>
        <Pill tone={p.yourTurn ? 'warn' : statusTone}>{p.yourTurn ? 'Sua vez de responder' : statusLabel}</Pill>
      </Card>
      <SafetyNote />
      <details className="card !p-0 group">
        <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-extrabold text-ink">Campanha<span aria-hidden="true" className="text-tealtext transition-transform group-open:rotate-180">⌄</span></summary>
        <div className="space-y-2 px-4 pb-4"><Facts items={[['Campanha', p.campaign.name], ['Objetivo', p.campaign.objective], ['Formato', p.campaign.format], ['Vídeos por criador', String(p.campaign.videos)]]} />{g?.headline && <p className="text-sm text-[#56608f]">{g.headline}</p>}</div>
      </details>

      <section aria-label="Conversa" className="space-y-3">
        <h2 className="h-sec">Conversa</h2>
        {timeline.map((t, i) => t.kind === 'round' ? (
          <Card key={'r' + t.r.seq} className={t.r.by === side ? 'border-l-4 border-teal-2' : ''}>
            <div className="mb-2 flex items-center justify-between gap-2"><h3 className="font-extrabold text-ink">{t.r.seq === 1 ? 'Proposta' : 'Contraproposta'} de {whoOf(t.r)}</h3><span className="cap">{fdatetime(t.r.at)}</span></div>
            <Facts items={[['Prazo de entrega', fdate(t.r.deliveryDate)], ['Uso de imagem', t.r.imageUse]]} />
            <div className="mt-2"><Money valueCents={t.r.valueCents} feeCents={t.r.feeCents} totalCents={t.r.totalCents} side={side} note={false} /></div>
            {t.r.message && <p className="mt-2 text-[15px] italic text-[#3b4476]">“{t.r.message}”</p>}
          </Card>
        ) : t.m.by === 'S' ? (
          <p key={t.m.id} className="np text-center">{t.m.text}</p>
        ) : (
          <div key={t.m.id} className={`flex ${t.m.by === side ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[15px] ${t.m.by === side ? 'bg-gradient-to-r from-teal-2 to-mint text-white' : 'bg-white shadow-sm'}`}>{t.m.text}<div className={`mt-0.5 text-[11px] ${t.m.by === side ? 'text-white/85' : 'text-ink-2'}`}>{fdatetime(t.m.at)}</div></div></div>
        ))}
        <div ref={end} />
      </section>

      {p.conflict && p.status !== 'CONTRACT' && <Note tone="warn" role="alert"><b>Conflito de exclusividade.</b> {p.conflict}</Note>}

      {p.status === 'OPEN' && p.yourTurn && (
        <Card className="space-y-3" aria-label="Sua resposta">
          <p className="np">Sua vez: aceite, faça uma contraproposta ou recuse. O valor, a taxa de 10% e o total aparecem em cada etapa.</p>
          <Button block disabled={!p.can.accept} onClick={() => setConfirm('accept')}>{p.can.accept ? `Aceitar proposta de ${brl(last.valueCents)}` : 'Aceite indisponível: conflito de exclusividade'}</Button>
          <LinkButton href={`/contatos/${id}/contraproposta`} variant="outline" block>Fazer contraproposta</LinkButton>
          <Button variant="danger" block onClick={() => setConfirm('decline')}>{side === 'C' ? 'Recusar' : 'Encerrar negociação'}</Button>
        </Card>
      )}
      {p.status === 'OPEN' && !p.yourTurn && <Note>Aguardando a resposta de {p.counterpart.shortName}. Você pode mandar uma mensagem enquanto isso.</Note>}
      {p.status === 'ACCEPTED' && (
        <Card className="space-y-3">
          <p className="np np-ok">{side === 'C' ? 'Proposta aceita. Assim que o contratante pagar, o valor fica em custódia e você assina o contrato.' : p.can.pay ? 'Proposta aceita. Revise o contrato e pague para colocar o valor em custódia.' : 'Proposta aceita.'}</p>
          <LinkButton href={`/contatos/${id}/contrato`} variant={p.can.pay ? 'primary' : 'outline'} block>{p.can.pay ? 'Revisar contrato e pagar' : 'Ver contrato'}</LinkButton>
        </Card>
      )}
      {p.status === 'CONTRACT' && p.contract && (
        <Card className="space-y-3">
          <p className="np np-ok">Contrato {p.contract.number} {p.contract.signed ? 'assinado pelas duas partes' : side === 'C' ? 'aguardando a sua assinatura' : 'aguardando a assinatura do criador'}.</p>
          <LinkButton href={`/contratos/${p.contract.id}`} block>{!p.contract.signed && side === 'C' ? 'Revisar e assinar contrato' : 'Ver contrato'}</LinkButton>
          <LinkButton href="/entregas" variant="outline" block>Acompanhar entrega</LinkButton>
        </Card>
      )}
      {(p.status === 'DECLINED' || p.status === 'CLOSED') && (
        <Card className="space-y-2 text-center"><h2 className="h-sec">Sem acordo</h2><p className="cap">{side === 'C' ? 'A negociação foi encerrada. Você pode explorar outras campanhas.' : 'A negociação foi encerrada. Volte à busca para escolher outro criador.'}</p><LinkButton href={side === 'C' ? '/oportunidades' : '/criadores'} variant="outline" block>{side === 'C' ? 'Voltar às campanhas' : 'Voltar à busca'}</LinkButton></Card>
      )}

      {p.can.message && (
        <form onSubmit={send} noValidate className="space-y-2">
          <Textarea label={`Mensagem para ${p.counterpart.shortName}`} rows={2} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} error={terr} />
          <Button type="submit" variant="outline" block loading={sending}>Enviar mensagem</Button>
        </form>
      )}

      <Confirm open={confirm === 'accept'} title="Aceitar esta proposta?" confirmLabel="Aceitar proposta" loading={busy} onConfirm={() => act('accept')} onClose={() => setConfirm(null)}>
        Você aceita {brl(last.valueCents)} com entrega em {fdate(last.deliveryDate)} e uso de imagem por {last.imageUse}. {side === 'K' ? `Depois do aceite, você paga ${brl(last.totalCents)} (valor + taxa de 10%) para o valor ficar em custódia.` : 'Depois do aceite, o contratante paga e o valor fica em custódia.'}
      </Confirm>
      <Confirm open={confirm === 'decline'} title={side === 'C' ? 'Recusar a proposta?' : 'Encerrar a negociação?'} confirmLabel={side === 'C' ? 'Recusar' : 'Encerrar'} danger loading={busy} onConfirm={() => act('decline')} onClose={() => setConfirm(null)}>
        A conversa será encerrada e não dá para reabrir.
      </Confirm>
    </div>
  )
}
