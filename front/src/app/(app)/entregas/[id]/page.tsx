'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, post } from '@/lib/api'
import { brl, fdate, fdatetime, fsize } from '@/lib/format'
import type { AiItem, Delivery, Submission } from '@/lib/types'
import { applyApiError } from '@/lib/forms'
import { Facts, SafetyNote, StatePill } from '@/components/domain'
import { Avatar, BackLink, Button, Card, Confirm, ErrorState, LinkButton, Modal, Note, PageSkeleton, Pill, Spinner, Tabs, Title, useToast } from '@/components/ui'
import { Input, Textarea } from '@/components/ui/form'
import { Icon } from '@/components/Icon'

const MAX_MB = 100
const STEPS = ['Contrato pago e valor em custódia', 'Produção e envio do vídeo ou post', 'Análise da IA', 'Aprovação do contratante', 'Publicação confirmada pela Triskel', 'Pagamento liberado ao criador']

function stepState(d: Delivery): string[] {
  const idx = { PROD: 1, IA: 2, APROV: 3, APROVADO: 4, LIBERADO: 6 }[d.state]
  return STEPS.map((_, i) => (i < idx ? '✓ Concluído' : i === idx ? (d.state === 'IA' && d.analyzing ? 'Analisando…' : d.state === 'APROVADO' && d.publication.state === 'PENDING' ? 'Verificando…' : 'Agora') : '—'))
}
const AI_ICON: Record<AiItem['status'], [string, string, string]> = { ok: ['check', 'text-tealtext bg-ok-bg', 'Dentro do padrão'], atencao: ['help', 'text-warn bg-warn-bg', 'Atenção'], falha: ['xx', 'text-danger bg-danger-bg', 'Fora do padrão'] }

function SubmissionCard({ s, d, latest }: { s: Submission; d: Delivery; latest: boolean }) {
  const a = s.ai
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold text-ink">Envio {s.n}º · {s.kind === 'VIDEO' ? 'vídeo' : 'link do post'}</h3>
        <span className="cap">{fdatetime(s.createdAt)}</span>
      </div>
      {s.kind === 'VIDEO' && s.videoUrl && <video controls preload="metadata" className="max-h-[420px] w-full rounded-2xl bg-black" src={'/api/bff' + s.videoUrl} aria-label={`Vídeo do envio ${s.n}`} />}
      {s.kind === 'VIDEO' && <p className="cap">{s.fileName}{s.fileSize ? ` · ${fsize(s.fileSize)}` : ''}{s.durationSec ? ` · ${s.durationSec.toFixed(1).replace('.', ',')} s` : ''}</p>}
      {s.kind === 'POST' && s.url && <p className="break-all text-sm font-semibold text-ink">{s.url}</p>}
      <div aria-live="polite">
        {a.status === 'PENDING' && <Note role="status"><span className="inline-flex items-center gap-2"><Spinner />A IA está analisando o envio. Isso leva alguns segundos.</span></Note>}
        {a.status === 'FAILED' && <Note tone="danger" role="alert">{a.error || 'A análise falhou.'} Envie de novo.</Note>}
        {a.status === 'DONE' && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2"><Pill tone={a.ok ? 'ok' : 'danger'}>{a.ok ? 'Dentro dos padrões' : 'Fora dos padrões'}</Pill>{a.score != null && <Pill tone="ink">Pontuação {a.score}/100</Pill>}{a.engine && <span className="cap">Análise: {a.engine}</span>}</div>
            {a.summary && <p className="text-[15px]">{a.summary}</p>}
            <ul className="space-y-1.5">{a.items.map((it) => { const [ic, cls, lab] = AI_ICON[it.status]; return (
              <li key={it.id} className="flex gap-2 rounded-xl border border-line p-2.5"><span className={`grid h-6 w-6 flex-none place-items-center rounded-full ${cls}`} title={lab}><Icon n={ic as 'check'} size={14} strokeWidth={2.6} /></span><div className="min-w-0 text-sm"><b className="text-ink">{it.label}</b><span className="sr-only"> ({lab})</span><p className="text-[#56608f]">{it.evidence}</p>{it.suggestion && <p className="font-semibold text-tealtext">{it.suggestion}</p>}</div></li>
            ) })}</ul>
            <p className="cap">A análise da IA é um apoio. A decisão final é do contratante.</p>
          </div>
        )}
      </div>
      {s.decision && <Note tone={s.decision === 'aprovada' ? 'ok' : 'warn'}>{s.decision === 'aprovada' ? 'Aprovado pelo contratante.' : <>Ajustes pedidos: {s.comment}</>}</Note>}
      {latest && d.adjust.comment && d.state === 'PROD' && <Note tone="warn"><b>Pedido de ajuste:</b> {d.adjust.comment}</Note>}
    </Card>
  )
}

export default function EntregaDetalhe() {
  const { id } = useParams<{ id: string }>(); const qc = useQueryClient(); const toast = useToast()
  const q = useQuery({
    queryKey: ['delivery', id], queryFn: () => api<{ delivery: Delivery }>('deliveries/' + id).then((r) => r.delivery),
    refetchInterval: (qq) => { const x = qq.state.data; return x && (x.analyzing || x.publication.state === 'PENDING') ? 2500 : false },
  })
  const [mode, setMode] = useState<'video' | 'post'>('video'); const [file, setFile] = useState<File | null>(null); const [url, setUrl] = useState(''); const [pub, setPub] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState<string | null>(null); const [adj, setAdj] = useState(false); const [cmt, setCmt] = useState(''); const [cerr, setCerr] = useState(''); const [appr, setAppr] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  if (q.isPending) return <PageSkeleton rows={4} />
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />
  const d = q.data, side = d.side
  const subs = [...d.submissions].reverse(); const last = d.submissions.at(-1)
  const steps = stepState(d)
  const refresh = (nd?: Delivery) => { if (nd) qc.setQueryData(['delivery', id], nd); ['deliveries', 'dashboard', 'wallet', 'proposals'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })) }

  async function run<T>(key: string, fn: () => Promise<{ delivery: Delivery }>, ok: string) {
    setErr(''); setBusy(key)
    try { const r = await fn(); refresh(r.delivery); toast(ok); return true } catch (e) { setErr(applyApiError(e)); return false } finally { setBusy(null) }
  }
  async function submit() {
    setErr('')
    if (mode === 'video') {
      if (!file) return setErr('Escolha o vídeo da entrega.')
      if (!/^video\//.test(file.type) && !/\.(mp4|mov|m4v|webm)$/i.test(file.name)) return setErr('Envie um arquivo de vídeo (MP4 ou MOV).')
      if (file.size > MAX_MB * 1024 * 1024) return setErr(`O vídeo pode ter no máximo ${MAX_MB} MB.`)
      const fd = new FormData(); fd.append('file', file)
      if (await run('submit', () => api('deliveries/' + id + '/submissions', { method: 'POST', form: fd }), 'Vídeo enviado. A IA começou a análise.')) { setFile(null); if (fileRef.current) fileRef.current.value = '' }
    } else {
      if (url.trim().length < 5) return setErr('Informe o link do post.')
      if (await run('submit', () => post('deliveries/' + id + '/submissions', { url: url.trim() }), 'Link enviado. A IA começou a análise.')) setUrl('')
    }
  }
  async function adjust() {
    setCerr('')
    if (cmt.trim().length < 5) return setCerr('Explique o que precisa mudar.')
    setBusy('adjust')
    try { const r = await post<{ delivery: Delivery }>(`deliveries/${id}/adjust`, { comment: cmt.trim() }); refresh(r.delivery); toast('Pedido de ajuste enviado ao criador.'); setAdj(false); setCmt('') } catch (e) { setCerr(applyApiError(e)) } finally { setBusy(null) }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href="/entregas">Entregas</BackLink>
      <Title sub={side === 'C' ? `${d.campaign.name} · ${d.counterpart}` : `${d.campaign.name} · criador ${d.counterpart}`}>{side === 'C' ? 'Produzir o vídeo' : 'Revisar entrega'}</Title>
      <Card className="space-y-3">
        <div className="flex items-center gap-3"><Avatar name={d.counterpart} size={48} /><div className="min-w-0 flex-1"><b className="block truncate text-ink">{d.counterpart}</b><span className="cap">{d.campaign.name} · prazo {fdate(d.deliveryDate)}</span></div><StatePill s={d.state} /></div>
        <Facts items={[[side === 'C' ? 'Você recebe' : 'Valor ao criador', brl(d.valueCents)], ['Prazo de entrega', fdate(d.deliveryDate)], ['Uso de imagem', d.imageUse], ['Revisões', d.revisions], ['Em custódia', d.custody === 'HELD' ? 'Sim' : 'Liberado']]} cols={3} />
        <div className="flex flex-wrap gap-2"><LinkButton href={`/contratos/${d.contractId}`} variant="outline" size="sm">Ver contrato</LinkButton><LinkButton href={`/contatos/${d.proposalId}`} variant="ghost" size="sm">Ver conversa</LinkButton></div>
      </Card>
      {!d.signed && <Note tone="warn" role="status">{side === 'C' ? <>O contrato ainda não foi assinado por você. <Link className="link" href={`/contratos/${d.contractId}`}>Assinar agora</Link> para liberar o envio.</> : 'O criador ainda precisa assinar o contrato para começar a produção.'}</Note>}
      <Card as="section" aria-labelledby="req"><h2 id="req" className="h-sec mb-2">Requisitos analisados pela IA</h2><ul className="grid gap-1.5 sm:grid-cols-2">{d.requirements.map((r) => <li key={r.id} className="flex items-center gap-2 text-[15px]"><span className="text-tealtext" aria-hidden="true">•</span>{r.label}</li>)}</ul></Card>
      <Card as="section" aria-labelledby="et"><h2 id="et" className="h-sec mb-2">Etapas</h2><ol className="space-y-2">{STEPS.map((s, i) => <li key={s} className="flex items-center justify-between gap-3 text-[15px]"><span className={steps[i] === '—' ? 'text-ink-2' : 'font-bold text-ink'}>{s}</span><span className={`text-sm font-extrabold ${steps[i].startsWith('✓') ? 'text-tealtext' : steps[i] === '—' ? 'text-ink-2' : 'text-warn'}`}>{steps[i]}</span></li>)}</ol></Card>

      {subs.length > 0 && <section aria-label="Envios e análise da IA" className="space-y-3"><h2 className="h-sec">{d.state === 'PROD' && d.adjust.comment ? 'Apontamentos do contratante' : 'Análise da IA'}</h2>{subs.map((s, i) => <SubmissionCard key={s.n} s={s} d={d} latest={i === 0} />)}</section>}

      {err && <Note tone="danger" role="alert">{err}</Note>}

      {side === 'C' && d.can.submit && (
        <Card className="space-y-3" aria-label="Enviar entrega">
          <h2 className="h-sec">Enviar entrega</h2>
          <p className="cap">Envie o vídeo ou o link do post. A IA confere o briefing antes de a entrega seguir para {d.campaign.clientName ? d.campaign.brandName : d.counterpart}. Envio {d.submissions.length + 1}º.</p>
          <Tabs label="Tipo de envio" tabs={[['video', 'Enviar vídeo'], ['post', 'Link do post']]} value={mode} onChange={(m) => { setMode(m); setErr('') }} />
          {mode === 'video' ? (
            <div className="field"><label htmlFor="vid">Escolher vídeo no aparelho</label><input id="vid" ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/*" className="inp !py-2.5" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /><span className="fhint">Vertical 9:16, até 60 s. Máximo {MAX_MB} MB.{file ? ` Selecionado: ${file.name} (${fsize(file.size)}).` : ''}</span></div>
          ) : <Input label="Link do post (Instagram ou TikTok)" placeholder="https://www.instagram.com/reel/…" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} hint="Na análise por link, os itens de vídeo ficam como “atenção” (não dá para medir sem o arquivo)." />}
          <Button block loading={busy === 'submit'} onClick={submit}>Enviar para análise da IA</Button>
        </Card>
      )}
      {side === 'C' && d.state === 'IA' && !d.analyzing && last && (
        <Card className="space-y-3"><h2 className="h-sec">Resultado da análise</h2>
          {d.can.send ? <><p className="np np-ok">A IA não encontrou itens fora dos padrões. Você pode enviar ao contratante para aprovação.</p><Button block loading={busy === 'send'} onClick={() => run('send', () => post('deliveries/' + id + '/send'), 'Entrega enviada para aprovação.')}>Enviar para aprovação</Button></> : <p className="np np-warn">A IA encontrou itens fora dos padrões. Ajuste o vídeo conforme as sugestões e envie de novo.</p>}
        </Card>
      )}
      {side === 'C' && d.state === 'APROV' && <Note role="status">Entrega enviada. Aguardando a aprovação de {d.counterpart}.</Note>}
      {side === 'C' && d.state === 'APROVADO' && (
        <Card className="space-y-3"><h2 className="h-sec">Publicar e confirmar</h2>
          <p className="np np-ok">Entrega aprovada. Publique o conteúdo e informe o link do post: a Triskel confirma a publicação e libera o pagamento.</p>
          {d.publication.state === 'PENDING' ? <Note role="status"><span className="inline-flex items-center gap-2"><Spinner />A Triskel está confirmando a publicação…</span></Note> : (
            <>
              {d.publication.state === 'FAILED' && <Note tone="danger" role="alert">Não conseguimos confirmar a publicação com esse link. Confira e envie de novo.</Note>}
              <Input label="Link do post publicado" placeholder="https://www.instagram.com/reel/…" inputMode="url" value={pub} onChange={(e) => setPub(e.target.value)} />
              <Button block disabled={!d.can.publish} loading={busy === 'publish'} onClick={() => run('publish', () => post('deliveries/' + id + '/publish', { url: pub.trim() }), 'Link recebido. Confirmando a publicação…')}>Confirmar publicação</Button>
            </>
          )}
        </Card>
      )}
      {side === 'K' && d.state === 'PROD' && <Note role="status">{d.adjust.count ? 'Ajustes pedidos. Aguardando o novo envio do criador.' : 'Aguardando o criador enviar o vídeo ou o link do post.'}</Note>}
      {side === 'K' && d.state === 'IA' && <Note role="status">O criador está ajustando a entrega com base na análise da IA. Você recebe a entrega quando ela for enviada para aprovação.</Note>}
      {side === 'K' && d.can.approve && (
        <Card className="space-y-3"><h2 className="h-sec">Decisão</h2>
          <p className="np">A análise da IA é apoio; a decisão final é sua. Aprovar libera o criador para publicar. Restam {d.adjust.remaining} de {d.adjust.max} pedidos de ajuste.</p>
          <Button block onClick={() => setAppr(true)}>Aprovar entrega</Button>
          <Button variant="outline" block disabled={!d.can.adjust} onClick={() => setAdj(true)}>{d.can.adjust ? 'Pedir ajustes' : 'Limite de ajustes atingido'}</Button>
        </Card>
      )}
      {side === 'K' && d.state === 'APROVADO' && <Note role="status">Entrega aprovada. O pagamento é liberado quando o criador publicar e a Triskel confirmar a publicação.</Note>}
      {d.state === 'LIBERADO' && (
        <Card className="space-y-3 text-center"><h2 className="h-sec">Pagamento liberado</h2><p className="text-[15px]">{side === 'C' ? `${brl(d.valueCents)} foram liberados para a sua carteira.` : 'A publicação foi confirmada e o valor foi liberado ao criador.'}{d.publication.url ? <><br /><span className="cap break-all">Post: {d.publication.url}</span></> : null}</p>
          <div className="flex flex-wrap justify-center gap-2"><LinkButton href="/pagamentos" variant="outline">Ver pagamentos</LinkButton><LinkButton href="/avaliacoes">Avaliar a experiência</LinkButton></div></Card>
      )}
      <SafetyNote />
      <Confirm open={appr} title="Aprovar esta entrega?" confirmLabel="Aprovar entrega" loading={busy === 'approve'} onClose={() => setAppr(false)} onConfirm={async () => { await run('approve', () => post('deliveries/' + id + '/approve'), 'Entrega aprovada.'); setAppr(false) }}>O criador poderá publicar. O valor em custódia só é liberado depois que a Triskel confirmar a publicação.</Confirm>
      <Modal open={adj} onClose={() => setAdj(false)} title="Pedir ajustes" footer={<><Button variant="outline" onClick={() => setAdj(false)}>Cancelar</Button><Button loading={busy === 'adjust'} onClick={adjust}>Enviar pedido</Button></>}>
        <p className="hi mb-2 text-sm text-ink-2">Explique o que precisa mudar. Restam {d.adjust.remaining} de {d.adjust.max} pedidos de ajuste.</p>
        <Textarea label="Comentário ao criador" rows={4} maxLength={600} placeholder="Ex.: mostre o produto logo no início" value={cmt} onChange={(e) => setCmt(e.target.value)} error={cerr} hint="Telefone, e-mail, links e redes sociais são bloqueados." />
      </Modal>
    </div>
  )
}
