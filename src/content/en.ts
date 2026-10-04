import type { SiteContent } from './content.types.js';

// Copy taken from the live site helloperformia.com (2026-10-04).
// "TODO: verify" marks figures, quotes and promises that must be confirmed with a source before launch.
export const en: SiteContent = {
  brand: 'Performia',
  meta: {
    homeTitle: 'Performia - Tutoring for secondary school students',
    homeDescription:
      'Qualified tutors to succeed in secondary school. Tutoring in mathematics, physics, chemistry and other subjects on request, alongside school, in Yaoundé, Douala and online.',
    contactTitle: 'Contact us - Performia',
    contactDescription: 'We are here to answer all your questions',
  },
  nav: { ariaLabel: 'Main navigation', home: 'Home', approach: 'Our approach', subjects: 'Subjects', reviews: 'Parent reviews', contact: 'Contact', cta: 'Enroll my child', menu: 'Menu', switchLabel: 'FR', switchLang: 'fr' },
  hero: {
    formatBadge: 'Tutoring · in person or online',
    headline: 'Qualified tutors to succeed in secondary school',
    subheadline:
      'Alongside school, personalized support in mathematics, physics, chemistry and other subjects on request, from Grade 6 to Grade 12.',
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Discover the program',
    // TODO: verify the number of families claimed
    trustText: 'Join many families who trust us',
    photoAlt: 'Teacher in front of a map of Africa in a classroom',
    photoCaption: "One or more teachers chosen for your child's needs",
  },
  strip: ['Mathematics', 'Physics', 'Chemistry', 'Other subjects on request', 'Grade 6 to Grade 12', 'BEPC and Baccalaureate'],
  why: {
    title: 'Why families choose us',
    intro:
      'Secondary school is demanding. We give every student the support they need, at the right pace, alongside their classes at school.',
    featured: {
      title: 'An adapted teaching team',
      description: "We assign one or more teachers based on the student's learning needs for the best possible support.",
    },
    cards: [
      {
        title: 'Personalized follow-up',
        description: 'Every student gets a learning plan adapted to their needs and goals.',
        highlight: false,
      },
      {
        // TODO: verify result tracking and regular reports
        title: 'Tracked results',
        description: 'Regular reports to measure progress and adjust the support.',
        highlight: true,
      },
      {
        title: 'Flexible formats',
        description: "In-person or online classes, adapted to your child's schedule.",
        highlight: false,
      },
      {
        // TODO: verify teacher selection and evaluation process
        title: 'Verified teachers',
        description: 'All our teachers go through a rigorous selection and are regularly evaluated.',
        highlight: false,
      },
    ],
  },
  howItWorks: {
    eyebrow: 'How it works',
    title: 'Four steps to tailored support',
    steps: [
      { title: 'Registration and assessment', description: "You choose the format, we assess your child's level." },
      { title: 'Choice of teachers', description: 'One or more qualified teachers, based on the identified needs.' },
      { title: 'Classes begin', description: 'On the agreed schedule, in person or online.' },
      // TODO: verify regular reports are actually delivered
      { title: 'Follow-up and adjustment', description: 'Regular reports and a continuously adjusted program.' },
    ],
    reassurance: 'You can start at any time during the school year.',
  },
  subjects: {
    title: 'Subjects taught',
    intro: 'Our core subjects are the sciences. Other subjects are available on request.',
    cards: [
      {
        symbol: 'π',
        title: 'Mathematics',
        description: 'Algebra, geometry, trigonometry and analysis. Strengthening foundations and exam preparation.',
        levels: ['Grade 6 to 9', 'Grade 10 to 12'],
      },
      {
        symbol: 'F=ma',
        title: 'Physics',
        description: 'Mechanics, electricity, optics and thermodynamics. Theory and practical exercises.',
        levels: ['Grade 8 to 12'],
      },
      {
        symbol: 'H₂O',
        title: 'Chemistry',
        description: 'General, organic and inorganic chemistry. Experiments and practical applications.',
        levels: ['Grade 8 to 12'],
      },
    ],
    other: {
      title: 'Other subjects on request',
      description: 'Does your child need help in another subject? Tell us which one and we will find the right teacher.',
      cta: 'Make a request',
    },
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'What parents say',
    cards: [
      {
        name: 'Sylvie Kamga',
        initials: 'SK',
        role: 'Mother of a Grade 10 student',
        content: 'Thanks to the support she received, my daughter regained her confidence. The teachers are patient and truly attentive.',
      },
      {
        name: 'Achille Mboua',
        initials: 'AM',
        role: 'Father of a Grade 12 student',
        content: "The assigned teacher identified my son's gaps in physics and chemistry and addressed them effectively before the baccalaureate.",
      },
      {
        name: 'Nkomo Tagne',
        initials: 'NT',
        role: 'Mother of a Grade 9 student',
        content: 'The personalized follow-up makes all the difference. I receive regular reports and can easily talk with the teacher.',
      },
    ],
  },
  partnership: {
    title: 'Our partnership with Suku',
    description:
      'An educational platform that shares our vision: additional learning resources, digital progress tracking and a wider learning community.',
    logoAlt: 'Logo of Suku, our partner',
  },
  teacherRecruitment: {
    title: 'Are you a teacher?',
    description:
      'Join our team of qualified tutors. We are looking for teachers with a degree in their subject, secondary school experience, patience and good listening skills.',
    cta: 'Apply now',
  },
  finalCta: {
    title: 'Ready to give your child the best?',
    // TODO: verify the fast reply promise
    subtitle: 'Enroll today. We will get back to you quickly.',
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Write on WhatsApp',
  },
  footer: {
    tagline: 'Tutoring for secondary school students, alongside school.',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    followUs: 'Follow us',
    partnership: 'Partner: Suku',
    copyright: '© 2026 Performia. All rights reserved.',
  },
  contact: {
    title: 'Contact us',
    subtitle: 'We are here to answer all your questions',
    form: {
      name: 'Full name',
      namePlaceholder: 'Your name',
      email: 'Email address',
      emailPlaceholder: 'your@email.com',
      phone: 'Phone',
      phonePlaceholder: '+237 6XX XX XX XX',
      subject: 'Subject',
      subjectPlaceholder: 'Subject of your message',
      message: 'Message',
      messagePlaceholder: 'Describe your request...',
      submit: 'Send message',
    },
    info: {
      title: 'Contact information',
      addressLabel: 'Address',
      address: 'Yaoundé, Douala, Cameroon',
      phoneLabel: 'Phone',
      whatsappLabel: 'WhatsApp',
      emailLabel: 'Email',
      hoursLabel: 'Opening hours',
      hours: 'Monday - Saturday: 8am - 6pm',
      socialTitle: 'Social media',
    },
    success: 'Message sent successfully. We will respond to you as soon as possible.',
    errorSummary: 'Please correct the fields marked below.',
    privacyNotice: 'Your data is only used to answer your request.',
    errors: {
      name: 'Please enter your name (2 to 100 characters).',
      email: 'Please enter a valid email address.',
      phone: 'Please enter a valid phone number (8 to 30 characters).',
      subject: 'Please enter a subject (3 to 150 characters).',
      message: 'Your message must contain between 10 and 2000 characters.',
    },
  },
  errorPage: {
    title: 'Form expired',
    csrfMessage: 'For your security, this form has expired. Please reload the page and try again.',
    back: 'Back to the form',
    backHome: 'Back to home',
    notFound: { title: 'Page not found', message: 'The page you requested does not exist or has moved.' },
    tooManyRequests: {
      title: 'Too many attempts',
      message: 'You sent too many messages in a short time. Please try again in a minute or write to us on WhatsApp.',
    },
    serverError: { title: 'Something went wrong', message: 'Please try again in a moment.' },
  },
};
