import { NextResponse } from 'next/server'
import { backFetch, errBody, originOk, setSessionCookies, type Role } from '@/lib/server'

export async function POST(req: Request) {
  if (!originOk(req)) return NextResponse.json(errBody('FORBIDDEN', 'Origem não permitida.'), { status: 403 })
  const payload = await req.json().catch(() => null)
  if (!payload || typeof payload !== 'object') return NextResponse.json(errBody('VALIDATION', 'Dados inválidos.'), { status: 422 })
  const { remember: _r, ...fields } = payload as Record<string, unknown>
  let r: Response
  try {
    r = await backFetch('/api/v1/auth/register', { method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': req.headers.get('user-agent') || '', 'x-forwarded-for': req.headers.get('x-forwarded-for') || '' }, body: JSON.stringify(fields) })
  } catch { return NextResponse.json(errBody('UPSTREAM', 'Não foi possível falar com o servidor. Tente novamente.'), { status: 502 }) }
  const data = await r.json().catch(() => null)
  if (!r.ok || !data?.session) return NextResponse.json(data ?? errBody('UPSTREAM', 'Falha ao cadastrar.'), { status: r.status || 502 })
  const res = NextResponse.json({ user: data.user }, { status: 201, headers: { 'cache-control': 'no-store' } })
  setSessionCookies(res, data.session, data.user.role as Role, true)
  return res
}
