'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { post } from '@/lib/api'
import { codeSchema } from '@/lib/schemas'
import { applyApiError } from '@/lib/forms'
import { maskMail } from '@/lib/profileFields'
import type { Me } from '@/lib/types'
import { useMe, useMeMutation } from '@/hooks/queries'
import { BackLink, Button, Card, ErrorState, LinkButton, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { Input } from '@/components/ui/form'
import { Icon } from '@/components/Icon'
import { MailLink } from '@/components/MailLink'

export default function Page() { return <Suspense><Validar /></Suspense> }

function Validar() {
  const me = useMe(); const router = useRouter(); const toast = useToast(); const novo = useSearchParams().get('novo')
  const [err, setErr] = useState(''); const [resent, setResent] = useState(false); const [busy, setBusy] = useState(false)
  const verify = useMeMutation((code: string) => post<{ user: Me }>('auth/verify-email', { code }))
  const { register, handleSubmit, formState: { errors } } = useForm<{ code: string }>({ resolver: zodResolver(codeSchema), defaultValues: { code: '' } })
  if (me.isPending) return <PageSkeleton rows={1} />
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />
  const u = me.data
  async function resend() {
    setErr(''); setBusy(true)
    try { await post('auth/resend-code'); setResent(true); toast('Enviamos um novo código.') } catch (e) { setErr(applyApiError(e)) } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/painel" />
      <Title>Validar e-mail</Title>
      <Card className="space-y-4">
        {u.verified ? (
          <>
            <p className="inline-flex items-center gap-2 rounded-full bg-ok-bg px-3 py-1.5 text-sm font-extrabold text-tealtext"><Icon n="check" size={16} strokeWidth={2.4} />E-mail validado: {maskMail(u.email)}</p>
            <p className="cap">Nada a fazer por aqui.</p>
            <LinkButton href="/painel" block>Voltar ao painel</LinkButton>
          </>
        ) : (
          <form noValidate className="space-y-4" onSubmit={handleSubmit(async (v) => { setErr(''); try { await verify.mutateAsync(v.code); toast('E-mail validado.'); router.push('/painel') } catch (e) { setErr(applyApiError(e)) } })}>
            {novo && <Note tone="ok">Conta criada. Falta só validar o e-mail.</Note>}
            <p className="text-[15px]">Enviamos um código de 6 dígitos para <b>{maskMail(u.email)}</b>. Abra o e-mail, copie o código e volte para digitar aqui.</p>
            <Input label="Código de verificação" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" error={errors.code?.message} {...register('code')} />
            {resent && <Note tone="ok" role="status">Novo código enviado. Use o mais recente.</Note>}
            {err && <Note tone="danger" role="alert">{err}</Note>}
            <Button type="submit" block loading={verify.isPending}>Validar e-mail</Button>
            <MailLink />
            <Button variant="outline" block loading={busy} onClick={resend}>Reenviar código</Button>
            <p className="cap text-center">O código vale por 15 minutos. Até validar, o seu perfil fica oculto para outras pessoas.</p>
            <LinkButton href="/painel" variant="ghost" block>Fazer isso depois</LinkButton>
          </form>
        )}
      </Card>
    </div>
  )
}
