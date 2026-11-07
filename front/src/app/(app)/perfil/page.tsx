'use client'
import { Fragment } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { SECTIONS, yearsSince } from '@/lib/profileFields'
import { brl } from '@/lib/format'
import { maskCPF } from '@/lib/masks'
import type { PField } from '@/lib/profileFields'
import type { Me, ProposalListItem } from '@/lib/types'
import { useMe } from '@/hooks/queries'
import { Icon } from '@/components/Icon'
import { CompleteBanner, ProfileSummary } from '@/components/ProfileSummary'
import { Card, ErrorState, LinkButton, Note, PageSkeleton, Pill, Title } from '@/components/ui'

function Val({ f, u }: { f: PField; u: Me }) {
  const v = f.k === '_valor' ? (u.profile.val?.reels ? brl(u.profile.val.reels) : '') : u.profile[f.k]
  if (f.kind === 'chips') return Array.isArray(v) && v.length ? <span className="flex flex-wrap gap-1.5">{v.map((x: string) => <span key={x} className="rounded-full bg-ok-bg px-3 py-[5px] text-[14px] font-semibold text-[#0b6b5d]">{x}</span>)}</span> : <em className="cap">não informado</em>
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
  const HIDDEN = new Set(['insta', 'tiktok', 'yt', 'site'])   // contatos não aparecem no perfil público (ver aviso abaixo)
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="border-b border-[#e3eef0] py-[10px] last:border-0"><dt className="text-[11px] font-bold uppercase tracking-[.03em] text-[#4b5dca]">{label}</dt><dd className="mt-[3px] text-[15px] font-medium leading-snug text-ink">{children}</dd></div>
  )
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Title>Visualizar perfil</Title>
      <p className={'flex items-center gap-2 rounded-[14px] px-4 py-[10px] text-[14px] font-semibold ' + (u.visible ? 'bg-ok-bg text-[#0b6b5d]' : 'bg-warn-bg text-[#8a4a10]')}>{u.visible ? '✓' : '•'} {u.visible ? `Seu perfil está visível para ${aud}.` : `Seu perfil está oculto para ${aud}.`}</p>
      <CompleteBanner u={u} />
      <ProfileSummary u={u} variant="public" />
      {!u.complete && u.missing.length > 0 && <Note tone="warn">Falta preencher: {u.missing.join(', ')}.</Note>}
      {SECTIONS[u.role].map((s, i) => {
        const fields = s.fields.filter((f) => f.k !== 'nome' && f.k !== 'uf' && !HIDDEN.has(f.k) && f.kind !== 'handle')
        if (!fields.length) return null
        return (
          <section key={s.title} aria-labelledby={'s' + i}>
            <h2 id={'s' + i} className="h-sec mb-2 mt-5">{s.title}</h2>
            <Card as="div" className="!px-4 !py-1">
              <dl>
                {i === 0 && u.role === 'CREATOR' && <Row label="CPF">{u.profile.cpf ? maskCPF(u.profile.cpf) : 'não informado'}</Row>}
                {fields.map((f) => (
                  <Fragment key={f.k}>
                    <Row label={f.label}><Val f={f} u={u} /></Row>
                    {f.k === 'genero' && age != null && <Row label="Idade">{age} anos</Row>}
                  </Fragment>
                ))}
                {i === 0 && u.role !== 'CREATOR' && tempo != null && <Row label="Tempo de mercado">{tempo} {tempo === 1 ? 'ano' : 'anos'}</Row>}
              </dl>
            </Card>
          </section>
        )
      })}
      {u.role === 'CREATOR' && (
        <section aria-labelledby="pf">
          <div className="mb-2 mt-5 flex items-center justify-between"><h2 id="pf" className="h-sec">Portfólio</h2><Link href="/portfolio" className="link text-sm">Gerenciar</Link></div>
          {port.isPending ? <p className="cap">Carregando…</p> : port.data?.items.length ? <ul className="space-y-3">{port.data.items.map((p) => <li key={p.id} className="card"><b className="block text-[16px] font-bold text-[#4c5dca]">{p.title}</b><span className="cap block">{p.description}</span>{p.views && <span className="text-[13px] font-bold text-teal">{p.views}</span>}</li>)}</ul> : <Card className="cap">Você ainda não adicionou trabalhos ao portfólio.</Card>}
        </section>
      )}
      <p className="np flex gap-2 !bg-[#eef1fc] !text-[#3f4fb8]"><Icon n="lock" size={18} className="mt-0.5 flex-none" /><span>Toda negociação, contrato, entrega e pagamento acontecem dentro da Triskel. Telefone, e-mail, redes sociais e site não aparecem no perfil público: quem quiser falar com você envia uma proposta pela Triskel.</span></p>
      <section aria-labelledby="ct">
        <h2 id="ct" className="h-sec mb-2 mt-5">Contatos</h2>
        <Card>
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#2dd4bf]"><Icon n="chat" size={17} />Área de contatos</h3>
          <p className="mt-2 text-[14px] leading-snug text-[#4c5dca]">{u.role === 'CREATOR' ? 'Empresas e agências falam com você aqui, por meio de propostas e mensagens.' : 'Os criadores respondem às suas propostas aqui.'} Nada de telefone, e-mail ou redes sociais: tudo fica registrado na Triskel.</p>
          <dl className="mt-3 text-[14px] text-[#4c5dca]">
            <div className="flex justify-between border-b border-[#e3eef0] py-2"><dt>Conversas</dt><dd className="font-semibold">{counts?.all ?? '…'}</dd></div>
            <div className="flex justify-between py-2"><dt>Aguardam você</dt><dd className="font-semibold">{counts?.needsYou ?? '…'}</dd></div>
          </dl>
        </Card>
      </section>
      <LinkButton href="/contatos" block>Abrir contatos</LinkButton>
      <LinkButton href="/perfil/editar" block>Editar perfil</LinkButton>
    </div>
  )
}
