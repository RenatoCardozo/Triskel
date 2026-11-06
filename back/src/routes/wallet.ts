import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { requireAuth, roles } from '../plugins/auth'
import { confirm3ds, createRecharge, createWithdrawal, getRecharge, receipt, removeCard, walletSummary } from '../services/wallet'

const idemHeader = (h: Record<string, unknown>) => {
  const v = h['idempotency-key']
  return typeof v === 'string' && /^[\w.:-]{8,80}$/.test(v) ? v : undefined
}
export async function walletRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['carteira']
  const payer = roles('BUSINESS', 'AGENCY')
  const id = z.object({ id: z.string() })

  app.get('/', { schema: { tags } }, async (req) => walletSummary(req.user!.id, req.user!.role))

  app.post('/recharges', {
    preHandler: payer, config: { rateLimit: { max: 15, timeWindow: '1 minute' } },
    schema: { tags, body: z.object({
      amountCents: z.number().int().positive(), method: z.enum(['pix', 'card']), cardToken: z.string().min(8).max(120).optional(),
      cardType: z.enum(['credito', 'debito']).optional(), save: z.boolean().optional(), savedCardId: z.string().optional(),
    }).strict() },
  }, async (req, reply) => reply.status(201).send(await createRecharge(req.user!.id, { ...req.body, idempotencyKey: idemHeader(req.headers) })))

  app.get('/recharges/:id', { preHandler: payer, schema: { tags, params: id } }, async (req) => getRecharge(req.user!.id, req.params.id))

  app.post('/recharges/:id/3ds', {
    preHandler: payer, config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    schema: { tags, params: id, body: z.object({ code: z.string().regex(/^\d{6}$/, 'Informe os 6 dígitos.') }).strict() },
  }, async (req) => confirm3ds(req.user!.id, req.params.id, req.body.code))

  app.post('/withdrawals', {
    preHandler: roles('CREATOR'), config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    schema: { tags, body: z.object({ amountCents: z.number().int().positive(), key: z.enum(['cpf', 'mail']) }).strict() },
  }, async (req, reply) => reply.status(201).send({ transaction: await createWithdrawal(req.user!.id, { ...req.body, idempotencyKey: idemHeader(req.headers) }) }))

  app.get('/transactions/:id', { schema: { tags, params: id } }, async (req) => receipt(req.user!.id, req.user!.role, req.params.id))

  app.delete('/cards/:id', { preHandler: payer, schema: { tags, params: id } }, async (req, reply) => { await removeCard(req.user!.id, req.params.id); return reply.status(204).send() })
}
