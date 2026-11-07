'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, authCall, fileUrl } from '@/lib/api'
import { menuFor, type MenuItem } from '@/lib/menu'
import { useMe } from '@/hooks/queries'
import type { ProposalListItem } from '@/lib/types'
import { ErrorState, PageSkeleton } from './ui'
import { Icon, type IconName } from './Icon'
import { Logo } from './Logo'

const active = (path: string, href: string) => (href === '/painel' || href === '/perfil' ? path === href : path === href || path.startsWith(href + '/'))
const isProfile = (path: string) => path === '/perfil' || path.startsWith('/perfil/')
const idLabel = (r: string) => (r === 'CREATOR' ? 'ID do creator' : r === 'BUSINESS' ? 'ID do comércio' : 'ID da agência')
const initialsOf = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]!.toUpperCase()).join('')

/** Hambúrguer do Figma (50x50, três barras de 38x5). */
const Burger = () => (
  <svg width="50" height="50" viewBox="0 0 50 50" aria-hidden="true">
    {[14, 23, 32].map((y) => <rect key={y} x="6" y={y} width="38" height="5" rx="2.5" fill="#4b5dca" />)}
  </svg>
)

/** Painel do menu (Figma "Menu" 247 px): cabeçalho verde com foto, nome e ID mascarado; itens de 30 px; Sair no fim. */
function MenuPanel({ items, path, onNav, onLogout, out, name, role, publicId, avatarUrl, unread }: {
  items: MenuItem[]; path: string; onNav?: () => void; onLogout: () => void; out: boolean
  name: string; role: string; publicId: string; avatarUrl?: string | null; unread: number
}) {
  const [show, setShow] = useState(false)
  const [sub, setSub] = useState(isProfile(path))
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (isProfile(path)) setSub(true) }, [path])
  const av = fileUrl(avatarUrl)
  async function copy() { try { await navigator.clipboard.writeText(publicId); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* sem permissão da área de transferência */ } }
  return (
    <div className="tk-menu">
      <div className="tk-mh">
        <div className="tk-av" style={av ? { backgroundImage: `url(${av})` } : undefined} aria-hidden="true">{av ? '' : initialsOf(name)}</div>
        <div className="tk-mt">
          <b className={name.length > 16 ? 'lo' : ''}>{name}</b>
          <div className="ir">
            <small aria-live="polite">{copied ? 'ID copiado' : `${idLabel(role)}: ${show ? publicId : '********'}`}</small>
            <button type="button" className="tk-ib" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar ID' : 'Mostrar ID'}><Icon n={show ? 'eye' : 'eyeoff'} size={14} strokeWidth={2} /></button>
            <button type="button" className="tk-ib" onClick={copy} aria-label="Copiar ID"><Icon n="copy" size={14} strokeWidth={2} /></button>
          </div>
        </div>
      </div>
      <nav className="tk-ml" aria-label="Menu principal">
        {items.map((it) => {
          if (it.children) {
            const on = isProfile(path)
            return (
              <div key={it.href}>
                <button type="button" className={`tk-mi${on ? ' on' : ''}`} aria-expanded={sub} aria-controls="tk-sub-perfil" onClick={() => setSub((v) => !v)}>
                  <Icon n={it.icon as IconName} size={20} /><span>{it.label}</span><span className="cv" aria-hidden="true"><Icon n="up" size={22} strokeWidth={2} /></span>
                </button>
                <div id="tk-sub-perfil" className={`tk-sub${sub ? ' open' : ''}`}>
                  {it.children.map((c) => <Link key={c.href} href={c.href} onClick={onNav} tabIndex={sub ? 0 : -1} aria-current={path === c.href ? 'page' : undefined} className={`tk-si${path === c.href ? ' on' : ''}`}>{c.label}</Link>)}
                </div>
              </div>
            )
          }
          const on = active(path, it.href)
          return (
            <Link key={it.href} href={it.href} onClick={onNav} aria-current={on ? 'page' : undefined} className={`tk-mi${on ? ' on' : ''}`}>
              <Icon n={it.icon as IconName} size={20} /><span>{it.label}</span>
              {it.href === '/contatos' && unread > 0 ? <em className="tk-bdg" aria-label={`${unread} novas`}>{unread}</em> : null}
            </Link>
          )
        })}
        <button type="button" className="tk-mi" onClick={onLogout} disabled={out}><Icon n="out" size={20} /><span>{out ? 'Saindo…' : 'Sair'}</span></button>
      </nav>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname(); const router = useRouter(); const qc = useQueryClient()
  const me = useMe()
  const [open, setOpen] = useState(false)
  const [out, setOut] = useState(false)
  const props = useQuery({ queryKey: ['proposals', 'all'], enabled: !!me.data, refetchInterval: 30_000, queryFn: () => api<{ items: ProposalListItem[] }>('proposals?filter=all') })
  const unread = props.data ? props.data.items.filter((p) => p.unread).length : 0
  useEffect(() => { setOpen(false) }, [path])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' ; return () => { document.body.style.overflow = '' } }, [open])
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [open])

  async function logout() {
    setOut(true)
    try { await authCall('logout') } catch { /* cookies já são limpos pelo servidor */ }
    qc.clear(); router.replace('/login'); router.refresh()
  }

  if (me.isPending) return <div className="mx-auto max-w-3xl p-6"><PageSkeleton /></div>
  if (me.isError || !me.data) return <div className="mx-auto max-w-md p-6"><ErrorState error={me.error} onRetry={() => me.refetch()} /></div>
  const u = me.data
  const items = menuFor(u.role)
  const panel = (onNav?: () => void) => <MenuPanel items={items} path={path} onNav={onNav} onLogout={logout} out={out} name={u.name} role={u.role} publicId={u.publicId} avatarUrl={u.avatarUrl} unread={unread} />

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[247px_1fr]">
      <aside className="hidden border-r border-line bg-white lg:block" aria-label="Menu principal">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <div className="px-3 pb-2 pt-5"><Logo href="/painel" h={48} /></div>
          {panel()}
        </div>
      </aside>

      <div className="min-w-0 pb-10">
        <header className="tk-hd lg:hidden">
          <div className="tk-hd-in"><Logo href="/painel" h={64} /></div>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Abrir menu" aria-haspopup="dialog" aria-expanded={open} aria-controls="menu-drawer" className="tk-burger"><Burger /></button>
        </header>
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-[640px] px-4 py-4 outline-none lg:max-w-5xl lg:px-8 lg:py-8">{children}</main>
      </div>

      {open && (
        <div className="tk-dr lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="tk-ov" onClick={() => setOpen(false)} />
          <aside id="menu-drawer" className="tk-drawer">{panel(() => setOpen(false))}</aside>
        </div>
      )}
    </div>
  )
}
