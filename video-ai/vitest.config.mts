import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 60_000,
    env: {
      VIDEOAI_API_KEY: 'unit-videoai-key-123', WEBHOOK_SECRET: 'unit-webhook-secret-0123456789', DB_PATH: ':memory:',
      ALLOWED_FETCH_HOSTS: '127.0.0.1:45871', ALLOWED_CALLBACK_HOSTS: '127.0.0.1:45872', WEBHOOK_BACKOFF_BASE_MS: '10', LOG_LEVEL: 'silent',
    },
  },
})
