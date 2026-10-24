import { defineConfig } from 'vite';

const API_PORT = process.env.API_PORT || 8787;

export default defineConfig({
  server: {
    port: 5180,
    host: true,
    proxy: {
      '/api': `http://localhost:${API_PORT}`,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
