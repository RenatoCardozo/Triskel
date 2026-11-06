import { env } from '../env'
import { AppError } from './errors'

/** Cliente do gateway simulado (payment-sim). O back nunca recebe número de cartão: só tokens de uso único. */
export interface GatewayCharge {
  id: string
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'requires_action'
  method: 'pix' | 'card'
  amountCents: number
  externalRef: string
  pix?: { payload: string; qrSvg?: string; expiresAt: string; e2e: string }
  action?: { type: '3ds'; id: string; attemptsLeft?: number; message?: string }
  card?: { brand: string; last4: string; type: 'credito' | 'debito'; exp?: string; holder?: string; ref?: string }
  failure?: { code: string; message: string }
}
export interface GatewayPayout { id: string; status: 'processing' | 'completed' | 'failed'; amountCents: number; externalRef: string }

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 8000)
  try {
    const res = await fetch(env.PAYMENT_API_URL + path, {
      method, signal: ctl.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${env.PAYMENT_API_KEY}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as any
    if (!res.ok) throw new AppError(res.status === 404 ? 404 : 502, 'GATEWAY_ERROR', json?.error?.message || 'O gateway de pagamento recusou a requisição.')
    return json as T
  } catch (e) {
    if (e instanceof AppError) throw e
    throw new AppError(502, 'GATEWAY_UNAVAILABLE', 'Não foi possível falar com o gateway de pagamento. Tente novamente em instantes.')
  } finally {
    clearTimeout(timer)
  }
}
export const gateway = {
  createCharge: (b: { amountCents: number; method: 'pix' | 'card'; externalRef: string; cardToken?: string; saveCard?: boolean; expectCardRef?: string; cardType?: string }) => call<GatewayCharge>('POST', '/v1/charges', b),
  getCharge: (id: string) => call<GatewayCharge>('GET', `/v1/charges/${encodeURIComponent(id)}`),
  confirm3ds: (id: string, code: string) => call<GatewayCharge>('POST', `/v1/charges/${encodeURIComponent(id)}/3ds`, { code }),
  createPayout: (b: { amountCents: number; pixKey: string; externalRef: string }) => call<GatewayPayout>('POST', '/v1/payouts', b),
}
