import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('firebase')) return 'firebase'
            if (id.includes('tailwindcss')) return 'tailwind'
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1700 
  }
})
