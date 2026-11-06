'use client'
import Link from 'next/link'
import type { Me } from '@/lib/types'
import { fileUrl } from '@/lib/api'
import { initials } from '@/lib/format'
import { Icon } from './Icon'
import { Pill } from './ui'

export function subtitleOf(u: Me) {
  const p = u.profile
  const place = [p.cidade, p.uf].filter(Boolean).join(', ')
  if (!u.complete) return 'Perfil em construção'
  if (u.role === 'CREATOR') {
    const nets = [p.insta && 'Instagram', p.tiktok && 'TikTok', p.yt && 'YouTube'].filter(Boolean) as string[]
    return [nets.length > 1 ? nets.slice(0, -1).join(', ') + ' e ' + nets.at(-1) : nets[0], place].filter(Boolean).join(' · ')
  }
  return [u.role === 'AGENCY' ? 'Agência de marketing' : p.seg, place].filter(Boolean).join(' · ')
}

/** Cartão-resumo do protótipo (SUMM): capa, foto, nome, situação do perfil e atalho. */
export function ProfileSummary({ u }: { u: Me }) {
  const cover = fileUrl(u.coverUrl)
  return (
    <section className="card overflow-hidden !p-0" aria-label="Resumo do perfil">
      <div className="relative h-28 bg-gradient-to-br from-mint to-teal-2 sm:h-36" style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        {!cover && <span className="absolute inset-0 grid place-items-center text-sm font-bold text-white/90">Sem foto de capa</span>}
      </div>
      <div className="px-4 pb-4">
        <div className="relative -mt-9 flex items-start gap-3">
          <span className="avatar !rounded-2xl border-[3px] border-white shadow" style={{ width: 72, height: 72, fontSize: 26 }}>
            {u.avatarUrl ? <img src={fileUrl(u.avatarUrl)!} alt={`Foto de ${u.name}`} /> : initials(u.name)}
          </span>
          <div className="min-w-0 pt-10"><h2 className="truncate text-xl font-extrabold text-ink">{u.name}</h2><p className="cap truncate">{subtitleOf(u)}</p></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone={u.visible ? 'ok' : 'warn'}>{u.visible ? 'Perfil visível' : 'Perfil oculto'}</Pill>
          <Pill tone={u.verified ? 'ok' : 'warn'}>{u.verified ? 'E-mail validado' : 'E-mail pendente'}</Pill>
        </div>
        <Link href="/perfil" className="btn btn-outline btn-block mt-3">{u.complete ? 'Ver meu perfil' : 'Ver prévia do perfil'}</Link>
      </div>
    </section>
  )
}

/** Banner "Complete seu perfil" (BNR): 3 etapas, some quando perfil completo e e-mail validado. */
export function CompleteBanner({ u }: { u: Pick<Me, 'role' | 'complete' | 'verified'> }) {
  if (u.complete && u.verified) return null
  const done = 1 + (u.verified ? 1 : 0) + (u.complete ? 1 : 0), pct = Math.round((done / 3) * 100)
  const aud = u.role === 'CREATOR' ? 'empresas e agências' : 'criadores'
  const row = (ok: boolean, label: string, cta: string, href: string) => ok
    ? <div className="flex items-center gap-2 text-sm font-bold text-tealtext"><span className="grid h-5 w-5 place-items-center rounded-full bg-teal-2 text-white"><Icon n="check" size={13} strokeWidth={3} /></span>{label}</div>
    : <Link href={href} className="flex items-center gap-2 text-sm font-bold text-ink no-underline"><span className="h-5 w-5 rounded-full border-2 border-teal-2" />{label}<em className="ml-auto text-xs not-italic text-tealtext">{cta} ›</em></Link>
  return (
    <section className="rounded-[20px] border-2 border-dashed border-teal-2 bg-white p-4" aria-label="Complete seu perfil">
      <b className="text-ink">{u.complete ? 'Falta validar o e-mail' : u.verified ? 'Complete o seu perfil' : 'Deixe o seu perfil pronto'}</b>
      <p className="cap mt-0.5">Seu perfil só aparece para {aud} depois de completar as informações e validar o e-mail.</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-page" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct}% concluído`}><i className="block h-full rounded-full bg-gradient-to-r from-teal-2 to-mint" style={{ width: pct + '%' }} /></div>
      <small className="cap">{pct}% concluído</small>
      <div className="mt-2 space-y-2">{row(true, 'Conta criada', '', '')}{row(u.verified, 'Validar e-mail', 'Validar', '/perfil/validar-email')}{row(u.complete, 'Completar perfil (fotos e informações)', 'Completar', '/perfil/editar')}</div>
    </section>
  )
}
