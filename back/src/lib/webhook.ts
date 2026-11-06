import crypto from 'node:crypto'

/** Assinatura: sha256=HMAC(secret, `${timestamp}.${corpoBruto}`). Janela de 5 minutos. */
export const SIG_HEADER = 'x-triskel-signature'
export const TS_HEADER = 'x-triskel-timestamp'
export const ID_HEADER = 'x-triskel-event-id'
export const TOLERANCE_S = 300

export function sign(secret: string, timestamp: number | string, rawBody: string): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
}
export function verify(opts: { secret: string; timestamp?: string; signature?: string; rawBody: string; nowS?: number }): { ok: boolean; reason?: string } {
  const { secret, timestamp, signature, rawBody } = opts
  if (!timestamp || !signature) return { ok: false, reason: 'cabeçalhos ausentes' }
  const ts = Number(timestamp)
  const now = opts.nowS ?? Math.floor(Date.now() / 1000)
  if (!Number.isFinite(ts) || Math.abs(now - ts) > TOLERANCE_S) return { ok: false, reason: 'timestamp fora da janela' }
  const expected = Buffer.from(sign(secret, timestamp, rawBody))
  const got = Buffer.from(signature)
  if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return { ok: false, reason: 'assinatura inválida' }
  return { ok: true }
}
