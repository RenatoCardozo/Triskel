import 'dotenv/config'
import { z } from 'zod'

const bool = z.enum(['true', 'false']).transform((v) => v === 'true')
const schema = z.object({
  PORT: z.coerce.number().default(4100),
  PAYSIM_API_KEY: z.string().min(12),
  PAYSIM_PUBLIC_KEY: z.string().min(12),
  PAYSIM_ADMIN_KEY: z.string().min(12),
  WEBHOOK_URL: z.string().url().optional(),
  WEBHOOK_SECRET: z.string().min(16),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  DB_PATH: z.string().default('./data/payment-sim.db'),
  PIX_TTL_SECONDS: z.coerce.number().default(600),
  PIX_AUTOPAY_SECONDS: z.coerce.number().default(0),
  PAYOUT_AUTO: bool.default(true),
  PAYOUT_DELAY_MS: z.coerce.number().default(1500),
  PIX_KEY: z.string().default('pagamentos@triskel.simulado'),
  WEBHOOK_BACKOFF_BASE_MS: z.coerce.number().default(1000),
  WEBHOOK_MAX_ATTEMPTS: z.coerce.number().default(6),
  LOG_LEVEL: z.string().default('info'),
})
const p = schema.safeParse(process.env)
if (!p.success) {
  console.error('Variáveis de ambiente inválidas:\n' + p.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n'))
  process.exit(1)
}
export const env = p.data
