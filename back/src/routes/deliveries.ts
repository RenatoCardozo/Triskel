import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { requireAuth, roles } from '../plugins/auth'
import { unprocessable } from '../lib/errors'
import { env } from '../env'
import {
  approve, createSubmission, deliveryDto, listDeliveries, loadDelivery, requestAdjust, requestPublish, sendForApproval, validatePostUrl, REQI,
} from '../services/deliveries'

export async function deliveryRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['entregas']
  const id = z.object({ id: z.string() })
  const view = async (userId: string, deliveryId: string) => { const { d, side } = await loadDelivery(deliveryId, userId); return { delivery: deliveryDto(d, side) } }

  app.get('/', { schema: { tags } }, async (req) => {
    const items = await listDeliveries(req.user!.id, req.user!.role)
    return { items, counts: { all: items.length, needsYou: items.filter((x) => x.needsYou).length }, requirements: REQI.map(([rid, label]) => ({ id: rid, label })) }
  })
  app.get('/:id', { schema: { tags, params: id } }, async (req) => view(req.user!.id, req.params.id))

  /** Criador envia vídeo (multipart, campo "file") ou link de post (JSON {url}). */
  app.post('/:id/submissions', { preHandler: roles('CREATOR'), config: { rateLimit: { max: 20, timeWindow: '1 minute' } }, schema: { tags, params: id, consumes: ['multipart/form-data', 'application/json'] } }, async (req, reply) => {
    if (req.isMultipart()) {
      const part = await req.file({ limits: { fileSize: env.MAX_VIDEO_MB * 1024 * 1024 } })
      if (!part) throw unprocessable('VALIDATION', 'Escolha o vídeo da entrega.')
      await createSubmission(req.user!.id, req.params.id, { kind: 'VIDEO', stream: part.file, fileName: part.filename || 'video', truncated: () => part.file.truncated })
    } else {
      const b = z.object({ url: z.string().min(5).max(300) }).strict().safeParse(req.body)
      if (!b.success) throw unprocessable('VALIDATION', 'Informe o link do post.')
      await createSubmission(req.user!.id, req.params.id, { kind: 'POST', url: validatePostUrl(b.data.url) })
    }
    return reply.status(201).send(await view(req.user!.id, req.params.id))
  })
  app.post('/:id/send', { preHandler: roles('CREATOR'), schema: { tags, params: id } }, async (req) => { await sendForApproval(req.user!.id, req.params.id); return view(req.user!.id, req.params.id) })
  app.post('/:id/approve', { preHandler: roles('BUSINESS', 'AGENCY'), schema: { tags, params: id } }, async (req) => { await approve(req.user!.id, req.params.id); return view(req.user!.id, req.params.id) })
  app.post('/:id/adjust', { preHandler: roles('BUSINESS', 'AGENCY'), schema: { tags, params: id, body: z.object({ comment: z.string().max(600) }).strict() } }, async (req) => {
    await requestAdjust(req.user!.id, req.params.id, req.body.comment)
    return view(req.user!.id, req.params.id)
  })
  app.post('/:id/publish', { preHandler: roles('CREATOR'), schema: { tags, params: id, body: z.object({ url: z.string().max(300) }).strict() } }, async (req, reply) => {
    await requestPublish(req.user!.id, req.params.id, req.body.url)
    return reply.status(202).send(await view(req.user!.id, req.params.id))
  })
}
