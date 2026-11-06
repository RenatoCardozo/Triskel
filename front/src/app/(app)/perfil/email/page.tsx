'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { post } from '@/lib/api'
import { codeSchema, emailChangeSchema } from '@/lib/schemas'
import { applyApiError } from '@/lib/forms'
import { maskMail } from '@/lib/profileFields'
import type { Me } from '@/lib/types'
import { useMe, useMeMutation } from '@/hooks/queries'
import { BackLink, Button, Card, ErrorState, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { Input } from '@/components/ui/form'
import { MailLink } from '@/components/MailLink'

export default function TrocarEmail() {
  const me = useMe(); const router = useRouter(); const toast = useToast()
  const [sent, setSent] = useState<string | null>(null); const [err, setErr] = useState('')
  const req = useForm<{ email: string }>({ resolver: zodResolver(emailChangeSchema), defaultValues: { email: '' } })
  const cod = useForm<{ code: string }>({ resolver: zodResolver(codeSchema), defaultValues: { code: '' } })
  const confirm = useMeMutation((code: string) => post<{ user: Me }>('me/email/confirm', { code }))
  if (me.isPending) return <PageSkeleton rows={1} />
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/perfil" />
      <Title>Trocar email</Title>
      <Card className="space-y-4">
        <p className="text-[15px]">E-mail atual: <b>{maskMail(me.data.email)}</b></p>
        {!sent ? (
          <form noValidate className="space-y-4" onSubmit={req.handleSubmit(async (v) => { setErr(''); try { await post('me/email/request', { email: v.email }); setSent(v.email) } catch (e) { setErr(applyApiError(e)) } })}>
            <Input label="Novo e-mail" type="email" autoComplete="email" error={req.formState.errors.email?.message} {...req.register('email')} />
            <Note>Vamos enviar um código para o novo e-mail. Até validar, o seu perfil fica oculto para outras pessoas.</Note>
            {err && <Note tone="danger" role="alert">{err}</Note>}
            <Button type="submit" block loading={req.formState.isSubmitting}>Enviar código ao novo e-mail</Button>
          </form>
        ) : (
          <form noValidate className="space-y-4" onSubmit={cod.handleSubmit(async (v) => { setErr(''); try { await confirm.mutateAsync(v.code); toast('E-mail atualizado e validado.'); router.push('/perfil') } catch (e) { setErr(applyApiError(e)) } })}>
            <Note tone="ok">Enviamos um código de 6 dígitos para <b>{maskMail(sent)}</b>. Ele vale por 15 minutos.</Note>
            <Input label="Código de 6 dígitos" inputMode="numeric" autoComplete="one-time-code" maxLength={6} error={cod.formState.errors.code?.message} {...cod.register('code')} />
            {err && <Note tone="danger" role="alert">{err}</Note>}
            <Button type="submit" block loading={confirm.isPending}>Confirmar novo e-mail</Button>
            <MailLink />
            <Button variant="ghost" block onClick={() => { setSent(null); setErr('') }}>Usar outro e-mail</Button>
          </form>
        )}
        <Button variant="outline" block onClick={() => router.push('/perfil')}>Cancelar</Button>
      </Card>
    </div>
  )
}
