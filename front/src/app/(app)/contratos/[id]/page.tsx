'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { fdate, fdatetime } from '@/lib/format'
import type { ContractView, Signature } from '@/lib/types'
import { useMe } from '@/hooks/queries'
import { ContractBlocks } from '@/components/ContractBlocks'
import { ExclusivityText, Facts, Money, SafetyNote, imageUseFull } from '@/components/domain'
import { BackLink, Button, Card, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title, useToast } from '@/components/ui'

function Sig({ role, s, pending }: { role: string; s: Signature | null; pending?: boolean }) {
  return (
    <div className="rounded-2xl bg-surface p-3"><p className="lbl">{role}</p>
      {s ? <><p className="font-extrabold text-ink">{s.nome}</p><p className="cap">{s.org ? s.org + ' · ' : ''}{s.papel}</p><p className="cap">{fdatetime(s.at)} · código <b className="text-tealtext">{s.code}</b></p></> : <p className="cap">{pending ? 'Assinada ao confirmar o pagamento' : 'Aguardando assinatura'}</p>}
    </div>
  )
}

export default function Contrato() {
  const { id } = useParams<{ id: string }>(); const qc = useQueryClient(); const toast = useToast()
  const me = useMe()
  const q = useQuery({ queryKey: ['contract', id], queryFn: () => api<ContractView>('contracts/' + id) })
  const [ok, setOk] = useState(false); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (q.isPending || me.isPending) return <PageSkeleton />
  if (q.isError || !me.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const v = q.data, c = v.contract, side = c.side
  async function sign() {
    setErr(''); setBusy(true)
    try { const r = await post<ContractView>(`contracts/${id}/sign`, { accept: true }); qc.setQueryData(['contract', id], r); ['proposals', 'proposal', 'deliveries', 'delivery', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })); toast('Contrato assinado. O PDF final foi gerado.') }
    catch (e) { setErr((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <BackLink href={`/contatos/${c.proposalId}`}>Voltar à conversa</BackLink>
      <Title sub={c.campaignName}>Contrato {c.number}</Title>
      <div className="flex justify-center"><Pill tone={c.signed ? 'ok' : 'warn'}>{c.signed ? 'Assinado pelas duas partes' : side === 'C' ? 'Aguardando a sua assinatura' : 'Aguardando assinatura do criador'}</Pill></div>
      <Card className="space-y-3">
        <Facts items={[['Prazo de entrega', fdate(c.deliveryDate)], ['Uso de imagem', imageUseFull(c.imageUse)], ['Exclusividade', ExclusivityText(c.exclusiveDays)], ['Valor pago em custódia em', c.paidAt ? fdatetime(c.paidAt) : '—']]} />
        <Money valueCents={c.valueCents} feeCents={c.feeCents} totalCents={c.totalCents} side={side} note={false} />
      </Card>
      <Card className="space-y-3"><h2 className="h-sec">Partes do contrato</h2>
        <Facts items={[['Contratante', c.parties.contractor.name], ['CNPJ', c.parties.contractor.doc || '—'], ['Representante', c.parties.contractor.resp || '—'], ...(c.parties.contractor.client ? [['Cliente', c.parties.contractor.client] as [string, string]] : []), ['Contratado(a)', c.parties.creator.name], ['CPF', c.parties.creator.doc || '—'], ['Cidade', c.parties.creator.city || '—']]} />
      </Card>
      <Card className="space-y-3"><h2 className="h-sec">Assinaturas digitais</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Sig role="Contratante" s={c.signatures.contractor} pending={c.signatures.contractorPending} /><Sig role="Contratado(a)" s={c.signatures.creator} /></div>
        <p className="cap break-all">Hash do contrato (SHA-256): {c.sha256}</p>
      </Card>
      {v.conflict && !c.signed && <Note tone="warn" role="alert"><b>Conflito de exclusividade.</b> {v.conflict}</Note>}
      {v.missing.length > 0 && <Note tone="warn" role="alert">Complete o cadastro antes de assinar: {v.missing.join(', ')}. <Link href="/perfil/editar" className="link">Editar perfil</Link></Note>}
      <details className="card !p-0 group"><summary className="flex cursor-pointer list-none items-center justify-between p-4 font-extrabold text-ink">Ler o contrato completo<span aria-hidden="true" className="text-tealtext group-open:rotate-180">⌄</span></summary><div className="px-4 pb-4"><ContractBlocks blocks={c.blocks} /></div></details>
      <a href={`/api/bff/contracts/${id}/pdf?download=1`} className="btn btn-outline btn-block" download>{c.signed ? 'Baixar contrato assinado (PDF)' : 'Baixar minuta (PDF)'}</a>
      {!c.signed && <p className="cap">A minuta já traz os dados das duas partes. O PDF final, com as assinaturas digitais, é gerado quando as duas partes assinarem.</p>}
      {v.canSign && (
        <Card className="space-y-3"><h2 className="h-sec">Assinar contrato</h2>
          <label className="flex items-start gap-2 text-sm text-ink"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#2dd4bf]" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>Li e concordo com os termos. A análise da IA é apoio; a decisão final é humana.</span></label>
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <Button block disabled={!ok || !!v.conflict || v.missing.length > 0} loading={busy} onClick={sign}>Assinar contrato</Button>
        </Card>
      )}
      {c.signed && <LinkButton href="/entregas" block>Acompanhar entrega</LinkButton>}
      <SafetyNote />
    </div>
  )
}
