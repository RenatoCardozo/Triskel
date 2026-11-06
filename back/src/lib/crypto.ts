import crypto from 'node:crypto'
import { env } from '../env'

export const sha256 = (s: string | Buffer) => crypto.createHash('sha256').update(s).digest('hex')
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url')
export const hashToken = (t: string) => sha256('rt:' + t)
export const sixDigits = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
export const hashCode = (userId: string, code: string) => sha256(`${env.CODE_PEPPER}:${userId}:${code}`)
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const rid = (n: number) => Array.from({ length: n }, () => ALPHA[crypto.randomInt(0, ALPHA.length)]).join('')
export const trxId = () => 'TRX-' + rid(8)
export const hmac = (secret: string, data: string) => crypto.createHmac('sha256', secret).update(data).digest('hex')
