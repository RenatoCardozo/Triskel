import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../db'
import { env } from '../env'
import { AppError, notFound, unprocessable } from '../lib/errors'
import { requireAuth, roles } from '../plugins/auth'
import { loadProfile, pricesSchema, profileSchemas, updateProfile } from '../services/profile'
import { meDto } from '../services/me'
import * as auth from '../services/auth'
import { passwordOk, telOk, fmtTel } from '../lib/validators'
import { sniff } from '../lib/filetype'
import { newStorageKey, storage } from '../lib/storage'
import { sha256 } from '../lib/crypto'
import { notify } from '../lib/emails'
import { SEG_OPTIONS } from '../services/segments'

export async function meRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['conta']

  app.patch('/profile', { schema: { tags, body: z.record(z.string(), z.unknown()) } }, async (req) => {
    const role = req.user!.role
    const parsed = profileSchemas[role].safeParse(req.body)
    if (!parsed.success) throw unprocessable('VALIDATION', `Dados inválidos: ${parsed.error.issues[0].message}`, parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
    await updateProfile(req.user!.id, role, parsed.data)
    return { user: await meDto(req.user!.id) }
  })

  app.patch('/prices', { preHandler: roles('CREATOR'), schema: { tags, body: pricesSchema } }, async (req) => {
    const b = req.body
    const cur = await prisma.creatorProfile.findUniqueOrThrow({ where: { userId: req.user!.id } })
    const reels = b.reels ?? cur.priceReels ?? 0, stories = b.stories ?? cur.priceStories ?? 0, tiktok = b.tiktok ?? cur.priceTiktok ?? 0
    const vals = [reels, stories, tiktok].filter((x) => x > 0)
    await prisma.creatorProfile.update({
      where: { userId: req.user!.id },
      data: { priceReels: reels, priceStories: stories, priceTiktok: tiktok, imageUse: b.img ?? cur.imageUse, showPrices: b.showPrices ?? cur.showPrices, acceptBelowMin: b.acceptBelowMin ?? cur.acceptBelowMin,
        vminCents: reels || (vals.length ? Math.min(...vals) : null), vmaxCents: vals.length ? Math.max(Math.round(Math.max(...vals) * 2.1), reels) : null },
    })
    return { user: await meDto(req.user!.id) }
  })

  app.patch('/phone', { schema: { tags, body: z.object({ tel: z.string().min(10).max(20) }) } }, async (req) => {
    if (!telOk(req.body.tel)) throw unprocessable('VALIDATION', 'Informe DDD e número. Ex.: (53) 99999-9999.')
    await prisma.user.update({ where: { id: req.user!.id }, data: { phone: fmtTel(req.body.tel) } })
    return { user: await meDto(req.user!.id) }
  })

  app.post('/email/request', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } }, schema: { tags, body: z.object({ email: z.string().trim().toLowerCase().email().max(120) }) } }, async (req) => {
    if (await prisma.user.findUnique({ where: { email: req.body.email } })) throw new AppError(409, 'EMAIL_IN_USE', 'Este e-mail já está em uso.')
    await auth.issueEmailCode(req.user!.id, 'NEW_EMAIL', req.body.email)
    return { ok: true }
  })
  app.post('/email/confirm', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } }, schema: { tags, body: z.object({ code: z.string().regex(/^\d{6}$/) }) } }, async (req) => {
    const row = await auth.checkEmailCode(req.user!.id, 'NEW_EMAIL', req.body.code)
    if (!row.newEmail) throw unprocessable('CODE_INVALID', 'Código inválido.')
    if (await prisma.user.findFirst({ where: { email: row.newEmail, NOT: { id: req.user!.id } } })) throw new AppError(409, 'EMAIL_IN_USE', 'Este e-mail já está em uso.')
    await prisma.user.update({ where: { id: req.user!.id }, data: { email: row.newEmail, emailVerifiedAt: new Date() } })
    return { user: await meDto(req.user!.id) }
  })

  app.post('/password', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } }, schema: { tags, body: z.object({ atual: z.string().min(1).max(72), nova: z.string().min(8).max(72) }) } }, async (req) => {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
    if (!(await auth.verifyPassword(req.body.atual, u.passwordHash))) throw unprocessable('WRONG_PASSWORD', 'Senha atual incorreta.')
    const pe = passwordOk(req.body.nova)
    if (pe) throw unprocessable('WEAK_PASSWORD', pe)
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: await auth.hashPassword(req.body.nova) } })
    await auth.revokeAllSessions(u.id) // troca de senha derruba todas as sessões
    return { ok: true, reauth: true }
  })

  app.patch('/prefs', { schema: { tags, body: z.object({ push: z.boolean().optional(), email: z.boolean().optional(), weekly: z.boolean().optional(), visible: z.boolean().optional() }) } }, async (req) => {
    const b = req.body
    await prisma.user.update({ where: { id: req.user!.id }, data: { prefPush: b.push, prefEmail: b.email, prefWeekly: b.weekly, visible: b.visible } })
    return { user: await meDto(req.user!.id) }
  })

  app.post('/photo/:kind', { schema: { tags, params: z.object({ kind: z.enum(['avatar', 'cover']) }), consumes: ['multipart/form-data'] } }, async (req) => {
    const part = await req.file({ limits: { fileSize: env.MAX_IMAGE_MB * 1024 * 1024 } })
    if (!part) throw unprocessable('VALIDATION', 'Envie uma imagem.')
    const buf = await part.toBuffer()
    if (part.file.truncated) throw unprocessable('TOO_LARGE', `A imagem pode ter no máximo ${env.MAX_IMAGE_MB} MB.`)
    const t = sniff(buf)
    if (!t || t.kind !== 'image') throw unprocessable('BAD_FILE', 'Use uma imagem JPG, PNG ou WebP.')
    const key = newStorageKey(t.ext)
    await storage.put(key, buf)
    const f = await prisma.storedFile.create({ data: { ownerId: req.user!.id, kind: req.params.kind, storageKey: key, mime: t.mime, size: buf.length, sha256: sha256(buf) } })
    await prisma.user.update({ where: { id: req.user!.id }, data: req.params.kind === 'avatar' ? { avatarFileId: f.id } : { coverFileId: f.id } })
    return { user: await meDto(req.user!.id) }
  })

  app.post('/data-request', { schema: { tags, body: z.object({ kind: z.enum(['EXPORT', 'DELETE']) }) } }, async (req) => {
    await prisma.dataRequest.create({ data: { userId: req.user!.id, kind: req.body.kind } })
    await notify(req.user!.id, 'dataRequest', req.body.kind === 'EXPORT'
      ? { title: 'Recebemos o seu pedido de dados', body: 'Enviaremos uma cópia dos seus dados para este e-mail em até 48 horas.' }
      : { title: 'Recebemos o seu pedido de exclusão', body: 'Registramos o pedido de exclusão da sua conta. Contratos em andamento precisam ser concluídos antes.' })
    return { ok: true }
  })

  // portfólio (criador): título + descrição, como no protótipo
  app.get('/portfolio', { preHandler: roles('CREATOR'), schema: { tags } }, async (req) => ({
    items: await prisma.portfolioItem.findMany({ where: { creatorId: req.user!.id }, orderBy: { createdAt: 'desc' } }),
  }))
  app.post('/portfolio', { preHandler: roles('CREATOR'), schema: { tags, body: z.object({ title: z.string().trim().min(3).max(80), description: z.string().trim().min(3).max(120) }) } }, async (req, reply) => {
    const n = await prisma.portfolioItem.count({ where: { creatorId: req.user!.id } })
    if (n >= 50) throw unprocessable('LIMIT', 'Limite de 50 trabalhos no portfólio.')
    return reply.status(201).send({ item: await prisma.portfolioItem.create({ data: { creatorId: req.user!.id, ...req.body } }) })
  })
  app.delete('/portfolio/:id', { preHandler: roles('CREATOR'), schema: { tags, params: z.object({ id: z.string() }) } }, async (req, reply) => {
    const r = await prisma.portfolioItem.deleteMany({ where: { id: req.params.id, creatorId: req.user!.id } })
    if (!r.count) throw notFound()
    return reply.status(204).send()
  })

  // clientes da agência
  app.get('/clients', { preHandler: roles('AGENCY'), schema: { tags } }, async (req) => ({
    clients: await prisma.agencyClient.findMany({ where: { agencyId: req.user!.id }, orderBy: { createdAt: 'asc' } }),
    segments: SEG_OPTIONS,
  }))
  app.post('/clients', { preHandler: roles('AGENCY'), schema: { tags, body: z.object({ name: z.string().trim().min(2).max(60), segment: z.enum(SEG_OPTIONS as [string, ...string[]]) }) } }, async (req, reply) => {
    return reply.status(201).send({ client: await prisma.agencyClient.create({ data: { agencyId: req.user!.id, ...req.body } }) })
  })
  void loadProfile
}
