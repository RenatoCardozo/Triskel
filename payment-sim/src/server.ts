import { env } from './env'
import { openDb } from './db'
import { buildApp } from './app'
import { deliverDue } from './webhooks'
import { tick } from './gateway'

async function main() {
  const db = openDb()
  const app = await buildApp(db)
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  let busy = false
  const timer = setInterval(async () => {
    if (busy) return
    busy = true
    try { await tick(db); await deliverDue(db) } catch (e) { app.log.error(e) } finally { busy = false }
  }, 500)
  const stop = async () => { clearInterval(timer); await app.close(); process.exit(0) }
  process.on('SIGTERM', stop); process.on('SIGINT', stop)
}
main().catch((e) => { console.error(e); process.exit(1) })
