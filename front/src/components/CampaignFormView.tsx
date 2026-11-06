'use client'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { campaignSchema, type CampaignForm } from '@/lib/campaign'
import { maskDate } from '@/lib/masks'
import { applyApiError } from '@/lib/forms'
import { Button, Card, Chips, Note } from './ui'
import { FieldGroupLike } from './ui'
import { Input, MaskedInput, MoneyInput, Select, Textarea } from './ui/form'

type Opts = Record<string, string[]>
interface Props { defaults: CampaignForm; opts: Opts; clients?: Array<{ id: string; name: string }>; agency: boolean; submitLabel: string; onSubmit: (v: CampaignForm) => Promise<void>; onCancel: () => void }

/** Formulário "Criar campanha" (etapa 1 de 2 do protótipo). */
export function CampaignFormView({ defaults, opts, clients, agency, submitLabel, onSubmit, onCancel }: Props) {
  const [err, setErr] = useState('')
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CampaignForm>({ resolver: zodResolver(campaignSchema), defaultValues: defaults, mode: 'onTouched' })
  const e = (k: keyof CampaignForm) => (errors[k] as { message?: string } | undefined)?.message
  const chips = (k: 'pIdade' | 'pInt' | 'nichosCr' | 'porteCr' | 'fmt' | 'plat' | 'tom', label: string, o: string[]) => (
    <FieldGroupLike label={label} className="sm:col-span-2"><Controller control={control} name={k} render={({ field }) => <Chips label={label} options={o} value={field.value} onChange={field.onChange} />} />{e(k) && <span role="alert" className="ferr">{e(k)}</span>}</FieldGroupLike>
  )
  const date = (k: 'inicio' | 'entrega' | 'publi', label: string, optional = false) => <Controller control={control} name={k} render={({ field }) => <MaskedInput label={label} optional={optional} placeholder="dd/mm/aaaa" mask={maskDate} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={e(k)} />} />
  async function submit(v: CampaignForm) {
    setErr('')
    if (agency && !v.clientId) { setError('clientId', { message: 'Escolha o cliente da campanha.' }); return }
    try { await onSubmit(v) } catch (x) { setErr(applyApiError(x, setError, { nome: 'nome', valueCents: 'valueCents', entrega: 'entrega', inicio: 'inicio', publi: 'publi' })) }
  }
  const sec = (title: string, children: React.ReactNode) => <Card as="section" aria-label={title}><h2 className="h-sec mb-3">{title}</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div></Card>
  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-4">
      {sec('Sobre a campanha', <>
        {agency && <Controller control={control} name="clientId" render={({ field }) => <div className="field sm:col-span-2"><label htmlFor="cliente">Cliente</label><select id="cliente" className="inp" value={field.value} onChange={field.onChange} aria-invalid={!!e('clientId')}><option value="">Selecione</option>{(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.clientId && !field.value && <span role="alert" className="ferr">{errors.clientId.message}</span>}</div>} />}
        <Input className="sm:col-span-2" label="Nome da campanha" error={e('nome')} {...register('nome')} />
        <Input className="sm:col-span-2" label="Produto ou serviço divulgado" error={e('produto')} {...register('produto')} />
        <Select className="sm:col-span-2" label="Objetivo" options={opts.objetivos} error={e('obj')} {...register('obj')} />
      </>)}
      {sec('Descrição e briefing', <>
        <Textarea className="sm:col-span-2" label="Descrição e briefing" rows={5} maxLength={1200} error={e('desc')} {...register('desc')} />
        <Input className="sm:col-span-2" label="Mensagem principal" maxLength={160} error={e('msg')} {...register('msg')} />
        <Input className="sm:col-span-2" label="Chamada para ação" optional maxLength={80} placeholder="Ex.: Peça pelo link da bio" error={e('cta')} {...register('cta')} />
      </>)}
      {sec('Público da campanha', <>
        {chips('pIdade', 'Faixa etária', opts.idades)}
        <Select label="Gênero predominante" options={opts.gen} error={e('pGen')} {...register('pGen')} />
        <Select label="Região do público" options={opts.reg} error={e('pReg')} {...register('pReg')} />
        {chips('pInt', 'Interesses do público', opts.nichos)}
      </>)}
      {sec('Criadores que você procura', <>
        {chips('nichosCr', 'Nichos do criador', opts.nichos)}
        {chips('porteCr', 'Porte do criador', opts.porteCr)}
        <Select label="Gênero do criador" options={opts.genCr} error={e('genCr')} {...register('genCr')} />
        <Select label="Idade do criador" options={opts.idCr} error={e('idCr')} {...register('idCr')} />
        <Select label="Localização do criador" options={opts.reg} error={e('regCr')} {...register('regCr')} />
        <Select label="Nota mínima" options={opts.nota} error={e('nota')} {...register('nota')} />
        <Input label="Quantidade de criadores" type="number" inputMode="numeric" min={1} max={20} error={e('qCr')} {...register('qCr', { valueAsNumber: true })} />
      </>)}
      {sec('Conteúdo', <>
        {chips('fmt', 'Formatos', opts.fmt)}
        {chips('plat', 'Onde será publicado', opts.plataformas)}
        <Input label="Vídeos por criador" type="number" inputMode="numeric" min={1} max={10} error={e('qVid')} {...register('qVid', { valueAsNumber: true })} />
        <Select label="Duração do vídeo" options={opts.duracoes} error={e('dur')} {...register('dur')} />
        {chips('tom', 'Tom do vídeo', opts.tons)}
        <Input className="sm:col-span-2" label="Menções e hashtags" optional maxLength={120} placeholder="@suamarca #publi" error={e('mencoes')} {...register('mencoes')} />
        <Input className="sm:col-span-2" label="Vídeos de referência (links)" optional maxLength={200} error={e('refs')} {...register('refs')} />
        <Textarea className="sm:col-span-2" label="O que não pode aparecer" optional rows={2} maxLength={400} error={e('nao')} {...register('nao')} />
      </>)}
      {sec('Orçamento e prazos', <>
        <Controller control={control} name="valueCents" render={({ field }) => <MoneyInput className="sm:col-span-2" label="Valor por vídeo (R$)" value={field.value} onChange={field.onChange} error={e('valueCents')} hint="É o valor que o criador recebe. A taxa de 10% da Triskel é somada e paga por você." />} />
        {date('inicio', 'Início da campanha')}{date('entrega', 'Prazo de entrega do vídeo')}{date('publi', 'Data de publicação', true)}
        <Select label="Rodadas de ajuste incluídas" options={opts.rev} error={e('rev')} {...register('rev')} />
        <Select label="Uso de imagem" options={opts.uso} error={e('uso')} {...register('uso')} />
        <Select label="Exclusividade" options={opts.excl} error={e('excl')} {...register('excl')} />
        <Select label="Produto para o criador" options={opts.envio} error={e('envio')} {...register('envio')} />
      </>)}
      {Object.keys(errors).length > 0 && <Note tone="danger" role="alert">Revise os campos destacados antes de continuar.</Note>}
      {err && <Note tone="danger" role="alert">{err}</Note>}
      <div className="flex flex-col gap-2 sm:flex-row-reverse"><Button type="submit" loading={isSubmitting} className="sm:min-w-52">{submitLabel}</Button><Button variant="outline" onClick={onCancel}>Cancelar</Button></div>
    </form>
  )
}
