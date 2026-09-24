import type { Environment } from './types';

export interface EnvironmentConfig {
  iframeOrigin: string;
  apiOrigin: string;
}

export const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  sandbox: {
    iframeOrigin: 'http://localhost:4300', // hosted fields is running on localhost:4300
    apiOrigin: 'http://localhost:4400',
  },
  production: {
    iframeOrigin: 'https://js.halalpay.com',
    apiOrigin: 'https://api.halalpay.com',
  },
};

export const DEFAULT_LOCALE = 'en-US';

export const FIELD_IFRAME_PATHS: Record<string, string> = {
  cardNumber: '/index.html',
};

export const DEFAULT_STYLES = {
  base: {
    color: '#1a1a1a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  focus: {},
  valid: {
    color: '#1a1a1a',
  },
  invalid: {
    color: '#dc2626',
  },
  placeholder: {
    color: '#9ca3af',
  },
};

export const TOKENIZE_TIMEOUT_MS = 30000;
export const READY_TIMEOUT_MS = 10000;
export const MESSAGE_TIMEOUT_MS = 5000;
