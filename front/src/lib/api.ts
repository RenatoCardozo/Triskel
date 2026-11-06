/** Cliente HTTP do navegador. Fala só com o BFF do próprio front (cookies httpOnly); nunca manipula tokens. */
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message) }
}

type Opts = { method?: string; body?: unknown; form?: FormData; idempotencyKey?: string; signal?: AbortSignal }

async function once(path: string, o: Opts): Promise<Response> {
  const headers: Record<string, string> = { accept: 'application/json' }
  let body: BodyInit | undefined
  if (o.form) body = o.form
  else if (o.body !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(o.body) }
  if (o.idempotencyKey) headers['idempotency-key'] = o.idempotencyKey
  try {
    return await fetch('/api/bff/' + path.replace(/^\//, ''), { method: o.method || 'GET', headers, body, credentials: 'same-origin', signal: o.signal })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new ApiError(0, 'NETWORK', 'Sem conexão com o servidor. Verifique a internet e tente de novo.')
  }
}

export async function api<T = unknown>(path: string, o: Opts = {}): Promise<T> {
  let r = await once(path, o)
  // sessão renovada no meio de um envio em stream: repete uma vez
  if (r.status === 401 && r.headers.get('x-session-renewed')) r = await once(path, o)
  if (r.status === 204) return undefined as T
  const data = await r.json().catch(() => null)
  if (!r.ok) {
    const e = data?.error
    if (r.status === 401 && typeof window !== 'undefined') {
      if (!/^\/(login|cadastro)?$/.test(window.location.pathname)) window.location.assign('/login?expirou=1')
    }
    throw new ApiError(r.status, e?.code || 'ERROR', e?.message || (r.status === 429 ? 'Muitas tentativas. Aguarde um instante.' : 'Algo deu errado. Tente novamente.'), e?.details)
  }
  return data as T
}

export const post = <T = unknown>(path: string, body?: unknown, o: Opts = {}) => api<T>(path, { ...o, method: 'POST', body: body ?? {} })
export const patch = <T = unknown>(path: string, body: unknown) => api<T>(path, { method: 'PATCH', body })
export const del = <T = unknown>(path: string) => api<T>(path, { method: 'DELETE' })

/** Chama as rotas de sessão do BFF (login, cadastro, sair). */
export async function authCall<T = unknown>(path: 'login' | 'register' | 'logout', body?: unknown): Promise<T> {
  let r: Response
  try { r = await fetch('/api/auth/' + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}), credentials: 'same-origin' }) }
  catch { throw new ApiError(0, 'NETWORK', 'Sem conexão com o servidor. Verifique a internet e tente de novo.') }
  if (r.status === 204) return undefined as T
  const data = await r.json().catch(() => null)
  if (!r.ok) throw new ApiError(r.status, data?.error?.code || 'ERROR', data?.error?.message || 'Algo deu errado. Tente novamente.', data?.error?.details)
  return data as T
}

export const newIdemKey = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random())
export const fileUrl = (u: string | null | undefined) => (u ? '/api/bff' + u : null)
