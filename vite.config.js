import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/TheoryOfComputationPlayground/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Obriga o Vite a escutar na rede (0.0.0.0)
  }
})
