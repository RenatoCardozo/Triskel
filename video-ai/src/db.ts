import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { env } from './env'

export function openDb(file = env.DB_PATH) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, status TEXT NOT NULL, input TEXT NOT NULL, result TEXT, error TEXT,
      callback_url TEXT NOT NULL, cb_status TEXT NOT NULL DEFAULT 'none', cb_attempts INTEGER NOT NULL DEFAULT 0, cb_next INTEGER, cb_last_error TEXT,
      created_at INTEGER NOT NULL, started_at INTEGER, finished_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status, created_at);
  `)
  return db
}
export type Db = ReturnType<typeof openDb>
