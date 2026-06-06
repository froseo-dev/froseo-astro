/**
 * POST /api/scan-request — verwerkt scan-aanvragen vanuit de ScanPopup.
 *
 * Doet twee dingen:
 *   1. Stuurt een notificatie-mail naar Calvin (CONTACT_TO_EMAIL) met alle
 *      ingevulde velden, zodat hij direct weet dat er een aanvraag binnen is
 *      (zelfde patroon als /api/contact). Reply-to = aanvrager-email.
 *   2. Maakt (of update) een contact in Brevo lijst 18 "Froseo Leads" met
 *      custom attributes (SCAN_TYPE, SCAN_KEYWORDS, LEAD_BRON, BEDRIJFSNAAM,
 *      WEBSITE, TAG) zodat het in de marketing-flow komt.
 *
 * De mail gaat eerst — als Brevo faalt heeft Calvin de aanvraag toch al
 * binnen in z'n mailbox.
 *
 * Vereiste env-vars (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY     — Resend API-key (re_...) voor de notificatie-mail
 *   CONTACT_TO_EMAIL   — adres dat de notificatie ontvangt (bv. info@froseo.nl)
 *   CONTACT_FROM_EMAIL — afzender (geverifieerd Resend-domein, bv. noreply@froseo.nl)
 *   BREVO_API_KEY      — Brevo REST API key (xkeysib-...) voor de lead-list.
 *                        NIET de MCP-token (die begint met eyJ).
 *
 * Spam-protectie: honeypot-veld `honeypot` (de input heet website_url_check
 * in het form — verborgen voor mensen) + min-time-on-popup client-side.
 */

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
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

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

/* Maak een net "bron"-tag van het pad waar de scan vandaan kwam.
   "/lokale-seo/" → "lokale-seo"  ·  "/" → "homepage"  ·  "/tools/woordenteller/" → "tools-woordenteller". */
const pathToTag = (path: string): string => {
  const clean = (path || '/').replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return 'homepage';
  return clean.replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').slice(0, 60);
};

export const onRequestPost = async ({ request, env }: RequestContext) => {
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

  /* ─────────────────────────────────────────────────────────────────
     STAP 1 — Notificatie-mail naar Calvin via Resend.
     Gebeurt eerst zodat Calvin de aanvraag sowieso binnen krijgt, ook
     als Brevo om wat voor reden faalt.
     ───────────────────────────────────────────────────────────────── */
  const scanTypeLabels: Record<string, string> = {
    snelheid: 'Snelheid & techniek',
    seo: 'SEO',
    lokaal: 'Lokale zichtbaarheid',
  };
  const typeLabelHtml = scanTypes.map((t) => escapeHtml(scanTypeLabels[t] || t)).join(', ');
  const kwHtml = keywords.length ? keywords.map((k) => escapeHtml(k)).join(', ') : '<em style="color:#888">— niet opgegeven —</em>';
  const bedrijfsnaam = String(payload.bedrijfsnaam || '').trim();
  const leadBronPath = payload.leadBron || '/';

  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL && env.CONTACT_FROM_EMAIL) {
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0A0A14;max-width:560px">
        <h2 style="font-family:'Outfit',sans-serif;font-size:20px;margin:0 0 16px">Nieuwe scan-aanvraag</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#54506A;width:140px;vertical-align:top">Type(s) scan</td><td style="padding:8px 0;font-weight:600">${typeLabelHtml}</td></tr>
          <tr><td style="padding:8px 0;color:#54506A;vertical-align:top">Website</td><td style="padding:8px 0"><a href="${escapeHtml(website)}" style="color:#6901AA">${escapeHtml(website)}</a></td></tr>
          ${bedrijfsnaam ? `<tr><td style="padding:8px 0;color:#54506A;vertical-align:top">Bedrijfsnaam</td><td style="padding:8px 0">${escapeHtml(bedrijfsnaam)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#54506A;vertical-align:top">Zoekwoorden</td><td style="padding:8px 0">${kwHtml}</td></tr>
          <tr><td style="padding:8px 0;color:#54506A;vertical-align:top">E-mail aanvrager</td><td style="padding:8px 0"><a href="mailto:${escapeHtml(email)}" style="color:#6901AA">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#54506A;vertical-align:top">Lead-bron</td><td style="padding:8px 0;font-family:monospace;font-size:12px">${escapeHtml(leadBronPath)}</td></tr>
        </table>
        <p style="margin-top:24px;padding-top:14px;border-top:1px solid #EAE3D2;font-size:12px;color:#54506A">
          Reply gaat direct naar de aanvrager. Het contact is ook aangemaakt in Brevo "Froseo Leads" (lijst 18) met tags voor segmentatie.
        </p>
      </div>
    `;

    const subject = `[SCAN] ${scanTypes.join(' + ')} — ${email}`;
    const mailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Froseo Website <${env.CONTACT_FROM_EMAIL}>`,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject,
        html,
      }),
    });
    if (!mailRes.ok) {
      console.error('Resend notification mail failed:', mailRes.status, await mailRes.text().catch(() => ''));
      /* We laten de aanvraag wel doorgaan naar Brevo. Mail-fail is geen blocker. */
    }
  } else {
    console.warn('Resend-env-vars ontbreken — notificatie-mail overgeslagen.');
  }

  /* ─────────────────────────────────────────────────────────────────
     STAP 2 — Contact opslaan in Brevo lijst 18 (Froseo Leads).
     ───────────────────────────────────────────────────────────────── */
  if (!env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is niet ingesteld in Cloudflare env');
    /* Notificatie-mail is wel verstuurd, dus de aanvraag gaat niet verloren. */
    return json({ ok: true, warning: 'lead-list-skip' });
  }

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
