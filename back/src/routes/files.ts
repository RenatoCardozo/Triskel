import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fs from 'node:fs'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { prisma } from '../db'
import { requireAuth } from '../plugins/auth'
import { notFound } from '../lib/errors'
import { storage } from '../lib/storage'
import { verifyFileSig } from '../lib/fileToken'

/** Envia o arquivo com suporte a Range (necessário para <video>). O tipo vem do sniff feito no upload, nunca do cliente. */
async function sendFile(req: FastifyRequest, reply: FastifyReply, f: { storageKey: string; mime: string; size: number }) {
  reply.header('content-type', f.mime).header('accept-ranges', 'bytes').header('x-content-type-options', 'nosniff').header('content-disposition', 'inline')
  const range = req.headers.range
  const p = storage.path?.(f.storageKey)
  if (range && p) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range)
    if (m) {
      let start = m[1] ? Number(m[1]) : NaN, end = m[2] ? Number(m[2]) : NaN
      if (Number.isNaN(start)) { start = Math.max(0, f.size - end); end = f.size - 1 } else if (Number.isNaN(end) || end >= f.size) end = f.size - 1
      if (start > end || start >= f.size) return reply.status(416).header('content-range', `bytes */${f.size}`).send()
      return reply.status(206).header('content-range', `bytes ${start}-${end}/${f.size}`).header('content-length', end - start + 1).send(fs.createReadStream(p, { start, end }))
    }
  }
  return reply.header('content-length', f.size).send(storage.stream(f.storageKey))
}

export async function fileRoutes(app0: FastifyInstance) {
  const app = app0.withTypeProvider<ZodTypeProvider>()
  const tags = ['arquivos']

  /** Fotos de perfil/capa: qualquer usuário autenticado. Vídeos de entrega: só as partes do contrato. */
  app.get('/files/:id', { preHandler: requireAuth, schema: { tags, params: z.object({ id: z.string() }) } }, async (req, reply) => {
    const f = await prisma.storedFile.findUnique({ where: { id: req.params.id } })
    if (!f) throw notFound('Arquivo não encontrado.')
    if (f.kind === 'video') {
      const sub = await prisma.submission.findFirst({ where: { fileId: f.id, delivery: { contract: { OR: [{ contractorId: req.user!.id }, { creatorId: req.user!.id }] } } }, select: { id: true } })
      if (!sub) throw notFound('Arquivo não encontrado.')
    } else if (f.kind !== 'avatar' && f.kind !== 'cover') throw notFound('Arquivo não encontrado.')
    reply.header('cache-control', 'private, max-age=300')
    return sendFile(req, reply, f)
  })

  /** Para o video-ai: URL assinada com validade curta. */
  app.get('/internal/files/:id', { schema: { hide: true, params: z.object({ id: z.string() }), querystring: z.object({ exp: z.string().optional(), sig: z.string().optional() }) } }, async (req, reply) => {
    if (!verifyFileSig(req.params.id, req.query.exp, req.query.sig)) throw notFound('Arquivo não encontrado.')
    const f = await prisma.storedFile.findFirst({ where: { id: req.params.id, kind: 'video' } })
    if (!f) throw notFound('Arquivo não encontrado.')
    reply.header('cache-control', 'no-store')
    return sendFile(req, reply, f)
  })
}
