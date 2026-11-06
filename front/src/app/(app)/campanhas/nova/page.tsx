'use client'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { emptyCampaign, toPayload } from '@/lib/campaign'
import type { CampaignDetail } from '@/lib/types'
import { useMe, useMeta } from '@/hooks/queries'
import { CampaignFormView } from '@/components/CampaignFormView'
import { BackLink, ErrorState, PageSkeleton, Title } from '@/components/ui'

export default function NovaCampanha() {
  const router = useRouter(); const qc = useQueryClient()
  const me = useMe(); const meta = useMeta()
  const def = useQuery({ queryKey: ['campaign-defaults'], queryFn: () => api<Record<string, any>>('campaigns/defaults'), staleTime: 0 })
  const clients = useQuery({ queryKey: ['clients'], enabled: me.data?.role === 'AGENCY', queryFn: () => api<{ clients: Array<{ id: string; name: string }> }>('me/clients') })
  if (me.isPending || meta.isPending || def.isPending || (me.data?.role === 'AGENCY' && clients.isPending)) return <PageSkeleton rows={4} />
  if (me.isError || meta.isError || def.isError || !me.data || !meta.data) return <ErrorState error={me.error ?? meta.error ?? def.error} onRetry={() => def.refetch()} />
  const agency = me.data.role === 'AGENCY'
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href="/campanhas">Campanhas</BackLink>
      <Title sub="Quanto mais completo o briefing, melhor a campanha gerada e a recomendação de criadores. Etapa 1 de 2.">Criar campanha</Title>
      {agency && clients.data?.clients.length === 0 && <p className="np np-warn">Cadastre um cliente antes de criar a campanha: <a className="link" href="/clientes">Meus clientes</a>.</p>}
      <CampaignFormView agency={agency} clients={clients.data?.clients} opts={meta.data.options} defaults={emptyCampaign(def.data)} submitLabel="Gerar campanha" onCancel={() => router.push('/campanhas')}
        onSubmit={async (v) => { const r = await post<{ campaign: CampaignDetail }>('campaigns', toPayload(v, agency)); qc.invalidateQueries({ queryKey: ['campaigns'] }); router.push(`/campanhas/${r.campaign.id}`) }} />
    </div>
  )
}
