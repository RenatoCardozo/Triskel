import { prisma, Db } from '../db'
import { ExInfo, exCheck, exMk, Conflict } from '../lib/exclusivity'

/** Só contratos assinados pelas duas partes contam (signedAt preenchido apenas quando as duas assinaram). */
export async function signedInfos(creatorId: string, skipProposalId?: string, db: Db = prisma): Promise<ExInfo[]> {
  const rows = await db.contract.findMany({ where: { creatorId, signedAt: { not: null }, ...(skipProposalId ? { NOT: { proposalId: skipProposalId } } : {}) } })
  return rows.map((c) => exMk(c.brandName, c.segment, c.exclusiveDays, c.deliveryDate))
}
export async function creatorConflict(creatorId: string, cand: { brandName: string; segment: string; dias: number; delivery: Date }, skipProposalId?: string, db: Db = prisma): Promise<Conflict | null> {
  const b = exMk(cand.brandName, cand.segment, cand.dias, cand.delivery)
  return exCheck(await signedInfos(creatorId, skipProposalId, db), b)
}
/** Marca considerada para exclusividade: cliente da agência, ou o próprio comércio. */
export const brandKey = (p: { clientName?: string | null; brandName: string }) => p.clientName || p.brandName
