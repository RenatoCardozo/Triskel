(() => {
  const $ = (s) => document.querySelector(s)
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  let key = sessionStorage.getItem('esim-key') || '', sel = null, last = ''
  const H = () => (key ? { 'x-api-key': key } : {})
  async function api(p, o = {}) { const r = await fetch(p, { ...o, headers: { ...H(), ...(o.headers || {}) } }); if (r.status === 401) { $('#key').hidden = false; throw new Error('401') } return r }
  async function list() {
    try {
      const j = await (await api('/api/messages?q=' + encodeURIComponent($('#q').value))).json()
      $('#key').hidden = true
      $('#count').textContent = `${j.total} ${j.total === 1 ? 'mensagem' : 'mensagens'} · ${j.unread} não lida${j.unread === 1 ? '' : 's'}`
      const sig = JSON.stringify(j.items.map((m) => [m.id, m.read, sel]))
      if (sig === last) return
      last = sig
      $('#list').innerHTML = j.items.length ? j.items.map((m) => `<li><button data-id="${esc(m.id)}" class="${m.read ? '' : 'unread'}" aria-current="${m.id === sel}"><b>${esc(m.subject)}</b><small>Para ${esc(m.to.join(', '))}</small><small>${new Date(m.receivedAt).toLocaleString('pt-BR')}${m.hasAttachments ? ' · anexo' : ''}</small></button></li>`).join('') : '<li class="empty" style="padding:14px">Nenhum e-mail ainda.</li>'
    } catch (e) { /* 401 já tratado */ }
  }
  async function open(id) {
    sel = id; last = ''
    const m = await (await api('/api/messages/' + id)).json()
    $('#detail').innerHTML = `<h2>${esc(m.subject)}</h2><p class="meta">De ${esc(m.from)} · Para ${esc(m.to.join(', '))} · ${new Date(m.receivedAt).toLocaleString('pt-BR')}</p>`
      + (m.code ? `<div>Código detectado: <span class="code">${esc(m.code)}</span></div>` : '')
      + (m.attachments.length ? `<p class="atts">Anexos: ${m.attachments.map((a) => `<a href="${esc(a.url)}" download>${esc(a.filename)} (${Math.max(1, Math.round(a.size / 1024))} KB)</a>`).join('')}</p>` : '')
      + `<iframe sandbox title="Conteúdo do e-mail" src="/view/${esc(m.id)}"></iframe>`
    list()
  }
  $('#list').addEventListener('click', (e) => { const b = e.target.closest('button[data-id]'); if (b) open(b.dataset.id) })
  $('#q').addEventListener('input', () => { last = ''; list() })
  $('#clear').addEventListener('click', async () => { if (confirm('Apagar todos os e-mails de teste?')) { await api('/api/messages', { method: 'DELETE' }); sel = null; last = ''; $('#detail').innerHTML = '<p class="empty">Selecione uma mensagem.</p>'; list() } })
  $('#key').addEventListener('submit', (e) => { e.preventDefault(); key = $('#k').value.trim(); sessionStorage.setItem('esim-key', key); list() })
  list(); setInterval(() => { if (!document.hidden) list() }, 2000)
})()
