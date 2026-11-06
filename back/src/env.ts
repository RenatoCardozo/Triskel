import 'dotenv/config'
import { z } from 'zod'

const bool = z.enum(['true', 'false']).transform((v) => v === 'true')
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  /** true: conexão TLS com o banco (provedores gerenciados exigem). Com DATABASE_CA_CERT o certificado é verificado; sem ele só criptografa. */
  DATABASE_SSL: bool.default(false),
  /** Conexões simultâneas com o banco. Planos gratuitos limitam (ex.: 3 a 5); reduza se aparecer "too many connections". */
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(50).default(10),
  /** PEM da CA do provedor (opcional). Aceita quebras de linha reais ou "\n" literal. */
  DATABASE_CA_CERT: z.string().optional(),
  PUBLIC_API_URL: z.string().default('http://localhost:4000'),
  PUBLIC_WEB_URL: z.string().default('http://localhost:3000'),
  /** URL do back vista pelo video-ai (rede interna do compose) */
  INTERNAL_API_URL: z.string().default('http://localhost:4000'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET precisa de 32+ caracteres'),
  ACCESS_TTL_SECONDS: z.coerce.number().default(900),
  REFRESH_TTL_SECONDS: z.coerce.number().default(60 * 60 * 24 * 14),
  BCRYPT_COST: z.coerce.number().min(12).default(12),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
  CODE_PEPPER: z.string().min(16),
  FILE_TOKEN_SECRET: z.string().min(16),
  STORAGE_DIR: z.string().default('./uploads'),
  MAX_VIDEO_MB: z.coerce.number().default(100),
  MAX_IMAGE_MB: z.coerce.number().default(5),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: bool.default(false),
  MAIL_FROM: z.string().default('Triskel <nao-responda@triskel.com.br>'),
  MAIL_ENABLED: bool.default(true),
  /** smtp (padrão) ou http: no http o back envia a mensagem MIME bruta para o email-sim (POST /api/ingest). */
  MAIL_TRANSPORT: z.enum(['smtp', 'http']).default('smtp'),
  MAIL_HTTP_URL: z.string().default('http://localhost:4200'),
  MAIL_HTTP_KEY: z.string().optional(),
  PAYMENT_API_URL: z.string().default('http://localhost:4100'),
  PAYMENT_API_KEY: z.string().default('sk_test_triskel'),
  PAYMENT_WEBHOOK_SECRET: z.string().min(16),
  VIDEOAI_API_URL: z.string().default('http://localhost:4300'),
  VIDEOAI_API_KEY: z.string().default('videoai_dev_key'),
  VIDEOAI_WEBHOOK_SECRET: z.string().min(16),
  PUBLICATION_CHECK_DELAY_MS: z.coerce.number().default(3000),
  JOBS_ENABLED: bool.default(true),
  LOG_LEVEL: z.string().default('info'),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:\n', parsed.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n'))
  process.exit(1)
}
export const env = parsed.data
// Em produção, nunca aceitar os valores de exemplo do .env.example.
if (env.NODE_ENV === 'production') {
  const weak = (['JWT_ACCESS_SECRET', 'CODE_PEPPER', 'FILE_TOKEN_SECRET', 'PAYMENT_WEBHOOK_SECRET', 'VIDEOAI_WEBHOOK_SECRET', 'PAYMENT_API_KEY', 'VIDEOAI_API_KEY'] as const).filter((k) => /troque|changeme|dev_key|sk_test_triskel/i.test(env[k]))
  if (weak.length) { console.error('Em produção, troque os valores de exemplo de: ' + weak.join(', ')); process.exit(1) }
}
export type Env = typeof env
