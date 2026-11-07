'use client'
import { useId, useState } from 'react'
import { post } from '@/lib/api'
import { Abs, Txt, cq } from './Stage'

const P2 = 'Nascemos da constatação de que o mercado de marketing de influência, apesar de crescer rapidamente, ainda funciona de forma desorganizada: conversas espalhadas entre redes sociais e aplicativos de mensagens, negociações sem padrão, briefings incompletos e nenhuma forma clara de avaliar quem é confiável. Esse cenário prejudica dois lados que, na verdade, precisam um do outro — pequenos comércios que querem se comunicar de forma mais próxima e genuína com seu público, e criadores de conteúdo UGC, nano e micro influenciadores que buscam oportunidades reais de trabalho.'
const P3 = 'A Triskel é a plataforma que conecta esses dois mundos. Unimos criadores de conteúdo, pequenos e médios negócios e agências de marketing em um único ambiente, estruturando todo o processo — da busca e negociação ao envio de briefings, acompanhamento de entregas e avaliação de resultados. Com o apoio de inteligência artificial, ajudamos a recomendar os criadores mais compatíveis com cada campanha e a analisar a qualidade das entregas, tornando o processo mais rápido, transparente e confiável.'
const P4 = 'Nosso propósito vai além da tecnologia: queremos democratizar o acesso ao marketing de influência, mostrando que campanhas autênticas e de impacto não são privilégio apenas de grandes marcas. Acreditamos no potencial dos pequenos negócios e na força criativa dos criadores locais — e trabalhamos para fortalecer esse ecossistema, uma conexão de cada vez.'

/** "Sobre nós" (Figma): primeiro parágrafo e "Ler mais" que expande o restante. */
export function AboutCard() {
  const [open, setOpen] = useState(false); const id = useId()
  return (
    <div className="tk-abc">
      <p>Na Triskel, acreditamos que a autenticidade é a nova moeda do marketing. Em um mundo saturado de publicidade tradicional, sabemos que as pessoas confiam mais em pessoas — e é por isso que existimos.</p>
      <div id={id} role="region" aria-label="Mais sobre a Triskel" className="tk-abm" style={{ maxHeight: open ? 1400 : 0 }} aria-hidden={!open}>
        <p>{P2}</p><p>{P3}</p><div className="tk-abq">{P4}</div>
      </div>
      <button type="button" className="tk-rm" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} style={{ marginTop: open ? 18 : 8 }}>
        {open ? 'Ler menos' : 'Ler mais'}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }}><path d="M6 9l6 6 6-6" /></svg>
      </button>
    </div>
  )
}

/** "Ficou com alguma dúvida" (Figma): nome, e-mail e mensagem; envia para o mesmo endpoint de contato. */
export function HomeContact() {
  const [v, setV] = useState({ name: '', email: '', message: '' })
  const [st, setSt] = useState<'idle' | 'busy' | 'ok'>('idle')
  const [err, setErr] = useState('')
  async function send() {
    setErr('')
    if (v.name.trim().length < 3) return setErr('Informe o seu nome.')
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) return setErr('Informe um e-mail válido.')
    if (v.message.trim().length < 10) return setErr('Escreva pelo menos 10 caracteres na mensagem.')
    setSt('busy')
    try { await post('contact', { name: v.name.trim(), email: v.email.trim(), profile: 'Ainda não tenho conta', subject: 'Dúvida sobre a plataforma', message: v.message.trim() }); setSt('ok'); setV({ name: '', email: '', message: '' }) }
    catch (e) { setSt('idle'); setErr((e as Error).message || 'Não foi possível enviar agora.') }
  }
  const box = { position: 'absolute' as const, background: '#fff', borderRadius: cq(10), boxShadow: `${cq(4)} ${cq(4)} ${cq(4)} rgba(0,0,0,.15)` }
  const ct = { width: '100%', height: '100%', border: 0, background: 'transparent', padding: `0 ${cq(9)}`, fontSize: cq(12), fontWeight: 500, color: '#4b5dca', outline: 'none', resize: 'none' as const, borderRadius: cq(10) }
  return (
    <>
      <Txt x={38} y={21} w={335} h={33} size={20} weight={900} color="#4c5dca" align="c" as="h2">Ficou com alguma dúvida ou precisa de ajuda</Txt>
      <Abs x={15} y={102} w={382} h={32} style={box}><input className="tk-ct" style={ct} placeholder="Nome" aria-label="Nome" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Abs>
      <Abs x={15} y={155} w={382} h={32} style={box}><input className="tk-ct" style={ct} placeholder="Email" type="email" aria-label="Email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Abs>
      <Abs x={14} y={217} w={382} h={158} style={box}><textarea className="tk-ct" style={{ ...ct, paddingTop: cq(6) }} placeholder="Sua mensagem ..." aria-label="Sua mensagem" maxLength={2000} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} /></Abs>
      <Abs x={100} y={405} w={209} h={36}>
        <button type="button" onClick={send} disabled={st === 'busy'} style={{ width: '100%', height: '100%', border: 0, background: '#56ddab', borderRadius: cq(10), color: '#fff', fontSize: cq(14), fontWeight: 500, cursor: 'pointer' }}>{st === 'busy' ? 'Enviando…' : 'Enviar'}</button>
      </Abs>
      <Txt x={13} y={451} w={375} h={23} size={14} weight={500} color="#000" align="c"><span role="status" aria-live="polite" style={{ color: err ? '#b42318' : '#000' }}>{err || (st === 'ok' ? 'Mensagem enviada. Respondemos o mais rápido possível.' : 'Sua mensagem será respondida o mais rápido possivel.')}</span></Txt>
    </>
  )
}
