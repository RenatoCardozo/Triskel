'use client'
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { centsToMask, maskToCents, passwordRules } from '@/lib/masks'
import { Icon } from '../Icon'

interface FieldShell { label: string; error?: string; hint?: ReactNode; className?: string; optional?: boolean }
function useFid(id?: string) { const g = useId(); return id || g }
function Shell({ id, label, error, hint, className = '', optional, children }: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}{optional && <span className="fhint font-normal"> (opcional)</span>}</label>
      {children}
      {error ? <span id={id + '-e'} role="alert" className="ferr">{error}</span> : hint ? <span id={id + '-h'} className="fhint">{hint}</span> : null}
    </div>
  )
}
const aria = (id: string, error?: string, hint?: ReactNode) => ({ 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? id + '-e' : hint ? id + '-h' : undefined })

export const Input = forwardRef<HTMLInputElement, FieldShell & InputHTMLAttributes<HTMLInputElement>>(function Input({ label, error, hint, className, optional, id: pid, ...r }, ref) {
  const id = useFid(pid)
  return <Shell id={id} {...{ label, error, hint, className, optional }}><input ref={ref} id={id} className="inp" {...aria(id, error, hint)} {...r} /></Shell>
})
export const Textarea = forwardRef<HTMLTextAreaElement, FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ label, error, hint, className, optional, id: pid, ...r }, ref) {
  const id = useFid(pid)
  return <Shell id={id} {...{ label, error, hint, className, optional }}><textarea ref={ref} id={id} className="inp" {...aria(id, error, hint)} {...r} /></Shell>
})
export const Select = forwardRef<HTMLSelectElement, FieldShell & SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[]; placeholder?: string }>(function Select({ label, error, hint, className, optional, id: pid, options, placeholder = 'Selecione', ...r }, ref) {
  const id = useFid(pid)
  return <Shell id={id} {...{ label, error, hint, className, optional }}><select ref={ref} id={id} className="inp" {...aria(id, error, hint)} {...r}><option value="">{placeholder}</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></Shell>
})

/** Campo com máscara controlada (CPF, CNPJ, telefone, data…). `value` é o texto mascarado. */
export const MaskedInput = forwardRef<HTMLInputElement, FieldShell & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & { mask: (v: string) => string; value: string; onChange: (v: string) => void }>(function MaskedInput({ label, error, hint, className, optional, id: pid, mask, value, onChange, ...r }, ref) {
  const id = useFid(pid)
  return <Shell id={id} {...{ label, error, hint, className, optional }}><input ref={ref} id={id} className="inp" inputMode="numeric" value={value} onChange={(e) => onChange(mask(e.target.value))} {...aria(id, error, hint)} {...r} /></Shell>
})

/** Valor em R$ (centavos). O usuário digita só números; a máscara preenche vírgula e centavos. */
export function MoneyInput({ label, error, hint, className, optional, id: pid, value, onChange, ...r }: FieldShell & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & { value: number | null; onChange: (cents: number) => void }) {
  const id = useFid(pid)
  return (
    <Shell id={id} {...{ label, error, hint, className, optional }}>
      <div className="relative">
        <input id={id} className="inp" inputMode="numeric" autoComplete="off" value={value ? centsToMask(value) : ''} placeholder="0,00" onChange={(e) => onChange(maskToCents(e.target.value))} {...aria(id, error, hint)} {...r} />
      </div>
    </Shell>
  )
}

export function PasswordInput({ label, error, hint, className, id: pid, fig, ...r }: FieldShell & InputHTMLAttributes<HTMLInputElement> & { fig?: boolean }) {
  const id = useFid(pid); const [show, setShow] = useState(false)
  const field = (
    <div className="relative">
      <input id={id} className={fig ? 'tk-in pw' : 'inp !pr-20'} type={show ? 'text' : 'password'} {...aria(id, error, hint)} {...r} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} className="tk-eye">{show ? 'Ocultar' : 'Mostrar'}</button>
    </div>
  )
  if (fig) return <div className={className}><label htmlFor={id} className="tk-lb">{label}</label>{field}{error && <div id={id + '-e'} role="alert" className="tk-err">{error}</div>}</div>
  return <Shell id={id} {...{ label, error, hint, className }}>{field}</Shell>
}
const STRENGTH: Array<[string, string, number, string]> = [['Crie uma senha', '#8a8f98', 0, ''], ['Fraca', '#c4442b', 1, '#e8896a'], ['Fraca', '#c4442b', 1, '#e8896a'], ['Média', '#a86a0c', 2, '#f2b84b'], ['Boa', '#0f8f7d', 3, '#2dd4bf'], ['Forte', '#1a8f3c', 4, '#2dd450']]
export function PasswordMeter({ value, confirm }: { value: string; confirm?: string }) {
  const r = passwordRules(value)
  const list: Array<[string, boolean]> = [['8+ caracteres', r.len], ['a-z', r.lower], ['A-Z', r.upper], ['0-9', r.num], ['Especial (!@#)', r.special]]
  const n = value ? list.filter((x) => x[1]).length : 0
  const L = STRENGTH[n]!
  const msg: [string, string] = !confirm ? ['Repita a senha para confirmar.', '#7b828a'] : value === confirm ? ['✓ As senhas coincidem', '#0f8f7d'] : ['As senhas ainda não coincidem', '#c4442b']
  return (
    <div aria-live="polite">
      <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < L[2] ? L[3] : '#e3ece9', transition: 'background .25s' }} />)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, fontWeight: 500, color: '#7b828a' }}><span>Força da senha</span><b style={{ color: L[1] }}>{L[0]}</b></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {list.map(([t, ok]) => <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: ok ? 600 : 500, border: `1px solid ${ok ? '#2dd4bf' : '#d6dcdb'}`, background: ok ? '#e6f8f4' : '#fff', color: ok ? '#0f6f61' : '#7b828a', transition: 'all .2s' }}>{ok ? '✓ ' : ''}{t}</span>)}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, fontWeight: 500, color: msg[1] }}>{msg[0]}</div>
    </div>
  )
}
export function Switch({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div><label htmlFor={id} className="block text-sm font-bold text-ink">{label}</label>{hint && <span className="fhint">{hint}</span>}</div>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 flex-none rounded-full transition-colors ${checked ? 'bg-gradient-to-r from-teal-2 to-mint' : 'bg-[#cfd6e4]'} disabled:opacity-50`}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
export function FieldGroup({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: ReactNode }) {
  const id = useId()
  return <div className="field" role="group" aria-labelledby={id}><span id={id} className="flabel">{label}</span>{children}{error ? <span role="alert" className="ferr">{error}</span> : hint ? <span className="fhint">{hint}</span> : null}</div>
}
