'use client'
import { useState } from 'react'
import { post } from '@/lib/api'
import { applyApiError } from '@/lib/forms'
import { useMe } from '@/hooks/queries'
import { Button, Card, ErrorState, Note, PageSkeleton, Title } from '@/components/ui'
import { Select, Textarea } from '@/components/ui/form'
import { Facts } from '@/components/domain'

const SAME: Array<[string, string]> = [
  ['Posso negociar fora da plataforma?', 'Não. Toda negociação, contrato, entrega e pagamento acontecem dentro da Triskel. Isso protege as duas partes e guarda o histórico para a avaliação.'],
  ['Quem vê o meu telefone e o meu e-mail?', 'Ninguém. Eles não aparecem no perfil. A conversa entre as partes acontece pelo chat da Triskel.'],
]
const FAQ: Record<string, Array<[string, string]>> = {
  CREATOR: [['Como recebo o pagamento?', 'Depois que o contratante aprova a entrega, o pagamento é liberado e você recebe um aviso por e-mail.'], ['O que a IA analisa no meu vídeo?', 'Ela compara o vídeo com o briefing: logo, produto, duração, áudio e conteúdo humanizado. É um apoio, a decisão final é do contratante.'], ['Posso negociar o valor de uma proposta?', 'Sim. Em “Negociar proposta” você envia uma contraproposta com valor, prazo e uso de imagem.'], ...SAME, ['Como altero os meus dados?', 'Em Perfil, escolha Editar perfil, Editar valores, Trocar número, e-mail ou senha.']],
  BUSINESS: [['Como encontro o criador ideal?', 'Em Buscar criadores, use os filtros e veja as recomendações da IA com a porcentagem de compatibilidade.'], ['Quando o pagamento é liberado?', 'Depois que você aprova a entrega do criador e a Triskel confirma a publicação. Você recebe a confirmação por e-mail.'], ['A IA decide se aprovo o vídeo?', 'Não. O relatório da IA é um apoio; você pode aprovar, pedir ajustes ou ignorar a sugestão.'], ['Como peço ajustes ao criador?', 'Na revisão da entrega, escolha “Pedir ajustes” e escreva o comentário.'], ...SAME],
  AGENCY: [['Como cadastro um novo cliente?', 'Em Meus clientes, toque em “+ Cadastrar cliente” e informe o nome e o segmento.'], ['Posso contratar vários criadores numa campanha?', 'Sim. Em Selecionar criadores, marque quantos quiser e envie os convites de uma vez.'], ['Quem aprova a entrega?', 'A agência revisa o relatório da IA e aprova ou pede ajustes em nome do cliente.'], ...SAME, ['Como altero os dados da agência?', 'Em Perfil, escolha Editar perfil, Trocar número, e-mail ou senha.']],
}
const GENERAL: Array<[string, string]> = [
  ['Posso negociar ou combinar algo fora da Triskel?', 'Não. Propostas, contrapropostas, mensagens, contrato e pagamento acontecem só na plataforma, e é isso que protege o valor em custódia. Mensagens com telefone, e-mail, links ou redes sociais são bloqueadas.'],
  ['Qual é a taxa da Triskel?', '10% sobre o valor do criador, paga por quem contrata. Ela aparece na proposta, na contraproposta e no contrato, e não é descontada do que o criador recebe.'],
]
const SUBJ = ['Dúvida sobre a plataforma', 'Pagamentos e carteira', 'Contratos e entregas', 'Problema com a conta', 'Privacidade e dados (LGPD)', 'Sugestão ou elogio', 'Outro assunto']
const PROFILE = { CREATOR: 'Criador de conteúdo', BUSINESS: 'Comércio', AGENCY: 'Agência' }

export default function Ajuda() {
  const me = useMe(); const [msg, setMsg] = useState(''); const [subj, setSubj] = useState(SUBJ[0]); const [err, setErr] = useState(''); const [ok, setOk] = useState(''); const [busy, setBusy] = useState(false)
  if (me.isPending) return <PageSkeleton />
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />
  const u = me.data
  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setOk('')
    if (msg.trim().length < 10) return setErr('Descreva o problema com pelo menos 10 caracteres.')
    setBusy(true)
    try { const r = await post<{ protocol: string }>('contact', { name: u.name, email: u.email, profile: PROFILE[u.role], subject: subj, message: msg.trim() }); setOk(`Mensagem enviada. Protocolo ${r.protocol}. Respondemos em até 1 dia útil.`); setMsg('') } catch (x) { setErr(applyApiError(x)) } finally { setBusy(false) }
  }
  const Q = ({ q, a }: { q: string; a: string }) => <details className="card !p-0"><summary className="cursor-pointer p-4 font-extrabold text-ink">{q}</summary><p className="px-4 pb-4 text-[15px] text-[#3b4476]">{a}</p></details>
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Title>Ajuda e suporte</Title>
      <section aria-labelledby="pf"><h2 id="pf" className="h-sec mb-2">Perguntas frequentes</h2><div className="space-y-2">{[...FAQ[u.role], ...GENERAL].map(([q, a]) => <Q key={q} q={q} a={a} />)}</div></section>
      <section aria-labelledby="fg"><h2 id="fg" className="h-sec mb-2">Fale com a gente</h2>
        <Card className="space-y-4"><Facts cols={3} items={[['E-mail', 'suporte@triskel.com.br'], ['Atendimento', 'Seg a sex, 9h às 18h'], ['Resposta', 'Em até 1 dia útil']]} />
          <form noValidate onSubmit={send} className="space-y-4"><Select label="Assunto" options={SUBJ} value={subj} onChange={(e) => setSubj(e.target.value)} placeholder="Selecione" /><Textarea label="Descreva o problema" rows={4} maxLength={2000} placeholder="Conte o que aconteceu" value={msg} onChange={(e) => setMsg(e.target.value)} />
            {err && <Note tone="danger" role="alert">{err}</Note>}{ok && <Note tone="ok" role="status">{ok}</Note>}<Button type="submit" block loading={busy}>Enviar mensagem</Button></form></Card></section>
    </div>
  )
}
