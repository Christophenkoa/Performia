import { CONTACT_DETAILS, SITE_URL } from './contact-details.js';
import type { Lang, SiteContent } from './content.types.js';

export type PageId = 'home' | 'contact';

// One rule for the whole site: only the exact value "en" selects English.
export function parseLang(value: unknown): Lang {
  return value === 'en' ? 'en' : 'fr';
}

export function pathFor(lang: Lang, page: PageId, query: Record<string, string> = {}): string {
  const base = page === 'home' ? '/' : '/contact';
  const params = new URLSearchParams();
  if (lang === 'en') params.set('lang', 'en');
  for (const [key, value] of Object.entries(query)) params.set(key, value);
  const search = params.toString();
  return search ? `${base}?${search}` : base;
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
