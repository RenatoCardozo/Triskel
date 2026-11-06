/** Máscaras e conversões de entrada. Valores monetários trafegam como centavos inteiros. */
export const digits = (s: unknown) => String(s ?? '').replace(/\D/g, '')

export const maskCPF = (v: string) => {
  const d = digits(v).slice(0, 11)
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2')
}
export const maskCNPJ = (v: string) => {
  const d = digits(v).slice(0, 14)
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
}
export const maskPhone = (v: string) => {
  let d = digits(v)
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  d = d.slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  const cut = d.length > 10 ? 7 : 6
  return `(${d.slice(0, 2)}) ${d.slice(2, cut)}${d.length >= cut ? '-' + d.slice(cut) : ''}`.replace(/-$/, '')
}
/** dd/mm/aaaa enquanto digita */
export const maskDate = (v: string) => {
  const d = digits(v).slice(0, 8)
  return d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}
export const maskCard = (v: string) => digits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
export const maskExp = (v: string) => { const d = digits(v).slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }
export const maskCEP = (v: string) => digits(v).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')

/** "R$ 1.234,56" a partir dos dígitos digitados (centavos). */
export const centsToMask = (c: number | null | undefined) =>
  c == null || Number.isNaN(c) ? '' : (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const maskToCents = (v: string): number => {
  const d = digits(v)
  return d ? parseInt(d.slice(0, 10), 10) : 0
}
/** Converte "12,50" / "R$ 12,50" / "12.50" em centavos (para campos sem máscara ao vivo). */
export const parseBRL = (v: string): number | null => {
  const s = String(v).replace(/[^\d,.-]/g, '')
  if (!s) return null
  const n = s.includes(',') ? Number(s.replace(/\./g, '').replace(',', '.')) : Number(s)
  return Number.isFinite(n) ? Math.round(n * 100) : null
}

/** dd/mm/aaaa -> aaaa-mm-dd (null se inválida) */
export const brDateToISO = (v: string): string | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v)
  if (!m) return null
  const [, dd, mm, yy] = m
  const d = new Date(Date.UTC(+yy, +mm - 1, +dd))
  if (d.getUTCFullYear() !== +yy || d.getUTCMonth() !== +mm - 1 || d.getUTCDate() !== +dd) return null
  return `${yy}-${mm}-${dd}`
}
export const isoToBRDate = (iso: string | null | undefined) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

export function cpfOk(v: string): boolean {
  const d = digits(v)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  const c = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); return ((s * 10) % 11) % 10 }
  return c(9) === +d[9] && c(10) === +d[10]
}
export function cnpjOk(v: string): boolean {
  const d = digits(v)
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const c = (n: number) => {
    const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let s = 0; for (let i = 0; i < n; i++) s += +d[i] * w[i]
    const r = s % 11
    return r < 2 ? 0 : 11 - r
  }
  return c(12) === +d[12] && c(13) === +d[13]
}
const DDDS = new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '))
export function phoneOk(v: string): boolean {
  const d = digits(v)
  if (d.length < 10 || d.length > 11 || !DDDS.has(d.slice(0, 2))) return false
  return !(d.length === 11 && d[2] !== '9')
}
export function luhn(v: string): boolean {
  const d = digits(v)
  if (d.length < 13) return false
  let sum = 0, alt = false
  for (let i = d.length - 1; i >= 0; i--) { let n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9 } sum += n; alt = !alt }
  return sum % 10 === 0
}
export const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

export function passwordRules(p: string) {
  return { len: p.length >= 8, lower: /[a-z]/.test(p), upper: /[A-Z]/.test(p), num: /\d/.test(p), special: /[^A-Za-z0-9]/.test(p) }
}
export function passwordStrength(p: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!p) return { score: 0, label: 'Crie uma senha' }
  const r = passwordRules(p)
  const n = [r.len, r.lower, r.upper, r.num, r.special].filter(Boolean).length
  const score = (n <= 2 ? 1 : n === 3 ? 2 : n === 4 ? 3 : 4) as 1 | 2 | 3 | 4
  return { score, label: ['', 'Fraca', 'Razoável', 'Boa', 'Forte'][score] }
}
