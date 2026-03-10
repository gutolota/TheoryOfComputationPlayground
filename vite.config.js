import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/meu-simulador/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Obriga o Vite a escutar na rede (0.0.0.0)
    allowedHosts: ['geores-626579', 'geores-626579.local'], // Lista de hostnames permitidos
  }
})
