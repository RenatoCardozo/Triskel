'use client'
import Link from 'next/link'
import type { Me } from '@/lib/types'
import { fileUrl } from '@/lib/api'
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
export function ProfileSummary({ u, variant = 'summary' }: { u: Me; variant?: 'summary' | 'public' }) {
  const cover = fileUrl(u.coverUrl)
  const pub = variant === 'public'
  const brand = u.role === 'CREATOR' ? 'linear-gradient(135deg,#5fe0a1,#3cd4c7)' : u.role === 'AGENCY' ? 'linear-gradient(135deg,#f08a3c,#f7b25b)' : 'linear-gradient(135deg,#4c5cca,#7b8be8)'
  return (
    <section className="card overflow-hidden !p-0" aria-label="Resumo do perfil">
      <div className="relative h-[96px] overflow-hidden sm:h-36" style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: brand }}>
        {!cover && (
          <svg viewBox="0 0 380 96" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
            <circle cx="66" cy="10" r="12" fill="#fff" opacity=".18" /><circle cx="310" cy="14" r="26" fill="#fff" opacity=".18" />
            <path d="M0 74C60 50 120 52 190 66S320 80 380 58V96H0z" fill="#fff" opacity=".28" />
          </svg>
        )}
      </div>
      <div className="px-4 pb-4">
        <div className={pub ? 'relative -mt-[48px] flex flex-col items-center text-center' : 'relative -mt-[30px] flex items-start gap-3'}>
          <span className="avatar !rounded-[14px] border-[3px] border-white shadow" style={{ width: 76, height: 76, fontSize: 26, background: u.avatarUrl ? undefined : brand }}>
            {u.avatarUrl ? <img src={fileUrl(u.avatarUrl)!} alt={`Foto de ${u.name}`} /> : (
              <svg viewBox="0 0 24 24" width="46" height="46" aria-label={`Sem foto de ${u.name}`} role="img"><circle cx="12" cy="8.5" r="4.2" fill="#fff" /><path d="M3.5 22c0-5 3.8-8 8.5-8s8.5 3 8.5 8z" fill="#fff" /></svg>
            )}
          </span>
          <div className={pub ? 'mt-2 min-w-0' : 'min-w-0 pt-[34px]'}>
            <h2 className={pub ? 'text-[18px] font-extrabold text-ink' : 'truncate text-[17px] font-extrabold text-ink'}>{u.name}</h2><p className={pub ? 'cap' : 'cap truncate'}>{subtitleOf(u)}</p>
            {pub && u.role === 'CREATOR' && Number(u.profile.rating) > 0 && <p className="mt-1 text-[14px] font-semibold text-ink">★ {String(u.profile.rating).replace('.', ',')} · {u.profile.jobs} {u.profile.jobs === 1 ? 'trabalho' : 'trabalhos'}</p>}
            {pub && u.visible && <span className="pl mt-2">{u.role === 'CREATOR' ? 'Aberta a convites' : u.role === 'BUSINESS' ? 'Aceita candidaturas' : 'Aceita parcerias'}</span>}
          </div>
        </div>
        {pub ? null : <>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone={u.visible ? 'ok' : 'warn'}>{u.visible ? 'Perfil visível' : 'Perfil oculto'}</Pill>
          <Pill tone={u.verified ? 'ok' : 'warn'}>{u.verified ? 'E-mail validado' : 'E-mail pendente'}</Pill>
        </div>
        <Link href="/perfil" className="btn btn-outline btn-block mt-3">{u.complete ? 'Ver meu perfil' : 'Ver prévia do perfil'}</Link>
        </>}
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
