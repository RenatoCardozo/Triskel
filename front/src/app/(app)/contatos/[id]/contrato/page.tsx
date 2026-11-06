'use client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { brl, fdate } from '@/lib/format'
import type { ContractPreview, ContractView } from '@/lib/types'
import { useMe } from '@/hooks/queries'
import { ContractBlocks } from '@/components/ContractBlocks'
import { ExclusivityText, Facts, Money, SafetyNote, imageUseFull } from '@/components/domain'
import { BackLink, Button, Card, Confirm, ErrorState, LinkButton, Note, PageSkeleton, Title, useToast } from '@/components/ui'

export default function ContratoPreview() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const qc = useQueryClient(); const toast = useToast()
  const me = useMe()
  const q = useQuery({ queryKey: ['contract-preview', id], queryFn: () => api<ContractPreview>(`proposals/${id}/contract`) })
  const [ok, setOk] = useState(false); const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false)
  useEffect(() => { if (q.data?.contractId) router.replace(`/contratos/${q.data.contractId}`) }, [q.data?.contractId, router])
  if (q.isPending || me.isPending || q.data?.contractId) return <PageSkeleton />
  if (q.isError || !me.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const d = q.data, s = d.summary!, side = s.side
  const blocked = !!d.conflict || (d.missing?.length ?? 0) > 0 || (side === 'K' && !d.wallet?.enough)
  async function pay() {
    setBusy(true)
    try { const r = await post<ContractView>(`proposals/${id}/pay`); await Promise.all(['wallet', 'proposals', 'proposal', 'dashboard', 'deliveries'].map((k) => qc.invalidateQueries({ queryKey: [k] }))); toast('Pagamento confirmado. O valor está em custódia.'); router.push(`/contratos/${r.contract.id}`) }
    catch (e) { toast((e as Error).message, 'err'); setConfirm(false); q.refetch() } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href={`/contatos/${id}`}>Voltar à conversa</BackLink>
      <Title>Revisar contrato</Title>
      <Card className="space-y-3">
        <Facts items={[['Contratante', s.brandName], ['Criador', s.creatorName], ...(s.clientName ? [['Cliente', s.clientName] as [string, string]] : []), ['Campanha', s.campaignName], ['Prazo de entrega', fdate(s.deliveryDate)], ['Revisões', s.revisions], ['Uso de imagem', imageUseFull(s.imageUse)], ['Exclusividade', ExclusivityText(s.exclusiveDays)]]} />
        <Money valueCents={s.valueCents} feeCents={s.feeCents} totalCents={s.totalCents} side={side} />
        <div className={`rounded-2xl p-3 text-sm font-bold ${d.conflict ? 'bg-warn-bg text-warn' : 'bg-ok-bg text-tealtext'}`}>Conflito de exclusividade: {d.conflict ?? 'Nenhum conflito ✓'}</div>
      </Card>
      {side === 'K' && d.wallet && (
        <Card className="space-y-2"><h2 className="h-sec">Pagamento com saldo da carteira</h2>
          <Facts items={[['Saldo atual', brl(d.wallet.balanceCents)], ['Total do contrato', brl(s.totalCents)], [d.wallet.enough ? 'Saldo depois do pagamento' : 'Falta adicionar', brl(d.wallet.enough ? d.wallet.afterCents : d.wallet.missingCents)]]} cols={3} />
          {!d.wallet.enough && <><Note tone="warn">Seu saldo não cobre o total. Adicione {brl(d.wallet.missingCents)} (ou mais) por Pix ou cartão e volte para pagar.</Note><LinkButton href={`/pagamentos/adicionar?falta=${d.wallet.missingCents}&volta=${encodeURIComponent(`/contatos/${id}/contrato`)}`} variant="outline" block>Adicionar saldo</LinkButton></>}
        </Card>
      )}
      {(d.missing?.length ?? 0) > 0 && <Note tone="warn" role="alert">Complete o cadastro antes de seguir: {d.missing!.join(', ')}. <Link href="/perfil/editar" className="link">Editar perfil</Link></Note>}
      {d.conflict && <Note tone="warn" role="alert">{d.conflict}</Note>}
      <details className="card !p-0 group"><summary className="flex cursor-pointer list-none items-center justify-between p-4 font-extrabold text-ink">Ler o contrato completo<span aria-hidden="true" className="text-tealtext group-open:rotate-180">⌄</span></summary><div className="px-4 pb-4">{d.blocks && <ContractBlocks blocks={d.blocks} />}</div></details>
      <Note>{side === 'K' ? 'Ao pagar, o contrato é gerado, o valor fica em custódia na Triskel e a sua assinatura digital é registrada. O criador assina em seguida. O valor é liberado quando a entrega for aprovada e a Triskel confirmar a publicação.' : 'O contratante paga com o saldo da carteira ao confirmar o contrato. O valor fica em custódia na Triskel e é liberado para você quando a entrega for aprovada e a Triskel confirmar a publicação do seu post.'}</Note>
      {side === 'K' && (
        <>
          <label className="flex items-start gap-2 text-sm text-ink"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#2dd4bf]" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>Li e concordo com os termos. A análise da IA é apoio; a decisão final é humana.</span></label>
          <Button block disabled={!ok || blocked} onClick={() => setConfirm(true)}>Pagar {brl(s.totalCents)} e confirmar contrato</Button>
        </>
      )}
      <SafetyNote />
      <Confirm open={confirm} title="Confirmar pagamento?" confirmLabel="Pagar e confirmar" loading={busy} onConfirm={pay} onClose={() => setConfirm(false)}>
        {brl(s.totalCents)} saem do seu saldo e ficam em custódia até a entrega ser aprovada e a publicação confirmada.
      </Confirm>
    </div>
  )
}
