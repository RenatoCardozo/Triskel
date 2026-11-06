// Aplica prisma/migrations/*/migration.sql e registra em _prisma_migrations (formato compatível com o Prisma).
// Uso local/CI quando `prisma migrate deploy` não está disponível. Em produção/Docker use `prisma migrate deploy`.
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import mariadb from 'mariadb'

const url = new URL(process.env.DATABASE_URL || 'mysql://triskel:triskel@127.0.0.1:3306/triskel')
const conn = await mariadb.createConnection({
  host: url.hostname, port: Number(url.port || 3306), user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password), database: url.pathname.slice(1), multipleStatements: true,
  ssl: process.env.DATABASE_SSL === 'true' ? (process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') } : { rejectUnauthorized: false }) : undefined,
})
await conn.query(`CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id VARCHAR(36) NOT NULL, checksum VARCHAR(64) NOT NULL, finished_at DATETIME(3) NULL,
  migration_name VARCHAR(255) NOT NULL, logs TEXT NULL, rolled_back_at DATETIME(3) NULL,
  started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), applied_steps_count INTEGER UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
const done = new Set((await conn.query('SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL')).map((r) => r.migration_name))
const dirs = fs.readdirSync('prisma/migrations').filter((d) => fs.existsSync(path.join('prisma/migrations', d, 'migration.sql'))).sort()
for (const d of dirs) {
  if (done.has(d)) continue
  const sql = fs.readFileSync(path.join('prisma/migrations', d, 'migration.sql'), 'utf8')
  console.log('aplicando', d)
  await conn.query(sql)
  await conn.query('INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count) VALUES (?, ?, NOW(3), ?, 1)',
    [crypto.randomUUID(), crypto.createHash('sha256').update(sql).digest('hex'), d])
}
await conn.end()
console.log('migrações em dia')
