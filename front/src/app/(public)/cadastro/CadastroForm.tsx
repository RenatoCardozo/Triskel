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
import { Petals } from '@/components/Logo'
import { PasswordInput, PasswordMeter } from '@/components/ui/form'

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
  const fe = (k: keyof RegisterForm) => (errors[k]?.message as string | undefined)
  const row = (mb: number) => ({ marginBottom: mb })
  const pillLeft = (i: number) => `calc(15px + ${i + 0.5} * (100% - 30px) / 3 - 60px)`
  const idx = role === 'CREATOR' ? 0 : role === 'BUSINESS' ? 1 : 2
  const field = (id: keyof RegisterForm, label: string, ph: string, extra: Record<string, unknown> = {}) => (
    <div style={row(10)}>
      <label htmlFor={id} className="tk-lb">{label}</label>
      <input id={id} className="tk-in" placeholder={ph} aria-invalid={fe(id) ? true : undefined} {...extra} {...register(id as never)} />
      {fe(id) && <div role="alert" className="tk-err">{fe(id)}</div>}
    </div>
  )
  const masked = (id: 'doc' | 'data' | 'tel', label: string, ph: string, mask: (v: string) => string, extra: Record<string, unknown> = {}) => (
    <Controller control={control} name={id} render={({ field }) => (
      <div style={row(10)}>
        <label htmlFor={id} className="tk-lb">{label}</label>
        <input id={id} className="tk-in" inputMode="numeric" placeholder={ph} value={field.value} onChange={(e) => field.onChange(mask(e.target.value))} onBlur={field.onBlur} aria-invalid={fe(id) ? true : undefined} {...extra} />
        {fe(id) && <div role="alert" className="tk-err">{fe(id)}</div>}
      </div>
    )} />
  )
  const senha2 = watch('senha2')
  return (
    <div className="tk-pg">
      <div className="tk-card">
        <div className="tk-mark"><Petals size={89} /></div>
        <h1 className="tk-ttl" style={{ marginTop: 32 }}>Crie sua conta</h1>
        <p className="tk-sb" style={{ marginTop: 13 }}>Leva menos de um minuto. Você completa o perfil depois.</p>
        <div className="tk-tabs" role="tablist" aria-label="Tipo de conta" style={{ marginTop: 30 }}>
          <span className="pill" aria-hidden="true" style={{ left: pillLeft(idx), width: 120 }} />
          {TABS.map(([r, t]) => <button key={r} type="button" role="tab" aria-selected={role === r} onClick={() => pick(r)}>{t}</button>)}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ marginTop: 26 }}>
          {field('nome', role === 'CREATOR' ? 'Nome completo' : l.nome, role === 'CREATOR' ? 'Como você quer ser chamado(a)' : l.nome, { autoComplete: 'organization' })}
          {role !== 'CREATOR' && field('resp', 'Nome completo', 'Nome do responsavel', { autoComplete: 'name' })}
          {masked('doc', l.doc, role === 'CREATOR' ? '000.000.000-00' : '00.000.000/0000-00', role === 'CREATOR' ? maskCPF : maskCNPJ)}
          {masked('data', l.data, 'dd/mm/aaaa', maskDate)}
          <div style={{ display: 'grid', gridTemplateColumns: '105fr 105fr 102fr', gap: 8, marginBottom: 12 }}>
            <div><label htmlFor="cidade" className="tk-lb">Cidade</label><input id="cidade" className="tk-in" placeholder="Pelotas" autoComplete="address-level2" aria-invalid={fe('cidade') ? true : undefined} {...register('cidade')} /></div>
            <div><label htmlFor="uf" className="tk-lb">Estado</label><input id="uf" className="tk-in" placeholder="RS" maxLength={2} style={{ textTransform: 'uppercase' }} autoComplete="address-level1" aria-invalid={fe('uf') ? true : undefined} {...register('uf', { setValueAs: (v: string) => v.toUpperCase() })} /></div>
            <div><label htmlFor="pais" className="tk-lb">Cidade</label><input id="pais" className="tk-in" placeholder="Brasil" readOnly tabIndex={-1} aria-label="País" /></div>
          </div>
          {(fe('cidade') || fe('uf')) && <div role="alert" className="tk-err" style={{ marginTop: -8, marginBottom: 10 }}>{fe('cidade') || fe('uf')}</div>}
          {field('email', l.email, 'email@gmail.com', { type: 'email', autoComplete: 'email', inputMode: 'email' })}
          {masked('tel', 'Número de celular', '(ddd) 99999-9999', maskPhone, { autoComplete: 'tel-national' })}
          <PasswordInput fig id="senha" label="Senha" className="mb-[10px]" placeholder="Senha" autoComplete="new-password" error={errors.senha?.message} {...register('senha')} />
          <PasswordInput fig id="senha2" label="Confirme sua senha" placeholder="Confirme sua senha" autoComplete="new-password" error={errors.senha2?.message} {...register('senha2')} />
          <div style={{ marginTop: 21 }}><PasswordMeter value={senha} confirm={senha2} /></div>
          <div style={{ marginTop: 22 }}>
            <label className="tk-ck sq" style={{ alignItems: 'flex-start', gap: 11, fontSize: 12, fontWeight: 400, color: '#000' }}>
              <input type="checkbox" aria-invalid={!!errors.aceite} {...register('aceite')} />
              <span style={{ marginTop: 0 }}>Li e aceito os <Link href="/termos" target="_blank" style={{ color: '#000' }}>Termos de uso</Link> e a <Link href="/privacidade" target="_blank" style={{ color: '#000' }}>Política de privacidade</Link> da Triskel.</span>
            </label>
            {errors.aceite && <div role="alert" className="tk-err">{errors.aceite.message}</div>}
          </div>
          {err && <Note tone="danger" role="alert" className="mt-3">{err}</Note>}
          <button type="submit" className="tk-btn" style={{ marginTop: 21 }} disabled={isSubmitting}>{isSubmitting ? 'Enviando…' : 'Entrar'}</button>
          <p style={{ marginTop: 22, fontSize: 14, fontWeight: 300, color: '#62dfcf' }}>Já tem conta? <Link href="/login" style={{ fontWeight: 700, color: '#62dfcf', textDecoration: 'none', marginLeft: 3 }}>Entrar na conta</Link></p>
        </form>
      </div>
    </div>
  )
}
