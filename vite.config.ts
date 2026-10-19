import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/loan-or-lease/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
