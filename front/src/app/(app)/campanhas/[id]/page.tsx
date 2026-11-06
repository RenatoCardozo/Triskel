'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, del, post } from '@/lib/api'
import { brl, fdate } from '@/lib/format'
import { applyApiError } from '@/lib/forms'
import type { CampaignDetail } from '@/lib/types'
import { ExclusivityText, Facts, Money } from '@/components/domain'
import { BackLink, Button, Card, Confirm, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title, useToast } from '@/components/ui'

export default function CampanhaDetalhe() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const qc = useQueryClient(); const toast = useToast()
  const q = useQuery({ queryKey: ['campaign', id], queryFn: () => api<{ campaign: CampaignDetail }>('campaigns/' + id).then((r) => r.campaign) })
  const [reqs, setReqs] = useState<Record<string, boolean> | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false); const [rm, setRm] = useState(false)
  if (q.isPending) return <PageSkeleton rows={3} />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const c = q.data, f = c.form
  const sel = reqs ?? Object.fromEntries(c.requirements.map((r) => [r, true]))
  const chosen = c.requirements.filter((r) => sel[r])
  async function confirm() {
    if (!chosen.length) return setErr('Mantenha ao menos um requisito para a análise da IA.')
    setErr(''); setBusy(true)
    try { await post('campaigns/' + id + '/confirm', { requirements: chosen }); await qc.invalidateQueries({ queryKey: ['campaign', id] }); qc.invalidateQueries({ queryKey: ['campaigns'] }); toast('Campanha confirmada. Agora escolha os criadores.'); router.push(`/criadores?campanha=${id}`) }
    catch (e) { setErr(applyApiError(e)) } finally { setBusy(false) }
  }
  async function remove() {
    setBusy(true)
    try { await del('campaigns/' + id); qc.invalidateQueries({ queryKey: ['campaigns'] }); toast('Campanha excluída.'); router.push('/campanhas') } catch (e) { toast((e as Error).message, 'err'); setRm(false) } finally { setBusy(false) }
  }
  const draft = c.status === 'DRAFT'
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href="/campanhas">Campanhas</BackLink>
      <Title sub={draft ? 'Confira o briefing gerado e escolha o que a IA vai conferir. Etapa 2 de 2.' : 'Campanha aberta'}>{draft ? 'Campanha gerada e requisitos' : f.nome}</Title>
      <div className="flex justify-center"><Pill tone={draft ? 'warn' : 'ok'}>{draft ? 'Rascunho' : 'Aberta para candidaturas e propostas'}</Pill></div>
      <Card className="space-y-2"><h2 className="h-sec">{f.nome}</h2><p className="cap">{c.brandName}</p>
        <p className="text-[15px]">{c.generated.headline}</p><p className="text-[15px]">{c.generated.creators}</p><p className="text-[15px]">{c.generated.content}</p></Card>
      <Card className="space-y-3"><h2 className="h-sec">Condições</h2>
        <Facts items={[['Valor por vídeo', brl(c.conditions.perVideoCents)], ['Total estimado ao criador', brl(c.conditions.perCreator.valueCents)], ['Taxa da Triskel (10%)', brl(c.conditions.total.feeCents)], ['Investimento total', brl(c.conditions.total.totalCents)], ['Início', fdate(f.inicio)], ['Entrega', fdate(f.entrega)], ['Publicação', f.publi ? fdate(f.publi) : '—'], ['Ajustes', f.rev], ['Uso de imagem', f.uso], ['Exclusividade', f.excl === 'Nenhuma' ? ExclusivityText(0) : f.excl], ['Produto', f.envio]]} cols={3} />
        <Money valueCents={c.conditions.perCreator.valueCents} feeCents={c.conditions.perCreator.feeCents} totalCents={c.conditions.perCreator.totalCents} side="K" note={false} /></Card>
      <Card className="space-y-2"><h2 className="h-sec">Requisitos para a análise da IA</h2>
        <p className="cap">{draft ? 'Sugeridos a partir do briefing. Desmarque o que não se aplica.' : 'Estes requisitos são conferidos pela IA em cada entrega.'}</p>
        <ul className="space-y-2">{c.requirements.map((r) => <li key={r}>{draft ? <label className="flex items-start gap-2 text-[15px]"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#2dd4bf]" checked={!!sel[r]} onChange={(e) => setReqs({ ...sel, [r]: e.target.checked })} />{r}</label> : <span className="flex gap-2 text-[15px]"><span className="text-tealtext" aria-hidden="true">✓</span>{r}</span>}</li>)}</ul></Card>
      <Note>Toda a negociação com os criadores acontece dentro da Triskel.</Note>
      {err && <Note tone="danger" role="alert">{err}</Note>}
      {draft ? (
        <>
          <Button block loading={busy} onClick={confirm}>Confirmar e buscar criadores</Button>
          <LinkButton href={`/campanhas/${id}/editar`} variant="outline" block>Editar dados</LinkButton>
          <Button variant="danger" block onClick={() => setRm(true)}>Excluir rascunho</Button>
        </>
      ) : <LinkButton href={`/criadores?campanha=${id}`} block>Buscar criadores</LinkButton>}
      <Confirm open={rm} title="Excluir este rascunho?" confirmLabel="Excluir" danger loading={busy} onConfirm={remove} onClose={() => setRm(false)}>A campanha “{f.nome}” será apagada.</Confirm>
    </div>
  )
}
