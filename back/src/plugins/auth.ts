import jwt from 'jsonwebtoken'
import { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../env'
import { forbidden, unauthorized } from '../lib/errors'

export type RoleName = 'CREATOR' | 'BUSINESS' | 'AGENCY'
export interface AuthUser { id: string; role: RoleName }
declare module 'fastify' {
  interface FastifyRequest { user?: AuthUser; rawBody?: string }
}
const ISS = 'triskel-api', AUD = 'triskel-web'

export function signAccess(u: AuthUser): string {
  return jwt.sign({ role: u.role }, env.JWT_ACCESS_SECRET, { algorithm: 'HS256', subject: u.id, issuer: ISS, audience: AUD, expiresIn: env.ACCESS_TTL_SECONDS })
}
export function readAccess(token: string): AuthUser {
  try {
    const p = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'], issuer: ISS, audience: AUD }) as jwt.JwtPayload
    if (!p.sub || !['CREATOR', 'BUSINESS', 'AGENCY'].includes(p.role)) throw new Error('claims')
    return { id: p.sub, role: p.role }
  } catch {
    throw unauthorized('Sessão inválida ou expirada.')
  }
}
export async function requireAuth(req: FastifyRequest, _reply: FastifyReply) {
  const h = req.headers.authorization
  if (!h || !h.startsWith('Bearer ')) throw unauthorized()
  req.user = readAccess(h.slice(7))
}
/** Uso: preHandler: [requireAuth, roles('BUSINESS','AGENCY')] */
export const roles = (...allowed: RoleName[]) => async (req: FastifyRequest) => {
  if (!req.user || !allowed.includes(req.user.role)) throw forbidden('Seu perfil não tem acesso a este recurso.')
}
export const isContractor = (r: RoleName) => r === 'BUSINESS' || r === 'AGENCY'
