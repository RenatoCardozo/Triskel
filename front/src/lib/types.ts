/** Tipos dos DTOs do back (resumidos ao que a interface usa). */
export type Role = 'CREATOR' | 'BUSINESS' | 'AGENCY'

export interface Me {
  id: string; publicId: string; role: Role; name: string; email: string; phone: string | null
  verified: boolean; complete: boolean; visible: boolean; visiblePref: boolean; missing: string[]
  avatarUrl: string | null; coverUrl: string | null
  prefs: { push: boolean; email: boolean; weekly: boolean }
  profile: Record<string, any> & { val?: { reels: number; stories: number; tiktok: number; img: string; showPrices: boolean; acceptBelowMin: boolean } }
}
export interface Compat { pct: number; why: string[] }
export interface Breakdown { valueCents: number; feeCents: number; totalCents: number }

export interface DashboardKpi { label: string; value: string; hint?: string }
export interface Dashboard {
  fresh: boolean; role: Role; profile: { complete: boolean; verified: boolean; visible: boolean; missing: string[] }
  reviewsPending: number; wallet: { balanceCents: number }; kpis: DashboardKpi[]
  attention: Array<{ kind: 'delivery' | 'proposal' | 'contract'; id: string; title: string; subtitle: string }>
  suggestion: { kind: 'campaign' | 'creator'; id: string; title: string; subtitle: string } | null
}

export interface Opportunity {
  id: string; name: string; brandName: string; segment: string; city: string | null; uf: string | null; niches: string[]; objective: string; description: string
  format: string; videos: number; deliveryDate: string; imageUse: string; platforms: string[]; revisions: string; exclusiveDays: number
  youReceiveCents: number; feeCents: number; compat: Compat; conflict: string | null; proposalId: string | null
}
export interface CreatorCard {
  id: string; name: string; niches: string[]; city: string | null; uf: string | null; rating: number; jobs: number; sizeBand: string | null; followers: string | null
  vminCents: number | null; vmaxCents: number | null; avgDelivery: string | null; avatarUrl: string | null; compat: Compat; conflict: string | null; proposalId: string | null
}
export interface CreatorDetail {
  creator: CreatorCard & { about: string | null; networks: Array<{ name: string; followers: string | null }>; prices: { fromCents: number | null; toCents: number | null } | null; portfolio: Array<{ id: string; title: string; description: string; views: string | null }> }
  compat: Compat | null; conflict: string | null; proposalId: string | null; withCampaign: Breakdown | null; delivery: string | null
}

export interface CampaignListItem {
  id: string; name: string; status: 'DRAFT' | 'OPEN'; brandName: string; clientName: string | null; videos: number; creatorsQty: number; valueCents: number
  deliveryDate: string; createdAt: string; proposals: number; accepted: number; contracts: number; deliveryStates: string[]
}
export interface Generated { headline: string; creators: string; content: string }
export interface CampaignDetail {
  id: string; status: 'DRAFT' | 'OPEN'; brandName: string; segment: string; clientId: string | null; createdAt: string
  form: Record<string, any>; generated: Generated; requirements: string[]
  conditions: { perCreator: Breakdown; total: Breakdown; perVideoCents: number }
}

export type ProposalStatus = 'OPEN' | 'ACCEPTED' | 'CONTRACT' | 'DECLINED' | 'CLOSED'
export interface ProposalListItem {
  id: string; number: string; status: ProposalStatus; yourTurn: boolean; needsYou: boolean; unread: boolean; counterpart: string; clientName: string | null
  avatarUrl: string | null; campaignName: string; lastValueCents: number; preview: string; lastActivity: string
}
export interface Round extends Breakdown { seq: number; by: 'K' | 'C'; deliveryDate: string; imageUse: string; message: string; at: string }
export interface ProposalDetail {
  id: string; number: string; status: ProposalStatus; origin: string; createdAt: string; turn: 'C' | 'K' | null; yourTurn: boolean; unread: boolean
  campaign: { id: string; name: string; objective: string; format: string; videos: number; generated: Generated; requirements: string[]; revisions: string }
  brandName: string; clientName: string | null
  counterpart: { id?: string; name: string; shortName: string; avatarUrl: string | null; niches?: string[]; city?: string | null; rating?: number }
  rounds: Round[]; messages: Array<{ id: string; by: 'K' | 'C' | 'S'; text: string; at: string }>
  acceptedBy: string | null; acceptedAt: string | null; conflict: string | null
  contract: { id: string; number: string; signed: boolean } | null
  can: { accept: boolean; counter: boolean; decline: boolean; message: boolean; pay: boolean }
  exclusivity: { days: number; from: string; to: string | null }
}

export type ContractBlock = { t: 'kv'; h: string; rows: Array<[string, string]> } | { t: 'p'; x: string } | { t: 'h'; x: string }
export interface Signature { nome: string; org: string; doc: string; papel: string; at: string; code: string }
export interface ContractView {
  contract: {
    id: string; number: string; proposalId: string; side: 'C' | 'K'; signed: boolean; signedAt: string | null; paidAt: string | null
    valueCents: number; feeCents?: number; totalCents?: number; deliveryDate: string; imageUse: string; exclusiveDays: number; campaignName: string
    parties: { contractor: { name: string; doc: string; resp: string; client: string | null }; creator: { name: string; doc: string; city: string } }
    signatures: { contractor: Signature | null; creator: Signature | null; contractorPending: boolean }
    sha256: string; frozen: boolean; blocks: ContractBlock[]
  }
  missing: string[]; conflict: string | null; canSign: boolean; pdf: { kind: 'final' | 'minuta' }
}
export interface ContractPreview {
  contractId: string | null
  summary?: { number: string; side: 'C' | 'K'; campaignName: string; brandName: string; clientName: string | null; creatorName: string; valueCents: number; feeCents?: number; totalCents?: number; deliveryDate: string; imageUse: string; revisions: string; exclusiveDays: number }
  conflict?: string | null; missing?: string[]
  wallet?: { balanceCents: number; enough: boolean; missingCents: number; afterCents: number } | null
  blocks?: ContractBlock[]
}

export type DeliveryState = 'PROD' | 'IA' | 'APROV' | 'APROVADO' | 'LIBERADO'
export interface AiItem { id: string; label: string; status: 'ok' | 'atencao' | 'falha'; evidence: string; suggestion: string }
export interface Submission {
  n: number; kind: 'VIDEO' | 'POST'; fileName: string | null; fileSize: number | null; url: string | null; durationSec: number | null; createdAt: string; videoUrl: string | null
  ai: { status: 'PENDING' | 'DONE' | 'FAILED'; ok: boolean | null; score: number | null; summary: string | null; engine: string | null; items: AiItem[]; error: string | null }
  decision: string | null; comment: string | null
}
export interface Delivery {
  id: string; contractId: string; proposalId: string; side: 'C' | 'K'; state: DeliveryState; signed: boolean; needsYou: boolean
  campaign: { name: string; brandName: string; clientName: string | null; videos: number; format: string }
  counterpart: string; deliveryDate: string; imageUse: string; revisions: string; valueCents: number; feeCents?: number; totalCents?: number
  custody: 'HELD' | 'RELEASED'; adjust: { count: number; max: number; remaining: number; comment: string | null }
  requirements: Array<{ id: string; label: string; custom?: boolean }>; submissions: Submission[]; analyzing: boolean
  publication: { url: string | null; state: 'PENDING' | 'CONFIRMED' | 'FAILED' | null; publishedAt: string | null; releasedAt: string | null }
  can: { submit: boolean; send: boolean; approve: boolean; adjust: boolean; publish: boolean }
}

export interface MoneyTx {
  id: string; kind: 'RECHARGE' | 'CONTRACT' | 'WITHDRAWAL' | 'PAY'; status: string; description: string; counterparty: string | null; valueCents: number
  feeCents?: number; totalCents?: number; method?: string | null; detail?: string | null; message?: string | null; code?: string | null; e2e?: string | null; createdAt: string
}
export type Wallet =
  | { role: 'CREATOR'; availableCents: number; custodyCents: number; movements: MoneyTx[] }
  | { role: 'BUSINESS' | 'AGENCY'; balanceCents: number; custodyCents: number; releasedCents: number; cards: Array<{ id: string; ref: string; brand: string; last4: string; exp: string }>; movements: MoneyTx[] }
export interface Recharge {
  transaction: MoneyTx
  pix: { payload: string; qrSvg?: string; expiresAt: string; e2e: string } | null
  action: { type: '3ds'; id: string; attemptsLeft?: number; message?: string } | null
}

export interface ReviewCandidate { userId: string; name: string; type: string; context: string; ok: boolean }
export interface ReviewsPending { pending: ReviewCandidate[]; done: Array<ReviewCandidate & { stars?: number }>; locked: ReviewCandidate[]; tags: string[] }
export interface ReviewsReceived { count: number; average: number; tags: Array<{ tag: string; count: number }> | string[]; items: Array<{ author: string; stars: number; comment: string | null; at: string }> }

export interface NewsItem { slug: string; category: string; publishedAt: string; readMins: number; title: string; summary: string; paragraphs?: string[] }
export interface Meta { options: Record<string, any>; segments: Record<string, string> }
