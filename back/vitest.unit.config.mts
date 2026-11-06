import { defineConfig } from 'vitest/config'
import base from './vitest.config.mts'

// Testes unitários: sem banco (só regras puras).
export default defineConfig({ test: { ...base.test, globalSetup: [], include: ['test/unit/**/*.test.ts'] } })
