import { NextRequest, NextResponse } from 'next/server'

/**
 * 1) CSP com nonce por requisição. 2) Controle de acesso por papel nas páginas.
 * O cookie `tk_session` (httpOnly) só informa o papel para decidir a rota; quem autoriza de verdade é o back, em cada chamada.
 */
type Role = 'CREATOR' | 'BUSINESS' | 'AGENCY'

const PUBLIC = [/^\/$/, /^\/login$/, /^\/cadastro$/, /^\/noticias(\/.*)?$/, /^\/empresa$/, /^\/fale-conosco$/, /^\/privacidade$/, /^\/termos$/]
const ONLY: Array<[RegExp, Role[]]> = [
  [/^\/oportunidades(\/|$)/, ['CREATOR']],
  [/^\/portfolio(\/|$)/, ['CREATOR']],
  [/^\/pagamentos\/saque(\/|$)/, ['CREATOR']],
  [/^\/perfil\/valores(\/|$)/, ['CREATOR']],
  [/^\/criadores(\/|$)/, ['BUSINESS', 'AGENCY']],
  [/^\/campanhas(\/|$)/, ['BUSINESS', 'AGENCY']],
  [/^\/pagamentos\/adicionar(\/|$)/, ['BUSINESS', 'AGENCY']],
  [/^\/clientes(\/|$)/, ['AGENCY']],
]
const GUEST_ONLY = [/^\/login$/, /^\/cadastro$/]

function csp(nonce: string, dev: boolean) {
  const pay = process.env.NEXT_PUBLIC_PAYSIM_URL || ''
  const api = ["'self'", pay].filter(Boolean).join(' ')
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "font-src 'self' data:",
    `connect-src ${api}${dev ? ' ws:' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

function session(req: NextRequest): { role: Role } | null {
  const raw = req.cookies.get('tk_session')?.value
  if (!raw) return null
  try {
    const s = JSON.parse(raw)
    return ['CREATOR', 'BUSINESS', 'AGENCY'].includes(s.role) ? { role: s.role } : null
  } catch { return null }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const nonce = btoa(crypto.randomUUID())
  const policy = csp(nonce, process.env.NODE_ENV !== 'production')
  const s = session(req)

  const redirect = (to: string, search?: Record<string, string>) => {
    const u = req.nextUrl.clone(); u.pathname = to; u.search = ''
    for (const [k, v] of Object.entries(search || {})) u.searchParams.set(k, v)
    const r = NextResponse.redirect(u); r.headers.set('Content-Security-Policy', policy); return r
  }

  if (s && GUEST_ONLY.some((r) => r.test(pathname))) return redirect('/painel')
  if (!PUBLIC.some((r) => r.test(pathname))) {
    if (!s) return redirect('/login', { next: pathname + req.nextUrl.search })
    const rule = ONLY.find(([r]) => r.test(pathname))
    if (rule && !rule[1].includes(s.role)) return redirect('/painel')
  }

  const h = new Headers(req.headers)
  h.set('x-nonce', nonce)
  h.set('Content-Security-Policy', policy)
  const res = NextResponse.next({ request: { headers: h } })
  res.headers.set('Content-Security-Policy', policy)
  return res
}

export const config = {
  matcher: [{ source: '/((?!api/|_next/static|_next/image|favicon.ico|img/|.*\\.(?:png|jpg|svg|webp|ico)$).*)' }],
}
