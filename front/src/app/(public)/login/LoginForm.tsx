'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authCall } from '@/lib/api'
import { loginSchema, type LoginForm as F } from '@/lib/schemas'
import { safeNext } from '@/lib/forms'
import { Note } from '@/components/ui'
import { PasswordInput } from '@/components/ui/form'
import { Petals } from '@/components/Logo'

/** Login do Figma: card de 380 px, campos de 50 px, botão "Entrar" 20/900. */
export function LoginForm() {
  const router = useRouter(); const sp = useSearchParams()
  const [err, setErr] = useState('')
  const [forgot, setForgot] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', senha: '', remember: false } })

  async function onSubmit(v: F) {
    setErr('')
    try { await authCall('login', v); router.replace(safeNext(sp.get('next'))); router.refresh() }
    catch (e) { setErr((e as Error).message) }
  }
  return (
    <div className="tk-pg login">
      <div className="tk-card login">
        <div className="tk-mark"><Petals size={89} /></div>
        <h1 className="tk-ttl" style={{ marginTop: 44 }}>Bem-vindo de volta</h1>
        <p className="tk-sb" style={{ marginTop: 23 }}>Entre para acessar suas campanhas e conversas</p>
        {sp.get('senha') && <Note tone="ok" className="mt-4" role="status">Senha alterada. Entre novamente com a nova senha.</Note>}
        {sp.get('expirou') && <Note tone="warn" className="mt-4" role="status">Sua sessão expirou. Entre novamente.</Note>}
        <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate style={{ marginTop: 38 }}>
          <div>
            <label htmlFor="email" className="tk-lb" style={{ marginBottom: 2 }}>E-mail</label>
            <input id="email" type="email" autoComplete="username" inputMode="email" className="tk-in" aria-invalid={errors.email ? true : undefined} {...register('email')} />
            {errors.email && <div role="alert" className="tk-err">{errors.email.message}</div>}
          </div>
          <PasswordInput fig id="senha" label="Senha" className="mt-[10px]" autoComplete="current-password" error={errors.senha?.message} {...register('senha')} />
          <div className="mt-4 flex items-center justify-between" style={{ fontSize: 14 }}>
            <label className="tk-ck" style={{ fontWeight: 300, color: '#2dd4bf' }}><input type="checkbox" aria-label="Lembrar-me" {...register('remember')} /><span style={{ marginLeft: 3 }}>Lembrar-me</span></label>
            <button type="button" onClick={() => setForgot((s) => !s)} aria-expanded={forgot} style={{ fontWeight: 700, color: '#62dfcf', background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: 14 }}>Esqueci minha senha</button>
          </div>
          {forgot && <Note className="mt-3">A recuperação de senha por e-mail ainda não está disponível nesta versão. Se precisar de ajuda para entrar, <Link href="/fale-conosco" className="link">fale conosco</Link>.</Note>}
          {err && <Note tone="danger" role="alert" className="mt-3">{err}</Note>}
          <button type="submit" className="tk-btn" style={{ marginTop: 19 }} disabled={isSubmitting}>{isSubmitting ? 'Entrando…' : 'Entrar'}</button>
          <p style={{ marginTop: 22, fontSize: 14, fontWeight: 300, color: '#62dfcf' }}>Ainda não possui conta? <Link href="/cadastro" style={{ fontWeight: 700, color: '#62dfcf', textDecoration: 'none' }}>Cadastre-se grátis</Link></p>
        </form>
      </div>
    </div>
  )
}
