'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { SECTIONS, yearsSince } from '@/lib/profileFields'
import { brl } from '@/lib/format'
import { maskCPF } from '@/lib/masks'
import type { PField } from '@/lib/profileFields'
import type { Me, ProposalListItem } from '@/lib/types'
import { useMe } from '@/hooks/queries'
import { CompleteBanner, ProfileSummary } from '@/components/ProfileSummary'
import { Card, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title } from '@/components/ui'

function Val({ f, u }: { f: PField; u: Me }) {
  const v = f.k === '_valor' ? (u.profile.val?.reels ? brl(u.profile.val.reels) : '') : u.profile[f.k]
  if (f.kind === 'chips') return Array.isArray(v) && v.length ? <span className="flex flex-wrap gap-1.5">{v.map((x: string) => <Pill key={x} tone="ink">{x}</Pill>)}</span> : <em className="cap">não informado</em>
  if (f.k === 'cidade') return <>{[u.profile.cidade, u.profile.uf].filter(Boolean).join(', ') || <em className="cap">não informado</em>}</>
  return <>{v ? String(v) : <em className="cap">não informado</em>}</>
}

export default function PerfilPage() {
  const me = useMe()
  const props = useQuery({ queryKey: ['proposals', 'all'], queryFn: () => api<{ items: ProposalListItem[]; counts: { all: number; needsYou: number } }>('proposals?filter=all') })
  const port = useQuery({ queryKey: ['portfolio'], enabled: me.data?.role === 'CREATOR', queryFn: () => api<{ items: Array<{ id: string; title: string; description: string; views: string | null }> }>('me/portfolio') })
  if (me.isPending) return <PageSkeleton />
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />
  const u = me.data
  const aud = u.role === 'CREATOR' ? 'empresas e agências' : 'criadores'
  const age = yearsSince(u.profile.nasc), tempo = yearsSince(u.profile.fund)
  const counts = props.data?.counts
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title sub={u.visible ? `Seu perfil está visível para ${aud}.` : `Seu perfil está oculto para ${aud}.`}>Visualizar perfil</Title>
      <CompleteBanner u={u} />
      <ProfileSummary u={u} />
      {!u.complete && u.missing.length > 0 && <Note tone="warn">Falta preencher: {u.missing.join(', ')}.</Note>}
      {SECTIONS[u.role].map((s, i) => (
        <Card key={s.title} as="section" aria-labelledby={'s' + i}>
          <h2 id={'s' + i} className="h-sec mb-2">{s.title}</h2>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {i === 0 && u.role === 'CREATOR' && <><div><dt className="lbl">CPF</dt><dd className="font-semibold">{u.profile.cpf ? maskCPF(u.profile.cpf) : 'não informado'}</dd></div></>}
            {s.fields.filter((f) => f.k !== 'nome' && f.k !== 'uf' && f.k !== 'sobre' && f.kind !== 'chips').map((f) => <div key={f.k}><dt className="lbl">{f.label}</dt><dd className="font-semibold"><Val f={f} u={u} /></dd></div>)}
            {i === 0 && u.role === 'CREATOR' && age != null && <div><dt className="lbl">Idade</dt><dd className="font-semibold">{age} anos</dd></div>}
            {i === 0 && u.role !== 'CREATOR' && tempo != null && <div><dt className="lbl">Tempo de mercado</dt><dd className="font-semibold">{tempo} {tempo === 1 ? 'ano' : 'anos'}</dd></div>}
            {s.fields.filter((f) => f.kind === 'chips').map((f) => <div key={f.k} className="sm:col-span-2"><dt className="lbl mb-1">{f.label}</dt><dd><Val f={f} u={u} /></dd></div>)}
            {s.fields.filter((f) => f.k === 'sobre').map((f) => <div key={f.k} className="sm:col-span-2"><dt className="lbl">{f.label}</dt><dd className="font-semibold"><Val f={f} u={u} /></dd></div>)}
          </dl>
        </Card>
      ))}
      {u.role === 'CREATOR' && (
        <Card as="section" aria-labelledby="pf">
          <div className="mb-2 flex items-center justify-between"><h2 id="pf" className="h-sec">Portfólio</h2><Link href="/portfolio" className="link text-sm">Gerenciar</Link></div>
          {port.isPending ? <p className="cap">Carregando…</p> : port.data?.items.length ? <ul className="divide-y divide-line">{port.data.items.map((p) => <li key={p.id} className="py-2"><b className="block text-ink">{p.title}</b><span className="cap block">{p.description}</span>{p.views && <span className="text-xs font-bold text-tealtext">{p.views}</span>}</li>)}</ul> : <p className="cap">Você ainda não adicionou trabalhos ao portfólio.</p>}
        </Card>
      )}
      <Note>Toda negociação, contrato, entrega e pagamento acontecem dentro da Triskel. Telefone, e-mail, redes sociais e site não aparecem no perfil público: quem quiser falar com você envia uma proposta pela Triskel.</Note>
      <Card className="flex items-center justify-between gap-3"><div><h2 className="h-sec">Área de contatos</h2><p className="cap">{u.role === 'CREATOR' ? 'Empresas e agências falam com você aqui, por meio de propostas e mensagens.' : 'Os criadores respondem às suas propostas aqui.'} Nada de telefone, e-mail ou redes sociais: tudo fica registrado na Triskel.</p><p className="mt-1 text-sm font-bold text-ink">Conversas {counts?.all ?? '…'} · Aguardam você {counts?.needsYou ?? '…'}</p></div><LinkButton href="/contatos" variant="outline" size="sm">Abrir contatos</LinkButton></Card>
      <LinkButton href="/perfil/editar" block>Editar perfil</LinkButton>
    </div>
  )
}
