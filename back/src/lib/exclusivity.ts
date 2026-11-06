import { DAY_MS, fdt } from './dates'

/** Ramos considerados relacionados entre si (protótipo: SEGREL). */
export const SEGREL = [['Saúde', 'Beleza', 'Esportes']]
export const segRel = (a?: string | null, b?: string | null) =>
  !!a && !!b && a !== 'Outros' && b !== 'Outros' && (a === b || SEGREL.some((g) => g.includes(a) && g.includes(b)))

export interface ExInfo {
  /** empresa (marca) normalizada, para saber se são empresas diferentes */
  co: string
  /** nome de exibição, só mostrado ao criador */
  coName: string
  seg: string
  dias: number
  pz: Date | null
  fim: Date | null
}
export const normName = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
export function exMk(coName: string, seg: string, dias: number, pz: Date | null): ExInfo {
  return { co: normName(coName || ''), coName: coName || '', seg: seg || '', dias, pz, fim: pz && dias ? new Date(pz.getTime() + dias * DAY_MS) : null }
}
/** Retorna qual lado impõe o conflito: 'a' (contrato assinado existente) ou 'b' (campanha nova), ou null. */
export function exPair(a: ExInfo, b: ExInfo): 'a' | 'b' | null {
  if (!a.pz || !b.pz || !a.co || a.co === b.co || !segRel(a.seg, b.seg)) return null
  if (a.dias && b.pz >= a.pz && b.pz <= a.fim!) return 'a'
  if (b.dias && a.pz >= b.pz && a.pz <= b.fim!) return 'b'
  return null
}
export interface Conflict { a: ExInfo; b: ExInfo; by: 'a' | 'b'; rel: boolean }
/** `signed` precisa conter SOMENTE contratos assinados pelas duas partes. */
export function exCheck(signed: ExInfo[], b: ExInfo): Conflict | null {
  for (const a of signed) {
    const by = exPair(a, b)
    if (by) return { a, b, by, rel: a.seg !== b.seg }
  }
  return null
}
/**
 * Texto do conflito. v='c' (criador) pode citar a marca; v='k' (contratante) NUNCA revela a marca concorrente.
 */
export function exTxt(cf: Conflict, v: 'c' | 'k'): string {
  const { a, b } = cf
  const rm = cf.rel ? 'de ramo relacionado' : 'do mesmo ramo'
  if (v === 'c') {
    return cf.by === 'a'
      ? `Você assinou exclusividade com ${a.coName} (${a.seg}) até ${fdt(a.fim!)}. Esta campanha tem entrega em ${fdt(b.pz!)}, dentro desse período, e é ${rm} (${b.seg}). Peça à empresa uma entrega depois de ${fdt(a.fim!)}.`
      : `Esta campanha exige exclusividade até ${fdt(b.fim!)}, e você já tem contrato assinado com ${a.coName} (${a.seg}) com entrega em ${fdt(a.pz!)}, dentro desse período.`
  }
  return cf.by === 'a'
    ? `Este criador tem contrato de exclusividade assinado com outra marca ${rm} (${a.seg}) até ${fdt(a.fim!)}. A entrega em ${fdt(b.pz!)} cai dentro desse período. Escolha uma entrega depois de ${fdt(a.fim!)} ou outro criador.`
    : `A exclusividade desta campanha vai até ${fdt(b.fim!)}, e este criador já tem contrato assinado com outra marca ${rm} (${a.seg}) com entrega em ${fdt(a.pz!)}. Reduza a exclusividade, mude a entrega ou escolha outro criador.`
}
export const exLine = (dias: number, pz: Date | null) =>
  dias && pz ? `${dias} dias, de ${fdt(pz)} até ${fdt(new Date(pz.getTime() + dias * DAY_MS))}` : 'Nenhuma'
