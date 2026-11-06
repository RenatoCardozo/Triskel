import Image from 'next/image'
import Link from 'next/link'
import { NewsCard } from '@/components/NewsCard'
import { getNews } from '@/lib/news'

export const metadata = { title: 'Triskel · Plataforma de criadores' }

const AUDIENCES = [
  { emoji: '🎬', bg: '#5fe0a1', t: 'Criadores de conteúdo', d: 'Receba propostas, monte seu portfólio e construa reputação.' },
  { emoji: '🏪', bg: '#7b8be8', t: 'Comércios e negócios', d: 'Encontre criadores por nicho, cidade e orçamento disponível.' },
  { emoji: '📈', bg: '#f2b84b', t: 'Agências de marketing', d: 'Gerencie múltiplos clientes e campanhas em um só painel.' },
]
const FILTERS = ['Gênero', 'Redes Sociais', 'Tamanho da Audiência', 'Orçamento', 'Tipo de Conteúdo', 'Faixa etária', 'Localização / Região']
const STEPS = [['Crie seu perfil', 'Cadastro rápido por tipo de usuário.'], ['Encontre o match', 'Filtros e seleção de videos por IA.'], ['Negocie e envie o briefing', 'Tudo dentro da plataforma.'], ['Acompanhe e avalie', 'Histórico de parcerias real.']]

export default async function Home() {
  const news = await getNews(2)
  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-10 md:grid-cols-2 md:py-16">
          <div>
            <h1 className="text-[32px] font-extrabold leading-[1.15] md:text-5xl">Encontre o <span className="text-teal">criador certo</span> para impulsionar o crescimento do seu negócio.</h1>
            <p className="mt-4 max-w-xl text-[17px] text-ink-2">A Triskel conecta criadores de conteúdo, nano e micro influenciadores a comércios e agências — do primeiro contato ao pagamento, em um só lugar.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cadastro" className="btn btn-primary">Começar gratuitamente</Link>
              <a href="#como-funciona" className="btn btn-ghost bg-surface">Ver como funciona</a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[420px]"><Image src="/img/hero.webp" alt="Criadora de conteúdo gravando um vídeo com a câmera em um tripé" width={864} height={1240} priority unoptimized className="h-auto w-full" /></div>
        </div>
      </section>

      <section className="bg-surface px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Para quem é</p>
          <h2 className="mt-1 text-center text-2xl font-extrabold md:text-3xl">Um ecossistema para três públicos</h2>
          <p className="mx-auto mt-2 max-w-md text-center font-semibold text-teal">Cadastro simples, feito sob medida para cada tipo de usuário.</p>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <li key={a.t} className="card">
                <div className="flex items-center gap-3"><span aria-hidden="true" className="grid h-14 w-14 place-items-center rounded-2xl text-2xl" style={{ background: a.bg }}>{a.emoji}</span><h3 className="text-xl font-extrabold">{a.t}</h3></div>
                <p className="mt-3 text-[15px] text-ink-2">{a.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-extrabold md:text-3xl">Personalize sua busca e encontre o criador ideal para sua campanha</h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Filtros disponíveis na busca">{FILTERS.map((f) => <li key={f} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-bold text-ink">{f}</li>)}</ul>
          <Link href="/cadastro" className="btn btn-outline mt-6">Criar conta para buscar</Link>
        </div>
      </section>

      <section id="como-funciona" className="bg-surface px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Como funciona</p>
          <h2 className="mt-1 text-center text-2xl font-extrabold md:text-3xl">Do match ao pagamento, em 4 passos</h2>
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="card text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-gradient-to-r from-teal-2 to-mint text-lg font-extrabold text-white">{i + 1}</span><h3 className="mt-3 text-lg font-extrabold">{t}</h3><p className="cap mt-1 text-[14.5px]">{d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-gradient-to-br from-mint to-teal-2 p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold !text-white md:text-3xl">Pronto para começar?</h2>
          <p className="mt-2 text-white/95">Crie sua conta gratuitamente e encontre sua próxima parceria hoje mesmo.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/cadastro" className="btn bg-white text-tealtext">Criar conta grátis</Link><Link href="/login" className="btn border-white/80 text-white hover:bg-white/10">Já tenho conta</Link></div>
        </div>
      </section>

      <section id="sobre" className="bg-white px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Sobre nós</p>
          <h2 className="mt-1 text-center text-2xl font-extrabold">Triskel: conectando quem cria com quem precisa ser visto.</h2>
          <div className="mt-5 space-y-4 text-[16px] leading-relaxed text-[#56608f]">
            <p>Na Triskel, acreditamos que a autenticidade é a nova moeda do marketing. Em um mundo saturado de publicidade tradicional, sabemos que as pessoas confiam mais em pessoas — e é por isso que existimos.</p>
            <p>Nascemos da constatação de que o mercado de marketing de influência, apesar de crescer rapidamente, ainda funciona de forma desorganizada: conversas espalhadas entre redes sociais e aplicativos de mensagens, negociações sem padrão, briefings incompletos e nenhuma forma clara de avaliar quem é confiável. Esse cenário prejudica dois lados que, na verdade, precisam um do outro — pequenos comércios que querem se comunicar de forma mais próxima e genuína com seu público, e criadores de conteúdo UGC, nano e micro influenciadores que buscam oportunidades reais de trabalho.</p>
            <p>A Triskel é a plataforma que conecta esses dois mundos. Unimos criadores de conteúdo, pequenos e médios negócios e agências de marketing em um único ambiente, estruturando todo o processo — da busca e negociação ao envio de briefings, acompanhamento de entregas e avaliação de resultados. Com o apoio de inteligência artificial, ajudamos a recomendar os criadores mais compatíveis com cada campanha e a analisar a qualidade das entregas, tornando o processo mais rápido, transparente e confiável.</p>
            <p>Nosso propósito vai além da tecnologia: queremos democratizar o acesso ao marketing de influência, mostrando que campanhas autênticas e de impacto não são privilégio apenas de grandes marcas. Acreditamos no potencial dos pequenos negócios e na força criativa dos criadores locais — e trabalhamos para fortalecer esse ecossistema, uma conexão de cada vez.</p>
          </div>
        </div>
      </section>

      <section className="bg-surface px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-extrabold">Ficou com alguma dúvida ou precisa de ajuda?</h2>
          <p className="cap mt-1">Sua mensagem será respondida o mais rápido possível.</p>
          <Link href="/fale-conosco" className="btn btn-primary mt-4">Falar com a gente</Link>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Notícias</p>
          <h2 className="mt-1 text-center text-2xl font-extrabold">Novidades do mercado de criadores</h2>
          {news?.articles.length ? <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">{news.articles.map((n) => <NewsCard key={n.slug} n={n} />)}</div> : <p className="cap mt-6 text-center">Não foi possível carregar as notícias agora.</p>}
          <div className="mt-6 text-center"><Link href="/noticias" className="btn btn-outline">Ver mais notícias</Link></div>
        </div>
      </section>
    </>
  )
}
