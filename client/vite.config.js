import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt')
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss('./tailwind.config.cjs')]
    }
  },
  build: {
    sourcemap: false, // 👈 This disables exposing source maps in production
    minify: 'esbuild', // Optional: 'terser' is slower but can be more aggressive
    outDir: 'dist',    // Default output directory, can be customized
    target: 'esnext'   // Good for modern browsers
  }
});
