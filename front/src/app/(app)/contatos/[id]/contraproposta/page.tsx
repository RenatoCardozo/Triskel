'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { fdate, fdatetime } from '@/lib/format'
import { breakdown, MIN_OFFER_CENTS } from '@/lib/money'
import { brDateToISO, isoToBRDate, maskDate } from '@/lib/masks'
import { applyApiError } from '@/lib/forms'
import type { ProposalDetail } from '@/lib/types'
import { useMe, useMeta } from '@/hooks/queries'
import { Facts, Money, SafetyNote } from '@/components/domain'
import { BackLink, Button, Card, ErrorState, LinkButton, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { MaskedInput, MoneyInput, Select, Textarea } from '@/components/ui/form'

export default function Contraproposta() {
  const { id } = useParams<{ id: string }>()
  const q = useQuery({ queryKey: ['proposal', id], queryFn: () => api<{ proposal: ProposalDetail }>('proposals/' + id).then((r) => r.proposal) })
  const me = useMe(); const meta = useMeta()
  if (q.isPending || me.isPending || meta.isPending) return <PageSkeleton />
  if (q.isError || !me.data || !meta.data) return <ErrorState error={q.error ?? meta.error} onRetry={() => q.refetch()} />
  return <Form p={q.data} side={me.data.role === 'CREATOR' ? 'C' : 'K'} uso={meta.data.options.uso} />
}

function Form({ p, side, uso }: { p: ProposalDetail; side: 'C' | 'K'; uso: string[] }) {
  const router = useRouter(); const qc = useQueryClient(); const toast = useToast()
  const last = p.rounds[p.rounds.length - 1]
  const [value, setValue] = useState(last.valueCents); const [date, setDate] = useState(isoToBRDate(last.deliveryDate)); const [img, setImg] = useState(last.imageUse); const [msg, setMsg] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({}); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const bd = breakdown(value)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    const er: Record<string, string> = {}
    const iso = brDateToISO(date)
    if (value < MIN_OFFER_CENTS) er.v = 'Informe o valor (mínimo R$ 10,00).'
    if (!iso) er.d = 'Use uma data válida (dd/mm/aaaa).'; else if (iso <= new Date().toISOString().slice(0, 10)) er.d = 'O prazo de entrega precisa ser uma data futura.'
    setErrs(er); if (Object.keys(er).length) return
    setBusy(true)
    try { const r = await post<{ proposal: ProposalDetail }>(`proposals/${p.id}/counter`, { valueCents: value, delivery: iso, imageUse: img, message: msg.trim() }); qc.setQueryData(['proposal', p.id], r.proposal); qc.invalidateQueries({ queryKey: ['proposals'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); toast(side === 'C' ? 'Contraproposta enviada.' : 'Nova proposta enviada.'); router.push(`/contatos/${p.id}`) }
    catch (x) { setErr(applyApiError(x)) } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href={`/contatos/${p.id}`}>Voltar à conversa</BackLink>
      <Title sub={`Responda à proposta de ${p.counterpart.shortName} com novas condições. Os valores já mostram a taxa de 10%.`}>{side === 'C' ? 'Negociar proposta' : 'Negociar condições'}</Title>
      <Card className="space-y-2"><div className="flex justify-between gap-2"><h2 className="font-extrabold text-ink">{last.seq === 1 ? 'Proposta' : 'Contraproposta'} de {last.by === side ? 'você' : p.counterpart.shortName}</h2><span className="cap">{fdatetime(last.at)}</span></div><Facts items={[['Prazo de entrega', fdate(last.deliveryDate)], ['Uso de imagem', last.imageUse]]} /><Money valueCents={last.valueCents} feeCents={last.feeCents} totalCents={last.totalCents} side={side} note={false} />{last.message && <p className="italic text-[#3b4476]">“{last.message}”</p>}</Card>
      {p.conflict && <Note tone="warn" role="alert"><b>Conflito de exclusividade.</b> {p.conflict}</Note>}
      <form noValidate onSubmit={submit}>
        <Card className="space-y-4">
          <h2 className="h-sec">{side === 'C' ? 'Sua contraproposta' : 'Sua nova proposta'}</h2>
          <MoneyInput label={side === 'C' ? 'Valor que você quer receber (R$)' : 'Valor ao criador (R$)'} value={value} onChange={setValue} error={errs.v} />
          <MaskedInput label="Prazo de entrega" placeholder="dd/mm/aaaa" mask={maskDate} value={date} onChange={setDate} error={errs.d} />
          <Select label="Uso de imagem" options={uso} value={img} onChange={(e) => setImg(e.target.value)} placeholder="Selecione" />
          <Textarea label="Mensagem" optional rows={3} maxLength={1000} value={msg} onChange={(e) => setMsg(e.target.value)} />
          <h3 className="h-sec !text-base">Valores</h3>
          <Money valueCents={bd.valueCents} feeCents={bd.feeCents} totalCents={bd.totalCents} side={side} />
          <SafetyNote />
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <Button type="submit" block loading={busy}>{side === 'C' ? 'Enviar contraproposta' : 'Enviar nova proposta'}</Button>
          <LinkButton href={`/contatos/${p.id}`} variant="outline" block>Voltar à conversa</LinkButton>
        </Card>
      </form>
    </div>
  )
}
