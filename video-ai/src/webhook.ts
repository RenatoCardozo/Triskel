import crypto from 'node:crypto'
import { env } from './env'
import type { Db } from './db'

export const sign = (secret: string, ts: number | string, body: string) => 'sha256=' + crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex')
export const backoffMs = (attempt: number, base = env.WEBHOOK_BACKOFF_BASE_MS) => base * 2 ** (attempt - 1)

/** Entrega os resultados pendentes (idempotente: o id do evento é estável por job). Retenta com backoff e desiste na 6ª tentativa. */
export async function deliverDue(db: Db, post: typeof fetch = fetch) {
  const due = db.prepare("SELECT * FROM jobs WHERE cb_status = 'pending' AND cb_next <= ? ORDER BY finished_at LIMIT 10").all(Date.now()) as any[]
  for (const j of due) {
    const eventId = `evt_${j.id}_completed`
    const body = JSON.stringify({ id: eventId, type: 'analysis.completed', created: Math.floor(Date.now() / 1000), data: { jobId: j.id, ...JSON.parse(j.result) } })
    const attempt = j.cb_attempts + 1
    let err: string | null = null
    try {
      const ts = Math.floor(Date.now() / 1000)
      const res = await post(j.callback_url, {
        method: 'POST', signal: AbortSignal.timeout(8000),
        headers: { 'content-type': 'application/json', 'x-triskel-timestamp': String(ts), 'x-triskel-event-id': eventId, 'x-triskel-signature': sign(env.WEBHOOK_SECRET, ts, body) },
        body,
      })
      if (!res.ok) err = `HTTP ${res.status}`
    } catch (e) { err = (e as Error).message }
    if (!err) db.prepare("UPDATE jobs SET cb_status = 'delivered', cb_attempts = ?, cb_last_error = NULL WHERE id = ?").run(attempt, j.id)
    else if (attempt >= env.WEBHOOK_MAX_ATTEMPTS) db.prepare("UPDATE jobs SET cb_status = 'failed', cb_attempts = ?, cb_last_error = ? WHERE id = ?").run(attempt, err, j.id)
    else db.prepare('UPDATE jobs SET cb_attempts = ?, cb_last_error = ?, cb_next = ? WHERE id = ?').run(attempt, err, Date.now() + backoffMs(attempt), j.id)
  }
  return due.length
}
