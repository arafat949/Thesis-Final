/// <reference types='vitest' />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/checkout-demo',
  server: {
    port: 8200,
    host: 'localhost',
  },
  preview: {
    port: 8200,
    host: 'localhost',
  },
  plugins: [react()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@amaderPay/web-sdk': resolve(__dirname, '../../libs/web-sdk/src/index.ts'),
    },
  },
}));
