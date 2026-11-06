import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { env } from './env'
import type { Store } from './store'

const eq = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y) }
const dto = (r: any) => ({ id: r.id, receivedAt: new Date(r.received_at).toISOString(), from: r.from_addr, to: JSON.parse(r.to_addrs) as string[], subject: r.subject, read: !!r.read, code: r.code as string | null, hasAttachments: !!r.att })

export async function buildApp(db: Store) {
  const app = Fastify({ logger: { level: env.LOG_LEVEL }, bodyLimit: 10_000 })
  await app.register(helmet, { contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"], frameSrc: ["'self'"], frameAncestors: ["'self'"] } }, frameguard: { action: 'sameorigin' } })
  app.addHook('onRequest', async (req, reply) => {
    if (!env.EMAILSIM_API_KEY || !req.url.startsWith('/api/')) return
    if (!eq(String(req.headers['x-api-key'] || ''), env.EMAILSIM_API_KEY)) return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Chave inválida.' } })
  })
  app.get('/health', async () => ({ ok: true }))

  const SEL = 'SELECT m.*, (SELECT COUNT(*) FROM attachments a WHERE a.message_id = m.id) AS att FROM messages m'
  app.get('/api/messages', async (req) => {
    const q = z.object({ to: z.string().optional(), subject: z.string().optional(), q: z.string().optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }).parse(req.query)
    const rows = db.prepare(`${SEL} ORDER BY m.received_at DESC LIMIT 500`).all() as any[]
    const f = rows.filter((r) => (!q.to || JSON.parse(r.to_addrs).includes(q.to.toLowerCase())) && (!q.subject || r.subject.toLowerCase().includes(q.subject.toLowerCase())) && (!q.q || `${r.subject} ${r.text} ${r.from_addr} ${r.to_addrs}`.toLowerCase().includes(q.q.toLowerCase())))
    return { total: f.length, unread: f.filter((r) => !r.read).length, items: f.slice(0, q.limit).map(dto) }
  })
  /** Atalho para testes automáticos: a mensagem mais recente para um destinatário (opcionalmente por assunto). */
  app.get('/api/messages/latest', async (req, reply) => {
    const q = z.object({ to: z.string(), subject: z.string().optional(), since: z.coerce.number().optional() }).parse(req.query)
    const r = (db.prepare(`${SEL} ORDER BY m.received_at DESC LIMIT 500`).all() as any[]).find((x) => JSON.parse(x.to_addrs).includes(q.to.toLowerCase()) && (!q.subject || x.subject.toLowerCase().includes(q.subject.toLowerCase())) && (!q.since || x.received_at >= q.since))
    if (!r) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Nenhuma mensagem.' } })
    return { ...dto(r), text: r.text, html: r.html }
  })
  app.get('/api/messages/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const r = db.prepare(`${SEL} WHERE m.id = ?`).get(id) as any
    if (!r) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Mensagem não encontrada.' } })
    db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(id)
    const atts = db.prepare('SELECT n, filename, content_type, size FROM attachments WHERE message_id = ? ORDER BY n').all(id) as any[]
    return { ...dto(r), read: true, text: r.text, html: r.html, attachments: atts.map((a) => ({ n: a.n, filename: a.filename, contentType: a.content_type, size: a.size, url: `/api/messages/${id}/attachments/${a.n}` })) }
  })
  app.get('/api/messages/:id/attachments/:n', async (req, reply) => {
    const { id, n } = req.params as { id: string; n: string }
    const a = db.prepare('SELECT * FROM attachments WHERE message_id = ? AND n = ?').get(id, Number(n)) as any
    if (!a) return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Anexo não encontrado.' } })
    return reply.header('content-type', a.content_type).header('x-content-type-options', 'nosniff').header('content-disposition', `attachment; filename="${String(a.filename).replace(/[^\w.\- ]/g, '_')}"`).send(Buffer.from(a.data))
  })
  app.delete('/api/messages/:id', async (req, reply) => { db.prepare('DELETE FROM messages WHERE id = ?').run((req.params as any).id); return reply.status(204).send() })
  app.delete('/api/messages', async (_req, reply) => { db.exec('DELETE FROM messages'); return reply.status(204).send() })

  const uiDir = [path.join(__dirname, 'ui'), path.join(process.cwd(), 'src/ui')].find((d) => fs.existsSync(d))!
  const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' }
  const serve = (file: string) => async (_r: any, reply: any) => reply.header('content-type', types[path.extname(file)]).header('cache-control', 'no-cache').send(fs.readFileSync(path.join(uiDir, file)))
  app.get('/', serve('index.html'))
  app.get('/ui/app.js', serve('app.js'))
  app.get('/ui/app.css', serve('app.css'))
  /** HTML do e-mail em página própria, dentro de iframe com sandbox (sem scripts, sem formulários). */
  app.get('/view/:id', async (req, reply) => {
    const r = db.prepare('SELECT html, text FROM messages WHERE id = ?').get((req.params as any).id) as any
    if (!r) return reply.status(404).send('Mensagem não encontrada.')
    const body = r.html || `<pre style="white-space:pre-wrap;font-family:system-ui">${String(r.text).replace(/[&<>]/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))}</pre>`
    return reply.header('content-type', 'text/html; charset=utf-8').header('content-security-policy', "default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; sandbox").send(body)
  })
  return app
}
