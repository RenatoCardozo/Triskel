'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authCall } from '@/lib/api'
import { registerPayload, registerSchema, type RegisterForm } from '@/lib/schemas'
import { applyApiError } from '@/lib/forms'
import { maskCNPJ, maskCPF, maskDate, maskPhone, UFS } from '@/lib/masks'
import { Button, Note, Tabs } from '@/components/ui'
import { Input, MaskedInput, PasswordInput, PasswordMeter, Select } from '@/components/ui/form'

type Role = 'CREATOR' | 'BUSINESS' | 'AGENCY'
const TABS: Array<[Role, string]> = [['CREATOR', 'Criador'], ['BUSINESS', 'Comércio'], ['AGENCY', 'Agência']]
const L = {
  CREATOR: { nome: 'Nome completo', doc: 'CPF', data: 'Data de nascimento', email: 'Email' },
  BUSINESS: { nome: 'Nome do comércio', doc: 'CNPJ', data: 'Data de fundação', email: 'Email do responsavel' },
  AGENCY: { nome: 'Nome da agência', doc: 'CNPJ', data: 'Data de fundação', email: 'Email do responsavel' },
}

export function CadastroForm() {
  const router = useRouter(); const sp = useSearchParams()
  const initial = (['CREATOR', 'BUSINESS', 'AGENCY'].includes(sp.get('perfil') || '') ? sp.get('perfil') : 'CREATOR') as Role
  const [err, setErr] = useState('')
  const f = useForm<RegisterForm>({ resolver: zodResolver(registerSchema), mode: 'onTouched', defaultValues: { role: initial, nome: '', resp: '', doc: '', data: '', cidade: '', uf: '', email: '', tel: '', senha: '', senha2: '', aceite: false } })
  const { register, control, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors, isSubmitting } } = f
  const role = watch('role'); const senha = watch('senha'); const l = L[role]

  function pick(r: Role) { setValue('role', r); setValue('doc', ''); setValue('data', ''); clearErrors() }
  async function onSubmit(v: RegisterForm) {
    setErr('')
    try { await authCall('register', registerPayload(v)); router.replace('/perfil/validar-email?novo=1'); router.refresh() }
    catch (e) { setErr(applyApiError(e, setError, { doc: 'doc', email: 'email', tel: 'tel', data: 'data', senha: 'senha', nome: 'nome' })) }
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <div className="card !p-6">
        <h1 className="h-title !text-2xl">Crie sua conta</h1>
        <p className="h-sub mt-1">Leva menos de um minuto. Você completa o perfil depois.</p>
        <div className="mt-4"><Tabs label="Tipo de conta" tabs={TABS} value={role} onChange={pick} /></div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input className="sm:col-span-2" label={l.nome} autoComplete="organization" error={errors.nome?.message} {...register('nome')} />
          {role !== 'CREATOR' && <Input className="sm:col-span-2" label="Nome completo (responsável)" autoComplete="name" error={errors.resp?.message} {...register('resp')} />}
          <Controller control={control} name="doc" render={({ field }) => <MaskedInput label={l.doc} placeholder={role === 'CREATOR' ? '000.000.000-00' : '00.000.000/0000-00'} mask={role === 'CREATOR' ? maskCPF : maskCNPJ} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.doc?.message} />} />
          <Controller control={control} name="data" render={({ field }) => <MaskedInput label={l.data} placeholder="dd/mm/aaaa" mask={maskDate} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.data?.message} />} />
          <Input label="Cidade" autoComplete="address-level2" error={errors.cidade?.message} {...register('cidade')} />
          <Select label="Estado" options={UFS} placeholder="UF" error={errors.uf?.message} {...register('uf')} />
          <Input className="sm:col-span-2" label={l.email} type="email" autoComplete="email" inputMode="email" error={errors.email?.message} {...register('email')} />
          <Controller control={control} name="tel" render={({ field }) => <MaskedInput className="sm:col-span-2" label="Número de celular" placeholder="(00) 00000-0000" autoComplete="tel-national" mask={maskPhone} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={errors.tel?.message} />} />
          <div className="sm:col-span-2 space-y-2">
            <PasswordInput label="Senha" autoComplete="new-password" error={errors.senha?.message} {...register('senha')} />
            <PasswordMeter value={senha} />
          </div>
          <PasswordInput className="sm:col-span-2" label="Confirme sua senha" autoComplete="new-password" error={errors.senha2?.message} hint="Repita a senha para confirmar." {...register('senha2')} />
          <div className="sm:col-span-2">
            <label className="flex items-start gap-2 text-sm text-ink"><input type="checkbox" className="mt-1 h-4 w-4 accent-[#2dd4bf]" aria-invalid={!!errors.aceite} {...register('aceite')} /><span>Li e aceito os <Link href="/termos" target="_blank" className="link">Termos de uso</Link> e a <Link href="/privacidade" target="_blank" className="link">Política de privacidade</Link> da Triskel.</span></label>
            {errors.aceite && <span role="alert" className="ferr">{errors.aceite.message}</span>}
          </div>
          {err && <div className="sm:col-span-2"><Note tone="danger" role="alert">{err}</Note></div>}
          <div className="sm:col-span-2"><Button type="submit" block loading={isSubmitting}>Criar conta</Button></div>
        </form>
        <p className="mt-5 text-center text-sm text-ink-2">Já tem conta? <Link href="/login" className="link">Entrar na conta</Link></p>
      </div>
    </div>
  )
}
