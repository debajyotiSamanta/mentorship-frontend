import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('pusher')) {
              return 'vendor-pusher';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            return 'vendor-other';
          }
        },
      },
    },
    sourcemap: false, // Don't generate source maps in production
    chunkSizeWarningLimit: 1000,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
})
