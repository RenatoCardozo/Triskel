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
/** Envio best-effort: falha de e-mail nunca derruba a operação de negócio (fica no log). */
export async function sendMail(m: MailInput): Promise<boolean> {
  if (!env.MAIL_ENABLED) return false
  try {
    await transport.sendMail({ from: env.MAIL_FROM, ...m })
    return true
  } catch (e) {
    logger.error({ err: (e as Error).message, to: m.to, subject: m.subject }, 'falha ao enviar e-mail')
    return false
  }
}
