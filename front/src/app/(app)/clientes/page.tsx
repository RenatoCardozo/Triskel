'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { applyApiError } from '@/lib/forms'
import { BrandAvatar } from '@/components/domain'
import { Button, Card, EmptyState, ErrorState, Modal, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { Input, Select } from '@/components/ui/form'

interface Client { id: string; name: string; segment: string }

export default function Clientes() {
  const qc = useQueryClient(); const toast = useToast()
  const q = useQuery({ queryKey: ['clients'], queryFn: () => api<{ clients: Client[]; segments: string[] }>('me/clients') })
  const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [seg, setSeg] = useState(''); const [errs, setErrs] = useState<Record<string, string>>({}); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (q.isPending) return <PageSkeleton rows={3} />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const close = () => { setOpen(false); setName(''); setSeg(''); setErrs({}); setErr('') }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    const er: Record<string, string> = {}
    if (name.trim().length < 2) er.name = 'Informe o nome do cliente.'
    if (!seg) er.seg = 'Escolha o segmento.'
    setErrs(er); if (Object.keys(er).length) return
    setBusy(true)
    try { await post('me/clients', { name: name.trim(), segment: seg }); await qc.invalidateQueries({ queryKey: ['clients'] }); toast('Cliente cadastrado.'); close() }
    catch (x) { setErr(applyApiError(x)) } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title sub="Os clientes aparecem ao criar uma campanha e nos contratos em nome deles." action={<Button onClick={() => setOpen(true)}>+ Cadastrar cliente</Button>}>Meus clientes</Title>
      {q.data.clients.length === 0 ? <EmptyState title="Nenhum cliente ainda" action={<Button onClick={() => setOpen(true)}>+ Cadastrar cliente</Button>}>Cadastre o primeiro cliente para criar campanhas em nome dele.</EmptyState> : (
        <ul className="space-y-3">{q.data.clients.map((c) => <li key={c.id}><Card className="flex items-center gap-3"><BrandAvatar name={c.name} /><div className="min-w-0"><h2 className="truncate font-extrabold text-ink">{c.name}</h2><p className="cap">{c.segment}</p></div></Card></li>)}</ul>
      )}
      <Modal open={open} onClose={close} title="Novo cliente">
        <form noValidate onSubmit={submit} className="space-y-3">
          <Input label="Nome do cliente" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} error={errs.name} autoFocus />
          <Select label="Segmento" options={q.data.segments} placeholder="Selecione" value={seg} onChange={(e) => setSeg(e.target.value)} error={errs.seg} />
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <div className="flex gap-2"><Button type="submit" block loading={busy}>Cadastrar</Button><Button type="button" variant="outline" block onClick={close}>Cancelar</Button></div>
        </form>
      </Modal>
    </div>
  )
}
