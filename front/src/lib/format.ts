export const brl = (cents: number | null | undefined) =>
  'R$ ' + ((cents ?? 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
/** "R$ 420" sem centavos quando redondo (KPIs) */
export const brlShort = (cents: number) => (cents % 100 === 0 ? 'R$ ' + (cents / 100).toLocaleString('pt-BR') : brl(cents))

const pad = (n: number) => String(n).padStart(2, '0')
export const fdate = (iso: string | Date | null | undefined) => {
  if (!iso) return '—'
  const s = typeof iso === 'string' ? iso : iso.toISOString()
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const d = new Date(s)
  return Number.isNaN(+d) ? '—' : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}
export const fdatetime = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(+d) ? '—' : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export const ftime = (iso: string) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }
export const fshort = (iso: string) => { const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` }
export const rating = (n: number) => (n ? n.toFixed(1).replace('.', ',') : '—')
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('')
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
export const fsize = (b: number) => (b > 1e6 ? (b / 1e6).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB')
export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
export const tomorrowISO = () => { const d = new Date(); d.setDate(d.getDate() + 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
