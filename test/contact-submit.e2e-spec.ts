import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ContactNotifier } from '../src/contact/contact-notifier.js';
import { en } from '../src/content/en.js';
import { fr } from '../src/content/fr.js';
import { createTestApp, escapeHtml } from './create-test-app.js';

type Agent = ReturnType<typeof request.agent>;

const valid = {
  name: 'Awa Nkoa',
  email: 'awa@example.com',
  phone: '+237 651 544 974',
  subject: 'Inscription en Seconde',
  message: 'Bonjour, je souhaite inscrire ma fille en Seconde.',
};

async function openForm(agent: Agent, path: string): Promise<string> {
  const res = await agent.get(path).expect(200);
  const match = /name="_csrf" value="([^"]+)"/.exec(res.text);
  if (!match) throw new Error(`No CSRF token on ${path}`);
  return match[1];
}

describe('Contact submission (e2e)', () => {
  let app: NestExpressApplication;
  let notify: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    notify = vi.fn().mockResolvedValue(undefined);
    app = await createTestApp([{ provide: ContactNotifier, useValue: { notify } }]);
  });

  afterEach(async () => {
    await app.close();
  });

  it('accepts a valid French request and redirects to the success message', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = await openForm(agent, '/contact');
    await agent.post('/contact').type('form').send({ ...valid, _csrf: token }).expect(303).expect('Location', '/contact?sent=1');
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ ...valid, lang: 'fr', receivedAt: expect.any(Date) }));
  });

  it('accepts a valid English request and redirects to the English page', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = await openForm(agent, '/en/contact');
    await agent.post('/en/contact').type('form').send({ ...valid, _csrf: token }).expect(303).expect('Location', '/en/contact?sent=1');
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ lang: 'en' }));
  });

  it('re-renders the form with localized errors and the submitted values', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = await openForm(agent, '/contact');
    const res = await agent.post('/contact').type('form').send({ ...valid, email: 'nope', _csrf: token }).expect(400);
    expect(res.text).toContain(escapeHtml(fr.contact.errorSummary));
    expect(res.text).toContain(escapeHtml(fr.contact.errors.email));
    expect(res.text).not.toContain(escapeHtml(fr.contact.errors.name));
    expect(res.text).toContain('value="Awa Nkoa"');
    expect(res.text).toContain('aria-invalid="true" aria-describedby="email-error"');
    expect(res.text).toMatch(/name="_csrf" value="[^"]+"/);
    expect(notify).not.toHaveBeenCalled();
  });

  it('localizes errors on the English form', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = await openForm(agent, '/en/contact');
    const res = await agent.post('/en/contact').type('form').send({ ...valid, message: 'short', _csrf: token }).expect(400);
    expect(res.text).toContain(escapeHtml(en.contact.errors.message));
  });

  it('escapes submitted values when re-rendering', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = await openForm(agent, '/contact');
    const res = await agent
      .post('/contact')
      .type('form')
      .send({ ...valid, name: '<script>alert(1)</script>', email: 'nope', _csrf: token })
      .expect(400);
    expect(res.text).not.toContain('<script>alert(1)</script>');
    expect(res.text).toContain('&lt;script&gt;');
  });

  it('silently drops requests that fill the honeypot', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = await openForm(agent, '/contact');
    await agent.post('/contact').type('form').send({ ...valid, website: 'https://spam.example', _csrf: token }).expect(303).expect('Location', '/contact?sent=1');
    expect(notify).not.toHaveBeenCalled();
  });

  it('rejects a token issued to another visitor', async () => {
    const alice = request.agent(app.getHttpServer());
    const bob = request.agent(app.getHttpServer());
    const aliceToken = await openForm(alice, '/contact');
    await openForm(bob, '/contact');
    await bob.post('/contact').type('form').send({ ...valid, _csrf: aliceToken }).expect(403);
    expect(notify).not.toHaveBeenCalled();
  });

  it('rate-limits to 5 submissions per minute', async () => {
    const agent = request.agent(app.getHttpServer());
    const token = await openForm(agent, '/contact');
    for (let i = 0; i < 5; i++) {
      await agent.post('/contact').type('form').send({ ...valid, _csrf: token }).expect(303);
    }
    await agent.post('/contact').type('form').send({ ...valid, _csrf: token }).expect(429);
    expect(notify).toHaveBeenCalledTimes(5);
  });
});
