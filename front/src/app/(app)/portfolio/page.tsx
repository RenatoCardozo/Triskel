'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, del, post } from '@/lib/api'
import { applyApiError } from '@/lib/forms'
import { Button, Card, Confirm, EmptyState, ErrorState, Modal, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { Input } from '@/components/ui/form'

interface Item { id: string; title: string; description: string; views: string | null }
const schema = z.object({ title: z.string().trim().min(3, 'Informe o título (3 a 80 caracteres).').max(80), description: z.string().trim().min(3, 'Descreva o trabalho (ex.: Marca · Reels).').max(120) })
type F = z.infer<typeof schema>

export default function Portfolio() {
  const qc = useQueryClient(); const toast = useToast()
  const q = useQuery({ queryKey: ['portfolio'], queryFn: () => api<{ items: Item[] }>('me/portfolio') })
  const [open, setOpen] = useState(false); const [rm, setRm] = useState<Item | null>(null); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { title: '', description: '' } })
  async function add(v: F) {
    setErr('')
    try { await post('me/portfolio', v); await qc.invalidateQueries({ queryKey: ['portfolio'] }); reset(); setOpen(false); toast('Trabalho adicionado ao portfólio.') } catch (e) { setErr(applyApiError(e)) }
  }
  async function remove() {
    if (!rm) return; setBusy(true)
    try { await del('me/portfolio/' + rm.id); await qc.invalidateQueries({ queryKey: ['portfolio'] }); toast('Trabalho removido.'); setRm(null) } catch (e) { toast((e as Error).message, 'err') } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title sub="Mostre trabalhos anteriores para empresas e agências.">Meu portfólio</Title>
      {q.isPending ? <PageSkeleton rows={2} /> : q.isError ? <ErrorState error={q.error} onRetry={() => q.refetch()} /> : (
        <>
          {q.data.items.length === 0 ? <EmptyState title="Seu portfólio está vazio" action={<Button onClick={() => setOpen(true)}>+ Adicionar trabalho</Button>}>Adicione os vídeos que você já fez. Eles aparecem no seu perfil para quem busca criadores.</EmptyState> : (
            <ul className="space-y-3">{q.data.items.map((i) => (
              <li key={i.id}><Card className="flex items-start justify-between gap-3"><div className="min-w-0"><b className="block text-ink">{i.title}</b><span className="cap block">{i.description}</span>{i.views && <span className="text-xs font-bold text-tealtext">{i.views}</span>}</div><Button variant="ghost" size="sm" onClick={() => setRm(i)} aria-label={`Remover ${i.title}`}>Remover</Button></Card></li>
            ))}</ul>
          )}
          {q.data.items.length > 0 && <Button variant="outline" block onClick={() => setOpen(true)}>+ Adicionar trabalho</Button>}
        </>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Adicionar trabalho">
        <form noValidate onSubmit={handleSubmit(add)} className="space-y-4">
          <Input label="Título" placeholder="Ex.: Receita de bolo de rolo" error={errors.title?.message} {...register('title')} />
          <Input label="Descrição" placeholder="Ex.: Doce Vale Confeitaria · Reels" error={errors.description?.message} {...register('description')} />
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" loading={isSubmitting}>Adicionar</Button></div>
        </form>
      </Modal>
      <Confirm open={!!rm} title="Remover trabalho?" confirmLabel="Remover" danger loading={busy} onConfirm={remove} onClose={() => setRm(null)}>“{rm?.title}” sai do seu portfólio.</Confirm>
    </div>
  )
}
