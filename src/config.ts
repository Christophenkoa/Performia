import { randomBytes } from 'node:crypto';

export interface AppConfig {
  port: number;
  isProduction: boolean;
  csrfSecret: string;
  trustProxy: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const isProduction = env.NODE_ENV === 'production';

  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${env.PORT}"`);
  }

  const csrfSecret = env.CSRF_SECRET ?? '';
  if (isProduction && csrfSecret.length < 32) {
    throw new Error('CSRF_SECRET must be set to at least 32 characters in production');
  }

  return {
    port,
    isProduction,
    // Outside production a random secret is fine: tokens only need to survive one process.
    csrfSecret: csrfSecret || randomBytes(32).toString('hex'),
    trustProxy: env.TRUST_PROXY === 'true',
  };
}
