import type { IconName } from './icons.js';

export type Lang = 'fr' | 'en';

export type ContactField = 'name' | 'email' | 'phone' | 'subject' | 'message';

export interface IconCard {
  icon: IconName;
  title: string;
  description: string;
}

export interface Step {
  title: string;
  description: string;
}

export interface SubjectCard extends IconCard {
  levels: string[];
}

export interface Benefit {
  icon: IconName;
  text: string;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface SiteContent {
  brand: string;
  meta: { homeTitle: string; homeDescription: string; contactTitle: string; contactDescription: string };
  nav: { ariaLabel: string; home: string; contact: string; menu: string; switchLabel: string; switchLang: Lang };
  hero: {
    formatBadge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustText: string;
  };
  trustBlock: { title: string; points: IconCard[] };
  problem: { title: string; description: string; challenges: string[] };
  solution: { title: string; blocks: IconCard[] };
  howItWorks: { title: string; steps: Step[]; reassurance: string };
  difference: { title: string; blocks: IconCard[] };
  subjects: { title: string; subtitle: string; cards: SubjectCard[] };
  targetAudience: { title: string; description: string; profiles: string[]; levels: string[] };
  partnership: {
    title: string;
    description: string;
    benefits: Benefit[];
    partnerName: string;
    logoAlt: string;
  };
  testimonials: { title: string; cards: Testimonial[] };
  teacherRecruitment: { title: string; subtitle: string; description: string; requirements: string[]; cta: string };
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
  errorPage: { title: string; csrfMessage: string; back: string };
}
