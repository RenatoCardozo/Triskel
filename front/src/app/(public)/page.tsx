import Image from 'next/image'
import Link from 'next/link'
import { AboutCard, HomeContact } from '@/components/HomeClient'
import { Petals } from '@/components/Logo'
import { NewsCard } from '@/components/NewsCard'
import { PublicFooter } from '@/components/PublicChrome'
import { Abs, AbsLink, Stage, Txt, cq } from '@/components/Stage'
import { getNews } from '@/lib/news'

export const metadata = { title: 'Triskel · Plataforma de criadores' }

const GR = 'linear-gradient(90deg,#3cd4c7,#5fe0a1)'
const SH = `${cq(4)} ${cq(4)} ${cq(4)} rgba(204,204,204,.25)`
const INK = '#4c5cca'

const AUDIENCES = [
  { emoji: '🎬', bg: '#2dd450', t: 'Criadores de conteúdo', d: 'Receba propostas, monte seu portfólio e construa reputação.' },
  { emoji: '🏪', bg: '#2dd4bf', t: 'Comércios e negócios', d: 'Encontre criadores por nicho, cidade e orçamento disponível.' },
  { emoji: '📈', bg: '#2d7ad4', t: 'Agências de marketing', d: 'Gerencie múltiplos clientes e campanhas em um só painel.' },
]
// [rótulo, x, y, largura] — posições do Figma (faixa turquesa)
const CHIPS: [string, number, number, number][] = [
  ['Gênero', 202, 125, 64], ['Redes Sociais', 311, 93, 84], ['Tamanho da Audiência', 285, 125, 119], ['Orçamento', 178, 160, 82],
  ['Tipo de Conteúdo', 280, 160, 115], ['Tipo de Conteúdo', 187, 93, 102], ['Faixa etária', 174, 62, 86], ['Localização / Região', 280, 62, 109],
]
const STEPS = [['Crie seu perfil', 'Cadastro rápido por tipo de usuário.'], ['Encontre o match', 'Filtros e seleção de videos por IA.'], ['Negocie e envie o briefing', 'Tudo dentro da plataforma.'], ['Acompanhe e avalie', 'Histórico de parcerias real.']]

export default async function Home() {
  const news = await getNews(2)
  return (
    <>
      {/* Hero */}
      <div style={{ background: '#fff', overflow: 'hidden', paddingTop: 7 }}>
        <Stage h={400}>
          <Abs x={-12} y={80} w={218} h={207} style={{ opacity: 0.15 }}><div style={{ width: '100%', height: '100%' }} className="tk-petalbg"><Petals size={218} /></div></Abs>
          <Abs x={186} y={28} w={226} h={334}><Image src="/img/hero.webp" alt="Criadora de conteúdo gravando um vídeo com a câmera em um tripé" width={452} height={668} priority unoptimized style={{ width: '100%', height: '100%' }} /></Abs>
          <Abs x={10} y={-27} w={216} h={303} style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: cq(22), fontWeight: 900, lineHeight: 1.25, color: INK, letterSpacing: 0 }}>Encontre o <span style={{ color: '#31ccbf' }}>criador certo</span> para impulsionar o crescimento do seu negócio.</h1>
          </Abs>
          <Txt x={10} y={160} w={196} h={192} size={14} weight={300} color="#4b5dca" style={{ alignItems: 'center' }}>A Triskel conecta criadores de conteúdo, nano e micro influenciadores a comércios e agências — do primeiro contato ao pagamento, em um só lugar.</Txt>
          <AbsLink x={20} y={345} w={175} h={34} href="/cadastro" style={{ background: GR, borderRadius: cq(10), color: '#fff', fontSize: cq(14), fontWeight: 500 }}>Começar gratuitamente</AbsLink>
          <AbsLink x={217} y={346} w={175} h={34} href="#como-funciona" style={{ background: '#f6fbfa', borderRadius: cq(10), color: INK, fontSize: cq(14), fontWeight: 400 }}>Ver como funciona</AbsLink>
        </Stage>
      </div>

      {/* Para quem é */}
      <div style={{ background: '#f6fbfa' }}>
        <Stage h={510}>
          <Txt x={15} y={13} w={382} h={21} size={14} weight={600} color="#2dd4bf" align="c">Para quem é</Txt>
          <Txt x={16} y={34} w={380} h={33} size={20} weight={900} color="#4c5dca" align="c" as="h2">Um ecossistema para três públicos</Txt>
          <Txt x={16} y={67} w={380} h={50} size={14} weight={600} color="#2dd4bf" align="c">Cadastro simples, feito sob medida para cada tipo de usuário.</Txt>
          {AUDIENCES.map((a, i) => {
            const y = 123 + i * 130
            return (
              <div key={a.t}>
                <Abs x={25} y={y} w={362} h={115} style={{ background: '#fff', borderRadius: cq(15), boxShadow: SH }} />
                <Abs x={36} y={y + 8} w={50} h={50} style={{ background: a.bg, borderRadius: cq(10), display: 'grid', placeItems: 'center', fontSize: cq(32) }}><span aria-hidden="true">{a.emoji}</span></Abs>
                <Txt x={98} y={y + 8} w={280} h={50} size={20} weight={700} color={INK} as="h3">{a.t}</Txt>
                <Txt x={36} y={y + 72} w={340} h={34} size={12} weight={300} color="#4b5dca">{a.d}</Txt>
              </div>
            )
          })}
        </Stage>
      </div>

      {/* Filtros (faixa turquesa) */}
      <div style={{ background: '#3bbeb8' }}>
        <Stage h={206}>
          <Abs x={21} y={0} w={153} h={206}><Image src="/img/flt.webp" alt="" width={153} height={206} unoptimized style={{ width: '100%', height: '100%' }} /></Abs>
          <Txt x={159} y={7} w={250} h={55} size={14} weight={700} color="#fff">Personalize sua busca e encontre o criador ideal para sua campanha</Txt>
          {CHIPS.map(([t, x, y, w], i) => (
            <Abs key={i} x={x} y={y} w={w} h={20} style={{ border: `${cq(1)} solid #fff`, background: '#3bbeb8', borderRadius: cq(5), display: 'grid', placeItems: 'center', color: '#fff', fontSize: cq(10), fontWeight: 400, whiteSpace: 'nowrap' }}>{t}</Abs>
          ))}
        </Stage>
      </div>

      {/* Como funciona + CTA */}
      <div id="como-funciona" style={{ background: '#fff', scrollMarginTop: 8 }}>
        <Stage h={843}>
          <Txt x={15} y={0} w={382} h={21} size={14} weight={600} color="#2dd4bf" align="c">Como funciona</Txt>
          <Txt x={16} y={23} w={380} h={33} size={19} weight={900} color={INK} align="c" as="h2">Do match ao pagamento, em 4 passos</Txt>
          {STEPS.map(([t, d], i) => {
            const y = 69 + i * 129
            return (
              <div key={t}>
                <Abs x={25} y={y} w={362} h={115} style={{ background: '#f6fbfa', border: `${cq(1)} solid #2dd4bf`, borderRadius: cq(15) }} />
                <Abs x={36} y={y + 7} w={50} h={50} style={{ background: 'linear-gradient(180deg,#2db1d4,#2dd4bf)', borderRadius: cq(10), display: 'grid', placeItems: 'center', color: '#fff', fontSize: cq(19), fontWeight: 900 }}>{i + 1}</Abs>
                <Txt x={97} y={y + 7} w={280} h={50} size={20} weight={700} color={INK} as="h3">{t}</Txt>
                <Txt x={36} y={y + 72} w={340} h={34} size={12} weight={300} color="#4b5dca">{d}</Txt>
              </div>
            )
          })}
          <Abs x={15} y={632} w={382} h={191} style={{ background: 'linear-gradient(180deg,#2dd450,#2dd4bf)', borderRadius: cq(20) }} />
          <Txt x={15} y={650} w={382} h={33} size={20} weight={900} color="#fff" align="c" as="h2">Pronto para começar?</Txt>
          <Txt x={40} y={690} w={332} h={50} size={14} weight={500} color="#fff" align="c">Crie sua conta gratuitamente e encontre sua próxima parceria hoje mesmo.</Txt>
          <AbsLink x={37} y={759} w={151} h={40} href="/cadastro" style={{ background: '#fff', borderRadius: cq(20), color: '#0f8f7d', fontSize: cq(14), fontWeight: 500 }}>Criar conta grátis</AbsLink>
          <AbsLink x={227} y={759} w={151} h={40} href="/login" style={{ border: `${cq(1)} solid #fff`, borderRadius: cq(20), color: '#fff', fontSize: cq(14), fontWeight: 500 }}>Já tenho conta</AbsLink>
        </Stage>
      </div>

      {/* Sobre nós */}
      <section id="sobre" className="tk-ab">
        <p className="eb">Sobre nós</p>
        <h2>Triskel: conectando quem cria com quem precisa ser visto.</h2>
        <AboutCard />
      </section>

      {/* Contato */}
      <div style={{ background: '#f6fbfa' }}>
        <Stage h={507}><HomeContact /></Stage>
      </div>

      {/* Notícias */}
      <section style={{ background: '#fff', padding: '28px 16px 32px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ margin: 0, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#2dd4bf' }}>Notícias</p>
          <h2 style={{ margin: '4px 0 18px', textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#4c5dca' }}>Novidades do mercado de criadores</h2>
          {news?.articles.length ? <div style={{ display: 'grid', gap: 14 }}>{news.articles.map((n, i) => <NewsCard key={n.slug} n={n} i={i} />)}</div> : <p style={{ textAlign: 'center', color: '#4b5dca' }}>Não foi possível carregar as notícias agora.</p>}
          <div style={{ textAlign: 'center', marginTop: 20 }}><Link href="/noticias" className="btn btn-outline" style={{ fontWeight: 500 }}>Ver mais notícias</Link></div>
        </div>
      </section>
      <PublicFooter />
    </>
  )
}
