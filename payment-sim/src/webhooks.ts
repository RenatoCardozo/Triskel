import crypto from 'node:crypto'
import { env } from './env'
import type { Db } from './db'

export const sign = (secret: string, ts: number | string, body: string) => 'sha256=' + crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex')
export const newId = (p: string, n = 12) => `${p}_${crypto.randomBytes(n).toString('hex')}`

/** Enfileira o evento; o entregador (worker) faz o POST assinado e retenta com backoff exponencial. */
export function enqueue(db: Db, type: string, data: unknown) {
  const id = newId('evt', 10)
  const payload = JSON.stringify({ id, type, created: Math.floor(Date.now() / 1000), data })
  db.prepare('INSERT INTO events (id, type, payload, next_attempt_at, created_at) VALUES (?, ?, ?, ?, ?)').run(id, type, payload, Date.now(), Date.now())
  return id
}
export const backoffMs = (attempt: number, base = env.WEBHOOK_BACKOFF_BASE_MS) => base * 2 ** (attempt - 1)

export async function deliverDue(db: Db, post: typeof fetch = fetch) {
  if (!env.WEBHOOK_URL) return 0
  const due = db.prepare("SELECT * FROM events WHERE status = 'pending' AND next_attempt_at <= ? ORDER BY created_at LIMIT 20").all(Date.now()) as any[]
  for (const ev of due) {
    const attempt = ev.attempts + 1
    let st: number | null = null, err: string | null = null
    try {
      const ts = Math.floor(Date.now() / 1000)
      const res = await post(env.WEBHOOK_URL, {
        method: 'POST', signal: AbortSignal.timeout(5000),
        headers: { 'content-type': 'application/json', 'x-triskel-timestamp': String(ts), 'x-triskel-event-id': ev.id, 'x-triskel-signature': sign(env.WEBHOOK_SECRET, ts, ev.payload) },
        body: ev.payload,
      })
      st = res.status
      if (!res.ok) err = `HTTP ${res.status}`
    } catch (e) { err = (e as Error).message }
    if (!err) db.prepare("UPDATE events SET status = 'delivered', attempts = ?, last_status = ?, last_error = NULL WHERE id = ?").run(attempt, st, ev.id)
    else if (attempt >= env.WEBHOOK_MAX_ATTEMPTS) db.prepare("UPDATE events SET status = 'failed', attempts = ?, last_status = ?, last_error = ? WHERE id = ?").run(attempt, st, err, ev.id)
    else db.prepare('UPDATE events SET attempts = ?, last_status = ?, last_error = ?, next_attempt_at = ? WHERE id = ?').run(attempt, st, err, Date.now() + backoffMs(attempt), ev.id)
  }
  return due.length
}
