'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { patch } from '@/lib/api'
import { applyApiError } from '@/lib/forms'
import type { Me } from '@/lib/types'
import { useMe, useMeMutation, useMeta } from '@/hooks/queries'
import { BackLink, Button, Card, ErrorState, Note, PageSkeleton, Title, useToast } from '@/components/ui'
import { MoneyInput, Select, Switch } from '@/components/ui/form'

export default function Valores() {
  const me = useMe(); const meta = useMeta()
  if (me.isPending || meta.isPending) return <PageSkeleton />
  if (me.isError || meta.isError || !me.data || !meta.data) return <ErrorState error={me.error ?? meta.error} onRetry={() => me.refetch()} />
  return <Form u={me.data} imgOpts={meta.data.options.imgUso} />
}
function Form({ u, imgOpts }: { u: Me; imgOpts: string[] }) {
  const router = useRouter(); const toast = useToast()
  const v0 = u.profile.val!
  const [reels, setReels] = useState(v0.reels), [stories, setStories] = useState(v0.stories), [tiktok, setTiktok] = useState(v0.tiktok)
  const [img, setImg] = useState(v0.img), [show, setShow] = useState(v0.showPrices), [below, setBelow] = useState(v0.acceptBelowMin)
  const [err, setErr] = useState(''); const [fe, setFe] = useState<string>('')
  const m = useMeMutation((b: Record<string, unknown>) => patch('me/prices', b))
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setFe('')
    if (!reels) { setFe('Informe o valor do Reels (valor mínimo por vídeo).'); return }
    try { await m.mutateAsync({ reels, stories, tiktok, img, showPrices: show, acceptBelowMin: below }); toast('Valores salvos.'); router.push('/perfil') } catch (x) { setErr(applyApiError(x)) }
  }
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <BackLink href="/perfil" />
      <Title sub="Seus valores aparecem para empresas e agências ao buscarem criadores.">Editar valores</Title>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Card className="space-y-4">
          <MoneyInput label="Reels 9:16 (R$)" value={reels} onChange={setReels} error={fe} />
          <MoneyInput label="Stories, pacote de 3 (R$)" value={stories} onChange={setStories} />
          <MoneyInput label="TikTok (R$)" value={tiktok} onChange={setTiktok} />
          <Select label="Uso de imagem" options={imgOpts} placeholder="Selecione" value={img} onChange={(e) => setImg(e.target.value)} />
        </Card>
        <Card className="divide-y divide-line !py-2">
          <Switch checked={show} onChange={setShow} label="Mostrar valores no perfil público" hint="Desligado, só aparece “sob consulta”." />
          <Switch checked={below} onChange={setBelow} label="Aceitar propostas abaixo do meu mínimo" />
        </Card>
        {err && <Note tone="danger" role="alert">{err}</Note>}
        <Button type="submit" block loading={m.isPending}>Salvar valores</Button>
        <Button variant="outline" block onClick={() => router.push('/perfil')}>Cancelar</Button>
      </form>
    </div>
  )
}
