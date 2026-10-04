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
