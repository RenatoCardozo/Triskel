import { sha256 } from './crypto'
import { fdt } from './dates'
import { exLine } from './exclusivity'
import { brl, FEE_PCT } from './money'

export type Block =
  | { t: 'kv'; h: string; rows: Array<[string, string]> }
  | { t: 'p'; x: string }
  | { t: 'h'; x: string }

export interface PartyContractor { nome: string; doc: string; resp: string; cidade: string; uf: string; mail?: string; ag: boolean; cli: string; seg: string }
export interface PartyCreator { nome: string; doc: string; nasc?: string; cidade: string; uf: string; mail?: string; insta?: string }
export interface ContractInput {
  num: string
  dt: Date
  k: PartyContractor
  c: PartyCreator
  videos: number
  format: string
  campaignName: string
  objective?: string
  delivery: Date
  imageUse: string
  exclusiveDays: number
  valueCents: number
  feeCents: number
  totalCents: number
}
export interface ContractModel {
  num: string
  dt: string // ISO
  k: PartyContractor
  c: PartyCreator
  B: Block[]
  hash: string
  valueCents: number
  feeCents: number
  totalCents: number
}

/** Modelo do contrato (11 cláusulas, texto do protótipo ctr.js). Usado na tela e no PDF. */
export function buildContractModel(i: ContractInput): ContractModel {
  const { k, c } = i
  const loc = (x: { cidade: string; uf: string }) => [x.cidade, x.uf].filter(Boolean).join('/')
  const ag = k.ag && k.cli ? `, agência atuando em nome e por conta do cliente ${k.cli}` : ''
  const vids = i.videos || 1
  const exPz = i.exclusiveDays ? i.delivery : null
  const exFim = exPz ? new Date(exPz.getTime() + i.exclusiveDays * 86_400_000) : null
  const B: Block[] = []
  B.push({ t: 'kv', h: 'Partes', rows: [
    ['CONTRATANTE', k.nome + ag], ['CNPJ', k.doc || '—'], ['Representante legal', k.resp || '—'], ['Sede', loc(k) || '—'], ...(k.mail ? [['E-mail', k.mail] as [string, string]] : []),
    ['CONTRATADO(A)', c.nome], ['CPF', c.doc || '—'], ...(c.nasc ? [['Nascimento', c.nasc] as [string, string]] : []), ['Residência', loc(c) || '—'],
    ...(c.mail ? [['E-mail', c.mail] as [string, string]] : []), ...(c.insta ? [['Perfil principal', c.insta] as [string, string]] : []),
    ['INTERVENIENTE', 'Triskel, plataforma que intermedeia a negociação, mantém o valor em custódia e registra as assinaturas eletrônicas'],
  ] })
  B.push({ t: 'p', x: 'As partes acima, identificadas pelos dados cadastrados na plataforma Triskel, firmam este contrato de prestação de serviços de criação de conteúdo, que se rege pelas cláusulas a seguir.' })
  B.push({ t: 'h', x: 'Cláusula 1 · Objeto' })
  B.push({ t: 'p', x: `1.1 O CONTRATADO(A) produzirá ${vids} ${vids > 1 ? 'vídeos' : 'vídeo'} no formato ${i.format || 'Reels 9:16'} para a campanha “${i.campaignName || '—'}”${i.objective ? ', com o objetivo de ' + i.objective.toLowerCase() : ''}, conforme o briefing enviado pela plataforma e aceito pelas partes.` })
  B.push({ t: 'p', x: '1.2 O briefing, as condições negociadas e o histórico de propostas e contrapropostas ficam registrados na Triskel e integram este contrato.' })
  B.push({ t: 'h', x: 'Cláusula 2 · Prazo, entrega e revisões' })
  B.push({ t: 'p', x: `2.1 A entrega do conteúdo será feita pela plataforma até ${fdt(i.delivery)}.` })
  B.push({ t: 'p', x: '2.2 O conteúdo passa pela análise da inteligência artificial da Triskel, que apoia a conferência do briefing. A decisão final de aprovar ou pedir ajustes é humana e cabe ao CONTRATANTE.' })
  B.push({ t: 'p', x: '2.3 O CONTRATANTE pode pedir até 2 rodadas de ajustes. Depois da aprovação, o CONTRATADO(A) publica o conteúdo e a Triskel confirma a publicação.' })
  B.push({ t: 'h', x: 'Cláusula 3 · Valor e pagamento' })
  B.push({ t: 'p', x: `3.1 O valor devido ao CONTRATADO(A) é de ${brl(i.valueCents)}.` })
  B.push({ t: 'p', x: `3.2 A taxa de serviço da Triskel é de ${FEE_PCT}% do valor do CONTRATADO(A), ou ${brl(i.feeCents)}, paga pelo CONTRATANTE e somada ao valor. O total pago pelo CONTRATANTE é de ${brl(i.totalCents)}. A taxa não é descontada do CONTRATADO(A).` })
  B.push({ t: 'p', x: '3.3 O pagamento é feito com o saldo da carteira do CONTRATANTE na Triskel e fica em custódia. É liberado para a carteira do CONTRATADO(A) depois da aprovação da entrega e da confirmação da publicação.' })
  B.push({ t: 'h', x: 'Cláusula 4 · Uso de imagem e conteúdo' })
  B.push({ t: 'p', x: `4.1 O CONTRATADO(A) autoriza o uso do conteúdo e da sua imagem pelo CONTRATANTE por ${i.imageUse}, a contar da publicação, nas redes Instagram e TikTok. Outros usos ou prazos maiores dependem de novo acordo pela plataforma.` })
  B.push({ t: 'p', x: '4.2 O CONTRATADO(A) declara que o conteúdo é original e que tem direito de usar músicas, imagens e demais materiais nele incluídos.' })
  B.push({ t: 'h', x: 'Cláusula 5 · Exclusividade' })
  B.push({ t: 'p', x: i.exclusiveDays && exPz && exFim ? `5.1 Este contrato tem exclusividade de ${i.exclusiveDays} dias, de ${fdt(exPz)} até ${fdt(exFim)}${k.seg ? ', no ramo ' + k.seg : ''}. Nesse período o CONTRATADO(A) não fecha nem publica campanhas de marcas do mesmo ramo ou de ramos relacionados. A Triskel bloqueia propostas e candidaturas que gerem esse conflito.` : '5.1 Este contrato não tem exclusividade.' })
  B.push({ t: 'h', x: 'Cláusula 6 · Publicidade e transparência' })
  B.push({ t: 'p', x: '6.1 O conteúdo deve indicar de forma clara que se trata de publicidade (por exemplo, #publi), conforme as boas práticas de publicidade digital.' })
  B.push({ t: 'h', x: 'Cláusula 7 · Comunicação dentro da plataforma' })
  B.push({ t: 'p', x: '7.1 Toda a negociação, as mensagens, as entregas e os pagamentos acontecem dentro da Triskel. As partes não trocam telefone, e-mail, links ou redes sociais para tratar deste contrato.' })
  B.push({ t: 'h', x: 'Cláusula 8 · Cancelamento e descumprimento' })
  B.push({ t: 'p', x: '8.1 Se a entrega não ocorrer no prazo, o CONTRATANTE pode notificar o CONTRATADO(A) pela plataforma e, persistindo o atraso, pedir o encerramento do contrato, com o tratamento do valor em custódia definido pelas regras da Triskel.' })
  B.push({ t: 'p', x: '8.2 Aprovada a entrega e confirmada a publicação pela Triskel, o valor em custódia é liberado para a carteira do CONTRATADO(A).' })
  B.push({ t: 'h', x: 'Cláusula 9 · Dados pessoais' })
  B.push({ t: 'p', x: '9.1 Os dados pessoais usados neste contrato são tratados conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018) e a Política de privacidade da Triskel, apenas para executar o contrato e cumprir obrigações legais.' })
  B.push({ t: 'h', x: 'Cláusula 10 · Assinatura eletrônica' })
  B.push({ t: 'p', x: '10.1 As partes reconhecem como válida a assinatura eletrônica registrada pela Triskel, feita depois do acesso autenticado à conta e do aceite expresso destes termos, nos termos do art. 10, §2º, da Medida Provisória 2.200-2/2001. O registro inclui nome, documento, data e hora, código de autenticação e o hash SHA-256 do conteúdo do contrato.' })
  B.push({ t: 'h', x: 'Cláusula 11 · Foro' })
  B.push({ t: 'p', x: `11.1 Fica eleito o foro da comarca de ${k.cidade || 'Pelotas'}${k.uf ? '/' + k.uf : ''} para resolver dúvidas deste contrato, depois de tentada a solução amigável pela plataforma.` })
  const dt = i.dt.toISOString()
  const hash = sha256(JSON.stringify([i.num, dt, B]))
  return { num: i.num, dt, k, c, B, hash, valueCents: i.valueCents, feeCents: i.feeCents, totalCents: i.totalCents }
}
export { exLine }

export interface Signature { nome: string; org: string; doc: string; papel: string; dt: string; cod: string }
export function sigCode(hash: string, role: 'k' | 'c', s: { nome: string; doc: string; dt: string }): string {
  return (sha256(`${hash}|${role}|${s.nome}|${s.doc}|${s.dt}`).slice(0, 12).toUpperCase().match(/.{4}/g) as string[]).join('-')
}
/** Assinatura de uma parte: nome (representante legal para o contratante), documento, data/hora e código de autenticação. */
export function makeSignature(m: ContractModel, role: 'k' | 'c', dt: Date): Signature {
  const P = role === 'k' ? m.k : m.c
  const base = { nome: role === 'k' ? (m.k.resp || m.k.nome) : m.c.nome, doc: P.doc, dt: dt.toISOString() }
  return { ...base, org: role === 'k' ? m.k.nome : '', papel: role === 'k' ? 'Contratante' : 'Contratado(a)', cod: sigCode(m.hash, role, base) }
}
