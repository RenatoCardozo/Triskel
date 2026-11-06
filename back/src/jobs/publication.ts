import { prisma } from '../db'
import { logger } from '../lib/logger'
import { processCheck, failAnalysis } from '../services/deliveries'

/** Job periódico: confirmação de publicação + análises de IA que nunca voltaram. */
export function startJobs(intervalMs = 1000): () => void {
  let busy = false
  const tick = async () => {
    if (busy) return
    busy = true
    try {
      const due = await prisma.publicationCheck.findMany({ where: { state: 'PENDING', runAt: { lte: new Date() } }, select: { id: true }, take: 20 })
      for (const c of due) await processCheck(c.id).catch((e) => logger.error({ err: e?.message, id: c.id }, 'falha ao confirmar publicação'))
      const stale = await prisma.submission.findMany({ where: { aiStatus: 'PENDING', createdAt: { lt: new Date(Date.now() - 10 * 60_000) } }, select: { id: true }, take: 20 })
      for (const s of stale) await failAnalysis(s.id, 'A análise demorou demais. Envie de novo.')
    } catch (e) {
      logger.error({ err: (e as Error).message }, 'job falhou')
    } finally { busy = false }
  }
  const t = setInterval(() => void tick(), intervalMs)
  return () => clearInterval(t)
}
