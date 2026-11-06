import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
import path from 'node:path'
import { env } from './env'

/** Armazenamento próprio do gateway (SQLite). Não guarda número de cartão nem CVV: só marca, final, validade e a regra de teste. */
export function openDb(file = env.DB_PATH) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS cards (
      ref TEXT PRIMARY KEY, brand TEXT NOT NULL, last4 TEXT NOT NULL, exp TEXT NOT NULL, holder TEXT NOT NULL,
      type TEXT NOT NULL, rule TEXT NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY, brand TEXT NOT NULL, last4 TEXT NOT NULL, exp TEXT NOT NULL, holder TEXT NOT NULL,
      type TEXT NOT NULL, rule TEXT NOT NULL, card_ref TEXT, expires_at INTEGER NOT NULL, used_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS charges (
      id TEXT PRIMARY KEY, external_ref TEXT NOT NULL UNIQUE, method TEXT NOT NULL, amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL, pix_payload TEXT, pix_txid TEXT, pix_e2e TEXT, expires_at INTEGER,
      card_brand TEXT, card_last4 TEXT, card_type TEXT, card_exp TEXT, card_holder TEXT, card_ref TEXT, save_card INTEGER DEFAULT 0, rule TEXT,
      tds_tries INTEGER NOT NULL DEFAULT 0, failure_code TEXT, failure_message TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS charges_status ON charges(status, expires_at);
    CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY, external_ref TEXT NOT NULL UNIQUE, amount_cents INTEGER NOT NULL, pix_key_masked TEXT NOT NULL,
      status TEXT NOT NULL, reason TEXT, due_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at INTEGER NOT NULL, last_status INTEGER, last_error TEXT, created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS events_due ON events(status, next_attempt_at);
  `)
  return db
}
export type Db = ReturnType<typeof openDb>
