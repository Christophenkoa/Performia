# Performia Redesign (Direction A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing NestJS site to the approved direction A "Confiance", rebrand it to Performia with the Envol logo, and reframe the copy as tutoring that complements school, with other subjects on demand.

**Architecture:** No architectural change. Same NestJS 12 app, Handlebars views, Tailwind 4 build, typed FR/EN content. Task 1 lays the brand foundation (tokens, fonts, icons, header, footer). Task 2 rebuilds the home page and the content model. Task 3 restyles the contact and error pages.

**Tech Stack:** NestJS 12 (ESM), Handlebars (hbs 4.3), Tailwind CSS 4.3, Vitest 4 + supertest, `@fontsource-variable/sora` 5.3.0 and `@fontsource-variable/dm-sans` (self-hosted).

**Spec:** `docs/superpowers/specs/2026-10-04-performia-redesign-design.md`

## Global Constraints

- Every relative TypeScript import ends in `.js`; Vitest globals are used without imports.
- No inline `<script>`, no `style="..."` attributes, no client-side JavaScript (CSP: `script-src 'self'; style-src 'self'; img-src 'self'`).
- Partial file names use underscores (hbs maps `-` to `_`).
- Colors: navy `#13294B`, navy-deep `#0F2140`, gold `#D4A83A`, sand `#F3EEDF`, mist `#F7F9FC`, line `#E3E8EF`, muted `#44546A`, on-navy `#D6DDE8`. Gold is never a text color on white or light backgrounds.
- Fonts: Sora for h1, h2, h3 and the wordmark; DM Sans for body. Both self-hosted.
- Brand name: "Performia". The string "Academic Excellence" must not appear in any rendered page after Task 1.
- Contact details stay: `+237 651 544 974`, `tel:+237651544974`, `https://wa.me/237651544974`, `contact@helloperformia.com`, "Yaoundé, Douala, Cameroun" / "Yaoundé, Douala, Cameroon".
- Contact form fields, validation, CSRF, rate limiting, honeypot, error pages and security headers keep their behaviour; their existing tests must pass.
- Unverified content keeps a `// TODO: verify` comment (testimonials, social URLs).
- Never use em-dashes in any copy you write; use hyphens.
- Commits: `git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "..."`, message ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Visual reference: `docs/design/direction-a-confiance.dc.html` (the approved mockup; read it for layout intent, do not copy its inline styles).

---

### Task 1: Brand foundation (tokens, fonts, icons, logo, header, footer)

**Files:**
- Modify: `styles/app.css` (full replacement), `views/layout.hbs`, `views/partials/header.hbs` (full replacement), `views/partials/footer.hbs` (full replacement), `src/content/content.types.ts` (nav keys), `src/content/fr.ts`, `src/content/en.ts`, `test/pages.e2e-spec.ts` (add tests), `package.json` (dev dependency)
- Create: `views/partials/logo_mark.hbs`, `public/fonts/sora-latin-wght-normal.woff2` (copy), `public/favicon.ico`, `public/img/apple-touch-icon.png`, `public/img/icon-192.png`, `public/img/icon-512.png`, `public/site.webmanifest`
- Replace: `public/img/favicon.svg`

**Interfaces:**
- Consumes: `buildViewModel` view keys (`t`, `links.home`, `links.contact`, `switchPath`, `isHome`, `isContact`, `contactDetails`), helpers `icon`, `inc`.
- Produces: partial `{{> logo_mark size=N}}`; CSS classes `container-page`, `h-section`, `eyebrow`, `pill`, `btn`, `btn-sm`, `btn-gold`, `btn-navy`, `btn-outline`, `btn-outline-light`, `nav-link`, `nav-link-active`, `lang-switch`, `footer-title`, `footer-link`, `social-link`, `info-item`, `field`, `field-label`, `field-error` (plus legacy `section-title`, `card` kept until Task 2); theme colors `navy`, `navy-deep`, `navy-dark`, `gold`, `gold-dark`, `sand`, `mist`, `line`, `muted`, `on-navy`; `SiteContent.nav` gains `approach`, `subjects`, `reviews`, `cta`.

- [ ] **Step 1: Write the failing tests**

Add inside the `describe` block of `test/pages.e2e-spec.ts`:

```ts
  it('shows the Performia brand with the Envol mark and no old brand name', async () => {
    const server = app.getHttpServer();
    const home = await request(server).get('/').expect(200);
    expect(home.text).toContain(`<title>${escapeHtml(fr.meta.homeTitle)}</title>`);
    expect(fr.meta.homeTitle.startsWith('Performia')).toBe(true);
    expect(home.text).toContain('viewBox="0 0 64 64"');
    expect(home.text).toContain('>Performia<');
    expect(home.text).toContain(escapeHtml(fr.footer.copyright));
    expect(home.text).toContain(escapeHtml(fr.nav.cta));
    for (const path of ['/', '/en', '/contact', '/en/contact', '/does-not-exist']) {
      const res = await request(server).get(path);
      expect(res.text).not.toContain('Academic Excellence');
    }
  });

  it('serves the brand icons, manifest and Sora font', async () => {
    const server = app.getHttpServer();
    const home = await request(server).get('/').expect(200);
    expect(home.text).toContain('<link rel="apple-touch-icon" href="/img/apple-touch-icon.png" />');
    expect(home.text).toContain('<link rel="manifest" href="/site.webmanifest" />');
    await request(server).get('/fonts/sora-latin-wght-normal.woff2').expect(200);
    await request(server).get('/favicon.ico').expect(200);
    await request(server).get('/img/apple-touch-icon.png').expect(200).expect('Content-Type', /png/);
    await request(server).get('/img/icon-192.png').expect(200);
    await request(server).get('/img/icon-512.png').expect(200);
    const manifest = await request(server).get('/site.webmanifest').expect(200);
    expect(JSON.parse(manifest.text)).toMatchObject({ name: 'Performia', theme_color: '#13294B' });
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:e2e`
Expected: the 2 new tests FAIL (title starts with "Academic Excellence", Sora font 404).

- [ ] **Step 3: Install Sora and copy brand files into `public/`**

```bash
npm i -D @fontsource-variable/sora@5.3.0
cp node_modules/@fontsource-variable/sora/files/sora-latin-wght-normal.woff2 public/fonts/
cp brand/svg/performia-mark.svg public/img/favicon.svg
cp brand/png/favicon.ico public/favicon.ico
cp brand/png/performia-mark-180.png public/img/apple-touch-icon.png
cp brand/png/performia-mark-192.png public/img/icon-192.png
cp brand/png/performia-mark-512.png public/img/icon-512.png
```

`public/site.webmanifest`:

```json
{
  "name": "Performia",
  "short_name": "Performia",
  "icons": [
    { "src": "/img/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/img/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#13294B",
  "background_color": "#FFFFFF",
  "display": "browser"
}
```

- [ ] **Step 4: Replace `styles/app.css`**

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
  font-family: 'Sora';
  font-style: normal;
  font-display: swap;
  font-weight: 100 800;
  src: url('/fonts/sora-latin-wght-normal.woff2') format('woff2');
}

/* Performia brand tokens (see brand/README.md). */
@theme {
  --color-navy: #13294b;
  --color-navy-deep: #0f2140;
  --color-navy-dark: #0b1a33;
  --color-gold: #d4a83a;
  --color-gold-dark: #c29630;
  --color-sand: #f3eedf;
  --color-mist: #f7f9fc;
  --color-line: #e3e8ef;
  --color-muted: #44546a;
  --color-on-navy: #d6dde8;
  --font-sans: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Sora', ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }
  body {
    @apply bg-white font-sans text-navy antialiased;
  }
  h1,
  h2,
  h3 {
    @apply font-display;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  :focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 2px;
  }
}

@layer components {
  .container-page {
    @apply mx-auto w-full max-w-[1200px] px-6;
  }
  .h-section {
    @apply text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-[44px] lg:leading-[1.1];
  }
  .eyebrow {
    @apply text-sm font-semibold tracking-[0.08em] text-gold uppercase;
  }
  .pill {
    @apply inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-navy;
  }
  /* Legacy home-page classes, removed in Task 2 together with the old partials. */
  .section-title {
    @apply mb-12 text-center text-3xl font-bold text-navy md:text-4xl;
  }
  .card {
    @apply h-full rounded-3xl border border-line bg-white transition-shadow duration-200 hover:shadow-lg;
  }
  .btn {
    @apply inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 text-base font-semibold transition-colors duration-200 active:scale-[0.98];
  }
  .btn-sm {
    @apply min-h-10 px-5 text-sm;
  }
  .btn-gold {
    @apply bg-gold text-navy hover:bg-gold-dark;
  }
  .btn-navy {
    @apply bg-navy text-white hover:bg-navy-dark;
  }
  .btn-outline {
    @apply border-[1.5px] border-navy text-navy hover:bg-navy hover:text-white;
  }
  .btn-outline-light {
    @apply border-[1.5px] border-white/50 text-white hover:bg-white hover:text-navy;
  }
  .nav-link {
    @apply text-[15px] font-medium text-navy decoration-gold decoration-2 underline-offset-8 transition-colors hover:underline;
  }
  .nav-link-active {
    @apply underline;
  }
  .lang-switch {
    @apply inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-[13px] font-semibold text-navy transition-colors hover:border-navy;
  }
  .footer-title {
    @apply mb-4 font-sans text-sm font-semibold tracking-wider text-muted uppercase;
  }
  .footer-link {
    @apply flex items-center gap-2 text-sm text-navy transition-colors hover:underline;
  }
  .social-link {
    @apply inline-flex rounded-full border border-line p-2.5 text-navy transition-colors hover:bg-navy hover:text-white;
  }
  .info-item {
    @apply flex items-start gap-4 rounded-2xl bg-mist p-5;
  }
  .field {
    @apply w-full rounded-xl border border-line bg-white px-4 py-3 text-navy placeholder:text-muted/70 focus:border-navy focus:ring-2 focus:ring-gold/60 focus:outline-none aria-invalid:border-red-600;
  }
  .field-label {
    @apply mb-2 block text-sm font-semibold text-navy;
  }
  .field-error {
    @apply mt-2 text-sm text-red-700;
  }
}
```

- [ ] **Step 5: Logo partial, layout head, header and footer**

`views/partials/logo_mark.hbs` (same geometry as `brand/svg/performia-mark.svg`):

```hbs
<svg width="{{size}}" height="{{size}}" viewBox="0 0 64 64" aria-hidden="true" focusable="false" class="shrink-0"><rect width="64" height="64" rx="16" fill="#13294B"/><path d="M20 52V12h11a10 10 0 0 1 0 20H20" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 52 50 38" fill="none" stroke="#D4A83A" stroke-width="6" stroke-linecap="round"/><path d="M42 37h9v9" fill="none" stroke="#D4A83A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

In `views/layout.hbs`, replace the line `<link rel="icon" type="image/svg+xml" href="/img/favicon.svg" />` and the DM Sans preload line with:

```hbs
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="/img/favicon.svg" />
    <link rel="apple-touch-icon" href="/img/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#13294B" />
    <link rel="preload" href="/fonts/sora-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
```

`views/partials/header.hbs` (replace whole file):

```hbs
<header class="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
  <div class="container-page flex h-18 items-center justify-between gap-4">
    <a href="{{links.home}}" class="flex items-center gap-2.5">
      {{> logo_mark size=40}}
      <span class="font-display text-[22px] font-bold tracking-tight text-navy">{{t.brand}}</span>
    </a>

    <nav class="hidden items-center gap-7 lg:flex" aria-label="{{t.nav.ariaLabel}}">
      <a href="{{links.home}}#approche" class="nav-link">{{t.nav.approach}}</a>
      <a href="{{links.home}}#matieres" class="nav-link">{{t.nav.subjects}}</a>
      <a href="{{links.home}}#avis" class="nav-link">{{t.nav.reviews}}</a>
      <a href="{{links.contact}}" class="nav-link{{#if isContact}} nav-link-active{{/if}}"{{#if isContact}} aria-current="page"{{/if}}>{{t.nav.contact}}</a>
      <a href="{{switchPath}}" hreflang="{{t.nav.switchLang}}" lang="{{t.nav.switchLang}}" class="lang-switch">{{icon "globe" "h-4 w-4"}}{{t.nav.switchLabel}}</a>
      <a href="{{links.contact}}" class="btn btn-navy btn-sm">{{t.nav.cta}}</a>
    </nav>

    <details class="relative lg:hidden">
      <summary class="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-line" aria-label="{{t.nav.menu}}">
        {{icon "menu" "h-5 w-5"}}
      </summary>
      <nav class="absolute top-14 right-0 flex w-64 flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-xl" aria-label="{{t.nav.ariaLabel}}">
        <a href="{{links.home}}" class="nav-link{{#if isHome}} nav-link-active{{/if}}">{{t.nav.home}}</a>
        <a href="{{links.home}}#approche" class="nav-link">{{t.nav.approach}}</a>
        <a href="{{links.home}}#matieres" class="nav-link">{{t.nav.subjects}}</a>
        <a href="{{links.home}}#avis" class="nav-link">{{t.nav.reviews}}</a>
        <a href="{{links.contact}}" class="nav-link{{#if isContact}} nav-link-active{{/if}}">{{t.nav.contact}}</a>
        <a href="{{switchPath}}" hreflang="{{t.nav.switchLang}}" lang="{{t.nav.switchLang}}" class="lang-switch self-start">{{icon "globe" "h-4 w-4"}}{{t.nav.switchLabel}}</a>
        <a href="{{links.contact}}" class="btn btn-navy btn-sm">{{t.nav.cta}}</a>
      </nav>
    </details>
  </div>
</header>
```

`views/partials/footer.hbs` (replace whole file):

```hbs
<footer class="border-t border-line bg-white">
  <div class="container-page grid grid-cols-1 gap-10 py-14 md:grid-cols-3">
    <div class="flex flex-col gap-4">
      <a href="{{links.home}}" class="flex items-center gap-2.5">
        {{> logo_mark size=36}}
        <span class="font-display text-xl font-bold tracking-tight text-navy">{{t.brand}}</span>
      </a>
      <p class="max-w-xs text-sm leading-relaxed text-muted">{{t.footer.tagline}}</p>
    </div>
    <div>
      <h2 class="footer-title">{{t.footer.contact}}</h2>
      <ul class="space-y-3">
        <li><a href="{{contactDetails.phoneHref}}" class="footer-link">{{icon "phone" "h-4 w-4"}}<span>{{contactDetails.phoneDisplay}}</span></a></li>
        <li><a href="{{contactDetails.whatsappUrl}}" target="_blank" rel="noopener noreferrer" class="footer-link">{{icon "messageCircle" "h-4 w-4"}}<span>{{t.footer.whatsapp}}</span></a></li>
        <li><a href="mailto:{{contactDetails.email}}" class="footer-link">{{icon "mail" "h-4 w-4"}}<span>{{contactDetails.email}}</span></a></li>
        <li class="flex items-center gap-2 text-sm text-navy">{{icon "mapPin" "h-4 w-4"}}<span>{{t.contact.info.address}}</span></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-title">{{t.footer.followUs}}</h2>
      <div class="flex gap-3">
        <a href="{{contactDetails.facebookUrl}}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">{{icon "facebook" "h-5 w-5"}}</a>
        <a href="{{contactDetails.instagramUrl}}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">{{icon "instagram" "h-5 w-5"}}</a>
      </div>
      <p class="mt-4 text-sm text-muted">{{t.footer.partnership}}</p>
    </div>
  </div>
  <div class="border-t border-line">
    <p class="container-page py-6 text-sm text-muted">{{t.footer.copyright}}</p>
  </div>
</footer>
```

- [ ] **Step 6: Content: brand, titles, nav and footer copy**

In `src/content/content.types.ts`, replace the `nav` line of `SiteContent` with:

```ts
  nav: {
    ariaLabel: string;
    home: string;
    approach: string;
    subjects: string;
    reviews: string;
    contact: string;
    cta: string;
    menu: string;
    switchLabel: string;
    switchLang: Lang;
  };
```

In `src/content/fr.ts`:
- `brand: 'Academic Excellence'` -> `brand: 'Performia'`
- `homeTitle` -> `'Performia - Cours de soutien scolaire et répétitions au secondaire'`
- `homeDescription` -> `"Des répétiteurs qualifiés pour réussir au secondaire. Cours de soutien en mathématiques, physique, chimie et autres matières sur demande, en complément de l'école, à Yaoundé, Douala et en ligne."`
- `contactTitle` -> `'Contactez-nous - Performia'`
- the `nav` line -> `nav: { ariaLabel: 'Navigation principale', home: 'Accueil', approach: 'Notre approche', subjects: 'Matières', reviews: 'Avis des parents', contact: 'Contact', cta: 'Inscrire mon enfant', menu: 'Menu', switchLabel: 'EN', switchLang: 'en' },`
- `footer.tagline` -> `"Cours de soutien scolaire et répétitions pour les élèves du secondaire, en complément de l'école."`
- `footer.copyright` -> `'© 2026 Performia. Tous droits réservés.'`

In `src/content/en.ts`:
- `brand` -> `'Performia'`
- `homeTitle` -> `'Performia - Tutoring for secondary school students'`
- `homeDescription` -> `'Qualified tutors to succeed in secondary school. Tutoring in mathematics, physics, chemistry and other subjects on request, alongside school, in Yaoundé, Douala and online.'`
- `contactTitle` -> `'Contact us - Performia'`
- the `nav` line -> `nav: { ariaLabel: 'Main navigation', home: 'Home', approach: 'Our approach', subjects: 'Subjects', reviews: 'Parent reviews', contact: 'Contact', cta: 'Enroll my child', menu: 'Menu', switchLabel: 'FR', switchLang: 'fr' },`
- `footer.tagline` -> `'Tutoring for secondary school students, alongside school.'`
- `footer.copyright` -> `'© 2026 Performia. All rights reserved.'`

- [ ] **Step 7: Run all tests, typecheck, lint, build**

Run: `npm test && npm run test:e2e && npx tsc --noEmit -p tsconfig.json && npm run lint && npm run build`
Expected: everything PASSES (the old home sections still render; they are replaced in Task 2). If an existing test asserted the old header markup, report it instead of weakening it.

- [ ] **Step 8: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: apply Performia brand foundation (tokens, fonts, icons, header, footer)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Home page sections and content model

**Files:**
- Modify: `src/content/content.types.ts`, `src/content/fr.ts`, `src/content/en.ts`, `src/content/content.service.spec.ts`, `views/home.hbs`, `views/partials/home_hero.hbs`, `views/partials/home_steps.hbs`, `views/partials/home_subjects.hbs`, `views/partials/home_testimonials.hbs`, `views/partials/home_cta.hbs` (all full replacements), `styles/app.css` (remove legacy classes), `test/pages.e2e-spec.ts`
- Create: `views/partials/home_strip.hbs`, `views/partials/home_why.hbs`, `views/partials/home_duo.hbs`
- Delete: `views/partials/home_trust.hbs`, `home_problem.hbs`, `home_solution.hbs`, `home_difference.hbs`, `home_audience.hbs`, `home_partnership.hbs`, `home_teachers.hbs`

**Interfaces:**
- Consumes: Task 1 classes and `logo_mark`; `t.nav.*`.
- Produces: `SiteContent` with `hero.photoAlt`, `hero.photoCaption`, `strip`, `why`, `howItWorks.eyebrow`, `subjects.intro`, `subjects.cards[].symbol`, `subjects.other`, `testimonials.cards[].initials`, `partnership { title, description, logoAlt }`, `teacherRecruitment { title, description, cta }`; removed `trustBlock`, `problem`, `solution`, `difference`, `targetAudience`. Section anchors `#approche`, `#matieres`, `#avis`.

- [ ] **Step 1: Update the tests first**

In `test/pages.e2e-spec.ts`, replace the `sectionTitles` helper with:

```ts
  const sectionTitles = (t: SiteContent) => [
    t.hero.headline,
    t.why.title,
    t.howItWorks.title,
    t.subjects.title,
    t.testimonials.title,
    t.partnership.title,
    t.teacherRecruitment.title,
    t.finalCta.title,
  ];
```

Replace the test `'renders section details: steps, subjects, levels, testimonials, partner logo'` with:

```ts
  it.each([
    ['/', fr],
    ['/en', en],
  ])('renders section details at %s', async (path, t) => {
    const res = await request(app.getHttpServer()).get(path).expect(200);
    for (const item of t.strip) expect(res.text).toContain(`>${escapeHtml(item)}<`);
    for (const card of t.why.cards) expect(res.text).toContain(escapeHtml(card.title));
    for (const step of t.howItWorks.steps) expect(res.text).toContain(escapeHtml(step.title));
    for (const card of t.subjects.cards) expect(res.text).toContain(escapeHtml(card.title));
    for (const card of t.testimonials.cards) expect(res.text).toContain(escapeHtml(card.name));
    expect(res.text).toContain(escapeHtml(t.subjects.other.title));
    for (const id of ['approche', 'matieres', 'avis']) expect(res.text).toContain(`id="${id}"`);
    expect(res.text).toContain('src="/img/suku.png"');
  });

  it('offers other subjects on demand with a link to the contact form', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    const start = res.text.indexOf(escapeHtml(fr.subjects.other.title));
    const snippet = res.text.slice(start, start + 800);
    expect(snippet).toContain('href="/contact"');
    expect(snippet).toContain(escapeHtml(fr.subjects.other.cta));
    expect(res.text).toContain('href="/#matieres"');
  });
```

In `src/content/content.service.spec.ts`, replace the test `'uses the same icons in both languages'` with:

```ts
  it('uses the same subject symbols and card highlights in both languages', () => {
    expect(en.subjects.cards.map((c) => c.symbol)).toEqual(fr.subjects.cards.map((c) => c.symbol));
    expect(en.why.cards.map((c) => c.highlight)).toEqual(fr.why.cards.map((c) => c.highlight));
  });
```

Run: `npm test` and `npm run test:e2e`
Expected: FAIL / type errors on the new keys (`why`, `strip`, `symbol`, ...).

- [ ] **Step 2: Replace the content types**

In `src/content/content.types.ts`:
- delete the `import type { IconName } from './icons.js';` line and the interfaces `IconCard`, `Step`, `SubjectCard`, `Benefit`, `Testimonial`;
- add, after `ContactField`:

```ts
export interface TextCard {
  title: string;
  description: string;
}

export interface WhyCard extends TextCard {
  highlight: boolean;
}

export interface SubjectCard {
  symbol: string;
  title: string;
  description: string;
  levels: string[];
}

export interface Testimonial {
  name: string;
  initials: string;
  role: string;
  content: string;
}
```

- in `SiteContent`, replace everything from the `hero:` key through the `footer:` line (inclusive) with:

```ts
  hero: {
    formatBadge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustText: string;
    photoAlt: string;
    photoCaption: string;
  };
  strip: string[];
  why: { title: string; intro: string; featured: TextCard; cards: WhyCard[] };
  howItWorks: { eyebrow: string; title: string; steps: TextCard[]; reassurance: string };
  subjects: {
    title: string;
    intro: string;
    cards: SubjectCard[];
    other: { title: string; description: string; cta: string };
  };
  testimonials: { title: string; cards: Testimonial[] };
  partnership: { title: string; description: string; logoAlt: string };
  teacherRecruitment: { title: string; description: string; cta: string };
  finalCta: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  footer: { tagline: string; contact: string; whatsapp: string; followUs: string; partnership: string; copyright: string };
```

- [ ] **Step 3: Replace the home-page copy in `fr.ts` and `en.ts`**

In each file, replace everything from the line starting with `  hero: {` up to (not including) the line starting with `  footer: {` with the block below. Keep `brand`, `meta`, `nav` (Task 1 values), `footer`, `contact` and `errorPage` untouched.

French block (`src/content/fr.ts`):

```ts
  hero: {
    formatBadge: 'Cours de soutien · présentiel ou en ligne',
    headline: 'Des répétiteurs qualifiés pour réussir au secondaire',
    subheadline:
      "En complément de l'école, un accompagnement personnalisé en mathématiques, physique, chimie et d'autres matières sur demande, de la Sixième à la Terminale.",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Découvrir le programme',
    trustText: 'Rejoignez de nombreuses familles qui nous font confiance',
    photoAlt: "Enseignant devant une carte de l'Afrique dans une salle de classe",
    photoCaption: 'Un ou plusieurs enseignants choisis selon les besoins de votre enfant',
  },
  strip: ['Mathématiques', 'Physique', 'Chimie', 'Autres matières sur demande', 'Sixième à Terminale', 'BEPC et Baccalauréat'],
  why: {
    title: 'Pourquoi les familles nous choisissent',
    intro:
      "Le passage au secondaire est exigeant. Nous donnons à chaque élève l'accompagnement dont il a besoin, au bon rythme, en complément de ses cours à l'école.",
    featured: {
      title: 'Une équipe pédagogique adaptée',
      description:
        "Nous assignons un ou plusieurs enseignants en fonction des besoins pédagogiques de l'élève pour un accompagnement optimal.",
    },
    cards: [
      {
        title: 'Suivi personnalisé',
        description: "Chaque élève bénéficie d'un plan d'apprentissage adapté à ses besoins et à ses objectifs.",
        highlight: false,
      },
      {
        title: 'Résultats suivis',
        description: "Des rapports réguliers pour mesurer les progrès et ajuster l'accompagnement.",
        highlight: true,
      },
      {
        title: 'Formats flexibles',
        description: "Des cours en présentiel ou en ligne, adaptés à l'emploi du temps de votre enfant.",
        highlight: false,
      },
      {
        title: 'Enseignants vérifiés',
        description: 'Tous nos enseignants passent par une sélection rigoureuse et sont régulièrement évalués.',
        highlight: false,
      },
    ],
  },
  howItWorks: {
    eyebrow: 'Comment ça marche',
    title: 'Quatre étapes, un accompagnement sur mesure',
    steps: [
      { title: 'Inscription et diagnostic', description: 'Vous choisissez le format, nous évaluons le niveau de votre enfant.' },
      { title: 'Choix des enseignants', description: 'Un ou plusieurs enseignants qualifiés, selon les besoins identifiés.' },
      { title: 'Début des cours', description: "Selon l'horaire convenu, en présentiel ou en ligne." },
      { title: 'Suivi et ajustement', description: 'Des rapports réguliers et un programme ajusté en continu.' },
    ],
    reassurance: "Vous pouvez commencer à tout moment de l'année scolaire.",
  },
  subjects: {
    title: 'Matières enseignées',
    intro: "Nos matières phares sont les sciences. D'autres matières sont possibles sur demande.",
    cards: [
      {
        symbol: 'π',
        title: 'Mathématiques',
        description: 'Algèbre, géométrie, trigonométrie et analyse. Renforcement des bases et préparation aux examens.',
        levels: ['Sixième à Troisième', 'Seconde à Terminale'],
      },
      {
        symbol: 'F=ma',
        title: 'Physique',
        description: 'Mécanique, électricité, optique et thermodynamique. Cours théoriques et exercices pratiques.',
        levels: ['Quatrième à Terminale'],
      },
      {
        symbol: 'H₂O',
        title: 'Chimie',
        description: 'Chimie générale, organique et inorganique. Expériences et applications concrètes.',
        levels: ['Quatrième à Terminale'],
      },
    ],
    other: {
      title: 'Autres matières sur demande',
      description: "Votre enfant a besoin d'aide dans une autre matière ? Dites-nous laquelle, nous trouvons l'enseignant adapté.",
      cta: 'Faire une demande',
    },
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'Ce que disent les parents',
    cards: [
      {
        name: 'Sylvie Kamga',
        initials: 'SK',
        role: "Mère d'élève en Seconde",
        content: "Grâce à l'accompagnement reçu, ma fille a retrouvé confiance en elle. Les enseignants sont patients et vraiment à l'écoute.",
      },
      {
        name: 'Achille Mboua',
        initials: 'AM',
        role: "Père d'élève en Terminale",
        content:
          "L'enseignant assigné a su identifier les lacunes de mon fils en physique-chimie et y remédier efficacement avant le baccalauréat.",
      },
      {
        name: 'Nkomo Tagne',
        initials: 'NT',
        role: "Mère d'élève en Troisième",
        content:
          "Le suivi personnalisé fait toute la différence. Je reçois régulièrement des rapports et j'échange facilement avec l'enseignant.",
      },
    ],
  },
  partnership: {
    title: 'Notre partenariat avec Suku',
    description:
      "Une plateforme éducative qui partage notre vision : ressources pédagogiques supplémentaires, suivi numérique des progrès et une communauté d'apprentissage élargie.",
    logoAlt: 'Logo de Suku, notre partenaire',
  },
  teacherRecruitment: {
    title: 'Vous êtes enseignant ?',
    description:
      "Rejoignez notre équipe de répétiteurs qualifiés. Nous recherchons des enseignants diplômés dans leur matière, expérimentés au secondaire, patients et à l'écoute.",
    cta: 'Postuler maintenant',
  },
  finalCta: {
    title: 'Prêt à offrir le meilleur à votre enfant ?',
    subtitle: "Inscrivez-vous dès aujourd'hui. Nous vous répondons rapidement.",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Écrire sur WhatsApp',
  },
```

English block (`src/content/en.ts`):

```ts
  hero: {
    formatBadge: 'Tutoring · in person or online',
    headline: 'Qualified tutors to succeed in secondary school',
    subheadline:
      'Alongside school, personalized support in mathematics, physics, chemistry and other subjects on request, from Grade 6 to Grade 12.',
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Discover the program',
    trustText: 'Join many families who trust us',
    photoAlt: 'Teacher in front of a map of Africa in a classroom',
    photoCaption: "One or more teachers chosen for your child's needs",
  },
  strip: ['Mathematics', 'Physics', 'Chemistry', 'Other subjects on request', 'Grade 6 to Grade 12', 'BEPC and Baccalaureate'],
  why: {
    title: 'Why families choose us',
    intro:
      'Secondary school is demanding. We give every student the support they need, at the right pace, alongside their classes at school.',
    featured: {
      title: 'An adapted teaching team',
      description: "We assign one or more teachers based on the student's learning needs for the best possible support.",
    },
    cards: [
      {
        title: 'Personalized follow-up',
        description: 'Every student gets a learning plan adapted to their needs and goals.',
        highlight: false,
      },
      {
        title: 'Tracked results',
        description: 'Regular reports to measure progress and adjust the support.',
        highlight: true,
      },
      {
        title: 'Flexible formats',
        description: "In-person or online classes, adapted to your child's schedule.",
        highlight: false,
      },
      {
        title: 'Verified teachers',
        description: 'All our teachers go through a rigorous selection and are regularly evaluated.',
        highlight: false,
      },
    ],
  },
  howItWorks: {
    eyebrow: 'How it works',
    title: 'Four steps to tailored support',
    steps: [
      { title: 'Registration and assessment', description: "You choose the format, we assess your child's level." },
      { title: 'Choice of teachers', description: 'One or more qualified teachers, based on the identified needs.' },
      { title: 'Classes begin', description: 'On the agreed schedule, in person or online.' },
      { title: 'Follow-up and adjustment', description: 'Regular reports and a continuously adjusted program.' },
    ],
    reassurance: 'You can start at any time during the school year.',
  },
  subjects: {
    title: 'Subjects taught',
    intro: 'Our core subjects are the sciences. Other subjects are available on request.',
    cards: [
      {
        symbol: 'π',
        title: 'Mathematics',
        description: 'Algebra, geometry, trigonometry and analysis. Strengthening foundations and exam preparation.',
        levels: ['Grade 6 to 9', 'Grade 10 to 12'],
      },
      {
        symbol: 'F=ma',
        title: 'Physics',
        description: 'Mechanics, electricity, optics and thermodynamics. Theory and practical exercises.',
        levels: ['Grade 8 to 12'],
      },
      {
        symbol: 'H₂O',
        title: 'Chemistry',
        description: 'General, organic and inorganic chemistry. Experiments and practical applications.',
        levels: ['Grade 8 to 12'],
      },
    ],
    other: {
      title: 'Other subjects on request',
      description: 'Does your child need help in another subject? Tell us which one and we will find the right teacher.',
      cta: 'Make a request',
    },
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'What parents say',
    cards: [
      {
        name: 'Sylvie Kamga',
        initials: 'SK',
        role: 'Mother of a Grade 10 student',
        content: 'Thanks to the support she received, my daughter regained her confidence. The teachers are patient and truly attentive.',
      },
      {
        name: 'Achille Mboua',
        initials: 'AM',
        role: 'Father of a Grade 12 student',
        content: "The assigned teacher identified my son's gaps in physics and chemistry and addressed them effectively before the baccalaureate.",
      },
      {
        name: 'Nkomo Tagne',
        initials: 'NT',
        role: 'Mother of a Grade 9 student',
        content: 'The personalized follow-up makes all the difference. I receive regular reports and can easily talk with the teacher.',
      },
    ],
  },
  partnership: {
    title: 'Our partnership with Suku',
    description:
      'An educational platform that shares our vision: additional learning resources, digital progress tracking and a wider learning community.',
    logoAlt: 'Logo of Suku, our partner',
  },
  teacherRecruitment: {
    title: 'Are you a teacher?',
    description:
      'Join our team of qualified tutors. We are looking for teachers with a degree in their subject, secondary school experience, patience and good listening skills.',
    cta: 'Apply now',
  },
  finalCta: {
    title: 'Ready to give your child the best?',
    subtitle: 'Enroll today. We will get back to you quickly.',
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Write on WhatsApp',
  },
```

- [ ] **Step 4: Templates**

Delete the old partials:

```bash
git rm views/partials/home_trust.hbs views/partials/home_problem.hbs views/partials/home_solution.hbs views/partials/home_difference.hbs views/partials/home_audience.hbs views/partials/home_partnership.hbs views/partials/home_teachers.hbs
```

`views/home.hbs`:

```hbs
{{> home_hero}}
{{> home_strip}}
{{> home_why}}
{{> home_steps}}
{{> home_subjects}}
{{> home_testimonials}}
{{> home_duo}}
{{> home_cta}}
```

`views/partials/home_hero.hbs`:

```hbs
<section class="container-page flex flex-col items-center gap-14 py-16 lg:flex-row lg:py-20">
  <div class="flex min-w-0 flex-1 flex-col gap-6">
    <span class="pill self-start bg-sand"><span class="h-2 w-2 rounded-full bg-gold" aria-hidden="true"></span>{{t.hero.formatBadge}}</span>
    <h1 class="text-4xl leading-[1.08] font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">{{t.hero.headline}}</h1>
    <p class="max-w-xl text-lg leading-relaxed text-muted md:text-xl">{{t.hero.subheadline}}</p>
    <div class="flex flex-wrap gap-3">
      <a href="{{links.contact}}" class="btn btn-gold">{{t.hero.ctaPrimary}}{{icon "arrowRight" "h-5 w-5"}}</a>
      <a href="#approche" class="btn btn-outline">{{t.hero.ctaSecondary}}</a>
    </div>
    <p class="flex items-center gap-2.5 text-muted">{{icon "circleCheck" "h-5 w-5 text-navy"}}{{t.hero.trustText}}</p>
  </div>
  <div class="relative w-full min-w-0 flex-1">
    <img src="/img/hero.jpg" alt="{{t.hero.photoAlt}}" width="1920" height="1206" class="h-[360px] w-full rounded-[28px] object-cover md:h-[520px]" />
    <div class="absolute bottom-6 left-4 flex max-w-[280px] items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_18px_40px_rgba(19,41,75,0.16)] lg:-left-4">
      <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy">{{icon "users" "h-5 w-5 text-gold"}}</span>
      <span class="text-sm leading-snug font-medium">{{t.hero.photoCaption}}</span>
    </div>
  </div>
</section>
```

`views/partials/home_strip.hbs`:

```hbs
<section class="border-y border-line bg-mist">
  <ul class="container-page flex flex-wrap justify-between gap-x-8 gap-y-3 py-5 font-display text-base font-semibold text-navy">
    {{#each t.strip}}<li>{{this}}</li>{{/each}}
  </ul>
</section>
```

`views/partials/home_why.hbs`:

```hbs
<section id="approche" class="container-page scroll-mt-20 py-24">
  <div class="mb-10 flex flex-wrap items-end justify-between gap-6">
    <h2 class="h-section max-w-xl">{{t.why.title}}</h2>
    <p class="max-w-md text-lg leading-relaxed text-muted">{{t.why.intro}}</p>
  </div>
  <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
    <article class="flex min-h-[360px] flex-col justify-between gap-8 rounded-3xl bg-navy p-9 text-white lg:row-span-2">
      {{icon "users" "h-10 w-10 text-gold"}}
      <div class="flex flex-col gap-3">
        <h3 class="text-2xl leading-tight font-semibold">{{t.why.featured.title}}</h3>
        <p class="leading-relaxed text-on-navy">{{t.why.featured.description}}</p>
      </div>
    </article>
    {{#each t.why.cards}}
      <article class="flex flex-col gap-2.5 rounded-3xl p-7 {{#if highlight}}bg-sand{{else}}border border-line bg-mist{{/if}}">
        <h3 class="text-xl font-semibold">{{title}}</h3>
        <p class="leading-relaxed text-muted">{{description}}</p>
      </article>
    {{/each}}
  </div>
</section>
```

`views/partials/home_steps.hbs`:

```hbs
<section class="bg-navy-deep text-white">
  <div class="container-page flex flex-col gap-12 py-24">
    <div class="flex max-w-2xl flex-col gap-3.5">
      <p class="eyebrow">{{t.howItWorks.eyebrow}}</p>
      <h2 class="h-section">{{t.howItWorks.title}}</h2>
    </div>
    <ol class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {{#each t.howItWorks.steps}}
        <li class="flex flex-col gap-2.5 border-t-2 border-gold pt-5">
          <span class="font-display text-sm font-bold text-gold" aria-hidden="true">0{{inc @index}}</span>
          <h3 class="text-xl font-semibold">{{title}}</h3>
          <p class="leading-relaxed text-on-navy">{{description}}</p>
        </li>
      {{/each}}
    </ol>
    <p class="text-white/90">{{t.howItWorks.reassurance}}</p>
  </div>
</section>
```

`views/partials/home_subjects.hbs`:

```hbs
<section id="matieres" class="container-page flex scroll-mt-20 flex-col gap-10 py-24">
  <div class="flex flex-wrap items-end justify-between gap-6">
    <h2 class="h-section">{{t.subjects.title}}</h2>
    <p class="max-w-md text-lg leading-relaxed text-muted">{{t.subjects.intro}}</p>
  </div>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {{#each t.subjects.cards}}
      <article class="flex flex-col gap-4 rounded-3xl border border-line p-8">
        <span class="font-display text-4xl font-bold" aria-hidden="true">{{symbol}}</span>
        <h3 class="text-2xl font-semibold">{{title}}</h3>
        <p class="leading-relaxed text-muted">{{description}}</p>
        <ul class="mt-auto flex flex-wrap gap-2">
          {{#each levels}}<li class="pill bg-sand text-[13px]">{{this}}</li>{{/each}}
        </ul>
      </article>
    {{/each}}
    <article class="flex flex-col gap-4 rounded-3xl bg-navy p-8 text-white">
      <span class="font-display text-4xl font-bold text-gold" aria-hidden="true">+</span>
      <h3 class="text-2xl font-semibold">{{t.subjects.other.title}}</h3>
      <p class="leading-relaxed text-on-navy">{{t.subjects.other.description}}</p>
      <a href="{{links.contact}}" class="btn btn-gold btn-sm mt-auto self-start">{{t.subjects.other.cta}}</a>
    </article>
  </div>
</section>
```

`views/partials/home_testimonials.hbs`:

```hbs
<section id="avis" class="scroll-mt-20 bg-mist">
  <div class="container-page flex flex-col gap-10 py-24">
    <h2 class="h-section">{{t.testimonials.title}}</h2>
    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      {{#each t.testimonials.cards}}
        <figure class="flex flex-col justify-between gap-6 rounded-3xl bg-white p-8 shadow-sm">
          <div class="flex flex-col gap-4">
            {{icon "quote" "h-7 w-7 text-gold"}}
            <blockquote class="text-[17px] leading-relaxed">{{content}}</blockquote>
          </div>
          <figcaption class="flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-semibold text-white" aria-hidden="true">{{initials}}</span>
            <span class="flex flex-col"><strong class="text-[15px]">{{name}}</strong><span class="text-sm text-muted">{{role}}</span></span>
          </figcaption>
        </figure>
      {{/each}}
    </div>
  </div>
</section>
```

`views/partials/home_duo.hbs`:

```hbs
<section class="container-page grid grid-cols-1 gap-5 py-24 lg:grid-cols-2">
  <article class="flex flex-col gap-4 rounded-3xl border border-line p-10">
    <img src="/img/suku.png" alt="{{t.partnership.logoAlt}}" width="1600" height="542" class="h-auto w-36" loading="lazy" />
    <h2 class="text-[28px] font-bold tracking-tight">{{t.partnership.title}}</h2>
    <p class="leading-relaxed text-muted">{{t.partnership.description}}</p>
  </article>
  <article class="flex flex-col gap-4 rounded-3xl bg-sand p-10">
    <h2 class="text-[28px] font-bold tracking-tight">{{t.teacherRecruitment.title}}</h2>
    <p class="leading-relaxed text-navy/80">{{t.teacherRecruitment.description}}</p>
    <a href="{{links.contact}}" class="btn btn-navy self-start">{{t.teacherRecruitment.cta}}</a>
  </article>
</section>
```

`views/partials/home_cta.hbs`:

```hbs
<section class="container-page pb-24">
  <div class="flex flex-wrap items-center justify-between gap-8 rounded-[32px] bg-navy px-8 py-14 text-white md:px-12 md:py-16">
    <div class="flex min-w-0 flex-[1_1_480px] flex-col gap-3.5">
      <h2 class="h-section">{{t.finalCta.title}}</h2>
      <p class="text-lg leading-relaxed text-on-navy">{{t.finalCta.subtitle}}</p>
    </div>
    <div class="flex flex-wrap gap-3">
      <a href="{{links.contact}}" class="btn btn-gold">{{t.finalCta.ctaPrimary}}</a>
      <a href="{{contactDetails.whatsappUrl}}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-light">{{icon "messageCircle" "h-5 w-5"}}{{t.finalCta.ctaSecondary}}</a>
    </div>
  </div>
</section>
```

In `styles/app.css`, delete the legacy block (the comment `/* Legacy home-page classes ... */` and the `.section-title` and `.card` rules).

- [ ] **Step 5: Run all tests, typecheck, lint, build**

Run: `npm test && npm run test:e2e && npx tsc --noEmit -p tsconfig.json && npm run lint && npm run build`
Expected: everything PASSES. `grep -rn "section-title\|class=\"card" views` returns nothing.

- [ ] **Step 6: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: rebuild the home page in direction A with tutoring copy

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Contact and error pages

**Files:**
- Modify: `views/contact.hbs` (full replacement), `views/error.hbs` (full replacement), `views/partials/contact_info.hbs`, `test/contact-page.e2e-spec.ts`, `test/pages.e2e-spec.ts`

**Interfaces:**
- Consumes: Task 1 classes and `logo_mark`; contact view keys `csrfToken`, `sent`, `values`, `errors`, `hasErrors`; error view keys `errorTitle`, `message`, `backHref`, `backLabel`.
- Produces: restyled pages, same behaviour.

- [ ] **Step 1: Write the failing tests**

Add to `test/contact-page.e2e-spec.ts` (inside the `describe`):

```ts
  it('uses the Performia layout on the contact page', async () => {
    const res = await request(app.getHttpServer()).get('/contact').expect(200);
    expect(res.text).toContain('<p class="eyebrow">Performia</p>');
    expect(res.text).toContain('class="rounded-3xl border border-line bg-white p-8 shadow-sm md:p-10"');
  });
```

Add to `test/pages.e2e-spec.ts` (inside the `describe`):

```ts
  it('shows the Envol mark on error pages', async () => {
    const res = await request(app.getHttpServer()).get('/does-not-exist').expect(404);
    const main = res.text.slice(res.text.indexOf('<main'));
    expect(main).toContain('viewBox="0 0 64 64"');
  });
```

Run: `npm run test:e2e`
Expected: the 2 new tests FAIL.

- [ ] **Step 2: Templates**

`views/contact.hbs` (replace whole file):

```hbs
<section class="bg-navy text-white">
  <div class="container-page flex flex-col items-center gap-4 py-20 text-center">
    <p class="eyebrow">{{t.brand}}</p>
    <h1 class="text-4xl font-bold tracking-tight text-balance md:text-5xl">{{t.contact.title}}</h1>
    <p class="max-w-2xl text-lg text-on-navy">{{t.contact.subtitle}}</p>
  </div>
</section>

<section class="container-page grid grid-cols-1 gap-10 py-20 lg:grid-cols-[1.1fr_1fr]">
  <div class="rounded-3xl border border-line bg-white p-8 shadow-sm md:p-10">
    {{#if sent}}
      <div class="mb-6 flex items-start gap-3 rounded-2xl bg-sand p-4 text-navy" role="status">
        {{icon "circleCheck" "mt-0.5 h-5 w-5 shrink-0 text-navy"}}
        <p>{{t.contact.success}}</p>
      </div>
    {{/if}}
    {{#if hasErrors}}
      <div class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{{t.contact.errorSummary}}</div>
    {{/if}}
    {{> contact_form}}
  </div>
  {{> contact_info}}
</section>
```

`views/error.hbs` (replace whole file):

```hbs
<section class="py-24">
  <div class="mx-auto flex max-w-xl flex-col items-center px-6 text-center">
    <div class="mb-6">{{> logo_mark size=56}}</div>
    <h1 class="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{{errorTitle}}</h1>
    <p class="mb-8 text-lg text-muted">{{message}}</p>
    <a href="{{backHref}}" class="btn btn-navy">{{backLabel}}</a>
  </div>
</section>
```

In `views/partials/contact_info.hbs`:
- replace every `text-gold` in the five `{{icon ...}}` calls of the info list with `text-navy`;
- change the section heading `<h2 class="mb-6 text-2xl font-bold text-navy">` to `<h2 class="mb-6 text-2xl font-bold tracking-tight">`;
- change both social links' classes from `rounded-xl bg-navy p-3 text-white transition-all duration-200 hover:bg-gold hover:text-navy` to `rounded-full bg-navy p-3 text-white transition-colors duration-200 hover:bg-navy-dark`.

- [ ] **Step 3: Run all tests, typecheck, lint, build**

Run: `npm test && npm run test:e2e && npx tsc --noEmit -p tsconfig.json && npm run lint && npm run build`
Expected: everything PASSES, including all existing contact, CSRF, rate-limit and error-page tests.

- [ ] **Step 4: Commit**

```bash
git add -A
git -c user.email=nkoa.christophe@camsol.io -c user.name="Nkoa Christophe" commit -m "feat: restyle contact and error pages in direction A

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
