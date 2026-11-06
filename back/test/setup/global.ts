import { execFileSync } from 'node:child_process'
import path from 'node:path'
import mariadb from 'mariadb'

/** Recria o banco de teste e aplica as migrações. Roda uma vez por execução do vitest. */
export default async function setup() {
  const raw = process.env.TEST_DATABASE_URL || 'mysql://triskel:triskel@127.0.0.1:3306/triskel_test'
  const u = new URL(raw)
  const name = u.pathname.slice(1)
  if (!/test/i.test(name)) throw new Error(`Recuso apagar o banco "${name}": o nome precisa conter "test".`)
  let conn
  try {
    conn = await mariadb.createConnection({ host: u.hostname, port: Number(u.port || 3306), user: decodeURIComponent(u.username), password: decodeURIComponent(u.password) })
  } catch (e) {
    throw new Error(`Não consegui conectar ao MySQL/MariaDB de teste (${u.hostname}:${u.port || 3306}). Suba o banco ou ajuste TEST_DATABASE_URL. ${(e as Error).message}`)
  }
  await conn.query(`DROP DATABASE IF EXISTS \`${name}\``)
  await conn.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
  await conn.end()
  execFileSync('node', ['scripts/apply-migrations.mjs'], { cwd: path.resolve(__dirname, '../..'), env: { ...process.env, DATABASE_URL: raw }, stdio: 'pipe' })
}
