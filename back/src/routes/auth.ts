import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { env } from '../env'
import { AppError, unprocessable } from '../lib/errors'
import { cnpjOk, cpfOk, passwordOk, telOk, UFS } from '../lib/validators'
import { parseISODate } from '../lib/dates'
import * as auth from '../services/auth'
import { requireAuth } from '../plugins/auth'
import { prisma } from '../db'
import { meDto } from '../services/me'

const email = z.string().trim().toLowerCase().email().max(120)
const meta = (req: any) => ({ ip: req.ip, ua: req.headers['user-agent'] })
const authLimit = { rateLimit: { max: env.AUTH_RATE_LIMIT_MAX, timeWindow: '1 minute' } }

const registerBody = z.object({
  role: z.enum(['CREATOR', 'BUSINESS', 'AGENCY']),
  nome: z.string().trim().min(3, 'Informe o nome.').max(60),
  resp: z.string().trim().min(3).max(60).optional(),
  doc: z.string().min(11).max(18),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use uma data válida.'),
  cidade: z.string().trim().min(2).max(40),
  uf: z.string().trim().toUpperCase().refine((u) => UFS.includes(u), 'UF inválida.'),
  email, tel: z.string().min(10).max(20), senha: z.string().min(8).max(72),
  aceite: z.literal(true, { error: 'Aceite os Termos de uso e a Política de privacidade.' }),
})

export async function authRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()

  app.post('/register', { config: authLimit, schema: { tags: ['auth'], security: [], body: registerBody } }, async (req, reply) => {
    const b = req.body
    const pe = passwordOk(b.senha)
    if (pe) throw unprocessable('WEAK_PASSWORD', pe)
    if (!telOk(b.tel)) throw unprocessable('VALIDATION', 'Informe DDD e número. Ex.: (53) 99999-9999.')
    const d = parseISODate(b.data)
    if (!d || d > new Date()) throw unprocessable('VALIDATION', 'Data inválida.')
    if (b.role === 'CREATOR') {
      if (!cpfOk(b.doc)) throw unprocessable('VALIDATION', 'CPF inválido.')
      if (Date.now() - d.getTime() < 18 * 365.25 * 86_400_000) throw unprocessable('UNDERAGE', 'A Triskel é voltada a maiores de 18 anos.')
    } else {
      if (!cnpjOk(b.doc)) throw unprocessable('VALIDATION', 'CNPJ inválido.')
      if (!b.resp) throw unprocessable('VALIDATION', 'Informe o nome do responsável.')
    }
    const user = await auth.register({ role: b.role, nome: b.nome, resp: b.resp, doc: b.doc, data: d, cidade: b.cidade, uf: b.uf, email: b.email, tel: b.tel, senha: b.senha })
    const session = await auth.startSession(user, meta(req))
    return reply.status(201).send({ session, user: await meDto(user.id) })
  })

  app.post('/login', { config: authLimit, schema: { tags: ['auth'], security: [], body: z.object({ email, senha: z.string().min(1).max(72) }) } }, async (req) => {
    const { user, session } = await auth.login(req.body.email, req.body.senha, meta(req))
    return { session, user: await meDto(user.id) }
  })

  app.post('/refresh', { config: authLimit, schema: { tags: ['auth'], security: [], body: z.object({ refreshToken: z.string().min(20).max(200) }) } }, async (req) => {
    const { user, session } = await auth.refresh(req.body.refreshToken, meta(req))
    return { session, user: { id: user.id, role: user.role } }
  })

  app.post('/logout', { schema: { tags: ['auth'], security: [], body: z.object({ refreshToken: z.string().min(20).max(200) }) } }, async (req, reply) => {
    await auth.logout(req.body.refreshToken)
    return reply.status(204).send()
  })

  app.post('/verify-email', { preHandler: requireAuth, config: authLimit, schema: { tags: ['auth'], body: z.object({ code: z.string().regex(/^\d{6}$/, 'O código tem 6 dígitos.') }) } }, async (req) => {
    const uid = req.user!.id
    await auth.checkEmailCode(uid, 'VERIFY', req.body.code)
    await prisma.user.update({ where: { id: uid }, data: { emailVerifiedAt: new Date() } })
    return { user: await meDto(uid) }
  })

  app.post('/resend-code', { preHandler: requireAuth, config: { rateLimit: { max: 3, timeWindow: '1 minute' } }, schema: { tags: ['auth'] } }, async (req) => {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
    if (u.emailVerifiedAt) throw new AppError(409, 'ALREADY_VERIFIED', 'E-mail já validado.')
    await auth.issueEmailCode(u.id, 'VERIFY')
    return { ok: true }
  })

  app.get('/me', { preHandler: requireAuth, schema: { tags: ['auth'] } }, async (req) => ({ user: await meDto(req.user!.id) }))
}
