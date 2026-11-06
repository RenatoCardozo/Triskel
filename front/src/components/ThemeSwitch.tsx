'use client'
import { useEffect, useState } from 'react'
import { useToast } from './ui'

/** Claro/Escuro (protótipo): a escolha fica salva neste navegador (localStorage). */
export function ThemeSwitch() {
  const toast = useToast()
  const [t, setT] = useState<'light' | 'dark'>('light')
  useEffect(() => { setT(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light') }, [])
  function set(k: 'light' | 'dark') {
    setT(k)
    if (k === 'dark') document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme
    try { localStorage.setItem('triskel-theme', k) } catch { /* navegador sem armazenamento: vale só nesta visita */ }
    toast(`Tema ${k === 'dark' ? 'escuro' : 'claro'} ativado.`)
  }
  return (
    <div>
      <div role="radiogroup" aria-label="Tema do aplicativo" className="grid grid-cols-2 gap-3">
        {([['light', 'Claro'], ['dark', 'Escuro']] as const).map(([k, l]) => (
          <button key={k} type="button" role="radio" aria-checked={t === k} onClick={() => set(k)} className={`rounded-2xl border-2 p-3 text-left ${t === k ? 'border-teal-2 bg-ok-bg' : 'border-line bg-white'}`}>
            <span className={`mb-2 flex h-12 items-end gap-1 rounded-xl p-1.5 ${k === 'dark' ? 'bg-[#0b0f13]' : 'bg-[#f6fbfa] ring-1 ring-line'}`}>{[40, 70, 55].map((h, i) => <i key={i} className="keep-color block flex-1 rounded-sm bg-gradient-to-t from-teal-2 to-mint" style={{ height: h + '%' }} />)}</span>
            <b className="text-sm text-ink">{l}</b>
          </button>
        ))}
      </div>
      <p className="cap mt-2">A escolha fica salva neste navegador.</p>
    </div>
  )
}
