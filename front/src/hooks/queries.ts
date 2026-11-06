'use client'
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { api, post, patch, del, ApiError } from '@/lib/api'
import type * as T from '@/lib/types'

export const qk = {
  me: ['me'] as const, dash: ['dashboard'] as const, meta: ['meta'] as const, wallet: ['wallet'] as const,
  props: (f: string) => ['proposals', f] as const, prop: (id: string) => ['proposal', id] as const,
  dels: ['deliveries'] as const, del: (id: string) => ['delivery', id] as const,
}

export const useMe = () => useQuery({ queryKey: qk.me, queryFn: () => api<{ user: T.Me }>('auth/me').then((r) => r.user), staleTime: 30_000 })
export const useMeta = () => useQuery({ queryKey: qk.meta, queryFn: () => api<T.Meta>('meta'), staleTime: Infinity })
export const useDashboard = () => useQuery({ queryKey: qk.dash, queryFn: () => api<T.Dashboard>('dashboard') })
export const useWallet = () => useQuery({ queryKey: qk.wallet, queryFn: () => api<T.Wallet>('wallet') })

/** Mutação que invalida chaves e devolve toast de erro padronizado pelo chamador. */
export function useAct<A, R>(fn: (a: A) => Promise<R>, invalidate: QueryKey[] = []) {
  const qc = useQueryClient()
  return useMutation<R, ApiError, A>({
    mutationFn: fn,
    onSuccess: () => { invalidate.forEach((k) => qc.invalidateQueries({ queryKey: k })) },
  })
}
/** Atualiza o cache de `me` com a resposta de uma mutação de conta. */
export function useMeMutation<A>(fn: (a: A) => Promise<{ user: T.Me }>) {
  const qc = useQueryClient()
  return useMutation<{ user: T.Me }, ApiError, A>({
    mutationFn: fn,
    onSuccess: (r) => { qc.setQueryData(qk.me, r.user); qc.invalidateQueries({ queryKey: qk.dash }) },
  })
}
export { api, post, patch, del }
