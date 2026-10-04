# Performia redesign (direction A "Confiance") - Design

Date: 2026-10-04
Status: Approved in chat

## Goal

Apply the visual direction approved in Claude Design (direction A "Confiance"), the new Performia "Envol" logo and the reframed copy to the existing NestJS site, without changing its architecture, routes, security model or contact-form behaviour.

Success criteria:

- The home page shows the 8 sections of direction A, in order, in French (`/`) and English (`/en`).
- The brand is "Performia" everywhere (header, footer, page titles, copyright); the Envol logo replaces the graduation cap; favicon and app icons come from `brand/`.
- The copy presents the service as tutoring ("cours de soutien", "répétitions") that complements school, and offers "other subjects on demand".
- Contact and error pages use the same visual language; their fields, validation, CSRF, rate limiting and messages behave exactly as before.
- All existing security and contact tests pass unchanged; the e2e suite is updated for the new structure; lint, typecheck and build pass.

## Visual reference

- `docs/design/direction-a-confiance.dc.html` - the approved home page mockup (layout, spacing, colors, copy). It is a Claude Design file with inline styles; it is a reference, not code to copy verbatim.
- `docs/design/logo-pistes.dc.html` - logo exploration; the chosen one is "Piste 1 - Envol".
- `brand/README.md`, `brand/svg/`, `brand/png/` - final logo files and usage rules.

## Design tokens

| Token | Value | Use |
|---|---|---|
| navy | `#13294B` | primary text, dark sections, primary buttons on light |
| navy-deep | `#0F2140` | "how it works" band |
| gold | `#D4A83A` | accents, logo arrow, primary CTA fill (navy text on it) |
| sand | `#F3EEDF` | soft cards, badges, level pills |
| mist | `#F7F9FC` | light section backgrounds |
| line | `#E3E8EF` | borders |
| muted | `#44546A` | secondary text on white (contrast 7:1) |
| on-navy | `#D6DDE8` | secondary text on navy |

Gold is never used as text color on white. Fonts: Sora (600, 700) for headings and the wordmark, DM Sans (400-600) for body; both self-hosted from `@fontsource-variable` packages (latin subset), like today. Radii: 24 px cards, 28 px hero image, 32 px CTA panel, pill buttons (999 px). Max content width 1200 px.

## Brand assets in the app

- Header and footer render the Envol mark as inline SVG (64-unit grid, same paths as `brand/svg/performia-mark.svg`) next to the "Performia" wordmark set in Sora 700.
- `public/img/favicon.svg` is replaced by `brand/svg/performia-mark.svg`; `public/favicon.ico`, `public/img/apple-touch-icon.png` (180) and `public/img/icon-192.png`, `icon-512.png` come from `brand/png/`. The layout links all of them.
- `brand/` is committed to the repo as the source of truth for logo files.

## Home page structure

1. **Header** (sticky, white, bottom border): logo + wordmark; nav links "Notre approche" (`#approche`), "Matières" (`#matieres`), "Avis des parents" (`#avis`), "Contact" (contact page); FR/EN switch; primary pill button "Inscrire mon enfant" (contact page). Mobile: `<details>` menu as today.
2. **Hero** (two columns, stacks on mobile): badge "Cours de soutien · présentiel ou en ligne"; H1 "Des répétiteurs qualifiés pour réussir au secondaire"; lead "En complément de l'école, un accompagnement personnalisé en mathématiques, physique, chimie et d'autres matières sur demande, de la Sixième à la Terminale."; buttons "Inscrire mon enfant" (gold) and "Découvrir le programme" (`#approche`, outline); trust line "Rejoignez de nombreuses familles qui nous font confiance"; photo (existing `hero.jpg`, rounded) with a floating white card "Un ou plusieurs enseignants choisis selon les besoins de votre enfant".
3. **Strip** (mist band): Mathématiques · Physique · Chimie · Autres matières sur demande · Sixième à Terminale · BEPC et Baccalauréat.
4. **Why us** (`#approche`): title "Pourquoi les familles nous choisissent" + intro; bento grid: one large navy card "Une équipe pédagogique adaptée" spanning two rows, then four cards "Suivi personnalisé", "Résultats suivis" (sand), "Formats flexibles", "Enseignants vérifiés".
5. **How it works** (navy-deep band): eyebrow "Comment ça marche", title "Quatre étapes, un accompagnement sur mesure", four numbered steps (01-04) with gold top rule, reassurance line "Vous pouvez commencer à tout moment de l'année scolaire."
6. **Subjects** (`#matieres`): title "Matières enseignées" + intro "Nos matières phares sont les sciences. D'autres matières sont possibles sur demande."; cards Mathématiques (π), Physique (F=ma), Chimie (H₂O) with level pills; fourth navy card "Autres matières sur demande" with a "Faire une demande" button to the contact page.
7. **Testimonials** (`#avis`, mist band): three quote cards with initials avatar, name, role. Content stays marked `TODO: verify`.
8. **Partnership + teachers**: two cards side by side: Suku logo + "Notre partenariat avec Suku" + one paragraph; sand card "Vous êtes enseignant ?" + one paragraph + "Postuler maintenant" (contact page).
9. **Final CTA**: navy rounded panel "Prêt à offrir le meilleur à votre enfant ?" + "Inscrivez-vous dès aujourd'hui. Nous vous répondons rapidement." + "Inscrire mon enfant" (gold) and "Écrire sur WhatsApp" (outline, WhatsApp URL).
10. **Footer**: logo + wordmark, tagline, contact links (phone, WhatsApp, email, address), social links, partner line, copyright "© 2026 Performia. Tous droits réservés."

English mirrors the French structure; copy is translated with the same framing ("tutoring", "complements school", "other subjects on request").

Removed from the home page (decision: follow A): "Les défis du secondaire", "Notre approche pédagogique" (4 blocks), "Ce qui nous distingue" as its own section (merged into Why us), "À qui s'adresse notre programme" (levels move to the strip), the teacher requirements list, star ratings, and the "92%" claim.

## Content model changes

`SiteContent` (`src/content/content.types.ts`) is reorganised to match the sections: `hero` gains `photoCaption` and `photoAlt`; new `strip: string[]`; new `why { title, intro, featured, cards }`; `howItWorks` gains `eyebrow`; `subjects` gains `intro`, cards gain `symbol` and lose `icon`, plus `other { title, description, cta }`; `testimonials.cards` gain `initials` and lose `rating`; `partnership` loses `benefits` and `partnerName`; `teacherRecruitment` becomes `{ title, description, cta }`; `nav` gains `approach`, `subjects`, `reviews`, `cta`; `footer.tagline` reworded. Removed: `problem`, `solution`, `difference`, `targetAudience`. `contact` and `errorPage` keep their keys (only `meta` titles change to "Performia"). The FR/EN structural-parity test keeps guarding both files.

## Contact and error pages

Same structure and behaviour; restyled: hero band navy with Sora title, form in a white card (24 px radius, fine border), inputs with 12 px radius and gold focus ring, contact details as mist cards with navy icons, error page centered with the Envol mark.

## Testing

- Unit: content parity, empty-string and icon tests adapted to the new model; helper tests unchanged.
- E2E: home sections in order (FR/EN) using the new titles; "Performia" in title, header and footer; "Autres matières sur demande" card linking to the contact page; favicon, apple-touch icon and fonts served; no "Academic Excellence" left in rendered pages. All contact, CSRF, rate-limit, error-page and security-header tests stay green without edits other than brand/title strings they assert.

## Out of scope

New pages (privacy, terms), real contact delivery, animations or client-side JavaScript, CMS, image optimisation beyond the existing hero photo.
