import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { buildApp } from '../../src/app'
import { prisma } from '../../src/db'
import { credit } from '../../src/services/wallet'
import { cnpjOk, cpfOk } from '../../src/lib/validators'
import { sign } from '../../src/lib/webhook'
import { env } from '../../src/env'

export const PASSWORD = 'Triskel@2026'
let app: Awaited<ReturnType<typeof buildApp>>
let hash: string
let ipSeq = 10
export async function getApp() {
  if (!app) { app = await buildApp(); await app.ready(); hash = await bcrypt.hash(PASSWORD, 12) }
  return app
}
export const closeApp = async () => { if (app) await app.close() }

const cpfFrom = (b: string) => { const d = b.split('').map(Number); const c = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += d[i] * (n + 1 - i); return ((s * 10) % 11) % 10 }; d.push(c(9)); d.push(c(10)); const s = d.join(''); if (!cpfOk(s)) throw new Error('cpf'); return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') }
const cnpjFrom = (b: string) => { const d = b.split('').map(Number); const c = (n: number) => { const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; let s = 0; for (let i = 0; i < n; i++) s += d[i] * w[i]; const r = s % 11; return r < 2 ? 0 : 11 - r }; d.push(c(12)); d.push(c(13)); const s = d.join(''); if (!cnpjOk(s)) throw new Error('cnpj'); return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') }

let seq = (Date.now() % 100_000_000) * 2 // distinto entre arquivos de teste (cada arquivo carrega o módulo de novo)
export interface U { id: string; email: string; role: 'CREATOR' | 'BUSINESS' | 'AGENCY'; name: string; token: string; ip: string }

/** Cria o usuário direto no banco (rápido) e faz login pela API, como um cliente real. */
export async function mkUser(role: U['role'], opts: { name?: string; segment?: string; niches?: string[]; incomplete?: boolean; noCpf?: boolean } = {}): Promise<U> {
  const a = await getApp()
  const n = ++seq
  const name = opts.name ?? (role === 'CREATOR' ? `Criador ${n}` : `Empresa ${n}`)
  const email = `u${n}@teste.local`
  const user = await prisma.user.create({
    data: {
      email, passwordHash: hash, role, name, publicId: String(90_000_000 + n), phone: '(53) 99912-3456', emailVerifiedAt: new Date(), listed: role === 'CREATOR', wallet: { create: {} },
      ...(role === 'CREATOR'
        ? { creator: { create: { cpf: opts.incomplete || opts.noCpf ? null : cpfFrom(String(300_000_000 + n)), birthDate: new Date('1995-01-01'), city: opts.incomplete ? null : 'Pelotas', uf: opts.incomplete ? null : 'RS', gender: 'Mulher', languages: ['Português'], about: 'Criador de teste.', instagram: `@criador${n}`, followersBand: '10 a 50 mil (micro)', niches: opts.niches ?? ['Gastronomia'], formats: ['Reels 9:16'], avgDelivery: 'Até 5 dias', audAges: ['25–34'], audGender: 'Todos os gêneros', audRegion: 'Pelotas e região', audInterests: [], priceReels: 10000, nearPelotas: true, sizeBand: 'Micro', vminCents: 10000, vmaxCents: 50000, ratingAvg: 4.5 } } }
        : { company: { create: { tradeName: name, cnpj: opts.incomplete ? null : cnpjFrom(String(500_000_000_000 + n)), responsible: opts.incomplete ? null : 'Responsável Teste', segment: opts.segment ?? 'Alimentação', city: 'Pelotas', uf: 'RS', channels: [], audAges: [], audInterests: [], desiredFormats: [], creatorSizes: [], creatorNiches: [], services: [], clientSegments: [] } } }),
    },
  })
  if (role === 'CREATOR') {
    const f = (kind: string) => prisma.storedFile.create({ data: { ownerId: user.id, kind, storageKey: crypto.randomBytes(24).toString('hex') + '.png', mime: 'image/png', size: 100, sha256: 'x'.repeat(64) } })
    await prisma.user.update({ where: { id: user.id }, data: { avatarFileId: (await f('avatar')).id, coverFileId: (await f('cover')).id } })
  }
  const ip = `10.1.${Math.floor(ipSeq / 250)}.${(ipSeq++ % 250) + 1}`
  const r = await a.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email, senha: PASSWORD }, remoteAddress: ip })
  if (r.statusCode !== 200) throw new Error('login falhou no helper: ' + r.body)
  return { id: user.id, email, role, name, token: r.json().session.accessToken, ip }
}

export async function api(u: U | null, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', url: string, payload?: unknown, headers: Record<string, string> = {}) {
  const a = await getApp()
  const res = await a.inject({ method, url: '/api/v1' + url, payload: payload as any, headers: { ...(u ? { authorization: `Bearer ${u.token}` } : {}), ...headers }, remoteAddress: u?.ip ?? '10.9.9.9' })
  let body: any = null
  try { body = res.json() } catch { body = res.body }
  return { status: res.statusCode, body, raw: res }
}

export const addDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)

/** Credita o saldo direto no ledger (equivale a uma recarga já confirmada). */
export async function fund(userId: string, cents: number) {
  await prisma.$transaction((tx) => credit(tx, userId, cents, `TRX-FUND${Date.now()}${Math.floor(Math.random() * 1e6)}`, 'RECHARGE'))
}
export const balance = async (userId: string) => (await prisma.wallet.findUniqueOrThrow({ where: { userId } })).balanceCents

export function campaignBody(over: Record<string, unknown> = {}) {
  return {
    nome: 'Cardápio de verão', produto: 'Sobremesas geladas', obj: 'Gerar visitas à loja', desc: 'Mostrar as novas sobremesas do verão.', msg: 'Sobremesas geladas',
    pIdade: ['25–34'], pGen: 'Todos os gêneros', pReg: 'Pelotas e região', pInt: [], nichosCr: ['Gastronomia'], porteCr: ['Micro (10 a 100 mil)'], genCr: 'Sem preferência', idCr: 'Sem preferência',
    regCr: 'Pelotas e região', nota: 'Sem mínimo', qCr: 1, fmt: ['Reels 9:16'], plat: ['Instagram'], qVid: 1, dur: 'Até 60 s', tom: ['Descontraído'], valueCents: 30000,
    inicio: addDays(0), entrega: addDays(30), rev: '2 rodadas', uso: '90 dias', excl: 'Nenhuma', envio: 'Não precisa enviar', ...over,
  }
}

/** Campanha confirmada (OPEN) do contratante. */
export async function openCampaign(k: U, over: Record<string, unknown> = {}) {
  const c = await api(k, 'POST', '/campaigns', campaignBody(over))
  if (c.status !== 201) throw new Error('campanha: ' + JSON.stringify(c.body))
  const id = c.body.campaign.id
  const ok = await api(k, 'POST', `/campaigns/${id}/confirm`, { requirements: c.body.campaign.requirements })
  if (ok.status !== 200) throw new Error('confirm: ' + JSON.stringify(ok.body))
  return id as string
}

/** Convite + aceite do criador (proposta ACCEPTED, aguardando pagamento). */
export async function accepted(k: U, c: U, over: { valueCents?: number; delivery?: string; campaignId?: string; campaign?: Record<string, unknown> } = {}) {
  const campaignId = over.campaignId ?? (await openCampaign(k, over.campaign))
  const inv = await api(k, 'POST', '/proposals', { campaignId, creatorIds: [c.id], valueCents: over.valueCents ?? 42000, delivery: over.delivery ?? addDays(30), imageUse: '90 dias', message: 'Oi! Queremos você na campanha.' })
  if (inv.status !== 201) throw new Error('convite: ' + JSON.stringify(inv.body))
  const proposalId = inv.body.sent[0].proposalId as string
  const acc = await api(c, 'POST', `/proposals/${proposalId}/accept`)
  if (acc.status !== 200) throw new Error('aceite: ' + JSON.stringify(acc.body))
  return { proposalId, campaignId }
}

/** Contrato pago e assinado pelas duas partes. */
export async function signedContract(k: U, c: U, over: Parameters<typeof accepted>[2] = {}) {
  const { proposalId, campaignId } = await accepted(k, c, over)
  await fund(k.id, Math.round((over.valueCents ?? 42000) * 1.1))
  const pay = await api(k, 'POST', `/proposals/${proposalId}/pay`)
  if (pay.status !== 201) throw new Error('pagamento: ' + JSON.stringify(pay.body))
  const contractId = pay.body.contract.id as string
  const sg = await api(c, 'POST', `/contracts/${contractId}/sign`, { accept: true })
  if (sg.status !== 200) throw new Error('assinatura: ' + JSON.stringify(sg.body))
  return { proposalId, campaignId, contractId }
}

/** Dispara um webhook assinado como o emissor faria. */
export async function webhook(path: '/webhooks/payments' | '/webhooks/video-ai', event: { id: string; type: string; data: unknown }, opts: { secret?: string; ts?: number; tamper?: boolean } = {}) {
  const a = await getApp()
  const secret = opts.secret ?? (path === '/webhooks/payments' ? env.PAYMENT_WEBHOOK_SECRET : env.VIDEOAI_WEBHOOK_SECRET)
  const ts = opts.ts ?? Math.floor(Date.now() / 1000)
  const body = JSON.stringify({ ...event, created: ts })
  const res = await a.inject({
    method: 'POST', url: path, payload: opts.tamper ? body.replace('"id"', '"id" ') : body, remoteAddress: '10.8.8.8',
    headers: { 'content-type': 'application/json', 'x-triskel-timestamp': String(ts), 'x-triskel-event-id': event.id, 'x-triskel-signature': sign(secret, ts, body) },
  })
  return { status: res.statusCode, body: res.json() }
}
