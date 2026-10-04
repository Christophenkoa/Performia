import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import hbs from 'hbs';
import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import type { AppConfig } from './config.js';
import type { NextFunction, Request, Response } from 'express';
import { HttpExceptionFilter, renderErrorPage } from './errors/http-exception.filter.js';
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
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(
    CONTACT_ROUTES,
    noStore,
    sessionIdMiddleware(config.isProduction),
    csrfMiddleware({ secret: config.csrfSecret, isProduction: config.isProduction, onInvalid: renderCsrfError }),
  );

  app.setBaseViewsDir(join(ROOT_DIR, 'views'));
  app.setViewEngine('hbs');
  registerPartials(join(ROOT_DIR, 'views', 'partials'));
  registerHelpers();
}

function cspDirectives(isProduction: boolean): Record<string, string[]> {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'base-uri': ["'self'"],
    'font-src': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'img-src': ["'self'"],
    'object-src': ["'none'"],
    'script-src': ["'self'"],
    'script-src-attr': ["'none'"],
    'style-src': ["'self'"],
  };
  // Only in production: on http://localhost this directive would break asset loading.
  if (isProduction) directives['upgrade-insecure-requests'] = [];
  return directives;
}

// Synchronous, so no request can arrive before the partials exist (hbs.registerPartials loads asynchronously).
function registerPartials(dir: string): void {
  for (const file of readdirSync(dir)) {
    if (extname(file) !== '.hbs') continue;
    hbs.registerPartial(basename(file, '.hbs').replace(/-/g, '_'), readFileSync(join(dir, file), 'utf8'));
  }
}

// The contact pages embed a per-visitor CSRF token and must not be stored by caches.
function noStore(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store');
  next();
}

function renderCsrfError(req: Request, res: Response): void {
  renderErrorPage(req, res, 403);
}
