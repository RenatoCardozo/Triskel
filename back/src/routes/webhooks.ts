import { FastifyInstance, FastifyRequest } from 'fastify'
import { prisma } from '../db'
import { env } from '../env'
import { logger } from '../lib/logger'
import { AppError } from '../lib/errors'
import { ID_HEADER, SIG_HEADER, TS_HEADER, verify } from '../lib/webhook'
import { applyCharge, applyPayout } from '../services/wallet'
import { applyAnalysis } from '../services/deliveries'

/**
 * Recebe webhooks assinados (HMAC-SHA256 sobre `timestamp.corpoBruto`, janela de 5 min) e processa uma única vez por eventId.
 * Se o processamento falhar, o registro de dedupe é removido e a resposta é 500, para o emissor tentar de novo.
 */
async function receive(source: 'payments' | 'video-ai', secret: string, req: FastifyRequest, handle: (type: string, data: any) => Promise<void>) {
  const raw = req.rawBody ?? ''
  const v = verify({ secret, timestamp: req.headers[TS_HEADER] as string | undefined, signature: req.headers[SIG_HEADER] as string | undefined, rawBody: raw })
  if (!v.ok) { logger.warn({ source, reason: v.reason }, 'webhook rejeitado'); throw new AppError(401, 'BAD_SIGNATURE', 'Assinatura inválida.') }
  const eventId = String(req.headers[ID_HEADER] || '')
  const body = req.body as { id?: string; type?: string; data?: unknown }
  if (!eventId || eventId.length > 100 || !body?.type || body.id !== eventId) throw new AppError(400, 'BAD_EVENT', 'Evento inválido.')
  try { await prisma.webhookEvent.create({ data: { source, eventId } }) } catch (e: any) {
    if (e?.code === 'P2002') return { received: true, duplicate: true }
    throw e
  }
  try { await handle(body.type, body.data) } catch (e) {
    await prisma.webhookEvent.deleteMany({ where: { source, eventId } })
    throw e
  }
  return { received: true }
}

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/payments', { schema: { hide: true } }, async (req) =>
    receive('payments', env.PAYMENT_WEBHOOK_SECRET, req, async (type, d) => {
      if (type.startsWith('charge.')) {
        const tx = await prisma.moneyTx.findFirst({ where: { id: String(d?.externalRef), kind: 'RECHARGE' } })
        if (!tx) { logger.warn({ ref: d?.externalRef }, 'webhook de cobrança desconhecida'); return }
        if (d.amountCents !== tx.valueCents) { logger.error({ txId: tx.id, got: d.amountCents }, 'valor do webhook diverge da cobrança'); return }
        const status = type === 'charge.paid' ? 'paid' : type === 'charge.failed' ? 'failed' : type === 'charge.expired' ? 'expired' : null
        if (status) await applyCharge(tx.id, { ...d, status })
      } else if (type === 'payout.completed' || type === 'payout.failed') {
        const tx = await prisma.moneyTx.findFirst({ where: { id: String(d?.externalRef), kind: 'WITHDRAWAL' } })
        if (tx) await applyPayout(tx.id, type === 'payout.completed' ? 'completed' : 'failed', d?.reason)
      }
    }))

  app.post('/video-ai', { schema: { hide: true } }, async (req) =>
    receive('video-ai', env.VIDEOAI_WEBHOOK_SECRET, req, async (type, d) => {
      if (type === 'analysis.completed') await applyAnalysis(d)
    }))
}
