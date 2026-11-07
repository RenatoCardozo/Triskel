import { z } from 'zod'
import { prisma } from '../db'
import { OPT, REGIAO_PELOTAS, sizeBandOf } from '../lib/options'
import { cnpjOk, cpfOk, handleNorm, digits, fmtCNPJ, fmtCPF, UFS } from '../lib/validators'
import { nz } from '../lib/compat'
import { unprocessable } from '../lib/errors'
import { isoDate, parseISODate } from '../lib/dates'

type Kind = 's' | 'a' | 'd' | 'n' | 'h' | 'cpf' | 'cnpj' | 'uf'
interface F { k: string; col: string; kind: Kind; req?: boolean; opts?: string[]; label: string; max?: number }
const S = (k: string, col: string, label: string, req = false, extra: Partial<F> = {}): F => ({ k, col, kind: 's', label, req, ...extra })
const A = (k: string, col: string, label: string, opts: string[], req = false): F => ({ k, col, kind: 'a', label, req, opts })

/** Campos de perfil por papel (chaves = nomes do protótipo). `req` = obrigatório para o perfil ficar completo. */
export const FIELDS: Record<'CREATOR' | 'BUSINESS' | 'AGENCY', F[]> = {
  CREATOR: [
    S('genero', 'gender', 'Gênero', true, { opts: OPT.generoCriador }), S('cidade', 'city', 'Cidade', true, { max: 40 }), { k: 'uf', col: 'uf', kind: 'uf', label: 'Estado', req: true },
    A('idiomas', 'languages', 'Idiomas', OPT.idi, true), S('sobre', 'about', 'Sobre você', true, { max: 600 }),
    { k: 'insta', col: 'instagram', kind: 'h', label: 'Instagram', req: true }, { k: 'tiktok', col: 'tiktok', kind: 'h', label: 'TikTok' }, S('yt', 'youtube', 'YouTube', false, { max: 60 }),
    S('seg', 'followersBand', 'Seguidores da sua maior rede', true, { opts: OPT.seguidores }),
    A('nichos', 'niches', 'Nichos de atuação', OPT.nichos, true), A('fmt', 'formats', 'Formatos de vídeo', OPT.fmt, true),
    S('prazo', 'avgDelivery', 'Prazo médio de entrega', true, { opts: OPT.prazo }),
    A('pIdade', 'audAges', 'Faixa etária', OPT.idades, true), S('pGen', 'audGender', 'Gênero predominante', true, { opts: OPT.gen }),
    S('pReg', 'audRegion', 'Região do público', true, { opts: OPT.reg }), A('pInt', 'audInterests', 'Interesses do público', OPT.nichos),
  ],
  BUSINESS: [
    { k: 'cnpj', col: 'cnpj', kind: 'cnpj', label: 'CNPJ' }, S('resp', 'responsible', 'Nome do responsável', false, { max: 60 }),
    S('seg', 'segment', 'Segmento', true, { opts: OPT.segE }), S('porte', 'size', 'Porte', true, { opts: OPT.porteEmp }),
    S('cidade', 'city', 'Cidade', true, { max: 40 }), { k: 'uf', col: 'uf', kind: 'uf', label: 'Estado', req: true }, S('sobre', 'about', 'Sobre o negócio', true, { max: 600 }),
    { k: 'insta', col: 'instagram', kind: 'h', label: 'Instagram', req: true }, S('site', 'site', 'Site ou cardápio online', false, { max: 100 }),
    A('canais', 'channels', 'Canais de venda', OPT.canais, true),
    A('pIdade', 'audAges', 'Faixa etária', OPT.idades, true), S('pGen', 'audGender', 'Gênero predominante', true, { opts: OPT.gen }),
    S('pReg', 'audRegion', 'Região dos clientes', true, { opts: OPT.reg }), A('pInt', 'audInterests', 'Interesses do público', OPT.nichos, true),
    A('fmt', 'desiredFormats', 'Formatos desejados', OPT.fmt, true), S('orc', 'budget', 'Orçamento médio por vídeo', true, { opts: OPT.orcE }),
    A('porteCr', 'creatorSizes', 'Porte de criador buscado', OPT.porteCr, true), A('nichosCr', 'creatorNiches', 'Nichos de criadores preferidos', OPT.nichos),
  ],
  AGENCY: [
    { k: 'cnpj', col: 'cnpj', kind: 'cnpj', label: 'CNPJ' }, S('resp', 'responsible', 'Nome do responsável', false, { max: 60 }),
    A('servicos', 'services', 'Serviços oferecidos', OPT.serv, true), S('equipe', 'teamSize', 'Tamanho da equipe', true, { opts: OPT.equipe }),
    S('cidade', 'city', 'Cidade', true, { max: 40 }), { k: 'uf', col: 'uf', kind: 'uf', label: 'Estado', req: true }, S('sobre', 'about', 'Sobre a agência', true, { max: 600 }),
    { k: 'insta', col: 'instagram', kind: 'h', label: 'Instagram', req: true }, S('site', 'site', 'Site', false, { max: 100 }),
    A('segs', 'clientSegments', 'Segmentos atendidos', OPT.segE, true), S('nCli', 'clientsRange', 'Clientes ativos', true, { opts: OPT.nCli }),
    A('pIdade', 'audAges', 'Faixa etária dos públicos', OPT.idades, true), S('reg', 'audRegion', 'Regiões atendidas', true, { opts: OPT.reg }),
    S('orc', 'budget', 'Orçamento médio por campanha', true, { opts: OPT.orcA }), A('fmt', 'desiredFormats', 'Formatos mais produzidos', OPT.fmt, true),
    A('porteCr', 'creatorSizes', 'Porte de criador buscado', OPT.porteCr, true),
  ],
}

const shape = (role: keyof typeof FIELDS) => {
  const o: Record<string, z.ZodTypeAny> = {}
  for (const f of FIELDS[role]) {
    let t: z.ZodTypeAny
    if (f.kind === 'a') t = z.array(z.string().refine((v) => f.opts!.includes(v), 'opção inválida')).max(30)
    else if (f.opts) t = z.union([z.literal(''), z.string().refine((v) => f.opts!.includes(v), 'opção inválida')])
    else t = z.string().max(f.max ?? 100)
    o[f.k] = t.optional()
  }
  o.nome = z.string().trim().min(3).max(60).optional()
  return z.object(o).strict()
}
export const profileSchemas = { CREATOR: shape('CREATOR'), BUSINESS: shape('BUSINESS'), AGENCY: shape('AGENCY') }
export const pricesSchema = z.object({
  reels: z.number().int().min(0).max(5_000_000), stories: z.number().int().min(0).max(5_000_000), tiktok: z.number().int().min(0).max(5_000_000),
  img: z.enum(OPT.imgUso as [string, ...string[]]), showPrices: z.boolean(), acceptBelowMin: z.boolean(),
}).partial()

const txt = (s: string) => s.replace(/[\u0000-\u001f]/g, '').trim()
function norm(f: F, v: any): { value: any; error?: string } {
  if (f.kind === 'a') return { value: v }
  const s = txt(String(v ?? ''))
  if (f.kind === 'h') { if (!s) return { value: null }; const h = handleNorm(s); return h.length < 3 || /\.$/.test(h) || /\.\./.test(h) ? { value: null, error: `${f.label} inválido.` } : { value: h } }
  if (f.kind === 'uf') { const u = s.toUpperCase(); return !s ? { value: null } : UFS.includes(u) ? { value: u } : { value: null, error: 'UF inválida.' } }
  if (f.kind === 'cnpj') return !s ? { value: null } : cnpjOk(s) ? { value: fmtCNPJ(s) } : { value: null, error: 'CNPJ inválido.' }
  return { value: s || null }
}

/** Atualiza o perfil do papel do usuário com as chaves do protótipo. */
export async function updateProfile(userId: string, role: keyof typeof FIELDS, body: Record<string, any>) {
  const data: Record<string, any> = {}
  for (const f of FIELDS[role]) {
    if (!(f.k in body)) continue
    const r = norm(f, body[f.k])
    if (r.error) throw unprocessable('VALIDATION', r.error, { field: f.k })
    data[f.col] = r.value
  }
  if (role === 'CREATOR') {
    if ('seg' in body) data.sizeBand = sizeBandOf(data.followersBand)
    if ('cidade' in body) data.nearPelotas = REGIAO_PELOTAS.includes(nz(data.city || ''))
  }
  if (body.nome) await prisma.user.update({ where: { id: userId }, data: { name: body.nome } })
  if (role === 'CREATOR') {
    for (const k of ['languages', 'niches', 'formats', 'audAges', 'audInterests']) if (data[k] === undefined) continue
    await prisma.creatorProfile.update({ where: { userId }, data })
  } else {
    if (body.nome) data.tradeName = body.nome
    await prisma.companyProfile.update({ where: { userId }, data })
  }
}

export async function loadProfile(userId: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { creator: true, company: true } })
  const role = u.role as keyof typeof FIELDS
  const p: any = role === 'CREATOR' ? u.creator : u.company
  const api: Record<string, any> = { nome: u.name }
  for (const f of FIELDS[role]) {
    const v = p?.[f.col]
    api[f.k] = f.kind === 'a' ? (Array.isArray(v) ? v : []) : (v ?? '')
  }
  if (role === 'CREATOR') {
    api.rating = p.ratingAvg ?? 0; api.jobs = p.jobsCount ?? 0
    api.cpf = p.cpf ?? ''; api.nasc = p.birthDate ? isoDate(p.birthDate) : ''
    api.val = { reels: p.priceReels ?? 0, stories: p.priceStories ?? 0, tiktok: p.priceTiktok ?? 0, img: p.imageUse ?? OPT.imgUso[0], showPrices: p.showPrices, acceptBelowMin: p.acceptBelowMin }
  } else {
    api.fund = p.foundedAt ? isoDate(p.foundedAt) : ''
  }
  const hasPhotos = !!u.avatarFileId && !!u.coverFileId
  const missing: string[] = []
  if (!u.avatarFileId) missing.push('foto de perfil')
  if (!u.coverFileId) missing.push('foto de capa')
  for (const f of FIELDS[role]) {
    if (!f.req) continue
    const v = api[f.k]
    if (f.kind === 'a' ? !v.length : !String(v).trim()) missing.push(f.label.toLowerCase())
  }
  if (role === 'CREATOR' && !(api.val.reels > 0)) missing.push('valor mínimo por vídeo (r$)')
  const complete = missing.length === 0 && hasPhotos
  const verified = !!u.emailVerifiedAt
  return { user: u, role, api, missing, complete, verified, visible: complete && verified && u.visible }
}

export const docOf = (role: string, api: any) => (role === 'CREATOR' ? (api.cpf ? fmtCPF(api.cpf) : '') : api.cnpj || '')
export { cpfOk, cnpjOk, parseISODate, digits }
