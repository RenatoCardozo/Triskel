import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { requireAuth } from '../plugins/auth'
import { dashboard } from '../services/dashboard'

export async function dashboardRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  app.get('/dashboard', { schema: { tags: ['painel'] } }, async (req) => dashboard(req.user!.id, req.user!.role))
}
