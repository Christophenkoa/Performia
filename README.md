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

- **Contact requests are not delivered yet.** The v1 notifier only logs the sender's name and email; phone, subject and message are dropped (they must not go into logs). Before launch, add a ContactNotifier that sends an email or stores requests, see "Where things live".
- Search for `TODO: verify` in `src/content/`: the "92%" figure, the testimonials, the refund guarantee and the social media URLs come from the old site and need confirmation.
