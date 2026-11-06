'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { fdate } from '@/lib/format'
import { breakdown, MIN_OFFER_CENTS } from '@/lib/money'
import { applyApiError } from '@/lib/forms'
import type { Opportunity } from '@/lib/types'
import { Facts, ExclusivityText, Money, SafetyNote, imageUseFull, BrandAvatar } from '@/components/domain'
import { BackLink, Button, Card, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title, useToast } from '@/components/ui'
import { MoneyInput, Textarea } from '@/components/ui/form'

export default function Candidatar() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const toast = useToast()
  const q = useQuery({ queryKey: ['opp', id], queryFn: () => api<{ campaign: Opportunity; exclusivity: { days: number; from: string; to: string } | null }>('opportunities/' + id) })
  const [value, setValue] = useState<number | null>(null); const [msg, setMsg] = useState(''); const [errs, setErrs] = useState<{ v?: string; m?: string }>({}); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (q.isPending) return <PageSkeleton />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const c = q.data.campaign
  const v = value ?? c.youReceiveCents, bd = breakdown(v)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    const er: typeof errs = {}
    if (v < MIN_OFFER_CENTS) er.v = 'Informe o valor (mínimo R$ 10,00).'
    if (!msg.trim()) er.m = 'Escreva uma mensagem para a empresa.'
    setErrs(er); if (er.v || er.m) return
    setBusy(true)
    try { const r = await post<{ proposalId: string }>(`opportunities/${id}/apply`, { valueCents: v, message: msg.trim() }); toast('Candidatura enviada.'); router.push(`/contatos/${r.proposalId}`) }
    catch (x: any) { if (x?.code === 'ALREADY_APPLIED' && x.details?.proposalId) router.push(`/contatos/${x.details.proposalId}`); else setErr(applyApiError(x)) }
    finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href="/oportunidades">Voltar às campanhas</BackLink>
      <Title>Candidatar-se</Title>
      <Card className="space-y-3">
        <div className="flex items-center gap-3"><BrandAvatar name={c.brandName} /><div><Pill>Campanha aberta</Pill><h2 className="mt-1 text-xl font-extrabold text-ink">{c.name}</h2><p className="cap">{c.brandName}{c.city ? ` · ${c.city}` : ''}</p></div></div>
        <p className="text-[15px]">{c.description}</p>
      </Card>
      <Card className="space-y-3"><h2 className="h-sec">Condições</h2>
        <Facts items={[['Objetivo', c.objective], ['Formato', c.format], ['Vídeos', String(c.videos)], ['Entrega até', fdate(c.deliveryDate)], ['Uso de imagem', imageUseFull(c.imageUse)], ['Ajustes', c.revisions], ['Exclusividade', ExclusivityText(c.exclusiveDays)]]} />
        <h3 className="h-sec !text-base">Valores</h3><Money valueCents={c.youReceiveCents} feeCents={c.feeCents} totalCents={c.youReceiveCents + c.feeCents} side="C" />
      </Card>
      {c.conflict && <Note tone="warn" role="alert">{c.conflict}</Note>}
      <form noValidate onSubmit={submit}>
        <Card className="space-y-4"><h2 className="h-sec">Sua candidatura</h2>
          <MoneyInput label="Valor que você quer receber (R$)" value={v} onChange={setValue} error={errs.v} />
          <Money valueCents={bd.valueCents} feeCents={bd.feeCents} totalCents={bd.totalCents} side="C" note={false} />
          <Textarea label="Mensagem" rows={4} maxLength={1000} placeholder="Conte por que você é a pessoa certa para esta campanha" error={errs.m} value={msg} onChange={(e) => setMsg(e.target.value)} />
          <SafetyNote />
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <Button type="submit" block loading={busy} disabled={!!c.conflict}>Candidatar-se</Button>
          <LinkButton href="/oportunidades" variant="outline" block>Voltar às campanhas</LinkButton>
        </Card>
      </form>
    </div>
  )
}
