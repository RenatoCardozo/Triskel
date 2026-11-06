import { env } from '../env'
import { AppError } from './errors'

export interface AiRequirement { id: string; label: string }
export interface AiJob {
  jobId: string
  videoUrl?: string
  postUrl?: string
  briefing: { campaignName: string; brand: string; product: string; message: string; cta?: string; mentions?: string; avoid?: string; maxSeconds: number }
  requirements: AiRequirement[]
  callbackUrl: string
}
export interface AiResult {
  jobId: string; ok: boolean; score: number; summary: string; engine: string
  metrics?: { durationSec?: number; width?: number; height?: number; hasAudio?: boolean }
  requirements: Array<{ id: string; label?: string; status: 'ok' | 'atencao' | 'falha'; evidence: string; suggestion: string }>
}
export async function submitJob(job: AiJob): Promise<void> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), 8000)
  try {
    const res = await fetch(env.VIDEOAI_API_URL + '/v1/jobs', {
      method: 'POST', signal: ctl.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${env.VIDEOAI_API_KEY}` }, body: JSON.stringify(job),
    })
    if (res.status !== 202 && !res.ok) throw new AppError(502, 'VIDEOAI_ERROR', 'O serviço de análise recusou o envio.')
  } catch (e) {
    if (e instanceof AppError) throw e
    throw new AppError(502, 'VIDEOAI_UNAVAILABLE', 'O serviço de análise está indisponível.')
  } finally { clearTimeout(t) }
}
