export const digits = (s: unknown) => String(s ?? '').replace(/\D/g, '')

export function cpfOk(v: unknown): boolean {
  const d = digits(v)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  const c = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); return ((s * 10) % 11) % 10 }
  return c(9) === +d[9] && c(10) === +d[10]
}
export function cnpjOk(v: unknown): boolean {
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
export const fmtCPF = (v: string) => digits(v).replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4')
export const fmtCNPJ = (v: string) => digits(v).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5')

const DDDS = new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '))
export function telOk(v: unknown): boolean {
  let d = digits(v)
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  if (d.length < 10 || d.length > 11 || !DDDS.has(d.slice(0, 2))) return false
  return !(d.length === 11 && d[2] !== '9')
}
export function fmtTel(v: string): string {
  let d = digits(v)
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2)
  d = d.slice(0, 11)
  const r = d.slice(2), cut = d.length > 10 ? 5 : 4
  return `(${d.slice(0, 2)}) ${r.length > cut ? r.slice(0, cut) + '-' + r.slice(cut) : r}`
}
export const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

export function passwordOk(p: string): string | null {
  if (p.length < 8) return 'A senha precisa ter 8 ou mais caracteres.'
  if (p.length > 72) return 'A senha pode ter no máximo 72 caracteres.'
  if (!/[a-z]/.test(p) || !/[A-Z]/.test(p) || !/\d/.test(p)) return 'Use letras maiúsculas, minúsculas e números.'
  return null
}
/** Aceita @usuario ou usuario; normaliza para @usuario. */
export function handleNorm(v: string): string {
  v = v.trim()
  const s = v.replace(/[^A-Za-z0-9._]/g, '').toLowerCase().slice(0, 30)
  return s ? '@' + s : ''
}
