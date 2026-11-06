'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { brl, plural, rating } from '@/lib/format'
import type { CampaignListItem, CreatorCard } from '@/lib/types'
import { useMe, useMeta } from '@/hooks/queries'
import { CompatBlock, SafetyNote } from '@/components/domain'
import { Avatar, Button, Card, Chips, EmptyState, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title } from '@/components/ui'
import { Select } from '@/components/ui/form'

const ORD: Array<[string, string]> = [['compat', 'Compatibilidade'], ['nota', 'Melhor nota'], ['valor', 'Menor valor'], ['trab', 'Mais trabalhos']]
export default function Page() { return <Suspense fallback={<PageSkeleton rows={3} />}><Criadores /></Suspense> }

function Criadores() {
  const router = useRouter(); const sp = useSearchParams()
  const me = useMe(); const meta = useMeta()
  const camps = useQuery({ queryKey: ['campaigns'], queryFn: () => api<{ items: CampaignListItem[] }>('campaigns') })
  const [camp, setCamp] = useState(sp.get('campanha') ?? ''); const [q, setQ] = useState(''); const [dq, setDq] = useState(''); const [nich, setNich] = useState<string[]>([]); const [porte, setPorte] = useState<string[]>([]); const [reg, setReg] = useState(''); const [nota, setNota] = useState(''); const [ord, setOrd] = useState('compat'); const [open, setOpen] = useState(false); const [pick, setPick] = useState<string[]>([])
  useEffect(() => { const t = setTimeout(() => setDq(q.trim()), 300); return () => clearTimeout(t) }, [q])
  const params = new URLSearchParams(); if (camp) params.set('campaignId', camp); if (dq) params.set('q', dq); if (nich.length) params.set('nich', nich.join(',')); if (porte.length) params.set('porte', porte.join(',')); if (reg) params.set('reg', reg); if (nota) params.set('nota', nota); params.set('ord', camp && ord === 'compat' ? 'compat' : ord)
  const list = useQuery({ queryKey: ['creators', params.toString()], queryFn: () => api<{ items: CreatorCard[]; total: number; campaign: { id: string; name: string; valueCents: number } | null }>('creators?' + params), placeholderData: (p) => p })
  if (me.isPending || meta.isPending || camps.isPending) return <PageSkeleton rows={3} />
  if (me.isError || meta.isError || !me.data || !meta.data) return <ErrorState error={me.error ?? meta.error} />
  const agency = me.data.role === 'AGENCY'
  const open_ = (camps.data?.items ?? []).filter((c) => c.status === 'OPEN')
  const active = nich.length + porte.length + (reg ? 1 : 0) + (nota ? 1 : 0) + (dq ? 1 : 0)
  const reset = () => { setNich([]); setPorte([]); setReg(''); setNota(''); setQ('') }
  const qs = camp ? `?campanha=${camp}` : ''
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Title sub={list.data?.campaign ? `Campanha: ${list.data.campaign.name} · ${brl(list.data.campaign.valueCents)} por vídeo` : 'Escolha uma campanha para ver compatibilidade e conflitos de exclusividade.'}>Buscar criadores</Title>
      <Card className="space-y-3">
        <Select label="Campanha" options={open_.map((c) => c.name)} placeholder="Sem campanha (só navegar)" value={open_.find((c) => c.id === camp)?.name ?? ''} onChange={(e) => { const c = open_.find((x) => x.name === e.target.value); setCamp(c?.id ?? ''); setPick([]); router.replace(c ? `/criadores?campanha=${c.id}` : '/criadores') }} />
        {open_.length === 0 && <Note>Você ainda não tem campanha aberta. <Link href="/campanhas/nova" className="link">Criar campanha</Link> para poder enviar propostas.</Note>}
        <form role="search" onSubmit={(e) => e.preventDefault()}><label className="sr-only" htmlFor="bq">Buscar criador</label><input id="bq" className="inp" type="search" placeholder="Buscar por nome, nicho ou cidade" maxLength={60} value={q} onChange={(e) => setQ(e.target.value)} /></form>
        <div className="flex flex-wrap items-center justify-between gap-2"><Button variant="outline" size="sm" aria-expanded={open} aria-controls="fl" onClick={() => setOpen((s) => !s)}>Filtros{active ? ` (${active})` : ''}</Button>{active > 0 && <Button variant="ghost" size="sm" onClick={reset}>Limpar filtros</Button>}</div>
        {open && (
          <div id="fl" className="space-y-3 border-t border-line pt-3">
            <div><span className="mb-1 block text-[13px] font-bold text-ink">Nichos</span><Chips label="Nichos" options={meta.data.options.nichos} value={nich} onChange={setNich} /></div>
            <div><span className="mb-1 block text-[13px] font-bold text-ink">Porte</span><Chips label="Porte" options={meta.data.options.porteCr} value={porte} onChange={setPorte} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Select label="Localização" options={meta.data.options.reg} placeholder="Qualquer" value={reg} onChange={(e) => setReg(e.target.value)} /><Select label="Nota mínima" options={meta.data.options.nota.filter((n: string) => n !== 'Sem mínimo')} placeholder="Sem mínimo" value={nota} onChange={(e) => setNota(e.target.value)} /><Select label="Ordenar por" options={ORD.map((o) => o[1])} placeholder="Compatibilidade" value={ORD.find((o) => o[0] === ord)![1]} onChange={(e) => setOrd(ORD.find((o) => o[1] === e.target.value)?.[0] ?? 'compat')} /></div>
          </div>
        )}
      </Card>
      {list.isPending ? <PageSkeleton rows={3} /> : list.isError ? <ErrorState error={list.error} onRetry={() => list.refetch()} /> : (
        <>
          <p className="cap" aria-live="polite">{plural(list.data.total, 'criador encontrado', 'criadores encontrados')} · ordenados por {ORD.find((o) => o[0] === ord)![1].toLowerCase()}{active ? ` · ${plural(active, 'filtro ativo', 'filtros ativos')}` : ''}</p>
          {list.data.items.length === 0 ? <EmptyState title="Nenhum criador com esses filtros" action={<Button variant="outline" onClick={reset}>Limpar filtros</Button>}>Tente tirar um filtro. Só aparecem criadores com perfil completo e e-mail validado.</EmptyState> : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">{list.data.items.map((c) => {
              const blocked = !!c.conflict, can = !!camp && !blocked && !c.proposalId
              return (
                <li key={c.id}><Card className="flex h-full flex-col gap-2.5">
                  <div className="flex items-start gap-3"><Avatar name={c.name} src={c.avatarUrl} size={52} /><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-extrabold text-ink">{c.name}</h2><p className="cap">{c.niches.join(', ')}{c.city ? ` · ${c.city}` : ''}</p></div>{camp && <span className="pl pl-ink !text-sm">{c.compat.pct}%</span>}</div>
                  <p className="text-sm font-bold text-ink">★ {rating(c.rating)} · {plural(c.jobs, 'trabalho', 'trabalhos')}</p>
                  <p className="cap">{c.sizeBand}{c.followers ? ` · ${c.followers} seg.` : ''}</p>
                  {c.vminCents != null && <p className="text-sm font-semibold text-tealtext">{brl(c.vminCents)}{c.vmaxCents ? `–${brl(c.vmaxCents)}` : ''} por vídeo</p>}
                  {camp && <CompatBlock compat={c.compat} />}
                  {c.conflict && <Note tone="warn" role="alert"><b>Conflito de exclusividade.</b> {c.conflict}</Note>}
                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <LinkButton href={`/criadores/${c.id}${qs}`} variant="outline" size="sm">Ver perfil</LinkButton>
                    {c.proposalId ? <LinkButton href={`/contatos/${c.proposalId}`} size="sm">Ver conversa</LinkButton> : blocked ? <Pill tone="warn">Indisponível no período</Pill> : camp ? (agency ? <label className="chip" aria-pressed={pick.includes(c.id)}><input type="checkbox" className="sr-only" checked={pick.includes(c.id)} onChange={(e) => setPick(e.target.checked ? [...pick, c.id] : pick.filter((x) => x !== c.id))} />{pick.includes(c.id) ? '✓ Selecionado' : 'Selecionar'}</label> : <LinkButton size="sm" href={`/criadores/proposta?campanha=${camp}&c=${c.id}`}>Enviar proposta</LinkButton>) : null}
                  </div>
                  {!can && !c.proposalId && !blocked && !camp && <p className="cap">Escolha uma campanha para enviar proposta.</p>}
                </Card></li>
              )
            })}</ul>
          )}
        </>
      )}
      {agency && pick.length > 0 && <div className="sticky bottom-20 z-20 lg:bottom-4"><LinkButton block href={`/criadores/proposta?campanha=${camp}&c=${pick.join(',')}`}>Enviar proposta a {plural(pick.length, 'criador', 'criadores')}</LinkButton></div>}
      <SafetyNote />
    </div>
  )
}
