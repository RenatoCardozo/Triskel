import { env } from '../env'
import { prisma } from '../db'
import { sendMail, MailAttachment } from './mailer'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const shell = (title: string, body: string) => `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f6fbfa;font-family:Arial,sans-serif;color:#1f2937">
<div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:linear-gradient(90deg,#4b5dca,#2dd4bf);border-radius:14px 14px 0 0;padding:18px 24px;color:#fff;font-size:22px;font-weight:700">Triskel</div>
<div style="background:#fff;border-radius:0 0 14px 14px;padding:24px;line-height:1.55"><h2 style="margin:0 0 12px;color:#4c5cca;font-size:20px">${esc(title)}</h2>${body}
<p style="color:#6b7280;font-size:12px;margin-top:24px">Você recebeu este e-mail porque tem conta na Triskel. Toda a negociação acontece dentro da plataforma.</p></div></div></body></html>`
const cta = (label: string, path: string) => `<p><a href="${esc(env.PUBLIC_WEB_URL + path)}" style="display:inline-block;background:#2dd4bf;color:#fff;text-decoration:none;font-weight:700;padding:10px 22px;border-radius:30px">${esc(label)}</a></p>`

export type EmailKind =
  | 'verify' | 'newEmail' | 'proposal' | 'counter' | 'accepted' | 'declined' | 'paid' | 'signedFinal'
  | 'deliverySent' | 'adjust' | 'approved' | 'released' | 'topup' | 'dataRequest'

/** Eventos que o protótipo mostra ou implica. `prefs` respeita "Avisos por e-mail" (exceto códigos). */
export async function notify(userId: string, kind: EmailKind, ctx: { title: string; body: string; link?: string; code?: string; attachments?: MailAttachment[] }) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true, prefEmail: true } })
  if (!u) return
  const critical = kind === 'verify' || kind === 'newEmail' || kind === 'dataRequest'
  if (!critical && !u.prefEmail) return
  const to = u.email
  const codeBlock = ctx.code ? `<p style="font-size:30px;letter-spacing:8px;font-weight:700;color:#4c5cca;margin:16px 0">${esc(ctx.code)}</p>` : ''
  const html = shell(ctx.title, `<p>Olá, ${esc(u.name.split(' ')[0])}.</p><p>${ctx.body}</p>${codeBlock}${ctx.link ? cta('Abrir na Triskel', ctx.link) : ''}`)
  const text = `Olá, ${u.name.split(' ')[0]}.\n\n${ctx.body.replace(/<[^>]+>/g, '')}\n${ctx.code ? '\nCódigo: ' + ctx.code + '\n' : ''}${ctx.link ? '\n' + env.PUBLIC_WEB_URL + ctx.link : ''}`
  await sendMail({ to: kind === 'newEmail' ? (ctx as any).to ?? to : to, subject: ctx.title, html, text, attachments: ctx.attachments })
}
export async function mailTo(to: string, name: string, title: string, body: string, code?: string) {
  const codeBlock = code ? `<p style="font-size:30px;letter-spacing:8px;font-weight:700;color:#4c5cca;margin:16px 0">${esc(code)}</p>` : ''
  await sendMail({ to, subject: title, html: shell(title, `<p>Olá, ${esc(name.split(' ')[0])}.</p><p>${body}</p>${codeBlock}`), text: `${body.replace(/<[^>]+>/g, '')}${code ? '\nCódigo: ' + code : ''}` })
}
