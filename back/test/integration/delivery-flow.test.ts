import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../src/db'
import { processCheck } from '../../src/services/deliveries'
import { accepted, api, balance, closeApp, fund, getApp, getApp as _g, mkUser, signedContract, webhook } from './helpers'

const jobs: any[] = []
vi.mock('../../src/lib/videoai', () => ({ submitJob: vi.fn(async (j: any) => { jobs.push(j) }) }))

beforeAll(getApp)
afterAll(closeApp)
beforeEach(() => { jobs.length = 0 })
void _g

const POST = 'https://www.instagram.com/reel/Cabc12345/'
const okResult = (jobId: string) => ({ jobId, ok: true, score: 92, summary: 'Dentro dos padrões.', engine: 'deterministic', metrics: { durationSec: 28 }, requirements: [{ id: 'dur', label: 'Duração', status: 'ok', evidence: '28 s', suggestion: '' }, { id: 'logo', label: 'Logo', status: 'atencao', evidence: 'conferir', suggestion: '' }] })
const badResult = (jobId: string) => ({ jobId, ok: false, score: 40, summary: 'Fora dos padrões.', engine: 'deterministic', metrics: {}, requirements: [{ id: 'fmt', label: 'Formato', status: 'falha', evidence: 'horizontal', suggestion: 'Exporte em 9:16.' }] })
const delivery = async (contractId: string) => (await prisma.delivery.findFirstOrThrow({ where: { contractId } })).id

describe('entrega: análise da IA, aprovação, publicação e liberação', () => {
  it('fluxo completo até a custódia ser liberada ao criador, sem duplicar o pagamento', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { contractId } = await signedContract(k, c, { valueCents: 42000 })
    const did = await delivery(contractId)

    // criador não aprova; contratante não envia; nada pula etapa
    expect((await api(k, 'POST', `/deliveries/${did}/approve`)).status).toBe(409)
    expect((await api(c, 'POST', `/deliveries/${did}/approve`)).status).toBe(403)
    expect((await api(c, 'POST', `/deliveries/${did}/send`)).status).toBe(409) // sem análise ainda
    expect((await api(c, 'POST', `/deliveries/${did}/submissions`, { url: 'https://exemplo.com/video' })).status).toBe(422)

    const sub = await api(c, 'POST', `/deliveries/${did}/submissions`, { url: POST })
    expect(sub.status).toBe(201)
    expect(jobs.length).toBe(1)
    expect(jobs[0]).toMatchObject({ postUrl: POST })
    expect(jobs[0].callbackUrl).toContain('/webhooks/video-ai')
    const jobId = jobs[0].jobId

    // análise reprovada (falha) não libera o envio para aprovação
    const bad = await webhook('/webhooks/video-ai', { id: 'evt_a1', type: 'analysis.completed', data: badResult(jobId) })
    expect(bad.status).toBe(200)
    expect((await api(c, 'POST', `/deliveries/${did}/send`)).status).toBe(409)
    // resultado repetido para o mesmo job é ignorado (só aplica sobre PENDING)
    await webhook('/webhooks/video-ai', { id: 'evt_a2', type: 'analysis.completed', data: okResult(jobId) })
    expect((await prisma.submission.findUniqueOrThrow({ where: { id: jobId } })).aiOk).toBe(false)

    // novo envio, agora aprovado pela IA (atenção não reprova)
    expect((await api(c, 'POST', `/deliveries/${did}/submissions`, { url: POST })).status).toBe(201)
    const job2 = jobs[1].jobId
    await webhook('/webhooks/video-ai', { id: 'evt_a3', type: 'analysis.completed', data: okResult(job2) })
    expect((await prisma.delivery.findUniqueOrThrow({ where: { id: did } })).state).toBe('IA')
    expect((await api(c, 'POST', `/deliveries/${did}/send`)).status).toBe(200)

    // contratante: ajuste curto ou com contato é recusado; ajuste válido volta para produção
    expect((await api(k, 'POST', `/deliveries/${did}/adjust`, { comment: 'ok' })).status).toBe(422)
    expect((await api(k, 'POST', `/deliveries/${did}/adjust`, { comment: 'me chama no zap 53 99999 1234 para ajustar' })).body.error.code).toBe('LEAK')
    expect((await api(k, 'POST', `/deliveries/${did}/adjust`, { comment: 'Aumente o volume da música ambiente.' })).status).toBe(200)
    expect((await prisma.delivery.findUniqueOrThrow({ where: { id: did } })).state).toBe('PROD')

    // reenvia, aprova e publica
    expect((await api(c, 'POST', `/deliveries/${did}/submissions`, { url: POST })).status).toBe(201)
    await webhook('/webhooks/video-ai', { id: 'evt_a4', type: 'analysis.completed', data: okResult(jobs[2].jobId) })
    expect((await api(c, 'POST', `/deliveries/${did}/send`)).status).toBe(200)
    expect((await api(c, 'POST', `/deliveries/${did}/publish`, { url: POST })).status).toBe(409) // ainda não aprovado
    expect((await api(k, 'POST', `/deliveries/${did}/approve`)).status).toBe(200)
    expect((await api(c, 'POST', `/deliveries/${did}/publish`, { url: 'https://exemplo.com/post' })).status).toBe(422)
    expect(await balance(c.id)).toBe(0) // aprovar NÃO libera o dinheiro: só a publicação confirmada
    const pub = await api(c, 'POST', `/deliveries/${did}/publish`, { url: POST })
    expect(pub.status).toBe(202)
    // publicar duas vezes não cria duas verificações
    await api(c, 'POST', `/deliveries/${did}/publish`, { url: POST })
    const checks = await prisma.publicationCheck.findMany({ where: { deliveryId: did } })
    expect(checks.length).toBe(1)

    // job de verificação: roda duas vezes em paralelo e libera uma só vez
    await Promise.all([processCheck(checks[0].id), processCheck(checks[0].id)])
    const d = await prisma.delivery.findUniqueOrThrow({ where: { id: did } })
    expect(d.state).toBe('LIBERADO')
    expect(await balance(c.id)).toBe(42000)
    expect((await prisma.escrow.findUniqueOrThrow({ where: { contractId } })).status).toBe('RELEASED')
    expect(await prisma.ledgerEntry.count({ where: { walletUserId: c.id, kind: 'ESCROW_RELEASE' } })).toBe(1)
    expect((await prisma.creatorProfile.findUniqueOrThrow({ where: { userId: c.id } })).jobsCount).toBe(1)
    // ajustes: no máximo 2 pedidos; depois da liberação nada muda
    expect((await api(k, 'POST', `/deliveries/${did}/adjust`, { comment: 'Quero mudar tudo de novo.' })).status).toBe(409)
  })

  it('só o criador do contrato envia; entrega exige contrato assinado pelas duas partes', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR'), x = await mkUser('CREATOR')
    const { proposalId } = await accepted(k, c)
    await fund(k.id, 60000)
    const pay = await api(k, 'POST', `/proposals/${proposalId}/pay`)
    const did = await delivery(pay.body.contract.id)
    expect((await api(c, 'POST', `/deliveries/${did}/submissions`, { url: POST })).status).toBe(422) // criador ainda não assinou
    expect((await api(x, 'POST', `/deliveries/${did}/submissions`, { url: POST })).status).toBe(404)
  })

  it('upload: arquivo que não é vídeo (renomeado) é recusado pelo conteúdo, não pela extensão', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { contractId } = await signedContract(k, c)
    const did = await delivery(contractId)
    const app = await getApp()
    const boundary = '----triskeltest'
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="video.mp4"\r\nContent-Type: video/mp4\r\n\r\n`),
      Buffer.from('<html><script>alert(1)</script></html> isto nao e um video de verdade'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ])
    const r = await app.inject({ method: 'POST', url: `/api/v1/deliveries/${did}/submissions`, payload: body, headers: { authorization: `Bearer ${c.token}`, 'content-type': `multipart/form-data; boundary=${boundary}` }, remoteAddress: c.ip })
    expect(r.statusCode).toBe(422); expect(r.json().error.code).toBe('BAD_FILE')
    expect(await prisma.storedFile.count({ where: { ownerId: c.id, kind: 'video' } })).toBe(0)
    expect(jobs.length).toBe(0)
  })

  it('upload de vídeo válido: grava, calcula SHA-256 e envia a URL assinada ao video-ai; arquivo só é servido às partes', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR'), x = await mkUser('CREATOR')
    const { contractId } = await signedContract(k, c)
    const did = await delivery(contractId)
    const app = await getApp()
    const boundary = '----triskeltest2'
    const mp4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypmp42'), Buffer.alloc(200, 1)])
    const body = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="meu video.mp4"\r\nContent-Type: video/mp4\r\n\r\n`), mp4, Buffer.from(`\r\n--${boundary}--\r\n`)])
    const r = await app.inject({ method: 'POST', url: `/api/v1/deliveries/${did}/submissions`, payload: body, headers: { authorization: `Bearer ${c.token}`, 'content-type': `multipart/form-data; boundary=${boundary}` }, remoteAddress: c.ip })
    expect(r.statusCode).toBe(201)
    const f = await prisma.storedFile.findFirstOrThrow({ where: { ownerId: c.id, kind: 'video' } })
    expect(f.mime).toBe('video/mp4'); expect(f.sha256).toMatch(/^[0-9a-f]{64}$/); expect(f.size).toBe(mp4.length)
    expect(f.storageKey).toMatch(/^[a-f0-9]{48}$/) // nome aleatório, nunca o do usuário
    expect(jobs[0].videoUrl).toMatch(/\/internal\/files\/.+\?exp=\d+&sig=[0-9a-f]+/)
    // URL assinada: adulterar a assinatura ou expirar falha
    const u = new URL(jobs[0].videoUrl, 'http://x')
    const path = u.pathname + u.search
    expect((await app.inject({ method: 'GET', url: path })).statusCode).toBe(200)
    expect((await app.inject({ method: 'GET', url: path.replace(/sig=./, 'sig=0') })).statusCode).toBeGreaterThanOrEqual(401)
    expect((await app.inject({ method: 'GET', url: path.replace(/exp=\d+/, 'exp=1') })).statusCode).toBeGreaterThanOrEqual(401)
    // download autenticado: partes sim, terceiro não
    const dl = (u2: any) => app.inject({ method: 'GET', url: `/files/${f.id}`, headers: { authorization: `Bearer ${u2.token}` }, remoteAddress: u2.ip })
    expect((await dl(k)).statusCode).toBe(200)
    expect((await dl(c)).statusCode).toBe(200)
    expect((await dl(x)).statusCode).toBe(404)
  })
})
