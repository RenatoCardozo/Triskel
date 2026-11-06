import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(4300),
  VIDEOAI_API_KEY: z.string().min(12),
  WEBHOOK_SECRET: z.string().min(16),
  ALLOWED_FETCH_HOSTS: z.string().default('localhost:4000,127.0.0.1:4000,back:4000'),
  ALLOWED_CALLBACK_HOSTS: z.string().default('localhost:4000,127.0.0.1:4000,back:4000'),
  MAX_VIDEO_MB: z.coerce.number().default(200),
  DOWNLOAD_TIMEOUT_MS: z.coerce.number().default(120_000),
  JOB_CONCURRENCY: z.coerce.number().default(1),
  DB_PATH: z.string().default('./data/video-ai.db'),
  ANTHROPIC_API_KEY: z.string().optional().transform((v) => v || undefined),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-5-5'),
  WEBHOOK_BACKOFF_BASE_MS: z.coerce.number().default(1000),
  WEBHOOK_MAX_ATTEMPTS: z.coerce.number().default(6),
  LOG_LEVEL: z.string().default('info'),
})
const p = schema.safeParse(process.env)
if (!p.success) { console.error('Variáveis de ambiente inválidas:\n' + p.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n')); process.exit(1) }
export const env = p.data
export const hostsOf = (s: string) => s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)
