import crypto from 'node:crypto'
import { env } from '../env'

/** URL assinada e curta para o video-ai buscar o vídeo (sem sessão de usuário). */
const mac = (id: string, exp: number) => crypto.createHmac('sha256', env.FILE_TOKEN_SECRET).update(`file:${id}:${exp}`).digest('hex')
export function signedFilePath(id: string, ttlSeconds = 900) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  return `/internal/files/${id}?exp=${exp}&sig=${mac(id, exp)}`
}
export function verifyFileSig(id: string, exp: string | undefined, sig: string | undefined): boolean {
  const e = Number(exp)
  if (!sig || !Number.isFinite(e) || e < Math.floor(Date.now() / 1000)) return false
  const a = Buffer.from(mac(id, e)), b = Buffer.from(sig)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
