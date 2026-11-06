import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'node:fs'

export const WEB = process.env.WEB_URL || 'http://localhost:3000'
export const EMAIL = process.env.EMAILSIM_URL || 'http://localhost:4200'
export const PAY = process.env.PAYSIM_URL || 'http://localhost:4100'
export const ADMIN_KEY = process.env.PAYSIM_ADMIN_KEY
export const OUT = process.env.E2E_OUT || '/tmp/triskel-e2e'
mkdirSync(OUT, { recursive: true })

export const steps = []
export async function step(name, fn) {
  const t = Date.now()
  try { const r = await fn(); steps.push({ name, ok: true, ms: Date.now() - t }); console.log(`  ok   ${name} (${Date.now() - t}ms)`); return r }
  catch (e) { steps.push({ name, ok: false, err: String(e.message).split('\n')[0] }); console.log(`  FAIL ${name}: ${String(e.message).split('\n').slice(0, 6).join('\n       ')}`); throw e }
}
export const expect = (c, msg) => { if (!c) throw new Error('asserção falhou: ' + msg) }

// CPF/CNPJ válidos (dígitos verificadores) para dados de teste
const dv = (nums, w) => { const s = nums.reduce((a, n, i) => a + n * w[i], 0) % 11; return s < 2 ? 0 : 11 - s }
export function cpf(seed) {
  const n = String(seed).padStart(9, '0').slice(-9).split('').map(Number)
  const d1 = dv(n, [10, 9, 8, 7, 6, 5, 4, 3, 2]); const d2 = dv([...n, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return [...n, d1, d2].join('')
}
export function cnpj(seed) {
  const n = (String(seed).padStart(8, '0').slice(-8) + '0001').split('').map(Number)
  const d1 = dv(n, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]); const d2 = dv([...n, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return [...n, d1, d2].join('')
}

export async function launch() { return chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] }) }

export async function shot(page, name) { await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }) }

/** Espera o código de 6 dígitos do e-mail no email-sim. */
export async function mailCode(to, since) {
  for (let i = 0; i < 40; i++) {
    const r = await fetch(`${EMAIL}/api/messages/latest?to=${encodeURIComponent(to)}&since=${since}`)
    if (r.ok) { const m = await r.json(); const c = (m.code || /\b(\d{6})\b/.exec(m.text || '')?.[1]); if (c) return c }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('e-mail com código não chegou para ' + to)
}

export async function adminPay(chargeId) {
  const r = await fetch(`${PAY}/admin/charges/${chargeId}/pay`, { method: 'POST', headers: { 'x-admin-key': ADMIN_KEY } })
  if (!r.ok) throw new Error('admin pay ' + r.status + ' ' + (await r.text()))
}

/** Chama o back pelo BFF com os cookies do contexto (exercita o proxy, a renovação e a checagem de Origin). */
export function bff(ctx) {
  const call = async (method, path, body) => {
    const r = await ctx.request.fetch(`${WEB}/api/bff/${path}`, { method, headers: { origin: WEB, 'content-type': 'application/json' }, data: body === undefined ? undefined : JSON.stringify(body) })
    const text = await r.text(); let j; try { j = JSON.parse(text) } catch { j = text }
    if (!r.ok()) throw new Error(`${method} ${path} -> ${r.status()} ${typeof j === 'string' ? j.slice(0, 200) : JSON.stringify(j).slice(0, 300)}`)
    return j
  }
  return { get: (p) => call('GET', p), post: (p, b) => call('POST', p, b ?? {}), patch: (p, b) => call('PATCH', p, b), put: (p, b) => call('PUT', p, b) }
}
