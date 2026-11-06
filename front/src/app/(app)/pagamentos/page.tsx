'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { del } from '@/lib/api'
import { brl, fdatetime } from '@/lib/format'
import type { MoneyTx } from '@/lib/types'
import { useMe, useWallet } from '@/hooks/queries'
import { Button, Card, Confirm, EmptyState, ErrorState, Kpi, LinkButton, PageSkeleton, Pill, Title, useToast, type PillTone } from '@/components/ui'
import { Icon } from '@/components/Icon'
import { SafetyNote } from '@/components/domain'

const STATUS: Record<string, [string, PillTone]> = { CUSTODIA: ['Em custódia', 'warn'], LIBERADO: ['Liberado', 'ok'], CONCLUIDO: ['Concluído', 'ok'], PENDENTE: ['Pendente', 'warn'], PROCESSANDO: ['Processando', 'warn'], RECUSADO: ['Recusado', 'danger'], EXPIRADO: ['Expirado', 'grey'], FALHOU: ['Falhou', 'danger'] }

function Row({ t, creator }: { t: MoneyTx; creator: boolean }) {
  const [label, tone] = STATUS[t.status] ?? [t.status, 'grey' as PillTone]
  const credit = t.kind === 'RECHARGE' || (creator && t.kind === 'PAY')
  const kindTxt = t.kind === 'RECHARGE' ? t.detail || 'Adição de saldo' : t.kind === 'WITHDRAWAL' ? t.detail || 'Saque via Pix' : creator ? 'Recebimento' : `Pago com o saldo${t.counterparty ? ' · ' + t.counterparty : ''}`
  const value = t.kind === 'CONTRACT' ? (t.totalCents ?? t.valueCents) : t.valueCents
  const sign = t.status === 'CUSTODIA' && creator ? '' : credit ? '+ ' : '− '
  return (
    <li>
      <Link href={`/pagamentos/comprovante/${t.id}`} className="card flex items-center gap-3 no-underline hover:shadow-md">
        <span className={`grid h-10 w-10 flex-none place-items-center rounded-full ${credit ? 'bg-ok-bg text-tealtext' : 'bg-[#eef1fc] text-ink'}`}><Icon n={t.kind === 'RECHARGE' ? 'plus' : t.kind === 'WITHDRAWAL' ? 'up' : 'wallet'} size={18} /></span>
        <div className="min-w-0 flex-1"><b className="block truncate text-ink">{t.kind === 'RECHARGE' ? 'Adição de saldo' : t.description}</b><span className="cap block truncate">{fdatetime(t.createdAt)} · {kindTxt}</span></div>
        <div className="text-right"><b className="block text-ink">{sign}{brl(value)}</b><Pill tone={tone}>{label}</Pill></div>
      </Link>
    </li>
  )
}

export default function Pagamentos() {
  const me = useMe(); const w = useWallet(); const qc = useQueryClient(); const toast = useToast()
  const [rm, setRm] = useState<string | null>(null); const [busy, setBusy] = useState(false)
  if (w.isPending || me.isPending) return <PageSkeleton rows={3} />
  if (w.isError) return <ErrorState error={w.error} onRetry={() => w.refetch()} />
  const x = w.data
  async function removeCard() {
    if (!rm) return; setBusy(true)
    try { await del('wallet/cards/' + rm); await qc.invalidateQueries({ queryKey: ['wallet'] }); toast('Cartão removido.'); setRm(null) } catch (e) { toast((e as Error).message, 'err') } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title>Pagamentos</Title>
      {x.role === 'CREATOR' ? (
        <>
          <div className="grid grid-cols-2 gap-3"><Kpi value={brl(x.availableCents)} label="Disponível para saque" /><Kpi value={brl(x.custodyCents)} label="A receber" hint="Em custódia até a aprovação" /></div>
          <LinkButton href="/pagamentos/saque" block>Sacar via Pix</LinkButton>
          <p className="np">O contratante paga com o saldo da carteira dele antes de você começar. O valor fica em custódia na Triskel e é liberado quando a entrega é aprovada.</p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3"><Kpi value={brl(x.balanceCents)} label="Saldo disponível" hint="Usado para pagar contratos" /><Kpi value={brl(x.custodyCents)} label="Em custódia" hint="Liberado após aprovação" /></div>
          <LinkButton href="/pagamentos/adicionar" block><Icon n="plus" size={18} /> Adicionar saldo</LinkButton>
          <p className="np">Você paga os criadores com o saldo da carteira. Adicione saldo por Pix ou cartão; ao confirmar um contrato, o valor mais a taxa de serviço saem do saldo e ficam em custódia até você aprovar a entrega.</p>
          <section aria-labelledby="fm"><h2 id="fm" className="h-sec mb-2">Formas de adicionar saldo</h2>
            <ul className="space-y-2">
              <li className="card flex items-center gap-3"><Icon n="pix" /><b className="flex-1 text-ink">Pix</b><Pill>Disponível</Pill></li>
              {x.cards.map((c) => <li key={c.id} className="card flex items-center gap-3"><Icon n="card" /><b className="flex-1 text-ink">{c.brand} •••• {c.last4} · val. {c.exp}</b><Button variant="ghost" size="sm" onClick={() => setRm(c.id)} aria-label={`Remover cartão ${c.brand} final ${c.last4}`}>Remover</Button></li>)}
            </ul>
          </section>
        </>
      )}
      <section aria-labelledby="mv"><h2 id="mv" className="h-sec mb-2">{x.role === 'CREATOR' ? 'Histórico' : 'Movimentações'}</h2>
        {x.movements.length === 0 ? <EmptyState title="Nenhuma movimentação ainda">{x.role === 'CREATOR' ? 'Os recebimentos e saques aparecem aqui.' : 'Adicione saldo para começar a contratar criadores.'}</EmptyState> : <ul className="space-y-2">{x.movements.map((t) => <Row key={t.id + t.kind} t={t} creator={x.role === 'CREATOR'} />)}</ul>}
      </section>
      <SafetyNote />
      <Confirm open={!!rm} title="Remover cartão?" confirmLabel="Remover" danger loading={busy} onConfirm={removeCard} onClose={() => setRm(null)}>Você poderá cadastrar o cartão de novo numa próxima recarga.</Confirm>
    </div>
  )
}
