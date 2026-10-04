# Language as a query parameter - Design

Date: 2026-10-04
Status: Approved in chat

## Goal

One URL per page; the language is selected with `?lang=en`. French stays the default and needs no parameter. Old `/en` URLs keep working through permanent redirects.

## URLs

| Page | French | English |
|---|---|---|
| Home | `/` | `/?lang=en` |
| Contact | `/contact` | `/contact?lang=en` |
| Contact, sent | `/contact?sent=1` | `/contact?lang=en&sent=1` |

- `lang` is read with one rule everywhere: the value `en` (exact string) means English; anything else (absent, `fr`, `EN`, `de`, repeated parameter) means French. No error, no redirect for unknown values.
- Old URLs: `GET /en` and `GET /en/contact` answer `301` to `/?lang=en` and `/contact?lang=en`. Other `/en/...` paths are ordinary 404s. `POST /en/contact` is no longer a route (old forms are not cached anywhere that matters; the CSRF token would be stale anyway).

## Behaviour

- **Links:** every internal link built by the view model carries the language: `links.home`, `links.contact`, the language switch (`switchPath`, same page in the other language), the form action, the success redirect, error-page back links. Section anchors keep working: `/?lang=en#matieres`.
- **SEO:** `canonical` is the current page in the current language (with `?lang=en` for English); `hreflang="fr"` and `x-default` point to the French URL, `hreflang="en"` to the `?lang=en` URL. All absolute on `https://helloperformia.com`.
- **Contact form:** the English form posts to `/contact?lang=en`; validation errors re-render in English; success redirects to `/contact?lang=en&sent=1`. CSRF and session middleware stay mounted on `/contact` only (query strings do not affect the mount). Rate limiting still applies to `POST /contact`.
- **Error pages:** the language comes from `req.query.lang` with the same rule (so `/missing?lang=en` renders the English 404; the CSRF 403 on `POST /contact?lang=en` renders in English).
- **No cookies, no Accept-Language detection** (keeps the home page cookie-free and URLs deterministic).
- Handlebars escapes `=` in attributes as `&#x3D;`; browsers decode it, so `href="/?lang&#x3D;en"` is a valid link. Tests compare against escaped strings.

## Code changes

- `src/content/view-model.ts`: `parseLang(value: unknown): Lang`; `pathFor(lang, page, query?)` builds `/`, `/contact` plus a query string where `lang=en` comes first and extra parameters (`sent=1`) follow.
- `src/pages/pages.controller.ts`: `GET /` and `GET /contact` read `@Query('lang')`; `GET /en` and `GET /en/contact` become 301 redirects.
- `src/contact/contact.controller.ts`: single `POST /contact`, language from `@Query('lang')`; success URL via `pathFor(lang, 'contact', { sent: '1' })`.
- `src/setup-app.ts`: `CONTACT_ROUTES` becomes `['/contact']`.
- `src/errors/http-exception.filter.ts`: language from `req.query.lang` via `parseLang` (replaces `langFromPath`).
- Templates need no change: they already use `links.*`, `switchPath` and `alternates`.

## Testing

Unit: `parseLang` cases; `pathFor` for both languages, with and without extra query. E2E: all `/en` usages move to `?lang=en`; new tests for the 301 redirects, unknown `lang` value rendering French, English links carrying `lang=en`, English form round trip (action, 400 re-render, 303 to `/contact?lang=en&sent=1`), English 404 and 403 pages. Existing security and contact tests keep passing.

## Accepted trade-offs

- Google's multilingual guidance prefers subdirectories (/en) over URL parameters; parameters still index correctly with self-referencing canonicals and reciprocal hreflang, which this design provides. Chosen for one URL per page; check indexing in Search Console after launch.
- Rate limiting: FR and EN now share one POST handler, so the 5 requests per minute per IP limit is shared across both languages (previously 5 per language).
