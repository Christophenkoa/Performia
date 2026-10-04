# Performia NestJS Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild helloperformia.com as a server-rendered, bilingual (FR/EN) NestJS 12 site with a validated, CSRF-protected and rate-limited contact form.

**Architecture:** One NestJS app renders Handlebars views on the server. All copy lives in typed content files (`src/content/fr.ts`, `src/content/en.ts`) that share one `SiteContent` interface. `PagesModule` serves GET routes, `ContactModule` handles the form post and delegates delivery to a `ContactNotifier` interface (v1 logs). Express-level middleware handles security headers, static assets, body parsing and CSRF (limited to the contact routes).

**Tech Stack:** NestJS 12 (ESM), TypeScript 6, Node 24, npm, Vitest 4 + supertest, hbs 4.3, Tailwind CSS 4.3 (CLI), helmet 8, csrf-csrf 4, cookie-parser, class-validator 0.15 + class-transformer, @nestjs/throttler 6.7, self-hosted variable fonts, inline Lucide SVG icons.

**Spec:** `docs/superpowers/specs/2026-10-04-performia-nestjs-design.md`

## Global Constraints

- Node 24, npm, NestJS 12 scaffold (`"type": "module"`): every relative import ends in `.js` (for example `import { fr } from './fr.js'`).
- Tests use Vitest globals (`describe`, `it`, `expect`, `vi`, `beforeEach`) without importing them; unit specs are `src/**/*.spec.ts`, e2e specs are `test/**/*.e2e-spec.ts`.
- Partial file names use underscores (`home_hero.hbs`), because hbs replaces `-` with `_` in partial names.
- No inline `<script>` and no `style="..."` attributes in templates (CSP is `script-src 'self'; style-src 'self'`). Client-side JavaScript is not used at all.
- Routes: French `/`, `/contact`; English `/en`, `/en/contact`. Canonical origin `https://helloperformia.com`.
- Contact details (everywhere): phone and WhatsApp `+237 651 544 974` (`tel:+237651544974`, `https://wa.me/237651544974`), email `contact@helloperformia.com`, address "Yaoundé, Douala, Cameroun" (FR) / "Yaoundé, Douala, Cameroon" (EN).
- Contact form fields and rules: `name` 2-100, `email` valid and at most 254, `phone` 8-30 of `[0-9+()\s.-]`, `subject` 3-150, `message` 10-2000; all trimmed. Honeypot field `website`. Rate limit 5 POSTs per minute per IP.
- Logs never contain phone, subject or message of a contact request.
- Placeholder-looking figures, testimonials, guarantee and social URLs carry a `// TODO: verify` comment.
- Commits: end each commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. No global git identity is configured on this machine, so commit with `git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit ...`.

## File Map

```
.env.example                    environment template
.gitignore
README.md
package.json                    scripts: build:css, watch:css, build, test, test:e2e
styles/app.css                  Tailwind input: fonts, theme tokens, component classes
public/fonts/*.woff2            self-hosted fonts (committed)
public/img/hero.jpg             hero background (committed)
public/img/suku.png             partner logo (committed)
public/img/favicon.svg
public/css/app.css              generated, gitignored
views/layout.hbs                default layout (head, header, main, footer)
views/home.hbs                  includes home_* partials in order
views/contact.hbs
views/error.hbs                 CSRF failure page
views/partials/header.hbs, footer.hbs
views/partials/home_{hero,trust,problem,solution,steps,difference,subjects,audience,partnership,testimonials,teachers,cta}.hbs
views/partials/contact_form.hbs, contact_info.hbs
src/main.ts                     bootstrap
src/config.ts (+ .spec.ts)      loadConfig()
src/paths.ts                    ROOT_DIR
src/setup-app.ts                configureApp()
src/app.module.ts
src/security/csrf.ts            sessionIdMiddleware(), csrfMiddleware()
src/views/hbs-helpers.ts (+ .spec.ts)   inc, times, icon
src/content/content.types.ts    SiteContent, Lang, ContactField
src/content/icons.ts            ICONS, IconName, renderIcon()
src/content/contact-details.ts  CONTACT_DETAILS, SITE_URL
src/content/fr.ts, en.ts
src/content/view-model.ts (+ .spec.ts)  pathFor(), buildViewModel()
src/content/content.service.ts (+ .spec.ts)  getContent(), ContentService
src/content/content.module.ts
src/pages/pages.controller.ts, pages.module.ts
src/contact/contact.dto.ts (+ .spec.ts)  ContactDto, validateContact(), isHoneypotFilled(), pickContactValues()
src/contact/contact-notifier.ts (+ .spec.ts)  ContactNotifier, LoggingContactNotifier
src/contact/contact.controller.ts, contact.module.ts
test/setup.ts                   imports reflect-metadata
test/create-test-app.ts         createTestApp(), escapeHtml()
test/pages.e2e-spec.ts
test/contact-page.e2e-spec.ts
test/contact-submit.e2e-spec.ts
```

---

### Task 1: Project scaffold and typed configuration

**Files:**
- Create (via CLI, then edit): `package.json`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `vitest.config.ts`, `vitest.config.e2e.ts`, `.prettierrc`, `.oxlintrc.json`
- Create: `.gitignore`, `.env.example`, `src/config.ts`, `src/config.spec.ts`, `src/paths.ts`, `src/app.module.ts`, `src/main.ts`, `test/setup.ts`
- Delete (scaffold samples): `src/app.controller.ts`, `src/app.service.ts`, `src/app.controller.spec.ts`, `test/app.e2e-spec.ts`

**Interfaces:**
- Produces: `loadConfig(env?: NodeJS.ProcessEnv): AppConfig` with `AppConfig = { port: number; isProduction: boolean; csrfSecret: string; trustProxy: boolean }`; `ROOT_DIR: string` (project root, works from `src/` and `dist/`); empty `AppModule`.

- [ ] **Step 1: Scaffold into a temp dir and copy into the repo**

The repo already contains `.git` and `docs/`, so scaffold elsewhere and copy:

```bash
cd ~/Documents/performia
SCAFFOLD=$(mktemp -d)
npx -y @nestjs/cli@12.0.8 new performia --directory "$SCAFFOLD/performia" --package-manager npm --skip-git --skip-install --strict
cp -r "$SCAFFOLD/performia/." .
rm -rf "$SCAFFOLD"
rm src/app.controller.ts src/app.service.ts src/app.controller.spec.ts test/app.e2e-spec.ts
npm install
npm i hbs csrf-csrf cookie-parser helmet class-validator class-transformer @nestjs/throttler express@^5.2.1
npm i -D @types/hbs @types/cookie-parser tailwindcss @tailwindcss/cli @fontsource-variable/dm-sans @fontsource-variable/playfair-display
```

Expected: `package.json` has `"type": "module"`, `@nestjs/core` `^12`, `vitest` `^4`.

- [ ] **Step 2: Write `.gitignore` and `.env.example`**

`.gitignore`:

```gitignore
node_modules/
dist/
coverage/
public/css/
.env
*.tsbuildinfo
```

`.env.example`:

```dotenv
# Port the HTTP server listens on
PORT=3000
# Set to "production" in production
NODE_ENV=development
# Required in production, at least 32 characters. Generate with: openssl rand -hex 32
CSRF_SECRET=
# Set to "true" when running behind a reverse proxy (needed for correct rate limiting)
TRUST_PROXY=false
```

- [ ] **Step 3: Add the Vitest setup file and register it**

`test/setup.ts`:

```ts
import 'reflect-metadata';
```

In both `vitest.config.ts` and `vitest.config.e2e.ts`, add `setupFiles: ['./test/setup.ts'],` inside the `test: { ... }` object, right after `include`.

- [ ] **Step 4: Write the failing config test**

`src/config.spec.ts`:

```ts
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
```

- [ ] **Step 5: Run it to verify it fails**

Run: `npx vitest run src/config.spec.ts`
Expected: FAIL, cannot resolve `./config.js`.

- [ ] **Step 6: Implement config, paths, module and bootstrap**

`src/config.ts`:

```ts
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
```

`src/paths.ts`:

```ts
import { resolve } from 'node:path';

// src/ in development and tests, dist/ after build: the project root is one level up in both cases.
export const ROOT_DIR = resolve(import.meta.dirname, '..');
```

`src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';

@Module({})
export class AppModule {}
```

`src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { loadConfig } from './config.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const config = loadConfig();

const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
await app.listen(config.port);
```

In `package.json`, set `"name": "performia"`.

- [ ] **Step 7: Run tests and build**

Run: `npx vitest run src/config.spec.ts && npx nest build`
Expected: 4 tests PASS; build exits 0 and creates `dist/main.js`.

- [ ] **Step 8: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "chore: scaffold NestJS 12 app with typed config

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content layer (types, icons, FR/EN copy, view model, service)

**Files:**
- Create: `src/content/content.types.ts`, `src/content/icons.ts`, `src/content/contact-details.ts`, `src/content/fr.ts`, `src/content/en.ts`, `src/content/view-model.ts`, `src/content/view-model.spec.ts`, `src/content/content.service.ts`, `src/content/content.service.spec.ts`, `src/content/content.module.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type Lang = 'fr' | 'en'`, `type ContactField = 'name' | 'email' | 'phone' | 'subject' | 'message'`, `interface SiteContent` (shape below).
  - `type IconName`, `renderIcon(name: string, className?: string): string` (throws `Unknown icon: <name>`).
  - `CONTACT_DETAILS` (`phoneDisplay`, `phoneHref`, `whatsappUrl`, `email`, `facebookUrl`, `instagramUrl`), `SITE_URL`.
  - `type PageId = 'home' | 'contact'`, `pathFor(lang: Lang, page: PageId): string`, `buildViewModel(t: SiteContent, lang: Lang, page: PageId, extra?: Record<string, unknown>)` returning `{ lang, t, contactDetails, siteUrl, currentPath, alternates: { fr, en }, switchPath, links: { home, contact }, pageTitle, pageDescription, isHome, isContact, ...extra }`.
  - `getContent(lang: Lang): SiteContent`; injectable `ContentService` with `get(lang: Lang): SiteContent`; `ContentModule` exporting `ContentService`.

- [ ] **Step 1: Write the types**

`src/content/content.types.ts`:

```ts
import type { IconName } from './icons.js';

export type Lang = 'fr' | 'en';

export type ContactField = 'name' | 'email' | 'phone' | 'subject' | 'message';

export interface IconCard {
  icon: IconName;
  title: string;
  description: string;
}

export interface Step {
  title: string;
  description: string;
}

export interface SubjectCard extends IconCard {
  levels: string[];
}

export interface Benefit {
  icon: IconName;
  text: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface SiteContent {
  brand: string;
  meta: { homeTitle: string; homeDescription: string; contactTitle: string; contactDescription: string };
  nav: { ariaLabel: string; home: string; contact: string; menu: string; switchLabel: string; switchLang: Lang };
  hero: {
    formatBadge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustText: string;
  };
  trustBlock: { title: string; points: IconCard[] };
  problem: { title: string; description: string; challenges: string[] };
  solution: { title: string; blocks: IconCard[] };
  howItWorks: { title: string; steps: Step[]; reassurance: string };
  difference: { title: string; blocks: IconCard[] };
  subjects: { title: string; subtitle: string; cards: SubjectCard[] };
  targetAudience: { title: string; description: string; profiles: string[]; levels: string[] };
  partnership: {
    title: string;
    description: string;
    benefits: Benefit[];
    partnerName: string;
    logoAlt: string;
  };
  testimonials: { title: string; cards: Testimonial[] };
  teacherRecruitment: { title: string; subtitle: string; description: string; requirements: string[]; cta: string };
  finalCta: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  footer: { tagline: string; contact: string; whatsapp: string; followUs: string; partnership: string; copyright: string };
  contact: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      subject: string;
      subjectPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
    };
    info: {
      title: string;
      addressLabel: string;
      address: string;
      phoneLabel: string;
      whatsappLabel: string;
      emailLabel: string;
      hoursLabel: string;
      hours: string;
      socialTitle: string;
    };
    success: string;
    errorSummary: string;
    privacyNotice: string;
    errors: Record<ContactField, string>;
  };
  errorPage: { title: string; csrfMessage: string; back: string };
}
```

- [ ] **Step 2: Write the icon map**

`src/content/icons.ts` (SVG bodies copied from `lucide-static` 1.52.0, ISC license; Facebook and Instagram paths from the live site, as Lucide no longer ships brand icons):

```ts
const ICONS = {
  graduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />',
  arrowRight: '<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />',
  messageCircle: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" />',
  target: '<circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />',
  trendingUp: '<path d="M16 7h6v6" /><path d="m22 7-8.5 8.5-5-5L2 17" />',
  clock: '<circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />',
  shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" />',
  userCheck: '<path d="m16 11 2 2 4-4" /><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />',
  monitor: '<rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />',
  award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" />',
  calculator: '<rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" />',
  atom: '<circle cx="12" cy="12" r="1" /><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" /><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z" />',
  flask: '<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" /><path d="M6.453 15h11.094" /><path d="M8.5 2h7" />',
  mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />',
  phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />',
  globe: '<circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />',
  sparkles: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" /><path d="M20 2v4" /><path d="M22 4h-4" /><circle cx="4" cy="20" r="2" />',
  handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" />',
  bookOpen: '<path d="M12 5v16" /><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" />',
  circleAlert: '<circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />',
  menu: '<path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />',
  circleCheck: '<circle cx="12" cy="12" r="10" /><path d="m16 9-5.5 5.5L8 12" />',
  clipboardList: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />',
  chartLine: '<path d="M3 3v16a2 2 0 0 0 2 2h16" /><path d="m19 9-5 5-4-4-3 3" />',
  lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />',
} as const;

export type IconName = keyof typeof ICONS;

export function isIconName(name: string): name is IconName {
  return Object.hasOwn(ICONS, name);
}

export function renderIcon(name: string, className = ''): string {
  if (!isIconName(name)) throw new Error(`Unknown icon: ${name}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}
```

- [ ] **Step 3: Write contact details**

`src/content/contact-details.ts`:

```ts
export const SITE_URL = 'https://helloperformia.com';

// Confirmed by the client on 2026-10-04 (footer values of the live site).
export const CONTACT_DETAILS = {
  phoneDisplay: '+237 651 544 974',
  phoneHref: 'tel:+237651544974',
  whatsappUrl: 'https://wa.me/237651544974',
  email: 'contact@helloperformia.com',
  facebookUrl: 'https://facebook.com', // TODO: verify - generic link copied from the live site
  instagramUrl: 'https://instagram.com', // TODO: verify - generic link copied from the live site
} as const;
```

- [ ] **Step 4: Write the French copy**

`src/content/fr.ts`:

```ts
import type { SiteContent } from './content.types.js';

// Copy taken from the live site helloperformia.com (2026-10-04).
// "TODO: verify" marks figures, quotes and promises that must be confirmed with a source before launch.
export const fr: SiteContent = {
  brand: 'Academic Excellence',
  meta: {
    homeTitle: 'Academic Excellence Platform - Encadrement académique de qualité',
    homeDescription:
      'Offrez à votre enfant les meilleurs enseignants pour réussir au secondaire. Encadrement personnalisé en mathématiques, physique et chimie.',
    contactTitle: 'Contactez-nous - Academic Excellence Platform',
    contactDescription: 'Nous sommes là pour répondre à toutes vos questions',
  },
  nav: { ariaLabel: 'Navigation principale', home: 'Accueil', contact: 'Contact', menu: 'Menu', switchLabel: 'EN', switchLang: 'en' },
  hero: {
    formatBadge: 'Cours en présentiel ou en ligne selon vos préférences',
    headline: 'Offrez à votre enfant les meilleurs enseignants pour réussir au secondaire',
    subheadline: "Un encadrement académique personnalisé et de qualité pour garantir l'excellence scolaire de votre enfant",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Découvrir le programme',
    trustText: 'Rejoignez plus de 847 familles qui nous font confiance', // TODO: verify figure
  },
  trustBlock: {
    title: 'Pourquoi nous choisir ?',
    points: [
      {
        icon: 'users',
        title: 'Équipe pédagogique adaptée',
        description:
          "Nous assignons un ou plusieurs enseignants en fonction des besoins pédagogiques de l'élève pour un accompagnement optimal.",
      },
      {
        icon: 'target',
        title: 'Suivi personnalisé',
        description: "Chaque élève bénéficie d'un accompagnement adapté à ses besoins spécifiques.",
      },
      {
        icon: 'trendingUp',
        title: 'Résultats prouvés',
        description: '92% de nos élèves améliorent leurs notes en moins de 3 mois.', // TODO: verify figure and source
      },
      {
        icon: 'monitor',
        title: 'Flexibilité des formats',
        description: "Des cours en présentiel ou en ligne, adaptés à l'emploi du temps de votre enfant.",
      },
    ],
  },
  problem: {
    title: 'Les défis du secondaire',
    description:
      "Le passage au secondaire représente un tournant crucial dans la scolarité. Les programmes deviennent plus exigeants, les matières se complexifient, et les élèves font face à de nouvelles méthodes d'apprentissage. Sans un accompagnement adapté, beaucoup d'élèves perdent confiance et voient leurs résultats chuter.",
    challenges: [
      'Programme scolaire de plus en plus exigeant',
      "Classes surchargées limitant l'attention individuelle",
      'Difficultés à comprendre certaines matières clés',
      "Manque de méthodes d'apprentissage efficaces",
    ],
  },
  solution: {
    title: 'Notre approche pédagogique',
    blocks: [
      {
        icon: 'clipboardList',
        title: 'Diagnostic personnalisé',
        description: "Nous évaluons le niveau de chaque élève pour identifier ses forces et ses axes d'amélioration.",
      },
      {
        icon: 'lightbulb',
        title: "Plan d'apprentissage sur mesure",
        description: 'Un programme adapté aux besoins spécifiques et aux objectifs de votre enfant.',
      },
      {
        icon: 'users',
        title: 'Accompagnement ciblé',
        description:
          "L'intervention d'un ou plusieurs enseignants, soigneusement sélectionnés selon les besoins identifiés, permet à l'élève de bénéficier d'une pédagogie sur mesure.",
      },
      {
        icon: 'chartLine',
        title: 'Suivi régulier',
        description: "Des rapports détaillés pour suivre les progrès et ajuster l'accompagnement en continu.",
      },
    ],
  },
  howItWorks: {
    title: 'Comment ça marche ?',
    steps: [
      {
        title: 'Inscription et choix du format',
        description:
          'Inscrivez votre enfant, choisissez votre format préféré (présentiel ou en ligne) et nous évaluons son niveau.',
      },
      {
        title: 'Attribution des enseignants',
        description:
          'Nous assignons un ou plusieurs enseignants qualifiés correspondant exactement aux besoins identifiés de votre enfant.',
      },
      {
        title: 'Début des cours',
        description: "Les cours commencent selon l'horaire convenu, dans le format que vous avez sélectionné.",
      },
      {
        title: 'Suivi et ajustement',
        description: 'Nous suivons les progrès et ajustons le programme pour garantir les meilleurs résultats.',
      },
    ],
    reassurance: "Vous pouvez commencer à tout moment de l'année scolaire",
  },
  difference: {
    title: 'Ce qui nous distingue',
    blocks: [
      {
        icon: 'shieldCheck',
        title: 'Enseignants vérifiés',
        description: 'Tous nos enseignants passent par un processus de sélection rigoureux et sont régulièrement évalués.',
      },
      {
        icon: 'userCheck',
        title: 'Affectation sur mesure',
        description:
          "Le choix et le nombre d'enseignants sont déterminés par les besoins spécifiques de l'élève, garantissant un soutien pédagogique parfaitement adapté.",
      },
      {
        icon: 'monitor',
        title: 'Technologie éducative',
        description: 'Plateforme en ligne moderne avec ressources pédagogiques et suivi en temps réel.',
      },
      {
        icon: 'award',
        title: 'Garantie de satisfaction',
        description: "Si vous n'êtes pas satisfait après le premier mois, nous vous remboursons intégralement.", // TODO: verify refund terms
      },
    ],
  },
  subjects: {
    title: 'Matières enseignées',
    subtitle: 'Un accompagnement complet dans les matières scientifiques clés',
    cards: [
      {
        icon: 'calculator',
        title: 'Mathématiques',
        description: 'Algèbre, géométrie, trigonométrie, et analyse. Renforcement des bases et préparation aux examens.',
        levels: ['Sixième à Troisième', 'Seconde à Terminale'],
      },
      {
        icon: 'atom',
        title: 'Physique',
        description: 'Mécanique, électricité, optique, et thermodynamique. Cours théoriques et exercices pratiques.',
        levels: ['Quatrième à Terminale'],
      },
      {
        icon: 'flask',
        title: 'Chimie',
        description: 'Chimie générale, organique et inorganique. Expériences et applications concrètes.',
        levels: ['Quatrième à Terminale'],
      },
    ],
  },
  targetAudience: {
    title: "À qui s'adresse notre programme ?",
    description:
      "Notre plateforme d'excellence académique couvre l'intégralité du cursus secondaire. De la Sixième à la Terminale, nous accompagnons chaque élève avec une pédagogie adaptée à son niveau, pour consolider ses bases, réussir ses examens et préparer sereinement ses études supérieures.",
    profiles: [
      'Élèves ayant des difficultés dans certaines matières',
      'Élèves souhaitant améliorer leurs notes',
      'Élèves préparant des examens importants (BEPC, Baccalauréat)',
      "Élèves visant l'excellence académique",
    ],
    levels: ['Sixième', 'Cinquième', 'Quatrième', 'Troisième', 'Seconde', 'Première', 'Terminale'],
  },
  partnership: {
    title: 'Notre partenariat avec Suku',
    description:
      "Nous sommes fiers de collaborer avec Suku, une plateforme éducative innovante qui partage notre vision de l'excellence académique.",
    benefits: [
      { icon: 'bookOpen', text: 'Accès à des ressources pédagogiques supplémentaires' },
      { icon: 'sparkles', text: 'Plateforme technologique de pointe' },
      { icon: 'chartLine', text: 'Suivi numérique des progrès' },
      { icon: 'users', text: "Communauté d'apprentissage élargie" },
    ],
    partnerName: 'Partenaire : Suku',
    logoAlt: 'Logo de Suku, partenaire de la plateforme',
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'Ce que disent les parents',
    cards: [
      {
        name: 'Sylvie Kamga',
        role: "Mère d'élève en Seconde",
        content:
          "Grâce à l'accompagnement reçu, ma fille a retrouvé confiance en elle. Ses notes en mathématiques sont passées de 11/20 à 16/20 en seulement deux mois. Les enseignants sont patients et vraiment à l'écoute.",
        rating: 5,
      },
      {
        name: 'Achille Mboua',
        role: "Père d'élève en Terminale",
        content:
          "Mon fils préparait son baccalauréat et avait besoin d'un soutien en physique-chimie. L'enseignant assigné a su identifier ses lacunes et y remédier efficacement. Il a obtenu 17/20 à son examen final.",
        rating: 5,
      },
      {
        name: 'Nkomo Tagne',
        role: "Mère d'élève en Troisième",
        content:
          "Le suivi personnalisé fait toute la différence. Je reçois régulièrement des rapports sur les progrès de mon enfant et je peux échanger facilement avec l'enseignant. Un service professionnel et efficace.",
        rating: 5,
      },
    ],
  },
  teacherRecruitment: {
    title: 'Vous êtes enseignant ?',
    subtitle: 'Rejoignez notre équipe de professeurs qualifiés',
    description: 'Nous recherchons des enseignants passionnés et compétents pour accompagner nos élèves vers la réussite.',
    requirements: [
      'Diplôme universitaire dans la matière enseignée',
      "Expérience d'enseignement au secondaire",
      'Excellentes capacités pédagogiques',
      "Patience et sens de l'écoute",
      'Disponibilité flexible',
    ],
    cta: 'Postuler maintenant',
  },
  finalCta: {
    title: 'Prêt à offrir le meilleur à votre enfant ?',
    subtitle: "Inscrivez-vous dès aujourd'hui et donnez à votre enfant les clés de la réussite scolaire",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Nous contacter',
  },
  footer: {
    tagline: 'Encadrement académique de qualité pour les élèves du secondaire',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    followUs: 'Suivez-nous',
    partnership: 'Partenaire : Suku',
    copyright: '© 2026 Academic Excellence Platform. Tous droits réservés.',
  },
  contact: {
    title: 'Contactez-nous',
    subtitle: 'Nous sommes là pour répondre à toutes vos questions',
    form: {
      name: 'Nom complet',
      namePlaceholder: 'Votre nom',
      email: 'Adresse email',
      emailPlaceholder: 'votre@email.com',
      phone: 'Téléphone',
      phonePlaceholder: '+237 6XX XX XX XX',
      subject: 'Sujet',
      subjectPlaceholder: 'Objet de votre message',
      message: 'Message',
      messagePlaceholder: 'Décrivez votre demande...',
      submit: 'Envoyer le message',
    },
    info: {
      title: 'Informations de contact',
      addressLabel: 'Adresse',
      address: 'Yaoundé, Douala, Cameroun',
      phoneLabel: 'Téléphone',
      whatsappLabel: 'WhatsApp',
      emailLabel: 'Email',
      hoursLabel: 'Horaires',
      hours: 'Lundi - Samedi : 8h - 18h',
      socialTitle: 'Réseaux sociaux',
    },
    success: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    errorSummary: 'Veuillez corriger les champs signalés ci-dessous.',
    privacyNotice: 'Vos données sont utilisées uniquement pour répondre à votre demande.',
    errors: {
      name: 'Veuillez indiquer votre nom (2 à 100 caractères).',
      email: 'Veuillez indiquer une adresse email valide.',
      phone: 'Veuillez indiquer un numéro de téléphone valide (8 à 30 caractères).',
      subject: 'Veuillez indiquer un sujet (3 à 150 caractères).',
      message: 'Votre message doit contenir entre 10 et 2000 caractères.',
    },
  },
  errorPage: {
    title: 'Formulaire expiré',
    csrfMessage: 'Pour votre sécurité, ce formulaire a expiré. Veuillez recharger la page et réessayer.',
    back: 'Retour au formulaire',
  },
};
```

- [ ] **Step 5: Write the English copy**

`src/content/en.ts`:

```ts
import type { SiteContent } from './content.types.js';

// Copy taken from the live site helloperformia.com (2026-10-04).
// "TODO: verify" marks figures, quotes and promises that must be confirmed with a source before launch.
export const en: SiteContent = {
  brand: 'Academic Excellence',
  meta: {
    homeTitle: 'Academic Excellence Platform - Quality academic support',
    homeDescription:
      'Give your child the best teachers to succeed in secondary school. Personalized support in mathematics, physics and chemistry.',
    contactTitle: 'Contact us - Academic Excellence Platform',
    contactDescription: 'We are here to answer all your questions',
  },
  nav: { ariaLabel: 'Main navigation', home: 'Home', contact: 'Contact', menu: 'Menu', switchLabel: 'FR', switchLang: 'fr' },
  hero: {
    formatBadge: 'In-person or online classes according to your preferences',
    headline: 'Give your child the best teachers to succeed in secondary school',
    subheadline: "Personalized, quality academic support to guarantee your child's academic excellence",
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Discover the program',
    trustText: 'Join over 847 families who trust us', // TODO: verify figure
  },
  trustBlock: {
    title: 'Why choose us?',
    points: [
      {
        icon: 'users',
        title: 'Adapted Teaching Team',
        description: "We assign one or more teachers based on the student's educational needs to ensure optimal learning.",
      },
      {
        icon: 'target',
        title: 'Personalized support',
        description: 'Each student receives support tailored to their specific needs.',
      },
      {
        icon: 'trendingUp',
        title: 'Proven results',
        description: '92% of our students improve their grades in less than 3 months.', // TODO: verify figure and source
      },
      {
        icon: 'monitor',
        title: 'Flexible Formats',
        description: "In-person or online classes, adapted to your child's schedule and your preferences.",
      },
    ],
  },
  problem: {
    title: 'Secondary school challenges',
    description:
      'The transition to secondary school represents a crucial turning point in education. Programs become more demanding, subjects become more complex, and students face new learning methods. Without proper support, many students lose confidence and see their results decline.',
    challenges: [
      'Increasingly demanding curriculum',
      'Overcrowded classes limiting individual attention',
      'Difficulty understanding key subjects',
      'Lack of effective learning methods',
    ],
  },
  solution: {
    title: 'Our teaching approach',
    blocks: [
      {
        icon: 'clipboardList',
        title: 'Personalized assessment',
        description: "We evaluate each student's level to identify their strengths and areas for improvement.",
      },
      {
        icon: 'lightbulb',
        title: 'Customized learning plan',
        description: "A program tailored to your child's specific needs and goals.",
      },
      {
        icon: 'users',
        title: 'Targeted Support',
        description:
          "The involvement of one or more teachers, carefully selected according to the student's needs, enables efficient and tailored progress.",
      },
      {
        icon: 'chartLine',
        title: 'Regular monitoring',
        description: 'Detailed reports to track progress and adjust support continuously.',
      },
    ],
  },
  howItWorks: {
    title: 'How does it work?',
    steps: [
      {
        title: 'Registration and format choice',
        description: 'Enroll your child, choose your preferred format (in-person or online), and we assess their level.',
      },
      {
        title: 'Teacher Assignment',
        description: "After assessment, we assign one or more qualified teachers matching exactly your child's identified needs.",
      },
      {
        title: 'Classes begin',
        description: 'Classes start according to the agreed schedule, in the format you selected.',
      },
      {
        title: 'Monitoring and adjustment',
        description: 'We track progress and adjust the program to ensure the best results.',
      },
    ],
    reassurance: 'You can start at any time during the school year',
  },
  difference: {
    title: 'What sets us apart',
    blocks: [
      {
        icon: 'shieldCheck',
        title: 'Verified teachers',
        description: 'All our teachers go through a rigorous selection process and are regularly evaluated.',
      },
      {
        icon: 'userCheck',
        title: 'Tailored Assignment',
        description:
          'The choice and number of teachers are determined by the specific needs of the student, ensuring perfectly adapted educational support.',
      },
      {
        icon: 'monitor',
        title: 'Educational technology',
        description: 'Modern online platform with educational resources and real-time tracking.',
      },
      {
        icon: 'award',
        title: 'Satisfaction guarantee',
        description: "If you're not satisfied after the first month, we offer a full refund.", // TODO: verify refund terms
      },
    ],
  },
  subjects: {
    title: 'Subjects taught',
    subtitle: 'Comprehensive support in key scientific subjects',
    cards: [
      {
        icon: 'calculator',
        title: 'Mathematics',
        description: 'Algebra, geometry, trigonometry, and analysis. Strengthening foundations and exam preparation.',
        levels: ['Grade 6 to 9', 'Grade 10 to 12'],
      },
      {
        icon: 'atom',
        title: 'Physics',
        description: 'Mechanics, electricity, optics, and thermodynamics. Theoretical courses and practical exercises.',
        levels: ['Grade 8 to 12'],
      },
      {
        icon: 'flask',
        title: 'Chemistry',
        description: 'General, organic and inorganic chemistry. Experiments and practical applications.',
        levels: ['Grade 8 to 12'],
      },
    ],
  },
  targetAudience: {
    title: 'Who is our program for?',
    description:
      'Our academic excellence platform covers the entire secondary school curriculum. From Grade 6 to Grade 12, we support each student with a teaching approach adapted to their level, to consolidate their foundations, pass their exams, and calmly prepare for higher education.',
    profiles: [
      'Students struggling with certain subjects',
      'Students wanting to improve their grades',
      'Students preparing for important exams',
      'Students aiming for academic excellence',
    ],
    levels: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
  },
  partnership: {
    title: 'Our partnership with Suku',
    description:
      'We are proud to collaborate with Suku, an innovative educational platform that shares our vision of academic excellence.',
    benefits: [
      { icon: 'bookOpen', text: 'Access to additional educational resources' },
      { icon: 'sparkles', text: 'Cutting-edge technology platform' },
      { icon: 'chartLine', text: 'Digital progress tracking' },
      { icon: 'users', text: 'Expanded learning community' },
    ],
    partnerName: 'Partner: Suku',
    logoAlt: 'Logo of Suku, partner of the platform',
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'What parents say',
    cards: [
      {
        name: 'Sylvie Kamga',
        role: 'Mother of Grade 10 student',
        content:
          'Thanks to the support received, my daughter regained confidence. Her math grades went from 11/20 to 16/20 in just two months. The teachers are patient and truly attentive.',
        rating: 5,
      },
      {
        name: 'Achille Mboua',
        role: 'Father of Grade 12 student',
        content:
          'My son was preparing for his baccalaureate and needed support in physics-chemistry. The assigned teacher identified his gaps and addressed them effectively. He scored 17/20 on his final exam.',
        rating: 5,
      },
      {
        name: 'Nkomo Tagne',
        role: 'Mother of Grade 9 student',
        content:
          "The personalized follow-up makes all the difference. I regularly receive reports on my child's progress and can easily communicate with the teacher. A professional and effective service.",
        rating: 5,
      },
    ],
  },
  teacherRecruitment: {
    title: 'Are you a teacher?',
    subtitle: 'Join our team of qualified teachers',
    description: 'We are looking for passionate and competent teachers to guide our students to success.',
    requirements: [
      'University degree in the subject taught',
      'Secondary school teaching experience',
      'Excellent teaching skills',
      'Patience and listening skills',
      'Flexible availability',
    ],
    cta: 'Apply now',
  },
  finalCta: {
    title: 'Ready to give your child the best?',
    subtitle: 'Enroll today and give your child the keys to academic success',
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Contact us',
  },
  footer: {
    tagline: 'Quality academic support for secondary school students',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    followUs: 'Follow us',
    partnership: 'Partner: Suku',
    copyright: '© 2026 Academic Excellence Platform. All rights reserved.',
  },
  contact: {
    title: 'Contact us',
    subtitle: 'We are here to answer all your questions',
    form: {
      name: 'Full name',
      namePlaceholder: 'Your name',
      email: 'Email address',
      emailPlaceholder: 'your@email.com',
      phone: 'Phone',
      phonePlaceholder: '+237 6XX XX XX XX',
      subject: 'Subject',
      subjectPlaceholder: 'Subject of your message',
      message: 'Message',
      messagePlaceholder: 'Describe your request...',
      submit: 'Send message',
    },
    info: {
      title: 'Contact information',
      addressLabel: 'Address',
      address: 'Yaoundé, Douala, Cameroon',
      phoneLabel: 'Phone',
      whatsappLabel: 'WhatsApp',
      emailLabel: 'Email',
      hoursLabel: 'Opening hours',
      hours: 'Monday - Saturday: 8am - 6pm',
      socialTitle: 'Social media',
    },
    success: 'Message sent successfully. We will respond to you as soon as possible.',
    errorSummary: 'Please correct the fields marked below.',
    privacyNotice: 'Your data is only used to answer your request.',
    errors: {
      name: 'Please enter your name (2 to 100 characters).',
      email: 'Please enter a valid email address.',
      phone: 'Please enter a valid phone number (8 to 30 characters).',
      subject: 'Please enter a subject (3 to 150 characters).',
      message: 'Your message must contain between 10 and 2000 characters.',
    },
  },
  errorPage: {
    title: 'Form expired',
    csrfMessage: 'For your security, this form has expired. Please reload the page and try again.',
    back: 'Back to the form',
  },
};
```

- [ ] **Step 6: Write the failing view-model and service tests**

`src/content/view-model.spec.ts`:

```ts
import { en } from './en.js';
import { fr } from './fr.js';
import type { Lang } from './content.types.js';
import { buildViewModel, pathFor, type PageId } from './view-model.js';

describe('pathFor', () => {
  it.each([
    ['fr', 'home', '/'],
    ['en', 'home', '/en'],
    ['fr', 'contact', '/contact'],
    ['en', 'contact', '/en/contact'],
  ])('%s %s -> %s', (lang, page, expected) => {
    expect(pathFor(lang as Lang, page as PageId)).toBe(expected);
  });
});

describe('buildViewModel', () => {
  it('builds paths, language switch and metadata for the French contact page', () => {
    const vm = buildViewModel(fr, 'fr', 'contact', { sent: true });
    expect(vm).toMatchObject({
      lang: 'fr',
      t: fr,
      siteUrl: 'https://helloperformia.com',
      currentPath: '/contact',
      alternates: { fr: '/contact', en: '/en/contact' },
      switchPath: '/en/contact',
      links: { home: '/', contact: '/contact' },
      pageTitle: fr.meta.contactTitle,
      pageDescription: fr.meta.contactDescription,
      isHome: false,
      isContact: true,
      sent: true,
    });
    expect(vm.contactDetails.email).toBe('contact@helloperformia.com');
  });

  it('uses English home metadata and switches back to French', () => {
    const vm = buildViewModel(en, 'en', 'home');
    expect(vm).toMatchObject({
      currentPath: '/en',
      switchPath: '/',
      links: { home: '/en', contact: '/en/contact' },
      pageTitle: en.meta.homeTitle,
      isHome: true,
    });
  });
});
```

`src/content/content.service.spec.ts`:

```ts
import { ContentService, getContent } from './content.service.js';
import { en } from './en.js';
import { fr } from './fr.js';

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, shape(child)]),
    );
  }
  return typeof value;
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('ContentService', () => {
  it('returns the content for each language', () => {
    const service = new ContentService();
    expect(service.get('fr')).toBe(fr);
    expect(service.get('en')).toBe(en);
    expect(getContent('en')).toBe(en);
  });

  it('keeps French and English structurally identical (same keys, same list lengths)', () => {
    expect(shape(en)).toEqual(shape(fr));
  });

  it('has no empty strings in either language', () => {
    expect(strings(fr).filter((s) => s.trim() === '')).toEqual([]);
    expect(strings(en).filter((s) => s.trim() === '')).toEqual([]);
  });

  it('uses the same icons in both languages', () => {
    const icons = (t: typeof fr) => [
      ...t.trustBlock.points,
      ...t.solution.blocks,
      ...t.difference.blocks,
      ...t.subjects.cards,
      ...t.partnership.benefits,
    ].map((item) => item.icon);
    expect(icons(en)).toEqual(icons(fr));
  });
});
```

- [ ] **Step 7: Run them to verify they fail**

Run: `npx vitest run src/content`
Expected: FAIL, cannot resolve `./view-model.js` and `./content.service.js`.

- [ ] **Step 8: Implement view model, service and module**

`src/content/view-model.ts`:

```ts
import { CONTACT_DETAILS, SITE_URL } from './contact-details.js';
import type { Lang, SiteContent } from './content.types.js';

export type PageId = 'home' | 'contact';

export function pathFor(lang: Lang, page: PageId): string {
  const prefix = lang === 'en' ? '/en' : '';
  if (page === 'home') return prefix || '/';
  return `${prefix}/contact`;
}

export function buildViewModel(t: SiteContent, lang: Lang, page: PageId, extra: Record<string, unknown> = {}) {
  const otherLang: Lang = lang === 'fr' ? 'en' : 'fr';
  return {
    lang,
    t,
    contactDetails: CONTACT_DETAILS,
    siteUrl: SITE_URL,
    currentPath: pathFor(lang, page),
    alternates: { fr: pathFor('fr', page), en: pathFor('en', page) },
    switchPath: pathFor(otherLang, page),
    links: { home: pathFor(lang, 'home'), contact: pathFor(lang, 'contact') },
    pageTitle: page === 'home' ? t.meta.homeTitle : t.meta.contactTitle,
    pageDescription: page === 'home' ? t.meta.homeDescription : t.meta.contactDescription,
    isHome: page === 'home',
    isContact: page === 'contact',
    ...extra,
  };
}
```

`src/content/content.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import type { Lang, SiteContent } from './content.types.js';
import { en } from './en.js';
import { fr } from './fr.js';

const CONTENT: Record<Lang, SiteContent> = { fr, en };

export function getContent(lang: Lang): SiteContent {
  return CONTENT[lang];
}

@Injectable()
export class ContentService {
  get(lang: Lang): SiteContent {
    return getContent(lang);
  }
}
```

`src/content/content.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ContentService } from './content.service.js';

@Module({
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
```

- [ ] **Step 9: Run tests and typecheck**

Run: `npx vitest run src/content && npx tsc --noEmit -p tsconfig.json`
Expected: all content tests PASS; tsc exits 0 (an unknown icon name in `fr.ts`/`en.ts` would fail here).

- [ ] **Step 10: Commit**

```bash
git add src/content
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: add bilingual content layer and view model

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Web shell (security headers, views, styling, layout, hero)

**Files:**
- Create: `src/views/hbs-helpers.ts`, `src/views/hbs-helpers.spec.ts`, `src/setup-app.ts`, `src/pages/pages.controller.ts`, `src/pages/pages.module.ts`, `styles/app.css`, `public/img/favicon.svg`, `public/img/hero.jpg` (download), `public/fonts/*.woff2` (copy), `views/layout.hbs`, `views/home.hbs`, `views/partials/header.hbs`, `views/partials/footer.hbs`, `views/partials/home_hero.hbs`, `test/create-test-app.ts`, `test/pages.e2e-spec.ts`
- Modify: `src/app.module.ts`, `src/main.ts`, `package.json` (scripts)

**Interfaces:**
- Consumes: `loadConfig`, `AppConfig`, `ROOT_DIR` (Task 1); `ContentModule`, `ContentService`, `buildViewModel`, `renderIcon` (Task 2).
- Produces: `registerHelpers(): void` (helpers `inc`, `times`, `icon`); `configureApp(app: NestExpressApplication, config: AppConfig): void`; `PagesController` with `GET /` and `GET /en` rendering `home`; `createTestApp(overrides?: { provide: unknown; useValue: unknown }[]): Promise<NestExpressApplication>` and `escapeHtml(s: string): string` in `test/create-test-app.ts`; CSS component classes `container-page`, `section-title`, `card`, `btn`, `btn-gold`, `btn-navy`, `btn-outline-light`, `nav-link`, `nav-link-active`, `lang-switch`, `footer-link`, `social-link`, `info-item`, `field`, `field-label`, `field-error`.

- [ ] **Step 1: Write the failing helper test**

`src/views/hbs-helpers.spec.ts`:

```ts
import hbs from 'hbs';
import { registerHelpers } from './hbs-helpers.js';

const render = (source: string, context: object = {}) => hbs.handlebars.compile(source)(context);

describe('handlebars helpers', () => {
  beforeAll(() => registerHelpers());

  it('inc adds one (for 1-based step numbers)', () => {
    expect(render('{{inc 0}}-{{inc 3}}')).toBe('1-4');
  });

  it('times repeats a block n times', () => {
    expect(render('{{#times 3}}*{{/times}}')).toBe('***');
  });

  it('icon renders an inline, hidden svg with the given classes', () => {
    const out = render('{{icon "star" "h-4 w-4"}}');
    expect(out).toMatch(/^<svg [^>]*class="h-4 w-4"[^>]*aria-hidden="true"/);
    expect(out).toContain('<path');
  });

  it('icon accepts the name from the context', () => {
    expect(render('{{icon this.icon "x"}}', { icon: 'users' })).toContain('<svg');
  });

  it('icon fails loudly on unknown names', () => {
    expect(() => render('{{icon "nope"}}')).toThrow('Unknown icon: nope');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/views`
Expected: FAIL, cannot resolve `./hbs-helpers.js`.

- [ ] **Step 3: Implement the helpers**

`src/views/hbs-helpers.ts`:

```ts
import hbs from 'hbs';
import { renderIcon } from '../content/icons.js';

interface BlockOptions {
  fn: (context: unknown) => string;
}

export function registerHelpers(): void {
  hbs.registerHelper('inc', (value: number) => value + 1);

  hbs.registerHelper('times', function (this: unknown, count: number, options: BlockOptions) {
    let out = '';
    for (let i = 0; i < count; i++) out += options.fn(this);
    return out;
  });

  // {{icon "name" "classes"}}: the class string comes from templates only, never from user input.
  hbs.registerHelper('icon', (name: unknown, className: unknown) => {
    const classes = typeof className === 'string' ? className : '';
    return new hbs.handlebars.SafeString(renderIcon(String(name), classes));
  });
}
```

Run: `npx vitest run src/views`
Expected: 5 tests PASS.

- [ ] **Step 4: Add the CSS pipeline, fonts and images**

```bash
npm pkg set scripts.build:css="tailwindcss -i styles/app.css -o public/css/app.css --minify"
npm pkg set scripts.watch:css="tailwindcss -i styles/app.css -o public/css/app.css --watch"
npm pkg set scripts.build="npm run build:css && nest build"
npm pkg set scripts.test:e2e="npm run build:css && vitest run --config ./vitest.config.e2e.ts"
mkdir -p public/fonts public/img styles views/partials
cp node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2 public/fonts/
cp node_modules/@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2 public/fonts/
curl -sSfL "https://images.unsplash.com/photo-1687600154336-71d3d1a5701c?w=1920&q=75&fm=jpg&fit=crop" -o public/img/hero.jpg
file public/img/hero.jpg
```

Expected: `file` reports `JPEG image data`.

`public/img/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#d4a83a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
```

`styles/app.css`:

```css
@import 'tailwindcss' source(none);
@source '../views';

@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-display: swap;
  font-weight: 100 1000;
  src: url('/fonts/dm-sans-latin-wght-normal.woff2') format('woff2');
}

@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-display: swap;
  font-weight: 400 900;
  src: url('/fonts/playfair-display-latin-wght-normal.woff2') format('woff2');
}

/* Colors taken from the live site (hsl values in its Tailwind classes). */
@theme {
  --color-navy: hsl(210 52% 24%);
  --color-navy-deep: hsl(210 52% 20%);
  --color-navy-dark: hsl(210 52% 18%);
  --color-gold: hsl(43 64% 53%);
  --color-gold-dark: hsl(43 64% 48%);
  --color-mist: hsl(210 20% 96%);
  --color-line: hsl(210 20% 91%);
  --font-sans: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Playfair Display', Georgia, serif;
}

@layer base {
  body {
    @apply bg-white font-sans text-navy antialiased;
  }
  h1,
  h2 {
    @apply font-display tracking-tight;
  }
  summary::-webkit-details-marker {
    display: none;
  }
}

@layer components {
  .container-page {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }
  .section-title {
    @apply mb-12 text-center text-3xl font-bold text-navy md:text-4xl;
  }
  .card {
    @apply h-full rounded-xl bg-white shadow-lg transition-all duration-200 hover:shadow-xl;
  }
  .btn {
    @apply inline-flex h-11 items-center justify-center gap-2 rounded-md px-8 text-base font-semibold transition-all duration-200 active:scale-[0.98];
  }
  .btn-gold {
    @apply bg-gold text-navy hover:bg-gold-dark;
  }
  .btn-navy {
    @apply bg-navy text-white hover:bg-navy-deep;
  }
  .btn-outline-light {
    @apply border border-white/30 bg-transparent text-white hover:bg-white hover:text-navy;
  }
  .nav-link {
    @apply text-sm font-medium text-white transition-all duration-200 hover:text-gold;
  }
  .nav-link-active {
    @apply text-gold underline decoration-2 underline-offset-8;
  }
  .lang-switch {
    @apply inline-flex h-9 w-fit items-center gap-2 rounded-md border border-white/30 px-3 text-sm text-white transition-all duration-200 hover:bg-white hover:text-navy;
  }
  .footer-link {
    @apply flex items-center gap-2 text-sm transition-all duration-200 hover:text-gold;
  }
  .social-link {
    @apply rounded-lg bg-white/10 p-2 text-white transition-all duration-200 hover:bg-gold hover:text-navy;
  }
  .info-item {
    @apply flex items-start gap-4 rounded-xl bg-mist p-4;
  }
  .field {
    @apply w-full rounded-md border border-line bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gold focus:outline-none aria-invalid:border-red-500;
  }
  .field-label {
    @apply mb-2 block text-sm font-medium text-navy;
  }
  .field-error {
    @apply mt-2 text-sm text-red-700;
  }
}
```

Run: `npm run build:css`
Expected: `Done in ...`, `public/css/app.css` exists.

- [ ] **Step 5: Write layout, header, footer, hero and home view**

`views/layout.hbs`:

```hbs
<!doctype html>
<html lang="{{lang}}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{pageTitle}}</title>
    <meta name="description" content="{{pageDescription}}" />
    <link rel="canonical" href="{{siteUrl}}{{currentPath}}" />
    <link rel="alternate" hreflang="fr" href="{{siteUrl}}{{alternates.fr}}" />
    <link rel="alternate" hreflang="en" href="{{siteUrl}}{{alternates.en}}" />
    <link rel="alternate" hreflang="x-default" href="{{siteUrl}}{{alternates.fr}}" />
    <link rel="icon" type="image/svg+xml" href="/img/favicon.svg" />
    <link rel="preload" href="/fonts/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/css/app.css" />
  </head>
  <body class="flex min-h-screen flex-col">
    {{> header}}
    <main class="flex-1">
      {{{body}}}
    </main>
    {{> footer}}
  </body>
</html>
```

`views/partials/header.hbs`:

```hbs
<header class="sticky top-0 z-50 bg-navy text-white shadow-lg">
  <div class="container-page">
    <div class="flex h-16 items-center justify-between">
      <a href="{{links.home}}" class="group flex items-center gap-2">
        {{icon "graduationCap" "h-8 w-8 text-gold transition-transform duration-200 group-hover:scale-110"}}
        <span class="font-display text-xl font-bold">{{t.brand}}</span>
      </a>

      <nav class="hidden items-center gap-8 md:flex" aria-label="{{t.nav.ariaLabel}}">
        <a href="{{links.home}}" class="nav-link{{#if isHome}} nav-link-active{{/if}}"{{#if isHome}} aria-current="page"{{/if}}>{{t.nav.home}}</a>
        <a href="{{links.contact}}" class="nav-link{{#if isContact}} nav-link-active{{/if}}"{{#if isContact}} aria-current="page"{{/if}}>{{t.nav.contact}}</a>
        <a href="{{switchPath}}" hreflang="{{t.nav.switchLang}}" lang="{{t.nav.switchLang}}" class="lang-switch">{{icon "globe" "h-4 w-4"}}{{t.nav.switchLabel}}</a>
      </nav>

      <details class="relative md:hidden">
        <summary class="cursor-pointer list-none rounded-lg p-2 hover:bg-white/10" aria-label="{{t.nav.menu}}">
          {{icon "menu" "h-6 w-6"}}
        </summary>
        <nav class="absolute top-12 right-0 flex w-56 flex-col gap-4 rounded-lg bg-navy p-4 shadow-xl" aria-label="{{t.nav.ariaLabel}}">
          <a href="{{links.home}}" class="nav-link{{#if isHome}} nav-link-active{{/if}}">{{t.nav.home}}</a>
          <a href="{{links.contact}}" class="nav-link{{#if isContact}} nav-link-active{{/if}}">{{t.nav.contact}}</a>
          <a href="{{switchPath}}" hreflang="{{t.nav.switchLang}}" lang="{{t.nav.switchLang}}" class="lang-switch">{{icon "globe" "h-4 w-4"}}{{t.nav.switchLabel}}</a>
        </nav>
      </details>
    </div>
  </div>
</header>
```

`views/partials/footer.hbs`:

```hbs
<footer class="bg-navy text-white">
  <div class="container-page py-12">
    <div class="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
      <div>
        <a href="{{links.home}}" class="mb-4 flex items-center gap-2">
          {{icon "graduationCap" "h-8 w-8 text-gold"}}
          <span class="font-display text-xl font-bold">{{t.brand}}</span>
        </a>
        <p class="text-sm leading-relaxed opacity-90">{{t.footer.tagline}}</p>
      </div>
      <div>
        <h2 class="mb-4 font-sans text-sm font-semibold tracking-normal text-gold">{{t.footer.contact}}</h2>
        <ul class="space-y-3">
          <li><a href="{{contactDetails.phoneHref}}" class="footer-link">{{icon "phone" "h-4 w-4"}}<span>{{contactDetails.phoneDisplay}}</span></a></li>
          <li><a href="{{contactDetails.whatsappUrl}}" target="_blank" rel="noopener noreferrer" class="footer-link">{{icon "messageCircle" "h-4 w-4"}}<span>{{t.footer.whatsapp}}</span></a></li>
          <li><a href="mailto:{{contactDetails.email}}" class="footer-link">{{icon "mail" "h-4 w-4"}}<span>{{contactDetails.email}}</span></a></li>
          <li class="footer-link">{{icon "mapPin" "h-4 w-4"}}<span>{{t.contact.info.address}}</span></li>
        </ul>
      </div>
      <div>
        <h2 class="mb-4 font-sans text-sm font-semibold tracking-normal text-gold">{{t.footer.followUs}}</h2>
        <div class="flex gap-4">
          <a href="{{contactDetails.facebookUrl}}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">{{icon "facebook" "h-5 w-5"}}</a>
          <a href="{{contactDetails.instagramUrl}}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">{{icon "instagram" "h-5 w-5"}}</a>
        </div>
        <p class="mt-4 text-sm opacity-80">{{t.footer.partnership}}</p>
      </div>
    </div>
    <div class="border-t border-white/10 pt-8">
      <p class="text-center text-sm opacity-80 md:text-left">{{t.footer.copyright}}</p>
    </div>
  </div>
</footer>
```

`views/partials/home_hero.hbs`:

```hbs
<section class="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[url(/img/hero.jpg)] bg-cover bg-center">
  <div class="absolute inset-0 bg-linear-to-br from-navy/95 via-navy/90 to-navy/85"></div>
  <div class="relative z-10 mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
    <div class="mb-6 flex justify-center">
      <span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
        {{icon "monitor" "h-4 w-4 text-gold"}}{{t.hero.formatBadge}}
      </span>
    </div>
    <h1 class="mb-6 text-4xl leading-tight font-bold text-balance text-white md:text-5xl lg:text-6xl">{{t.hero.headline}}</h1>
    <p class="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-white/90 md:text-xl">{{t.hero.subheadline}}</p>
    <div class="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
      <a href="{{links.contact}}" class="btn btn-gold">{{t.hero.ctaPrimary}}{{icon "arrowRight" "h-5 w-5"}}</a>
      <a href="#approach" class="btn btn-outline-light">{{t.hero.ctaSecondary}}</a>
    </div>
    <div class="flex items-center justify-center gap-2 text-white/80">
      {{icon "circleCheck" "h-5 w-5 text-gold"}}
      <span class="text-sm">{{t.hero.trustText}}</span>
    </div>
  </div>
</section>
```

`views/home.hbs`:

```hbs
{{> home_hero}}
```

- [ ] **Step 6: Implement app setup, pages controller and module wiring**

`src/setup-app.ts`:

```ts
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hbs from 'hbs';
import { join } from 'node:path';
import type { AppConfig } from './config.js';
import { ROOT_DIR } from './paths.js';
import { registerHelpers } from './views/hbs-helpers.js';

export function configureApp(app: NestExpressApplication, config: AppConfig): void {
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(helmet({ contentSecurityPolicy: { useDefaults: false, directives: cspDirectives(config.isProduction) } }));
  app.useStaticAssets(join(ROOT_DIR, 'public'), { maxAge: config.isProduction ? '7d' : 0 });
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  app.setBaseViewsDir(join(ROOT_DIR, 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(ROOT_DIR, 'views', 'partials'));
  registerHelpers();
}

function cspDirectives(isProduction: boolean): Record<string, string[]> {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'font-src': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'img-src': ["'self'", 'data:'],
    'object-src': ["'none'"],
    'script-src': ["'self'"],
    'script-src-attr': ["'none'"],
    'style-src': ["'self'"],
  };
  // Only in production: on http://localhost this directive would break asset loading.
  if (isProduction) directives['upgrade-insecure-requests'] = [];
  return directives;
}
```

`src/pages/pages.controller.ts`:

```ts
import { Controller, Get, Render } from '@nestjs/common';
import { ContentService } from '../content/content.service.js';
import type { Lang } from '../content/content.types.js';
import { buildViewModel } from '../content/view-model.js';

@Controller()
export class PagesController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Render('home')
  homeFr() {
    return this.home('fr');
  }

  @Get('en')
  @Render('home')
  homeEn() {
    return this.home('en');
  }

  private home(lang: Lang) {
    return buildViewModel(this.content.get(lang), lang, 'home');
  }
}
```

`src/pages/pages.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module.js';
import { PagesController } from './pages.controller.js';

@Module({
  imports: [ContentModule],
  controllers: [PagesController],
})
export class PagesModule {}
```

`src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { PagesModule } from './pages/pages.module.js';

@Module({
  imports: [PagesModule],
})
export class AppModule {}
```

`src/main.ts` (replace whole file):

```ts
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { loadConfig } from './config.js';
import { configureApp } from './setup-app.js';

if (existsSync('.env')) process.loadEnvFile('.env');
const config = loadConfig();

// Body parsing is configured in configureApp (urlencoded only, 10 kb limit).
const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
configureApp(app, config);
await app.listen(config.port);
```

- [ ] **Step 7: Write the e2e helper and the failing pages test**

`test/create-test-app.ts`:

```ts
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { loadConfig } from '../src/config.js';
import { configureApp } from '../src/setup-app.js';

export interface ProviderOverride {
  provide: unknown;
  useValue: unknown;
}

export async function createTestApp(overrides: ProviderOverride[] = []): Promise<NestExpressApplication> {
  let builder = Test.createTestingModule({ imports: [AppModule] });
  for (const override of overrides) {
    builder = builder.overrideProvider(override.provide).useValue(override.useValue);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
  configureApp(app, loadConfig({ NODE_ENV: 'test' }));
  await app.init();
  return app;
}

// Same escaping as Handlebars {{ }} output, so tests can look for content strings in HTML.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}
```

`test/pages.e2e-spec.ts`:

```ts
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
```

- [ ] **Step 8: Run all tests and the build**

Run: `npm test && npm run test:e2e && npm run build`
Expected: unit tests PASS (config, content, helpers); 6 e2e tests PASS; build exits 0.

- [ ] **Step 9: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: add web shell with layout, styling, security headers and hero

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Home page sections

**Files:**
- Create: `views/partials/home_trust.hbs`, `home_problem.hbs`, `home_solution.hbs`, `home_steps.hbs`, `home_difference.hbs`, `home_subjects.hbs`, `home_audience.hbs`, `home_partnership.hbs`, `home_testimonials.hbs`, `home_teachers.hbs`, `home_cta.hbs`, `public/img/suku.png` (download)
- Modify: `views/home.hbs`, `test/pages.e2e-spec.ts`

**Interfaces:**
- Consumes: view model from `buildViewModel` (`t`, `links`, `contactDetails`), helpers `icon`, `inc`, `times`, CSS classes from Task 3.
- Produces: the full home page; section anchor `#approach` used by the hero button.

- [ ] **Step 1: Write the failing section test**

Add to `test/pages.e2e-spec.ts`, inside the `describe` block (add `import type { SiteContent } from '../src/content/content.types.js';` at the top):

```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:e2e`
Expected: the two new tests FAIL (section titles missing, `suku.png` 404).

- [ ] **Step 3: Download the partner logo**

```bash
curl -sSfL "https://horizons-cdn.hostinger.com/358a3340-34d3-4ef0-b8d2-ffb20229afba/9ea86cc4f594756f9ebe4fa50cb04118.png" -o public/img/suku.png
file public/img/suku.png
```

Expected: `PNG image data`.

- [ ] **Step 4: Write the section partials**

`views/partials/home_trust.hbs`:

```hbs
<section class="bg-mist py-20">
  <div class="container-page">
    <h2 class="section-title">{{t.trustBlock.title}}</h2>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      {{#each t.trustBlock.points}}
        <article class="card p-6">
          <div class="flex items-start gap-4">
            <div class="rounded-xl bg-gold/10 p-3">{{icon this.icon "h-6 w-6 text-gold"}}</div>
            <div>
              <h3 class="mb-2 text-xl font-semibold text-navy">{{title}}</h3>
              <p class="leading-relaxed text-navy/70">{{description}}</p>
            </div>
          </div>
        </article>
      {{/each}}
    </div>
  </div>
</section>
```

`views/partials/home_problem.hbs`:

```hbs
<section class="bg-white py-20">
  <div class="container-page grid grid-cols-1 items-center gap-12 md:grid-cols-2">
    <div>
      <h2 class="mb-6 text-3xl font-bold text-navy md:text-4xl">{{t.problem.title}}</h2>
      <p class="mb-6 max-w-prose leading-relaxed text-navy/70">{{t.problem.description}}</p>
    </div>
    <ul class="space-y-4">
      {{#each t.problem.challenges}}
        <li class="flex items-start gap-3 rounded-xl bg-mist p-4">
          {{icon "circleAlert" "mt-0.5 h-5 w-5 shrink-0 text-gold"}}
          <p class="text-sm leading-relaxed text-navy/80">{{this}}</p>
        </li>
      {{/each}}
    </ul>
  </div>
</section>
```

`views/partials/home_solution.hbs`:

```hbs
<section id="approach" class="scroll-mt-16 bg-mist py-20">
  <div class="container-page">
    <h2 class="section-title">{{t.solution.title}}</h2>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      {{#each t.solution.blocks}}
        <article class="card p-6">
          <div class="mb-4 inline-flex rounded-xl bg-navy p-3">{{icon this.icon "h-6 w-6 text-gold"}}</div>
          <h3 class="mb-3 text-xl font-semibold text-navy">{{title}}</h3>
          <p class="leading-relaxed text-navy/70">{{description}}</p>
        </article>
      {{/each}}
    </div>
  </div>
</section>
```

`views/partials/home_steps.hbs`:

```hbs
<section class="bg-white py-20">
  <div class="container-page">
    <h2 class="section-title">{{t.howItWorks.title}}</h2>
    <ol class="mx-auto max-w-3xl space-y-8">
      {{#each t.howItWorks.steps}}
        <li class="flex gap-6">
          <div class="shrink-0 text-6xl font-bold text-gold/20" aria-hidden="true">{{inc @index}}</div>
          <div class="flex-1 pt-2">
            <h3 class="mb-2 text-xl font-semibold text-navy">{{title}}</h3>
            <p class="leading-relaxed text-navy/70">{{description}}</p>
          </div>
        </li>
      {{/each}}
    </ol>
    <div class="mt-12 text-center">
      <div class="inline-flex items-center gap-2 rounded-xl bg-gold/10 px-6 py-3">
        {{icon "circleCheck" "h-5 w-5 text-gold"}}
        <span class="font-medium text-navy">{{t.howItWorks.reassurance}}</span>
      </div>
    </div>
  </div>
</section>
```

`views/partials/home_difference.hbs`:

```hbs
<section class="bg-mist py-20">
  <div class="container-page">
    <h2 class="section-title">{{t.difference.title}}</h2>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      {{#each t.difference.blocks}}
        <article class="card p-6">
          <div class="flex items-start gap-4">
            <div class="rounded-xl bg-gold/10 p-3">{{icon this.icon "h-6 w-6 text-gold"}}</div>
            <div>
              <h3 class="mb-2 text-xl font-semibold text-navy">{{title}}</h3>
              <p class="leading-relaxed text-navy/70">{{description}}</p>
            </div>
          </div>
        </article>
      {{/each}}
    </div>
  </div>
</section>
```

`views/partials/home_subjects.hbs`:

```hbs
<section class="bg-white py-20">
  <div class="container-page">
    <div class="mb-12 text-center">
      <h2 class="mb-4 text-3xl font-bold text-navy md:text-4xl">{{t.subjects.title}}</h2>
      <p class="mx-auto max-w-2xl text-lg text-navy/70">{{t.subjects.subtitle}}</p>
    </div>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      {{#each t.subjects.cards}}
        <article class="card p-6">
          <div class="mb-4 inline-flex rounded-2xl bg-navy p-4">{{icon this.icon "h-8 w-8 text-gold"}}</div>
          <h3 class="mb-4 text-2xl font-semibold text-navy">{{title}}</h3>
          <p class="mb-4 leading-relaxed text-navy/70">{{description}}</p>
          <ul class="flex flex-wrap gap-2">
            {{#each levels}}
              <li class="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-navy">{{this}}</li>
            {{/each}}
          </ul>
        </article>
      {{/each}}
    </div>
  </div>
</section>
```

`views/partials/home_audience.hbs`:

```hbs
<section class="bg-mist py-20">
  <div class="container-page">
    <h2 class="mb-6 text-center text-3xl font-bold text-navy md:text-4xl">{{t.targetAudience.title}}</h2>
    <p class="mx-auto mb-12 max-w-3xl text-center text-lg leading-relaxed text-navy/70">{{t.targetAudience.description}}</p>
    <ul class="mb-12 flex flex-wrap justify-center gap-3">
      {{#each t.targetAudience.levels}}
        <li class="rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white shadow-sm md:text-base">{{this}}</li>
      {{/each}}
    </ul>
    <ul class="grid grid-cols-1 gap-8 md:grid-cols-2">
      {{#each t.targetAudience.profiles}}
        <li class="flex items-start gap-3 rounded-xl border border-line bg-white p-5 shadow-sm">
          {{icon "circleCheck" "mt-0.5 h-6 w-6 shrink-0 text-gold"}}
          <p class="text-base leading-relaxed font-medium text-navy/80">{{this}}</p>
        </li>
      {{/each}}
    </ul>
  </div>
</section>
```

`views/partials/home_partnership.hbs`:

```hbs
<section class="bg-white py-20">
  <div class="container-page">
    <div class="mb-12 text-center">
      <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2">
        {{icon "handshake" "h-5 w-5 text-gold"}}
        <span class="text-sm font-medium tracking-wide text-navy uppercase">{{t.partnership.partnerName}}</span>
      </div>
      <div class="mb-8 flex justify-center">
        <img src="/img/suku.png" alt="{{t.partnership.logoAlt}}" class="h-auto w-32 object-contain sm:w-40 md:w-48" loading="lazy" />
      </div>
      <h2 class="mb-4 text-3xl font-bold text-navy md:text-4xl">{{t.partnership.title}}</h2>
      <p class="mx-auto max-w-2xl text-lg leading-relaxed text-navy/70">{{t.partnership.description}}</p>
    </div>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {{#each t.partnership.benefits}}
        <article class="h-full rounded-xl bg-mist p-6 text-center shadow-lg transition-all duration-200 hover:shadow-xl">
          <div class="mb-4 inline-flex rounded-xl bg-white p-3">{{icon this.icon "h-6 w-6 text-gold"}}</div>
          <p class="text-sm leading-relaxed text-navy/80">{{text}}</p>
        </article>
      {{/each}}
    </div>
  </div>
</section>
```

`views/partials/home_testimonials.hbs`:

```hbs
<section class="bg-mist py-20">
  <div class="container-page">
    <h2 class="section-title">{{t.testimonials.title}}</h2>
    <div class="gap-6 md:columns-2 lg:columns-3">
      {{#each t.testimonials.cards}}
        <figure class="mb-6 break-inside-avoid rounded-xl bg-white p-6 shadow-lg">
          {{icon "quote" "mb-4 h-8 w-8 text-gold/30"}}
          <blockquote class="mb-4 leading-relaxed text-navy/80 italic">{{content}}</blockquote>
          <div class="mb-3 flex items-center gap-1" role="img" aria-label="{{rating}}/5">
            {{#times rating}}{{icon "star" "h-4 w-4 fill-gold text-gold"}}{{/times}}
          </div>
          <figcaption>
            <p class="font-semibold text-navy">{{name}}</p>
            <p class="text-sm text-navy/60">{{role}}</p>
          </figcaption>
        </figure>
      {{/each}}
    </div>
  </div>
</section>
```

`views/partials/home_teachers.hbs`:

```hbs
<section class="bg-white py-20">
  <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
    <h2 class="mb-4 text-3xl font-bold text-navy md:text-4xl">{{t.teacherRecruitment.title}}</h2>
    <p class="mb-6 text-xl font-medium text-gold">{{t.teacherRecruitment.subtitle}}</p>
    <p class="mx-auto mb-8 max-w-2xl leading-relaxed text-navy/70">{{t.teacherRecruitment.description}}</p>
    <ul class="mb-8 space-y-4">
      {{#each t.teacherRecruitment.requirements}}
        <li class="mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-transparent bg-mist p-4 text-left transition-colors hover:border-line">
          {{icon "circleCheck" "h-5 w-5 shrink-0 text-gold"}}
          <span class="font-medium text-navy/80">{{this}}</span>
        </li>
      {{/each}}
    </ul>
    <a href="{{links.contact}}" class="btn btn-navy">{{t.teacherRecruitment.cta}}{{icon "arrowRight" "h-5 w-5"}}</a>
  </div>
</section>
```

`views/partials/home_cta.hbs`:

```hbs
<section class="bg-linear-to-br from-navy to-navy-dark py-20 text-white">
  <div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
    <h2 class="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">{{t.finalCta.title}}</h2>
    <p class="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">{{t.finalCta.subtitle}}</p>
    <div class="flex flex-col justify-center gap-4 sm:flex-row">
      <a href="{{links.contact}}" class="btn btn-gold">{{t.finalCta.ctaPrimary}}{{icon "arrowRight" "h-5 w-5"}}</a>
      <a href="{{contactDetails.whatsappUrl}}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-light">{{icon "messageCircle" "h-5 w-5"}}{{t.finalCta.ctaSecondary}}</a>
    </div>
  </div>
</section>
```

`views/home.hbs` (replace whole file):

```hbs
{{> home_hero}}
{{> home_trust}}
{{> home_problem}}
{{> home_solution}}
{{> home_steps}}
{{> home_difference}}
{{> home_subjects}}
{{> home_audience}}
{{> home_partnership}}
{{> home_testimonials}}
{{> home_teachers}}
{{> home_cta}}
```

- [ ] **Step 5: Run the tests**

Run: `npm run test:e2e`
Expected: all pages e2e tests PASS (8 total, the `it.each` counts as 2).

- [ ] **Step 6: Visual check**

Run: `npm run build && PORT=3000 node dist/main.js` (background), then open `http://localhost:3000/` and `http://localhost:3000/en` in a browser at desktop width and at 360 px width. Check: hero image visible behind the navy overlay, gold accents, cards in two columns on desktop and one on mobile, mobile menu opens via the menu icon, no horizontal scroll. Stop the server afterwards.

- [ ] **Step 7: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: render all home page sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Contact page with CSRF protection

**Files:**
- Create: `src/security/csrf.ts`, `views/contact.hbs`, `views/error.hbs`, `views/partials/contact_form.hbs`, `views/partials/contact_info.hbs`, `test/contact-page.e2e-spec.ts`
- Modify: `src/setup-app.ts`, `src/pages/pages.controller.ts`

**Interfaces:**
- Consumes: `buildViewModel`, `getContent`, `pathFor` (Task 2); `configureApp` (Task 3).
- Produces: `SESSION_COOKIE = 'pf_sid'`; `sessionIdMiddleware(isProduction: boolean): RequestHandler`; `csrfMiddleware(options: { secret: string; isProduction: boolean; onInvalid: (req: Request, res: Response) => void }): RequestHandler`; `req.csrfToken()` available on `/contact` and `/en/contact`; view `contact` expecting extra keys `csrfToken: string`, `sent: boolean`, `values: Partial<Record<ContactField, string>>`, `errors: Partial<Record<ContactField, string>>`, `hasErrors: boolean`; view `error` expecting `message: string`.

- [ ] **Step 1: Write the failing contact page test**

`test/contact-page.e2e-spec.ts`:

```ts
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
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:e2e`
Expected: the 5 new tests FAIL (`/contact` returns 404).

- [ ] **Step 3: Implement the CSRF middleware**

`src/security/csrf.ts`:

```ts
import { doubleCsrf } from 'csrf-csrf';
import type { Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';

export const SESSION_COOKIE = 'pf_sid';

function readCookie(req: Request, name: string): string {
  const cookies = req.cookies as Record<string, string | undefined> | undefined;
  return cookies?.[name] ?? '';
}

// Gives each visitor of the contact page a random id that the CSRF token is bound to.
export function sessionIdMiddleware(isProduction: boolean): RequestHandler {
  return (req, res, next) => {
    if (!readCookie(req, SESSION_COOKIE)) {
      const id = randomUUID();
      req.cookies = { ...(req.cookies as Record<string, string> | undefined), [SESSION_COOKIE]: id };
      res.cookie(SESSION_COOKIE, id, { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
    }
    next();
  };
}

export interface CsrfOptions {
  secret: string;
  isProduction: boolean;
  onInvalid: (req: Request, res: Response) => void;
}

export function csrfMiddleware({ secret, isProduction, onInvalid }: CsrfOptions): RequestHandler {
  const { doubleCsrfProtection } = doubleCsrf({
    getSecret: () => secret,
    getSessionIdentifier: (req) => readCookie(req, SESSION_COOKIE),
    cookieName: isProduction ? '__Host-pf_csrf' : 'pf_csrf',
    cookieOptions: { sameSite: 'lax', secure: isProduction, path: '/', httpOnly: true },
    getCsrfTokenFromRequest: (req) => {
      const token = (req.body as Record<string, unknown> | undefined)?._csrf;
      return typeof token === 'string' ? token : undefined;
    },
  });

  return (req, res, next) => {
    doubleCsrfProtection(req, res, (err?: unknown) => {
      if (err) {
        onInvalid(req, res);
        return;
      }
      next();
    });
  };
}
```

- [ ] **Step 4: Wire CSRF into the app setup**

In `src/setup-app.ts`:

Add imports:

```ts
import type { Request, Response } from 'express';
import { getContent } from './content/content.service.js';
import type { Lang } from './content/content.types.js';
import { buildViewModel } from './content/view-model.js';
import { csrfMiddleware, sessionIdMiddleware } from './security/csrf.js';
```

Add a constant below the imports:

```ts
// Cookies are only needed where the form lives; the rest of the site stays cookie-free.
const CONTACT_ROUTES = ['/contact', '/en/contact'];
```

Insert after `app.use(express.urlencoded({ extended: false, limit: '10kb' }));`:

```ts
  app.use(
    CONTACT_ROUTES,
    sessionIdMiddleware(config.isProduction),
    csrfMiddleware({ secret: config.csrfSecret, isProduction: config.isProduction, onInvalid: renderCsrfError }),
  );
```

Add at the end of the file:

```ts
function renderCsrfError(req: Request, res: Response): void {
  const lang: Lang = req.originalUrl.startsWith('/en') ? 'en' : 'fr';
  const t = getContent(lang);
  res.status(403).render('error', buildViewModel(t, lang, 'contact', { message: t.errorPage.csrfMessage }));
}
```

- [ ] **Step 5: Add the contact GET routes**

`src/pages/pages.controller.ts` (replace whole file):

```ts
import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ContentService } from '../content/content.service.js';
import type { Lang } from '../content/content.types.js';
import { buildViewModel } from '../content/view-model.js';

@Controller()
export class PagesController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Render('home')
  homeFr() {
    return this.home('fr');
  }

  @Get('en')
  @Render('home')
  homeEn() {
    return this.home('en');
  }

  @Get('contact')
  @Render('contact')
  contactFr(@Req() req: Request, @Query('sent') sent?: string) {
    return this.contact('fr', req, sent);
  }

  @Get('en/contact')
  @Render('contact')
  contactEn(@Req() req: Request, @Query('sent') sent?: string) {
    return this.contact('en', req, sent);
  }

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

- [ ] **Step 6: Write the contact and error views**

`views/contact.hbs`:

```hbs
<section class="bg-linear-to-br from-navy to-navy-dark py-20 text-white">
  <div class="container-page text-center">
    <h1 class="mb-4 text-4xl font-bold text-balance md:text-5xl">{{t.contact.title}}</h1>
    <p class="mx-auto max-w-2xl text-lg text-white/90">{{t.contact.subtitle}}</p>
  </div>
</section>

<section class="py-20">
  <div class="container-page grid grid-cols-1 gap-12 lg:grid-cols-2">
    <div class="rounded-xl bg-white p-8 shadow-lg">
      {{#if sent}}
        <div class="mb-6 flex items-start gap-3 rounded-xl bg-gold/10 p-4 text-navy" role="status">
          {{icon "circleCheck" "mt-0.5 h-5 w-5 shrink-0 text-gold"}}
          <p>{{t.contact.success}}</p>
        </div>
      {{/if}}
      {{#if hasErrors}}
        <div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{{t.contact.errorSummary}}</div>
      {{/if}}
      {{> contact_form}}
    </div>
    {{> contact_info}}
  </div>
</section>
```

`views/partials/contact_form.hbs`:

```hbs
<form method="post" action="{{links.contact}}" class="space-y-6">
  <input type="hidden" name="_csrf" value="{{csrfToken}}" />

  {{!-- Honeypot: hidden from people, filled by bots. --}}
  <div class="hidden" aria-hidden="true">
    <label for="website">Website</label>
    <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" />
  </div>

  <div>
    <label for="name" class="field-label">{{t.contact.form.name}}</label>
    <input id="name" name="name" type="text" required minlength="2" maxlength="100" autocomplete="name" value="{{values.name}}" placeholder="{{t.contact.form.namePlaceholder}}" class="field"{{#if errors.name}} aria-invalid="true" aria-describedby="name-error"{{/if}} />
    {{#if errors.name}}<p id="name-error" class="field-error">{{errors.name}}</p>{{/if}}
  </div>

  <div>
    <label for="email" class="field-label">{{t.contact.form.email}}</label>
    <input id="email" name="email" type="email" required maxlength="254" autocomplete="email" value="{{values.email}}" placeholder="{{t.contact.form.emailPlaceholder}}" class="field"{{#if errors.email}} aria-invalid="true" aria-describedby="email-error"{{/if}} />
    {{#if errors.email}}<p id="email-error" class="field-error">{{errors.email}}</p>{{/if}}
  </div>

  <div>
    <label for="phone" class="field-label">{{t.contact.form.phone}}</label>
    <input id="phone" name="phone" type="tel" required minlength="8" maxlength="30" autocomplete="tel" value="{{values.phone}}" placeholder="{{t.contact.form.phonePlaceholder}}" class="field"{{#if errors.phone}} aria-invalid="true" aria-describedby="phone-error"{{/if}} />
    {{#if errors.phone}}<p id="phone-error" class="field-error">{{errors.phone}}</p>{{/if}}
  </div>

  <div>
    <label for="subject" class="field-label">{{t.contact.form.subject}}</label>
    <input id="subject" name="subject" type="text" required minlength="3" maxlength="150" value="{{values.subject}}" placeholder="{{t.contact.form.subjectPlaceholder}}" class="field"{{#if errors.subject}} aria-invalid="true" aria-describedby="subject-error"{{/if}} />
    {{#if errors.subject}}<p id="subject-error" class="field-error">{{errors.subject}}</p>{{/if}}
  </div>

  <div>
    <label for="message" class="field-label">{{t.contact.form.message}}</label>
    <textarea id="message" name="message" rows="5" required minlength="10" maxlength="2000" placeholder="{{t.contact.form.messagePlaceholder}}" class="field"{{#if errors.message}} aria-invalid="true" aria-describedby="message-error"{{/if}}>{{values.message}}</textarea>
    {{#if errors.message}}<p id="message-error" class="field-error">{{errors.message}}</p>{{/if}}
  </div>

  <p class="text-xs text-navy/60">{{t.contact.privacyNotice}}</p>
  <button type="submit" class="btn btn-gold w-full">{{t.contact.form.submit}}</button>
</form>
```

`views/partials/contact_info.hbs`:

```hbs
<div class="space-y-8">
  <div>
    <h2 class="mb-6 text-2xl font-bold text-navy">{{t.contact.info.title}}</h2>
    <ul class="space-y-4">
      <li class="info-item">
        {{icon "mapPin" "mt-0.5 h-5 w-5 shrink-0 text-gold"}}
        <div><p class="font-medium text-navy">{{t.contact.info.addressLabel}}</p><p class="text-sm text-navy/70">{{t.contact.info.address}}</p></div>
      </li>
      <li class="info-item">
        {{icon "phone" "mt-0.5 h-5 w-5 shrink-0 text-gold"}}
        <div><p class="font-medium text-navy">{{t.contact.info.phoneLabel}}</p><a href="{{contactDetails.phoneHref}}" class="text-sm text-navy/70 hover:text-navy">{{contactDetails.phoneDisplay}}</a></div>
      </li>
      <li class="info-item">
        {{icon "messageCircle" "mt-0.5 h-5 w-5 shrink-0 text-gold"}}
        <div><p class="font-medium text-navy">{{t.contact.info.whatsappLabel}}</p><a href="{{contactDetails.whatsappUrl}}" target="_blank" rel="noopener noreferrer" class="text-sm text-navy/70 hover:text-navy">{{contactDetails.phoneDisplay}}</a></div>
      </li>
      <li class="info-item">
        {{icon "mail" "mt-0.5 h-5 w-5 shrink-0 text-gold"}}
        <div><p class="font-medium text-navy">{{t.contact.info.emailLabel}}</p><a href="mailto:{{contactDetails.email}}" class="text-sm text-navy/70 hover:text-navy">{{contactDetails.email}}</a></div>
      </li>
      <li class="info-item">
        {{icon "clock" "mt-0.5 h-5 w-5 shrink-0 text-gold"}}
        <div><p class="font-medium text-navy">{{t.contact.info.hoursLabel}}</p><p class="text-sm text-navy/70">{{t.contact.info.hours}}</p></div>
      </li>
    </ul>
  </div>
  <div>
    <h3 class="mb-4 text-lg font-semibold text-navy">{{t.contact.info.socialTitle}}</h3>
    <div class="flex gap-4">
      <a href="{{contactDetails.facebookUrl}}" target="_blank" rel="noopener noreferrer" class="rounded-xl bg-navy p-3 text-white transition-all duration-200 hover:bg-gold hover:text-navy" aria-label="Facebook">{{icon "facebook" "h-6 w-6"}}</a>
      <a href="{{contactDetails.instagramUrl}}" target="_blank" rel="noopener noreferrer" class="rounded-xl bg-navy p-3 text-white transition-all duration-200 hover:bg-gold hover:text-navy" aria-label="Instagram">{{icon "instagram" "h-6 w-6"}}</a>
    </div>
  </div>
</div>
```

`views/error.hbs`:

```hbs
<section class="py-24">
  <div class="mx-auto max-w-xl px-4 text-center">
    {{icon "circleAlert" "mx-auto mb-6 h-12 w-12 text-gold"}}
    <h1 class="mb-4 text-3xl font-bold text-navy">{{t.errorPage.title}}</h1>
    <p class="mb-8 text-navy/70">{{message}}</p>
    <a href="{{links.contact}}" class="btn btn-navy">{{t.errorPage.back}}</a>
  </div>
</section>
```

- [ ] **Step 7: Run all tests and typecheck**

Run: `npm test && npm run test:e2e && npx tsc --noEmit -p tsconfig.json`
Expected: all unit and e2e tests PASS (including the 5 new contact page tests; the home page test "sets no cookies" still passes); tsc exits 0.

- [ ] **Step 8: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: add contact page with CSRF protection

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Contact form submission (validation, honeypot, rate limit, notifier)

**Files:**
- Create: `src/contact/contact.dto.ts`, `src/contact/contact.dto.spec.ts`, `src/contact/contact-notifier.ts`, `src/contact/contact-notifier.spec.ts`, `src/contact/contact.controller.ts`, `src/contact/contact.module.ts`, `test/contact-submit.e2e-spec.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: `ContactField`, `Lang` (Task 2); `ContentService`, `ContentModule`, `buildViewModel`, `pathFor` (Task 2); contact view keys and `req.csrfToken()` (Task 5).
- Produces: `ContactDto`; `CONTACT_FIELDS: readonly ContactField[]`; `type ContactValues = Record<ContactField, string>`; `validateContact(body: Record<string, unknown>): Promise<{ ok: true; value: ContactValues } | { ok: false; fields: ContactField[] }>`; `isHoneypotFilled(body: Record<string, unknown>): boolean`; `pickContactValues(body: Record<string, unknown>): Partial<Record<ContactField, string>>`; `interface ContactRequest extends ContactValues { lang: Lang; receivedAt: Date }`; abstract class `ContactNotifier { notify(request: ContactRequest): Promise<void> }`; `LoggingContactNotifier`; `POST /contact`, `POST /en/contact`.

- [ ] **Step 1: Write the failing validation test**

`src/contact/contact.dto.spec.ts`:

```ts
import { isHoneypotFilled, pickContactValues, validateContact } from './contact.dto.js';

const valid = {
  name: 'Awa Nkoa',
  email: 'awa@example.com',
  phone: '+237 651 544 974',
  subject: 'Inscription en Seconde',
  message: 'Bonjour, je souhaite inscrire ma fille en Seconde.',
};

describe('validateContact', () => {
  it('accepts a valid request, trims values and drops unknown fields', async () => {
    const result = await validateContact({ ...valid, name: '  Awa Nkoa  ', _csrf: 'token', extra: 'x' });
    expect(result).toEqual({ ok: true, value: valid });
  });

  it.each([
    ['name', { name: 'A' }],
    ['name', { name: 'A'.repeat(101) }],
    ['email', { email: 'not-an-email' }],
    ['phone', { phone: '1234' }],
    ['phone', { phone: 'call me maybe' }],
    ['subject', { subject: 'Hi' }],
    ['message', { message: 'Too short' }],
    ['message', { message: 'x'.repeat(2001) }],
  ])('rejects an invalid %s', async (field, override) => {
    const result = await validateContact({ ...valid, ...override });
    expect(result).toEqual({ ok: false, fields: [field] });
  });

  it('reports every missing field in form order', async () => {
    const result = await validateContact({});
    expect(result).toEqual({ ok: false, fields: ['name', 'email', 'phone', 'subject', 'message'] });
  });

  it('treats whitespace-only values as missing', async () => {
    const result = await validateContact({ ...valid, subject: '     ' });
    expect(result).toEqual({ ok: false, fields: ['subject'] });
  });

  it('rejects repeated fields (arrays) instead of crashing', async () => {
    const result = await validateContact({ ...valid, name: ['Awa', 'Nkoa'] });
    expect(result).toEqual({ ok: false, fields: ['name'] });
  });
});

describe('isHoneypotFilled', () => {
  it('is false when the field is absent or empty', () => {
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled({ website: '' })).toBe(false);
    expect(isHoneypotFilled({ website: '   ' })).toBe(false);
  });

  it('is true when a bot filled it', () => {
    expect(isHoneypotFilled({ website: 'https://spam.example' })).toBe(true);
    expect(isHoneypotFilled({ website: ['a'] })).toBe(true);
  });
});

describe('pickContactValues', () => {
  it('keeps only known string fields for re-filling the form', () => {
    expect(pickContactValues({ name: 'Awa', email: ['x'], _csrf: 't', website: 'w' })).toEqual({ name: 'Awa' });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/contact`
Expected: FAIL, cannot resolve `./contact.dto.js`.

- [ ] **Step 3: Implement the DTO and helpers**

`src/contact/contact.dto.ts`:

```ts
import { plainToInstance, Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength, validate } from 'class-validator';
import type { ContactField } from '../content/content.types.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ContactDto {
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  name: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Transform(trim)
  @IsString()
  @Matches(/^[0-9+()\s.-]{8,30}$/)
  phone: string;

  @Transform(trim)
  @IsString()
  @Length(3, 150)
  subject: string;

  @Transform(trim)
  @IsString()
  @Length(10, 2000)
  message: string;
}

export const CONTACT_FIELDS: readonly ContactField[] = ['name', 'email', 'phone', 'subject', 'message'];

export type ContactValues = Record<ContactField, string>;

export type ContactValidationResult = { ok: true; value: ContactValues } | { ok: false; fields: ContactField[] };

export async function validateContact(body: Record<string, unknown>): Promise<ContactValidationResult> {
  const dto = plainToInstance(ContactDto, body);
  const errors = await validate(dto, { whitelist: true });
  if (errors.length > 0) {
    return { ok: false, fields: CONTACT_FIELDS.filter((field) => errors.some((e) => e.property === field)) };
  }
  const { name, email, phone, subject, message } = dto;
  return { ok: true, value: { name, email, phone, subject, message } };
}

export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  const value = body.website;
  if (value === undefined || value === null) return false;
  return typeof value === 'string' ? value.trim() !== '' : true;
}

export function pickContactValues(body: Record<string, unknown>): Partial<Record<ContactField, string>> {
  const values: Partial<Record<ContactField, string>> = {};
  for (const field of CONTACT_FIELDS) {
    const value = body[field];
    if (typeof value === 'string') values[field] = value;
  }
  return values;
}
```

Run: `npx vitest run src/contact/contact.dto.spec.ts`
Expected: all PASS.

- [ ] **Step 4: Write the failing notifier test**

`src/contact/contact-notifier.spec.ts`:

```ts
import { Logger } from '@nestjs/common';
import { LoggingContactNotifier } from './contact-notifier.js';

describe('LoggingContactNotifier', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs who wrote and in which language, but no phone, subject or message', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    await new LoggingContactNotifier().notify({
      name: 'Awa Nkoa',
      email: 'awa@example.com',
      phone: '+237 600 000 000',
      subject: 'SECRET-SUBJECT',
      message: 'SECRET-MESSAGE-BODY',
      lang: 'fr',
      receivedAt: new Date('2026-10-04T10:00:00Z'),
    });

    const output = log.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('Awa Nkoa');
    expect(output).toContain('awa@example.com');
    expect(output).toContain('lang=fr');
    expect(output).not.toContain('+237 600 000 000');
    expect(output).not.toContain('SECRET-SUBJECT');
    expect(output).not.toContain('SECRET-MESSAGE-BODY');
  });
});
```

Run: `npx vitest run src/contact/contact-notifier.spec.ts`
Expected: FAIL, cannot resolve `./contact-notifier.js`.

- [ ] **Step 5: Implement the notifier**

`src/contact/contact-notifier.ts`:

```ts
import { Injectable, Logger } from '@nestjs/common';
import type { Lang } from '../content/content.types.js';
import type { ContactValues } from './contact.dto.js';

export interface ContactRequest extends ContactValues {
  lang: Lang;
  receivedAt: Date;
}

// Delivery channel for contact requests. v1 logs; an email or database implementation can replace it via DI.
export abstract class ContactNotifier {
  abstract notify(request: ContactRequest): Promise<void>;
}

@Injectable()
export class LoggingContactNotifier extends ContactNotifier {
  private readonly logger = new Logger('ContactRequest');

  notify(request: ContactRequest): Promise<void> {
    // Phone, subject and message are deliberately not logged (GDPR data minimisation).
    this.logger.log(
      `New contact request from ${request.name} <${request.email}> lang=${request.lang} at=${request.receivedAt.toISOString()}`,
    );
    return Promise.resolve();
  }
}
```

Run: `npx vitest run src/contact`
Expected: all PASS.

- [ ] **Step 6: Write the failing submission e2e test**

`test/contact-submit.e2e-spec.ts`:

```ts
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
```

Run: `npm run test:e2e`
Expected: the new tests FAIL (POST returns 404 after passing CSRF).

- [ ] **Step 7: Implement controller and module, wire throttling**

`src/contact/contact.controller.ts`:

```ts
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { ContentService } from '../content/content.service.js';
import type { Lang } from '../content/content.types.js';
import { buildViewModel, pathFor } from '../content/view-model.js';
import { ContactNotifier } from './contact-notifier.js';
import { isHoneypotFilled, pickContactValues, validateContact } from './contact.dto.js';

@Controller()
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(
    private readonly content: ContentService,
    private readonly notifier: ContactNotifier,
  ) {}

  @Post('contact')
  submitFr(@Req() req: Request, @Res() res: Response, @Body() body?: Record<string, unknown>): Promise<void> {
    return this.submit('fr', req, res, body ?? {});
  }

  @Post('en/contact')
  submitEn(@Req() req: Request, @Res() res: Response, @Body() body?: Record<string, unknown>): Promise<void> {
    return this.submit('en', req, res, body ?? {});
  }

  private async submit(lang: Lang, req: Request, res: Response, body: Record<string, unknown>): Promise<void> {
    const successUrl = `${pathFor(lang, 'contact')}?sent=1`;

    // Bots get the same answer as people, so they cannot learn that they were filtered.
    if (isHoneypotFilled(body)) {
      res.redirect(303, successUrl);
      return;
    }

    const result = await validateContact(body);
    if (!result.ok) {
      const t = this.content.get(lang);
      const errors = Object.fromEntries(result.fields.map((field) => [field, t.contact.errors[field]]));
      res.status(400).render(
        'contact',
        buildViewModel(t, lang, 'contact', {
          csrfToken: req.csrfToken?.() ?? '',
          sent: false,
          values: pickContactValues(body),
          errors,
          hasErrors: true,
        }),
      );
      return;
    }

    await this.notifier.notify({ ...result.value, lang, receivedAt: new Date() });
    res.redirect(303, successUrl);
  }
}
```

`src/contact/contact.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module.js';
import { ContactNotifier, LoggingContactNotifier } from './contact-notifier.js';
import { ContactController } from './contact.controller.js';

@Module({
  imports: [ContentModule],
  controllers: [ContactController],
  providers: [{ provide: ContactNotifier, useClass: LoggingContactNotifier }],
})
export class ContactModule {}
```

`src/app.module.ts` (replace whole file):

```ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ContactModule } from './contact/contact.module.js';
import { PagesModule } from './pages/pages.module.js';

@Module({
  imports: [
    // Applied only where ThrottlerGuard is used (the contact form POST routes).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    PagesModule,
    ContactModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Run all tests and typecheck**

Run: `npm test && npm run test:e2e && npx tsc --noEmit -p tsconfig.json`
Expected: all unit and e2e tests PASS; tsc exits 0.

- [ ] **Step 9: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: handle contact form submissions with validation and rate limiting

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: README and end-to-end verification

**Files:**
- Create/replace: `README.md`

**Interfaces:**
- Consumes: everything above.
- Produces: documentation for running, testing and deploying.

- [ ] **Step 1: Write the README**

`README.md` (replace the scaffold README):

````markdown
# Performia website

Server-rendered NestJS rebuild of helloperformia.com (French and English).

## Requirements

Node 24 and npm.

## Setup

```bash
npm install
cp .env.example .env   # set CSRF_SECRET for production: openssl rand -hex 32
```

## Development

Run the CSS watcher and the server in two terminals:

```bash
npm run watch:css
npm run start:dev
```

Open http://localhost:3000 (French) or http://localhost:3000/en (English).

## Tests

```bash
npm test            # unit tests
npm run test:e2e    # HTTP tests (builds the CSS first)
npm run lint
```

## Production

```bash
npm run build
NODE_ENV=production CSRF_SECRET=... TRUST_PROXY=true npm run start:prod
```

Serve over HTTPS (cookies are `Secure` in production). Set `TRUST_PROXY=true` behind a reverse proxy so rate limiting uses the client IP.

## Where things live

- Copy: `src/content/fr.ts` and `src/content/en.ts` (same structure, enforced by TypeScript and a test).
- Phone, WhatsApp, email and social links: `src/content/contact-details.ts`.
- Templates: `views/` (sections of the home page are `views/partials/home_*.hbs`).
- Styles and colors: `styles/app.css`.
- Contact requests are logged by `LoggingContactNotifier` (`src/contact/contact-notifier.ts`). To send emails instead, add a class extending `ContactNotifier` and register it in `ContactModule`.

## Open points before launch

Search for `TODO: verify` in `src/content/`: the "847 familles" and "92%" figures, the testimonials, the refund guarantee and the social media URLs come from the old site and need confirmation.
````

- [ ] **Step 2: Full verification**

Run: `npm run lint && npm test && npm run test:e2e && npm run build`
Expected: lint reports no errors; all tests PASS; build exits 0.

- [ ] **Step 3: Smoke test the production build**

```bash
NODE_ENV=production CSRF_SECRET=$(openssl rand -hex 32) PORT=3100 node dist/main.js &
SERVER=$!
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/en/contact
curl -sI http://localhost:3100/contact | grep -i -E "set-cookie|content-security-policy"
kill $SERVER
```

Expected: `200`, `200`; `Set-Cookie` lines for `pf_sid` and `__Host-pf_csrf` with `Secure; HttpOnly; SameSite=Lax`; CSP includes `upgrade-insecure-requests`.

- [ ] **Step 4: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "docs: add README with setup, testing and deployment notes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
