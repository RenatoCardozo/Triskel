import { buildApp } from './app'
import { env } from './env'
import { logger } from './lib/logger'
import { startJobs } from './jobs/publication'
import { prisma } from './db'

async function main() {
  const app = await buildApp()
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  const stop = env.JOBS_ENABLED ? startJobs() : () => {}
  const shutdown = async (sig: string) => {
    logger.info({ sig }, 'encerrando')
    stop()
    await app.close()
    await prisma.$disconnect()
    process.exit(0)
  }
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}
main().catch((e) => { logger.error(e); process.exit(1) })
