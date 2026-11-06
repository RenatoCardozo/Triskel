'use client'
import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, fileUrl } from '@/lib/api'
import { initials } from '@/lib/format'
import type { Me } from '@/lib/types'
import { qk } from '@/hooks/queries'
import { Icon } from './Icon'
import { Note, useToast } from './ui'

const OK = ['image/jpeg', 'image/png', 'image/webp']
const MAX = 5 * 1024 * 1024

/** Capa + foto de perfil com troca imediata (multipart para /me/photo/:kind). O back confere o tipo real do arquivo. */
export function PhotoPicker({ u }: { u: Me }) {
  const qc = useQueryClient(); const toast = useToast()
  const [busy, setBusy] = useState<'avatar' | 'cover' | null>(null); const [err, setErr] = useState('')
  const aRef = useRef<HTMLInputElement>(null), cRef = useRef<HTMLInputElement>(null)
  async function up(kind: 'avatar' | 'cover', f?: File | null) {
    if (!f) return
    setErr('')
    if (!OK.includes(f.type)) return setErr('Use uma imagem JPG, PNG ou WebP.')
    if (f.size > MAX) return setErr('A imagem pode ter no máximo 5 MB.')
    setBusy(kind)
    try {
      const fd = new FormData(); fd.append('file', f)
      const r = await api<{ user: Me }>('me/photo/' + kind, { method: 'POST', form: fd })
      qc.setQueryData(qk.me, r.user); qc.invalidateQueries({ queryKey: qk.dash }); toast(kind === 'avatar' ? 'Foto de perfil atualizada.' : 'Foto de capa atualizada.')
    } catch (e) { setErr((e as Error).message) } finally { setBusy(null) }
  }
  const cover = fileUrl(u.coverUrl), av = fileUrl(u.avatarUrl)
  return (
    <div>
      <div className="relative">
        <button type="button" onClick={() => cRef.current?.click()} disabled={busy === 'cover'} aria-label={cover ? 'Trocar foto de capa' : 'Adicionar foto de capa'}
          className="relative block h-32 w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-mint to-teal-2 sm:h-40" style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-tealtext"><Icon n="camera" size={16} />{busy === 'cover' ? 'Enviando…' : cover ? 'Trocar foto de capa' : 'Adicionar foto de capa'}</span>
        </button>
        <button type="button" onClick={() => aRef.current?.click()} disabled={busy === 'avatar'} aria-label={av ? 'Trocar foto de perfil' : 'Adicionar foto de perfil'}
          className="avatar absolute -bottom-9 left-4 !rounded-2xl border-[3px] border-white shadow" style={{ width: 80, height: 80, fontSize: 28 }}>
          {av ? <img src={av} alt="" /> : <Icon n="camera" size={26} />}
          <em className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-white text-tealtext"><Icon n="camera" size={13} /></em>
          <span className="sr-only">{initials(u.name)}</span>
        </button>
      </div>
      <input ref={cRef} type="file" accept={OK.join(',')} hidden onChange={(e) => { up('cover', e.target.files?.[0]); e.target.value = '' }} />
      <input ref={aRef} type="file" accept={OK.join(',')} hidden onChange={(e) => { up('avatar', e.target.files?.[0]); e.target.value = '' }} />
      <div className="mt-11">{err && <Note tone="danger" role="alert">{err}</Note>}</div>
    </div>
  )
}
