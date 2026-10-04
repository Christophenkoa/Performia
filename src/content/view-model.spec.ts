import { en } from './en.js';
import { fr } from './fr.js';
import type { Lang } from './content.types.js';
import { buildViewModel, pathFor, type PageId } from './view-model.js';

describe('pathFor', () => {
  it.each([
    ['fr', 'home', '/'],
    ['en', 'home', '/en'],
    ['fr', 'contact', '/contact'],
    ['en', 'contact', '/en/contact'],
  ])('%s %s -> %s', (lang, page, expected) => {
    expect(pathFor(lang as Lang, page as PageId)).toBe(expected);
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
      alternates: { fr: '/contact', en: '/en/contact' },
      switchPath: '/en/contact',
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
      currentPath: '/en',
      switchPath: '/',
      links: { home: '/en', contact: '/en/contact' },
      pageTitle: en.meta.homeTitle,
      isHome: true,
    });
  });
});
