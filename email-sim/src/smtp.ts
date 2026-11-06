import { SMTPServer } from 'smtp-server'
import { env } from './env'
import { saveRaw, Store } from './store'

/** SMTP de captura: aceita qualquer remetente/destinatário e guarda a mensagem. Não repassa nada para fora. */
export function startSmtp(db: Store, log: { info: (...a: any[]) => void; error: (...a: any[]) => void }) {
  const server = new SMTPServer({
    authOptional: true, secure: false, disabledCommands: ['STARTTLS'], allowInsecureAuth: true,
    size: env.MAX_MESSAGE_MB * 1024 * 1024, maxClients: 50,
    onAuth: (_a, _s, cb) => cb(null, { user: 'sim' }),
    onData(stream, session, cb) {
      const chunks: Buffer[] = []
      let size = 0
      stream.on('data', (c: Buffer) => { size += c.length; if (size <= env.MAX_MESSAGE_MB * 1024 * 1024) chunks.push(c) })
      stream.on('end', async () => {
        if ((stream as any).sizeExceeded) { const e: any = new Error('Mensagem maior que o limite'); e.responseCode = 552; return cb(e) }
        try { const id = await saveRaw(db, Buffer.concat(chunks), { from: session.envelope.mailFrom ? session.envelope.mailFrom.address : false, to: session.envelope.rcptTo.map((r) => r.address) }); log.info({ id }, 'e-mail capturado'); cb() }
        catch (e) { log.error(e); cb(new Error('Falha ao processar a mensagem')) }
      })
    },
    logger: false,
  })
  server.on('error', (e) => log.error(e))
  return new Promise<SMTPServer>((resolve) => server.listen(env.SMTP_PORT, '0.0.0.0', () => resolve(server)))
}
