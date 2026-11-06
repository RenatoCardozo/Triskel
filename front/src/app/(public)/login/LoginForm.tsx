'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authCall } from '@/lib/api'
import { loginSchema, type LoginForm as F } from '@/lib/schemas'
import { safeNext } from '@/lib/forms'
import { Button, Note } from '@/components/ui'
import { Input, PasswordInput } from '@/components/ui/form'
import { Petals } from '@/components/Logo'

export function LoginForm() {
  const router = useRouter(); const sp = useSearchParams()
  const [err, setErr] = useState('')
  const [forgot, setForgot] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', senha: '', remember: true } })

  async function onSubmit(v: F) {
    setErr('')
    try { await authCall('login', v); router.replace(safeNext(sp.get('next'))); router.refresh() }
    catch (e) { setErr((e as Error).message) }
  }
  return (
    <div className="mx-auto grid max-w-md px-4 py-10">
      <div className="card !p-6">
        <div className="mb-3 flex justify-center"><Petals size={54} /></div>
        <h1 className="h-title !text-2xl">Bem-vindo de volta</h1>
        <p className="h-sub mt-1">Entre para acessar suas campanhas e conversas</p>
        {sp.get('senha') && <Note tone="ok" className="mt-4" role="status">Senha alterada. Entre novamente com a nova senha.</Note>}
        {sp.get('expirou') && <Note tone="warn" className="mt-4" role="status">Sua sessão expirou. Entre novamente.</Note>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
          <Input label="E-mail" type="email" autoComplete="username" inputMode="email" error={errors.email?.message} {...register('email')} />
          <PasswordInput label="Senha" autoComplete="current-password" error={errors.senha?.message} {...register('senha')} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <label className="inline-flex items-center gap-2 font-semibold text-ink"><input type="checkbox" className="h-4 w-4 accent-[#2dd4bf]" {...register('remember')} />Lembrar-me</label>
            <button type="button" className="link" onClick={() => setForgot((s) => !s)} aria-expanded={forgot}>Esqueci minha senha</button>
          </div>
          {forgot && <Note>A recuperação de senha por e-mail ainda não está disponível nesta versão. Se precisar de ajuda para entrar, <Link href="/fale-conosco" className="link">fale conosco</Link>.</Note>}
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <Button type="submit" block loading={isSubmitting}>Entrar</Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-2">Ainda não possui conta? <Link href="/cadastro" className="link">Cadastre-se grátis</Link></p>
      </div>
    </div>
  )
}
