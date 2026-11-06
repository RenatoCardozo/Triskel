import Link from 'next/link'
import type { NewsItem } from '@/lib/types'
import { CAT_EMOJI, longDate } from '@/lib/news'

export function NewsCard({ n }: { n: NewsItem }) {
  return (
    <article className="card flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-ok-bg text-lg">{CAT_EMOJI[n.category] ?? '📰'}</span><span className="pl pl-ink">{n.category}</span></div>
      <p className="cap">{longDate(n.publishedAt)} · {n.readMins} min de leitura</p>
      <h3 className="text-lg font-extrabold leading-snug text-ink"><Link href={`/noticias/${n.slug}`} className="no-underline hover:underline">{n.title}</Link></h3>
      <p className="text-sm text-[#56608f]">{n.summary}</p>
      <Link href={`/noticias/${n.slug}`} className="mt-auto text-sm font-extrabold text-tealtext no-underline" aria-label={`Ler notícia: ${n.title}`}>Ler notícia ›</Link>
    </article>
  )
}
