'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, patch } from '@/lib/api'
import { profileKeys, SECTIONS, maskMail, maskTel } from '@/lib/profileFields'
import { cnpjOk, maskCNPJ, maskCPF, UFS } from '@/lib/masks'
import { isoToBRDate } from '@/lib/masks'
import { applyApiError } from '@/lib/forms'
import type { Me } from '@/lib/types'
import { useMe, useMeMutation, useMeta } from '@/hooks/queries'
import { BackLink, Button, Chips, ErrorState, FieldGroupLike, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { Input, MaskedInput, MoneyInput, Select, Textarea } from '@/components/ui/form'
import { PhotoPicker } from '@/components/PhotoPicker'
import { Card } from '@/components/ui'

const handle = z.string().refine((v) => !v || /^@?[A-Za-z0-9._]{3,30}$/.test(v.trim()) && !/\.\.|\.$/.test(v.trim()), 'Use só letras, números, ponto e sublinhado (3 a 30).')
const base = z.object({ nome: z.string().trim().min(3, 'Informe o nome.').max(60), cidade: z.string().trim().max(40), sobre: z.string().max(600, 'No máximo 600 caracteres.'), insta: handle, tiktok: handle.optional(), cnpj: z.string().refine((v) => !v || cnpjOk(v), 'CNPJ inválido.').optional() }).passthrough()

export default function EditarPerfil() {
  const me = useMe(); const meta = useMeta()
  if (me.isPending || meta.isPending) return <PageSkeleton rows={5} />
  if (me.isError || meta.isError || !me.data || !meta.data) return <ErrorState error={me.error ?? meta.error} onRetry={() => { me.refetch(); meta.refetch() }} />
  return <Editor u={me.data} opts={meta.data.options} />
}

function Editor({ u, opts }: { u: Me; opts: Record<string, string[]> }) {
  const router = useRouter(); const toast = useToast()
  const keys = useMemo(() => profileKeys(u.role), [u.role])
  const defaults = useMemo(() => {
    const d: Record<string, unknown> = {}
    for (const k of keys) d[k] = u.profile[k] ?? (Array.isArray(opts[k]) ? [] : '')
    for (const s of SECTIONS[u.role]) for (const f of s.fields) if (f.kind === 'chips' && !Array.isArray(d[f.k])) d[f.k] = []
    d._valor = u.profile.val?.reels ?? 0
    return d
  }, [u, keys, opts])
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting, isDirty } } = useForm<Record<string, any>>({ resolver: zodResolver(base) as any, defaultValues: defaults })
  const save = useMeMutation((body: Record<string, unknown>) => patch('me/profile', body))
  const [err, setErr] = useState('')

  async function onSubmit(v: Record<string, any>) {
    setErr('')
    const body: Record<string, unknown> = {}
    for (const k of keys) body[k] = v[k]
    try {
      let r = await save.mutateAsync(body)
      if (u.role === 'CREATOR' && Number(v._valor) !== (u.profile.val?.reels ?? 0)) r = await api<{ user: Me }>('me/prices', { method: 'PATCH', body: { reels: Number(v._valor) || 0 } })
      void r
      toast(u.complete || r.user.complete ? 'Perfil salvo.' : 'Perfil salvo. Ainda faltam informações para ele ficar visível.')
      router.push('/perfil')
    } catch (e) { setErr(applyApiError(e)) }
  }
  void setError
  const fieldErr = (k: string) => (errors as any)[k]?.message as string | undefined
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href="/perfil" />
      <Title sub={u.complete ? undefined : 'Falta pouco. Adicione as fotos e complete o restante para o perfil ficar visível.'}>Editar perfil</Title>
      <PhotoPicker u={u} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {SECTIONS[u.role].map((s) => (
          <Card key={s.title} as="section" aria-label={s.title}>
            <h2 className="h-sec mb-3">{s.title}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {s.fields.map((f) => {
                const wide = f.kind === 'chips' || f.kind === 'area' || f.k === 'nome'
                const cls = wide ? 'sm:col-span-2' : ''
                const e = fieldErr(f.k)
                if (f.kind === 'text' || f.kind === 'handle') return <Input key={f.k} className={cls} label={f.label} maxLength={f.max} placeholder={f.placeholder} autoCapitalize={f.kind === 'handle' ? 'none' : undefined} error={e} {...register(f.k)} />
                if (f.kind === 'area') return <Textarea key={f.k} className={cls} label={f.label} maxLength={f.max} rows={4} error={e} hint={f.max ? undefined : undefined} {...register(f.k)} />
                if (f.kind === 'uf') return <Select key={f.k} label={f.label} options={UFS} placeholder="UF" error={e} {...register(f.k)} />
                if (f.kind === 'select') return <Select key={f.k} label={f.label} options={opts[f.opt!]} error={e} {...register(f.k)} />
                if (f.kind === 'cnpj') return <Controller key={f.k} control={control} name={f.k} render={({ field }) => <MaskedInput label={f.label} placeholder="00.000.000/0000-00" mask={maskCNPJ} value={field.value ?? ''} onChange={field.onChange} error={e} />} />
                if (f.kind === 'money') return <Controller key={f.k} control={control} name={f.k} render={({ field }) => <MoneyInput label={f.label} value={field.value || 0} onChange={field.onChange} hint="Menor valor que você aceita por vídeo. Empresas e agências veem como “a partir de”." />} />
                return <FieldGroupLike key={f.k} className={cls} label={f.label}><Controller control={control} name={f.k} render={({ field }) => <Chips label={f.label} options={opts[f.opt!]} value={field.value ?? []} onChange={field.onChange} />} /></FieldGroupLike>
              })}
            </div>
          </Card>
        ))}
        <Card as="section" aria-label="Dados da conta (privados)">
          <h2 className="h-sec mb-2">Dados da conta (privados)</h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><dt className="lbl">{u.role === 'CREATOR' ? 'CPF' : 'CNPJ'}</dt><dd className="font-semibold">{u.role === 'CREATOR' ? (u.profile.cpf ? '•••.' + maskCPF(u.profile.cpf).slice(4, 11) + '-••' : 'não informado') : (u.profile.cnpj || 'não informado')}</dd></div>
            <div><dt className="lbl">{u.role === 'CREATOR' ? 'Data de nascimento' : 'Data de fundação'}</dt><dd className="font-semibold">{isoToBRDate(u.profile.nasc || u.profile.fund) || 'não informada'}</dd></div>
            <div><dt className="lbl">E-mail</dt><dd className="font-semibold">{maskMail(u.email)}</dd></div>
            <div><dt className="lbl">Celular</dt><dd className="font-semibold">{maskTel(u.phone)}</dd></div>
          </dl>
          <p className="cap mt-2">Dados da conta, vindos do cadastro. Eles não aparecem no seu perfil. Para mudar celular, e-mail ou senha, use o menu Perfil.</p>
        </Card>
        {err && <Note tone="danger" role="alert">{err}</Note>}
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty && u.complete} className="sm:min-w-52">{u.complete ? 'Salvar alterações' : 'Concluir perfil'}</Button>
          <Button variant="outline" onClick={() => router.push('/perfil')}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
