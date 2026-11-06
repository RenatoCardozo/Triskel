'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError, newIdemKey, post } from '@/lib/api'
import { brl } from '@/lib/format'
import { cnpjOk, cpfOk, digits, luhn, maskCard, maskCNPJ, maskCPF, maskExp } from '@/lib/masks'
import { tokenize } from '@/lib/paysim'
import { safeNext } from '@/lib/forms'
import type { Recharge, Wallet } from '@/lib/types'
import { useWallet } from '@/hooks/queries'
import { BackLink, Button, Card, ErrorState, LinkButton, Note, PageSkeleton, Spinner, Tabs, Title, useToast } from '@/components/ui'
import { Input, MaskedInput, MoneyInput } from '@/components/ui/form'
import { SafetyNote } from '@/components/domain'
import { Icon } from '@/components/Icon'

const MIN = 2000, MAX = 1_000_000
const QUICK = [5000, 10000, 20000, 50000]

export default function Page() { return <Suspense><Adicionar /></Suspense> }

function Countdown({ to }: { to: string }) {
  const [s, setS] = useState(() => Math.max(0, Math.floor((+new Date(to) - Date.now()) / 1000)))
  useEffect(() => { const t = setInterval(() => setS(Math.max(0, Math.floor((+new Date(to) - Date.now()) / 1000))), 1000); return () => clearInterval(t) }, [to])
  return <span>{s <= 0 ? 'expirado' : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`}</span>
}

function Adicionar() {
  const sp = useSearchParams(); const router = useRouter(); const qc = useQueryClient(); const toast = useToast()
  const wallet = useWallet()
  const falta = Number(sp.get('falta')) || 0; const volta = safeNext(sp.get('volta') || '/pagamentos')
  const [amount, setAmount] = useState(falta >= MIN ? falta : 0); const [method, setMethod] = useState<'pix' | 'card'>('pix')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const [rec, setRec] = useState<Recharge | null>(null); const idem = useRef(newIdemKey())
  // cartão
  const [num, setNum] = useState(''), [exp, setExp] = useState(''), [cvv, setCvv] = useState(''), [holder, setHolder] = useState(''), [doc, setDoc] = useState(''), [ctype, setCtype] = useState<'credito' | 'debito'>('credito'), [save, setSave] = useState(false)
  const [saved, setSaved] = useState<string>('new'); const [fe, setFe] = useState<Record<string, string>>({})
  const [code, setCode] = useState('')

  const cards = wallet.data && wallet.data.role !== 'CREATOR' ? wallet.data.cards : []
  const txId = rec?.transaction.id
  const status = rec?.transaction.status
  const poll = useQuery({ queryKey: ['recharge', txId], enabled: !!txId && status === 'PENDENTE', refetchInterval: 3000, queryFn: () => api<Recharge>('wallet/recharges/' + txId) })
  const cur = poll.data ?? rec
  const st = cur?.transaction.status
  useEffect(() => { if (st === 'CONCLUIDO') { ['wallet', 'dashboard'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })) } }, [st, qc])

  if (wallet.isPending) return <PageSkeleton rows={2} />
  if (wallet.isError) return <ErrorState error={wallet.error} onRetry={() => wallet.refetch()} />
  const balance = (wallet.data as Extract<Wallet, { balanceCents: number }>).balanceCents

  function reset() { setRec(null); setCode(''); idem.current = newIdemKey(); setErr('') }
  function validAmount() { if (amount < MIN) { setErr('O valor mínimo é R$ 20,00.'); return false } if (amount > MAX) { setErr('O limite por adição é R$ 10.000,00.'); return false } return true }

  async function create(body: Record<string, unknown>) {
    const r = await api<Recharge>('wallet/recharges', { method: 'POST', body, idempotencyKey: idem.current }); setRec(r)
    return r
  }
  async function genPix() { setErr(''); if (!validAmount()) return; setBusy(true); try { await create({ amountCents: amount, method: 'pix' }) } catch (e) { setErr((e as Error).message) } finally { setBusy(false) } }
  async function payCard() {
    setErr(''); setFe({}); if (!validAmount()) return
    const er: Record<string, string> = {}
    if (!/^\d{3,4}$/.test(cvv)) er.cvv = 'Informe o CVV (3 ou 4 dígitos).'
    if (saved === 'new') {
      if (!luhn(num)) er.num = 'Número de cartão inválido.'
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) er.exp = 'Use MM/AA.'
      if (holder.trim().length < 3) er.holder = 'Informe o nome como está no cartão.'
      if (!(digits(doc).length === 11 ? cpfOk(doc) : cnpjOk(doc))) er.doc = 'CPF ou CNPJ do titular inválido.'
    }
    setFe(er); if (Object.keys(er).length) return
    setBusy(true)
    try {
      const sc = cards.find((c) => c.id === saved)
      const tk = sc ? await tokenize({ cardRef: sc.ref, cvv }) : await tokenize({ number: digits(num), exp, cvv, holder: holder.trim(), document: digits(doc), type: ctype })
      await create({ amountCents: amount, method: 'card', cardToken: tk.token, cardType: sc ? undefined : ctype, save: sc ? undefined : save, savedCardId: sc?.id })
      setNum(''); setCvv('')
    } catch (e) {
      if (e instanceof ApiError && e.details && typeof e.details === 'object') {
        const f = e.details as Record<string, string>; setFe({ num: f.num, exp: f.val, cvv: f.cvv, holder: f.nome, doc: f.doc }); setErr(e.message)
      } else setErr((e as Error).message)
      idem.current = newIdemKey()
    } finally { setBusy(false) }
  }
  async function confirm3ds() {
    if (!/^\d{6}$/.test(code)) return setErr('Informe os 6 dígitos.')
    setErr(''); setBusy(true)
    try { const r = await post<Recharge>(`wallet/recharges/${txId}/3ds`, { code }); setRec(r); setCode('') } catch (e) { setErr((e as Error).message); qc.invalidateQueries({ queryKey: ['recharge', txId] }) } finally { setBusy(false) }
  }
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); toast('Código Pix copiado.') } catch { toast('Não foi possível copiar. Selecione o texto e copie.', 'err') } }

  const header = <><BackLink href={volta === '/pagamentos' ? '/pagamentos' : volta}>Voltar</BackLink><Title sub="Ambiente de simulação · nenhum valor real é movimentado">Adicionar saldo</Title></>

  if (st === 'CONCLUIDO') return (
    <div className="mx-auto max-w-xl space-y-4">{header}
      <Card className="space-y-3 text-center" role="status"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ok-bg text-tealtext"><Icon n="check" size={28} strokeWidth={2.6} /></span><h2 className="h-sec">Saldo adicionado</h2><p className="text-[15px]">{brl(cur!.transaction.valueCents)} entraram na sua carteira. Saldo atual: <b>{brl(balance)}</b>.</p>
        <LinkButton href={volta} block>{volta === '/pagamentos' ? 'Ver pagamentos' : 'Voltar e continuar'}</LinkButton><LinkButton href={`/pagamentos/comprovante/${cur!.transaction.id}`} variant="outline" block>Ver comprovante</LinkButton></Card>
    </div>
  )
  if (st === 'RECUSADO' || st === 'EXPIRADO' || st === 'FALHOU') return (
    <div className="mx-auto max-w-xl space-y-4">{header}
      <Card className="space-y-3 text-center" role="alert"><h2 className="h-sec">{st === 'EXPIRADO' ? 'Pix expirado' : 'Pagamento não concluído'}</h2><p className="text-[15px]">{cur!.transaction.message || (st === 'EXPIRADO' ? 'O tempo para pagar acabou. Gere um novo Pix.' : 'O pagamento foi recusado. Nada foi cobrado.')}</p><Button block onClick={reset}>Tentar de novo</Button></Card>
    </div>
  )
  if (cur && cur.transaction.status === 'PENDENTE' && cur.action?.type === '3ds') return (
    <div className="mx-auto max-w-xl space-y-4">{header}
      <Card className="space-y-3"><h2 className="h-sec">Confirme com o seu banco</h2><p className="text-[15px]">{cur.action.message || 'O banco pediu uma confirmação extra (3-D Secure). Digite o código de 6 dígitos.'}</p><p className="cap">No simulador, o código é <b>123456</b>.{cur.action.attemptsLeft != null ? ` Tentativas restantes: ${cur.action.attemptsLeft}.` : ''}</p>
        <Input label="Código de 6 dígitos" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(digits(e.target.value))} />
        {err && <Note tone="danger" role="alert">{err}</Note>}<Button block loading={busy} onClick={confirm3ds}>Confirmar</Button><Button variant="ghost" block onClick={reset}>Cancelar</Button></Card>
    </div>
  )
  if (cur && cur.transaction.status === 'PENDENTE' && cur.pix) return (
    <div className="mx-auto max-w-xl space-y-4">{header}
      <Card className="space-y-3 text-center"><h2 className="h-sec">Pague {brl(cur.transaction.valueCents)} por Pix</h2>
        {cur.pix.qrSvg && <img alt="QR Code do Pix" className="mx-auto h-56 w-56 rounded-xl border border-line bg-white p-2" src={'data:image/svg+xml;utf8,' + encodeURIComponent(cur.pix.qrSvg)} />}
        <div className="field text-left"><label htmlFor="pixcode">Pix copia e cola</label><textarea id="pixcode" readOnly rows={3} className="inp break-all font-mono text-xs" value={cur.pix.payload} onFocus={(e) => e.currentTarget.select()} /></div>
        <Button variant="outline" block onClick={() => copy(cur.pix!.payload)}><Icon n="copy" size={18} /> Copiar código</Button>
        <p className="inline-flex items-center justify-center gap-2 text-sm font-bold text-ink" role="status"><Spinner />Aguardando o pagamento · expira em <Countdown to={cur.pix.expiresAt} /></p>
        <Note>A página atualiza sozinha quando o pagamento for confirmado. No ambiente de simulação, use o painel do banco simulado para “pagar” este Pix{process.env.NEXT_PUBLIC_PAYSIM_URL ? <> (<a className="link" href={process.env.NEXT_PUBLIC_PAYSIM_URL} target="_blank" rel="noopener noreferrer">abrir painel</a>)</> : null}.</Note>
        <Button variant="ghost" block onClick={reset}>Cancelar e escolher outro valor</Button></Card>
    </div>
  )
  return (
    <div className="mx-auto max-w-xl space-y-4">{header}
      <Card className="space-y-4">
        <p className="text-[15px]">Saldo atual: <b>{brl(balance)}</b></p>
        {falta > 0 && <Note tone="warn">Para pagar o contrato faltam {brl(falta)}. O valor já veio preenchido.</Note>}
        <MoneyInput label="Quanto você quer adicionar?" value={amount} onChange={setAmount} hint="Mínimo R$ 20,00 e máximo R$ 10.000,00 por adição." />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Valores rápidos">{QUICK.map((q) => <button key={q} type="button" className="chip" aria-pressed={amount === q} onClick={() => setAmount(q)}>{brl(q)}</button>)}</div>
        <Tabs label="Forma de pagamento" tabs={[['pix', 'Pix'], ['card', 'Cartão']]} value={method} onChange={(m) => { setMethod(m); setErr('') }} />
        {method === 'pix' ? (
          <><p className="cap">O Pix cai na hora. Geramos um código copia e cola e um QR Code.</p>{err && <Note tone="danger" role="alert">{err}</Note>}<Button block loading={busy} onClick={genPix}>Gerar Pix de {amount ? brl(amount) : '…'}</Button></>
        ) : (
          <div className="space-y-4">
            {cards.length > 0 && <div role="radiogroup" aria-label="Cartão" className="space-y-2">{[...cards.map((c) => ({ id: c.id, label: `${c.brand} •••• ${c.last4} · val. ${c.exp}` })), { id: 'new', label: 'Novo cartão' }].map((c) => <label key={c.id} className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-sm font-bold ${saved === c.id ? 'border-teal-2 bg-ok-bg' : 'border-line'}`}><input type="radio" name="card" checked={saved === c.id} onChange={() => { setSaved(c.id); setFe({}) }} className="accent-[#2dd4bf]" />{c.label}</label>)}</div>}
            {saved === 'new' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MaskedInput className="sm:col-span-2" label="Número do cartão" placeholder="0000 0000 0000 0000" autoComplete="cc-number" mask={maskCard} value={num} onChange={setNum} error={fe.num} />
                <MaskedInput label="Validade" placeholder="MM/AA" autoComplete="cc-exp" mask={maskExp} value={exp} onChange={setExp} error={fe.exp} />
                <MaskedInput label="CVV" placeholder="000" autoComplete="cc-csc" mask={(v) => digits(v).slice(0, 4)} value={cvv} onChange={setCvv} error={fe.cvv} />
                <Input className="sm:col-span-2" label="Nome no cartão" autoComplete="cc-name" value={holder} onChange={(e) => setHolder(e.target.value)} error={fe.holder} />
                <MaskedInput label="CPF ou CNPJ do titular" mask={(v) => (digits(v).length > 11 ? maskCNPJ(v) : maskCPF(v))} value={doc} onChange={setDoc} error={fe.doc} />
                <div className="field"><span className="flabel">Tipo</span><div role="radiogroup" aria-label="Tipo de cartão" className="flex gap-2">{(['credito', 'debito'] as const).map((t) => <label key={t} className={`flex-1 rounded-2xl border-2 p-2.5 text-center text-sm font-bold ${ctype === t ? 'border-teal-2 bg-ok-bg' : 'border-line'}`}><input type="radio" className="sr-only" name="ctype" checked={ctype === t} onChange={() => setCtype(t)} />{t === 'credito' ? 'Crédito' : 'Débito'}</label>)}</div></div>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-[#2dd4bf]" checked={save} onChange={(e) => setSave(e.target.checked)} />Salvar este cartão para as próximas recargas</label>
              </div>
            )}
            {saved !== 'new' && <MaskedInput label="CVV do cartão salvo" placeholder="000" mask={(v) => digits(v).slice(0, 4)} value={cvv} onChange={setCvv} error={fe.cvv} />}
            <Note>Os dados do cartão vão direto ao gateway de pagamento e não ficam guardados na Triskel. Cartões de teste: 4111 1111 1111 1111 (aprova) · 4000 0000 0000 3220 (pede 3-D Secure) · 4000 0000 0000 0002 (recusa).</Note>
            {err && <Note tone="danger" role="alert">{err}</Note>}
            <Button block loading={busy} onClick={payCard}>Pagar {amount ? brl(amount) : ''} com cartão</Button>
          </div>
        )}
      </Card>
      <SafetyNote />
    </div>
  )
}
