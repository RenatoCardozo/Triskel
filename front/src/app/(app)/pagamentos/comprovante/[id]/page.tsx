'use client'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { brl, fdatetime } from '@/lib/format'
import type { MoneyTx } from '@/lib/types'
import { useMe } from '@/hooks/queries'
import { BackLink, Card, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title } from '@/components/ui'

const ST: Record<string, string> = { CUSTODIA: 'Em custódia', LIBERADO: 'Liberado', CONCLUIDO: 'Concluído', PENDENTE: 'Pendente', PROCESSANDO: 'Processando', RECUSADO: 'Recusado', EXPIRADO: 'Expirado', FALHOU: 'Falhou' }

export default function Comprovante() {
  const { id } = useParams<{ id: string }>(); const me = useMe()
  const q = useQuery({ queryKey: ['receipt', id], queryFn: () => api<{ receipt: MoneyTx }>('wallet/transactions/' + id).then((r) => r.receipt) })
  if (q.isPending || me.isPending) return <PageSkeleton rows={2} />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const t = q.data, creator = me.data?.role === 'CREATOR'
  const title = t.kind === 'RECHARGE' ? 'Comprovante de adição de saldo' : t.kind === 'WITHDRAWAL' ? 'Comprovante de saque' : 'Comprovante de pagamento'
  const items: Array<[string, string]> = [['ID da transação', t.id], ['Descrição', t.description]]
  if (t.kind === 'CONTRACT' || t.kind === 'PAY') {
    items.push([creator ? 'Contratante' : 'Criador', t.counterparty || '—'], ['Pago com', t.method === 'saldo' || !t.method ? 'Saldo da carteira' : t.detail || t.method])
    items.push([creator ? 'Você recebe' : 'Valor ao criador', brl(t.valueCents)])
    if (!creator && t.feeCents != null) items.push(['Taxa de serviço Triskel (10%)', brl(t.feeCents)], ['Total debitado', brl(t.totalCents)])
  } else {
    items.push([t.kind === 'WITHDRAWAL' ? 'Destino' : 'Forma', t.detail || '—'], ['Valor', brl(t.valueCents)])
    if (t.e2e) items.push(['Identificação Pix (E2E)', t.e2e])
  }
  items.push(['Data', fdatetime(t.createdAt)], ['Status', ST[t.status] ?? t.status])
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/pagamentos">Pagamentos</BackLink>
      <Title sub="Comprovante simulado · sem valor fiscal">{title}</Title>
      <Card className="space-y-3"><div className="flex justify-center"><Pill tone={t.status === 'CONCLUIDO' || t.status === 'LIBERADO' ? 'ok' : t.status === 'RECUSADO' || t.status === 'FALHOU' ? 'danger' : 'warn'}>{ST[t.status] ?? t.status}</Pill></div>
        <dl className="divide-y divide-line">{items.map(([k, v]) => <div key={k} className="flex flex-wrap justify-between gap-2 py-2"><dt className="text-ink-2">{k}</dt><dd className="break-all text-right font-bold text-ink">{v}</dd></div>)}</dl>
        {t.message && <Note tone="warn">{t.message}</Note>}
        {t.status === 'CUSTODIA' && <Note>{creator ? 'Valor em custódia: é liberado para você quando a entrega for aprovada e a publicação, confirmada.' : 'Valor em custódia: é liberado ao criador quando você aprovar a entrega.'}</Note>}
      </Card>
      <LinkButton href="/pagamentos" variant="outline" block>Voltar aos pagamentos</LinkButton>
    </div>
  )
}
