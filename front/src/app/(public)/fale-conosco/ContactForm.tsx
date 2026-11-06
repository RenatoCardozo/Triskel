'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { post } from '@/lib/api'
import { contactSchema, type ContactForm as F } from '@/lib/schemas'
import { applyApiError } from '@/lib/forms'
import { Button, Note } from '@/components/ui'
import { Input, Select, Textarea } from '@/components/ui/form'

const PROFILES = ['Criador de conteúdo', 'Comércio', 'Agência', 'Ainda não tenho conta']
const SUBJECTS = ['Dúvida sobre a plataforma', 'Pagamentos e carteira', 'Contratos e entregas', 'Problema com a conta', 'Privacidade e dados (LGPD)', 'Sugestão ou elogio', 'Outro assunto']
const FAQ: Array<[string, string]> = [
  ['Como recebo o pagamento?', 'Depois que o contratante aprova a entrega e a Triskel confirma a publicação do post, o valor em custódia é liberado na sua carteira e você saca por Pix.'],
  ['Como adiciono saldo?', 'Em Pagamentos, toque em “Adicionar saldo” e escolha Pix ou cartão. O Pix cai na hora.'],
  ['Esqueci minha senha, e agora?', 'Na tela de login, use “Esqueci minha senha” e siga as instruções enviadas por e-mail.'],
]

export function ContactForm() {
  const [done, setDone] = useState<{ protocol: string; email: string } | null>(null)
  const [err, setErr] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(contactSchema), defaultValues: { name: '', email: '', profile: '', subject: '', message: '' } })
  async function onSubmit(v: F) {
    setErr('')
    try { const r = await post<{ protocol: string; email: string }>('contact', v); setDone(r) }
    catch (e) { setErr(applyApiError(e, setError, { name: 'name', email: 'email', message: 'message' })) }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10">
      <header><h1 className="h-title">Fale conosco</h1><p className="h-sub mt-1">Ficou com alguma dúvida ou precisa de ajuda? Escreva para a gente.</p></header>
      <section className="card"><dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[['E-mail', 'suporte@triskel.com.br'], ['Atendimento', 'Seg a sex, 9h às 18h'], ['Resposta', 'Em até 1 dia útil']].map(([k, v]) => <div key={k}><dt className="lbl">{k}</dt><dd className="text-[15px] font-bold text-ink">{v}</dd></div>)}</dl></section>
      {done ? (
        <section className="card text-center" role="status">
          <h2 className="h-sec">Mensagem enviada</h2>
          <p className="mt-1 text-[15px]">Seu protocolo é <b className="text-tealtext">{done.protocol}</b>. Respondemos em até 1 dia útil.</p>
          <Link href="/" className="btn btn-outline mt-4">Voltar ao início</Link>
        </section>
      ) : (
        <section className="card" aria-labelledby="env">
          <h2 id="env" className="h-sec">Envie uma mensagem</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Nome" autoComplete="name" error={errors.name?.message} {...register('name')} />
            <Input label="E-mail" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Select label="Você é" options={PROFILES} error={errors.profile?.message} {...register('profile')} />
            <Select label="Assunto" options={SUBJECTS} error={errors.subject?.message} {...register('subject')} />
            <Textarea className="sm:col-span-2" label="Mensagem" rows={5} maxLength={2000} error={errors.message?.message} {...register('message')} />
            <p className="cap sm:col-span-2">Usamos seus dados só para responder a este contato, conforme a <Link href="/privacidade" className="link">Política de privacidade</Link>.</p>
            {err && <div className="sm:col-span-2"><Note tone="danger" role="alert">{err}</Note></div>}
            <div className="sm:col-span-2"><Button type="submit" block loading={isSubmitting}>Enviar mensagem</Button></div>
          </form>
        </section>
      )}
      <section aria-labelledby="ajuda"><h2 id="ajuda" className="h-sec mb-2">Talvez ajude</h2>
        <div className="space-y-2">{FAQ.map(([q, a]) => <details key={q} className="card !p-0"><summary className="cursor-pointer p-4 font-extrabold text-ink">{q}</summary><p className="px-4 pb-4 text-[15px] text-[#3b4476]">{a}</p></details>)}</div></section>
      <div className="text-center"><Link href="/" className="btn btn-outline">Voltar ao início</Link></div>
    </div>
  )
}
