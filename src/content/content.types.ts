export type Lang = 'fr' | 'en';

export type ContactField = 'name' | 'email' | 'phone' | 'subject' | 'message';

export interface TextCard {
  title: string;
  description: string;
}

export interface WhyCard extends TextCard {
  highlight: boolean;
}

export interface SubjectCard {
  symbol: string;
  title: string;
  description: string;
  levels: string[];
}

export interface Testimonial {
  name: string;
  initials: string;
  role: string;
  content: string;
}

export interface ErrorCopy {
  title: string;
  message: string;
}

export interface SiteContent {
  brand: string;
  meta: { homeTitle: string; homeDescription: string; contactTitle: string; contactDescription: string };
  nav: {
    ariaLabel: string;
    home: string;
    approach: string;
    subjects: string;
    reviews: string;
    contact: string;
    cta: string;
    menu: string;
    switchLabel: string;
    switchLang: Lang;
  };
  hero: {
    formatBadge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustText: string;
    photoAlt: string;
    photoCaption: string;
  };
  strip: string[];
  why: { title: string; intro: string; featured: TextCard; cards: WhyCard[] };
  howItWorks: { eyebrow: string; title: string; steps: TextCard[]; reassurance: string };
  subjects: {
    title: string;
    intro: string;
    cards: SubjectCard[];
    other: { title: string; description: string; cta: string };
  };
  testimonials: { title: string; cards: Testimonial[] };
  partnership: { title: string; description: string; logoAlt: string };
  teacherRecruitment: { title: string; description: string; cta: string };
  finalCta: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  footer: { tagline: string; contact: string; whatsapp: string; followUs: string; partnership: string; copyright: string };
  contact: {
    title: string;
    subtitle: string;
    form: {
      name: string;
      namePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phone: string;
      phonePlaceholder: string;
      subject: string;
      subjectPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submit: string;
    };
    info: {
      title: string;
      addressLabel: string;
      address: string;
      phoneLabel: string;
      whatsappLabel: string;
      emailLabel: string;
      hoursLabel: string;
      hours: string;
      socialTitle: string;
    };
    success: string;
    errorSummary: string;
    privacyNotice: string;
    errors: Record<ContactField, string>;
  };
  errorPage: {
    title: string;
    csrfMessage: string;
    back: string;
    backHome: string;
    notFound: ErrorCopy;
    tooManyRequests: ErrorCopy;
    serverError: ErrorCopy;
  };
}
