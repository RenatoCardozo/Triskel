import { env } from './env'
import { openDb } from './db'
import { buildApp } from './app'
import { pump } from './worker'
import { deliverDue } from './webhook'

async function main() {
  const db = openDb()
  const app = await buildApp(db)
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`engine: ${env.ANTHROPIC_API_KEY ? 'LLM + ffprobe' : 'determinístico (ffprobe/ffmpeg)'}`)
  let busy = false
  const timer = setInterval(async () => {
    if (busy) return
    busy = true
    try { await pump(db); await deliverDue(db) } catch (e) { app.log.error(e) } finally { busy = false }
  }, 500)
  const stop = async () => { clearInterval(timer); await app.close(); process.exit(0) }
  process.on('SIGTERM', stop); process.on('SIGINT', stop)
}
main().catch((e) => { console.error(e); process.exit(1) })
