'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { authCall, post } from '@/lib/api'
import { passwordChangeSchema } from '@/lib/schemas'
import { applyApiError } from '@/lib/forms'
import { BackLink, Button, Card, Note, Title } from '@/components/ui'
import { PasswordInput, PasswordMeter } from '@/components/ui/form'

type F = { atual: string; nova: string; nova2: string }
export default function TrocarSenha() {
  const router = useRouter(); const qc = useQueryClient(); const [err, setErr] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(passwordChangeSchema), defaultValues: { atual: '', nova: '', nova2: '' } })
  async function onSubmit(v: F) {
    setErr('')
    try {
      await post('me/password', { atual: v.atual, nova: v.nova })
      // o back encerra todas as sessões ao trocar a senha: limpa os cookies e pede novo login
      await authCall('logout').catch(() => null)
      qc.clear(); router.replace('/login?senha=1'); router.refresh()
    } catch (e) { setErr(applyApiError(e)) }
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/perfil" />
      <Title>Trocar senha</Title>
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-4">
          <PasswordInput label="Senha atual" autoComplete="current-password" error={errors.atual?.message} {...register('atual')} />
          <PasswordInput label="Nova senha" autoComplete="new-password" error={errors.nova?.message} {...register('nova')} />
          <PasswordMeter value={watch('nova')} />
          <PasswordInput label="Confirmar nova senha" autoComplete="new-password" error={errors.nova2?.message} hint="Repita a senha para confirmar." {...register('nova2')} />
          <Note>Por segurança, depois de trocar a senha você sai de todos os aparelhos e entra de novo.</Note>
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <Button type="submit" block loading={isSubmitting}>Salvar nova senha</Button>
          <Button variant="outline" block onClick={() => router.push('/perfil')}>Cancelar</Button>
        </Card>
      </form>
    </div>
  )
}
