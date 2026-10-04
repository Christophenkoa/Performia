import type { SiteContent } from './content.types.js';

// Copy taken from the live site helloperformia.com (2026-10-04).
// "TODO: verify" marks figures, quotes and promises that must be confirmed with a source before launch.
export const fr: SiteContent = {
  brand: 'Academic Excellence',
  meta: {
    homeTitle: 'Academic Excellence Platform - Encadrement académique de qualité',
    homeDescription:
      'Offrez à votre enfant les meilleurs enseignants pour réussir au secondaire. Encadrement personnalisé en mathématiques, physique et chimie.',
    contactTitle: 'Contactez-nous - Academic Excellence Platform',
    contactDescription: 'Nous sommes là pour répondre à toutes vos questions',
  },
  nav: { ariaLabel: 'Navigation principale', home: 'Accueil', contact: 'Contact', menu: 'Menu', switchLabel: 'EN', switchLang: 'en' },
  hero: {
    formatBadge: 'Cours en présentiel ou en ligne selon vos préférences',
    headline: 'Offrez à votre enfant les meilleurs enseignants pour réussir au secondaire',
    subheadline: "Un encadrement académique personnalisé et de qualité pour garantir l'excellence scolaire de votre enfant",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Découvrir le programme',
    trustText: 'Rejoignez plus de 847 familles qui nous font confiance', // TODO: verify figure
  },
  trustBlock: {
    title: 'Pourquoi nous choisir ?',
    points: [
      {
        icon: 'users',
        title: 'Équipe pédagogique adaptée',
        description:
          "Nous assignons un ou plusieurs enseignants en fonction des besoins pédagogiques de l'élève pour un accompagnement optimal.",
      },
      {
        icon: 'target',
        title: 'Suivi personnalisé',
        description: "Chaque élève bénéficie d'un accompagnement adapté à ses besoins spécifiques.",
      },
      {
        icon: 'trendingUp',
        title: 'Résultats prouvés',
        description: '92% de nos élèves améliorent leurs notes en moins de 3 mois.', // TODO: verify figure and source
      },
      {
        icon: 'monitor',
        title: 'Flexibilité des formats',
        description: "Des cours en présentiel ou en ligne, adaptés à l'emploi du temps de votre enfant.",
      },
    ],
  },
  problem: {
    title: 'Les défis du secondaire',
    description:
      "Le passage au secondaire représente un tournant crucial dans la scolarité. Les programmes deviennent plus exigeants, les matières se complexifient, et les élèves font face à de nouvelles méthodes d'apprentissage. Sans un accompagnement adapté, beaucoup d'élèves perdent confiance et voient leurs résultats chuter.",
    challenges: [
      'Programme scolaire de plus en plus exigeant',
      "Classes surchargées limitant l'attention individuelle",
      'Difficultés à comprendre certaines matières clés',
      "Manque de méthodes d'apprentissage efficaces",
    ],
  },
  solution: {
    title: 'Notre approche pédagogique',
    blocks: [
      {
        icon: 'clipboardList',
        title: 'Diagnostic personnalisé',
        description: "Nous évaluons le niveau de chaque élève pour identifier ses forces et ses axes d'amélioration.",
      },
      {
        icon: 'lightbulb',
        title: "Plan d'apprentissage sur mesure",
        description: 'Un programme adapté aux besoins spécifiques et aux objectifs de votre enfant.',
      },
      {
        icon: 'users',
        title: 'Accompagnement ciblé',
        description:
          "L'intervention d'un ou plusieurs enseignants, soigneusement sélectionnés selon les besoins identifiés, permet à l'élève de bénéficier d'une pédagogie sur mesure.",
      },
      {
        icon: 'chartLine',
        title: 'Suivi régulier',
        description: "Des rapports détaillés pour suivre les progrès et ajuster l'accompagnement en continu.",
      },
    ],
  },
  howItWorks: {
    title: 'Comment ça marche ?',
    steps: [
      {
        title: 'Inscription et choix du format',
        description:
          'Inscrivez votre enfant, choisissez votre format préféré (présentiel ou en ligne) et nous évaluons son niveau.',
      },
      {
        title: 'Attribution des enseignants',
        description:
          'Nous assignons un ou plusieurs enseignants qualifiés correspondant exactement aux besoins identifiés de votre enfant.',
      },
      {
        title: 'Début des cours',
        description: "Les cours commencent selon l'horaire convenu, dans le format que vous avez sélectionné.",
      },
      {
        title: 'Suivi et ajustement',
        description: 'Nous suivons les progrès et ajustons le programme pour garantir les meilleurs résultats.',
      },
    ],
    reassurance: "Vous pouvez commencer à tout moment de l'année scolaire",
  },
  difference: {
    title: 'Ce qui nous distingue',
    blocks: [
      {
        icon: 'shieldCheck',
        title: 'Enseignants vérifiés',
        description: 'Tous nos enseignants passent par un processus de sélection rigoureux et sont régulièrement évalués.',
      },
      {
        icon: 'userCheck',
        title: 'Affectation sur mesure',
        description:
          "Le choix et le nombre d'enseignants sont déterminés par les besoins spécifiques de l'élève, garantissant un soutien pédagogique parfaitement adapté.",
      },
      {
        icon: 'monitor',
        title: 'Technologie éducative',
        description: 'Plateforme en ligne moderne avec ressources pédagogiques et suivi en temps réel.',
      },
      {
        icon: 'award',
        title: 'Garantie de satisfaction',
        description: "Si vous n'êtes pas satisfait après le premier mois, nous vous remboursons intégralement.", // TODO: verify refund terms
      },
    ],
  },
  subjects: {
    title: 'Matières enseignées',
    subtitle: 'Un accompagnement complet dans les matières scientifiques clés',
    cards: [
      {
        icon: 'calculator',
        title: 'Mathématiques',
        description: 'Algèbre, géométrie, trigonométrie, et analyse. Renforcement des bases et préparation aux examens.',
        levels: ['Sixième à Troisième', 'Seconde à Terminale'],
      },
      {
        icon: 'atom',
        title: 'Physique',
        description: 'Mécanique, électricité, optique, et thermodynamique. Cours théoriques et exercices pratiques.',
        levels: ['Quatrième à Terminale'],
      },
      {
        icon: 'flask',
        title: 'Chimie',
        description: 'Chimie générale, organique et inorganique. Expériences et applications concrètes.',
        levels: ['Quatrième à Terminale'],
      },
    ],
  },
  targetAudience: {
    title: "À qui s'adresse notre programme ?",
    description:
      "Notre plateforme d'excellence académique couvre l'intégralité du cursus secondaire. De la Sixième à la Terminale, nous accompagnons chaque élève avec une pédagogie adaptée à son niveau, pour consolider ses bases, réussir ses examens et préparer sereinement ses études supérieures.",
    profiles: [
      'Élèves ayant des difficultés dans certaines matières',
      'Élèves souhaitant améliorer leurs notes',
      'Élèves préparant des examens importants (BEPC, Baccalauréat)',
      "Élèves visant l'excellence académique",
    ],
    levels: ['Sixième', 'Cinquième', 'Quatrième', 'Troisième', 'Seconde', 'Première', 'Terminale'],
  },
  partnership: {
    title: 'Notre partenariat avec Suku',
    description:
      "Nous sommes fiers de collaborer avec Suku, une plateforme éducative innovante qui partage notre vision de l'excellence académique.",
    benefits: [
      { icon: 'bookOpen', text: 'Accès à des ressources pédagogiques supplémentaires' },
      { icon: 'sparkles', text: 'Plateforme technologique de pointe' },
      { icon: 'chartLine', text: 'Suivi numérique des progrès' },
      { icon: 'users', text: "Communauté d'apprentissage élargie" },
    ],
    partnerName: 'Partenaire : Suku',
    logoAlt: 'Logo de Suku, partenaire de la plateforme',
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'Ce que disent les parents',
    cards: [
      {
        name: 'Sylvie Kamga',
        role: "Mère d'élève en Seconde",
        content:
          "Grâce à l'accompagnement reçu, ma fille a retrouvé confiance en elle. Ses notes en mathématiques sont passées de 11/20 à 16/20 en seulement deux mois. Les enseignants sont patients et vraiment à l'écoute.",
        rating: 5,
      },
      {
        name: 'Achille Mboua',
        role: "Père d'élève en Terminale",
        content:
          "Mon fils préparait son baccalauréat et avait besoin d'un soutien en physique-chimie. L'enseignant assigné a su identifier ses lacunes et y remédier efficacement. Il a obtenu 17/20 à son examen final.",
        rating: 5,
      },
      {
        name: 'Nkomo Tagne',
        role: "Mère d'élève en Troisième",
        content:
          "Le suivi personnalisé fait toute la différence. Je reçois régulièrement des rapports sur les progrès de mon enfant et je peux échanger facilement avec l'enseignant. Un service professionnel et efficace.",
        rating: 5,
      },
    ],
  },
  teacherRecruitment: {
    title: 'Vous êtes enseignant ?',
    subtitle: 'Rejoignez notre équipe de professeurs qualifiés',
    description: 'Nous recherchons des enseignants passionnés et compétents pour accompagner nos élèves vers la réussite.',
    requirements: [
      'Diplôme universitaire dans la matière enseignée',
      "Expérience d'enseignement au secondaire",
      'Excellentes capacités pédagogiques',
      "Patience et sens de l'écoute",
      'Disponibilité flexible',
    ],
    cta: 'Postuler maintenant',
  },
  finalCta: {
    title: 'Prêt à offrir le meilleur à votre enfant ?',
    subtitle: "Inscrivez-vous dès aujourd'hui et donnez à votre enfant les clés de la réussite scolaire",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Nous contacter',
  },
  footer: {
    tagline: 'Encadrement académique de qualité pour les élèves du secondaire',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    followUs: 'Suivez-nous',
    partnership: 'Partenaire : Suku',
    copyright: '© 2026 Academic Excellence Platform. Tous droits réservés.',
  },
  contact: {
    title: 'Contactez-nous',
    subtitle: 'Nous sommes là pour répondre à toutes vos questions',
    form: {
      name: 'Nom complet',
      namePlaceholder: 'Votre nom',
      email: 'Adresse email',
      emailPlaceholder: 'votre@email.com',
      phone: 'Téléphone',
      phonePlaceholder: '+237 6XX XX XX XX',
      subject: 'Sujet',
      subjectPlaceholder: 'Objet de votre message',
      message: 'Message',
      messagePlaceholder: 'Décrivez votre demande...',
      submit: 'Envoyer le message',
    },
    info: {
      title: 'Informations de contact',
      addressLabel: 'Adresse',
      address: 'Yaoundé, Douala, Cameroun',
      phoneLabel: 'Téléphone',
      whatsappLabel: 'WhatsApp',
      emailLabel: 'Email',
      hoursLabel: 'Horaires',
      hours: 'Lundi - Samedi : 8h - 18h',
      socialTitle: 'Réseaux sociaux',
    },
    success: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    errorSummary: 'Veuillez corriger les champs signalés ci-dessous.',
    privacyNotice: 'Vos données sont utilisées uniquement pour répondre à votre demande.',
    errors: {
      name: 'Veuillez indiquer votre nom (2 à 100 caractères).',
      email: 'Veuillez indiquer une adresse email valide.',
      phone: 'Veuillez indiquer un numéro de téléphone valide (8 à 30 caractères).',
      subject: 'Veuillez indiquer un sujet (3 à 150 caractères).',
      message: 'Votre message doit contenir entre 10 et 2000 caractères.',
    },
  },
  errorPage: {
    title: 'Formulaire expiré',
    csrfMessage: 'Pour votre sécurité, ce formulaire a expiré. Veuillez recharger la page et réessayer.',
    back: 'Retour au formulaire',
  },
};
