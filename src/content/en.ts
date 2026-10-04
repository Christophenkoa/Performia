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
    formatBadge: 'In-person or online classes according to your preferences',
    headline: 'Give your child the best teachers to succeed in secondary school',
    subheadline: "Personalized, quality academic support to guarantee your child's academic excellence",
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Discover the program',
    trustText: 'Join many families who trust us',
  },
  trustBlock: {
    title: 'Why choose us?',
    points: [
      {
        icon: 'users',
        title: 'Adapted Teaching Team',
        description: "We assign one or more teachers based on the student's educational needs to ensure optimal learning.",
      },
      {
        icon: 'target',
        title: 'Personalized support',
        description: 'Each student receives support tailored to their specific needs.',
      },
      {
        icon: 'trendingUp',
        title: 'Proven results',
        description: '92% of our students improve their grades in less than 3 months.', // TODO: verify figure and source
      },
      {
        icon: 'monitor',
        title: 'Flexible Formats',
        description: "In-person or online classes, adapted to your child's schedule and your preferences.",
      },
    ],
  },
  problem: {
    title: 'Secondary school challenges',
    description:
      'The transition to secondary school represents a crucial turning point in education. Programs become more demanding, subjects become more complex, and students face new learning methods. Without proper support, many students lose confidence and see their results decline.',
    challenges: [
      'Increasingly demanding curriculum',
      'Overcrowded classes limiting individual attention',
      'Difficulty understanding key subjects',
      'Lack of effective learning methods',
    ],
  },
  solution: {
    title: 'Our teaching approach',
    blocks: [
      {
        icon: 'clipboardList',
        title: 'Personalized assessment',
        description: "We evaluate each student's level to identify their strengths and areas for improvement.",
      },
      {
        icon: 'lightbulb',
        title: 'Customized learning plan',
        description: "A program tailored to your child's specific needs and goals.",
      },
      {
        icon: 'users',
        title: 'Targeted Support',
        description:
          "The involvement of one or more teachers, carefully selected according to the student's needs, enables efficient and tailored progress.",
      },
      {
        icon: 'chartLine',
        title: 'Regular monitoring',
        description: 'Detailed reports to track progress and adjust support continuously.',
      },
    ],
  },
  howItWorks: {
    title: 'How does it work?',
    steps: [
      {
        title: 'Registration and format choice',
        description: 'Enroll your child, choose your preferred format (in-person or online), and we assess their level.',
      },
      {
        title: 'Teacher Assignment',
        description: "After assessment, we assign one or more qualified teachers matching exactly your child's identified needs.",
      },
      {
        title: 'Classes begin',
        description: 'Classes start according to the agreed schedule, in the format you selected.',
      },
      {
        title: 'Monitoring and adjustment',
        description: 'We track progress and adjust the program to ensure the best results.',
      },
    ],
    reassurance: 'You can start at any time during the school year',
  },
  difference: {
    title: 'What sets us apart',
    blocks: [
      {
        icon: 'shieldCheck',
        title: 'Verified teachers',
        description: 'All our teachers go through a rigorous selection process and are regularly evaluated.',
      },
      {
        icon: 'userCheck',
        title: 'Tailored Assignment',
        description:
          'The choice and number of teachers are determined by the specific needs of the student, ensuring perfectly adapted educational support.',
      },
      {
        icon: 'monitor',
        title: 'Proven digital tools',
        description: 'We rely on established online platforms for learning resources and progress tracking.',
      },
      {
        icon: 'award',
        title: 'Satisfaction guarantee',
        description: "If you're not satisfied after the first month, we offer a full refund.", // TODO: verify refund terms
      },
    ],
  },
  subjects: {
    title: 'Subjects taught',
    subtitle: 'Comprehensive support in key scientific subjects',
    cards: [
      {
        icon: 'calculator',
        title: 'Mathematics',
        description: 'Algebra, geometry, trigonometry, and analysis. Strengthening foundations and exam preparation.',
        levels: ['Grade 6 to 9', 'Grade 10 to 12'],
      },
      {
        icon: 'atom',
        title: 'Physics',
        description: 'Mechanics, electricity, optics, and thermodynamics. Theoretical courses and practical exercises.',
        levels: ['Grade 8 to 12'],
      },
      {
        icon: 'flask',
        title: 'Chemistry',
        description: 'General, organic and inorganic chemistry. Experiments and practical applications.',
        levels: ['Grade 8 to 12'],
      },
    ],
  },
  targetAudience: {
    title: 'Who is our program for?',
    description:
      'Our academic excellence platform covers the entire secondary school curriculum. From Grade 6 to Grade 12, we support each student with a teaching approach adapted to their level, to consolidate their foundations, pass their exams, and calmly prepare for higher education.',
    profiles: [
      'Students struggling with certain subjects',
      'Students wanting to improve their grades',
      'Students preparing for important exams',
      'Students aiming for academic excellence',
    ],
    levels: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
  },
  partnership: {
    title: 'Our partnership with Suku',
    description:
      'We are proud to collaborate with Suku, an innovative educational platform that shares our vision of academic excellence.',
    benefits: [
      { icon: 'bookOpen', text: 'Access to additional educational resources' },
      { icon: 'sparkles', text: 'Cutting-edge technology platform' },
      { icon: 'chartLine', text: 'Digital progress tracking' },
      { icon: 'users', text: 'Expanded learning community' },
    ],
    partnerName: 'Partner: Suku',
    logoAlt: 'Logo of Suku, partner of the platform',
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'What parents say',
    cards: [
      {
        name: 'Sylvie Kamga',
        role: 'Mother of Grade 10 student',
        content:
          'Thanks to the support received, my daughter regained confidence. Her math grades went from 11/20 to 16/20 in just two months. The teachers are patient and truly attentive.',
        rating: 5,
      },
      {
        name: 'Achille Mboua',
        role: 'Father of Grade 12 student',
        content:
          'My son was preparing for his baccalaureate and needed support in physics-chemistry. The assigned teacher identified his gaps and addressed them effectively. He scored 17/20 on his final exam.',
        rating: 5,
      },
      {
        name: 'Nkomo Tagne',
        role: 'Mother of Grade 9 student',
        content:
          "The personalized follow-up makes all the difference. I regularly receive reports on my child's progress and can easily communicate with the teacher. A professional and effective service.",
        rating: 5,
      },
    ],
  },
  teacherRecruitment: {
    title: 'Are you a teacher?',
    subtitle: 'Join our team of qualified teachers',
    description: 'We are looking for passionate and competent teachers to guide our students to success.',
    requirements: [
      'University degree in the subject taught',
      'Secondary school teaching experience',
      'Excellent teaching skills',
      'Patience and listening skills',
      'Flexible availability',
    ],
    cta: 'Apply now',
  },
  finalCta: {
    title: 'Ready to give your child the best?',
    subtitle: 'Enroll today and give your child the keys to academic success',
    ctaPrimary: 'Enroll my child',
    ctaSecondary: 'Contact us',
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
