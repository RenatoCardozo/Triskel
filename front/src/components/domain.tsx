import type { ReactNode } from 'react'
import { brl, initials } from '@/lib/format'
import type { Compat, DeliveryState, ProposalStatus } from '@/lib/types'
import { Pill, type PillTone } from './ui'
import { Icon } from './Icon'

export const SAFETY = 'Toda a negociação, as mensagens e o contrato acontecem aqui na Triskel. Telefone, e-mail, links e redes sociais são bloqueados nas mensagens, e o pagamento só é protegido dentro da plataforma.'
export const SafetyNote = () => <p className="np flex gap-2"><Icon n="lock" size={18} className="mt-0.5 flex-none" /><span>{SAFETY}</span></p>

/** Valor / taxa / total. `side` define os rótulos: criador vê "Você recebe"; contratante vê "Valor ao criador". */
export function Money({ valueCents, feeCents, totalCents, side, note = true }: { valueCents: number; feeCents?: number; totalCents?: number; side: 'C' | 'K'; note?: boolean }) {
  const row = (l: string, v: number, strong = false) => <div className="flex items-baseline justify-between gap-3 py-1"><dt className={strong ? 'font-extrabold text-ink' : 'text-ink-2'}>{l}</dt><dd className={strong ? 'whitespace-nowrap text-xl font-extrabold text-ink' : 'whitespace-nowrap font-bold text-ink'}>{brl(v)}</dd></div>
  return (
    <div className="rounded-2xl bg-surface p-3">
      <dl>
        {row(side === 'C' ? 'Você recebe' : 'Valor ao criador', valueCents, side === 'C')}
        {feeCents != null && row(`Taxa Triskel (10%) · paga ${side === 'C' ? 'pelo contratante' : 'por você'}`, feeCents)}
        {totalCents != null && row(side === 'C' ? 'Custo total do contratante' : 'Total a pagar', totalCents, side === 'K')}
      </dl>
      {note && <p className="cap mt-1">{side === 'C' ? 'A taxa de 10% é paga pelo contratante e não desconta do que você recebe.' : 'A taxa de 10% é paga por você e não desconta do que o criador recebe.'}</p>}
    </div>
  )
}

export const Facts = ({ items, cols = 2 }: { items: Array<[string, ReactNode]>; cols?: 2 | 3 }) => (
  <dl className={`grid gap-x-6 gap-y-2.5 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} grid-cols-2`}>{items.map(([k, v]) => <div key={k}><dt className="lbl">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>)}</dl>
)

export function CompatBlock({ compat }: { compat: Compat | null | undefined }) {
  if (!compat || !compat.pct) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="pl pl-ink" title="Compatibilidade calculada pela Triskel">{compat.pct}% compatível</span>
      {compat.why.map((w) => <span key={w} className="pl pl-grey">{w}</span>)}
    </div>
  )
}
export const BrandAvatar = ({ name, size = 44 }: { name: string; size?: number }) => <span className="avatar !rounded-2xl" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">{initials(name)}</span>

export const PROP_STATUS: Record<ProposalStatus, [string, PillTone]> = {
  OPEN: ['Em negociação', 'ink'], ACCEPTED: ['Proposta aceita', 'ok'], CONTRACT: ['Contrato fechado', 'ok'], DECLINED: ['Sem acordo', 'grey'], CLOSED: ['Encerrada', 'grey'],
}
export const DEL_STATE: Record<DeliveryState, [string, PillTone]> = {
  PROD: ['Em produção', 'ink'], IA: ['Análise da IA', 'warn'], APROV: ['Aguardando aprovação', 'warn'], APROVADO: ['Aprovada · publicar', 'ok'], LIBERADO: ['Pagamento liberado', 'ok'],
}
export const StatePill = ({ s }: { s: DeliveryState }) => <Pill tone={DEL_STATE[s][1]}>{DEL_STATE[s][0]}</Pill>
export const ExclusivityText = (days: number) => (days ? `${days} dias` : 'Nenhuma')
export const imageUseFull = (u: string) => `${u} · Instagram e TikTok`
