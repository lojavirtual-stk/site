import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🚀 Configuração do Vite
export default defineConfig({
  plugins: [react()],
  base: '/site/', // importante para GitHub Pages (o repositório é /site)
  server: {
    port: 3000,
  },
})
