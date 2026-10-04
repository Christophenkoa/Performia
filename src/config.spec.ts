import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('uses development defaults', () => {
    const config = loadConfig({});
    expect(config.port).toBe(3000);
    expect(config.isProduction).toBe(false);
    expect(config.trustProxy).toBe(false);
    expect(config.csrfSecret).toMatch(/^[0-9a-f]{64}$/);
  });

  it('reads PORT, TRUST_PROXY and CSRF_SECRET', () => {
    const config = loadConfig({ PORT: '8080', TRUST_PROXY: 'true', CSRF_SECRET: 'dev-secret' });
    expect(config).toEqual({ port: 8080, isProduction: false, trustProxy: true, csrfSecret: 'dev-secret' });
  });

  it('rejects an invalid PORT', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow('PORT must be an integer between 1 and 65535');
  });

  it('requires a CSRF_SECRET of at least 32 characters in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' })).toThrow('CSRF_SECRET');
    expect(() => loadConfig({ NODE_ENV: 'production', CSRF_SECRET: 'short' })).toThrow('CSRF_SECRET');
    const secret = 'a'.repeat(32);
    expect(loadConfig({ NODE_ENV: 'production', CSRF_SECRET: secret })).toMatchObject({ isProduction: true, csrfSecret: secret });
  });
});
