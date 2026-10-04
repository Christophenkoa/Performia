import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { SiteContent } from '../src/content/content.types.js';
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

  const sectionTitles = (t: SiteContent) => [
    t.hero.headline,
    t.trustBlock.title,
    t.problem.title,
    t.solution.title,
    t.howItWorks.title,
    t.difference.title,
    t.subjects.title,
    t.targetAudience.title,
    t.partnership.title,
    t.testimonials.title,
    t.teacherRecruitment.title,
    t.finalCta.title,
  ];

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
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("img-src 'self';");
    expect(csp).not.toContain('data:');
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

  it.each([
    ['/', fr],
    ['/en', en],
  ])('renders every home section in order at %s', async (path, t) => {
    const res = await request(app.getHttpServer()).get(path).expect(200);
    const positions = sectionTitles(t).map((title) => res.text.indexOf(escapeHtml(title)));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('renders section details: steps, subjects, levels, testimonials, partner logo', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    for (const step of fr.howItWorks.steps) expect(res.text).toContain(escapeHtml(step.title));
    for (const card of fr.subjects.cards) expect(res.text).toContain(escapeHtml(card.title));
    for (const level of fr.targetAudience.levels) expect(res.text).toContain(`>${escapeHtml(level)}<`);
    for (const card of fr.testimonials.cards) expect(res.text).toContain(escapeHtml(card.name));
    expect(res.text).toContain('id="approach"');
    expect(res.text).toContain('src="/img/suku.png"');
    await request(app.getHttpServer()).get('/img/suku.png').expect(200).expect('Content-Type', /png/);
  });

  it('renders a localized HTML 404 page that search engines skip', async () => {
    const frRes = await request(app.getHttpServer()).get('/does-not-exist').expect(404);
    expect(frRes.headers['content-type']).toMatch(/html/);
    expect(frRes.text).toContain(escapeHtml(fr.errorPage.notFound.title));
    expect(frRes.text).toContain('<meta name="robots" content="noindex" />');
    expect(frRes.text).not.toContain('rel="canonical"');
    const enRes = await request(app.getHttpServer()).get('/en/does-not-exist').expect(404);
    expect(enRes.text).toContain(escapeHtml(en.errorPage.notFound.title));
    expect(enRes.text).toContain('<html lang="en">');
  });

  it('keeps normal pages indexable', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.text).toContain('rel="canonical"');
    expect(res.text).not.toContain('noindex');
  });
});
