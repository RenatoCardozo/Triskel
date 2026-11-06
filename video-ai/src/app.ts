import Fastify from 'fastify'
import crypto from 'node:crypto'
import { z, ZodError } from 'zod'
import { env } from './env'
import type { Db } from './db'
import { assertAllowedUrl } from './media'

const eq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y) }
const input = z.object({
  jobId: z.string().min(3).max(80),
  videoUrl: z.string().url().max(600).optional(),
  postUrl: z.string().max(400).optional(),
  briefing: z.object({
    campaignName: z.string().max(200), brand: z.string().max(200), product: z.string().max(300), message: z.string().max(300),
    cta: z.string().max(200).optional(), mentions: z.string().max(200).optional(), avoid: z.string().max(500).optional(), maxSeconds: z.number().int().min(5).max(600).default(60),
  }),
  requirements: z.array(z.object({ id: z.string().min(1).max(20), label: z.string().min(1).max(200) })).min(1).max(30),
  callbackUrl: z.string().url().max(400),
}).refine((v) => !!v.videoUrl !== !!v.postUrl, 'Envie videoUrl ou postUrl, nunca os dois.')

export async function buildApp(db: Db) {
  const app = Fastify({ logger: { level: env.LOG_LEVEL }, bodyLimit: 200_000 })
  app.setErrorHandler((err: any, _req, reply) => {
    if (err instanceof ZodError) return reply.status(422).send({ error: { code: 'VALIDATION', message: err.issues[0]?.message ?? 'Dados inválidos.' } })
    if ((err.statusCode ?? 500) < 500) return reply.status(err.statusCode).send({ error: { code: 'BAD_REQUEST', message: err.message } })
    app.log.error(err); return reply.status(500).send({ error: { code: 'INTERNAL', message: 'Erro interno.' } })
  })
  app.addHook('onRequest', async (req, reply) => {
    if (!req.url.startsWith('/v1/')) return
    const t = (req.headers.authorization || '').replace(/^Bearer /, '')
    if (!eq(t, env.VIDEOAI_API_KEY)) return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Chave inválida.' } })
  })
  app.get('/health', async () => ({ ok: true, engine: env.ANTHROPIC_API_KEY ? 'llm+ffprobe' : 'deterministic' }))

  /** Cria um job (idempotente por jobId). 202: o resultado chega por webhook assinado. */
  app.post('/v1/jobs', async (req, reply) => {
    const i = input.parse(req.body)
    try { if (i.videoUrl) assertAllowedUrl(i.videoUrl, env.ALLOWED_FETCH_HOSTS); assertAllowedUrl(i.callbackUrl, env.ALLOWED_CALLBACK_HOSTS) }
    catch (e) { return reply.status(422).send({ error: { code: 'URL_NOT_ALLOWED', message: (e as Error).message } }) }
    const prev = db.prepare('SELECT status FROM jobs WHERE id = ?').get(i.jobId) as any
    if (prev) return reply.status(202).send({ jobId: i.jobId, status: prev.status, duplicate: true })
    db.prepare("INSERT INTO jobs (id, status, input, callback_url, created_at) VALUES (?, 'queued', ?, ?, ?)").run(i.jobId, JSON.stringify({ ...i, requirements: i.requirements }), i.callbackUrl, Date.now())
    return reply.status(202).send({ jobId: i.jobId, status: 'queued' })
  })
  app.get('/v1/jobs/:id', async (req, reply) => {
    const j = db.prepare('SELECT id, status, result, error, cb_status, cb_attempts FROM jobs WHERE id = ?').get((req.params as any).id) as any
    if (!j) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Job não encontrado.' } })
    return { jobId: j.id, status: j.status, callback: { status: j.cb_status, attempts: j.cb_attempts }, error: j.error, result: j.result ? JSON.parse(j.result) : null }
  })
  return app
}
