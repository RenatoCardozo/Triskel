'use client'
import { useState } from 'react'
import { patch, post } from '@/lib/api'
import type { Me } from '@/lib/types'
import { useMe, useMeMutation } from '@/hooks/queries'
import { Button, Card, Confirm, ErrorState, PageSkeleton, Title, useToast } from '@/components/ui'
import { Switch } from '@/components/ui/form'
import { ThemeSwitch } from '@/components/ThemeSwitch'

export default function Configuracoes() {
  const me = useMe(); const toast = useToast()
  const save = useMeMutation((b: Record<string, boolean>) => patch<{ user: Me }>('me/prefs', b))
  const [ask, setAsk] = useState<'EXPORT' | 'DELETE' | null>(null); const [busy, setBusy] = useState(false)
  if (me.isPending) return <PageSkeleton />
  if (me.isError) return <ErrorState error={me.error} onRetry={() => me.refetch()} />
  const u = me.data, aud = u.role === 'CREATOR' ? 'empresas e agências' : 'criadores'
  const ready = u.complete && u.verified
  const set = (b: Record<string, boolean>) => save.mutate(b, { onError: (e) => toast(e.message, 'err') })
  async function req(kind: 'EXPORT' | 'DELETE') {
    setBusy(true)
    try { await post('me/data-request', { kind }); toast(kind === 'EXPORT' ? 'Pedido registrado. Enviaremos uma cópia dos seus dados por e-mail em até 48 horas.' : 'Pedido de exclusão registrado. Contratos em andamento precisam ser concluídos antes.'); setAsk(null) } catch (e) { toast((e as Error).message, 'err') } finally { setBusy(false) }
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Title>Configurações</Title>
      <section aria-labelledby="ap"><h2 id="ap" className="h-sec mb-2">Aparência</h2><Card><ThemeSwitch /></Card></section>
      <section aria-labelledby="nt"><h2 id="nt" className="h-sec mb-2">Notificações</h2>
        <Card className="divide-y divide-line !py-2">
          <Switch checked={u.prefs.push} onChange={(v) => set({ push: v })} label="Avisos no celular (push)" hint={u.role === 'CREATOR' ? 'Propostas, respostas e pagamentos' : 'Respostas, entregas e relatórios'} />
          <Switch checked={u.prefs.email} onChange={(v) => set({ email: v })} label="Avisos por e-mail" hint="Pagamentos e contratos" />
          <Switch checked={u.prefs.weekly} onChange={(v) => set({ weekly: v })} label="Resumo semanal" hint="Toda segunda-feira" />
        </Card>
      </section>
      <section aria-labelledby="pv"><h2 id="pv" className="h-sec mb-2">Privacidade</h2>
        <Card>{ready ? <Switch checked={u.visiblePref} onChange={(v) => set({ visible: v })} label={`Aparecer para ${aud}`} hint="Você pode pausar quando quiser" /> : <Switch checked={false} disabled onChange={() => {}} label={`Aparecer para ${aud}`} hint="Disponível depois de completar o perfil e validar o e-mail." />}</Card>
      </section>
      <section aria-labelledby="lg"><h2 id="lg" className="h-sec mb-2">Seus dados (LGPD)</h2>
        <Card className="space-y-3"><p className="text-[15px]">Guardamos só o necessário para a plataforma funcionar. Você pode baixar uma cópia dos seus dados ou pedir a exclusão da conta.</p>
          <Button variant="outline" block onClick={() => setAsk('EXPORT')}>Baixar meus dados</Button><Button variant="danger" block onClick={() => setAsk('DELETE')}>Excluir minha conta</Button></Card>
      </section>
      <Confirm open={ask === 'EXPORT'} title="Baixar meus dados" confirmLabel="Pedir cópia" loading={busy} onConfirm={() => req('EXPORT')} onClose={() => setAsk(null)}>Vamos enviar uma cópia dos seus dados para {u.email} em até 48 horas.</Confirm>
      <Confirm open={ask === 'DELETE'} title="Excluir minha conta?" confirmLabel="Pedir exclusão" danger loading={busy} onConfirm={() => req('DELETE')} onClose={() => setAsk(null)}>Registramos o pedido de exclusão. Contratos em andamento precisam ser concluídos antes.</Confirm>
    </div>
  )
}
