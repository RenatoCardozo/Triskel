import 'server-only'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'

export const BACK_URL = (process.env.BACK_URL || 'http://localhost:4000').replace(/\/$/, '')
const SECURE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production'

export const AT = 'tk_at' // access token (curto)
export const RT = 'tk_rt' // refresh token (só enviado a /api)
export const SS = 'tk_session' // {role, rem}: só para o middleware decidir rotas por papel

export interface BackSession { accessToken: string; refreshToken: string; expiresIn: number }
export type Role = 'CREATOR' | 'BUSINESS' | 'AGENCY'
const REFRESH_TTL = 60 * 60 * 24 * 14

const base = { httpOnly: true, secure: SECURE, sameSite: 'lax' as const }

/** Grava a sessão em cookies httpOnly. Sem "lembrar-me", refresh e sessão viram cookies de sessão do navegador. */
export function setSessionCookies(res: NextResponse, s: BackSession, role: Role, remember: boolean) {
  res.cookies.set(AT, s.accessToken, { ...base, path: '/', maxAge: Math.max(30, s.expiresIn - 15) })
  res.cookies.set(RT, s.refreshToken, { ...base, path: '/api', ...(remember ? { maxAge: REFRESH_TTL } : {}) })
  res.cookies.set(SS, JSON.stringify({ role, rem: remember ? 1 : 0 }), { ...base, path: '/', ...(remember ? { maxAge: REFRESH_TTL } : {}) })
}
export function clearSessionCookies(res: NextResponse) {
  res.cookies.set(AT, '', { ...base, path: '/', maxAge: 0 })
  res.cookies.set(RT, '', { ...base, path: '/api', maxAge: 0 })
  res.cookies.set(SS, '', { ...base, path: '/', maxAge: 0 })
}
export async function readRemember(): Promise<boolean> {
  try { return JSON.parse((await cookies()).get(SS)?.value || '{}').rem === 1 } catch { return false }
}

/** Defesa contra CSRF nos métodos que alteram dados: Origin precisa ser o próprio host ou uma origem permitida. */
export function originOk(req: Request): boolean {
  const o = req.headers.get('origin')
  if (!o) return false
  let host: string
  try { host = new URL(o).host } catch { return false }
  const mine = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (mine && mine === host) return true
  return (process.env.APP_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean).includes(o)
}

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } })
export const errBody = (code: string, message: string) => ({ error: { code, message } })

/** Fetch ao back com timeout; devolve a resposta crua. */
export async function backFetch(path: string, init: RequestInit & { timeoutMs?: number } = {}) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), init.timeoutMs ?? 15_000)
  try { return await fetch(BACK_URL + path, { ...init, signal: ctl.signal, cache: 'no-store' }) } finally { clearTimeout(t) }
}
