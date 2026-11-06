import { ApiError } from './api'

/** Tokenização do cartão direto no gateway (chave pública). O número e o CVV nunca passam pelo back nem pelo BFF. */
export interface TokenResult { token: string; brand: string; last4: string; exp: string; type: string }
export async function tokenize(input: { number?: string; exp?: string; cvv: string; holder?: string; document?: string; type?: 'credito' | 'debito'; cardRef?: string }): Promise<TokenResult> {
  const url = process.env.NEXT_PUBLIC_PAYSIM_URL, pk = process.env.NEXT_PUBLIC_PAYSIM_PK
  if (!url || !pk) throw new ApiError(0, 'CONFIG', 'Pagamento por cartão não está configurado neste ambiente.')
  let r: Response
  try { r = await fetch(url.replace(/\/$/, '') + '/v1/tokens', { method: 'POST', headers: { 'content-type': 'application/json', 'x-public-key': pk }, body: JSON.stringify(input), cache: 'no-store' }) }
  catch { throw new ApiError(0, 'NETWORK', 'Não foi possível falar com o gateway de pagamento. Tente de novo.') }
  const j = await r.json().catch(() => null)
  if (!r.ok) throw new ApiError(r.status, j?.error?.code || 'TOKEN', j?.error?.message || 'Não foi possível validar o cartão.', j?.error?.fields)
  return j as TokenResult
}
