import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      PAYSIM_API_KEY: 'sk_test_unit_key_123', PAYSIM_PUBLIC_KEY: 'pk_test_unit_key_123', PAYSIM_ADMIN_KEY: 'adm_test_unit_key_123',
      WEBHOOK_SECRET: 'unit-webhook-secret-0123456789', WEBHOOK_URL: 'http://backend.test/webhooks/payments', WEBHOOK_BACKOFF_BASE_MS: '1000', LOG_LEVEL: 'silent',
    },
  },
})
