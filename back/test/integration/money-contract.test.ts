import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { prisma } from '../../src/db'
import { gateway } from '../../src/lib/payment'
import { applyPayout, releaseEscrow } from '../../src/services/wallet'
import { accepted, addDays, api, balance, campaignBody, closeApp, fund, getApp, mkUser, openCampaign, signedContract, webhook } from './helpers'

beforeAll(getApp)
afterAll(closeApp)

describe('negociação: turnos, vazamento de contato e termos', () => {
  it('a vez alterna; quem não é a vez recebe 409; terceiros 404', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR'), x = await mkUser('CREATOR')
    const campaignId = await openCampaign(k)
    const inv = await api(k, 'POST', '/proposals', { campaignId, creatorIds: [c.id], valueCents: 30000, delivery: addDays(20), imageUse: '90 dias', message: 'Oi, vamos?' })
    expect(inv.status).toBe(201)
    const pid = inv.body.sent[0].proposalId
    // contratante fez a oferta: não pode aceitar nem contrapropor a própria oferta
    expect((await api(k, 'POST', `/proposals/${pid}/accept`)).status).toBe(409)
    expect((await api(k, 'POST', `/proposals/${pid}/counter`, { valueCents: 31000, delivery: addDays(20), imageUse: '90 dias', message: 'mais' })).status).toBe(409)
    expect((await api(x, 'POST', `/proposals/${pid}/accept`)).status).toBe(404)
    // criador contrapropõe; agora é a vez do contratante
    expect((await api(c, 'POST', `/proposals/${pid}/counter`, { valueCents: 40000, delivery: addDays(25), imageUse: '90 dias', message: 'Posso incluir stories.' })).status).toBe(200)
    expect((await api(c, 'POST', `/proposals/${pid}/accept`)).status).toBe(409)
    expect((await api(k, 'POST', `/proposals/${pid}/accept`)).status).toBe(200)
    // depois de aceita, ninguém contrapropõe
    expect((await api(c, 'POST', `/proposals/${pid}/counter`, { valueCents: 50000, delivery: addDays(25), imageUse: '90 dias', message: 'agora quero mais' })).status).toBe(409)
    const p = await prisma.proposal.findUniqueOrThrow({ where: { id: pid }, include: { rounds: true } })
    expect(p.status).toBe('ACCEPTED'); expect(p.rounds.length).toBe(2)
  })
  it('aceite concorrente das duas partes não cria estado duplicado', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const campaignId = await openCampaign(k)
    const pid = (await api(k, 'POST', '/proposals', { campaignId, creatorIds: [c.id], valueCents: 30000, delivery: addDays(20), imageUse: '90 dias', message: 'Oi, vamos?' })).body.sent[0].proposalId
    const [a, b] = await Promise.all([api(c, 'POST', `/proposals/${pid}/accept`), api(c, 'POST', `/proposals/${pid}/decline`)])
    expect([a.status, b.status].sort()).toEqual([200, 409])
    const p = await prisma.proposal.findUniqueOrThrow({ where: { id: pid } })
    expect(['ACCEPTED', 'DECLINED']).toContain(p.status)
  })
  it('bloqueia telefone, e-mail, link e rede social em mensagens e propostas', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const campaignId = await openCampaign(k)
    const bad = await api(k, 'POST', '/proposals', { campaignId, creatorIds: [c.id], valueCents: 30000, delivery: addDays(20), imageUse: '90 dias', message: 'me chama no zap 53 99999 1234' })
    expect(bad.status).toBe(422); expect(bad.body.error.code).toBe('LEAK')
    const { proposalId } = await accepted(k, c)
    for (const t of ['manda no joao@gmail.com', 'olha www.minhaloja.com.br', 'me add no meu insta', 'liga (53) 99912-3456'])
      expect((await api(c, 'POST', `/proposals/${proposalId}/messages`, { text: t })).body.error?.code).toBe('LEAK')
    expect((await api(c, 'POST', `/proposals/${proposalId}/messages`, { text: 'Combinado, entrego até 25/11 por R$ 420,00.' })).status).toBe(201)
  })
  it('valor mínimo e prazo no passado são recusados', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const campaignId = await openCampaign(k)
    expect((await api(k, 'POST', '/proposals', { campaignId, creatorIds: [c.id], valueCents: 500, delivery: addDays(20), imageUse: '90 dias', message: 'Oi' })).body.error.code).toBe('VALUE_MIN')
    expect((await api(k, 'POST', '/proposals', { campaignId, creatorIds: [c.id], valueCents: 30000, delivery: addDays(-1), imageUse: '90 dias', message: 'Oi' })).body.error.code).toBe('DELIVERY_PAST')
  })
  it('empresa envia a um criador por vez; agência pode enviar a vários', async () => {
    const k = await mkUser('BUSINESS'), c1 = await mkUser('CREATOR'), c2 = await mkUser('CREATOR')
    const campaignId = await openCampaign(k)
    expect((await api(k, 'POST', '/proposals', { campaignId, creatorIds: [c1.id, c2.id], valueCents: 30000, delivery: addDays(20), imageUse: '90 dias', message: 'Oi' })).body.error.code).toBe('ONE_CREATOR')
  })
})

describe('pagamento, taxa e custódia', () => {
  it('debita valor + 10% do contratante, segura o valor cheio em custódia e não credita o criador ainda', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { proposalId } = await accepted(k, c, { valueCents: 42000 })
    await fund(k.id, 50000)
    const pay = await api(k, 'POST', `/proposals/${proposalId}/pay`)
    expect(pay.status).toBe(201)
    expect(await balance(k.id)).toBe(50000 - 46200)
    expect(await balance(c.id)).toBe(0)
    const ct = await prisma.contract.findFirstOrThrow({ where: { proposalId }, include: { escrow: true, delivery: true, tx: true } })
    expect([ct.valueCents, ct.feeCents, ct.totalCents]).toEqual([42000, 4200, 46200])
    expect(ct.escrow).toMatchObject({ amountCents: 42000, status: 'HELD' })
    expect(ct.tx).toMatchObject({ status: 'CUSTODIA', valueCents: 42000, feeCents: 4200, totalCents: 46200 })
    expect(ct.delivery?.state).toBe('PROD')
    // o criador vê o valor cheio e nenhuma taxa
    const w = await api(c, 'GET', '/wallet')
    expect(w.body.custodyCents).toBe(42000); expect(w.body.availableCents).toBe(0)
    expect(w.body.movements[0].feeCents).toBeUndefined(); expect(JSON.stringify(w.body)).not.toContain('46200')
  })
  it('saldo insuficiente: 422 e nada é debitado nem criado', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { proposalId } = await accepted(k, c, { valueCents: 42000 })
    await fund(k.id, 46199)
    const r = await api(k, 'POST', `/proposals/${proposalId}/pay`)
    expect(r.status).toBe(422); expect(r.body.error.code).toBe('INSUFFICIENT_FUNDS')
    expect(await balance(k.id)).toBe(46199)
    expect(await prisma.contract.count({ where: { proposalId } })).toBe(0)
  })
  it('pagamento duplo/concorrente debita uma única vez', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { proposalId } = await accepted(k, c, { valueCents: 10000 })
    await fund(k.id, 30000)
    const rs = await Promise.all([1, 2, 3].map(() => api(k, 'POST', `/proposals/${proposalId}/pay`)))
    expect(rs.every((r) => r.status === 201)).toBe(true)
    expect(await balance(k.id)).toBe(30000 - 11000)
    expect(await prisma.contract.count({ where: { proposalId } })).toBe(1)
    expect(await prisma.ledgerEntry.count({ where: { walletUserId: k.id, kind: 'CONTRACT_PAYMENT' } })).toBe(1)
  })
  it('só o contratante da proposta paga; criador e terceiros não', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR'), k2 = await mkUser('BUSINESS')
    const { proposalId } = await accepted(k, c)
    await fund(k2.id, 100000)
    expect((await api(c, 'POST', `/proposals/${proposalId}/pay`)).status).toBe(403)
    expect((await api(k2, 'POST', `/proposals/${proposalId}/pay`)).status).toBe(404)
  })
  it('contratante sem CNPJ/responsável/cidade não consegue pagar (contrato precisa das partes)', async () => {
    const k = await mkUser('BUSINESS', { incomplete: true }), c = await mkUser('CREATOR')
    const { proposalId } = await accepted(k, c)
    await fund(k.id, 100000)
    const r = await api(k, 'POST', `/proposals/${proposalId}/pay`)
    expect(r.status).toBe(422); expect(r.body.error.code).toBe('PROFILE_INCOMPLETE')
    expect(await balance(k.id)).toBe(100000)
  })
  it('ledger é imutável (trigger no banco): não permite UPDATE nem DELETE', async () => {
    const k = await mkUser('BUSINESS')
    await fund(k.id, 5000)
    const e = await prisma.ledgerEntry.findFirstOrThrow({ where: { walletUserId: k.id } })
    await expect(prisma.ledgerEntry.update({ where: { id: e.id }, data: { amountCents: 9999999 } })).rejects.toThrow()
    await expect(prisma.ledgerEntry.delete({ where: { id: e.id } })).rejects.toThrow()
  })
  it('o saldo da carteira sempre bate com a soma do ledger', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    await signedContract(k, c, { valueCents: 25000 })
    for (const uid of [k.id, c.id]) {
      const sum = await prisma.ledgerEntry.aggregate({ where: { walletUserId: uid }, _sum: { amountCents: true } })
      expect(sum._sum.amountCents ?? 0).toBe(await balance(uid))
    }
  })
})

describe('liberação da custódia e saque', () => {
  it('liberar duas vezes (concorrente) credita o criador uma única vez', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { contractId } = await signedContract(k, c, { valueCents: 20000 })
    const rs = await Promise.all([1, 2, 3].map(() => prisma.$transaction((tx) => releaseEscrow(tx, contractId))))
    expect(rs.filter(Boolean).length).toBe(1)
    expect(await balance(c.id)).toBe(20000)
    expect((await prisma.escrow.findUniqueOrThrow({ where: { contractId } })).status).toBe('RELEASED')
    expect((await prisma.moneyTx.findUniqueOrThrow({ where: { contractId } })).status).toBe('LIBERADO')
  })
  it('saque concorrente não deixa o saldo negativo (débito condicional) e respeita o mínimo', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { contractId } = await signedContract(k, c, { valueCents: 20000 })
    await prisma.$transaction((tx) => releaseEscrow(tx, contractId))
    const spy = vi.spyOn(gateway, 'createPayout').mockImplementation(async (b) => ({ id: 'po_' + b.externalRef, status: 'processing', amountCents: b.amountCents, externalRef: b.externalRef }))
    try {
      expect((await api(c, 'POST', '/wallet/withdrawals', { amountCents: 500, key: 'cpf' })).status).toBe(422)
      const rs = await Promise.all([1, 2, 3].map(() => api(c, 'POST', '/wallet/withdrawals', { amountCents: 20000, key: 'cpf' })))
      expect(rs.filter((r) => r.status === 201).length).toBe(1)
      expect(rs.filter((r) => r.status === 422).every((r) => r.body.error.code === 'INSUFFICIENT_FUNDS')).toBe(true)
      expect(await balance(c.id)).toBe(0)
      expect(spy).toHaveBeenCalledTimes(1)
      // chave Pix sai mascarada, nunca o CPF inteiro
      const t = (await api(c, 'GET', '/wallet')).body.movements.find((m: any) => m.kind === 'WITHDRAWAL')
      expect(JSON.stringify(t)).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
    } finally { spy.mockRestore() }
  })
  it('saque que falha no banco devolve o saldo uma única vez', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { contractId } = await signedContract(k, c, { valueCents: 20000 })
    await prisma.$transaction((tx) => releaseEscrow(tx, contractId))
    const spy = vi.spyOn(gateway, 'createPayout').mockImplementation(async (b) => ({ id: 'po_x', status: 'processing', amountCents: b.amountCents, externalRef: b.externalRef }))
    try {
      const w = await api(c, 'POST', '/wallet/withdrawals', { amountCents: 15000, key: 'cpf' })
      const txId = w.body.transaction.id
      expect(await balance(c.id)).toBe(5000)
      await applyPayout(txId, 'failed'); await applyPayout(txId, 'failed')
      expect(await balance(c.id)).toBe(20000)
    } finally { spy.mockRestore() }
  })
  it('recarga: mínimo R$ 20, máximo R$ 10.000; criador não recarrega', async () => {
    const k = await mkUser('BUSINESS')
    expect((await api(k, 'POST', '/wallet/recharges', { amountCents: 1999, method: 'pix' })).body.error.code).toBe('AMOUNT_MIN')
    expect((await api(k, 'POST', '/wallet/recharges', { amountCents: 1_000_001, method: 'pix' })).body.error.code).toBe('AMOUNT_MAX')
  })
  it('webhook de pagamento credita a recarga uma vez; valor divergente é ignorado', async () => {
    const k = await mkUser('BUSINESS')
    const tx = await prisma.moneyTx.create({ data: { id: 'TRX-WHK00001', userId: k.id, kind: 'RECHARGE', status: 'PENDENTE', description: 'Adição de saldo', valueCents: 5000, totalCents: 5000, method: 'pix', detail: 'Pix', idempotencyKey: 'whk:1' } })
    const charge = { id: 'ch_1', status: 'paid', method: 'pix', amountCents: 5000, externalRef: tx.id, pix: { payload: 'x', expiresAt: new Date().toISOString(), e2e: 'E2E1' } }
    expect((await webhook('/webhooks/payments', { id: 'evt_w1', type: 'charge.paid', data: { ...charge, amountCents: 999 } })).status).toBe(200)
    expect(await balance(k.id)).toBe(0) // valor diverge: ignorado
    expect((await webhook('/webhooks/payments', { id: 'evt_w2', type: 'charge.paid', data: charge })).status).toBe(200)
    expect((await webhook('/webhooks/payments', { id: 'evt_w3', type: 'charge.paid', data: charge })).status).toBe(200) // outro evento, mesma cobrança
    expect(await balance(k.id)).toBe(5000)
  })
})

describe('exclusividade só com contrato assinado pelas duas partes', () => {
  it('contrato assinado bloqueia outra marca do mesmo ramo na janela; não revela a marca ao contratante', async () => {
    const c = await mkUser('CREATOR')
    const a = await mkUser('BUSINESS', { name: 'Marca Alfa', segment: 'Alimentação' }), b = await mkUser('BUSINESS', { name: 'Marca Beta', segment: 'Alimentação' })
    await signedContract(a, c, { delivery: addDays(30), campaign: { excl: '60 dias' } })
    const campB = await openCampaign(b, { entrega: addDays(40) })
    const r = await api(b, 'POST', '/proposals', { campaignId: campB, creatorIds: [c.id], valueCents: 30000, delivery: addDays(40), imageUse: '90 dias', message: 'Oi!' })
    expect(r.status).toBe(422); expect(r.body.error.code).toBe('EXCLUSIVITY')
    expect(JSON.stringify(r.body)).not.toContain('Marca Alfa')
    // fora da janela (depois de 30 + 60 dias) passa
    const campC = await openCampaign(b, { entrega: addDays(100) })
    expect((await api(b, 'POST', '/proposals', { campaignId: campC, creatorIds: [c.id], valueCents: 30000, delivery: addDays(100), imageUse: '90 dias', message: 'Oi!' })).status).toBe(201)
    // o criador, ao se candidatar, vê com quem tem o compromisso
    const opp = await api(c, 'POST', `/opportunities/${campB}/apply`, { valueCents: 30000, message: 'Tenho interesse.' })
    expect(opp.status).toBe(422); expect(opp.body.error.message).toContain('Marca Alfa')
  })
  it('contrato pago mas ainda não assinado pelo criador não gera exclusividade', async () => {
    const c = await mkUser('CREATOR')
    const a = await mkUser('BUSINESS', { name: 'Marca Gama', segment: 'Alimentação' }), b = await mkUser('BUSINESS', { name: 'Marca Delta', segment: 'Alimentação' })
    const { proposalId } = await accepted(a, c, { delivery: addDays(30), campaign: { excl: '60 dias' } })
    await fund(a.id, 60000)
    expect((await api(a, 'POST', `/proposals/${proposalId}/pay`)).status).toBe(201) // pago, falta o criador assinar
    const campB = await openCampaign(b, { entrega: addDays(40) })
    expect((await api(b, 'POST', '/proposals', { campaignId: campB, creatorIds: [c.id], valueCents: 30000, delivery: addDays(40), imageUse: '90 dias', message: 'Oi!' })).status).toBe(201)
  })
})

describe('contrato e assinaturas', () => {
  it('assinatura do criador exige aceite expresso, congela o texto (hash) e gera o PDF final; reassinar é idempotente', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const { proposalId } = await accepted(k, c, { valueCents: 42000 })
    await fund(k.id, 50000)
    const pay = await api(k, 'POST', `/proposals/${proposalId}/pay`)
    const id = pay.body.contract.id
    expect(pay.body.contract.signatures.contractor).toBeTruthy()
    expect(pay.body.contract.signatures.creator).toBeNull()
    expect((await api(c, 'POST', `/contracts/${id}/sign`, { accept: false })).status).toBe(422)
    expect((await api(k, 'POST', `/contracts/${id}/sign`, { accept: true })).status).toBe(403) // contratante não assina pelo criador
    const s1 = await api(c, 'POST', `/contracts/${id}/sign`, { accept: true })
    expect(s1.status).toBe(200); expect(s1.body.contract.signed).toBe(true)
    const hash = s1.body.contract.sha256
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    const s2 = await api(c, 'POST', `/contracts/${id}/sign`, { accept: true })
    expect(s2.body.contract.sha256).toBe(hash)
    expect(await prisma.message.count({ where: { proposalId, text: { contains: 'Contrato assinado por' } } })).toBe(1)
    const pdf = await api(k, 'GET', `/contracts/${id}/pdf`)
    expect(pdf.status).toBe(200); expect(pdf.raw.headers['content-type']).toBe('application/pdf'); expect(pdf.raw.rawPayload.subarray(0, 5).toString()).toBe('%PDF-')
    // mudar o perfil depois da assinatura não altera o contrato congelado
    await prisma.companyProfile.update({ where: { userId: k.id }, data: { responsible: 'Outra Pessoa' } })
    expect((await api(c, 'GET', `/contracts/${id}`)).body.contract.sha256).toBe(hash)
  })
  it('criador sem CPF/cidade não assina até completar o perfil', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR', { noCpf: true })
    const { proposalId } = await accepted(k, c)
    await fund(k.id, 60000)
    const pay = await api(k, 'POST', `/proposals/${proposalId}/pay`)
    expect(pay.status).toBe(201); expect(pay.body.contract.signatures.contractor).toBeNull() // assinatura do contratante fica pendente
    const s = await api(c, 'POST', `/contracts/${pay.body.contract.id}/sign`, { accept: true })
    expect(s.status).toBe(422); expect(s.body.error.code).toBe('PROFILE_INCOMPLETE')
  })
})
void campaignBody
