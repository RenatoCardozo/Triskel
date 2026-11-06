(() => {
  const $ = (s) => document.querySelector(s)
  let key = sessionStorage.getItem('psim-key') || ''
  const brl = (c) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const when = (t) => new Date(t).toLocaleString('pt-BR')
  const say = (t, err) => { const m = $('#msg'); m.textContent = t; m.className = 'msg' + (err ? ' err' : '') }
  async function api(path, method = 'GET') {
    const r = await fetch(path, { method, headers: { 'x-admin-key': key } })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j?.error?.message || 'Falha na requisição')
    return j
  }
  const table = (head, rows) => rows.length ? `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>` : '<p class="empty">Nada por aqui ainda.</p>'
  const pill = (s) => `<span class="st ${esc(s)}">${esc({ paid: 'Pago', pending: 'Aguardando', failed: 'Recusado', expired: 'Expirado', requires_action: '3-D Secure', processing: 'Processando', completed: 'Concluído', delivered: 'Entregue' }[s] || s)}</span>`
  async function load() {
    try {
      const o = await api('/admin/overview')
      $('#main').hidden = false
      $('#charges').innerHTML = table(['Quando', 'Referência', 'Forma', 'Valor', 'Status', 'Ações'], o.charges.map((c) => `<tr><td>${when(c.createdAt)}</td><td><code>${esc(c.externalRef)}</code></td><td>${esc(c.detail)}</td><td>${brl(c.amountCents)}</td><td>${pill(c.status)}${c.failure ? `<br><small>${esc(c.failure)}</small>` : ''}</td><td>${['pending', 'requires_action'].includes(c.status) ? `<div class="acts"><button class="bt sm" data-a="/admin/charges/${esc(c.id)}/pay">Pagar</button><button class="bt sm o" data-a="/admin/charges/${esc(c.id)}/expire">Expirar</button><button class="bt sm d" data-a="/admin/charges/${esc(c.id)}/decline">Recusar</button></div>` : ''}</td></tr>`))
      $('#payouts').innerHTML = table(['Quando', 'Referência', 'Destino', 'Valor', 'Status', 'Ações'], o.payouts.map((p) => `<tr><td>${when(p.createdAt)}</td><td><code>${esc(p.externalRef)}</code></td><td>${esc(p.key)}</td><td>${brl(p.amountCents)}</td><td>${pill(p.status)}</td><td>${p.status === 'processing' ? `<div class="acts"><button class="bt sm" data-a="/admin/payouts/${esc(p.id)}/complete">Concluir</button><button class="bt sm d" data-a="/admin/payouts/${esc(p.id)}/fail">Falhar</button></div>` : ''}</td></tr>`))
      $('#events').innerHTML = table(['Quando', 'Evento', 'Status', 'Tentativas', 'Último erro', ''], o.events.map((e) => `<tr><td>${when(e.createdAt)}</td><td><code>${esc(e.type)}</code></td><td>${pill(e.status)}</td><td>${e.attempts}</td><td>${esc(e.lastError || '')}</td><td>${e.status === 'failed' ? `<button class="bt sm o" data-a="/admin/events/${esc(e.id)}/retry">Reenviar</button>` : ''}</td></tr>`))
    } catch (e) { say(e.message, true); if (/inválida/.test(e.message)) { sessionStorage.removeItem('psim-key'); $('#main').hidden = true } }
  }
  document.addEventListener('click', async (ev) => {
    const b = ev.target.closest('[data-a]')
    if (!b) return
    b.disabled = true
    try { await api(b.dataset.a, 'POST'); say('Feito. O webhook foi enfileirado.'); } catch (e) { say(e.message, true) }
    load()
  })
  $('#key').addEventListener('submit', (e) => { e.preventDefault(); key = $('#adm').value.trim(); sessionStorage.setItem('psim-key', key); $('#adm').value = ''; say(''); load() })
  if (key) load()
  setInterval(() => { if (key && !document.hidden) load() }, 2500)
})()
