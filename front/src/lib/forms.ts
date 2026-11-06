import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './api'

/** Mostra erros do back nos campos (quando vierem com `details.path`) e devolve a mensagem geral. */
export function applyApiError<T extends FieldValues>(e: unknown, setError?: UseFormSetError<T>, map: Record<string, Path<T>> = {}): string {
  if (!(e instanceof ApiError)) return 'Algo deu errado. Tente novamente.'
  const d = e.details as any
  if (setError && Array.isArray(d)) {
    for (const i of d) {
      const k = map[String(i.path).split('.')[0]]
      if (k) setError(k, { message: i.message })
    }
  }
  if (setError && d?.field && map[d.field]) setError(map[d.field], { message: e.message })
  return e.message
}
export const safeNext = (n: string | null | undefined) => (n && n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/\\') && !n.startsWith('/api') ? n : '/painel')
