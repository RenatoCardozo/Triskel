import Link from 'next/link'

export const metadata = { title: 'Informações da empresa' }
const STEPS: Array<[string, string]> = [['Perfil', 'Cada pessoa monta o seu perfil e valida o e-mail.'], ['Encontro', 'A IA recomenda os criadores mais compatíveis com a campanha.'], ['Contrato', 'Briefing, valor, prazo, revisões e uso de imagem no mesmo lugar.'], ['Entrega', 'O contratante revisa e aprova; a IA apoia a análise.'], ['Pagamento', 'O valor em custódia é liberado ao criador depois da aprovação e da confirmação da publicação.'], ['Avaliação', 'As duas partes se avaliam e constroem reputação.']]
const WHO: Array<[string, string, string]> = [['Criadores de conteúdo', 'UGC, nano e micro influenciadores', 'Receba propostas reais, com valor e prazo claros e pagamento garantido em custódia.'], ['Pequenos e médios negócios', 'Comércio local', 'Encontre criadores da sua região e fale com o seu público de forma mais próxima e genuína.'], ['Agências de marketing', 'Gestão de clientes e campanhas', 'Organize clientes, campanhas e criadores contratados em um único painel.']]
const PAY = ['Comércio e agência pagam com o saldo da carteira, que recebe recargas por Pix ou cartão.', 'O valor do contrato fica em custódia e só é liberado ao criador quando a entrega é aprovada e a Triskel confirma a publicação do post.', 'Taxa de serviço de 10% sobre o valor do contrato, paga pelo contratante.', 'O criador saca o saldo disponível por Pix, sem taxa de saque.', 'Valor, taxa e total aparecem em cada proposta, contraproposta e contrato.', 'Negociação e contato só dentro da plataforma: telefone, e-mail e links são bloqueados nas mensagens.']

export default function Empresa() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-10">
      <header><h1 className="h-title">Informações da empresa</h1><p className="h-sub mt-1">Conectamos criadores de conteúdo, pequenos negócios e agências em um só lugar.</p></header>
      <section className="card"><h2 className="h-sec">Nosso propósito</h2><p className="mt-1 text-[15px]">Democratizar o acesso ao marketing de influência. Campanhas autênticas e de impacto não são privilégio de grandes marcas: acreditamos no potencial dos pequenos negócios e na força criativa dos criadores locais.</p></section>
      <section className="card space-y-2"><h2 className="h-sec">O que a Triskel faz</h2><p className="text-[15px]">O mercado de influência cresce rápido, mas ainda é desorganizado: conversas espalhadas entre redes e aplicativos de mensagem, negociações sem padrão, briefings incompletos e nenhuma forma clara de saber quem é confiável.</p><p className="text-[15px]">A Triskel reúne tudo em um único ambiente: da busca e da negociação ao briefing, à entrega, ao pagamento e à avaliação.</p></section>
      <section aria-labelledby="como"><h2 id="como" className="h-sec mb-2">Como funciona</h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">{STEPS.map(([t, d], i) => <li key={t} className="card flex gap-3"><span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-r from-teal-2 to-mint font-extrabold text-white">{i + 1}</span><div><b className="text-ink">{t}</b><p className="cap">{d}</p></div></li>)}</ol></section>
      <section aria-labelledby="quem"><h2 id="quem" className="h-sec mb-2">Para quem é</h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">{WHO.map(([t, s, d]) => <li key={t} className="card"><b className="text-ink">{t}</b><p className="text-xs font-bold text-tealtext">{s}</p><p className="cap mt-1">{d}</p></li>)}</ul></section>
      <section className="card"><h2 className="h-sec">Pagamentos com segurança</h2><ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px]">{PAY.map((p) => <li key={p}>{p}</li>)}</ul></section>
      <section className="card"><h2 className="h-sec">Inteligência artificial com decisão humana</h2><p className="mt-1 text-[15px]">A IA ajuda a recomendar criadores compatíveis e a analisar a qualidade das entregas, mas é apenas apoio: <b>a decisão final é sempre de uma pessoa</b>.</p></section>
      <section className="card" aria-labelledby="dados"><h2 id="dados" className="h-sec">Dados institucionais</h2>
        <dl className="mt-2 grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-2">{[['Nome fantasia', 'Triskel'], ['Razão social', 'A definir'], ['CNPJ', 'A definir'], ['Endereço', 'A definir'], ['E-mail', 'suporte@triskel.com.br'], ['Atendimento', 'Seg a sex, 9h às 18h']].map(([k, v]) => <div key={k}><dt className="lbl">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl></section>
      <div className="flex flex-wrap justify-center gap-3"><Link href="/fale-conosco" className="btn btn-primary">Fale conosco</Link><Link href="/" className="btn btn-outline">Voltar ao início</Link></div>
    </div>
  )
}
