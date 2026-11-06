import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { backFetch, clearSessionCookies, originOk, RT, errBody } from '@/lib/server'

/** Revoga o refresh token no back e apaga os cookies, mesmo que o back esteja fora do ar. */
export async function POST(req: Request) {
  if (!originOk(req)) return NextResponse.json(errBody('FORBIDDEN', 'Origem não permitida.'), { status: 403 })
  const rt = (await cookies()).get(RT)?.value
  if (rt) await backFetch('/api/v1/auth/logout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }), timeoutMs: 5000 }).catch(() => null)
  const res = new NextResponse(null, { status: 204 })
  clearSessionCookies(res)
  return res
}
