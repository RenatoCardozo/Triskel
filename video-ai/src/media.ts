import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { env, hostsOf } from './env'

const run = promisify(execFile)

export interface Probe { durationSec: number; width: number; height: number; hasVideo: boolean; hasAudio: boolean; fps: number | null; videoCodec: string | null; sizeBytes: number }
export interface Signals { meanVolumeDb: number | null; maxVolumeDb: number | null; brightness: number | null }

/** SSRF: só host:porta autorizados, sem seguir redirecionamentos. */
export function assertAllowedUrl(raw: string, allowed: string): URL {
  let u: URL
  try { u = new URL(raw) } catch { throw new Error('URL inválida') }
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Protocolo não permitido')
  if (!hostsOf(allowed).includes(u.host.toLowerCase())) throw new Error(`Host não autorizado: ${u.host}`)
  return u
}

export async function download(rawUrl: string, dir: string): Promise<string> {
  const u = assertAllowedUrl(rawUrl, env.ALLOWED_FETCH_HOSTS)
  const res = await fetch(u, { redirect: 'error', signal: AbortSignal.timeout(env.DOWNLOAD_TIMEOUT_MS) })
  if (!res.ok || !res.body) throw new Error(`Download falhou (HTTP ${res.status})`)
  const max = env.MAX_VIDEO_MB * 1024 * 1024
  const len = Number(res.headers.get('content-length') || 0)
  if (len > max) throw new Error('Arquivo maior que o limite')
  const file = path.join(dir, 'input.bin')
  let n = 0
  const body = Readable.fromWeb(res.body as any)
  body.on('data', (c: Buffer) => { n += c.length; if (n > max) body.destroy(new Error('Arquivo maior que o limite')) })
  await pipeline(body, fs.createWriteStream(file))
  return file
}

export async function probe(file: string): Promise<Probe> {
  const { stdout } = await run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], { maxBuffer: 10 * 1024 * 1024, timeout: 30_000 })
  const j = JSON.parse(stdout)
  const v = (j.streams || []).find((s: any) => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
  const a = (j.streams || []).find((s: any) => s.codec_type === 'audio')
  const rot = Math.abs(Number((v?.side_data_list || []).find((d: any) => d.rotation !== undefined)?.rotation ?? v?.tags?.rotate ?? 0)) % 180
  let w = Number(v?.width || 0), h = Number(v?.height || 0)
  if (rot === 90) [w, h] = [h, w]
  const [n, d] = String(v?.avg_frame_rate || '0/1').split('/').map(Number)
  return {
    durationSec: Number(j.format?.duration || v?.duration || 0), width: w, height: h, hasVideo: !!v, hasAudio: !!a,
    fps: d ? Math.round((n / d) * 10) / 10 : null, videoCodec: v?.codec_name ?? null, sizeBytes: Number(j.format?.size || 0),
  }
}

export async function signals(file: string, p: Probe): Promise<Signals> {
  const out: Signals = { meanVolumeDb: null, maxVolumeDb: null, brightness: null }
  if (p.hasAudio) {
    const r = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-t', '90', '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { timeout: 60_000, maxBuffer: 5 * 1024 * 1024 }).catch((e) => e)
    const err = String(r.stderr || '')
    const mean = /mean_volume:\s*(-?[\d.]+) dB/.exec(err), max = /max_volume:\s*(-?[\d.]+) dB/.exec(err)
    out.meanVolumeDb = mean ? Number(mean[1]) : null
    out.maxVolumeDb = max ? Number(max[1]) : null
  }
  if (p.hasVideo) {
    const r = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-t', '30', '-an', '-vf', 'fps=1,scale=160:-2,signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-'], { timeout: 60_000, maxBuffer: 5 * 1024 * 1024 }).catch((e) => e)
    const vals = [...String(r.stderr || '').matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]))
    if (vals.length) out.brightness = Math.round(vals.reduce((s, x) => s + x, 0) / vals.length)
  }
  return out
}

/** Até `n` quadros JPEG (512 px) espalhados pelo vídeo, em base64, para o LLM. */
export async function frames(file: string, p: Probe, dir: string, n = 6): Promise<string[]> {
  if (!p.hasVideo || p.durationSec <= 0) return []
  const every = Math.max(0.5, p.durationSec / n)
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, '-vf', `fps=1/${every.toFixed(2)},scale=512:-2`, '-frames:v', String(n), '-q:v', '5', path.join(dir, 'f_%02d.jpg')], { timeout: 60_000 }).catch(() => undefined)
  return fs.readdirSync(dir).filter((f) => f.startsWith('f_')).sort().map((f) => fs.readFileSync(path.join(dir, f)).toString('base64'))
}

export const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vai-'))
