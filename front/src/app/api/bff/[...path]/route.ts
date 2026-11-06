import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AT, RT, backFetch, clearSessionCookies, errBody, originOk, readRemember, setSessionCookies, type BackSession, type Role } from '@/lib/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Proxy autenticado (BFF). O navegador nunca vê os tokens: aqui o cookie httpOnly vira `Authorization: Bearer`.
 * - Só repassa caminhos da lista abaixo; login/registro/refresh/logout têm rotas próprias em /api/auth.
 * - Em 401, renova a sessão uma única vez (single-flight por refresh token, para não disparar a detecção de reuso do back).
 */
const ALLOWED = new Set(['me', 'campaigns', 'opportunities', 'creators', 'proposals', 'contracts', 'wallet', 'deliveries', 'reviews', 'dashboard', 'news', 'meta', 'contact', 'files', 'auth'])
const AUTH_OK = new Set(['me', 'verify-email', 'resend-code'])
const SEG = /^[A-Za-z0-9_\-:]{1,80}$/
const FWD_REQ = ['content-type', 'content-length', 'accept', 'range', 'idempotency-key', 'if-none-match', 'if-range']
const FWD_RES = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'content-disposition', 'etag', 'last-modified']

type Renewed = { at: string; rt: string; session: BackSession; role: Role }
const inflight = new Map<string, Promise<Renewed | 'denied' | 'down'>>()

function renew(oldRt: string): Promise<Renewed | 'denied' | 'down'> {
  let p = inflight.get(oldRt)
  if (p) return p
  p = (async () => {
    try {
      const r = await backFetch('/api/v1/auth/refresh', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refreshToken: oldRt }), timeoutMs: 8000 })
      if (r.status === 401 || r.status === 403) return 'denied' as const
      if (!r.ok) return 'down' as const
      const d = await r.json()
      return { at: d.session.accessToken, rt: d.session.refreshToken, session: d.session, role: d.user.role } as Renewed
    } catch { return 'down' as const }
  })()
  inflight.set(oldRt, p)
  // mantém o resultado por alguns segundos: requisições paralelas que ainda carregam o refresh antigo reaproveitam os novos tokens
  setTimeout(() => inflight.delete(oldRt), 20_000).unref?.()
  return p
}

function pathOf(parts: string[]): { url: string } | null {
  if (!parts.length || parts.length > 5 || !parts.every((s) => SEG.test(s))) return null
  if (!ALLOWED.has(parts[0])) return null
  if (parts[0] === 'auth' && !(parts.length === 2 && AUTH_OK.has(parts[1]))) return null
  return { url: parts[0] === 'files' ? '/files/' + parts.slice(1).join('/') : '/api/v1/' + parts.join('/') }
}

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const parts = (await ctx.params).path
  const target = pathOf(parts)
  if (!target) return NextResponse.json(errBody('NOT_FOUND', 'Recurso não encontrado.'), { status: 404 })
  const mutating = !['GET', 'HEAD'].includes(req.method)
  if (mutating && !originOk(req)) return NextResponse.json(errBody('FORBIDDEN', 'Origem não permitida.'), { status: 403 })

  const jar = await cookies()
  let at = jar.get(AT)?.value
  const rt = jar.get(RT)?.value
  let renewed: Renewed | null = null
  const publicRoute = ['news', 'meta', 'contact'].includes(parts[0])

  const deny = () => { const r = NextResponse.json(errBody('SESSION_EXPIRED', 'Sua sessão expirou. Entre novamente.'), { status: 401 }); clearSessionCookies(r); return r }
  const tryRenew = async (): Promise<NextResponse | null> => {
    if (!rt) return publicRoute ? null : deny()
    const r = await renew(rt)
    if (r === 'denied') return deny()
    if (r === 'down') return NextResponse.json(errBody('UPSTREAM', 'Servidor indisponível. Tente novamente.'), { status: 502 })
    renewed = r; at = r.at
    return null
  }
  if (!at && rt) { const e = await tryRenew(); if (e) return e }
  if (!at && !publicRoute) return deny()

  // corpo: JSON pequeno é guardado em memória (permite repetir após renovar); o resto (vídeos) segue em stream
  const headers = new Headers()
  for (const h of FWD_REQ) { const v = req.headers.get(h); if (v) headers.set(h, v) }
  const ct = req.headers.get('content-type') || ''
  let body: BodyInit | undefined
  let buffered: ArrayBuffer | null = null
  if (mutating && req.body) {
    const len = Number(req.headers.get('content-length') || 0)
    if (ct.includes('application/json') && len < 1_000_000) { buffered = await req.arrayBuffer(); body = buffered; headers.delete('content-length') }
    else body = req.body
  }
  const call = (token: string | undefined) => {
    if (token) headers.set('authorization', 'Bearer ' + token); else headers.delete('authorization')
    const init: RequestInit & { duplex?: 'half'; timeoutMs?: number } = { method: req.method, headers, body, timeoutMs: parts[1] === 'submissions' || parts.at(-1) === 'photo' ? 600_000 : 30_000 }
    if (body && !buffered) init.duplex = 'half'
    return backFetch(target.url + new URL(req.url).search, init)
  }

  let up: Response
  try { up = await call(at) } catch { return NextResponse.json(errBody('UPSTREAM', 'Não foi possível falar com o servidor. Tente novamente.'), { status: 502 }) }
  if (up.status === 401 && rt && !renewed && (!body || buffered)) {
    const e = await tryRenew(); if (e) return e
    try { up = await call(at) } catch { return NextResponse.json(errBody('UPSTREAM', 'Não foi possível falar com o servidor. Tente novamente.'), { status: 502 }) }
  } else if (up.status === 401 && rt && !renewed) {
    // corpo em stream não pode ser repetido: renova e pede ao cliente para repetir uma vez
    const e = await tryRenew(); if (e) return e
    const r = NextResponse.json(errBody('RETRY', 'Sessão renovada. Tente de novo.'), { status: 401, headers: { 'x-session-renewed': '1' } })
    const nr = renewed as Renewed | null
    if (nr) setSessionCookies(r, nr.session, nr.role, await readRemember())
    return r
  }

  const out = new Headers()
  for (const h of FWD_RES) { const v = up.headers.get(h); if (v) out.set(h, v) }
  out.set('cache-control', parts[0] === 'files' && up.ok ? 'private, max-age=300' : 'private, no-store')
  if (up.headers.get('retry-after')) out.set('retry-after', up.headers.get('retry-after')!)
  const res = new NextResponse(up.status === 204 || up.status === 304 ? null : up.body, { status: up.status, headers: out })
  const nr = renewed as Renewed | null
  if (nr) setSessionCookies(res, nr.session, nr.role, await readRemember())
  return res
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE }
