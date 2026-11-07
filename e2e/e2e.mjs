// Roteiro E2E: 3 perfis → e-mail → Pix → campanha → proposta → contraproposta → aceite → pagamento → assinaturas → PDF
// → vídeo → IA → aprovação → publicação → custódia liberada → saque. Requer a stack no ar (ver README).
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { WEB, PAY, ADMIN_KEY, OUT, step, expect, cpf, cnpj, launch, shot, mailCode, adminPay, bff } from './lib.mjs'

const RUN = Date.now().toString().slice(-7)
const PASS = 'Triskel@2026e2e'
const U = {
  creator: { role: 'CREATOR', nome: `Marina E2E ${RUN}`, doc: cpf('1' + RUN), data: '15/06/1996', cidade: 'Pelotas', uf: 'RS', email: `criadora.${RUN}@teste.local`, tel: '(53) 99912-3456' },
  business: { role: 'BUSINESS', nome: `Padaria E2E ${RUN}`, resp: 'Carlos Responsavel', doc: cnpj('2' + RUN), data: '10/03/2015', cidade: 'Pelotas', uf: 'RS', email: `padaria.${RUN}@teste.local`, tel: '(53) 99811-2233' },
  agency: { role: 'AGENCY', nome: `Agencia E2E ${RUN}`, resp: 'Ana Gestora', doc: cnpj('3' + RUN), data: '02/09/2018', cidade: 'Porto Alegre', uf: 'RS', email: `agencia.${RUN}@teste.local`, tel: '(51) 99777-8899' },
}
const brl = (c) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/ /g, ' ')
const iso = (days) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10)
const br = (days) => iso(days).split('-').reverse().join('/')

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=0x2dd4bf:s=200x200', '-frames:v', '1', `${OUT}/foto.png`])
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=720x1280:r=30:d=8', '-f', 'lavfi', '-i', 'sine=frequency=440:d=8', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', `${OUT}/entrega.mp4`])

const browser = await launch()
const ctxs = {}, pages = {}, api = {}
for (const k of Object.keys(U)) { ctxs[k] = await browser.newContext({ viewport: { width: 1280, height: 900 } }); pages[k] = await ctxs[k].newPage(); pages[k].setDefaultTimeout(15000); api[k] = bff(ctxs[k]) }
const errs = []
for (const [k, p] of Object.entries(pages)) { p.on('pageerror', (e) => errs.push(`${k} pageerror ${e.message}`)); p.on('response', (r) => { if (r.status() >= 400) errs.push(`${k} ${r.status()} ${r.request().method()} ${r.url().replace(WEB, '')}`) }) }
const S = {}   // estado compartilhado do roteiro

try {
  console.log(`E2E ${RUN}`)

  // 1) cadastro pela interface, nos 3 perfis
  for (const k of Object.keys(U)) await step(`cadastro ${k}`, async () => {
    const u = U[k], p = pages[k], since = Date.now() - 1000
    await p.goto(`${WEB}/cadastro?perfil=${u.role}`)
    await p.locator('#nome').fill(u.nome)
    if (u.resp) await p.locator('#resp').fill(u.resp)
    await p.locator('#doc').fill(u.doc)
    await p.locator('#data').fill(u.data)
    await p.locator('#cidade').fill(u.cidade); await p.locator('#uf').fill(u.uf)
    await p.locator('#email').fill(u.email); await p.locator('#tel').fill(u.tel)
    await p.locator('#senha').fill(PASS); await p.locator('#senha2').fill(PASS)
    await p.getByRole('checkbox').check()
    if (k === 'creator') await shot(p, '01_cadastro_preenchido')
    await p.locator('form button[type=submit]').click()
    await p.waitForURL(/validar-email/)
    const cookies = await ctxs[k].cookies(); const names = cookies.map((c) => c.name)
    expect(names.includes('tk_at') && cookies.find((c) => c.name === 'tk_at').httpOnly, 'cookie de sessão httpOnly')
    expect(!(await p.evaluate(() => document.cookie)).includes('tk_'), 'cookies de sessão invisíveis ao JS')
    S[k] = { since }
  })

  // 2) validação de e-mail com o código recebido (email-sim)
  for (const k of Object.keys(U)) await step(`validar e-mail ${k}`, async () => {
    const p = pages[k]
    const code = await mailCode(U[k].email, S[k].since)
    await p.getByLabel('Código de verificação').fill('000000'); await p.getByRole('button', { name: /validar|confirmar/i }).first().click()
    await p.getByRole('alert').first().waitFor()                 // código errado é recusado
    await p.getByLabel('Código de verificação').fill(code); await p.getByRole('button', { name: /validar|confirmar/i }).first().click()
    await p.waitForURL((u) => !/validar-email/.test(u.pathname), { timeout: 15000 }).catch(() => {})
    const me = await api[k].get('auth/me'); expect(me.user?.verified ?? me.verified, 'e-mail validado')
  })

  // 3) perfis completos (fotos + campos obrigatórios) via BFF
  const meta = (await api.creator.get('meta')).options
  const first = (a, n = 1) => a.slice(0, n)
  const common = { cidade: 'Pelotas', uf: 'RS', sobre: 'Perfil criado pelo roteiro E2E para validar o fluxo completo.', insta: '@e2e.teste', pIdade: first(meta.idades, 2), pGen: meta.gen[0], pReg: meta.reg[0], pInt: first(meta.nichos, 2) }
  const profiles = {
    creator: { ...common, genero: meta.generoCriador[0], idiomas: first(meta.idi), seg: meta.seguidores[1], nichos: ['Gastronomia', 'Lifestyle'], fmt: first(meta.fmt, 2), prazo: meta.prazo[0] },
    business: { ...common, seg: meta.segE[0], porte: meta.porteEmp[0], canais: first(meta.canais), fmt: first(meta.fmt, 2), orc: meta.orcE[0], porteCr: first(meta.porteCr, 2), nichosCr: ['Gastronomia'] },
    agency: { ...Object.fromEntries(Object.entries(common).filter(([k]) => !['pGen', 'pReg', 'pInt'].includes(k))), servicos: first(meta.serv), equipe: meta.equipe[0], segs: first(meta.segE, 2), nCli: meta.nCli[0], reg: meta.reg[0], orc: meta.orcA[0], fmt: first(meta.fmt, 2), porteCr: first(meta.porteCr, 2) },
  }
  for (const k of Object.keys(U)) await step(`perfil completo ${k}`, async () => {
    for (const kind of ['avatar', 'cover']) {
      const r = await ctxs[k].request.fetch(`${WEB}/api/bff/me/photo/${kind}`, { method: 'POST', headers: { origin: WEB }, multipart: { file: { name: 'foto.png', mimeType: 'image/png', buffer: readFileSync(`${OUT}/foto.png`) } } })
      expect(r.ok(), `foto ${kind}: ${r.status()} ${await r.text()}`)
    }
    if (k === 'creator') await api.creator.patch('me/prices', { reels: 20000, stories: 10000, tiktok: 15000, img: meta.imgUso[0], showPrices: true, acceptBelowMin: false })
    await api[k].patch('me/profile', profiles[k])
    const me = await api[k].get('auth/me'); const m = me.user ?? me
    expect(m.complete && m.visible, `perfil completo/visível (faltando: ${(m.missing || []).join(', ')})`)
  })

  // 4) Pix: recarga do comércio pela interface; pagamento no gateway simulado; saldo creditado
  await step('recarga Pix (interface + gateway)', async () => {
    const p = pages.business
    await p.goto(`${WEB}/pagamentos/adicionar`)
    await shot(p, '02_adicionar_saldo')
    await p.getByLabel('Quanto você quer adicionar?').fill('2000,00')
    await p.getByRole('button', { name: /^Gerar Pix de/ }).click()
    await p.getByText('Aguardando o pagamento').waitFor()
    await shot(p, '03_pix_qr')
    const qr = await p.locator('img[src^="data:image/svg"]').count(); expect(qr > 0, 'QR Code exibido')
    const ov = await (await fetch(`${PAY}/admin/overview`, { headers: { 'x-admin-key': ADMIN_KEY } })).json()
    const ch = ov.charges.find((c) => c.status === 'pending' || c.status === 'PENDING' || c.status === 'created') || ov.charges[0]
    expect(ch, 'cobrança criada no gateway'); S.chargeId = ch.id
    await adminPay(ch.id)   // o gateway notifica o back por webhook assinado
    await p.getByRole('heading', { name: 'Saldo adicionado' }).waitFor({ timeout: 25000 })
    await shot(p, '04_pix_pago')
    const w = await api.business.get('wallet'); expect((w.balanceCents ?? w.wallet?.balanceCents) === 200000, `saldo R$ 2.000,00 (veio ${JSON.stringify(w).slice(0, 120)})`)
  })

  // 5) campanha: rascunho via API; confirmação e busca pela interface
  await step('campanha: gerar e confirmar', async () => {
    const f = { nome: `Campanha E2E ${RUN}`, produto: 'Pão de fermentação natural', obj: meta.objetivos[0], desc: 'Vídeo curto mostrando o preparo do pão e a fornada saindo do forno, com foco no sabor artesanal.', msg: 'Pão feito com calma e fermentação natural.', cta: 'Peça pelo WhatsApp',
      pIdade: first(meta.idades, 2), pGen: meta.gen[0], pReg: meta.reg[0], pInt: ['Gastronomia'], nichosCr: ['Gastronomia', 'Lifestyle'], porteCr: first(meta.porteCr, 3), genCr: meta.genCr[0], idCr: meta.idCr[0], regCr: meta.reg[0], nota: meta.nota[0], qCr: 1,
      fmt: first(meta.fmt, 1), plat: first(meta.plataformas, 1), qVid: 1, dur: meta.duracoes[0], tom: first(meta.tons, 1), valueCents: 30000, inicio: iso(1), entrega: iso(20), publi: iso(25), rev: meta.rev[0], uso: meta.uso[0], excl: meta.excl[0], envio: meta.envio[0] }
    S.campaignForm = f; const c = await api.business.post('campaigns', f); S.campaignId = c.campaign.id; S.creatorId = (await api.creator.get('auth/me')).user.id
    const p = pages.business
    await p.goto(`${WEB}/campanhas/${S.campaignId}`)
    await shot(p, '05_campanha_gerada')
    await p.getByRole('button', { name: /Confirmar e buscar criadores/ }).click()
    await p.waitForURL(/\/criadores\?campanha=/)
  })
  await step('busca de criadores com compatibilidade e envio de proposta (interface)', async () => {
    const p = pages.business
    await p.getByLabel('Buscar criador').fill(U.creator.nome)
    await p.getByText(/% /).first().waitFor().catch(() => {})
    const card = p.locator('li', { hasText: U.creator.nome })
    await card.waitFor(); await shot(p, '06_busca_criadores')
    expect(/\d+%/.test(await card.innerText()), 'compatibilidade exibida no cartão')
    await card.getByRole('link', { name: 'Enviar proposta' }).click()
    await p.getByRole('heading', { name: 'Enviar proposta' }).waitFor()
    await p.getByLabel('Mensagem ao criador').fill('Oi Marina! Adoramos o seu trabalho e queremos você nessa campanha.')
    await shot(p, '07_enviar_proposta')
    await p.getByRole('button', { name: 'Enviar proposta' }).click()
    await p.waitForURL(/\/contatos\/[^/]+$/)
    S.proposalId = p.url().split('/').pop()
  })
  await step('mensagem com telefone/e-mail é bloqueada (anti-vazamento)', async () => {
    const r = await ctxs.business.request.fetch(`${WEB}/api/bff/proposals/${S.proposalId}/messages`, { method: 'POST', headers: { origin: WEB, 'content-type': 'application/json' }, data: JSON.stringify({ text: 'me chama no 53 99999-1111 ou fulano@gmail.com' }) })
    expect(r.status() === 422, `bloqueio esperado (422), veio ${r.status()}`)
  })

  // 6) negociação: criador faz contraproposta, comércio aceita
  await step('criador: contraproposta (interface)', async () => {
    const p = pages.creator
    await p.goto(`${WEB}/contatos/${S.proposalId}`)
    await shot(p, '08_conversa_criador')
    await p.getByRole('link', { name: 'Fazer contraproposta' }).click()
    await p.getByLabel('Valor que você quer receber (R$)').fill('350,00')
    await p.getByLabel('Mensagem').fill('Topo! Só ajusto o valor por causa da edição.')
    await p.getByRole('button', { name: 'Enviar contraproposta' }).click()
    await p.waitForURL(/\/contatos\/[^/]+$/)
    const pr = (await api.creator.get('proposals/' + S.proposalId)).proposal
    expect(pr.rounds.length === 2 && pr.rounds[1].valueCents === 35000 && pr.turn === 'K', 'rodada 2 registrada e vez do comércio')
    expect(pr.rounds[1].feeCents === 3500 && pr.rounds[1].totalCents === 38500, 'taxa de 10% sobre o valor')
  })
  await step('comércio: aceita a contraproposta (interface)', async () => {
    const p = pages.business
    await p.goto(`${WEB}/contatos/${S.proposalId}`)
    await p.getByRole('button', { name: /^Aceitar proposta de/ }).click()
    await p.getByRole('button', { name: 'Aceitar proposta', exact: true }).click()
    await p.getByRole('link', { name: 'Revisar contrato e pagar' }).waitFor()
    await shot(p, '09_aceita')
  })

  // 7) contrato: pagamento com saldo (custódia) e assinaturas
  await step('comércio: paga com saldo e o valor vai para custódia', async () => {
    const p = pages.business
    await p.getByRole('link', { name: 'Revisar contrato e pagar' }).click()
    await p.getByRole('checkbox').check()
    await shot(p, '10_contrato_pagar')
    await p.getByRole('button', { name: /^Pagar .* e confirmar contrato/ }).click()
    await p.getByRole('button', { name: 'Pagar e confirmar' }).click()
    await p.waitForURL(/\/contatos\/[^/]+$|\/contratos\//, { timeout: 20000 })
    const w = await api.business.get('wallet')
    expect(w.balanceCents === 200000 - 38500, `saldo 2000 - 385 (veio ${w.balanceCents})`)
    expect(w.custodyCents === 35000, `custódia 350,00 (a taxa de 35,00 fica com a Triskel) (veio ${w.custodyCents})`)
    const pr = (await api.business.get('proposals/' + S.proposalId)).proposal
    expect(pr.status === 'CONTRACT' && pr.contract, 'contrato gerado'); S.contractId = pr.contract.id
  })
  await step('pagar de novo não debita duas vezes (idempotente)', async () => {
    const r = await ctxs.business.request.fetch(`${WEB}/api/bff/proposals/${S.proposalId}/pay`, { method: 'POST', headers: { origin: WEB, 'content-type': 'application/json' }, data: '{}' })
    const w = await api.business.get('wallet'); expect(w.custodyCents === 35000 && w.balanceCents === 200000 - 38500, `sem novo débito (status ${r.status()}, saldo ${w.balanceCents})`)
  })
  await step('criador: assina e o PDF final é gerado', async () => {
    const p = pages.creator
    await p.goto(`${WEB}/contratos/${S.contractId}`)
    await shot(p, '11_contrato_criador')
    await p.getByRole('checkbox').check()
    await p.getByRole('button', { name: 'Assinar contrato' }).click()
    await p.getByRole('link', { name: /Baixar contrato assinado/ }).waitFor()
    const r = await ctxs.creator.request.get(`${WEB}/api/bff/contracts/${S.contractId}/pdf?download=0`)
    const buf = await r.body(); expect(r.ok() && buf.slice(0, 5).toString() === '%PDF-', 'PDF válido'); expect(buf.length > 3000, 'PDF com conteúdo')
    const { writeFileSync } = await import('node:fs'); writeFileSync(`${OUT}/contrato_assinado.pdf`, buf)
    const r2 = await ctxs.business.request.get(`${WEB}/api/bff/contracts/${S.contractId}/pdf?download=0`); expect(r2.ok(), 'comércio também baixa')
    const otherPdf = await ctxs.agency.request.get(`${WEB}/api/bff/contracts/${S.contractId}/pdf?download=0`); expect(otherPdf.status() === 404 || otherPdf.status() === 403, `terceiro não acessa o contrato (veio ${otherPdf.status()})`)
  })

  // 8) entrega: vídeo → IA → aprovação → publicação → custódia liberada
  await step('criador: envia o vídeo e a IA analisa', async () => {
    const p = pages.creator
    const list = await api.creator.get('deliveries'); const d0 = (list.items || list.deliveries || list)[0]; S.deliveryId = d0.id
    await p.goto(`${WEB}/entregas/${S.deliveryId}`)
    await shot(p, '12_entrega_producao')
    await p.locator('input[type=file]').setInputFiles(`${OUT}/entrega.mp4`)
    await p.getByRole('button', { name: 'Enviar para análise da IA' }).click()
    await p.getByRole('button', { name: /Enviar para aprovação/ }).waitFor({ timeout: 90000 })
    await shot(p, '13_ia_relatorio')
  })
  await step('criador envia para aprovação; comércio pede ajustes e depois aprova', async () => {
    const p = pages.creator
    await p.getByRole('button', { name: /Enviar para aprovação/ }).click()
    const b = pages.business
    await b.goto(`${WEB}/entregas/${S.deliveryId}`)
    await b.getByRole('button', { name: 'Pedir ajustes' }).click()
    await b.getByLabel('Comentário ao criador').fill('Pode deixar o início mais rápido, por favor.')
    await b.getByRole('button', { name: 'Enviar pedido' }).click()
    await b.getByText(/ajuste/i).first().waitFor()
    // criador reenvia
    await p.goto(`${WEB}/entregas/${S.deliveryId}`)
    await p.locator('input[type=file]').setInputFiles(`${OUT}/entrega.mp4`)
    await p.getByRole('button', { name: 'Enviar para análise da IA' }).click()
    await p.getByRole('button', { name: /Enviar para aprovação/ }).waitFor({ timeout: 90000 })
    await p.getByRole('button', { name: /Enviar para aprovação/ }).click()
    await b.goto(`${WEB}/entregas/${S.deliveryId}`)
    await shot(b, '14_aprovacao_comercio')
    await b.getByRole('button', { name: 'Aprovar entrega', exact: true }).click()
    await b.getByRole('button', { name: 'Aprovar entrega' }).last().click()
    await b.getByText(/aprovad/i).first().waitFor()
  })
  await step('criador publica; Triskel confirma; custódia liberada ao criador', async () => {
    const p = pages.creator
    await p.goto(`${WEB}/entregas/${S.deliveryId}`)
    await p.getByLabel('Link do post publicado').fill('https://www.instagram.com/reel/C1a2B3c4D5e/')
    await p.getByRole('button', { name: /confirmar|enviar|publicad/i }).last().click()
    const t0 = Date.now(); let w
    while (Date.now() - t0 < 30000) { w = await api.creator.get('wallet'); if (w.availableCents >= 35000) break; await new Promise((r) => setTimeout(r, 1000)) }
    expect(w.availableCents === 35000, `criador recebe R$ 350,00 integral (veio ${w.availableCents})`)
    const bw = await api.business.get('wallet'); expect(bw.custodyCents === 0, 'custódia zerada')
    await p.goto(`${WEB}/entregas/${S.deliveryId}`); await shot(p, '15_entrega_liberada')
  })

  // 9) saque
  await step('criador: saque via Pix (interface) e validações', async () => {
    const p = pages.creator
    const tooMuch = await ctxs.creator.request.fetch(`${WEB}/api/bff/wallet/withdrawals`, { method: 'POST', headers: { origin: WEB, 'content-type': 'application/json', 'idempotency-key': 'e2e-' + RUN + '-x' }, data: JSON.stringify({ amountCents: 99999999, key: 'cpf' }) })
    expect(tooMuch.status() === 422, `saque acima do saldo recusado (veio ${tooMuch.status()})`)
    await p.goto(`${WEB}/pagamentos/saque`)
    await p.getByLabel('Valor do saque').fill('100,00')
    await shot(p, '16_saque')
    await p.getByRole('button', { name: 'Sacar', exact: true }).click()
    await p.getByRole('button', { name: 'Sacar', exact: true }).last().click()
    await p.getByRole('link', { name: 'Ver comprovante' }).waitFor({ timeout: 20000 })
    await shot(p, '17_saque_ok')
    const t0 = Date.now(); let w
    while (Date.now() - t0 < 20000) { w = await api.creator.get('wallet'); if (w.availableCents === 25000) break; await new Promise((r) => setTimeout(r, 1000)) }
    expect(w.availableCents === 25000, `saldo 350 - 100 (veio ${w.availableCents})`)
  })

  // 9b) agência: cadastra cliente pela interface e convida o criador em nome dele
  await step('agência: cliente (interface), campanha em nome do cliente e proposta', async () => {
    const p = pages.agency
    await p.goto(`${WEB}/clientes`)
    await p.getByRole('button', { name: '+ Cadastrar cliente' }).first().click()
    await p.getByLabel('Nome do cliente').fill(`Cliente E2E ${RUN}`)
    await p.getByLabel('Segmento').selectOption(meta.segE[0])
    await p.getByRole('button', { name: 'Cadastrar', exact: true }).click()
    await p.getByText(`Cliente E2E ${RUN}`).waitFor(); await shot(p, '18_clientes')
    const cl = (await api.agency.get('me/clients')).clients.at(-1)
    const camp = await api.agency.post('campaigns', { ...S.campaignForm, clientId: cl.id, nome: `Campanha agência ${RUN}` })
    await api.agency.post(`campaigns/${camp.campaign.id}/confirm`, { requirements: ['Mostrar o produto', 'Citar o cliente'] })
    const r = await api.agency.post('proposals', { campaignId: camp.campaign.id, creatorIds: [S.creatorId], valueCents: 30000, delivery: iso(25), imageUse: meta.uso[0], message: 'Convite da agência em nome do cliente.' })
    expect(r.sent.length === 1, 'proposta da agência enviada')
    const pr = (await api.agency.get('proposals/' + r.sent[0].proposalId)).proposal
    expect(pr.clientName === `Cliente E2E ${RUN}`, 'proposta identifica o cliente da agência')
  })

  // 10) isolamento entre perfis (RBAC/propriedade)
  await step('RBAC, CSRF e propriedade', async () => {
    const r = await ctxs.creator.request.fetch(`${WEB}/api/bff/campaigns`)
    expect(r.status() === 403, `criador listando campanhas → 403 (veio ${r.status()})`)
    const csrf = await ctxs.creator.request.fetch(`${WEB}/api/bff/me/prefs`, { method: 'PATCH', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, data: '{"push":false}' })
    expect(csrf.status() === 403, `Origin estranha em PATCH → 403 (veio ${csrf.status()})`)
    const a = await ctxs.agency.request.fetch(`${WEB}/api/bff/campaigns/${S.campaignId}`); expect(a.status() === 404, `campanha de outro dono → 404 (veio ${a.status()})`)
    const pr = await ctxs.agency.request.fetch(`${WEB}/api/bff/proposals/${S.proposalId}`); expect(pr.status() === 404 || pr.status() === 403, `proposta de terceiros bloqueada (veio ${pr.status()})`)
    await pages.creator.goto(`${WEB}/campanhas`); expect(!/\/campanhas$/.test(pages.creator.url()), 'middleware redireciona criador em /campanhas')
  })
  console.log('\nTodos os passos passaram.')
  if (errs.length) console.log('Respostas >= 400 / erros de página observados:\n' + [...new Set(errs)].join('\n'))
} catch (e) {
  console.log('\nInterrompido.'); await Promise.all(Object.entries(pages).map(([k, p]) => shot(p, `ERRO_${k}`).catch(() => {}))); console.log(errs.slice(0, 10).join('\n')); await browser.close(); process.exit(1)
}
await browser.close()
