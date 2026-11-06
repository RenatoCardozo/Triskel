import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { requireAuth } from '../plugins/auth'
import { createReview, receivedReviews, reviewCandidates } from '../services/reviews'

export async function reviewRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['avaliações']
  app.get('/reviews/candidates', { schema: { tags } }, async (req) => reviewCandidates(req.user!.id, req.user!.role))
  app.get('/reviews/received', { schema: { tags } }, async (req) => receivedReviews(req.user!.id))
  app.post('/reviews', { schema: { tags, body: z.object({ targetUserId: z.string(), stars: z.number().int().min(1).max(5), tags: z.array(z.string()).max(4).default([]), comment: z.string().trim().max(300).optional() }).strict() } },
    async (req, reply) => { await createReview(req.user!.id, req.user!.role, req.body); return reply.status(201).send({ ok: true }) })
}
