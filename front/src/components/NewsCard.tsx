import Link from 'next/link'
import type { NewsItem } from '@/lib/types'
import { CAT_EMOJI, longDate } from '@/lib/news'

const GRAD = ['linear-gradient(90deg,#2dd4bf,#5fe0a1)', 'linear-gradient(90deg,#2dd4bf,#4c5dca)', 'linear-gradient(90deg,#2d7ad4,#2dd4bf)', 'linear-gradient(90deg,#5fe0a1,#2d7ad4)', 'linear-gradient(90deg,#4c5dca,#2dd4bf)']

/** Cartão de notícia do protótipo: faixa em degradê com emoji + categoria, data, título, resumo e link. */
export function NewsCard({ n, i = 0 }: { n: NewsItem; i?: number }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[15px] bg-surface" style={{ boxShadow: '4px 4px 4px rgba(204,204,204,.25)' }}>
      <div className="flex h-[84px] items-center gap-3 px-[18px]" style={{ background: GRAD[i % GRAD.length] }}>
        <span aria-hidden="true" style={{ fontSize: 34, lineHeight: 1 }}>{CAT_EMOJI[n.category] ?? '📰'}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{n.category}</span>
      </div>
      <div className="flex flex-1 flex-col gap-[6px] px-[18px] pb-[14px] pt-[14px]">
        <p style={{ margin: 0, fontSize: 12, color: '#6f7fe0' }}>{longDate(n.publishedAt)} · {n.readMins} min de leitura</p>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.3, color: '#4c5dca' }}><Link href={`/noticias/${n.slug}`} className="no-underline hover:underline">{n.title}</Link></h3>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#4c5dca' }}>{n.summary}</p>
        <Link href={`/noticias/${n.slug}`} className="mt-auto no-underline" style={{ fontSize: 14, fontWeight: 700, color: '#0f8f7d', paddingTop: 4 }} aria-label={`Ler notícia: ${n.title}`}>Ler notícia ›</Link>
      </div>
    </article>
  )
}
