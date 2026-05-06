import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', '.next'],
    },
    env: {
      JWT_SECRET: 'test_secret_key_for_jwt_minimum_32_characters_long',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
