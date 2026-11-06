/** Dinheiro sempre em centavos inteiros. Taxa de 10% paga pelo contratante, por cima. */
export const FEE_PCT = 10
export const RECHARGE_MIN_CENTS = 2000
export const RECHARGE_MAX_CENTS = 1_000_000
export const WITHDRAW_MIN_CENTS = 1000
export const MIN_OFFER_CENTS = 1000

export interface Breakdown { valueCents: number; feeCents: number; totalCents: number }

export function feeOf(valueCents: number): number {
  if (!Number.isInteger(valueCents) || valueCents < 0) throw new Error('valor inválido (centavos inteiros)')
  return Math.round((valueCents * FEE_PCT) / 100)
}
export function breakdown(valueCents: number): Breakdown {
  const feeCents = feeOf(valueCents)
  return { valueCents, feeCents, totalCents: valueCents + feeCents }
}
export const brl = (cents: number) =>
  'R$ ' + (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
