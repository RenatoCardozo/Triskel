import fs from 'node:fs'
import { env } from './env'
import type { Db } from './db'
import { Briefing, deterministic, Item, MEASURED, measured, Req, score, summarize } from './analyze'
import { assertAllowedUrl, download, frames, Probe, probe, Signals, signals, tmpDir } from './media'
import { llmAnalyze } from './llm'

export interface JobInput { jobId: string; videoUrl?: string; postUrl?: string; briefing: Briefing; requirements: Req[]; callbackUrl: string }
export interface Result { ok: boolean; score: number; summary: string; engine: string; metrics: Record<string, unknown>; requirements: Item[] }

/** Analisa um job. Nunca lança: erros de leitura viram resultado "fora dos padrões" com a explicação, para o criador receber retorno. */
export async function analyze(input: JobInput, llm = !!env.ANTHROPIC_API_KEY): Promise<Result> {
  const reqs = input.requirements
  if (!input.videoUrl) {
    const items = deterministic(reqs, null, null, input.briefing, 'post')
    return { ok: true, score: score(items), summary: summarize(items, 'determinístico (link de post)'), engine: 'deterministic', metrics: {}, requirements: items }
  }
  const dir = tmpDir()
  try {
    const file = await download(input.videoUrl, dir)
    let p: Probe
    try { p = await probe(file) } catch {
      const bad: Item[] = reqs.map((r) => ({ id: r.id, label: r.label, status: r.id === 'tec' ? 'falha' as const : 'atencao' as const, evidence: r.id === 'tec' ? 'Não consegui ler o arquivo como vídeo.' : 'Sem leitura do vídeo, este item não foi conferido.', suggestion: r.id === 'tec' ? 'Exporte de novo em MP4 (H.264) e envie.' : 'Reenvie o vídeo.' }))
      return { ok: false, score: score(bad), summary: 'Fora dos padrões: o arquivo não pôde ser lido como vídeo.', engine: 'deterministic', metrics: {}, requirements: bad }
    }
    const s = await signals(file, p)
    let items = deterministic(reqs, p, s, input.briefing, 'video')
    let engine = 'deterministic'
    if (llm) {
      try {
        const jpgs = await frames(file, p, dir)
        if (jpgs.length) {
          const l = await llmAnalyze(reqs, input.briefing, p, s, jpgs)
          // fatos medidos prevalecem sobre a opinião do modelo
          items = l.map((x) => (MEASURED.has(x.id) ? (measured(reqs.find((r) => r.id === x.id)!, p, s, input.briefing) ?? x) : x))
          engine = `llm:${env.ANTHROPIC_MODEL}+ffprobe`
        }
      } catch { engine = 'deterministic (LLM indisponível)' }
    }
    return { ok: items.every((i) => i.status !== 'falha'), score: score(items), summary: summarize(items, engine), engine, metrics: { durationSec: Math.round(p.durationSec * 10) / 10, width: p.width, height: p.height, fps: p.fps, hasAudio: p.hasAudio, meanVolumeDb: s.meanVolumeDb, brightness: s.brightness }, requirements: items }
  } catch (e) {
    const items: Item[] = reqs.map((r) => ({ id: r.id, label: r.label, status: 'atencao', evidence: 'A análise não pôde ser concluída.', suggestion: 'Reenvie o vídeo em instantes.' }))
    return { ok: false, score: 0, summary: `A análise não pôde ser concluída: ${(e as Error).message}.`, engine: 'error', metrics: {}, requirements: items }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

let running = 0
export async function pump(db: Db, analyzeFn: typeof analyze = analyze) {
  // jobs que ficaram "processing" por mais de 10 min (queda do serviço) voltam para a fila
  db.prepare("UPDATE jobs SET status = 'queued' WHERE status = 'processing' AND started_at < ?").run(Date.now() - 10 * 60_000)
  while (running < env.JOB_CONCURRENCY) {
    const j = db.prepare("SELECT * FROM jobs WHERE status = 'queued' ORDER BY created_at LIMIT 1").get() as any
    if (!j) return
    const claim = db.prepare("UPDATE jobs SET status = 'processing', started_at = ? WHERE id = ? AND status = 'queued'").run(Date.now(), j.id)
    if (Number(claim.changes) !== 1) continue
    running++
    void (async () => {
      try {
        const r = await analyzeFn(JSON.parse(j.input))
        db.prepare("UPDATE jobs SET status = 'done', result = ?, finished_at = ?, cb_status = 'pending', cb_next = ? WHERE id = ?").run(JSON.stringify(r), Date.now(), Date.now(), j.id)
      } catch (e) {
        db.prepare("UPDATE jobs SET status = 'failed', error = ?, finished_at = ? WHERE id = ?").run((e as Error).message, Date.now(), j.id)
      } finally { running-- }
    })()
  }
}
export { assertAllowedUrl }
