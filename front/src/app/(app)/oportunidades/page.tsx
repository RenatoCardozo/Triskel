'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { brl, fdate, plural } from '@/lib/format'
import type { Opportunity } from '@/lib/types'
import { useMe, useMeta } from '@/hooks/queries'
import { BrandAvatar, CompatBlock, SafetyNote } from '@/components/domain'
import { Button, Card, Chips, EmptyState, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title } from '@/components/ui'
import { Select } from '@/components/ui/form'

const ORD: Array<[string, string]> = [['compat', 'Compatibilidade'], ['valor', 'Maior valor'], ['prazo', 'Prazo mais próximo']]

export default function Oportunidades() {
  const me = useMe(); const meta = useMeta()
  const [q, setQ] = useState(''); const [dq, setDq] = useState(''); const [nich, setNich] = useState<string[] | null>(null); const [reg, setReg] = useState<string | null>(null); const [ord, setOrd] = useState('compat'); const [open, setOpen] = useState(false)
  useEffect(() => { const t = setTimeout(() => setDq(q.trim()), 300); return () => clearTimeout(t) }, [q])
  const defNich: string[] = me.data?.profile.nichos ?? [], defReg: string = me.data?.profile.pReg ?? ''
  const nichV = nich ?? defNich, regV = reg ?? defReg
  const params = new URLSearchParams(); if (dq) params.set('q', dq); if (nichV.length) params.set('nich', nichV.join(',')); if (regV) params.set('reg', regV); params.set('ord', ord)
  const list = useQuery({ queryKey: ['opps', params.toString()], enabled: !!me.data, queryFn: () => api<{ items: Opportunity[]; total: number }>('opportunities?' + params), placeholderData: (p) => p })
  const active = (nichV.length ? 1 : 0) + (regV ? 1 : 0) + (dq ? 1 : 0)
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Title sub="Campanhas abertas. Candidate-se e converse com a empresa ou agência só pela Triskel.">Buscar oportunidades</Title>
      <Card className="space-y-3">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="flex gap-2"><label className="sr-only" htmlFor="busca">Buscar campanha</label><input id="busca" className="inp" type="search" placeholder="Buscar por campanha, marca ou nicho" value={q} onChange={(e) => setQ(e.target.value)} maxLength={60} /></form>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" size="sm" aria-expanded={open} aria-controls="filtros" onClick={() => setOpen((s) => !s)}>Filtros{active ? ` (${active})` : ''}</Button>
          <p className="cap">{regV || nichV.length ? [nichV.join(', '), regV].filter(Boolean).join(' · ') : 'Sem filtros'}</p>
        </div>
        {open && meta.data && (
          <div id="filtros" className="space-y-3 border-t border-line pt-3">
            <div><span className="flabel mb-1 block text-[13px] font-bold text-ink">Nichos</span><Chips label="Nichos" options={meta.data.options.nichos} value={nichV} onChange={setNich} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Select label="Região" options={meta.data.options.reg} placeholder="Qualquer região" value={regV} onChange={(e) => setReg(e.target.value)} /><Select label="Ordenar por" options={ORD.map((o) => o[1])} placeholder="Compatibilidade" value={ORD.find((o) => o[0] === ord)![1]} onChange={(e) => setOrd(ORD.find((o) => o[1] === e.target.value)?.[0] ?? 'compat')} /></div>
            <Button variant="ghost" size="sm" onClick={() => { setNich([]); setReg(''); setQ('') }}>Limpar filtros</Button>
          </div>
        )}
      </Card>
      {list.isPending || me.isPending ? <PageSkeleton rows={3} /> : list.isError ? <ErrorState error={list.error} onRetry={() => list.refetch()} /> : (
        <>
          <p className="cap" aria-live="polite">{plural(list.data.total, 'campanha encontrada', 'campanhas encontradas')} · ordenadas por {ORD.find((o) => o[0] === ord)![1].toLowerCase()}{active ? ` · ${plural(active, 'filtro ativo', 'filtros ativos')}` : ''}</p>
          {list.data.items.length === 0 ? <EmptyState title="Nenhuma campanha com esses filtros" action={<Button variant="outline" onClick={() => { setNich([]); setReg(''); setQ('') }}>Limpar filtros</Button>}>Tente tirar um filtro ou buscar outro nicho.</EmptyState> : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">{list.data.items.map((o) => (
              <li key={o.id}>
                <Card className="flex h-full flex-col gap-3">
                  <div className="flex items-start gap-3"><BrandAvatar name={o.brandName} /><div className="min-w-0 flex-1"><h2 className="text-lg font-extrabold leading-tight text-ink">{o.name}</h2><p className="cap">{o.brandName}{o.city ? ` · ${o.city}` : ''}</p></div><span className="pl pl-ink !text-sm">{o.compat.pct}%</span></div>
                  <p className="text-sm font-semibold text-tealtext">{o.niches.join(', ')}</p>
                  <p className="cap">{plural(o.videos, 'vídeo', 'vídeos')} · {o.format} · entrega até {fdate(o.deliveryDate)}</p>
                  <div className="rounded-2xl bg-surface p-3"><div className="flex items-baseline justify-between"><span className="text-ink-2">Você recebe</span><b className="text-xl text-ink">{brl(o.youReceiveCents)}</b></div><div className="cap flex justify-between"><span>Taxa Triskel (10%) · paga pela empresa</span><span>{brl(o.feeCents)}</span></div></div>
                  <div className="flex flex-wrap gap-1.5">{o.compat.why.map((w) => <span key={w} className="pl pl-grey">{w}</span>)}{o.proposalId && <Pill tone="warn">Proposta em andamento</Pill>}{o.exclusiveDays > 0 && <Pill tone="warn">Exclusividade de {o.exclusiveDays} dias</Pill>}</div>
                  {o.conflict && <Note tone="warn">{o.conflict}</Note>}
                  <div className="mt-auto"><LinkButton block variant={o.proposalId ? 'outline' : 'primary'} href={o.proposalId ? `/contatos/${o.proposalId}` : `/oportunidades/${o.id}`}>{o.proposalId ? 'Ver conversa' : 'Ver e candidatar-se'}</LinkButton></div>
                </Card>
              </li>
            ))}</ul>
          )}
        </>
      )}
      <SafetyNote />
    </div>
  )
}
