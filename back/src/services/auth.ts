import bcrypt from 'bcryptjs'
import { prisma } from '../db'
import { env } from '../env'
import { AppError, conflict, unauthorized, unprocessable } from '../lib/errors'
import { hashCode, hashToken, randomToken, rid, sixDigits, safeEqual } from '../lib/crypto'
import { signAccess, AuthUser } from '../plugins/auth'
import { mailTo } from '../lib/emails'
import { REGIAO_PELOTAS } from '../lib/options'
import { nz } from '../lib/compat'
import { fmtCNPJ, fmtCPF, fmtTel } from '../lib/validators'

const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', env.BCRYPT_COST)
export const hashPassword = (p: string) => bcrypt.hash(p, env.BCRYPT_COST)
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h)

export interface RegisterInput {
  role: 'CREATOR' | 'BUSINESS' | 'AGENCY'; nome: string; resp?: string; doc: string; data: Date; cidade: string; uf: string
  email: string; tel: string; senha: string
}
export async function register(i: RegisterInput) {
  const email = i.email.trim().toLowerCase()
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) throw conflict('EMAIL_IN_USE', 'Este e-mail já está cadastrado.')
  const passwordHash = await hashPassword(i.senha)
  const publicId = String(10_000_000 + Math.floor(Math.random() * 89_999_999))
  const name = i.role === 'CREATOR' ? i.nome : i.resp || i.nome
  const user = await prisma.user.create({
    data: {
      email, passwordHash, role: i.role, publicId, phone: fmtTel(i.tel), name: i.role === 'CREATOR' ? i.nome : i.nome,
      wallet: { create: {} },
      ...(i.role === 'CREATOR'
        ? { creator: { create: { cpf: fmtCPF(i.doc), birthDate: i.data, city: i.cidade, uf: i.uf, nearPelotas: REGIAO_PELOTAS.includes(nz(i.cidade)), languages: [], niches: [], formats: [], audAges: [], audInterests: [] } } }
        : { company: { create: { tradeName: i.nome, cnpj: fmtCNPJ(i.doc), responsible: i.resp, foundedAt: i.data, city: i.cidade, uf: i.uf, channels: [], audAges: [], audInterests: [], desiredFormats: [], creatorSizes: [], creatorNiches: [], services: [], clientSegments: [] } } }),
    },
  })
  void name
  await issueEmailCode(user.id, 'VERIFY')
  return user
}

export async function issueEmailCode(userId: string, kind: 'VERIFY' | 'NEW_EMAIL', newEmail?: string) {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  await prisma.emailCode.deleteMany({ where: { userId, kind, usedAt: null } })
  const code = sixDigits()
  await prisma.emailCode.create({ data: { userId, kind, codeHash: hashCode(userId, code), newEmail, expiresAt: new Date(Date.now() + 30 * 60_000) } })
  const to = kind === 'NEW_EMAIL' ? newEmail! : u.email
  await mailTo(to, u.name, kind === 'VERIFY' ? 'Seu código de verificação da Triskel' : 'Confirme o novo e-mail na Triskel',
    kind === 'VERIFY' ? 'Use o código abaixo para validar o seu e-mail. Ele vale por 30 minutos. Sem validar, o seu perfil não aparece para outras pessoas.' : 'Use o código abaixo para confirmar o novo e-mail da sua conta. Ele vale por 30 minutos.', code)
}
export async function checkEmailCode(userId: string, kind: 'VERIFY' | 'NEW_EMAIL', code: string) {
  const row = await prisma.emailCode.findFirst({ where: { userId, kind, usedAt: null }, orderBy: { createdAt: 'desc' } })
  if (!row || row.expiresAt < new Date()) throw unprocessable('CODE_EXPIRED', 'Código expirado. Peça um novo código.')
  if (row.attempts >= 5) throw new AppError(429, 'CODE_LOCKED', 'Muitas tentativas. Peça um novo código.')
  if (!safeEqual(row.codeHash, hashCode(userId, code))) {
    await prisma.emailCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } })
    throw unprocessable('CODE_INVALID', 'Código incorreto.')
  }
  await prisma.emailCode.update({ where: { id: row.id }, data: { usedAt: new Date() } })
  return row
}

export interface Session { accessToken: string; refreshToken: string; expiresIn: number }
async function createSession(user: AuthUser, meta: { ip?: string; ua?: string }, familyId = rid(16) + randomToken(8)): Promise<Session & { rtId: string }> {
  const refreshToken = randomToken(48)
  const rt = await prisma.refreshToken.create({ data: { userId: user.id, familyId, tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + env.REFRESH_TTL_SECONDS * 1000), ip: meta.ip, userAgent: meta.ua?.slice(0, 190) } })
  return { accessToken: signAccess(user), refreshToken, expiresIn: env.ACCESS_TTL_SECONDS, rtId: rt.id }
}
export const startSession = async (u: { id: string; role: any }, meta: { ip?: string; ua?: string }) => {
  const { rtId: _r, ...s } = await createSession({ id: u.id, role: u.role }, meta)
  return s
}

export async function login(emailRaw: string, password: string, meta: { ip?: string; ua?: string }) {
  const user = await prisma.user.findUnique({ where: { email: emailRaw.trim().toLowerCase() } })
  const bad = unauthorized('E-mail ou senha incorretos.')
  if (user?.lockedUntil && user.lockedUntil > new Date()) { await verifyPassword(password, DUMMY_HASH); throw new AppError(429, 'LOCKED', 'Muitas tentativas. Tente de novo em alguns minutos.') }
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH) // custo constante: não revela se o e-mail existe
  if (!user || !ok) {
    if (user) {
      const fails = user.failedLogins + 1
      await prisma.user.update({ where: { id: user.id }, data: { failedLogins: fails, lockedUntil: fails >= 5 ? new Date(Date.now() + 15 * 60_000) : null } })
    }
    throw bad
  }
  if (user.failedLogins) await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } })
  // nova sessão a cada login: sem fixação de sessão
  return { user, session: await startSession(user, meta) }
}

/** Refresh rotativo. Reuso de token já rotacionado revoga a família inteira (token roubado). */
export async function refresh(token: string, meta: { ip?: string; ua?: string }) {
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } })
  if (!row) throw unauthorized('Sessão inválida.')
  if (row.revokedAt) {
    await prisma.refreshToken.updateMany({ where: { familyId: row.familyId, revokedAt: null }, data: { revokedAt: new Date() } })
    throw unauthorized('Sessão inválida.')
  }
  if (row.expiresAt < new Date()) throw unauthorized('Sessão expirada.')
  const s = await createSession({ id: row.userId, role: row.user.role }, meta, row.familyId)
  const res = await prisma.refreshToken.updateMany({ where: { id: row.id, revokedAt: null }, data: { revokedAt: new Date(), replacedById: s.rtId } })
  if (res.count === 0) throw unauthorized('Sessão inválida.')
  const { rtId: _r, ...out } = s
  return { user: row.user, session: out }
}
export async function logout(token: string) {
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(token) } })
  if (row) await prisma.refreshToken.updateMany({ where: { familyId: row.familyId, revokedAt: null }, data: { revokedAt: new Date() } })
}
export async function revokeAllSessions(userId: string) {
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })
}
