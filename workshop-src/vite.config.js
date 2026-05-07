import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/workshop/',
  build: {
    outDir: '../workshop',
    emptyOutDir: false, // keep favicon.svg
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
