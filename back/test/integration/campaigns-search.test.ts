import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prisma } from '../../src/db'
import { addDays, api, campaignBody, closeApp, getApp, mkUser, openCampaign, signedContract } from './helpers'

beforeAll(getApp)
afterAll(closeApp)

describe('campanhas', () => {
  it('valida opções, datas e valor; entrega precisa ser futura e anterior à publicação', async () => {
    const k = await mkUser('BUSINESS')
    expect((await api(k, 'POST', '/campaigns', campaignBody({ entrega: addDays(-1) }))).body.error.code).toBe('DELIVERY_PAST')
    expect((await api(k, 'POST', '/campaigns', campaignBody({ inicio: addDays(40), entrega: addDays(30) }))).body.error.code).toBe('DATES')
    expect((await api(k, 'POST', '/campaigns', campaignBody({ publi: addDays(10) }))).body.error.code).toBe('DATES')
    expect((await api(k, 'POST', '/campaigns', campaignBody({ obj: 'Qualquer coisa' }))).status).toBe(422)
    expect((await api(k, 'POST', '/campaigns', campaignBody({ valueCents: 5 }))).status).toBe(422)
    expect((await api(k, 'POST', '/campaigns', { ...campaignBody(), extra: 'x' })).status).toBe(422) // campos desconhecidos
  })
  it('agência escolhe um cliente seu; cliente de outra agência dá 404', async () => {
    const ag = await mkUser('AGENCY'), ag2 = await mkUser('AGENCY')
    const cli = await prisma.agencyClient.create({ data: { agencyId: ag2.id, name: 'Cliente de Outra', segment: 'Beleza' } })
    expect((await api(ag, 'POST', '/campaigns', campaignBody())).body.error.code).toBe('CLIENT_REQUIRED')
    expect((await api(ag, 'POST', '/campaigns', campaignBody({ clientId: cli.id }))).status).toBe(404)
    const mine = await prisma.agencyClient.create({ data: { agencyId: ag.id, name: 'Meu Cliente', segment: 'Saúde' } })
    const ok = await api(ag, 'POST', '/campaigns', campaignBody({ clientId: mine.id }))
    expect(ok.status).toBe(201); expect(ok.body.campaign.brandName).toBe('Meu Cliente')
  })
  it('campanha com propostas enviadas não pode mais ser editada nem apagada', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const id = await openCampaign(k)
    await api(k, 'POST', '/proposals', { campaignId: id, creatorIds: [c.id], valueCents: 30000, delivery: addDays(20), imageUse: '90 dias', message: 'Oi' })
    expect((await api(k, 'PUT', `/campaigns/${id}`, campaignBody())).body.error.code).toBe('CAMPAIGN_LOCKED')
    expect((await api(k, 'DELETE', `/campaigns/${id}`)).body.error.code).toBe('CAMPAIGN_LOCKED')
  })
  it('só campanha confirmada recebe propostas', async () => {
    const k = await mkUser('BUSINESS'), c = await mkUser('CREATOR')
    const d = await api(k, 'POST', '/campaigns', campaignBody())
    const r = await api(k, 'POST', '/proposals', { campaignId: d.body.campaign.id, creatorIds: [c.id], valueCents: 30000, delivery: addDays(20), imageUse: '90 dias', message: 'Oi' })
    expect(r.body.error.code).toBe('CAMPAIGN_DRAFT')
  })
})

describe('busca de criadores e oportunidades', () => {
  it('criador só aparece na busca com perfil completo e e-mail validado; ordena por compatibilidade', async () => {
    const k = await mkUser('BUSINESS')
    const gast = await mkUser('CREATOR', { niches: ['Gastronomia', 'Lifestyle'] }), tech = await mkUser('CREATOR', { niches: ['Tecnologia'] })
    const invisible = await mkUser('CREATOR')
    await prisma.user.update({ where: { id: invisible.id }, data: { emailVerifiedAt: null } })
    await api(invisible, 'GET', '/auth/me') // a leitura do próprio perfil recalcula a visibilidade nas buscas
    const id = await openCampaign(k, { nichosCr: ['Gastronomia', 'Lifestyle'] })
    const r = await api(k, 'GET', `/creators?campaignId=${id}&ord=compat`)
    expect(r.status).toBe(200)
    const ids = r.body.items.map((x: any) => x.id)
    expect(ids).toContain(gast.id); expect(ids).toContain(tech.id)
    expect(ids).not.toContain(invisible.id)
    expect(ids.indexOf(gast.id)).toBeLessThan(ids.indexOf(tech.id))
    const card = r.body.items.find((x: any) => x.id === gast.id)
    expect(JSON.stringify(card)).not.toMatch(/instagram|cpf|email|phone/i)
  })
  it('busca marca conflito de exclusividade sem citar a marca concorrente', async () => {
    const c = await mkUser('CREATOR')
    const a = await mkUser('BUSINESS', { name: 'Marca Omega', segment: 'Alimentação' }), b = await mkUser('BUSINESS', { name: 'Marca Sigma', segment: 'Alimentação' })
    await signedContract(a, c, { delivery: addDays(30), campaign: { excl: '60 dias' } })
    const id = await openCampaign(b, { entrega: addDays(45) })
    const r = await api(b, 'GET', `/creators?campaignId=${id}`)
    const item = r.body.items.find((x: any) => x.id === c.id)
    expect(item.conflict).toBeTruthy()
    expect(item.conflict).not.toContain('Marca Omega')
  })
  it('oportunidades: lista só campanhas abertas de outras empresas e esconde as com conflito de exclusividade na candidatura', async () => {
    const c = await mkUser('CREATOR'), k = await mkUser('BUSINESS')
    const id = await openCampaign(k)
    const draft = await api(k, 'POST', '/campaigns', campaignBody({ nome: 'Rascunho secreto' }))
    const l = await api(c, 'GET', '/opportunities')
    expect(l.body.items.map((x: any) => x.id)).toContain(id)
    expect(l.body.items.map((x: any) => x.id)).not.toContain(draft.body.campaign.id)
    expect((await api(c, 'GET', `/opportunities/${draft.body.campaign.id}`)).status).toBe(404)
    const ap = await api(c, 'POST', `/opportunities/${id}/apply`, { valueCents: 30000, message: 'Tenho interesse.' })
    expect(ap.status).toBe(201)
    expect((await api(c, 'POST', `/opportunities/${id}/apply`, { valueCents: 30000, message: 'De novo.' })).body.error.code).toBe('ALREADY_APPLIED')
  })
})
