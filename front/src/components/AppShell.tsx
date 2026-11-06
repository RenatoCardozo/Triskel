'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authCall } from '@/lib/api'
import { menuFor, roleLabel, type MenuItem } from '@/lib/menu'
import { useMe } from '@/hooks/queries'
import { Avatar, ErrorState, PageSkeleton } from './ui'
import { Icon, type IconName } from './Icon'
import { Logo } from './Logo'

const active = (path: string, href: string) => (href === '/painel' || href === '/perfil' ? path === href : path === href || path.startsWith(href + '/'))
const isProfile = (path: string) => path === '/perfil' || path.startsWith('/perfil/')

function NavList({ items, path, onNav, unread }: { items: MenuItem[]; path: string; onNav?: () => void; unread?: number }) {
  return (
    <ul className="space-y-1">
      {items.map((it) => {
        const on = it.children ? isProfile(path) : active(path, it.href)
        return (
          <li key={it.href}>
            <Link href={it.href} onClick={onNav} aria-current={on && !it.children ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-bold no-underline ${on ? 'bg-ok-bg text-tealtext' : 'text-ink hover:bg-white'}`}>
              <Icon n={it.icon as IconName} size={20} />{it.label}
              {it.href === '/contatos' && unread ? <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-teal-2 px-1.5 text-[11px] text-white">{unread}</span> : null}
            </Link>
            {it.children && on && (
              <ul className="mb-1 ml-9 mt-1 space-y-0.5 border-l-2 border-line pl-3">
                {it.children.map((c) => <li key={c.href}><Link href={c.href} onClick={onNav} aria-current={path === c.href ? 'page' : undefined} className={`block rounded-xl px-2.5 py-1.5 text-sm font-semibold no-underline ${path === c.href ? 'text-tealtext' : 'text-ink-2 hover:text-ink'}`}>{c.label}</Link></li>)}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname(); const router = useRouter(); const qc = useQueryClient()
  const me = useMe()
  const [open, setOpen] = useState(false)
  const [out, setOut] = useState(false)
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
  const bottom: Array<{ href: string; label: string; icon: IconName }> = [
    { href: '/painel', label: 'Painel', icon: 'grid' },
    { href: u.role === 'CREATOR' ? '/oportunidades' : '/criadores', label: 'Buscar', icon: 'search' },
    { href: '/contatos', label: 'Contatos', icon: 'chat' },
    { href: '/entregas', label: 'Entregas', icon: 'check' },
  ]
  const who = (
    <div className="flex items-center gap-3 px-1">
      <Avatar name={u.name} src={u.avatarUrl} size={42} />
      <div className="min-w-0"><b className="block truncate text-sm text-ink">{u.name}</b><span className="cap">{roleLabel(u.role)} · ID {u.publicId}</span></div>
    </div>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="hidden border-r border-line bg-page/60 lg:block" aria-label="Menu principal">
        <div className="sticky top-0 flex h-screen flex-col gap-4 overflow-y-auto p-4">
          <div className="px-2 pt-1"><Logo href="/painel" h={48} /></div>
          {who}
          <nav aria-label="Principal" className="flex-1"><NavList items={items} path={path} /></nav>
          <button onClick={logout} disabled={out} className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-bold text-ink hover:bg-white"><Icon n="out" size={20} />{out ? 'Saindo…' : 'Sair'}</button>
        </div>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-10">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <Logo href="/painel" h={40} />
          <button onClick={() => setOpen(true)} aria-label="Abrir menu" aria-expanded={open} aria-controls="menu-drawer" className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-ok-bg">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </header>
        <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-5xl px-4 py-5 outline-none lg:px-8 lg:py-8">{children}</main>
      </div>

      <nav aria-label="Navegação rápida" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {bottom.map((b) => {
          const on = active(path, b.href)
          return <Link key={b.href} href={b.href} aria-current={on ? 'page' : undefined} className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[11.5px] font-bold no-underline ${on ? 'text-tealtext' : 'text-ink-2'}`}><Icon n={b.icon} size={22} />{b.label}</Link>
        })}
        <button onClick={() => setOpen(true)} className="flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[11.5px] font-bold text-ink-2"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="19" cy="12" r="1.2" /></svg>Mais</button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-[#1e2a5c66]" onClick={() => setOpen(false)} />
          <div id="menu-drawer" className="absolute inset-y-0 right-0 flex w-[84%] max-w-sm flex-col gap-4 overflow-y-auto bg-surface p-4 shadow-2xl">
            <div className="flex items-center justify-between">{who}<button onClick={() => setOpen(false)} aria-label="Fechar menu" className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-white"><Icon n="xx" /></button></div>
            <nav aria-label="Menu" className="flex-1"><NavList items={items} path={path} onNav={() => setOpen(false)} /></nav>
            <button onClick={logout} disabled={out} className="btn btn-outline btn-block"><Icon n="out" size={18} />{out ? 'Saindo…' : 'Sair'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
