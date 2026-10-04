import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { getContent } from '../content/content.service.js';
import type { Lang, SiteContent } from '../content/content.types.js';
import { buildViewModel, pathFor } from '../content/view-model.js';

export function langFromPath(path: string): Lang {
  return path === '/en' || path.startsWith('/en/') || path.startsWith('/en?') ? 'en' : 'fr';
}

// Renders views/error.hbs. Error pages are never indexed and carry no canonical or hreflang links.
export function renderErrorPage(req: Request, res: Response, status: number): void {
  const lang = langFromPath(req.originalUrl);
  const t = getContent(lang);
  const { title, message, toContact } = copyFor(t, status);
  const backHref = toContact ? pathFor(lang, 'contact') : pathFor(lang, 'home');
  const backLabel = status === HttpStatus.FORBIDDEN || status === HttpStatus.TOO_MANY_REQUESTS ? t.errorPage.back : t.errorPage.backHome;
  res.status(status).render(
    'error',
    buildViewModel(t, lang, toContact ? 'contact' : 'home', {
      pageTitle: `${title} - ${t.brand}`,
      errorTitle: title,
      message,
      backHref,
      backLabel,
      noindex: true,
    }),
  );
}

function copyFor(t: SiteContent, status: number): { title: string; message: string; toContact: boolean } {
  const e = t.errorPage;
  if (status === HttpStatus.FORBIDDEN) return { title: e.title, message: e.csrfMessage, toContact: true };
  if (status === HttpStatus.NOT_FOUND) return { ...e.notFound, toContact: false };
  if (status === HttpStatus.TOO_MANY_REQUESTS) return { ...e.tooManyRequests, toContact: true };
  return { ...e.serverError, toContact: false };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      // Message and stack only: never the request body (it holds personal data).
      const error = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(`${req.method} ${req.path} failed: ${error.message}`, error.stack);
    }
    if (res.headersSent) return;
    renderErrorPage(req, res, status);
  }
}
