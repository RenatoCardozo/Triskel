import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NewsCard } from '@/components/NewsCard'
import { CAT_EMOJI, getArticle, longDate } from '@/lib/news'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug)
  return { title: a?.article.title ?? 'Notícia' }
}

export default async function Noticia({ params }: { params: Promise<{ slug: string }> }) {
  const r = await getArticle((await params).slug)
  if (!r) notFound()
  const { article: a, related } = r
  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center gap-2"><span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-ok-bg text-xl">{CAT_EMOJI[a.category] ?? '📰'}</span><span className="pl pl-ink">{a.category}</span></div>
      <h1 className="mt-3 text-[28px] font-extrabold leading-tight md:text-4xl">{a.title}</h1>
      <p className="cap mt-2">{longDate(a.publishedAt)} · {a.readMins} min de leitura</p>
      <p className="mt-4 text-lg font-semibold text-ink-2">{a.summary}</p>
      <div className="mt-5 space-y-4 text-[16.5px] leading-relaxed text-[#3b4476]">{(a.paragraphs ?? []).map((p, i) => <p key={i}>{p}</p>)}</div>
      <p className="np mt-6">Conteúdo informativo da Triskel. Não substitui orientação jurídica ou contábil.</p>
      {related.length > 0 && <section className="mt-10" aria-labelledby="leia"><h2 id="leia" className="h-sec mb-3">Leia também</h2><div className="grid gap-4">{related.map((n) => <NewsCard key={n.slug} n={n} />)}</div></section>}
      <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/noticias" className="btn btn-outline">Ver todas as notícias</Link><Link href="/" className="btn btn-ghost">Voltar ao início</Link></div>
    </article>
  )
}
