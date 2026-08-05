import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/ornglobal_new/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  }
})