'use client'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, newIdemKey } from '@/lib/api'
import { brl } from '@/lib/format'
import { maskCPF } from '@/lib/masks'
import { maskMail } from '@/lib/profileFields'
import type { MoneyTx } from '@/lib/types'
import { useMe, useWallet } from '@/hooks/queries'
import { BackLink, Button, Card, Confirm, ErrorState, Kpi, LinkButton, Note, PageSkeleton, Title } from '@/components/ui'
import { MoneyInput } from '@/components/ui/form'
import { Icon } from '@/components/Icon'

const MIN = 1000

export default function Saque() {
  const me = useMe(); const w = useWallet(); const qc = useQueryClient()
  const [v, setV] = useState(0); const [key, setKey] = useState<'mail' | 'cpf'>('mail'); const [err, setErr] = useState(''); const [ask, setAsk] = useState(false); const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<MoneyTx | null>(null); const idem = useRef(newIdemKey())
  if (w.isPending || me.isPending) return <PageSkeleton rows={2} />
  if (w.isError || w.data.role !== 'CREATOR' || !me.data) return <ErrorState error={w.error} onRetry={() => w.refetch()} />
  const avail = w.data.availableCents; const u = me.data
  const hasCpf = !!u.profile.cpf
  const cpfTxt = hasCpf ? `CPF •••.${maskCPF(u.profile.cpf).slice(4, 7)}.${maskCPF(u.profile.cpf).slice(8, 11)}-••` : 'CPF (não informado)'
  function check() {
    setErr('')
    if (v < MIN) return setErr('O valor mínimo do saque é R$ 10,00.')
    if (v > avail) return setErr('O valor é maior que o saldo disponível.')
    if (key === 'cpf' && !hasCpf) return setErr('Informe o seu CPF no perfil para usar essa chave.')
    setAsk(true)
  }
  async function go() {
    setBusy(true)
    try { const r = await api<{ transaction: MoneyTx }>('wallet/withdrawals', { method: 'POST', body: { amountCents: v, key }, idempotencyKey: idem.current }); setDone(r.transaction); ['wallet', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })) }
    catch (e) { setErr((e as Error).message); idem.current = newIdemKey() } finally { setBusy(false); setAsk(false) }
  }
  if (done) return (
    <div className="mx-auto max-w-xl space-y-4"><Title>Sacar via Pix</Title>
      <Card className="space-y-3 text-center" role="status"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-tealtext"><Icon n="check" size={28} strokeWidth={2.6} /></span><h2 className="h-sec">Saque solicitado</h2><p className="text-[15px]">{brl(done.valueCents)} {done.status === 'CONCLUIDO' ? 'enviados' : 'a caminho'} para {done.detail}. Situação: <b>{done.status === 'CONCLUIDO' ? 'Concluído' : 'Processando'}</b>.</p>
        <LinkButton href={`/pagamentos/comprovante/${done.id}`} variant="outline" block>Ver comprovante</LinkButton><LinkButton href="/pagamentos" block>Voltar aos pagamentos</LinkButton></Card></div>
  )
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/pagamentos">Pagamentos</BackLink>
      <Title sub="Ambiente de simulação · nenhum valor real é movimentado">Sacar via Pix</Title>
      <div className="grid grid-cols-2 gap-3"><Kpi value={brl(avail)} label="Disponível para saque" /><Kpi value={brl(w.data.custodyCents)} label="Em custódia" hint="Libera após aprovação" /></div>
      <Card className="space-y-4">
        <MoneyInput label="Valor do saque" value={v} onChange={setV} />
        <button type="button" className="link text-sm" onClick={() => setV(avail)} disabled={avail <= 0}>Sacar tudo</button>
        <fieldset className="field"><legend className="flabel mb-1 text-[13px] font-bold text-ink">Enviar para a chave Pix</legend>
          <div role="radiogroup" className="space-y-2">{([['mail', `E-mail ${maskMail(u.email)}`], ['cpf', cpfTxt]] as const).map(([k, l]) => <label key={k} className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-sm font-bold ${key === k ? 'border-teal-2 bg-ok-bg' : 'border-line'} ${k === 'cpf' && !hasCpf ? 'opacity-60' : ''}`}><input type="radio" name="pk" className="accent-[#2dd4bf]" checked={key === k} disabled={k === 'cpf' && !hasCpf} onChange={() => setKey(k)} />{l}</label>)}</div></fieldset>
        <Note>Saque por Pix, sem taxa e com valor mínimo de R$ 10,00. Cai na hora, em qualquer dia.</Note>
        {err && <Note tone="danger" role="alert">{err}</Note>}
        <Button block onClick={check} disabled={avail < MIN}>Sacar</Button>
        {avail < MIN && <p className="cap text-center">Você ainda não tem saldo disponível para saque.</p>}
      </Card>
      <Confirm open={ask} title="Confirmar saque?" confirmLabel="Sacar" loading={busy} onConfirm={go} onClose={() => setAsk(false)}>Enviar {brl(v)} para a chave Pix ({key === 'mail' ? `e-mail ${maskMail(u.email)}` : cpfTxt}).</Confirm>
    </div>
  )
}
