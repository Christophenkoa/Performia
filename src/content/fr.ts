import type { SiteContent } from './content.types.js';

// Copy taken from the live site helloperformia.com (2026-10-04).
// "TODO: verify" marks figures, quotes and promises that must be confirmed with a source before launch.
export const fr: SiteContent = {
  brand: 'Performia',
  meta: {
    homeTitle: 'Performia - Cours de soutien scolaire et répétitions au secondaire',
    homeDescription:
      "Des répétiteurs qualifiés pour réussir au secondaire. Cours de soutien en mathématiques, physique, chimie et autres matières sur demande, en complément de l'école, à Yaoundé, Douala et en ligne.",
    contactTitle: 'Contactez-nous - Performia',
    contactDescription: 'Nous sommes là pour répondre à toutes vos questions',
  },
  nav: { ariaLabel: 'Navigation principale', home: 'Accueil', approach: 'Notre approche', subjects: 'Matières', reviews: 'Avis des parents', contact: 'Contact', cta: 'Inscrire mon enfant', menu: 'Menu', switchLabel: 'EN', switchLang: 'en' },
  hero: {
    formatBadge: 'Cours de soutien · présentiel ou en ligne',
    headline: 'Des répétiteurs qualifiés pour réussir au secondaire',
    subheadline:
      "En complément de l'école, un accompagnement personnalisé en mathématiques, physique, chimie et d'autres matières sur demande, de la Sixième à la Terminale.",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Découvrir le programme',
    // TODO: verify the number of families claimed
    trustText: 'Rejoignez de nombreuses familles qui nous font confiance',
    photoAlt: "Enseignant devant une carte de l'Afrique dans une salle de classe",
    photoCaption: 'Un ou plusieurs enseignants choisis selon les besoins de votre enfant',
  },
  strip: ['Mathématiques', 'Physique', 'Chimie', 'Autres matières sur demande', 'Sixième à Terminale', 'BEPC et Baccalauréat'],
  why: {
    title: 'Pourquoi les familles nous choisissent',
    intro:
      "Le passage au secondaire est exigeant. Nous donnons à chaque élève l'accompagnement dont il a besoin, au bon rythme, en complément de ses cours à l'école.",
    featured: {
      title: 'Une équipe pédagogique adaptée',
      description:
        "Nous assignons un ou plusieurs enseignants en fonction des besoins pédagogiques de l'élève pour un accompagnement optimal.",
    },
    cards: [
      {
        title: 'Suivi personnalisé',
        description: "Chaque élève bénéficie d'un plan d'apprentissage adapté à ses besoins et à ses objectifs.",
        highlight: false,
      },
      {
        // TODO: verify result tracking and regular reports
        title: 'Résultats suivis',
        description: "Des rapports réguliers pour mesurer les progrès et ajuster l'accompagnement.",
        highlight: true,
      },
      {
        title: 'Formats flexibles',
        description: "Des cours en présentiel ou en ligne, adaptés à l'emploi du temps de votre enfant.",
        highlight: false,
      },
      {
        // TODO: verify teacher selection and evaluation process
        title: 'Enseignants vérifiés',
        description: 'Tous nos enseignants passent par une sélection rigoureuse et sont régulièrement évalués.',
        highlight: false,
      },
    ],
  },
  howItWorks: {
    eyebrow: 'Comment ça marche',
    title: 'Quatre étapes, un accompagnement sur mesure',
    steps: [
      { title: 'Inscription et diagnostic', description: 'Vous choisissez le format, nous évaluons le niveau de votre enfant.' },
      { title: 'Choix des enseignants', description: 'Un ou plusieurs enseignants qualifiés, selon les besoins identifiés.' },
      { title: 'Début des cours', description: "Selon l'horaire convenu, en présentiel ou en ligne." },
      // TODO: verify regular reports are actually delivered
      { title: 'Suivi et ajustement', description: 'Des rapports réguliers et un programme ajusté en continu.' },
    ],
    reassurance: "Vous pouvez commencer à tout moment de l'année scolaire.",
  },
  subjects: {
    title: 'Matières enseignées',
    intro: "Nos matières phares sont les sciences. D'autres matières sont possibles sur demande.",
    cards: [
      {
        symbol: 'π',
        title: 'Mathématiques',
        description: 'Algèbre, géométrie, trigonométrie et analyse. Renforcement des bases et préparation aux examens.',
        levels: ['Sixième à Troisième', 'Seconde à Terminale'],
      },
      {
        symbol: 'F=ma',
        title: 'Physique',
        description: 'Mécanique, électricité, optique et thermodynamique. Cours théoriques et exercices pratiques.',
        levels: ['Quatrième à Terminale'],
      },
      {
        symbol: 'H₂O',
        title: 'Chimie',
        description: 'Chimie générale, organique et inorganique. Expériences et applications concrètes.',
        levels: ['Quatrième à Terminale'],
      },
    ],
    other: {
      title: 'Autres matières sur demande',
      description: "Votre enfant a besoin d'aide dans une autre matière ? Dites-nous laquelle, nous trouvons l'enseignant adapté.",
      cta: 'Faire une demande',
    },
  },
  // TODO: verify - testimonials must come from real parents who agreed to publication
  testimonials: {
    title: 'Ce que disent les parents',
    cards: [
      {
        name: 'Sylvie Kamga',
        initials: 'SK',
        role: "Mère d'élève en Seconde",
        content: "Grâce à l'accompagnement reçu, ma fille a retrouvé confiance en elle. Les enseignants sont patients et vraiment à l'écoute.",
      },
      {
        name: 'Achille Mboua',
        initials: 'AM',
        role: "Père d'élève en Terminale",
        content:
          "L'enseignant assigné a su identifier les lacunes de mon fils en physique-chimie et y remédier efficacement avant le baccalauréat.",
      },
      {
        name: 'Nkomo Tagne',
        initials: 'NT',
        role: "Mère d'élève en Troisième",
        content:
          "Le suivi personnalisé fait toute la différence. Je reçois régulièrement des rapports et j'échange facilement avec l'enseignant.",
      },
    ],
  },
  partnership: {
    title: 'Notre partenariat avec Suku',
    description:
      "Une plateforme éducative qui partage notre vision : ressources pédagogiques supplémentaires, suivi numérique des progrès et une communauté d'apprentissage élargie.",
    logoAlt: 'Suku, notre partenaire (site hellosuku.cm)',
    cta: 'Découvrir Suku',
  },
  teacherRecruitment: {
    title: 'Vous êtes enseignant ?',
    description:
      "Rejoignez notre équipe de répétiteurs qualifiés. Nous recherchons des enseignants diplômés dans leur matière, expérimentés au secondaire, patients et à l'écoute.",
    cta: 'Postuler maintenant',
  },
  finalCta: {
    title: 'Prêt à offrir le meilleur à votre enfant ?',
    // TODO: verify the fast reply promise
    subtitle: "Inscrivez-vous dès aujourd'hui. Nous vous répondons rapidement.",
    ctaPrimary: 'Inscrire mon enfant',
    ctaSecondary: 'Écrire sur WhatsApp',
  },
  footer: {
    tagline: "Cours de soutien scolaire et répétitions pour les élèves du secondaire, en complément de l'école.",
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    followUs: 'Suivez-nous',
    partnership: 'Partenaire : Suku',
    copyright: '© 2026 Performia. Tous droits réservés.',
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
    backHome: "Retour à l'accueil",
    notFound: { title: 'Page introuvable', message: "La page demandée n'existe pas ou a été déplacée." },
    tooManyRequests: {
      title: 'Trop de tentatives',
      message: 'Vous avez envoyé trop de messages en peu de temps. Veuillez réessayer dans une minute ou nous écrire sur WhatsApp.',
    },
    serverError: { title: 'Une erreur est survenue', message: 'Veuillez réessayer dans quelques instants.' },
  },
};
