import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hbs from 'hbs';
import { join } from 'node:path';
import type { AppConfig } from './config.js';
import type { Request, Response } from 'express';
import { getContent } from './content/content.service.js';
import type { Lang } from './content/content.types.js';
import { buildViewModel } from './content/view-model.js';
import { csrfMiddleware, sessionIdMiddleware } from './security/csrf.js';
import { ROOT_DIR } from './paths.js';
import { registerHelpers } from './views/hbs-helpers.js';

// Cookies are only needed where the form lives; the rest of the site stays cookie-free.
const CONTACT_ROUTES = ['/contact', '/en/contact'];

export function configureApp(app: NestExpressApplication, config: AppConfig): void {
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(helmet({ contentSecurityPolicy: { useDefaults: false, directives: cspDirectives(config.isProduction) } }));
  app.useStaticAssets(join(ROOT_DIR, 'public'), { maxAge: config.isProduction ? '7d' : 0 });
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));
  app.use(
    CONTACT_ROUTES,
    sessionIdMiddleware(config.isProduction),
    csrfMiddleware({ secret: config.csrfSecret, isProduction: config.isProduction, onInvalid: renderCsrfError }),
  );

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

function renderCsrfError(req: Request, res: Response): void {
  const lang: Lang = req.originalUrl.startsWith('/en') ? 'en' : 'fr';
  const t = getContent(lang);
  res.status(403).render('error', buildViewModel(t, lang, 'contact', { message: t.errorPage.csrfMessage }));
}
