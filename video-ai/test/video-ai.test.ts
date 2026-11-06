import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { openDb } from '../src/db'
import { buildApp } from '../src/app'
import { analyze, pump } from '../src/worker'
import { deliverDue, sign } from '../src/webhook'
import { score } from '../src/analyze'
import { llmAnalyze } from '../src/llm'
import { probe } from '../src/media'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vai-test-'))
const ff = (out: string, size: string, secs: number, audio = true) =>
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `testsrc2=size=${size}:rate=30:duration=${secs}`,
    ...(audio ? ['-f', 'lavfi', '-i', `sine=frequency=440:duration=${secs}`] : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', ...(audio ? ['-c:a', 'aac', '-af', 'volume=0.5'] : ['-an']), '-shortest', out])
const files: Record<string, string> = { ok: path.join(dir, 'ok.mp4'), land: path.join(dir, 'land.mp4'), long: path.join(dir, 'long.mp4'), mute: path.join(dir, 'mute.mp4') }
const SECRET = 'unit-webhook-secret-0123456789'
const briefing = { campaignName: 'Verão', brand: 'Café Lume', product: 'Café', message: 'Café fresco', maxSeconds: 60 }
const reqs = [{ id: 'dur', label: 'Duração até 60 s' }, { id: 'fmt', label: 'Formato vertical 9:16' }, { id: 'tec', label: 'Boa qualidade de imagem e áudio' }, { id: 'logo', label: 'Mostrar a logo' }]
let media: http.Server

beforeAll(async () => {
  ff(files.ok, '540x960', 5); ff(files.land, '960x540', 5); ff(files.long, '540x960', 65); ff(files.mute, '540x960', 5, false)
  media = http.createServer((req, res) => {
    const f = files[(req.url || '').slice(1)]
    if (!f) { res.statusCode = 404; return res.end() }
    res.setHeader('content-type', 'video/mp4'); fs.createReadStream(f).pipe(res)
  })
  await new Promise<void>((r) => media.listen(45871, '127.0.0.1', r))
})
afterAll(() => { media.close(); fs.rmSync(dir, { recursive: true, force: true }) })

const mk = (k: string) => ({ jobId: 'j-' + k, videoUrl: `http://127.0.0.1:45871/${k}`, briefing, requirements: reqs, callbackUrl: 'http://127.0.0.1:45872/hook' })
const st = (r: { requirements: any[] }, id: string) => r.requirements.find((i) => i.id === id).status

describe('motor determinístico (ffprobe/ffmpeg reais)', () => {
  it('vídeo vertical 9:16 curto com áudio passa nos itens medidos', async () => {
    const r = await analyze(mk('ok'), false)
    expect(st(r, 'dur')).toBe('ok'); expect(st(r, 'fmt')).toBe('ok'); expect(st(r, 'tec')).toBe('ok')
    expect(st(r, 'logo')).toBe('atencao') // não verificável sem LLM: nunca aprova nem reprova
    expect(r.ok).toBe(true); expect(r.engine).toBe('deterministic')
    expect(r.metrics).toMatchObject({ width: 540, height: 960, hasAudio: true })
  })
  it('horizontal falha no formato', async () => { const r = await analyze(mk('land'), false); expect(st(r, 'fmt')).toBe('falha'); expect(r.ok).toBe(false) })
  it('acima de 60 s falha na duração', async () => { const r = await analyze(mk('long'), false); expect(st(r, 'dur')).toBe('falha'); expect(r.ok).toBe(false) })
  it('sem áudio falha na qualidade técnica', async () => { const r = await analyze(mk('mute'), false); expect(st(r, 'tec')).toBe('falha') })
  it('arquivo que não é vídeo vira resultado "fora dos padrões" em vez de erro', async () => {
    const bad = path.join(dir, 'bad.mp4'); fs.writeFileSync(bad, 'isto não é um vídeo'); files.bad = bad
    const r = await analyze({ ...mk('ok'), videoUrl: 'http://127.0.0.1:45871/bad' }, false)
    expect(r.ok).toBe(false); expect(st(r, 'tec')).toBe('falha')
  })
  it('download de host fora da lista é recusado (SSRF) sem quebrar', async () => {
    const r = await analyze({ ...mk('ok'), videoUrl: 'http://127.0.0.1:9/x' }, false)
    expect(r.engine).toBe('error'); expect(r.ok).toBe(false)
  })
  it('link de post: tudo "atenção", nunca falha', async () => {
    const r = await analyze({ jobId: 'p', postUrl: 'https://instagram.com/reel/abc', briefing, requirements: reqs, callbackUrl: 'http://127.0.0.1:45872/hook' })
    expect(r.requirements.every((i) => i.status === 'atencao')).toBe(true); expect(r.ok).toBe(true)
  })
  it('pontuação', () => { expect(score([{ id: 'a', label: '', status: 'ok', evidence: '', suggestion: '' }, { id: 'b', label: '', status: 'falha', evidence: '', suggestion: '' }])).toBe(50) })
  it('probe lê duração e resolução', async () => { const p = await probe(files.ok); expect(Math.round(p.durationSec)).toBe(5); expect(p.height).toBe(960) })
})

describe('LLM (fetch simulado, sem chamada externa)', () => {
  it('valida o JSON do modelo e ignora itens desconhecidos', async () => {
    const p = await probe(files.ok)
    const jpg = path.join(dir, 'f.jpg'); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', files.ok, '-frames:v', '1', jpg])
    const orig = globalThis.fetch
    globalThis.fetch = (async (_u: any, init: any) => {
      expect(JSON.parse(init.body).messages[0].content.some((c: any) => c.type === 'image')).toBe(true)
      return new Response(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify({ requirements: [{ id: 'logo', status: 'ok', evidence: 'Logo visível', suggestion: '' }, { id: 'zzz', status: 'ok', evidence: 'x', suggestion: '' }] }) }] }), { status: 200 })
    }) as any
    try {
      const out = await llmAnalyze(reqs, briefing, p, { meanVolumeDb: -20, maxVolumeDb: -5, brightness: 100 }, [jpg])
      expect(out.find((i) => i.id === 'logo')).toMatchObject({ status: 'ok', evidence: 'Logo visível' })
      expect(out.find((i) => i.id === 'zzz')).toBeUndefined()
      expect(out.length).toBe(reqs.length)
    } finally { globalThis.fetch = orig }
  })
})

describe('API, fila e webhook assinado', () => {
  it('exige chave, valida hosts, é idempotente e entrega o resultado assinado com retentativa', async () => {
    const db = openDb(':memory:'); const app = await buildApp(db)
    const H = { authorization: 'Bearer unit-videoai-key-123' }
    expect((await app.inject({ method: 'POST', url: '/v1/jobs', payload: mk('ok') })).statusCode).toBe(401)
    expect((await app.inject({ method: 'POST', url: '/v1/jobs', headers: H, payload: { ...mk('ok'), videoUrl: 'http://evil.test/x' } })).statusCode).toBe(422)
    expect((await app.inject({ method: 'POST', url: '/v1/jobs', headers: H, payload: { ...mk('ok'), callbackUrl: 'http://evil.test/hook' } })).statusCode).toBe(422)
    expect((await app.inject({ method: 'POST', url: '/v1/jobs', headers: H, payload: { ...mk('ok'), postUrl: 'https://x.com/p' } })).statusCode).toBe(422)
    const a = await app.inject({ method: 'POST', url: '/v1/jobs', headers: H, payload: mk('ok') }); expect(a.statusCode).toBe(202)
    const b = await app.inject({ method: 'POST', url: '/v1/jobs', headers: H, payload: mk('ok') }); expect(b.json().duplicate).toBe(true)

    const got: any[] = []; let fail = 1
    const rx = http.createServer((req, res) => {
      let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => {
        got.push({ h: req.headers, body })
        if (fail-- > 0) { res.statusCode = 500; return res.end() }
        res.end('ok')
      })
    })
    await new Promise<void>((r) => rx.listen(45872, '127.0.0.1', r))
    try {
      await pump(db)
      for (let i = 0; i < 100 && (db.prepare("SELECT status FROM jobs").get() as any).status !== 'done'; i++) await new Promise((r) => setTimeout(r, 200))
      for (let i = 0; i < 20 && got.length < 2; i++) { await deliverDue(db); await new Promise((r) => setTimeout(r, 30)) }
      expect(got.length).toBe(2) // 1ª falhou (500), 2ª entregue
      const g = got[1]; const ts = g.h['x-triskel-timestamp']
      expect(g.h['x-triskel-signature']).toBe(sign(SECRET, ts, g.body))
      expect(g.h['x-triskel-event-id']).toBe(JSON.parse(g.body).id) // mesmo id nas retentativas: o back deduplica
      expect(got[0].h['x-triskel-event-id']).toBe(g.h['x-triskel-event-id'])
      const ev = JSON.parse(g.body); expect(ev.type).toBe('analysis.completed'); expect(ev.data.jobId).toBe('j-ok'); expect(ev.data.requirements.length).toBe(reqs.length)
      const j = await app.inject({ method: 'GET', url: '/v1/jobs/j-ok', headers: H }); expect(j.json()).toMatchObject({ status: 'done', callback: { status: 'delivered', attempts: 2 } })
      expect((await app.inject({ method: 'GET', url: '/v1/jobs/nao-existe', headers: H })).statusCode).toBe(404)
    } finally { rx.close() }
  })
})
