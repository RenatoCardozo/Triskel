import { defineConfig } from 'vitest/config'

export default defineConfig({ test: { env: { SMTP_PORT: '25251', WEB_PORT: '42001', LOG_LEVEL: 'silent', KEEP_MESSAGES: '3' } } })
