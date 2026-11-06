import { env } from './env'
import { openStore } from './store'
import { buildApp } from './app'
import { startSmtp } from './smtp'

async function main() {
  const db = openStore()
  const app = await buildApp(db)
  await app.listen({ port: env.WEB_PORT, host: '0.0.0.0' })
  const smtp = env.SMTP_ENABLED ? await startSmtp(db, app.log) : null
  app.log.info(`${smtp ? `SMTP de captura em :${env.SMTP_PORT}` : 'SMTP desligado (ingestão por HTTP)'}, caixa de entrada na porta ${env.WEB_PORT}`)
  const stop = async () => { smtp?.close(); await app.close(); process.exit(0) }
  process.on('SIGTERM', stop); process.on('SIGINT', stop)
}
main().catch((e) => { console.error(e); process.exit(1) })
