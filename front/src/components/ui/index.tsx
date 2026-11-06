'use client'
import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { initials } from '@/lib/format'
import { fileUrl } from '@/lib/api'
import { Icon } from '../Icon'

type BtnProps = { variant?: 'primary' | 'outline' | 'ghost' | 'danger'; size?: 'md' | 'sm'; block?: boolean; loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>
export function Button({ variant = 'primary', size = 'md', block, loading, className = '', children, disabled, type = 'button', ...rest }: BtnProps) {
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined}
      className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${block ? 'btn-block' : ''} ${className}`} {...rest}>
      {loading && <Spinner />}{children}
    </button>
  )
}
export function LinkButton({ href, variant = 'primary', size = 'md', block, className = '', children, ...rest }: { href: string; variant?: BtnProps['variant']; size?: 'md' | 'sm'; block?: boolean; className?: string; children: ReactNode } & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  return <Link href={href} className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${block ? 'btn-block' : ''} ${className}`} {...rest}>{children}</Link>
}
export function Spinner({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" fill="none" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
}

export const Card = ({ children, className = '', as: T = 'div', ...r }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' } & React.HTMLAttributes<HTMLElement>) => <T className={`card ${className}`} {...(r as object)}>{children}</T>
export type PillTone = 'ok' | 'warn' | 'grey' | 'danger' | 'ink'
export const Pill = ({ tone = 'ok', children }: { tone?: PillTone; children: ReactNode }) => <span className={`pl ${tone === 'ok' ? '' : 'pl-' + tone}`}>{children}</span>
export const Note = ({ tone = 'ink', children, className = '', role }: { tone?: 'ink' | 'warn' | 'danger' | 'ok'; children: ReactNode; className?: string; role?: string }) => <div role={role} className={`np ${tone === 'ink' ? '' : 'np-' + tone} ${className}`}>{children}</div>
export const Kpi = ({ value, label, hint }: { value: string; label: string; hint?: string }) => <div className="kpi"><b>{value}</b><span>{label}</span>{hint && <i>{hint}</i>}</div>

export function Avatar({ name, src, size = 44 }: { name: string; src?: string | null; size?: number }) {
  const u = fileUrl(src)
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden={u ? undefined : true}>{u ? <img src={u} alt={`Foto de ${name}`} /> : initials(name)}</span>
}
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.round(value)
  return <span aria-label={`Nota ${value.toString().replace('.', ',')} de 5`} className="inline-flex" style={{ color: '#f5b301' }}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} n="star" size={size} strokeWidth={1.6} style={{ fill: i <= full ? 'currentColor' : 'none', color: i <= full ? '#f5b301' : '#cfd6e4' }} />)}</span>
}
export const Skeleton = ({ h = 16, w = '100%', className = '' }: { h?: number; w?: number | string; className?: string }) => <div className={`skeleton ${className}`} style={{ height: h, width: w }} aria-hidden="true" />
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return <div role="status" aria-label="Carregando" className="space-y-3"><span className="sr-only">Carregando…</span><Skeleton h={28} w="50%" />{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} h={92} />)}</div>
}
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return <div className="card text-center py-8"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-ok-bg text-tealtext"><Icon n="search" /></div><h3 className="h-sec">{title}</h3>{children && <p className="cap mt-1 max-w-md mx-auto">{children}</p>}{action && <div className="mt-4 flex justify-center">{action}</div>}</div>
}
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const msg = (error as Error)?.message || 'Algo deu errado.'
  return <div role="alert" className="card text-center py-8"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-danger-bg text-danger"><Icon n="xx" /></div><h3 className="h-sec">Não deu certo</h3><p className="cap mt-1">{msg}</p>{onRetry && <div className="mt-4 flex justify-center"><Button variant="outline" onClick={onRetry}>Tentar de novo</Button></div>}</div>
}
export function Title({ children, sub, action }: { children: ReactNode; sub?: ReactNode; action?: ReactNode }) { return <header className="mb-4 flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h1 className="h-title">{children}</h1>{sub && <p className="h-sub mt-1">{sub}</p>}</div>{action}</header> }
export function BackLink({ href, children = 'Voltar' }: { href: string; children?: ReactNode }) { return <Link href={href} className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-ink-2 no-underline hover:text-ink"><Icon n="back" size={18} />{children}</Link> }

export function Chips({ options, value, onChange, multi = true, label, max }: { options: readonly string[]; value: string[] | string; onChange: (v: any) => void; multi?: boolean; label?: string; max?: number }) {
  const sel = Array.isArray(value) ? value : value ? [value] : []
  const toggle = (o: string) => {
    if (!multi) return onChange(sel[0] === o ? '' : o)
    onChange(sel.includes(o) ? sel.filter((x) => x !== o) : max && sel.length >= max ? sel : [...sel, o])
  }
  return <div role="group" aria-label={label} className="flex flex-wrap gap-2">{options.map((o) => <button key={o} type="button" className="chip" aria-pressed={sel.includes(o)} onClick={() => toggle(o)}>{o}</button>)}</div>
}
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: Array<[T, string]>; value: T; onChange: (v: T) => void; label: string }) {
  return <div role="tablist" aria-label={label} className="flex flex-wrap gap-1 rounded-full bg-page p-1">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={value === k} className="tab" onClick={() => onChange(k)}>{l}</button>)}</div>
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const id = useId(); const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey); document.body.style.overflow = 'hidden'
    setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus],input,textarea,select,button')?.focus(), 30)
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus() }
  }, [open, onClose])
  if (!open || typeof document === 'undefined') return null
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center bg-[#1e2a5c66] p-0 sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className="max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <h2 id={id} className="h-sec mb-3 text-xl">{title}</h2>
        {children}
        {footer && <div className="mt-4 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>, document.body)
}

/* ---------- Toast ---------- */
type Toast = { id: number; msg: string; tone: 'ok' | 'err' }
const ToastCtx = createContext<(msg: string, tone?: 'ok' | 'err') => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useCallback((msg: string, tone: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s.slice(-2), { id, msg, tone }])
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 5000)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite" role="status">
        {items.map((t) => <div key={t.id} className={`pointer-events-auto max-w-md rounded-2xl px-4 py-3 text-sm font-bold shadow-lg ${t.tone === 'ok' ? 'bg-[#0f7a6a] text-white' : 'bg-[#b42318] text-white'}`}>{t.msg}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}
export function Confirm({ open, title, children, confirmLabel = 'Confirmar', danger, loading, onConfirm, onClose }: { open: boolean; title: string; children: ReactNode; confirmLabel?: string; danger?: boolean; loading?: boolean; onConfirm: () => void; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title={title} footer={<><Button variant="outline" onClick={onClose}>Cancelar</Button><Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}>{children}</Modal>
}

export function FieldGroupLike({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  const id = useId()
  return <div className={`field ${className}`} role="group" aria-labelledby={id}><span id={id} className="flabel">{label}</span>{children}</div>
}
