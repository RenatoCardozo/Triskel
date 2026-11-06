'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { patch } from '@/lib/api'
import { phoneSchema } from '@/lib/schemas'
import { applyApiError } from '@/lib/forms'
import { digits, maskPhone } from '@/lib/masks'
import { maskTel } from '@/lib/profileFields'
import { useMe, useMeMutation } from '@/hooks/queries'
import { BackLink, Button, Card, ErrorState, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { MaskedInput } from '@/components/ui/form'

export default function Telefone() {
  const me = useMe(); const router = useRouter(); const toast = useToast()
  const [err, setErr] = useState('')
  const m = useMeMutation((tel: string) => patch('me/phone', { tel }))
  const { control, handleSubmit, formState: { errors } } = useForm<{ tel: string }>({ resolver: zodResolver(phoneSchema), defaultValues: { tel: '' } })
  if (me.isPending) return <PageSkeleton rows={1} />
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/perfil" />
      <Title>Trocar número</Title>
      <form noValidate onSubmit={handleSubmit(async (v) => { setErr(''); try { await m.mutateAsync(digits(v.tel)); toast('Número atualizado.'); router.push('/perfil') } catch (e) { setErr(applyApiError(e)) } })}>
        <Card className="space-y-4">
          <p className="text-[15px]">Número atual: <b>{maskTel(me.data.phone)}</b></p>
          <Controller control={control} name="tel" render={({ field }) => <MaskedInput label="Novo número de celular" placeholder="(00) 00000-0000" autoComplete="tel-national" mask={maskPhone} value={field.value} onChange={field.onChange} error={errors.tel?.message} />} />
          <Note>Usamos o número só para avisar sobre propostas e pagamentos. Não precisa de validação e nunca aparece no seu perfil.</Note>
          {err && <Note tone="danger" role="alert">{err}</Note>}
          <Button type="submit" block loading={m.isPending}>Salvar número</Button>
          <Button variant="outline" block onClick={() => router.push('/perfil')}>Cancelar</Button>
        </Card>
      </form>
    </div>
  )
}
