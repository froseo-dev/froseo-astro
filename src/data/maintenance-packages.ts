/**
 * WordPress-onderhoudspakketten — single source of truth.
 * Wijzig hier en zowel /website-onderhoud als /wordpress-website-onderhoud
 * (en eventuele toekomstige onderhoud-pagina's) volgen automatisch.
 */

import { pricing as sitePricing } from './site-config';

export interface MaintenanceFeature {
  /** Korte label die in pakket-cards toont. */
  label: string;
  /** True wanneer dit een hoofd-USP is (krijgt highlight). */
  highlight?: boolean;
}

export interface MaintenancePackage {
  slug: 'basic-care' | 'standard-care' | 'pro-care';
  name: string;
  /** Korte naam voor knoppen ("Kies Basic Care ↗"). Fallback naar name. */
  shortName?: string;
  /** 1-zin positionering onder de naam. */
  tagline: string;
  /** Maandprijs (zonder valuta-prefix). */
  monthlyPrice: number;
  /** Jaarprijs = 11 × monthlyPrice (= 1 maand gratis). */
  yearlyPrice: number;
  /** Wordt featured/highlighted in de UI. Eén pakket markeren als true. */
  isFeatured?: boolean;
  /** Korte 1-line "voor wie". */
  forWhom: string;
  /** Lijst features die op de card verschijnen. */
  features: MaintenanceFeature[];
}

/* Jaarprijzen zijn afgerond naar mooie hele maandbedragen bij jaarlijkse
   facturatie (~1 maand gratis): €27/m, €36/m, €54/m. */
export const maintenancePackages: MaintenancePackage[] = [
  {
    slug: 'basic-care',
    name: 'Basic Care Package',
    shortName: 'Basic Care',
    tagline: 'De fundering goed neergezet.',
    monthlyPrice: 29,
    yearlyPrice: 27 * 12, // €324/jaar = €27/m
    forWhom: 'Voor kleine WordPress-sites',
    features: [
      { label: 'Handmatige maandelijkse updates met restore-point' },
      { label: 'Wekelijkse backups' },
      { label: '24/7 uptime-monitoring' },
      { label: 'Wekelijkse beveiligings-scan' },
      { label: 'Basis spam-bescherming' },
      { label: 'Jaarlijkse Core Web Vitals check' },
      { label: 'E-mail support' },
      { label: '€10/u korting op het Froseo-uurtarief', highlight: true },
    ],
  },
  {
    slug: 'standard-care',
    name: 'Standard Care Package',
    shortName: 'Standard Care',
    tagline: 'Voor de meeste sites die we onderhouden.',
    monthlyPrice: 39,
    yearlyPrice: 36 * 12, // €432/jaar = €36/m
    isFeatured: true,
    forWhom: 'Voor professionele WordPress-sites',
    features: [
      { label: 'Handmatige wekelijkse updates met restore-point' },
      { label: 'Dagelijkse backups' },
      { label: '24/7 uptime-monitoring' },
      { label: 'Dagelijkse beveiligings-scan met vulnerability detection' },
      { label: 'Uitgebreide spam-bescherming' },
      { label: 'Maandelijkse Core Web Vitals check' },
      { label: 'Database-optimalisatie per kwartaal' },
      { label: 'SEO ranking-monitoring tot 10 zoekwoorden' },
      { label: 'Premium plug-in-licenties t.w.v. €350+/jaar', highlight: true },
      { label: '30 minuten kleine reparaties per maand', highlight: true },
      { label: 'Support via e-mail, telefoon en WhatsApp' },
      { label: 'Maandrapport' },
      { label: '€10/u korting op het Froseo-uurtarief' },
    ],
  },
  {
    slug: 'pro-care',
    name: 'Pro Care Package',
    shortName: 'Pro Care',
    tagline: 'Voor wie maximale rust en performance wil.',
    monthlyPrice: 59,
    yearlyPrice: 54 * 12, // €648/jaar = €54/m
    forWhom: 'Voor groeiende of bedrijfskritische sites',
    features: [
      { label: 'Handmatige wekelijkse updates met restore-point' },
      { label: 'Dagelijkse backups (30 dagen retentie)' },
      { label: '24/7 uptime-monitoring' },
      { label: 'Dagelijkse beveiligings-scan met vulnerability detection' },
      { label: 'Uitgebreide spam-bescherming' },
      { label: 'Maandelijkse Core Web Vitals check' },
      { label: 'Database-optimalisatie elke maand' },
      { label: 'Continue image-optimalisatie' },
      { label: 'SEO ranking-monitoring tot 100 zoekwoorden' },
      { label: 'Broken-link monitoring' },
      { label: 'Premium plug-in-licenties t.w.v. €350+/jaar', highlight: true },
      { label: '1 uur kleine reparaties per maand', highlight: true },
      { label: 'Support via e-mail, telefoon en WhatsApp (voorrang)' },
      { label: 'Maandrapport' },
      { label: '€10/u korting op het Froseo-uurtarief' },
    ],
  },
];

/* Custom-strip onder de pakketten. */
export const maintenanceCustom = {
  title: 'Andere wensen?',
  body: 'Multi-site, WooCommerce, een eigen VPS of white-label voor reseller-pakketten? Dat doen we op maat. Vraag een offerte aan en we kijken naar wat past bij jouw situatie.',
  ctaLabel: 'Vraag een offerte aan ↗',
  ctaHref: '/contact',
};

/* Voor de "wat zijn kleine reparaties" FAQ-uitleg — herbruikt over pagina's. */
export const repairScopeFaq = {
  q: 'Wat valt er onder "kleine reparaties"?',
  a: 'Snelle fixes van technische problemen op je site, bijvoorbeeld: een plugin die niet meer werkt na een update, een form die geen mail meer verstuurt, een display-bug op een pagina, een afbeelding die niet meer laadt of een onverwachte foutmelding. Niet inbegrepen zijn aanpassingen of uitbreidingen van je site, zoals nieuwe pagina\'s, design-wijzigingen, nieuwe functionaliteit, content-updates, SEO-werk of migraties. Voor dat soort werk geldt ons meerwerk-tarief, met €10/uur korting voor pakketklanten.',
};
