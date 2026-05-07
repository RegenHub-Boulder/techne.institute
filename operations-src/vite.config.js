import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/operations/',
  build: {
    outDir: '../operations',
    emptyOutDir: true,
  },
})
