import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { en } from '../src/content/en.js';
import { fr } from '../src/content/fr.js';
import { createTestApp, escapeHtml } from './create-test-app.js';

describe('Pages (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('renders the French home page at /', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200).expect('Content-Type', /html/);
    expect(res.text).toContain('<html lang="fr">');
    expect(res.text).toContain(`<title>${escapeHtml(fr.meta.homeTitle)}</title>`);
    expect(res.text).toContain(escapeHtml(fr.hero.headline));
    expect(res.text).toContain('href="/en"');
  });

  it('renders the English home page at /en', async () => {
    const res = await request(app.getHttpServer()).get('/en').expect(200);
    expect(res.text).toContain('<html lang="en">');
    expect(res.text).toContain(escapeHtml(en.hero.headline));
    expect(res.text).toContain(escapeHtml(en.footer.tagline));
  });

  it('declares both language versions with absolute hreflang links', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.text).toContain('<link rel="canonical" href="https://helloperformia.com/" />');
    expect(res.text).toContain('<link rel="alternate" hreflang="fr" href="https://helloperformia.com/" />');
    expect(res.text).toContain('<link rel="alternate" hreflang="en" href="https://helloperformia.com/en" />');
  });

  it('shows the confirmed contact details in the footer', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.text).toContain('href="tel:+237651544974"');
    expect(res.text).toContain('href="https://wa.me/237651544974"');
    expect(res.text).toContain('contact@helloperformia.com');
    expect(res.text).toContain('Yaoundé, Douala, Cameroun');
  });

  it('sends security headers and sets no cookies on the home page', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    const csp = res.headers['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('serves the stylesheet, fonts and images locally', async () => {
    const server = app.getHttpServer();
    await request(server).get('/css/app.css').expect(200).expect('Content-Type', /css/);
    await request(server).get('/fonts/dm-sans-latin-wght-normal.woff2').expect(200);
    await request(server).get('/img/hero.jpg').expect(200);
    await request(server).get('/img/favicon.svg').expect(200);
  });
});
