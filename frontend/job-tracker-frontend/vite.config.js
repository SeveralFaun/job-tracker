import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: 'localhost',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    'process.env': process.env,
  },
})
