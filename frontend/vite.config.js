import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Use classic JSX transform for better compatibility
      jsxRuntime: 'classic',
      // Ensure React is properly injected
      inject: true,
      // Add babel options for better compatibility
      babel: {
        plugins: [
          // This helps with React.Children issues
          ['@babel/plugin-transform-react-jsx', { runtime: 'classic' }]
        ]
      }
    }),
    tailwindcss(),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('tailwindcss')) return 'tailwind';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1700
  },
  // Add resolve aliases to ensure consistent React version
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },
  // Ensure React is properly defined in optimizeDeps
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});