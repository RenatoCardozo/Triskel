import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/prisma/client'
import { env } from './env'

function adapterFromUrl(raw: string) {
  const u = new URL(raw)
  return new PrismaMariaDb({
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    connectionLimit: env.DATABASE_POOL_SIZE,
    timezone: 'Z',
    ssl: env.DATABASE_SSL ? (env.DATABASE_CA_CERT ? { ca: env.DATABASE_CA_CERT.replace(/\\n/g, '\n') } : { rejectUnauthorized: false }) : undefined,
  })
}

export const prisma = new PrismaClient({ adapter: adapterFromUrl(env.DATABASE_URL) })
export type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
export type Db = typeof prisma | Tx
