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
