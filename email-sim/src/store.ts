import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { ParsedMail, simpleParser } from 'mailparser'
import { env } from './env'

export function openStore(file = env.DB_PATH) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, received_at INTEGER NOT NULL, from_addr TEXT NOT NULL, to_addrs TEXT NOT NULL, subject TEXT NOT NULL,
      text TEXT, html TEXT, read INTEGER NOT NULL DEFAULT 0, code TEXT, raw_size INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attachments (
      message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE, n INTEGER NOT NULL, filename TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL, data BLOB NOT NULL,
      PRIMARY KEY (message_id, n)
    );
    CREATE INDEX IF NOT EXISTS messages_time ON messages(received_at DESC);
  `)
  db.exec('PRAGMA foreign_keys = ON')
  return db
}
export type Store = ReturnType<typeof openStore>

/** Código de 6 dígitos (verificação de e-mail) destacado no texto, para facilitar testes. */
export const extractCode = (text: string) => /(?<!\d)(\d{6})(?!\d)/.exec(text)?.[1] ?? null
const addrs = (a: ParsedMail['to']) => (a ? (Array.isArray(a) ? a : [a]).flatMap((x) => x.value.map((v) => (v.address || '').toLowerCase())) : [])

export async function saveRaw(db: Store, raw: Buffer, envelope?: { from?: string | false; to?: string[] }) {
  const m = await simpleParser(raw)
  const id = crypto.randomUUID()
  const to = [...new Set([...addrs(m.to), ...addrs(m.cc), ...(envelope?.to ?? []).map((x) => x.toLowerCase())])]
  const text = m.text ?? ''
  db.prepare('INSERT INTO messages (id, received_at, from_addr, to_addrs, subject, text, html, code, raw_size) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, Date.now(), (m.from?.value[0]?.address || (envelope?.from as string) || '').toLowerCase(), JSON.stringify(to), m.subject || '(sem assunto)', text, typeof m.html === 'string' ? m.html : null, extractCode(text), raw.length)
  m.attachments.forEach((a, n) => db.prepare('INSERT INTO attachments (message_id, n, filename, content_type, size, data) VALUES (?,?,?,?,?,?)').run(id, n, a.filename || `anexo-${n + 1}`, a.contentType, a.size, a.content))
  db.prepare('DELETE FROM messages WHERE id IN (SELECT id FROM messages ORDER BY received_at DESC LIMIT -1 OFFSET ?)').run(env.KEEP_MESSAGES)
  return id
}
