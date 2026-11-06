import Link from 'next/link'
import { NewsCard } from '@/components/NewsCard'
import { getNews } from '@/lib/news'

export const metadata = { title: 'Notícias' }
const ORDER = ['Mercado de influenciadores', 'Publicidade', 'Pequenos negócios', 'Tecnologia e IA', 'Regras e boas práticas']

export default async function Noticias({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const cat = (await searchParams).categoria
  const all = await getNews()
  const shown = all ? all.articles.filter((n) => !cat || n.category === cat) : []
  const cats = all ? ORDER.filter((c) => all.categories.includes(c)).concat(all.categories.filter((c) => !ORDER.includes(c))) : []
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="h-title">Notícias</h1>
      <p className="h-sub mt-1">Novidades sobre influenciadores, publicidade e negócios. As mais recentes aparecem primeiro.</p>
      <nav aria-label="Categorias" className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/noticias" className="chip no-underline" aria-current={!cat ? 'true' : undefined}>Todas</Link>
        {cats.map((c) => <Link key={c} href={`/noticias?categoria=${encodeURIComponent(c)}`} className="chip no-underline" aria-current={cat === c ? 'true' : undefined}>{c}</Link>)}
      </nav>
      {!all ? <div role="alert" className="card mt-6 text-center">Não foi possível carregar as notícias agora. <Link className="link" href="/noticias">Tentar de novo</Link></div>
        : <>
          <p className="cap mt-6" aria-live="polite">{shown.length} {shown.length === 1 ? 'notícia' : 'notícias'}</p>
          {shown.length ? <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">{shown.map((n) => <NewsCard key={n.slug} n={n} />)}</div> : <div className="card mt-3 text-center">Nenhuma notícia nesta categoria.</div>}
        </>}
      <div className="mt-8 text-center"><Link href="/" className="btn btn-outline">Voltar ao início</Link></div>
    </div>
  )
}
