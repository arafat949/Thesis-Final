import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [preact()],
  server: {
    port: 4300,
    cors: true,
    headers: {
      // Security headers for the iframe
      'X-Frame-Options': 'ALLOWALL', // Will be restricted per session in production
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:4400",
    },
  },
  build: {
    outDir: resolve(__dirname, '../../dist/apps/payment-fields'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        field: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@amaderPay/web-sdk': resolve(__dirname, '../../libs/web-sdk/src/index.ts'),
    },
  },
});
