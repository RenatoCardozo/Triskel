import { z } from 'zod'
import { Prisma } from '../generated/prisma/client'
import { prisma, Db } from '../db'
import { OPT } from '../lib/options'
import { notFound, unprocessable, conflict } from '../lib/errors'
import { isoDate, parseISODate, todaySP } from '../lib/dates'
import { CampaignData, generate } from './campaignGen'
import { MIN_OFFER_CENTS, breakdown } from '../lib/money'
import { CampaignLike } from '../lib/compat'

const opt = (a: readonly string[]) => z.string().refine((v) => a.includes(v), 'opção inválida')
const chips = (a: readonly string[], min = 0) => z.array(opt(a)).min(min).max(20)
const t = (max: number, min = 0) => z.string().trim().min(min).max(max)
const isoD = z.string().refine((s) => !!parseISODate(s), 'data inválida (aaaa-mm-dd)')

/** Formulário "Criar campanha" do protótipo (CSCH). Valor em centavos, datas ISO. */
export const campaignInput = z.object({
  clientId: z.string().optional(),
  nome: t(80, 3), produto: t(120, 3), obj: opt(OPT.objetivos), desc: t(1200, 10), msg: t(160, 3), cta: t(80).optional().default(''),
  pIdade: chips(OPT.idades, 1), pGen: opt(OPT.gen), pReg: opt(OPT.reg), pInt: chips(OPT.nichos).default([]),
  nichosCr: chips(OPT.nichos, 1), porteCr: chips(OPT.porteCr, 1), genCr: opt(OPT.genCr), idCr: opt(OPT.idCr), regCr: opt(OPT.reg), nota: opt(OPT.nota),
  qCr: z.number().int().min(1).max(20),
  fmt: chips(OPT.fmt, 1), plat: chips(OPT.plataformas, 1), qVid: z.number().int().min(1).max(10), dur: opt(OPT.duracoes), tom: chips(OPT.tons, 1),
  mencoes: t(120).optional().default(''), refs: t(200).optional().default(''), nao: t(400).optional().default(''),
  valueCents: z.number().int().min(MIN_OFFER_CENTS).max(5_000_000),
  inicio: isoD, entrega: isoD, publi: isoD.optional().or(z.literal('')).default(''),
  rev: opt(OPT.rev), uso: opt(OPT.uso), excl: opt(OPT.excl), envio: opt(OPT.envio),
}).strict()
export type CampaignInput = z.infer<typeof campaignInput>

export const exclDays = (s: string) => (s === '30 dias' ? 30 : s === '60 dias' ? 60 : 0)

/** Valida regras de data e de texto que o zod sozinho não cobre. */
export function checkCampaign(i: CampaignInput) {
  const today = todaySP(), ent = parseISODate(i.entrega)!, ini = parseISODate(i.inicio)!
  if (ent <= today) throw unprocessable('DELIVERY_PAST', 'O prazo de entrega precisa ser uma data futura.')
  if (ini > ent) throw unprocessable('DATES', 'O início da campanha deve ser anterior ao prazo de entrega.')
  if (i.publi && parseISODate(i.publi)! < ent) throw unprocessable('DATES', 'A publicação deve ser depois da entrega.')
}

/** Marca da campanha: o próprio comércio ou o cliente da agência. */
export async function brandOf(user: { id: string; name: string; role: string }, clientId?: string, db: Db = prisma) {
  if (user.role === 'AGENCY') {
    if (!clientId) throw unprocessable('CLIENT_REQUIRED', 'Escolha o cliente da campanha.')
    const c = await db.agencyClient.findFirst({ where: { id: clientId, agencyId: user.id } })
    if (!c) throw notFound('Cliente não encontrado.')
    return { brandName: c.name, segment: c.segment, clientId: c.id }
  }
  const co = await db.companyProfile.findUnique({ where: { userId: user.id } })
  return { brandName: co?.tradeName || user.name, segment: co?.segment || 'Outros', clientId: null as string | null }
}

export function toRow(i: CampaignInput, brand: { brandName: string }) {
  const { clientId: _c, valueCents, ...data } = i
  const g = generate(data as unknown as CampaignData, brand.brandName)
  return {
    name: i.nome, product: i.produto, objective: i.obj, description: i.desc, message: i.msg, cta: i.cta || null,
    data: data as unknown as Prisma.InputJsonValue, generated: { headline: g.headline, creators: g.creators, content: g.content } as Prisma.InputJsonValue,
    requirements: g.defaultRequirements as Prisma.InputJsonValue,
    valueCents, videos: i.qVid, creatorsQty: i.qCr, deliveryDate: parseISODate(i.entrega)!, exclusiveDays: exclDays(i.excl), imageUse: i.uso,
  }
}

export async function ownCampaign(id: string, ownerId: string, db: Db = prisma) {
  const c = await db.campaign.findFirst({ where: { id, ownerId }, include: { client: true } })
  if (!c) throw notFound('Campanha não encontrada.')
  return c
}

type Row = Awaited<ReturnType<typeof ownCampaign>>
export function campaignDto(c: Row, extra: Record<string, unknown> = {}) {
  const d = c.data as unknown as CampaignData & { inicio: string; entrega: string; publi: string }
  const per = c.valueCents * c.videos
  return {
    id: c.id, status: c.status, brandName: c.brandName, segment: c.segment, clientId: c.clientId, createdAt: c.createdAt,
    form: { ...d, valueCents: c.valueCents },
    generated: c.generated, requirements: c.requirements as string[],
    conditions: { perCreator: breakdown(per), total: breakdown(per * c.creatorsQty), perVideoCents: c.valueCents },
    ...extra,
  }
}

/** Contexto usado por busca/proposta: exige que a campanha seja do usuário. */
export async function campaignContext(id: string, ownerId: string, db: Db = prisma) {
  const c = await ownCampaign(id, ownerId, db)
  const d = c.data as unknown as CampaignData
  const compatInput: CampaignLike = { nichosCr: d.nichosCr, regCr: d.regCr, nota: d.nota, porteCr: d.porteCr, valueCents: c.valueCents }
  return { id: c.id, name: c.name, brandKey: c.brandName, segment: c.segment, exclusiveDays: c.exclusiveDays, delivery: c.deliveryDate, valueCents: c.valueCents, videos: c.videos, compatInput, campaign: c }
}

export async function ensureEditable(c: Row) {
  const n = await prisma.proposal.count({ where: { campaignId: c.id } })
  if (n) throw conflict('CAMPAIGN_LOCKED', 'Esta campanha já foi enviada a criadores e não pode mais ser editada. Crie uma nova campanha.')
}
export { isoDate }
