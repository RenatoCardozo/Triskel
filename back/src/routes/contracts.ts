import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { requireAuth, roles } from '../plugins/auth'
import { contractPdf, contractView, payContract, proposalContractPreview, signAsCreator } from '../services/contracts'

export async function contractRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  app.addHook('preHandler', requireAuth)
  const tags = ['contratos']
  const id = z.object({ id: z.string() })

  /** Resumo + minuta da proposta aceita (antes do pagamento) ou redireciona ao contrato existente. */
  app.get('/proposals/:id/contract', { schema: { tags, params: id } }, async (req) => proposalContractPreview(req.params.id, req.user!.id))

  /** Pagamento com o saldo da carteira: cria contrato, custódia e (se possível) a assinatura do contratante. */
  app.post('/proposals/:id/pay', { preHandler: roles('BUSINESS', 'AGENCY'), config: { rateLimit: { max: 10, timeWindow: '1 minute' } }, schema: { tags, params: id } }, async (req, reply) => {
    const contractId = await payContract(req.params.id, req.user!.id)
    return reply.status(201).send(await contractView(contractId, req.user!.id))
  })

  app.get('/contracts/:id', { schema: { tags, params: id } }, async (req) => contractView(req.params.id, req.user!.id))

  /** Assinatura do criador com aceite expresso. */
  app.post('/contracts/:id/sign', {
    preHandler: roles('CREATOR'),
    schema: { tags, params: id, body: z.object({ accept: z.literal(true, { error: 'Marque que leu e concorda com o contrato para assinar.' }) }).strict() },
  }, async (req) => {
    await signAsCreator(req.params.id, req.user!.id)
    return contractView(req.params.id, req.user!.id)
  })

  app.get('/contracts/:id/pdf', { schema: { tags, params: id, querystring: z.object({ download: z.enum(['0', '1']).default('1') }) } }, async (req, reply) => {
    const f = await contractPdf(req.params.id, req.user!.id)
    return reply.header('content-type', 'application/pdf').header('cache-control', 'private, no-store')
      .header('content-disposition', `${req.query.download === '1' ? 'attachment' : 'inline'}; filename="${f.name}"`).send(f.data)
  })
}
