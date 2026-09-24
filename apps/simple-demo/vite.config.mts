import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  server: {
    port: 5500,
  },
  resolve: {
    alias: {
      '@amaderPay/web-sdk': resolve(__dirname, '../../libs/web-sdk/src/index.ts'),
    },
  },
});
