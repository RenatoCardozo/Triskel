/** Datas de entrega são DATE (meia-noite UTC). Aritmética de janela em dias inteiros. */
export const DAY_MS = 86_400_000
export function parseISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? d : null
}
export const isoDate = (d: Date) => d.toISOString().slice(0, 10)
export const fdt = (d: Date) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
/** Hoje (data de São Paulo) como meia-noite UTC. */
export function todaySP(now = new Date()): Date {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  return parseISODate(p)!
}
/** dd/mm/aaaa às hh:mm:ss (Brasília) */
export function fdhSP(d: Date): string {
  const o: Record<string, string> = {}
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    .formatToParts(d).forEach((x) => (o[x.type] = x.value))
  return `${o.day}/${o.month}/${o.year} às ${o.hour === '24' ? '00' : o.hour}:${o.minute}:${o.second}`
}
export const fdtSP = (d: Date) => fdhSP(d).split(' às ')[0]
