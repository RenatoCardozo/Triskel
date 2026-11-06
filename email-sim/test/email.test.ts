import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import nodemailer from 'nodemailer'
import { openStore } from '../src/store'
import { buildApp } from '../src/app'
import { startSmtp } from '../src/smtp'

const log = { info: () => {}, error: () => {} }
let db: ReturnType<typeof openStore>, app: Awaited<ReturnType<typeof buildApp>>, smtp: Awaited<ReturnType<typeof startSmtp>>
const tr = () => nodemailer.createTransport({ host: '127.0.0.1', port: 25251, secure: false, tls: { rejectUnauthorized: false }, ignoreTLS: true })

beforeAll(async () => { db = openStore(':memory:'); app = await buildApp(db); smtp = await startSmtp(db, log) })
afterAll(async () => { smtp.close(); await app.close() })

describe('email-sim', () => {
  it('captura pelo SMTP, extrai o código de 6 dígitos e serve pela API', async () => {
    await tr().sendMail({ from: 'Triskel <nao-responda@triskel.com.br>', to: 'Ana <ana@example.com>', subject: 'Seu código de verificação', text: 'Olá, Ana.\n\nSeu código: 482913\n', html: '<p>Seu código: <b>482913</b></p>' })
    const list = (await app.inject('/api/messages?to=ana@example.com')).json()
    expect(list.total).toBe(1)
    expect(list.items[0]).toMatchObject({ subject: 'Seu código de verificação', code: '482913', read: false })
    const m = (await app.inject(`/api/messages/${list.items[0].id}`)).json()
    expect(m.html).toContain('482913')
    expect((await app.inject('/api/messages?to=ana@example.com')).json().unread).toBe(0)
    const latest = (await app.inject('/api/messages/latest?to=ana@example.com&subject=verificação')).json()
    expect(latest.code).toBe('482913')
    expect((await app.inject('/api/messages/latest?to=outra@example.com')).statusCode).toBe(404)
  })
  it('guarda anexo PDF e permite baixar', async () => {
    const pdf = Buffer.from('%PDF-1.4\n%fake\n')
    await tr().sendMail({ from: 'a@b.com', to: 'bia@example.com', subject: 'Contrato assinado', text: 'Segue o PDF.', attachments: [{ filename: 'Contrato-TRK-2026-0001-assinado.pdf', content: pdf, contentType: 'application/pdf' }] })
    const id = (await app.inject('/api/messages?to=bia@example.com')).json().items[0].id
    const m = (await app.inject(`/api/messages/${id}`)).json()
    expect(m.attachments[0]).toMatchObject({ filename: 'Contrato-TRK-2026-0001-assinado.pdf', contentType: 'application/pdf' })
    const dl = await app.inject(m.attachments[0].url)
    expect(dl.headers['content-type']).toBe('application/pdf')
    expect(dl.rawPayload.equals(pdf)).toBe(true)
  })
  it('recebe a mensagem MIME bruta por HTTP (sem SMTP), com anexo maior que o limite padrão do corpo', async () => {
    const pdf = Buffer.alloc(200_000, 7)
    const built = await nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' }).sendMail({ from: 'Triskel <nao-responda@triskel.com.br>', to: 'eva@example.com', subject: 'Via HTTP', text: 'Código 135790', attachments: [{ filename: 'c.pdf', content: pdf, contentType: 'application/pdf' }] })
    const r = await app.inject({ method: 'POST', url: '/api/ingest?from=nao-responda@triskel.com.br&to=eva@example.com', headers: { 'content-type': 'message/rfc822' }, payload: built.message as Buffer })
    expect(r.statusCode).toBe(201)
    const list = (await app.inject('/api/messages?to=eva@example.com')).json()
    expect(list.items[0]).toMatchObject({ subject: 'Via HTTP', code: '135790', hasAttachments: true })
    const m = (await app.inject(`/api/messages/${list.items[0].id}`)).json()
    expect((await app.inject(m.attachments[0].url)).rawPayload.equals(pdf)).toBe(true)
    expect((await app.inject({ method: 'POST', url: '/api/ingest', headers: { 'content-type': 'message/rfc822' }, payload: '' })).statusCode).toBe(400)
  })
  it('mantém só as últimas KEEP_MESSAGES e limpa a caixa', async () => {
    for (let i = 0; i < 4; i++) await tr().sendMail({ from: 'a@b.com', to: 'c@example.com', subject: 'm' + i, text: 'x' })
    expect((await app.inject('/api/messages')).json().total).toBeLessThanOrEqual(3)
    expect((await app.inject({ method: 'DELETE', url: '/api/messages' })).statusCode).toBe(204)
    expect((await app.inject('/api/messages')).json().total).toBe(0)
  })
  it('o HTML do e-mail é servido com CSP sandbox (sem scripts)', async () => {
    await tr().sendMail({ from: 'a@b.com', to: 'd@example.com', subject: 'xss', html: '<script>alert(1)</script><p>oi</p>' })
    const id = (await app.inject('/api/messages?to=d@example.com')).json().items[0].id
    const r = await app.inject('/view/' + id)
    expect(String(r.headers['content-security-policy'])).toContain('sandbox')
    expect(String(r.headers['content-security-policy'])).toContain("default-src 'none'")
  })
})
