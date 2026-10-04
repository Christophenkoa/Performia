# Language Query Parameter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Select the language with `?lang=en` on a single URL per page, keep French as the default, and redirect the old `/en` URLs permanently.

**Architecture:** The language is parsed with one function (`parseLang`) and every internal URL is built with one function (`pathFor`). Controllers read `@Query('lang')`; the error filter reads `req.query.lang`. Templates do not change: they already consume `links.*`, `switchPath`, `alternates` and `currentPath` from the view model.

**Tech Stack:** NestJS 12 (ESM), Express 5 query parsing, Handlebars, Vitest 4 + supertest.

**Spec:** `docs/superpowers/specs/2026-10-04-lang-query-param-design.md`

## Global Constraints

- `parseLang(value)` returns `'en'` only for the exact string `'en'`; everything else (undefined, `'fr'`, `'EN'`, `'de'`, arrays) returns `'fr'`.
- URLs: home `/` and `/?lang=en`; contact `/contact` and `/contact?lang=en`; contact sent `/contact?sent=1` and `/contact?lang=en&sent=1` (`lang` first).
- `GET /en` -> 301 `/?lang=en`; `GET /en/contact` -> 301 `/contact?lang=en`. No other `/en` routes.
- CSRF/session middleware mounted on `['/contact']` only. Home stays cookie-free.
- Handlebars escapes `=` as `&#x3D;` in attributes; tests compare HTML attributes through `escapeHtml(...)`.
- Every relative TS import ends in `.js`; Vitest globals; no em-dashes.
- Commits: `git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "..."`, message ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

### Task 1: Language from the query string

**Files:**
- Modify: `src/content/view-model.ts`, `src/content/view-model.spec.ts`, `src/pages/pages.controller.ts`, `src/contact/contact.controller.ts`, `src/setup-app.ts`, `src/errors/http-exception.filter.ts`, `test/pages.e2e-spec.ts`, `test/contact-page.e2e-spec.ts`, `test/contact-submit.e2e-spec.ts`

**Interfaces:**
- Produces: `parseLang(value: unknown): Lang`; `pathFor(lang: Lang, page: PageId, query?: Record<string, string>): string` (exported from `src/content/view-model.ts`). `langFromPath` is removed.

- [ ] **Step 1: Unit tests for `parseLang` and `pathFor`**

In `src/content/view-model.spec.ts`, change the import to `import { buildViewModel, parseLang, pathFor, type PageId } from './view-model.js';` and replace the `describe('pathFor', ...)` block with:

```ts
describe('parseLang', () => {
  it.each([
    ['en', 'en'],
    [undefined, 'fr'],
    ['fr', 'fr'],
    ['EN', 'fr'],
    ['de', 'fr'],
    [['en', 'fr'], 'fr'],
    ['', 'fr'],
  ])('%j -> %s', (value, expected) => {
    expect(parseLang(value)).toBe(expected);
  });
});

describe('pathFor', () => {
  it.each([
    ['fr', 'home', '/'],
    ['en', 'home', '/?lang=en'],
    ['fr', 'contact', '/contact'],
    ['en', 'contact', '/contact?lang=en'],
  ])('%s %s -> %s', (lang, page, expected) => {
    expect(pathFor(lang as Lang, page as PageId)).toBe(expected);
  });

  it('appends extra parameters after lang', () => {
    expect(pathFor('fr', 'contact', { sent: '1' })).toBe('/contact?sent=1');
    expect(pathFor('en', 'contact', { sent: '1' })).toBe('/contact?lang=en&sent=1');
  });
});
```

In the same file, update the two `buildViewModel` expectations:
- French contact test: `alternates: { fr: '/contact', en: '/contact?lang=en' }`, `switchPath: '/contact?lang=en'` (other keys unchanged).
- English home test: `currentPath: '/?lang=en'`, `switchPath: '/'`, `links: { home: '/?lang=en', contact: '/contact?lang=en' }`.

Run: `npx vitest run src/content/view-model.spec.ts`
Expected: FAIL (`parseLang` is not exported; paths still `/en`).

- [ ] **Step 2: Implement `parseLang` and `pathFor`**

In `src/content/view-model.ts`, replace the `pathFor` function with:

```ts
// One rule for the whole site: only the exact value "en" selects English.
export function parseLang(value: unknown): Lang {
  return value === 'en' ? 'en' : 'fr';
}

export function pathFor(lang: Lang, page: PageId, query: Record<string, string> = {}): string {
  const base = page === 'home' ? '/' : '/contact';
  const params = new URLSearchParams();
  if (lang === 'en') params.set('lang', 'en');
  for (const [key, value] of Object.entries(query)) params.set(key, value);
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}
```

Run: `npx vitest run src/content/view-model.spec.ts`
Expected: PASS.

- [ ] **Step 3: Update the e2e tests to the new URLs (they will fail)**

`test/pages.e2e-spec.ts`:
- In 'renders the French home page at /': replace `expect(res.text).toContain('href="/en"');` with `expect(res.text).toContain(\`href="${escapeHtml('/?lang=en')}"\`);`.
- Rename 'renders the English home page at /en' to 'renders the English home page at /?lang=en' and request `'/?lang=en'`.
- In 'declares both language versions with absolute hreflang links': replace the `hreflang="en"` expectation with ``expect(res.text).toContain(`<link rel="alternate" hreflang="en" href="${escapeHtml('https://helloperformia.com/?lang=en')}" />`);``.
- In both `it.each` tables (section order and section details), replace `['/en', en]` with `['/?lang=en', en]`.
- In the 404 test, request `'/does-not-exist?lang=en'` instead of `'/en/does-not-exist'`.
- In the brand test loop, use `['/', '/?lang=en', '/contact', '/contact?lang=en', '/does-not-exist']`.
- Add inside the `describe`:

```ts
  it('redirects the old /en URLs permanently', async () => {
    const server = app.getHttpServer();
    await request(server).get('/en').expect(301).expect('Location', '/?lang=en');
    await request(server).get('/en/contact').expect(301).expect('Location', '/contact?lang=en');
  });

  it('falls back to French for unknown lang values', async () => {
    for (const path of ['/?lang=de', '/?lang=EN', '/?lang=en&lang=fr']) {
      const res = await request(app.getHttpServer()).get(path).expect(200);
      expect(res.text).toContain('<html lang="fr">');
    }
  });

  it('keeps the language in every internal link on English pages', async () => {
    const res = await request(app.getHttpServer()).get('/?lang=en').expect(200);
    expect(res.text).toContain(`<link rel="canonical" href="${escapeHtml('https://helloperformia.com/?lang=en')}" />`);
    expect(res.text).toContain(`href="${escapeHtml('/contact?lang=en')}"`);
    expect(res.text).toContain(`href="${escapeHtml('/?lang=en#matieres')}"`);
    expect(res.text).toContain('href="/"');
    expect(res.text).not.toMatch(/href="\/en/);
  });
```

`test/contact-page.e2e-spec.ts`:
- Rename 'renders the English form posting to /en/contact' to 'renders the English form posting to /contact?lang=en'; request `'/contact?lang=en'`; expect ```<form method="post" action="${escapeHtml('/contact?lang=en')}"` `` instead of the `/en/contact` action.
- In the 403 test, post to `'/contact?lang=en'` instead of `'/en/contact'`.
- In the no-store test, request `'/contact?lang=en'` instead of `'/en/contact'`.

`test/contact-submit.e2e-spec.ts`:
- 'accepts a valid English request...': `openForm(agent, '/contact?lang=en')`, post to `'/contact?lang=en'`, expect `Location` `'/contact?lang=en&sent=1'`.
- 'localizes errors on the English form': `openForm(agent, '/contact?lang=en')`, post to `'/contact?lang=en'`.

Run: `npm run test:e2e`
Expected: FAIL (routes and links still use `/en`).

- [ ] **Step 4: Controllers, middleware mount and error filter**

`src/pages/pages.controller.ts` (replace the class body routes; keep the private helpers):

```ts
import { Controller, Get, Query, Redirect, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ContentService } from '../content/content.service.js';
import type { Lang } from '../content/content.types.js';
import { buildViewModel, parseLang } from '../content/view-model.js';

@Controller()
export class PagesController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Render('home')
  homePage(@Query('lang') lang: unknown) {
    return this.home(parseLang(lang));
  }

  @Get('contact')
  @Render('contact')
  contactPage(@Req() req: Request, @Query('lang') lang: unknown, @Query('sent') sent?: string) {
    return this.contact(parseLang(lang), req, sent);
  }

  // Old English URLs, kept working for links shared before the switch to ?lang=en.
  @Get('en')
  @Redirect('/?lang=en', 301)
  legacyEnglishHome() {}

  @Get('en/contact')
  @Redirect('/contact?lang=en', 301)
  legacyEnglishContact() {}

  private home(lang: Lang) {
    return buildViewModel(this.content.get(lang), lang, 'home');
  }

  private contact(lang: Lang, req: Request, sent?: string) {
    return buildViewModel(this.content.get(lang), lang, 'contact', {
      csrfToken: req.csrfToken?.() ?? '',
      sent: sent === '1',
      values: {},
      errors: {},
      hasErrors: false,
    });
  }
}
```

`src/contact/contact.controller.ts`:
- add `Query` to the `@nestjs/common` import and `parseLang` to the view-model import;
- replace the two `@Post` methods with:

```ts
  @Post('contact')
  submitForm(
    @Req() req: Request,
    @Res() res: Response,
    @Query('lang') lang: unknown,
    @Body() body?: Record<string, unknown>,
  ): Promise<void> {
    return this.submit(parseLang(lang), req, res, body ?? {});
  }
```

- in `submit`, replace the `successUrl` line with `const successUrl = pathFor(lang, 'contact', { sent: '1' });`.

`src/setup-app.ts`: `const CONTACT_ROUTES = ['/contact'];`

`src/errors/http-exception.filter.ts`:
- delete the `langFromPath` function;
- import `parseLang` from `../content/view-model.js` (next to `buildViewModel, pathFor`);
- in `renderErrorPage`, replace `const lang = langFromPath(req.originalUrl);` with `const lang = parseLang(req.query.lang);`.

- [ ] **Step 5: Run everything**

Run: `npm run lint && npm test && npm run test:e2e && npx tsc --noEmit -p tsconfig.json && npm run build`
Expected: all PASS. `grep -rn "'/en" src views` returns nothing except the two redirect routes in `pages.controller.ts`.

- [ ] **Step 6: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: select the language with ?lang=en and redirect old /en URLs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
