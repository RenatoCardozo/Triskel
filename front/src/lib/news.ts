import 'server-only'
import type { NewsItem } from './types'
import { BACK_URL } from './server'

/** Notícias são públicas: o servidor do front consulta o back direto, sem cookies. */
async function get<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(BACK_URL + '/api/v1' + path, { cache: 'no-store', signal: AbortSignal.timeout(6000) })
    return r.ok ? ((await r.json()) as T) : null
  } catch { return null }
}
export const getNews = (limit?: number) => get<{ articles: NewsItem[]; categories: string[] }>('/news' + (limit ? `?limit=${limit}` : ''))
export const getArticle = (slug: string) => get<{ article: NewsItem; related: NewsItem[] }>('/news/' + encodeURIComponent(slug))
export const CAT_EMOJI: Record<string, string> = { 'Pequenos negócios': '🏪', 'Regras e boas práticas': '📋', 'Mercado de influenciadores': '🎬', 'Tecnologia e IA': '🤖', Publicidade: '📣' }
export const longDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })
