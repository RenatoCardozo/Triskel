import pino from 'pino'
import { env } from '../env'

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash', '*.cardToken', '*.code', '*.token'], censor: '[redigido]' },
})
