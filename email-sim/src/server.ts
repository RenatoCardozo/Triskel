import { env } from './env'
import { openStore } from './store'
import { buildApp } from './app'
import { startSmtp } from './smtp'

async function main() {
  const db = openStore()
  const app = await buildApp(db)
  await app.listen({ port: env.WEB_PORT, host: '0.0.0.0' })
  const smtp = await startSmtp(db, app.log)
  app.log.info(`SMTP de captura em :${env.SMTP_PORT}, caixa de entrada em http://localhost:${env.WEB_PORT}`)
  const stop = async () => { smtp.close(); await app.close(); process.exit(0) }
  process.on('SIGTERM', stop); process.on('SIGINT', stop)
}
main().catch((e) => { console.error(e); process.exit(1) })
