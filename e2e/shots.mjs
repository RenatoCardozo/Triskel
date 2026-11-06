import { chromium } from 'playwright-core'
const B = process.env.WEB_URL || 'http://localhost:3000'
const PASSWORD = process.env.SEED_PASSWORD || 'Triskel@2026'
const OUT = process.env.E2E_OUT || '/tmp/triskel-e2e'
import { mkdirSync } from 'node:fs'
mkdirSync(OUT + '/shots', { recursive: true })
const ROLES = {
  creator: { email: 'marjorie@email.com', pages: ['/painel','/perfil','/oportunidades','/contatos','/entregas','/pagamentos','/pagamentos/saque','/portfolio','/avaliacoes','/perfil/valores','/configuracoes','/ajuda'] },
  business: { email: 'contato@docevale.com.br', pages: ['/painel','/criadores','/campanhas','/campanhas/nova','/contatos','/entregas','/pagamentos','/pagamentos/adicionar','/avaliacoes','/perfil'] },
  agency: { email: 'oi@maredigital.com.br', pages: ['/painel','/clientes','/criadores','/campanhas','/campanhas/nova','/contatos','/entregas'] },
}
const only = process.argv[2]
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] })
const report = []
for (const [role, cfg] of Object.entries(ROLES)) {
  if (only && only !== role) continue
  for (const [w, h] of [[1280, 800], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } })
    const p = await ctx.newPage()
    const errs = []
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) })
    p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 200)))
    p.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/_next/')) errs.push(`${r.status()} ${r.url().replace(B, '')}`) })
    await p.goto(B + '/login'); await p.fill('input[name=email]', cfg.email); await p.fill('input[type=password]', PASSWORD)
    await Promise.all([p.waitForURL(/painel/, { timeout: 15000 }).catch(() => {}), p.click('button[type=submit]')])
    const pages = [...cfg.pages]
    if (cfg.pages.includes('/criadores')) {
      const j = async (u) => (await ctx.request.get(B + '/api/bff/' + u)).json().catch(() => ({}))
      const camp = ((await j('campaigns')).items || []).find((c) => c.status === 'OPEN'); const cr = ((await j('creators')).items || [])[0]
      if (camp) pages.push(`/criadores?campanha=${camp.id}`, `/campanhas/${camp.id}`)
      if (camp && cr) pages.push(`/criadores/${cr.id}?campanha=${camp.id}`, `/criadores/proposta?campanha=${camp.id}&c=${cr.id}`)
    }
    for (const pg of pages) {
      errs.length = 0
      await p.goto(B + pg, { waitUntil: 'networkidle' }).catch(() => {})
      await p.waitForTimeout(500)
      const name = `${role}_${w}_${pg.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 60)}`
      await p.screenshot({ path: `${OUT}/shots/${name}.png`, fullPage: true })
      const ov = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
      report.push(`${role} ${w} ${pg} url=${new URL(p.url()).pathname} ${ov ? 'OVERFLOW-X ' : ''}${errs.length ? 'ERR: ' + [...new Set(errs)].join(' | ') : ''}`)
    }
    await ctx.close()
  }
}
await b.close()
console.log(report.join('\n'))
