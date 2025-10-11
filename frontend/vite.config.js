import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/https://github.com/lojavirtual-stk/site/' // 👈 importante: deve ser igual ao nome do repositório ou subpasta do GitHub Pages
})
