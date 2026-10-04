import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { en } from '../src/content/en.js';
import { fr } from '../src/content/fr.js';
import { createTestApp, escapeHtml } from './create-test-app.js';

describe('Contact page (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('renders the French form with a CSRF token, honeypot and contact details', async () => {
    const res = await request(app.getHttpServer()).get('/contact').expect(200);
    expect(res.text).toContain(`<title>${escapeHtml(fr.meta.contactTitle)}</title>`);
    expect(res.text).toContain('<form method="post" action="/contact"');
    expect(res.text).toMatch(/name="_csrf" value="[0-9a-f]{64}\.[0-9a-f]+"/);
    expect(res.text).toContain('name="website"');
    for (const field of ['name', 'email', 'phone', 'subject', 'message']) {
      expect(res.text).toContain(`name="${field}"`);
    }
    expect(res.text).toContain(escapeHtml(fr.contact.info.address));
    expect(res.text).toContain(escapeHtml(fr.contact.info.hours));
    expect(res.text).not.toContain(escapeHtml(fr.contact.success));
  });

  it('sets the session and CSRF cookies only on the contact page', async () => {
    const res = await request(app.getHttpServer()).get('/contact').expect(200);
    const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
    expect(cookies.some((c) => c.startsWith('pf_sid=') && /HttpOnly/i.test(c))).toBe(true);
    expect(cookies.some((c) => c.startsWith('pf_csrf=') && /HttpOnly/i.test(c))).toBe(true);
  });

  it('renders the English form posting to /en/contact', async () => {
    const res = await request(app.getHttpServer()).get('/en/contact').expect(200);
    expect(res.text).toContain('<html lang="en">');
    expect(res.text).toContain('<form method="post" action="/en/contact"');
    expect(res.text).toContain(escapeHtml(en.contact.form.submit));
    expect(res.text).toContain('href="/contact"');
  });

  it('shows the success message after a redirect with ?sent=1', async () => {
    const res = await request(app.getHttpServer()).get('/contact?sent=1').expect(200);
    expect(res.text).toContain(escapeHtml(fr.contact.success));
  });

  it('rejects a POST without a CSRF token with a localized 403 page', async () => {
    const resFr = await request(app.getHttpServer()).post('/contact').type('form').send({ name: 'x' }).expect(403);
    expect(resFr.text).toContain(escapeHtml(fr.errorPage.title));
    const resEn = await request(app.getHttpServer()).post('/en/contact').type('form').send({ name: 'x' }).expect(403);
    expect(resEn.text).toContain(escapeHtml(en.errorPage.title));
    expect(resFr.text).toContain('<meta name="robots" content="noindex" />');
    expect(resFr.text).not.toContain('rel="canonical"');
    expect(resFr.text).not.toContain('rel="alternate"');
  });

  it('is never cached, because it embeds a per-visitor CSRF token', async () => {
    const server = app.getHttpServer();
    await request(server).get('/contact').expect(200).expect('Cache-Control', 'no-store');
    await request(server).get('/en/contact').expect(200).expect('Cache-Control', 'no-store');
  });

  it('uses the Performia layout on the contact page', async () => {
    const res = await request(app.getHttpServer()).get('/contact').expect(200);
    expect(res.text).toContain('<p class="eyebrow">Performia</p>');
    expect(res.text).toContain('class="rounded-3xl border border-line bg-white p-8 shadow-sm md:p-10"');
  });
});
