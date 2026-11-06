import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { z, ZodError } from 'zod'
import { env } from './env'
import type { Db } from './db'
import { ApiError, adminCharge, adminPayout, confirm3ds, createCharge, createPayout, createToken, getCharge, overview } from './gateway'

const eq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y) }
const bearer = (h?: string) => (h && h.startsWith('Bearer ') ? h.slice(7) : '')

export async function buildApp(db: Db) {
  const app = Fastify({ logger: { level: env.LOG_LEVEL }, bodyLimit: 100_000, trustProxy: true })
  const origins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  await app.register(helmet, { contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"] } } })
  await app.register(cors, { origin: (o, cb) => cb(null, !o || origins.includes(o)), methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['content-type', 'authorization', 'x-public-key'], maxAge: 600 })
  await app.register(rateLimit, { global: true, max: 300, timeWindow: '1 minute' })

  app.setErrorHandler((err: any, _req, reply) => {
    if (err instanceof ApiError) return reply.status(err.status).send({ error: { code: err.code, message: err.message, fields: err.fields } })
    if (err instanceof ZodError) return reply.status(422).send({ error: { code: 'VALIDATION', message: err.issues[0]?.message ?? 'Dados inválidos.', fields: Object.fromEntries(err.issues.map((i) => [i.path.join('.'), i.message])) } })
    if (err.statusCode === 429) return reply.status(429).send({ error: { code: 'RATE_LIMIT', message: 'Muitas requisições.' } })
    if ((err.statusCode ?? 500) < 500) return reply.status(err.statusCode).send({ error: { code: 'BAD_REQUEST', message: err.message } })
    app.log.error(err)
    return reply.status(500).send({ error: { code: 'INTERNAL', message: 'Erro interno.' } })
  })
  const needSecret = async (req: any) => { if (!eq(bearer(req.headers.authorization), env.PAYSIM_API_KEY)) throw new ApiError(401, 'UNAUTHORIZED', 'Chave de API inválida.') }
  const needAdmin = async (req: any) => { if (!eq(String(req.headers['x-admin-key'] || bearer(req.headers.authorization)), env.PAYSIM_ADMIN_KEY)) throw new ApiError(401, 'UNAUTHORIZED', 'Chave de administração inválida.') }
  const needPublic = async (req: any) => { if (!eq(String(req.headers['x-public-key'] || bearer(req.headers.authorization)), env.PAYSIM_PUBLIC_KEY)) throw new ApiError(401, 'UNAUTHORIZED', 'Chave pública inválida.') }

  app.get('/health', async () => ({ ok: true }))

  // ---- navegador → gateway: tokenização (o back nunca vê o cartão) ----
  app.post('/v1/tokens', { preHandler: needPublic, config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
    const b = z.object({
      number: z.string().max(30).optional(), exp: z.string().max(5).optional(), cvv: z.string().max(5).optional(), holder: z.string().max(60).optional(),
      document: z.string().max(20).optional(), type: z.enum(['credito', 'debito']).optional(), cardRef: z.string().max(60).optional(),
    }).strict().parse(req.body)
    return reply.status(201).header('cache-control', 'no-store').send(createToken(db, b))
  })

  // ---- back → gateway ----
  app.post('/v1/charges', { preHandler: needSecret }, async (req, reply) => {
    const b = z.object({
      amountCents: z.number().int().min(100).max(100_000_000), method: z.enum(['pix', 'card']), externalRef: z.string().min(3).max(80),
      cardToken: z.string().max(80).optional(), saveCard: z.boolean().optional(), expectCardRef: z.string().max(60).optional(), cardType: z.string().max(10).optional(),
    }).strict().parse(req.body)
    const { charge, created } = await createCharge(db, b)
    return reply.status(created ? 201 : 200).send(charge)
  })
  app.get('/v1/charges/:id', { preHandler: needSecret }, async (req) => getCharge(db, (req.params as any).id))
  app.post('/v1/charges/:id/3ds', { preHandler: needSecret }, async (req) => confirm3ds(db, (req.params as any).id, z.object({ code: z.string().regex(/^\d{6}$/) }).parse(req.body).code))
  app.post('/v1/payouts', { preHandler: needSecret }, async (req, reply) => {
    const b = z.object({ amountCents: z.number().int().min(100).max(100_000_000), pixKey: z.string().min(5).max(100), externalRef: z.string().min(3).max(80) }).strict().parse(req.body)
    const { payout, created } = createPayout(db, b)
    return reply.status(created ? 201 : 200).send(payout)
  })

  // ---- painel / simulação do banco ----
  app.get('/admin/overview', { preHandler: needAdmin }, async () => overview(db))
  app.post('/admin/charges/:id/:action', { preHandler: needAdmin }, async (req) => {
    const p = z.object({ id: z.string(), action: z.enum(['pay', 'decline', 'expire']) }).parse(req.params)
    return adminCharge(db, p.id, p.action)
  })
  app.post('/admin/payouts/:id/:action', { preHandler: needAdmin }, async (req) => {
    const p = z.object({ id: z.string(), action: z.enum(['complete', 'fail']) }).parse(req.params)
    return adminPayout(db, p.id, p.action)
  })
  app.post('/admin/events/:id/retry', { preHandler: needAdmin }, async (req) => {
    const r = db.prepare("UPDATE events SET status = 'pending', attempts = 0, next_attempt_at = ? WHERE id = ?").run(Date.now(), (req.params as any).id)
    if (!Number(r.changes)) throw new ApiError(404, 'NOT_FOUND', 'Evento não encontrado.')
    return { ok: true }
  })

  // ---- UI do painel (arquivos estáticos simples; sem dependências) ----
  const uiDir = [path.join(__dirname, 'ui'), path.join(process.cwd(), 'src/ui')].find((d) => fs.existsSync(d))!
  const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' }
  const serve = (file: string) => async (_req: any, reply: any) => reply.header('content-type', types[path.extname(file)]).header('cache-control', 'no-cache').send(fs.readFileSync(path.join(uiDir, file)))
  app.get('/', serve('index.html'))
  app.get('/ui/app.js', serve('app.js'))
  app.get('/ui/app.css', serve('app.css'))
  return app
}
