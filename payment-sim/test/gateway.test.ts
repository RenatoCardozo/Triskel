import { describe, it, expect, beforeEach, vi } from 'vitest'

import { openDb } from '../src/db'
import { buildApp } from '../src/app'
import { deliverDue, sign, backoffMs } from '../src/webhooks'
import { tick } from '../src/gateway'
import { crc16, brCode, luhn } from '../src/rules'

const SK = { authorization: 'Bearer sk_test_unit_key_123' }
const PK = { 'x-public-key': 'pk_test_unit_key_123' }
const AD = { 'x-admin-key': 'adm_test_unit_key_123' }
let db: ReturnType<typeof openDb>, app: Awaited<ReturnType<typeof buildApp>>
beforeEach(async () => { db = openDb(':memory:'); app = await buildApp(db) })

const tok = async (number: string, extra: Record<string, unknown> = {}) => {
  const r = await app.inject({ method: 'POST', url: '/v1/tokens', headers: PK, payload: { number, exp: '12/40', cvv: '123', holder: 'Fulana Teste', document: '529.982.247-25', type: 'credito', ...extra } })
  return { r, body: r.json() }
}
const charge = (payload: Record<string, unknown>) => app.inject({ method: 'POST', url: '/v1/charges', headers: SK, payload })

describe('autenticação', () => {
  it('recusa chamadas sem a chave certa', async () => {
    expect((await app.inject({ method: 'POST', url: '/v1/charges', payload: {} })).statusCode).toBe(401)
    expect((await app.inject({ method: 'POST', url: '/v1/tokens', headers: SK, payload: {} })).statusCode).toBe(401) // chave secreta não tokeniza
    expect((await app.inject({ method: 'GET', url: '/admin/overview', headers: SK })).statusCode).toBe(401)
    expect((await app.inject({ method: 'GET', url: '/admin/overview', headers: AD })).statusCode).toBe(200)
  })
})

describe('cartões de teste', () => {
  it('aprova 4111... e 5555...', async () => {
    for (const [n, brand] of [['4111111111111111', 'Visa'], ['5555555555554444', 'Mastercard']]) {
      const t = (await tok(n)).body
      expect(t.brand).toBe(brand)
      const c = await charge({ amountCents: 5000, method: 'card', externalRef: 'ref-' + n, cardToken: t.token })
      expect(c.statusCode).toBe(201)
      expect(c.json().status).toBe('paid')
    }
  })
  it.each([['4000000000000002', '05'], ['4000000000009995', '51'], ['4000000000000069', '54'], ['4000000000000127', 'N7']])('recusa %s com código %s', async (n, code) => {
    const t = (await tok(n)).body
    const c = (await charge({ amountCents: 5000, method: 'card', externalRef: 'ref-' + n, cardToken: t.token })).json()
    expect(c.status).toBe('failed')
    expect(c.failure.code).toBe(code)
  })
  it('token é de uso único e não guarda número nem CVV', async () => {
    const t = (await tok('4111111111111111')).body
    expect((await charge({ amountCents: 5000, method: 'card', externalRef: 'a1b', cardToken: t.token })).statusCode).toBe(201)
    expect((await charge({ amountCents: 5000, method: 'card', externalRef: 'a2b', cardToken: t.token })).statusCode).toBe(400)
    const dump = JSON.stringify(db.prepare('SELECT * FROM tokens').all()) + JSON.stringify(db.prepare('SELECT * FROM charges').all())
    expect(dump).not.toContain('4111111111111111')
    expect(dump).not.toContain('"123"')
  })
  it('valida número, validade, CVV, nome e documento', async () => {
    const { r, body } = await tok('4111111111111112', { exp: '01/20', cvv: '12', holder: 'A', document: '111' })
    expect(r.statusCode).toBe(422)
    expect(Object.keys(body.error.fields).sort()).toEqual(['cvv', 'doc', 'nome', 'num', 'val'])
  })
  it('3-D Secure: código errado reduz tentativas e a terceira bloqueia', async () => {
    const t = (await tok('4000000000003220')).body
    const c = (await charge({ amountCents: 5000, method: 'card', externalRef: 'tds-1', cardToken: t.token })).json()
    expect(c.status).toBe('requires_action')
    const w1 = (await app.inject({ method: 'POST', url: `/v1/charges/${c.id}/3ds`, headers: SK, payload: { code: '000000' } })).json()
    expect(w1.action.attemptsLeft).toBe(2)
    expect(w1.action.message).toContain('Restam 2')
    await app.inject({ method: 'POST', url: `/v1/charges/${c.id}/3ds`, headers: SK, payload: { code: '111111' } })
    const w3 = (await app.inject({ method: 'POST', url: `/v1/charges/${c.id}/3ds`, headers: SK, payload: { code: '222222' } })).json()
    expect(w3.status).toBe('failed')
    expect(w3.failure.code).toBe('57')
  })
  it('3-D Secure: código 123456 aprova', async () => {
    const t = (await tok('4000000000003220')).body
    const c = (await charge({ amountCents: 5000, method: 'card', externalRef: 'tds-2', cardToken: t.token })).json()
    expect((await app.inject({ method: 'POST', url: `/v1/charges/${c.id}/3ds`, headers: SK, payload: { code: '123456' } })).json().status).toBe('paid')
  })
  it('salva o cartão no cofre e reutiliza com cardRef + CVV', async () => {
    const t = (await tok('4111111111111111')).body
    const c = (await charge({ amountCents: 5000, method: 'card', externalRef: 'save-1', cardToken: t.token, saveCard: true })).json()
    expect(c.card.ref).toMatch(/^card_/)
    const t2 = (await app.inject({ method: 'POST', url: '/v1/tokens', headers: PK, payload: { cardRef: c.card.ref, cvv: '999' } })).json()
    expect(t2.last4).toBe('1111')
    const ok = await charge({ amountCents: 7000, method: 'card', externalRef: 'save-2', cardToken: t2.token, expectCardRef: c.card.ref })
    expect(ok.json().status).toBe('paid')
    const t3 = (await app.inject({ method: 'POST', url: '/v1/tokens', headers: PK, payload: { cardRef: c.card.ref, cvv: '999' } })).json()
    expect((await charge({ amountCents: 7000, method: 'card', externalRef: 'save-3', cardToken: t3.token, expectCardRef: 'card_outro' })).statusCode).toBe(400)
  })
})

describe('Pix', () => {
  it('gera copia e cola com CRC16 válido, QR e expiração; é idempotente por externalRef', async () => {
    const a = await charge({ amountCents: 25000, method: 'pix', externalRef: 'TRX-PIX1' })
    expect(a.statusCode).toBe(201)
    const c = a.json()
    expect(c.status).toBe('pending')
    expect(c.pix.payload).toContain('540625000'.slice(0, 4))
    expect(c.pix.payload.slice(-4)).toBe(crc16(c.pix.payload.slice(0, -4)))
    expect(c.pix.qrSvg).toContain('<svg')
    expect(new Date(c.pix.expiresAt).getTime()).toBeGreaterThan(Date.now())
    const b = await charge({ amountCents: 25000, method: 'pix', externalRef: 'TRX-PIX1' })
    expect(b.statusCode).toBe(200)
    expect(b.json().id).toBe(c.id)
    expect((await charge({ amountCents: 30000, method: 'pix', externalRef: 'TRX-PIX1' })).statusCode).toBe(409)
  })
  it('painel paga, recusa e expira; cada um gera um webhook; não finaliza duas vezes', async () => {
    const mk = async (ref: string) => (await charge({ amountCents: 2000, method: 'pix', externalRef: ref })).json()
    const [p, d, x] = [await mk('REF-1'), await mk('REF-2'), await mk('REF-3')]
    for (const [c, act] of [[p, 'pay'], [d, 'decline'], [x, 'expire']] as const) expect((await app.inject({ method: 'POST', url: `/admin/charges/${c.id}/${act}`, headers: AD })).statusCode).toBe(200)
    expect((await app.inject({ method: 'POST', url: `/admin/charges/${p.id}/pay`, headers: AD })).statusCode).toBe(409)
    const types = (db.prepare('SELECT type FROM events ORDER BY created_at').all() as any[]).map((e) => e.type).sort()
    expect(types).toEqual(['charge.expired', 'charge.failed', 'charge.paid'])
  })
  it('expira sozinho depois do prazo', async () => {
    const c = (await charge({ amountCents: 2000, method: 'pix', externalRef: 'EXP1' })).json()
    db.prepare('UPDATE charges SET expires_at = ? WHERE id = ?').run(Date.now() - 1, c.id)
    await tick(db)
    expect((await app.inject({ method: 'GET', url: `/v1/charges/${c.id}`, headers: SK })).json().status).toBe('expired')
  })
  it('BR Code usa o formato do Pix e o CRC bate', () => {
    const code = brCode(1234, 'ABC', 'chave@x')
    expect(code.startsWith('000201')).toBe(true)
    expect(code).toContain('BR.GOV.BCB.PIX')
    expect(code.slice(-4)).toBe(crc16(code.slice(0, -4)))
    expect(luhn('4111111111111111')).toBe(true)
  })
})

describe('saque (payout)', () => {
  it('cria em processamento, é idempotente e conclui/falha pelo painel', async () => {
    const mk = (ref: string) => app.inject({ method: 'POST', url: '/v1/payouts', headers: SK, payload: { amountCents: 5000, pixKey: '52998224725', externalRef: ref } })
    const a = (await mk('TRX-W1')).json()
    expect(a.status).toBe('processing')
    expect((await mk('TRX-W1')).json().id).toBe(a.id)
    expect(JSON.stringify(db.prepare('SELECT * FROM payouts').all())).not.toContain('52998224725') // chave só mascarada
    expect((await app.inject({ method: 'POST', url: `/admin/payouts/${a.id}/fail`, headers: AD })).json().status).toBe('failed')
    const b = (await mk('TRX-W2')).json()
    expect((await app.inject({ method: 'POST', url: `/admin/payouts/${b.id}/complete`, headers: AD })).json().status).toBe('completed')
  })
})

describe('webhooks', () => {
  it('assina com HMAC(timestamp.corpo) e marca como entregue', async () => {
    const c = (await charge({ amountCents: 2000, method: 'pix', externalRef: 'WH1' })).json()
    await app.inject({ method: 'POST', url: `/admin/charges/${c.id}/pay`, headers: AD })
    const post = vi.fn(async (_u: any, init: any) => {
      const ts = init.headers['x-triskel-timestamp']
      expect(init.headers['x-triskel-signature']).toBe(sign('unit-webhook-secret-0123456789', ts, init.body))
      expect(JSON.parse(init.body).id).toBe(init.headers['x-triskel-event-id'])
      return new Response('{}', { status: 200 })
    })
    await deliverDue(db, post as any)
    expect(post).toHaveBeenCalledTimes(1)
    expect((db.prepare('SELECT status FROM events').get() as any).status).toBe('delivered')
  })
  it('retenta com backoff exponencial e desiste na 6ª tentativa', async () => {
    const c = (await charge({ amountCents: 2000, method: 'pix', externalRef: 'WH2' })).json()
    await app.inject({ method: 'POST', url: `/admin/charges/${c.id}/pay`, headers: AD })
    const post = vi.fn(async () => new Response('erro', { status: 500 }))
    expect([1, 2, 3, 4, 5].map((n) => backoffMs(n))).toEqual([1000, 2000, 4000, 8000, 16000])
    for (let i = 1; i <= 6; i++) {
      db.prepare('UPDATE events SET next_attempt_at = 0 WHERE status = ?').run('pending')
      await deliverDue(db, post as any)
    }
    const ev = db.prepare('SELECT status, attempts FROM events').get() as any
    expect(ev).toMatchObject({ status: 'failed', attempts: 6 })
    expect(post).toHaveBeenCalledTimes(6)
  })
})
