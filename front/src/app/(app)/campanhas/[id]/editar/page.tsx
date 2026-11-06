'use client'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { fromApi, toPayload } from '@/lib/campaign'
import type { CampaignDetail } from '@/lib/types'
import { useMe, useMeta } from '@/hooks/queries'
import { CampaignFormView } from '@/components/CampaignFormView'
import { BackLink, ErrorState, PageSkeleton, Title } from '@/components/ui'

export default function EditarCampanha() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const qc = useQueryClient()
  const me = useMe(); const meta = useMeta()
  const c = useQuery({ queryKey: ['campaign', id], queryFn: () => api<{ campaign: CampaignDetail }>('campaigns/' + id).then((r) => r.campaign) })
  const clients = useQuery({ queryKey: ['clients'], enabled: me.data?.role === 'AGENCY', queryFn: () => api<{ clients: Array<{ id: string; name: string }> }>('me/clients') })
  if (me.isPending || meta.isPending || c.isPending || (me.data?.role === 'AGENCY' && clients.isPending)) return <PageSkeleton rows={4} />
  if (c.isError || me.isError || meta.isError || !me.data || !meta.data) return <ErrorState error={c.error ?? me.error ?? meta.error} onRetry={() => c.refetch()} />
  const agency = me.data.role === 'AGENCY'
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href={`/campanhas/${id}`}>Voltar à campanha</BackLink>
      <Title sub="Ao salvar, a campanha gerada e os requisitos são refeitos.">Editar dados</Title>
      <CampaignFormView agency={agency} clients={clients.data?.clients} opts={meta.data.options} defaults={fromApi(c.data.form, c.data.clientId)} submitLabel="Gerar campanha" onCancel={() => router.push(`/campanhas/${id}`)}
        onSubmit={async (v) => { await api('campaigns/' + id, { method: 'PUT', body: toPayload(v, agency) }); await qc.invalidateQueries({ queryKey: ['campaign', id] }); qc.invalidateQueries({ queryKey: ['campaigns'] }); router.push(`/campanhas/${id}`) }} />
    </div>
  )
}
