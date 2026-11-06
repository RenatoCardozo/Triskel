import { NextResponse } from 'next/server'
import { z } from 'zod'
import { backFetch, errBody, originOk, setSessionCookies, type Role } from '@/lib/server'

const body = z.object({ email: z.string().max(120), senha: z.string().min(1).max(72), remember: z.boolean().optional() })

/** Login via BFF: o back devolve os tokens, o BFF os guarda em cookies httpOnly e NUNCA os repassa ao JavaScript do navegador. */
export async function POST(req: Request) {
  if (!originOk(req)) return NextResponse.json(errBody('FORBIDDEN', 'Origem não permitida.'), { status: 403 })
  const p = body.safeParse(await req.json().catch(() => null))
  if (!p.success) return NextResponse.json(errBody('VALIDATION', 'Informe e-mail e senha.'), { status: 422 })
  let r: Response
  try {
    r = await backFetch('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': req.headers.get('user-agent') || '', 'x-forwarded-for': req.headers.get('x-forwarded-for') || '' }, body: JSON.stringify({ email: p.data.email, senha: p.data.senha }) })
  } catch { return NextResponse.json(errBody('UPSTREAM', 'Não foi possível falar com o servidor. Tente novamente.'), { status: 502 }) }
  const data = await r.json().catch(() => null)
  if (!r.ok || !data?.session) return NextResponse.json(data ?? errBody('UPSTREAM', 'Falha ao entrar.'), { status: r.status || 502, headers: r.headers.get('retry-after') ? { 'retry-after': r.headers.get('retry-after')! } : undefined })
  const res = NextResponse.json({ user: data.user }, { headers: { 'cache-control': 'no-store' } })
  setSessionCookies(res, data.session, data.user.role as Role, !!p.data.remember)
  return res
}
