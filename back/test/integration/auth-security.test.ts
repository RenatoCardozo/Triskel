import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '../../src/db'
import { hashCode, hashToken } from '../../src/lib/crypto'
import { addDays, api, campaignBody, closeApp, getApp, mkUser, PASSWORD, signedContract, webhook, U } from './helpers'

afterAll(closeApp)
beforeAll(getApp)

const reg = (over: Record<string, unknown> = {}) => ({ role: 'CREATOR', nome: 'Teste Silva', doc: '529.982.247-25', data: '1995-05-05', cidade: 'Pelotas', uf: 'RS', email: `novo${Math.random().toString(36).slice(2)}@teste.local`, tel: '(53) 99912-3456', senha: PASSWORD, aceite: true, ...over })

describe('cadastro e verificação de e-mail', () => {
  it('cria conta, guarda só o hash bcrypt (custo >= 12) e exige validar o e-mail com código', async () => {
    const body = reg({ email: 'cadastro1@teste.local' })
    const r = await api(null, 'POST', '/auth/register', body, { 'x-forwarded-for': '10.2.0.1' })
    expect(r.status).toBe(201)
    const u = await prisma.user.findUniqueOrThrow({ where: { email: 'cadastro1@teste.local' } })
    expect(u.passwordHash).toMatch(/^\$2[aby]\$(1[2-9]|[2-3]\d)\$/)
    expect(u.passwordHash).not.toContain(PASSWORD)
    expect(u.emailVerifiedAt).toBeNull()
    // o código nunca é guardado em claro: troco o hash por um código conhecido para validar
    const tok = r.body.session.accessToken
    const U1 = { id: u.id, token: tok, ip: '10.2.0.1' } as U
    expect((await api(U1, 'POST', '/auth/verify-email', { code: '000000' })).status).toBe(422)
    await prisma.emailCode.updateMany({ where: { userId: u.id }, data: { codeHash: hashCode(u.id, '123456') } })
    expect((await api(U1, 'POST', '/auth/verify-email', { code: '123456' })).status).toBe(200)
    expect((await prisma.user.findUniqueOrThrow({ where: { id: u.id } })).emailVerifiedAt).not.toBeNull()
    // código já usado não vale de novo
    expect((await api(U1, 'POST', '/auth/verify-email', { code: '123456' })).status).toBe(422)
  })
  it('valida CPF, CNPJ, senha fraca, menor de idade e e-mail repetido', async () => {
    expect((await api(null, 'POST', '/auth/register', reg({ doc: '111.111.111-11' }))).status).toBe(422)
    expect((await api(null, 'POST', '/auth/register', reg({ role: 'BUSINESS', doc: '11.222.333/0001-82', resp: 'Fulana' }))).status).toBe(422)
    expect((await api(null, 'POST', '/auth/register', reg({ senha: '12345678' }))).status).toBe(422)
    expect((await api(null, 'POST', '/auth/register', reg({ data: addDays(-365 * 10) }))).body.error.code).toBe('UNDERAGE')
    expect((await api(null, 'POST', '/auth/register', reg({ aceite: false }))).status).toBe(422)
    expect((await api(null, 'POST', '/auth/register', reg({ email: 'cadastro1@teste.local' }))).body.error.code).toBe('EMAIL_IN_USE')
  })
})

describe('login, sessão e refresh com rotação', () => {
  it('não diferencia usuário inexistente de senha errada', async () => {
    const u = await mkUser('CREATOR')
    const a = await api(null, 'POST', '/auth/login', { email: u.email, senha: 'Errada@123' }, { 'x-forwarded-for': '10.3.0.1' })
    const b = await api(null, 'POST', '/auth/login', { email: 'ninguem@teste.local', senha: 'Errada@123' }, { 'x-forwarded-for': '10.3.0.2' })
    expect(a.status).toBe(401); expect(b.status).toBe(401)
    expect(a.body.error.message).toBe(b.body.error.message)
  })
  it('refresh token rotaciona; reuso do antigo revoga a família inteira', async () => {
    const u = await mkUser('CREATOR')
    const l = await api(null, 'POST', '/auth/login', { email: u.email, senha: PASSWORD })
    const r1 = l.body.session.refreshToken
    const n = await api(null, 'POST', '/auth/refresh', { refreshToken: r1 })
    expect(n.status).toBe(200)
    const r2 = n.body.session.refreshToken
    expect(r2).not.toBe(r1)
    expect((await api(null, 'POST', '/auth/refresh', { refreshToken: r1 })).status).toBe(401) // reuso detectado
    expect((await api(null, 'POST', '/auth/refresh', { refreshToken: r2 })).status).toBe(401) // família revogada
    const first = await prisma.refreshToken.findUniqueOrThrow({ where: { tokenHash: hashToken(r1) } })
    const rows = await prisma.refreshToken.findMany({ where: { familyId: first.familyId } })
    expect(rows.length).toBe(2)
    expect(rows.every((x) => x.revokedAt)).toBe(true)
    expect(rows.every((x) => x.tokenHash.length === 64 && x.tokenHash !== r1 && x.tokenHash !== r2)).toBe(true) // só hash no banco
  })
  it('logout revoga o refresh', async () => {
    const u = await mkUser('CREATOR')
    const l = await api(null, 'POST', '/auth/login', { email: u.email, senha: PASSWORD })
    expect((await api(null, 'POST', '/auth/logout', { refreshToken: l.body.session.refreshToken })).status).toBe(204)
    expect((await api(null, 'POST', '/auth/refresh', { refreshToken: l.body.session.refreshToken })).status).toBe(401)
  })
  it('bloqueia a conta temporariamente após várias senhas erradas', async () => {
    const u = await mkUser('BUSINESS')
    let last = 0
    for (let i = 0; i < 6; i++) last = (await api(null, 'POST', '/auth/login', { email: u.email, senha: 'Errada@123' }, { 'x-forwarded-for': `10.4.0.${i}` })).status
    expect([401, 423, 429]).toContain(last)
    const ok = await api(null, 'POST', '/auth/login', { email: u.email, senha: PASSWORD }, { 'x-forwarded-for': '10.4.1.1' })
    expect(ok.status).not.toBe(200) // conta travada: nem a senha certa entra até o prazo
  })
  it('rate limit nas rotas de autenticação (429)', async () => {
    const codes: number[] = []
    for (let i = 0; i < 14; i++) codes.push((await api(null, 'POST', '/auth/login', { email: 'x@teste.local', senha: 'Errada@123' })).status)
    expect(codes).toContain(429)
  })
})

describe('autorização (papéis e dono do recurso)', () => {
  it('rotas protegidas exigem token válido; token adulterado é recusado', async () => {
    const u = await mkUser('CREATOR')
    expect((await api(null, 'GET', '/dashboard')).status).toBe(401)
    expect((await api({ ...u, token: u.token.slice(0, -3) + 'abc' }, 'GET', '/dashboard')).status).toBe(401)
    expect((await api({ ...u, token: 'a.b.c' }, 'GET', '/dashboard')).status).toBe(401)
  })
  it('criador não cria campanha; empresa não usa rotas do criador (RBAC)', async () => {
    const cr = await mkUser('CREATOR'), k = await mkUser('BUSINESS')
    expect((await api(cr, 'POST', '/campaigns', campaignBody())).status).toBe(403)
    expect((await api(k, 'GET', '/opportunities')).status).toBe(403)
    expect((await api(k, 'POST', '/wallet/withdrawals', { amountCents: 1000, key: 'cpf' })).status).toBe(403)
    expect((await api(cr, 'POST', '/wallet/recharges', { amountCents: 5000, method: 'pix' })).status).toBe(403)
  })
  it('IDOR: terceiros recebem 404 em propostas, contratos, campanhas e entregas de outros', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR'), x = await mkUser('CREATOR'), k2 = await mkUser('BUSINESS')
    const { proposalId, campaignId, contractId } = await signedContract(k, c)
    for (const who of [x, k2]) {
      expect((await api(who, 'GET', `/proposals/${proposalId}`)).status).toBe(404)
      expect((await api(who, 'POST', `/proposals/${proposalId}/messages`, { text: 'oi tudo bem' })).status).toBe(404)
      expect((await api(who, 'GET', `/contracts/${contractId}`)).status).toBe(404)
      expect((await api(who, 'GET', `/contracts/${contractId}/pdf`)).status).toBe(404)
    }
    expect((await api(k2, 'GET', `/campaigns/${campaignId}`)).status).toBe(404)
    expect((await api(k2, 'PUT', `/campaigns/${campaignId}`, campaignBody())).status).toBe(404)
    expect((await api(k2, 'DELETE', `/campaigns/${campaignId}`)).status).toBe(404)
    const d = await prisma.delivery.findFirstOrThrow({ where: { contractId } })
    expect((await api(x, 'GET', `/deliveries/${d.id}`)).status).toBe(404)
    expect((await api(x, 'POST', `/contracts/${contractId}/sign`, { accept: true })).status).toBe(404)
    // o próprio criador não vê o que o contratante pagou a mais (taxa)
    const mine = await api(c, 'GET', `/contracts/${contractId}`)
    expect(mine.body.contract.feeCents).toBeUndefined()
    expect(mine.body.contract.totalCents).toBeUndefined()
  })
  it('perfil público de criador não expõe contato nem CPF', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const r = await api(k, 'GET', `/creators/${c.id}`)
    expect(r.status).toBe(200)
    const txt = JSON.stringify(r.body)
    expect(txt).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
    expect(txt).not.toContain(c.email)
    expect(txt).not.toContain('99912-3456')
  })
})

describe('webhooks assinados', () => {
  it('rejeita assinatura inválida, corpo adulterado e timestamp velho', async () => {
    const ev = { id: 'evt_sec_1', type: 'charge.paid', data: { externalRef: 'TRX-NAOEXISTE', amountCents: 1000 } }
    expect((await webhook('/webhooks/payments', ev, { secret: 'segredo-errado-0123456789' })).status).toBe(401)
    expect((await webhook('/webhooks/payments', ev, { tamper: true })).status).toBe(401)
    expect((await webhook('/webhooks/payments', ev, { ts: Math.floor(Date.now() / 1000) - 3600 })).status).toBe(401)
    const a = await getApp()
    expect((await a.inject({ method: 'POST', url: '/webhooks/payments', payload: ev })).statusCode).toBe(401)
  })
  it('aceita assinatura válida uma única vez por evento (idempotência)', async () => {
    const ev = { id: 'evt_sec_2', type: 'charge.paid', data: { externalRef: 'TRX-NAOEXISTE', amountCents: 1000 } }
    const a = await webhook('/webhooks/payments', ev)
    const b = await webhook('/webhooks/payments', ev)
    expect(a.status).toBe(200); expect(a.body.duplicate).toBeUndefined()
    expect(b.status).toBe(200); expect(b.body.duplicate).toBe(true)
  })
})
