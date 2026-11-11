import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    // Turn off debug mode in production: drop console.log and debugger statements
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
    build: {
      // Disable sourcemaps in production so source code is not exposed in browser devtools
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            three: ['three'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true
        }
      }
    }
  };
})
