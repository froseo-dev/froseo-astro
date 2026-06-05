/**
 * POST /api/scan-request — verwerkt scan-aanvragen vanuit de ScanPopup.
 *
 * Maakt (of update) een contact in Brevo lijst 18 "Froseo Leads" met:
 *   - Custom attributes: SCAN_TYPE, SCAN_KEYWORDS, SCAN_PLAATS, LEAD_BRON,
 *     BEDRIJFSNAAM, WEBSITE, TAG (comma-separated tag-string)
 *   - List membership: [18] = "Froseo Leads"
 *
 * Vereiste env-var (Cloudflare Pages → Settings → Environment variables):
 *   BREVO_API_KEY — Brevo REST API key (xkeysib-...). Genereer in
 *                   Brevo dashboard → Account → SMTP & API → API Keys.
 *                   Gebruik NIET de MCP-token (die begint met eyJ).
 *
 * Spam-protectie: honeypot-veld `honeypot` (de input heet website_url_check
 * in het form — verborgen voor mensen).
 */

interface Env {
  BREVO_API_KEY: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

interface ScanPayload {
  /** Array van gekozen scan-types (1 of meer). Multi-select in het form. */
  scanTypes?: string[];
  website?: string;
  bedrijfsnaam?: string;
  keywords?: string[];
  email?: string;
  leadBron?: string;
  honeypot?: string;
}

const FROSEO_LEADS_LIST_ID = 18;
const VALID_SCAN_TYPES = ['snelheid', 'seo', 'lokaal'] as const;

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* Maak een net "bron"-tag van het pad waar de scan vandaan kwam.
   "/lokale-seo/" → "lokale-seo"  ·  "/" → "homepage"  ·  "/tools/woordenteller/" → "tools-woordenteller". */
const pathToTag = (path: string): string => {
  const clean = (path || '/').replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return 'homepage';
  return clean.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').slice(0, 60);
};

export const onRequestPost = async ({ request, env }: RequestContext) => {
  if (!env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is niet ingesteld in Cloudflare env');
    return json({ error: 'Server-configuratie ontbreekt. Mail ons direct op info@froseo.nl.' }, 500);
  }

  let payload: ScanPayload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Ongeldige aanvraag.' }, 400);
  }

  /* Honeypot — als bots dit veld vullen weigeren we stil. */
  if (payload.honeypot && payload.honeypot.length > 0) {
    return json({ error: 'Je aanvraag kon niet worden verwerkt. Probeer het opnieuw.' }, 422);
  }

  /* Validatie — minimaal 1 type, alleen geldige waardes. */
  const incoming = Array.isArray(payload.scanTypes) ? payload.scanTypes : [];
  const scanTypes = Array.from(new Set(
    incoming.map((t) => String(t || '').toLowerCase().trim())
            .filter((t) => VALID_SCAN_TYPES.includes(t as any)),
  ));
  if (scanTypes.length === 0) {
    return json({ error: 'Kies minimaal één scan.' }, 400);
  }
  const email = String(payload.email || '').trim();
  if (!isEmail(email)) {
    return json({ error: 'Vul een geldig e-mailadres in.' }, 400);
  }
  const website = String(payload.website || '').trim();
  if (!website) {
    return json({ error: 'Vul je website in.' }, 400);
  }
  if (scanTypes.includes('lokaal') && !payload.bedrijfsnaam) {
    return json({ error: 'Voor de lokale scan hebben we je bedrijfsnaam nodig.' }, 400);
  }

  /* Tags — comma-separated string opslaan in het TAG-attribuut.
     `scan-<type>` voor elk gekozen type, plus `lead-scan` + `bron-<pagina>`.
     Alle scan-aanvragers gaan in de marketing-flow (impliciete consent door
     verzenden, disclaimer staat onder de submit-knop). */
  const bronSlug = pathToTag(payload.leadBron || '/');
  const tagList = ['lead-scan', ...scanTypes.map((t) => `scan-${t}`), `bron-${bronSlug}`];

  /* Zoekwoorden samenvoegen — Brevo-attributes zijn text, dus comma-separated. */
  const keywords = Array.isArray(payload.keywords)
    ? payload.keywords.map((k) => String(k || '').trim()).filter(Boolean).slice(0, 3)
    : [];

  const attributes: Record<string, string | boolean> = {
    /* Meerdere types worden comma-separated opgeslagen (bv. "snelheid,seo"). */
    SCAN_TYPE: scanTypes.join(','),
    WEBSITE: website,
    LEAD_BRON: payload.leadBron || '/',
    TAG: tagList.join(','),
    /* Iedereen die de scan aanvraagt komt in de marketing-flow (impliciete
       consent door verzenden + disclaimer onder de submit-knop). */
    OPT_IN: true,
  };
  if (keywords.length) attributes.SCAN_KEYWORDS = keywords.join(', ');
  if (payload.bedrijfsnaam) attributes.BEDRIJFSNAAM = String(payload.bedrijfsnaam).trim();

  /* Brevo create-or-update contact */
  const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      email,
      attributes,
      listIds: [FROSEO_LEADS_LIST_ID],
      updateEnabled: true,
    }),
  });

  if (!brevoRes.ok) {
    const bodyText = await brevoRes.text();
    console.error('Brevo API error:', brevoRes.status, bodyText);
    return json({ error: 'Aanvraag kon niet worden opgeslagen. Probeer het opnieuw of mail ons direct op info@froseo.nl.' }, 502);
  }

  return json({ ok: true });
};
