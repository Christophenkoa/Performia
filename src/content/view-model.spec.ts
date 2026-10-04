import { en } from './en.js';
import { fr } from './fr.js';
import type { Lang } from './content.types.js';
import { buildViewModel, parseLang, pathFor, type PageId } from './view-model.js';

describe('parseLang', () => {
  it.each([
    ['en', 'en'],
    [undefined, 'fr'],
    ['fr', 'fr'],
    ['EN', 'fr'],
    ['de', 'fr'],
    [['en', 'fr'], 'fr'],
    ['', 'fr'],
  ])('%j -> %s', (value, expected) => {
    expect(parseLang(value)).toBe(expected);
  });
});

describe('pathFor', () => {
  it.each([
    ['fr', 'home', '/'],
    ['en', 'home', '/?lang=en'],
    ['fr', 'contact', '/contact'],
    ['en', 'contact', '/contact?lang=en'],
  ])('%s %s -> %s', (lang, page, expected) => {
    expect(pathFor(lang as Lang, page as PageId)).toBe(expected);
  });

  it('appends extra parameters after lang', () => {
    expect(pathFor('fr', 'contact', { sent: '1' })).toBe('/contact?sent=1');
    expect(pathFor('en', 'contact', { sent: '1' })).toBe('/contact?lang=en&sent=1');
  });
});

describe('buildViewModel', () => {
  it('builds paths, language switch and metadata for the French contact page', () => {
    const vm = buildViewModel(fr, 'fr', 'contact', { sent: true });
    expect(vm).toMatchObject({
      lang: 'fr',
      t: fr,
      siteUrl: 'https://helloperformia.com',
      currentPath: '/contact',
      alternates: { fr: '/contact', en: '/contact?lang=en' },
      switchPath: '/contact?lang=en',
      links: { home: '/', contact: '/contact' },
      pageTitle: fr.meta.contactTitle,
      pageDescription: fr.meta.contactDescription,
      isHome: false,
      isContact: true,
      sent: true,
    });
    expect(vm.contactDetails.email).toBe('contact@helloperformia.com');
  });

  it('uses English home metadata and switches back to French', () => {
    const vm = buildViewModel(en, 'en', 'home');
    expect(vm).toMatchObject({
      currentPath: '/?lang=en',
      switchPath: '/',
      links: { home: '/?lang=en', contact: '/contact?lang=en' },
      pageTitle: en.meta.homeTitle,
      isHome: true,
    });
  });
});
