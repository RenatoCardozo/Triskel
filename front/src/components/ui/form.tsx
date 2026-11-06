'use client'
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { centsToMask, maskToCents, passwordRules, passwordStrength } from '@/lib/masks'
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
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-2">R$</span>
        <input id={id} className="inp !pl-11" inputMode="numeric" autoComplete="off" value={value ? centsToMask(value) : ''} placeholder="0,00" onChange={(e) => onChange(maskToCents(e.target.value))} {...aria(id, error, hint)} {...r} />
      </div>
    </Shell>
  )
}

export function PasswordInput({ label, error, hint, className, id: pid, ...r }: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  const id = useFid(pid); const [show, setShow] = useState(false)
  return (
    <Shell id={id} {...{ label, error, hint, className }}>
      <div className="relative">
        <input id={id} className="inp !pr-24" type={show ? 'text' : 'password'} {...aria(id, error, hint)} {...r} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-extrabold text-tealtext hover:bg-ok-bg"><Icon n={show ? 'eyeoff' : 'eye'} size={16} />{show ? 'Ocultar' : 'Mostrar'}</button>
      </div>
    </Shell>
  )
}
export function PasswordMeter({ value }: { value: string }) {
  const s = passwordStrength(value), r = passwordRules(value)
  const colors = ['#d9dff0', '#e0746a', '#f0a23b', '#5fcf9a', '#17b890']
  const rule = (ok: boolean, t: string) => <li key={t} className={ok ? 'font-bold text-tealtext' : 'text-ink-2'}>{ok ? '✓' : '•'} {t}</li>
  return (
    <div aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">{[1, 2, 3, 4].map((i) => <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= s.score ? colors[s.score] : colors[0] }} />)}</div>
      <p className="cap mt-1">Força da senha: <b>{s.label}</b></p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px]">{[rule(r.len, '8+ caracteres'), rule(r.lower, 'a-z'), rule(r.upper, 'A-Z'), rule(r.num, '0-9'), rule(r.special, 'Especial (!@#)')]}</ul>
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
