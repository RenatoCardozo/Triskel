'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError, post } from '@/lib/api'
import { brl, fdate, plural } from '@/lib/format'
import { breakdown, MIN_OFFER_CENTS } from '@/lib/money'
import { brDateToISO, isoToBRDate, maskDate } from '@/lib/masks'
import { applyApiError } from '@/lib/forms'
import type { CampaignDetail, CreatorDetail } from '@/lib/types'
import { useMeta } from '@/hooks/queries'
import { Money, SafetyNote } from '@/components/domain'
import { BackLink, Button, Card, ErrorState, LinkButton, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { MaskedInput, MoneyInput, Select, Textarea } from '@/components/ui/form'

export default function Page() { return <Suspense fallback={<PageSkeleton />}><Proposta /></Suspense> }

type Sent = { sent: Array<{ proposalId: string; creatorId: string; reused: boolean }>; blocked: Array<{ creatorId: string; message: string }> }

function Proposta() {
  const sp = useSearchParams(); const camp = sp.get('campanha') ?? ''; const ids = (sp.get('c') ?? '').split(',').filter(Boolean).slice(0, 20)
  const meta = useMeta()
  const cq = useQuery({ queryKey: ['campaign', camp], queryFn: () => api<{ campaign: CampaignDetail }>('campaigns/' + camp).then((r) => r.campaign), enabled: !!camp })
  const crs = useQueries({ queries: ids.map((id) => ({ queryKey: ['creator', id, camp], queryFn: () => api<CreatorDetail>(`creators/${id}?campaignId=${camp}`) })) })
  if (!camp || !ids.length) return <ErrorState error={new ApiError(400, 'INVALID', 'Escolha uma campanha e um criador na busca.')} />
  if (cq.isPending || meta.isPending || crs.some((c) => c.isPending)) return <PageSkeleton />
  if (cq.isError || meta.isError || !cq.data || !meta.data) return <ErrorState error={cq.error ?? meta.error} onRetry={() => cq.refetch()} />
  const bad = crs.find((c) => c.isError)
  if (bad) return <ErrorState error={bad.error} />
  return <Form campaign={cq.data} creators={crs.map((c) => c.data!)} uso={meta.data.options.uso} />
}

function Form({ campaign: c, creators, uso }: { campaign: CampaignDetail; creators: CreatorDetail[]; uso: string[] }) {
  const router = useRouter(); const qc = useQueryClient(); const toast = useToast()
  const f = c.form
  const [value, setValue] = useState<number>(f.valueCents ?? 0); const [date, setDate] = useState(isoToBRDate(f.entrega)); const [img, setImg] = useState<string>(f.uso || uso[0]); const [msg, setMsg] = useState('')
  const [errs, setErrs] = useState<Record<string, string>>({}); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [blocked, setBlocked] = useState<Sent['blocked']>([])
  const [review, setReview] = useState(false)
  const bd = breakdown(value)
  const nameOf = (id: string) => creators.find((x) => x.creator.id === id)?.creator.name ?? 'Criador'
  const conflicts = creators.filter((x) => x.conflict)
  const ok = creators.filter((x) => !x.conflict && !x.proposalId)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBlocked([])
    const er: Record<string, string> = {}; const iso = brDateToISO(date)
    if (value < MIN_OFFER_CENTS) er.v = 'Informe o valor (mínimo R$ 10,00).'
    if (!iso) er.d = 'Use uma data válida (dd/mm/aaaa).'; else if (iso <= new Date().toISOString().slice(0, 10)) er.d = 'O prazo de entrega precisa ser uma data futura.'
    if (!msg.trim()) er.m = 'Escreva uma mensagem ao criador.'
    setErrs(er); if (Object.keys(er).length) return
    setBusy(true)
    try {
      const r = await post<Sent>('proposals', { campaignId: c.id, creatorIds: ok.map((x) => x.creator.id), valueCents: value, delivery: iso, imageUse: img, message: msg.trim() })
      qc.invalidateQueries({ queryKey: ['proposals'] }); qc.invalidateQueries({ queryKey: ['campaigns'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); qc.invalidateQueries({ queryKey: ['creators'] })
      if (r.blocked.length) setBlocked(r.blocked)
      toast(r.sent.length === 1 ? 'Proposta enviada.' : `${r.sent.length} propostas enviadas.`)
      if (r.sent.length === 1 && !r.blocked.length) router.push(`/contatos/${r.sent[0].proposalId}`); else if (!r.blocked.length) router.push('/contatos'); else setReview(true)
    } catch (x) {
      if (x instanceof ApiError && Array.isArray((x.details as any)?.blocked)) setBlocked((x.details as any).blocked)
      setErr(applyApiError(x))
    } finally { setBusy(false) }
  }
  if (review) return (
    <div className="mx-auto max-w-2xl space-y-4"><Title>Propostas enviadas</Title>
      <Note tone="warn" role="alert">Alguns criadores não puderam receber a proposta:<ul className="mt-1 list-disc pl-5">{blocked.map((b) => <li key={b.creatorId}><b>{nameOf(b.creatorId)}</b>: {b.message}</li>)}</ul></Note>
      <LinkButton href="/contatos" block>Ir para contatos</LinkButton><LinkButton href={`/criadores?campanha=${c.id}`} variant="outline" block>Voltar à busca</LinkButton></div>
  )
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href={`/criadores?campanha=${c.id}`}>Voltar à busca</BackLink>
      <Title sub={`Campanha: ${f.nome} · ${brl(f.valueCents ?? 0)} por vídeo`}>Enviar proposta</Title>
      <Card className="space-y-2"><h2 className="h-sec">{plural(creators.length, 'Criador', 'Criadores')}</h2>
        <ul className="space-y-1 text-[15px]">{creators.map((x) => <li key={x.creator.id}><b className="text-ink">{x.creator.name}</b>{x.proposalId ? <> · <Link className="link" href={`/contatos/${x.proposalId}`}>já existe conversa</Link></> : x.conflict ? <span className="text-danger"> · indisponível no período</span> : null}</li>)}</ul>
        {conflicts.map((x) => <Note key={x.creator.id} tone="warn" role="alert"><b>{x.creator.name}:</b> {x.conflict}</Note>)}
      </Card>
      <form noValidate onSubmit={submit}>
        <Card className="space-y-4">
          <h2 className="h-sec">Condições</h2>
          <MoneyInput label="Valor ao criador (R$)" value={value} onChange={setValue} error={errs.v} />
          <MaskedInput label="Prazo de entrega" placeholder="dd/mm/aaaa" mask={maskDate} value={date} onChange={setDate} error={errs.d} />
          <Select label="Uso de imagem" options={uso} value={img} onChange={(e) => setImg(e.target.value)} placeholder="Selecione" />
          <Textarea label="Mensagem ao criador" rows={3} maxLength={1000} value={msg} onChange={(e) => setMsg(e.target.value)} error={errs.m} />
          <h3 className="h-sec !text-base">Valores {creators.length > 1 ? '(por criador)' : ''}</h3>
          <Money valueCents={bd.valueCents} feeCents={bd.feeCents} totalCents={bd.totalCents} side="K" />
          {ok.length > 1 && <p className="cap">Total para {ok.length} criadores: <b>{brl(bd.totalCents * ok.length)}</b>. O pagamento só é feito ao fechar o contrato com cada um.</p>}
          <SafetyNote />
          {err && <Note tone="danger" role="alert">{err}</Note>}
          {blocked.length > 0 && <Note tone="warn">{blocked.map((b) => `${nameOf(b.creatorId)}: ${b.message}`).join(' ')}</Note>}
          <Button type="submit" block loading={busy} disabled={ok.length === 0}>Enviar proposta</Button>
          <LinkButton href={`/campanhas/${c.id}`} variant="outline" block>Ver a campanha que será enviada</LinkButton>
          <LinkButton href={`/criadores?campanha=${c.id}`} variant="ghost" block>Voltar à busca</LinkButton>
        </Card>
      </form>
    </div>
  )
}
