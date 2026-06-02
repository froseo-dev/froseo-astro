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
  /** True = altijd zichtbaar op de card. De rest zit achter "Bekijk alle onderdelen". */
  primary?: boolean;
  /** Optionele sub-regel onder de feature (bv. welke licenties), alleen
   *  zichtbaar in uitgeklapte staat. */
  detail?: string;
}

export interface MaintenancePackage {
  slug: 'basic-care' | 'standard-care' | 'pro-care';
  name: string;
  /** Korte naam voor knoppen ("Kies Basic Care ↗"). Fallback naar name. */
  shortName?: string;
  /** Eén subtitel onder de naam ("voor wie"). */
  tagline: string;
  /** Maandprijs (zonder valuta-prefix). */
  monthlyPrice: number;
  /** Jaarprijs = 11 × monthlyPrice (= 1 maand gratis). */
  yearlyPrice: number;
  /** Wordt featured/highlighted in de UI. Eén pakket markeren als true. */
  isFeatured?: boolean;
  /** Optionele samenvattende regel ("Alles uit Basic Care"), alleen zichtbaar
   *  in ingeklapte staat. Bij uitklappen toont de volledige features-lijst. */
  summary?: string;
  /** Volledige, zelfstandige features-lijst voor dit pakket. `primary` =
   *  zichtbaar in ingeklapte staat; de rest komt achter "Bekijk alle onderdelen". */
  features: MaintenanceFeature[];
}

/* Jaarprijzen zijn afgerond naar mooie hele maandbedragen bij jaarlijkse
   facturatie (~1 maand gratis): €27/m, €36/m, €54/m. */
export const maintenancePackages: MaintenancePackage[] = [
  {
    slug: 'basic-care',
    name: 'Basic Care Package',
    shortName: 'Basic Care',
    tagline: 'Voor kleine websites en online visitekaartjes.',
    monthlyPrice: 29,
    yearlyPrice: 27 * 12, // €324/jaar = €27/m
    features: [
      { label: 'Maandelijkse updates met restore-point', primary: true },
      { label: 'Wekelijkse backups', primary: true },
      { label: 'Wekelijkse beveiligingsscan', primary: true },
      { label: 'Basis spambescherming', primary: true },
      { label: '24/7 monitoring van je uptime', primary: true },
      { label: 'Support via e-mail, telefoon en WhatsApp', primary: true },
      { label: 'Jaarlijkse Core Web Vitals check' },
    ],
  },
  {
    slug: 'standard-care',
    name: 'Standard Care Package',
    shortName: 'Standard Care',
    tagline: 'Voor websites die klanten of aanvragen opleveren.',
    monthlyPrice: 39,
    yearlyPrice: 36 * 12, // €432/jaar = €36/m
    isFeatured: true,
    summary: 'Alles uit Basic Care',
    features: [
      { label: 'Premium plug-inlicenties t.w.v. €350+/jaar', highlight: true, primary: true, detail: 'o.a. Elementor Pro, WP Rocket, Gravity Forms en ACF Pro' },
      { label: 'Dagelijkse backups', primary: true },
      { label: 'Dagelijkse beveiligingsscan op kwetsbaarheden', primary: true },
      { label: 'Snelheidsoptimalisatie', primary: true },
      { label: 'SEO-posities bijhouden tot 10 zoekwoorden', primary: true },
      { label: 'Webhosting inbegrepen (indien gewenst)', primary: true },
      { label: 'Wekelijkse updates met restore-point' },
      { label: 'Uitgebreide spambescherming' },
      { label: '24/7 monitoring van je uptime' },
      { label: 'Maandelijkse Core Web Vitals check' },
      { label: 'Databaseoptimalisatie per kwartaal' },
      { label: 'Support via e-mail, telefoon en WhatsApp' },
      { label: 'Maandrapport' },
    ],
  },
  {
    slug: 'pro-care',
    name: 'Pro Care Package',
    shortName: 'Pro Care',
    tagline: 'Voor webshops en bedrijfskritische websites.',
    monthlyPrice: 59,
    yearlyPrice: 54 * 12, // €648/jaar = €54/m
    summary: 'Alles uit Standard Care',
    features: [
      { label: 'Dagelijkse backups (30 dagen retentie)', primary: true },
      { label: 'Doorlopende snelheids- en afbeeldingsoptimalisatie', primary: true },
      { label: 'Databaseoptimalisatie elke maand', primary: true },
      { label: 'SEO-posities bijhouden tot 100 zoekwoorden', primary: true },
      { label: 'Kapotte links monitoren', primary: true },
      { label: 'Support via e-mail, telefoon en WhatsApp (voorrang)', primary: true },
      { label: 'Premium plug-inlicenties t.w.v. €350+/jaar', highlight: true, detail: 'o.a. Elementor Pro, WP Rocket, Gravity Forms en ACF Pro' },
      { label: 'Wekelijkse updates met restore-point' },
      { label: 'Dagelijkse beveiligingsscan op kwetsbaarheden' },
      { label: 'Uitgebreide spambescherming' },
      { label: '24/7 monitoring van je uptime' },
      { label: 'Maandelijkse Core Web Vitals check' },
      { label: 'Webhosting inbegrepen (indien gewenst)' },
      { label: 'Maandrapport' },
    ],
  },
];

/* Custom-strip onder de pakketten. */
export const maintenanceCustom = {
  title: 'Andere wensen?',
  body: 'Multi-site, WooCommerce, een eigen VPS of white-label voor reseller-pakketten? Dat doen we op maat. Vraag een offerte aan en we kijken naar wat past bij jouw situatie.',
  ctaLabel: 'Vraag een offerte aan ↗',
  ctaHref: '/contact/',
};

/* Voor de "wat zijn kleine reparaties" FAQ-uitleg — herbruikt over pagina's. */
export const repairScopeFaq = {
  q: 'Wat valt er onder "kleine reparaties"?',
  a: 'Snelle fixes van technische problemen op je site, bijvoorbeeld: een plugin die het na een update niet meer doet, een formulier dat geen mail meer verstuurt, een weergavefout op een pagina, een afbeelding die niet meer laadt of een onverwachte foutmelding. Niet inbegrepen zijn aanpassingen of uitbreidingen van je site, zoals nieuwe pagina\'s, ontwerpaanpassingen, nieuwe functionaliteit, content bijwerken, SEO-werk of migraties. Voor dat soort werk geldt ons meerwerktarief, met €10/uur korting voor pakketklanten.',
};
