import Fastify, { FastifyError } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { ZodError } from 'zod'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider, hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { env } from './env'
import { logger } from './lib/logger'
import { AppError } from './lib/errors'
import { authRoutes } from './routes/auth'
import { meRoutes } from './routes/me'
import { publicRoutes } from './routes/public'
import { creatorRoutes } from './routes/creators'
import { campaignRoutes } from './routes/campaigns'
import { proposalRoutes } from './routes/proposals'
import { contractRoutes } from './routes/contracts'
import { walletRoutes } from './routes/wallet'
import { deliveryRoutes } from './routes/deliveries'
import { reviewRoutes } from './routes/reviews'
import { dashboardRoutes } from './routes/dashboard'
import { fileRoutes } from './routes/files'
import { webhookRoutes } from './routes/webhooks'

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    trustProxy: true,
    bodyLimit: 1_000_000,
  }).withTypeProvider<ZodTypeProvider>()
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(helmet, { contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", 'data:'], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'", "'unsafe-inline'"] } }, crossOriginResourcePolicy: { policy: 'same-site' } })
  const origins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  await app.register(cors, { origin: (o, cb) => cb(null, !o || origins.includes(o)), credentials: true, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] })
  await app.register(rateLimit, { global: true, max: env.RATE_LIMIT_MAX, timeWindow: '1 minute', allowList: (req) => req.url.startsWith('/webhooks') })
  await app.register(multipart, { limits: { fileSize: env.MAX_VIDEO_MB * 1024 * 1024, files: 1, fields: 10 } })
  await app.register(swagger, {
    openapi: { info: { title: 'Triskel API', version: '1.0.0', description: 'API da plataforma Triskel (criadores, comércios e agências).' },
      components: { securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } }, security: [{ bearer: [] }] },
    transform: jsonSchemaTransform,
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  // corpo bruto para validar HMAC dos webhooks
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    req.rawBody = body as string
    if (!body) return done(null, {})
    try { done(null, JSON.parse(body as string)) } catch { const e: any = new Error('JSON inválido'); e.statusCode = 400; done(e) }
  })

  app.setErrorHandler((err: FastifyError | AppError | ZodError, req, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.status).send({ error: { code: err.code, message: err.message, details: err.details } })
    }
    if (hasZodFastifySchemaValidationErrors(err as any) || err instanceof ZodError) {
      const issues = (err as any).validation?.map((v: any) => ({ path: String(v.instancePath || '').replace(/^\//, '').replace(/\//g, '.'), message: v.message })) ?? (err as ZodError).issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
      return reply.status(422).send({ error: { code: 'VALIDATION', message: issues[0]?.message ? `Dados inválidos: ${issues[0].message}` : 'Dados inválidos.', details: issues } })
    }
    const status = (err as FastifyError).statusCode ?? 500
    if (status === 429) return reply.status(429).send({ error: { code: 'RATE_LIMIT', message: 'Muitas requisições. Aguarde um instante e tente de novo.' } })
    if (status >= 500) req.log.error({ err }, 'erro não tratado')
    return reply.status(status).send({ error: { code: status >= 500 ? 'INTERNAL' : 'BAD_REQUEST', message: status >= 500 ? 'Erro interno. Tente novamente.' : (err as Error).message } })
  })
  app.setNotFoundHandler((_req, reply) => reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } }))

  app.get('/health', { schema: { hide: true } }, async () => ({ ok: true }))
  const v1 = { prefix: '/api/v1' }
  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(meRoutes, { prefix: '/api/v1/me' })
  await app.register(publicRoutes, v1)
  await app.register(creatorRoutes, v1)
  await app.register(campaignRoutes, v1)
  await app.register(proposalRoutes, v1)
  await app.register(contractRoutes, v1)
  await app.register(walletRoutes, { prefix: '/api/v1/wallet' })
  await app.register(deliveryRoutes, { prefix: '/api/v1/deliveries' })
  await app.register(reviewRoutes, v1)
  await app.register(dashboardRoutes, v1)
  await app.register(fileRoutes)
  await app.register(webhookRoutes, { prefix: '/webhooks' })
  return app
}
