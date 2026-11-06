import { z } from 'zod'
import { brDateToISO, isoToBRDate } from './masks'
import { MIN_OFFER_CENTS } from './money'

const t = (min: number, max: number, m: string) => z.string().trim().min(min, m).max(max)
const arr = (m: string) => z.array(z.string()).min(1, m)

/** Formulário "Criar campanha" (mesmos campos e limites do back). Datas em dd/mm/aaaa, valor em centavos. */
export const campaignSchema = z.object({
  clientId: z.string(),
  nome: t(3, 80, 'Dê um nome à campanha (3 a 80 caracteres).'),
  produto: t(3, 120, 'Informe o produto ou serviço divulgado.'),
  obj: z.string().min(1, 'Escolha o objetivo.'),
  desc: t(10, 1200, 'Descreva o briefing (mínimo 10 caracteres).'),
  msg: t(3, 160, 'Informe a mensagem principal (até 160 caracteres).'),
  cta: z.string().trim().max(80),
  pIdade: arr('Escolha ao menos uma faixa etária.'),
  pGen: z.string().min(1, 'Escolha o gênero predominante.'),
  pReg: z.string().min(1, 'Escolha a região do público.'),
  pInt: z.array(z.string()),
  nichosCr: arr('Escolha ao menos um nicho de criador.'),
  porteCr: arr('Escolha ao menos um porte de criador.'),
  genCr: z.string().min(1, 'Escolha uma opção.'),
  idCr: z.string().min(1, 'Escolha uma opção.'),
  regCr: z.string().min(1, 'Escolha a localização do criador.'),
  nota: z.string().min(1, 'Escolha a nota mínima.'),
  qCr: z.number({ error: 'Informe a quantidade.' }).int().min(1, 'Mínimo 1.').max(20, 'Máximo 20.'),
  fmt: arr('Escolha ao menos um formato.'),
  plat: arr('Escolha ao menos uma plataforma.'),
  qVid: z.number({ error: 'Informe a quantidade.' }).int().min(1, 'Mínimo 1.').max(10, 'Máximo 10.'),
  dur: z.string().min(1, 'Escolha a duração.'),
  tom: arr('Escolha ao menos um tom.'),
  mencoes: z.string().trim().max(120),
  refs: z.string().trim().max(200),
  nao: z.string().trim().max(400),
  valueCents: z.number().int().min(MIN_OFFER_CENTS, 'Informe o valor por vídeo (mínimo R$ 10,00).').max(5_000_000, 'O máximo é R$ 50.000,00 por vídeo.'),
  inicio: z.string(), entrega: z.string(), publi: z.string(),
  rev: z.string().min(1, 'Escolha as rodadas de ajuste.'), uso: z.string().min(1, 'Escolha o uso de imagem.'), excl: z.string().min(1, 'Escolha a exclusividade.'), envio: z.string().min(1, 'Escolha uma opção.'),
}).superRefine((v, ctx) => {
  const add = (p: string, message: string) => ctx.addIssue({ code: 'custom', path: [p], message })
  const today = new Date().toISOString().slice(0, 10)
  const ini = brDateToISO(v.inicio), ent = brDateToISO(v.entrega), pub = v.publi ? brDateToISO(v.publi) : ''
  if (!ini) add('inicio', 'Use uma data válida (dd/mm/aaaa).')
  if (!ent) add('entrega', 'Use uma data válida (dd/mm/aaaa).'); else if (ent <= today) add('entrega', 'O prazo de entrega precisa ser uma data futura.')
  if (ini && ent && ini > ent) add('inicio', 'O início deve ser anterior ao prazo de entrega.')
  if (v.publi && !pub) add('publi', 'Use uma data válida (dd/mm/aaaa).'); else if (pub && ent && pub < ent) add('publi', 'A publicação deve ser depois da entrega.')
})
export type CampaignForm = z.infer<typeof campaignSchema>

export const emptyCampaign = (d: Partial<CampaignForm> = {}): CampaignForm => ({
  clientId: '', nome: '', produto: '', obj: '', desc: '', msg: '', cta: '', pIdade: d.pIdade ?? [], pGen: d.pGen ?? '', pReg: d.pReg ?? '', pInt: d.pInt ?? [],
  nichosCr: d.nichosCr ?? [], porteCr: d.porteCr ?? [], genCr: 'Sem preferência', idCr: 'Sem preferência', regCr: d.regCr ?? '', nota: 'Sem mínimo', qCr: 1, fmt: [], plat: [], qVid: 1, dur: '', tom: [],
  mencoes: '', refs: '', nao: '', valueCents: 0, inicio: '', entrega: '', publi: '', rev: '2 rodadas', uso: '90 dias', excl: 'Nenhuma', envio: '',
})
export function fromApi(f: Record<string, any>, clientId: string | null): CampaignForm {
  return { ...emptyCampaign(), ...f, clientId: clientId ?? '', inicio: isoToBRDate(f.inicio), entrega: isoToBRDate(f.entrega), publi: isoToBRDate(f.publi), cta: f.cta ?? '', mencoes: f.mencoes ?? '', refs: f.refs ?? '', nao: f.nao ?? '' } as CampaignForm
}
export function toPayload(v: CampaignForm, agency: boolean) {
  const { clientId, publi, ...rest } = v
  return { ...rest, ...(agency ? { clientId } : {}), inicio: brDateToISO(v.inicio)!, entrega: brDateToISO(v.entrega)!, publi: publi ? brDateToISO(publi)! : '' }
}
