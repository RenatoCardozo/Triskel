/** Compatibilidade (%) criador x campanha e campanha x criador. Portado de `compat`/`ccompat` do protótipo. */
export const nz = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const notaMin = (t?: string | null) => (t === '4,5 ou mais' ? 4.5 : t === '4,0 ou mais' ? 4 : 0)
export const porteK = (x: string) => String(x).split(' ')[0]
export const nearReg = (near: boolean, reg?: string | null) =>
  !reg || reg === 'Sem preferência' || reg === 'Brasil todo' || reg === 'Sul do Brasil' || reg === 'Rio Grande do Sul' || (reg === 'Pelotas e região' && near)

export interface CreatorLike { niches: string[]; near: boolean; rating: number; sizeBand: string; vminCents: number }
export interface CampaignLike {
  nichosCr?: string[]; regCr?: string; nota?: string; porteCr?: string[]; valueCents?: number
}
export function compat(cr: CreatorLike, c: CampaignLike) {
  const nm = (c.nichosCr || []).filter((x) => cr.niches.includes(x)).length
  const why: string[] = []
  let s = 0
  if (nm >= 2) { s += 40; why.push('Nichos compatíveis') } else if (nm === 1) { s += 28; why.push('Nicho compatível') }
  if (nearReg(cr.near, c.regCr)) { s += 20; if (c.regCr && c.regCr !== 'Brasil todo' && c.regCr !== 'Sul do Brasil') why.push('Na região') }
  if (cr.rating >= notaMin(c.nota)) { s += 10; if (cr.rating >= 4.8) { s += 5; why.push('Nota ' + String(cr.rating.toFixed(1)).replace('.', ',')) } }
  if (!(c.porteCr || []).length || (c.porteCr || []).map(porteK).includes(cr.sizeBand)) s += 10
  const v = c.valueCents || 0
  if (v >= cr.vminCents) { s += 15; why.push('Dentro do orçamento') } else if (v >= cr.vminCents * 0.85) { s += 7; why.push('Perto do orçamento') } else why.push('Acima do orçamento')
  return { pct: Math.min(97, Math.max(35, s)), why }
}
export interface CampaignForCreator { niches: string[]; near: boolean; valueCents: number; videos: number }
export function ccompat(cm: CampaignForCreator, me: { niches: string[]; vminCents: number }) {
  const nm = cm.niches.filter((x) => me.niches.includes(x)).length
  const why: string[] = []
  let s = 0
  if (nm >= 2) { s += 45; why.push('Nichos compatíveis') } else if (nm === 1) { s += 32; why.push('Nicho compatível') }
  if (cm.near) { s += 25; why.push('Na sua região') }
  if (cm.valueCents / cm.videos >= me.vminCents) { s += 20; why.push('Valor acima do seu mínimo') } else why.push('Abaixo do seu mínimo')
  s += 8
  return { pct: Math.min(97, Math.max(35, s)), why }
}
