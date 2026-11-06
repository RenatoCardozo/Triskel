/** Campanha gerada a partir do briefing (portado de `cgen` do protótipo). */
const lst = (a?: string[]) => (!a || !a.length ? '—' : a.length > 1 ? a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1] : a[0])
export interface CampaignData {
  nome: string; produto: string; obj: string; desc: string; msg: string; cta?: string
  pIdade: string[]; pGen: string; pReg: string; pInt?: string[]
  nichosCr: string[]; porteCr: string[]; genCr: string; idCr: string; regCr: string; nota: string; qCr: number
  fmt: string[]; plat: string[]; qVid: number; dur: string; tom: string[]; mencoes?: string; refs?: string; nao?: string
  rev: string; uso: string; excl: string; envio: string
}
export function generate(c: CampaignData, brand: string) {
  const m1 = (c.mencoes || '').split(/\s+/)[0]
  const headline = `Campanha “${c.nome}” de ${brand} para divulgar ${c.produto.toLowerCase()}. Objetivo: ${c.obj.toLowerCase()}. Mensagem principal: “${c.msg}”${c.cta ? ', com a chamada “' + c.cta + '”' : ''}.`
  const creators = `Buscamos ${c.qCr} ${c.qCr > 1 ? 'criadores' : 'criador'} de ${lst(c.nichosCr.map((x) => x.toLowerCase()))} (${lst(c.porteCr.map((x) => x.split(' (')[0].toLowerCase()))}), ${c.genCr === 'Sem preferência' ? 'sem preferência de gênero' : c.genCr.toLowerCase()}, em ${c.regCr}, com público de ${c.pIdade.join(' e ')} anos, ${(c.pGen || '').toLowerCase()}, em ${c.pReg}.`
  const content = `Cada criador produz ${c.qVid} ${c.qVid > 1 ? 'vídeos' : 'vídeo'} em ${lst(c.fmt)}, ${c.dur.toLowerCase()}, com tom ${lst(c.tom.map((x) => x.toLowerCase()))}, para ${lst(c.plat)}.`
  const reqs = ['Logo nos primeiros 10 s', 'Mostrar o produto', 'Citar a mensagem principal', 'Duração ' + c.dur.toLowerCase().replace('até', 'máx.'), 'Formato ' + (c.fmt[0] || 'vertical 9:16'), 'Mín. 60% de conteúdo humanizado']
  if (m1) reqs.splice(2, 0, 'Mencionar ' + m1)
  if (c.nao) reqs.push('Evitar: ' + c.nao.replace(/\.$/, '').toLowerCase())
  if (c.cta) reqs.push('Incluir a chamada: “' + c.cta + '”')
  return { title: c.nome, headline, creators, content, defaultRequirements: reqs }
}
