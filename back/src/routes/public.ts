import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../db'
import { notFound } from '../lib/errors'
import { OPT } from '../lib/options'
import { rid } from '../lib/crypto'
import { SEGOF_PUBLIC } from '../services/segments'

export async function publicRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  const tags = ['público']

  app.get('/meta', { schema: { tags, security: [] } }, async () => ({ options: OPT, segments: SEGOF_PUBLIC }))

  const news = (n: any, full = false) => ({
    slug: n.slug, category: n.category, publishedAt: n.publishedAt, readMins: n.readMins, title: n.title, summary: n.summary, ...(full ? { paragraphs: n.paragraphs } : {}),
  })
  app.get('/news', { schema: { tags, security: [], querystring: z.object({ category: z.string().optional(), limit: z.coerce.number().int().min(1).max(50).optional() }) } }, async (req) => {
    const rows = await prisma.newsArticle.findMany({ where: req.query.category && req.query.category !== 'Todas' ? { category: req.query.category } : {}, orderBy: { publishedAt: 'desc' }, take: req.query.limit })
    const cats = await prisma.newsArticle.findMany({ select: { category: true }, distinct: ['category'] })
    return { articles: rows.map((n) => news(n)), categories: cats.map((c) => c.category) }
  })
  app.get('/news/:slug', { schema: { tags, security: [], params: z.object({ slug: z.string().max(80) }) } }, async (req) => {
    const n = await prisma.newsArticle.findUnique({ where: { slug: req.params.slug } })
    if (!n) throw notFound('Notícia não encontrada.')
    const rel = await prisma.newsArticle.findMany({ where: { slug: { not: n.slug } }, orderBy: { publishedAt: 'desc' } })
    rel.sort((a, b) => Number(b.category === n.category) - Number(a.category === n.category) || +b.publishedAt - +a.publishedAt)
    return { article: news(n, true), related: rel.slice(0, 2).map((x) => news(x)) }
  })

  app.post('/contact', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    schema: { tags, security: [], body: z.object({
      name: z.string().trim().min(3).max(80), email: z.string().trim().email().max(120),
      profile: z.enum(['Criador de conteúdo', 'Comércio', 'Agência', 'Ainda não tenho conta']),
      subject: z.enum(['Dúvida sobre a plataforma', 'Pagamentos e carteira', 'Contratos e entregas', 'Problema com a conta', 'Privacidade e dados (LGPD)', 'Sugestão ou elogio', 'Outro assunto']),
      message: z.string().trim().min(10).max(2000),
    }) },
  }, async (req, reply) => {
    const protocol = 'TRK-' + rid(8)
    const m = await prisma.contactMessage.create({ data: { protocol, ...req.body } })
    return reply.status(201).send({ protocol: m.protocol, email: m.email, subject: m.subject, createdAt: m.createdAt })
  })
}
