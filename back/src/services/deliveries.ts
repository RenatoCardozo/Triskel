import { Prisma } from '../generated/prisma/client'
import { prisma, Db, Tx } from '../db'
import { env } from '../env'
import { conflict, forbidden, notFound, unprocessable } from '../lib/errors'
import { brl } from '../lib/money'
import { leak, leakMessage } from '../lib/leak'
import { signedFilePath } from '../lib/fileToken'
import { submitJob, AiResult } from '../lib/videoai'
import { newStorageKey, storage } from '../lib/storage'
import { sniff } from '../lib/filetype'
import crypto from 'node:crypto'
import { notify } from '../lib/emails'
import { logger } from '../lib/logger'
import { addSystemMessage, fire } from './proposals'
import { releaseEscrow } from './wallet'
import { CampaignData } from './campaignGen'
import { isoDate } from '../lib/dates'

export const MAX_ADJUSTS = 2
/** Requisitos padrão analisados (REQI do protótipo). */
export const REQI: Array<[string, string]> = [
  ['logo', 'Logo nos primeiros 10 s'], ['prod', 'Produto apresentado'], ['msg', 'Mensagem principal citada'], ['men', 'Menção à marca'],
  ['dur', 'Duração máxima de 60 s'], ['fmt', 'Formato vertical 9:16'], ['hum', 'Conteúdo humanizado (mín. 60%)'], ['tec', 'Qualidade técnica (imagem e áudio)'],
]
export const POSTRX = /^(https?:\/\/)?(www\.|m\.)?(instagram\.com\/(p|reel|reels|tv)\/[\w-]{5,}|tiktok\.com\/@[\w.]+\/video\/\d{8,}|vm\.tiktok\.com\/[\w-]{5,})/i
const REQ_MAP: Array<[string, RegExp]> = [['logo', /^logo/i], ['prod', /^mostrar o produto/i], ['msg', /^citar a mensagem/i], ['men', /^mencionar/i], ['dur', /^dura[cç]/i], ['fmt', /^formato/i], ['hum', /human/i]]

/** Requisitos efetivos: os padrão que o contratante manteve na campanha + os extras (texto livre, só LLM/verificação manual). */
export function requirementsFor(selected: string[]): Array<{ id: string; label: string; custom?: boolean }> {
  const keep = new Set<string>(['tec'])
  const extras: string[] = []
  for (const r of selected) {
    const hit = REQ_MAP.find(([, rx]) => rx.test(r.trim()))
    if (hit) keep.add(hit[0]); else extras.push(r)
  }
  return [...REQI.filter(([id]) => keep.has(id)).map(([id, label]) => ({ id, label })), ...extras.map((label, i) => ({ id: `x${i + 1}`, label, custom: true }))]
}

async function hashFile(key: string): Promise<string> {
  const h = crypto.createHash('sha256')
  for await (const c of storage.stream(key)) h.update(c as Buffer)
  return h.digest('hex')
}
export function validatePostUrl(raw: string): string {
  const u = raw.trim()
  if (u.length > 300 || !POSTRX.test(u)) throw unprocessable('POST_URL', 'Informe o link de um post do Instagram ou TikTok.')
  if (leak(u.replace(POSTRX, ''))) throw unprocessable('POST_URL', 'Informe só o link do post.')
  return u
}

const include = {
  contract: { include: { proposal: { include: { campaign: true, creator: { select: { id: true, name: true } } } } } },
  submissions: { orderBy: { n: 'asc' as const } },
  checks: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} satisfies Prisma.DeliveryInclude
export type FullDelivery = Prisma.DeliveryGetPayload<{ include: typeof include }>

export async function loadDelivery(id: string, userId: string, db: Db = prisma): Promise<{ d: FullDelivery; side: 'C' | 'K' }> {
  const d = await db.delivery.findFirst({ where: { id, contract: { OR: [{ contractorId: userId }, { creatorId: userId }] } }, include })
  if (!d) throw notFound('Entrega não encontrada.')
  return { d, side: d.contract.creatorId === userId ? 'C' : 'K' }
}
const lock = (tx: Tx, id: string) => tx.$queryRaw`SELECT id FROM \`Delivery\` WHERE id = ${id} FOR UPDATE`
const sysMsg = (tx: Db, proposalId: string, text: string, unread: Array<'C' | 'K'>) =>
  addSystemMessage(tx, proposalId, text).then(() => tx.proposal.update({ where: { id: proposalId }, data: { ...(unread.includes('C') ? { unreadCreator: true } : {}), ...(unread.includes('K') ? { unreadContractor: true } : {}) } }))

// ---------- DTO ----------
export function aiDto(s: FullDelivery['submissions'][number]) {
  const r = s.aiResult as any
  return {
    n: s.n, kind: s.kind, fileName: s.fileName, fileSize: s.fileSize, url: s.url, durationSec: s.durationSec, createdAt: s.createdAt,
    videoUrl: s.fileId ? `/files/${s.fileId}` : null,
    ai: { status: s.aiStatus, ok: s.aiOk, score: s.aiScore, summary: r?.summary ?? null, engine: r?.engine ?? null, items: Array.isArray(r?.requirements) ? r.requirements : [], error: r?.error ?? null },
    decision: s.decision, comment: s.comment,
  }
}
export function deliveryDto(d: FullDelivery, side: 'C' | 'K') {
  const c = d.contract, p = c.proposal
  const signed = !!c.signedAt
  const last = d.submissions[d.submissions.length - 1]
  const pending = last?.aiStatus === 'PENDING'
  const chk = d.checks[0]
  const needsYou = side === 'C' ? !signed || ['PROD', 'IA', 'APROVADO'].includes(d.state) && !pending : d.state === 'APROV'
  return {
    id: d.id, contractId: c.id, proposalId: p.id, side, state: d.state, signed, needsYou,
    campaign: { name: p.campaignName, brandName: p.brandName, clientName: p.clientName, videos: p.videos, format: p.format },
    counterpart: side === 'C' ? p.brandName + (p.clientName ? ` · cliente ${p.clientName}` : '') : p.creator.name,
    deliveryDate: isoDate(c.deliveryDate), imageUse: c.imageUse, revisions: (p.campaign.data as any)?.rev ?? '2 rodadas',
    valueCents: c.valueCents, ...(side === 'K' ? { feeCents: c.feeCents, totalCents: c.totalCents } : {}),
    custody: d.state === 'LIBERADO' ? 'RELEASED' : 'HELD',
    adjust: { count: d.adjustCount, max: MAX_ADJUSTS, remaining: Math.max(0, MAX_ADJUSTS - d.adjustCount), comment: d.state === 'PROD' ? d.adjustComment : null },
    requirements: requirementsFor((p.campaign.requirements as string[]) ?? []),
    submissions: d.submissions.map(aiDto),
    analyzing: pending,
    publication: { url: d.publishUrl, state: chk?.state ?? null, publishedAt: d.publishedAt, releasedAt: d.releasedAt },
    can: {
      submit: side === 'C' && signed && (d.state === 'PROD' || d.state === 'IA') && !pending,
      send: side === 'C' && d.state === 'IA' && last?.aiOk === true,
      approve: side === 'K' && d.state === 'APROV',
      adjust: side === 'K' && d.state === 'APROV' && d.adjustCount < MAX_ADJUSTS,
      publish: side === 'C' && d.state === 'APROVADO' && chk?.state !== 'PENDING',
    },
  }
}

// ---------- envio (vídeo ou link) ----------
async function assertCanSubmit(tx: Tx, id: string, userId: string) {
  await lock(tx, id)
  const { d, side } = await loadDelivery(id, userId, tx)
  if (side !== 'C') throw forbidden('Somente o criador envia a entrega.')
  if (!d.contract.signedAt) throw unprocessable('NOT_SIGNED', 'Assine o contrato antes de enviar a entrega.')
  if (d.state !== 'PROD' && d.state !== 'IA') throw conflict('BAD_STATE', 'Esta entrega não aceita novo envio agora.')
  if (d.submissions.some((s) => s.aiStatus === 'PENDING')) throw conflict('ANALYZING', 'Aguarde a análise do envio anterior terminar.')
  return d
}
export async function createSubmission(userId: string, deliveryId: string, src: { kind: 'VIDEO'; stream: NodeJS.ReadableStream; fileName: string; truncated: () => boolean } | { kind: 'POST'; url: string }) {
  // O arquivo é gravado e validado ANTES de abrir a transação (não segura lock durante o upload).
  let stored: { id: string; size: number; key: string; mime: string } | null = null
  if (src.kind === 'VIDEO') {
    const { d, side } = await loadDelivery(deliveryId, userId)
    if (side !== 'C') throw forbidden('Somente o criador envia a entrega.')
    if (!d.contract.signedAt) throw unprocessable('NOT_SIGNED', 'Assine o contrato antes de enviar a entrega.')
    const key = newStorageKey()
    const size = await storage.putStream(key, src.stream)
    const bad = async (code: string, msg: string) => { await storage.remove(key); throw unprocessable(code, msg) }
    if (src.truncated()) await bad('TOO_LARGE', `O vídeo pode ter no máximo ${env.MAX_VIDEO_MB} MB.`)
    const t = sniff(await storage.head(key, 16))
    if (!t || t.kind !== 'video') await bad('BAD_FILE', 'Envie um vídeo MP4, MOV ou WebM.')
    const f = await prisma.storedFile.create({ data: { ownerId: userId, kind: 'video', storageKey: key, originalName: src.fileName.replace(/[^\w.\- ()]/g, '_').slice(0, 120), mime: t!.mime, size, sha256: await hashFile(key) } })
    stored = { id: f.id, size, key, mime: t!.mime }
  }
  const sub = await prisma.$transaction(async (tx) => {
    const d = await assertCanSubmit(tx, deliveryId, userId)
    const n = (d.submissions[d.submissions.length - 1]?.n ?? 0) + 1
    const s = await tx.submission.create({
      data: src.kind === 'VIDEO'
        ? { deliveryId, n, kind: 'VIDEO', fileId: stored!.id, fileName: src.fileName.slice(0, 120), fileSize: stored!.size }
        : { deliveryId, n, kind: 'POST', url: src.url },
    })
    if (d.state === 'IA') await tx.delivery.update({ where: { id: d.id }, data: { state: 'PROD' } })
    await sysMsg(tx, d.contract.proposalId, `${d.contract.proposal.creator.name} enviou ${src.kind === 'VIDEO' ? 'o vídeo' : 'o link do post'} (envio ${n}). A IA está analisando.`, [])
    return { s, d }
  }).catch(async (e) => { if (stored) { await storage.remove(stored.key); await prisma.storedFile.delete({ where: { id: stored.id } }).catch(() => {}) } throw e })
  await dispatchAnalysis(sub.s.id, sub.d)
  return sub.s.n
}
async function dispatchAnalysis(submissionId: string, d: FullDelivery) {
  const s = await prisma.submission.findUniqueOrThrow({ where: { id: submissionId } })
  const camp = d.contract.proposal.campaign, data = camp.data as unknown as CampaignData
  try {
    await submitJob({
      jobId: s.id,
      ...(s.fileId ? { videoUrl: env.INTERNAL_API_URL + signedFilePath(s.fileId) } : { postUrl: s.url! }),
      briefing: { campaignName: camp.name, brand: camp.brandName, product: camp.product, message: camp.message, cta: camp.cta ?? undefined, mentions: data.mencoes || undefined, avoid: data.nao || undefined, maxSeconds: 60 },
      requirements: requirementsFor((camp.requirements as string[]) ?? []).map(({ id, label }) => ({ id, label })),
      callbackUrl: env.INTERNAL_API_URL + '/webhooks/video-ai',
    })
  } catch (e) {
    logger.warn({ err: (e as Error).message, submissionId }, 'falha ao enviar para o video-ai')
    await failAnalysis(submissionId, 'Não foi possível analisar agora. Envie de novo em instantes.')
  }
}
export async function failAnalysis(submissionId: string, error: string) {
  await prisma.submission.updateMany({ where: { id: submissionId, aiStatus: 'PENDING' }, data: { aiStatus: 'FAILED', aiOk: false, aiResult: { error } } })
}
/** Webhook analysis.completed. Idempotente: só aplica sobre PENDING. */
export async function applyAnalysis(r: AiResult) {
  await prisma.$transaction(async (tx) => {
    const s = await tx.submission.findUnique({ where: { id: r.jobId } })
    if (!s || s.aiStatus !== 'PENDING') return
    await lock(tx, s.deliveryId)
    // Atenção não reprova; só "falha" bloqueia (decisão registrada no ESCOPO).
    const ok = r.requirements.every((q) => q.status !== 'falha') && r.ok !== false
    const upd = await tx.submission.updateMany({
      where: { id: s.id, aiStatus: 'PENDING' },
      data: { aiStatus: 'DONE', aiOk: ok, aiScore: Math.round(r.score), durationSec: r.metrics?.durationSec ?? null, aiResult: { summary: r.summary, engine: r.engine, metrics: r.metrics ?? {}, requirements: r.requirements } as Prisma.InputJsonValue },
    })
    if (upd.count === 1 && ok) await tx.delivery.updateMany({ where: { id: s.deliveryId, state: 'PROD' }, data: { state: 'IA' } })
  })
}

// ---------- transições ----------
export async function sendForApproval(userId: string, id: string) {
  const r = await prisma.$transaction(async (tx) => {
    await lock(tx, id)
    const { d, side } = await loadDelivery(id, userId, tx)
    if (side !== 'C') throw forbidden()
    const last = d.submissions[d.submissions.length - 1]
    if (d.state !== 'IA' || !last?.aiOk) throw conflict('BAD_STATE', 'A entrega só segue para aprovação depois de passar na análise da IA.')
    await tx.delivery.update({ where: { id }, data: { state: 'APROV' } })
    await sysMsg(tx, d.contract.proposalId, `${d.contract.proposal.creator.name} enviou a entrega para aprovação (envio ${last.n}). A análise da IA ficou dentro dos padrões.`, ['K'])
    return d
  })
  fire(notify(r.contract.contractorId, 'deliverySent', { title: 'Entrega aguardando a sua aprovação', body: `${r.contract.proposal.creator.name} enviou a entrega da campanha “${r.contract.proposal.campaignName}”. O relatório da IA está pronto. A decisão final é sua.`, link: `/entregas/${id}` }))
}
export async function approve(userId: string, id: string) {
  const r = await prisma.$transaction(async (tx) => {
    await lock(tx, id)
    const { d, side } = await loadDelivery(id, userId, tx)
    if (side !== 'K') throw forbidden()
    if (d.state !== 'APROV') throw conflict('BAD_STATE', 'Nenhuma entrega aguardando decisão.')
    const last = d.submissions[d.submissions.length - 1]
    await tx.submission.update({ where: { id: last.id }, data: { decision: 'aprovada' } })
    await tx.delivery.update({ where: { id }, data: { state: 'APROVADO' } })
    await sysMsg(tx, d.contract.proposalId, `Entrega aprovada por ${d.contract.proposal.brandName}. Falta a publicação: o pagamento é liberado quando a Triskel confirmar o post no ar.`, ['C'])
    return d
  })
  fire(notify(r.contract.creatorId, 'approved', { title: 'Entrega aprovada: publique o post', body: `${r.contract.proposal.brandName} aprovou a sua entrega da campanha “${r.contract.proposal.campaignName}”. Publique o post e confirme pela Triskel para liberar o pagamento.`, link: `/entregas/${id}` }))
}
export async function requestAdjust(userId: string, id: string, commentRaw: string) {
  const comment = commentRaw.trim()
  if (comment.length < 5) throw unprocessable('COMMENT', 'Escreva o que precisa mudar.')
  const lk = leak(comment)
  if (lk) throw unprocessable('LEAK', leakMessage(lk), { kind: lk })
  const r = await prisma.$transaction(async (tx) => {
    await lock(tx, id)
    const { d, side } = await loadDelivery(id, userId, tx)
    if (side !== 'K') throw forbidden()
    if (d.state !== 'APROV') throw conflict('BAD_STATE', 'Nenhuma entrega aguardando decisão.')
    if (d.adjustCount >= MAX_ADJUSTS) throw conflict('ADJUST_LIMIT', 'Os 2 pedidos de ajuste já foram usados. Aprove a entrega.')
    const last = d.submissions[d.submissions.length - 1]
    await tx.submission.update({ where: { id: last.id }, data: { decision: 'ajustes', comment } })
    await tx.delivery.update({ where: { id }, data: { state: 'PROD', adjustCount: { increment: 1 }, adjustComment: comment } })
    await sysMsg(tx, d.contract.proposalId, `${d.contract.proposal.brandName} pediu ajustes (${d.adjustCount + 1} de ${MAX_ADJUSTS}): “${comment}”`, ['C'])
    return d
  })
  fire(notify(r.contract.creatorId, 'adjust', { title: 'Pedido de ajustes na entrega', body: `${r.contract.proposal.brandName} pediu ajustes na campanha “${r.contract.proposal.campaignName}”: “${comment}”`, link: `/entregas/${id}` }))
}

// ---------- publicação e liberação ----------
export async function requestPublish(userId: string, id: string, urlRaw: string) {
  const url = validatePostUrl(urlRaw)
  return prisma.$transaction(async (tx) => {
    await lock(tx, id)
    const { d, side } = await loadDelivery(id, userId, tx)
    if (side !== 'C') throw forbidden()
    if (d.state !== 'APROVADO') throw conflict('BAD_STATE', 'Aguarde a aprovação do contratante antes de publicar.')
    if (d.checks[0]?.state === 'PENDING') return { checkId: d.checks[0].id, state: 'PENDING' as const }
    await tx.delivery.update({ where: { id }, data: { publishUrl: url } })
    const c = await tx.publicationCheck.create({ data: { deliveryId: id, url, runAt: new Date(Date.now() + env.PUBLICATION_CHECK_DELAY_MS) } })
    return { checkId: c.id, state: 'PENDING' as const }
  })
}
/** Interface do verificador de publicação. A implementação simulada só confere o formato do link; trocar por uma integração real (APIs das redes) mantém o resto do fluxo. */
export interface PublicationVerifier { verify(url: string): Promise<{ ok: boolean; reason?: string }> }
export const simulatedVerifier: PublicationVerifier = {
  async verify(url) {
    return POSTRX.test(url.trim()) ? { ok: true } : { ok: false, reason: 'O link não parece ser de um post público do Instagram ou do TikTok.' }
  },
}
export async function processCheck(checkId: string, verifier: PublicationVerifier = simulatedVerifier) {
  const claim = await prisma.publicationCheck.updateMany({ where: { id: checkId, state: 'PENDING', runAt: { lte: new Date() } }, data: { attempts: { increment: 1 }, runAt: new Date(Date.now() + 60_000) } })
  if (claim.count !== 1) return
  const chk = await prisma.publicationCheck.findUniqueOrThrow({ where: { id: checkId } })
  const res = await verifier.verify(chk.url).catch((e) => ({ ok: false, reason: String(e?.message || e) }))
  if (!res.ok) { await prisma.publicationCheck.updateMany({ where: { id: checkId, state: 'PENDING' }, data: { state: 'FAILED' } }); return }
  const out = await prisma.$transaction(async (tx) => {
    await lock(tx, chk.deliveryId)
    const d = await tx.delivery.findUniqueOrThrow({ where: { id: chk.deliveryId }, include: { contract: { include: { proposal: { include: { creator: { select: { name: true } } } } } } } })
    const upd = await tx.publicationCheck.updateMany({ where: { id: checkId, state: 'PENDING' }, data: { state: 'CONFIRMED' } })
    if (upd.count !== 1 || d.state !== 'APROVADO') return null
    const now = new Date()
    await tx.delivery.update({ where: { id: d.id }, data: { state: 'LIBERADO', publishedAt: now, releasedAt: now } })
    await releaseEscrow(tx, d.contractId)
    await sysMsg(tx, d.contract.proposalId, `Publicação confirmada pela Triskel. ${brl(d.contract.valueCents)} foram liberados para ${d.contract.proposal.creator.name}.`, ['C', 'K'])
    return d
  })
  if (out) {
    const c = out.contract, p = c.proposal
    fire(notify(c.creatorId, 'released', { title: 'Pagamento liberado', body: `A Triskel confirmou a publicação do post da campanha “${p.campaignName}” e liberou ${brl(c.valueCents)} para a sua carteira. Já pode sacar por Pix.`, link: '/pagamentos' }))
    fire(notify(c.contractorId, 'released', { title: 'Publicação confirmada', body: `A Triskel confirmou a publicação do post de ${p.creator.name} (“${p.campaignName}”) e liberou ${brl(c.valueCents)} ao criador.`, link: `/entregas/${out.id}` }))
  }
}

export async function listDeliveries(userId: string, role: string) {
  const side = role === 'CREATOR' ? 'C' : 'K'
  const rows = await prisma.delivery.findMany({ where: { contract: side === 'C' ? { creatorId: userId } : { contractorId: userId } }, include, orderBy: { createdAt: 'desc' } })
  return rows.map((d) => deliveryDto(d, side))
}
