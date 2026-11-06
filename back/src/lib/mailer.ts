import nodemailer from 'nodemailer'
import { env } from '../env'
import { logger } from './logger'

export interface MailAttachment { filename: string; content: Buffer; contentType: string }
export interface MailInput { to: string; subject: string; html: string; text: string; attachments?: MailAttachment[] }

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  tls: { rejectUnauthorized: env.NODE_ENV === 'production' },
})
const raw = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' })
/** Hospedagem sem SMTP entre serviços: monta a mensagem MIME e a entrega por HTTP ao email-sim. */
async function sendViaHttp(m: MailInput) {
  const built = await raw.sendMail({ from: env.MAIL_FROM, ...m })
  const q = new URLSearchParams({ from: env.MAIL_FROM.replace(/^.*<|>$/g, ''), to: m.to })
  const res = await fetch(`${env.MAIL_HTTP_URL.replace(/\/$/, '')}/api/ingest?${q}`, {
    method: 'POST',
    headers: { 'content-type': 'message/rfc822', ...(env.MAIL_HTTP_KEY ? { 'x-api-key': env.MAIL_HTTP_KEY } : {}) },
    body: built.message as Buffer,
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`email-sim respondeu HTTP ${res.status}`)
}
/** Envio best-effort: falha de e-mail nunca derruba a operação de negócio (fica no log). */
export async function sendMail(m: MailInput): Promise<boolean> {
  if (!env.MAIL_ENABLED) return false
  try {
    if (env.MAIL_TRANSPORT === 'http') await sendViaHttp(m)
    else await transport.sendMail({ from: env.MAIL_FROM, ...m })
    return true
  } catch (e) {
    logger.error({ err: (e as Error).message, to: m.to, subject: m.subject }, 'falha ao enviar e-mail')
    return false
  }
}
