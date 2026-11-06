import type { Probe, Signals } from './media'

export type Status = 'ok' | 'atencao' | 'falha'
export interface Req { id: string; label: string }
export interface Item { id: string; label: string; status: Status; evidence: string; suggestion: string }
export interface Briefing { campaignName: string; brand: string; product: string; message: string; cta?: string; mentions?: string; avoid?: string; maxSeconds: number }

const f1 = (n: number) => n.toFixed(1).replace('.', ',')
export const MEASURED = new Set(['dur', 'fmt', 'tec'])
const MANUAL = 'Este item depende do conteúdo do vídeo e o modelo de IA não está ligado, então não foi conferido automaticamente.'

/** Requisitos medidos (duração, formato, qualidade técnica). Valem para o motor determinístico e para o LLM. */
export function measured(req: Req, p: Probe | null, s: Signals | null, b: Briefing): Item | null {
  const base = { id: req.id, label: req.label }
  if (!p) return null
  if (req.id === 'dur') {
    const max = b.maxSeconds
    return p.durationSec <= max + 0.5
      ? { ...base, status: 'ok', evidence: `${f1(p.durationSec)} s / máx. ${max} s`, suggestion: '' }
      : { ...base, status: 'falha', evidence: `${f1(p.durationSec)} s, acima do máximo de ${max} s`, suggestion: `Corte o vídeo para até ${max} s e envie de novo.` }
  }
  if (req.id === 'fmt') {
    if (!p.hasVideo) return { ...base, status: 'falha', evidence: 'Não encontrei imagem no arquivo.', suggestion: 'Envie um vídeo MP4 ou MOV válido.' }
    const ratio = p.width / p.height
    if (Math.abs(ratio - 9 / 16) <= 0.03) return { ...base, status: 'ok', evidence: `${p.width}x${p.height} (9:16)`, suggestion: '' }
    if (p.height > p.width) return { ...base, status: 'atencao', evidence: `${p.width}x${p.height}: vertical, mas fora de 9:16`, suggestion: 'Exporte em 1080x1920 (9:16) para não perder enquadramento no Reels e no TikTok.' }
    return { ...base, status: 'falha', evidence: `${p.width}x${p.height}: horizontal`, suggestion: 'Grave ou exporte na vertical, em 9:16.' }
  }
  if (req.id === 'tec') {
    if (!p.hasVideo) return { ...base, status: 'falha', evidence: 'Não encontrei imagem no arquivo.', suggestion: 'Envie um vídeo MP4 ou MOV válido.' }
    if (!p.hasAudio) return { ...base, status: 'falha', evidence: 'O vídeo não tem trilha de áudio.', suggestion: 'Exporte o vídeo com o áudio.' }
    const issues: string[] = []
    const side = Math.min(p.width, p.height)
    if (side < 540) issues.push(`resolução baixa (${p.width}x${p.height})`)
    if (s?.meanVolumeDb != null && s.meanVolumeDb < -35) issues.push(`áudio muito baixo (${f1(s.meanVolumeDb)} dB)`)
    if (s?.maxVolumeDb != null && s.maxVolumeDb >= -0.1) issues.push('áudio estourado (clipping)')
    if (s?.brightness != null && s.brightness < 35) issues.push('imagem muito escura')
    if (issues.length) return { ...base, status: 'atencao', evidence: issues.join('; '), suggestion: 'Melhore a iluminação e o áudio, ou exporte em resolução maior.' }
    return { ...base, status: 'ok', evidence: `${side >= 1080 ? 'Full HD' : 'HD'}, ${p.fps ?? '?'} fps, áudio presente${s?.meanVolumeDb != null ? ` (${f1(s.meanVolumeDb)} dB)` : ''}`, suggestion: '' }
  }
  return null
}

/** Motor determinístico (sem LLM). Mede o que dá para medir; o resto vira "atenção, conferir manualmente". Nunca reprova o que não consegue verificar. */
export function deterministic(reqs: Req[], p: Probe | null, s: Signals | null, b: Briefing, kind: 'video' | 'post'): Item[] {
  return reqs.map((r) => {
    if (kind === 'post') return { id: r.id, label: r.label, status: 'atencao' as const, evidence: 'A análise recebeu só o link do post, sem o arquivo de vídeo.', suggestion: 'Confira o post manualmente antes de aprovar.' }
    return measured(r, p, s, b) ?? { id: r.id, label: r.label, status: 'atencao' as const, evidence: MANUAL, suggestion: 'Confira este item manualmente antes de aprovar.' }
  })
}

export function score(items: Item[]): number {
  if (!items.length) return 0
  const w = { ok: 1, atencao: 0.6, falha: 0 } as const
  return Math.round((items.reduce((s, i) => s + w[i.status], 0) / items.length) * 100)
}
export function summarize(items: Item[], engine: string): string {
  const ok = items.filter((i) => i.status === 'ok').length, att = items.filter((i) => i.status === 'atencao').length, bad = items.filter((i) => i.status === 'falha').length
  if (bad) return `Fora dos padrões: ${bad} ${bad > 1 ? 'itens falharam' : 'item falhou'} (${items.filter((i) => i.status === 'falha').map((i) => i.label.toLowerCase()).join('; ')}). Motor: ${engine}.`
  return `Dentro dos padrões: ${ok} de ${items.length} requisitos conferidos${att ? `; ${att} ${att > 1 ? 'pedem' : 'pede'} conferência manual` : ''}. Motor: ${engine}.`
}
