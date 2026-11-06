/** Mesma regra do back: taxa de 10% por cima, paga pelo contratante; o criador recebe o valor cheio. */
export const FEE_PCT = 10
export const feeOf = (valueCents: number) => Math.round((valueCents * FEE_PCT) / 100)
export const breakdown = (valueCents: number) => ({ valueCents, feeCents: feeOf(valueCents), totalCents: valueCents + feeOf(valueCents) })
export const MIN_OFFER_CENTS = 1000
