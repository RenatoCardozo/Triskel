import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  SMTP_PORT: z.coerce.number().default(2525),
  WEB_PORT: z.coerce.number().default(4200),
  EMAILSIM_API_KEY: z.string().optional().transform((v) => v || undefined),
  DB_PATH: z.string().default('./data/email-sim.db'),
  MAX_MESSAGE_MB: z.coerce.number().default(15),
  KEEP_MESSAGES: z.coerce.number().default(500),
  LOG_LEVEL: z.string().default('info'),
})
const p = schema.safeParse(process.env)
if (!p.success) { console.error('Variáveis de ambiente inválidas:\n' + p.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n')); process.exit(1) }
export const env = p.data
