import { defineConfig } from 'vitest/config'

// Testes de integração usam um banco MySQL/MariaDB descartável (recriado a cada execução pelo globalSetup).
// Aponte TEST_DATABASE_URL para um banco de TESTE: ele é apagado e recriado.
const dbUrl = process.env.TEST_DATABASE_URL || 'mysql://triskel:triskel@127.0.0.1:3306/triskel_test'

export default defineConfig({
  test: {
    globalSetup: ['./test/setup/global.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: dbUrl,
      TEST_DATABASE_URL: dbUrl,
      JWT_ACCESS_SECRET: 'test-access-secret-0123456789-0123456789-abcdef',
      CODE_PEPPER: 'test-pepper-0123456789',
      FILE_TOKEN_SECRET: 'test-file-token-secret-0123456789',
      PAYMENT_WEBHOOK_SECRET: 'test-payment-webhook-secret-0123',
      VIDEOAI_WEBHOOK_SECRET: 'test-videoai-webhook-secret-0123',
      PAYMENT_API_URL: 'http://127.0.0.1:9',
      VIDEOAI_API_URL: 'http://127.0.0.1:9',
      MAIL_ENABLED: 'false',
      JOBS_ENABLED: 'false',
      STORAGE_DIR: './.test-uploads',
      LOG_LEVEL: 'silent',
      PUBLICATION_CHECK_DELAY_MS: '0',
      RATE_LIMIT_MAX: '100000',
      AUTH_RATE_LIMIT_MAX: '10',
    },
  },
})
