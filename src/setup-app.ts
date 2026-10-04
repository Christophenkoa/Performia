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
