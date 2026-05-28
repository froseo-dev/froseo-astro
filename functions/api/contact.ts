/**
 * POST /api/contact — verwerkt contactformulier-submissions van /contact.
 *
 * Vereiste env-vars (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY     — Resend API-key (re_...). Vraag aan op resend.com.
 *   CONTACT_TO_EMAIL   — adres dat de mail ontvangt (bv. info@froseo.nl).
 *   CONTACT_FROM_EMAIL — afzender. Moet een geverifieerd domein zijn in Resend
 *                        (bv. noreply@froseo.nl). Reply-To wordt op de bezoeker
 *                        gezet zodat je direct kan antwoorden.
 *
 * Spam-protectie: honeypot-veld `website_url` (verborgen voor mensen, bots
 * vullen 't vaak in) + minimale tijd op pagina (>= 2 sec).
 */

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * Generieke afwijzing voor bot-/spamsignalen (honeypot, te-snel, content-filters).
 * Bewust generiek geformuleerd (verraadt niet wélk filter aansloeg) maar met een
 * fallback, zodat een eventuele false-positive bij een échte bezoeker niet stil
 * verdwijnt: die ziet een foutmelding en kan alsnog direct mailen.
 */
const rejected = () =>
  json({ error: 'Je bericht kon niet worden verstuurd. Probeer het opnieuw of mail ons direct op info@froseo.nl.' }, 422);

/**
 * Zoho CRM Web-to-Lead — server-side push naar de Leads-module.
 *
 * Deze identifiers zijn GEEN secrets: ze zijn ontworpen om in publieke
 * formulier-HTML te staan. We posten server-side (ná de spamfilters) zodat
 * er alleen schone leads in de CRM komen. De `LEADCF…`-codes komen 1-op-1 uit
 * het door Zoho gegenereerde webform (zie _reference/zoho-crm.md).
 */
const ZOHO = {
  endpoint: 'https://crm.zoho.eu/crm/WebToLeadForm',
  xnQsjsdp: '10375a70dc46d8d7f9ed7b28f85389c0c33d0377ac081f7a5efd1c80caa49cc2',
  xmIwtLD: '1f611ccce42008e872a429693e2e4380583708ca975e9468e91be68baee7385b873dd336d4f117d3acc575df7fe394f9',
  actionType: 'TGVhZHM=', // base64("Leads")
  fields: {
    formType: 'LEADCF10',
    serviceInterest: 'LEADCF9',
    utmSource: 'LEADCF3',
    utmMedium: 'LEADCF6',
    utmCampaign: 'LEADCF5',
    utmTerm: 'LEADCF8',
    gclid: 'LEADCF7',
    referrer: 'LEADCF1',
    landing: 'LEADCF4',
  },
} as const;

/** Leidt de Service-interest picklist-waarde af uit de onderwerp-context. */
const deriveServiceInterest = (formSource: string, onderwerp: string): string => {
  if (formSource === 'analyse') return 'Gratis analyse';
  const o = onderwerp.toLowerCase();
  /* NL + EN-termen: de Engelse servicebloks sturen Engelse onderwerp-labels mee
     (subscription/maintenance/optimization/web design), dus die herkennen we hier ook. */
  if (o.includes('abonnement') || o.includes('subscription')) return 'Website abonnement';
  if (o.includes('onderhoud') || o.includes('care') || o.includes('maintenance')) return 'Website onderhoud';
  if (o.includes('lokale') || o.includes('local')) return 'Local SEO';
  if (o.includes('seo')) return 'SEO';
  if (o.includes('content')) return 'Content abonnement';
  if (o.includes('optimalisatie') || o.includes('opfris') || o.includes('optimi')) return 'Website optimalisatie';
  if (o.includes('webdesign') || o.includes('wordpress') || o.includes('website') || o.includes('web design')) return 'WordPress website';
  return ''; // -None-
};

interface ZohoLead {
  lastName: string;
  email: string;
  phone: string;
  company: string;
  description: string;
  formType: string;
  serviceInterest: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  gclid: string;
  referrer: string;
  landing: string;
}

/**
 * POST de lead naar Zoho. Best-effort: faalt dit, dan loggen we het maar
 * laten we de bezoeker-response ongemoeid (de Resend-mail is de backup).
 */
async function pushToZohoLead(lead: ZohoLead): Promise<void> {
  const body = new URLSearchParams({
    xnQsjsdp: ZOHO.xnQsjsdp,
    xmIwtLD: ZOHO.xmIwtLD,
    actionType: ZOHO.actionType,
    returnURL: 'https://froseo.nl/',
    'Last Name': lead.lastName,
    Email: lead.email,
    Phone: lead.phone,
    Company: lead.company,
    Description: lead.description,
    [ZOHO.fields.formType]: lead.formType,
    [ZOHO.fields.serviceInterest]: lead.serviceInterest,
    [ZOHO.fields.utmSource]: lead.utmSource,
    [ZOHO.fields.utmMedium]: lead.utmMedium,
    [ZOHO.fields.utmCampaign]: lead.utmCampaign,
    [ZOHO.fields.utmTerm]: lead.utmTerm,
    [ZOHO.fields.gclid]: lead.gclid,
    [ZOHO.fields.referrer]: lead.referrer,
    [ZOHO.fields.landing]: lead.landing,
  });

  const res = await fetch(ZOHO.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Matcht de gewhiteliste "Form Location URL" in Zoho.
      Referer: 'https://froseo.nl/',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error('Zoho Web-to-Lead error', res.status, txt.slice(0, 300));
  }
}

export async function onRequestPost(ctx: RequestContext): Promise<Response> {
  const { request, env } = ctx;
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json({ error: 'Invalid form data' }, 400);
  }

  const name = (data.get('name') ?? '').toString().trim();
  const email = (data.get('email') ?? '').toString().trim();
  const phone = (data.get('phone') ?? '').toString().trim();
  const website = (data.get('current_website') ?? '').toString().trim();
  const message = (data.get('message') ?? '').toString().trim();
  /* Optioneel context-veld vanaf service-CTA's (?onderwerp=...). */
  const onderwerp = (data.get('onderwerp') ?? '').toString().trim().slice(0, 120);

  /* Welk formulier: 'analyse' (homepage-CTA) of 'contact'. Stuurt de
     Form Type / Service interest mapping richting Zoho. */
  const formSource = (data.get('form_source') ?? '').toString().trim();

  /* Taal van de afzender ('en' vanaf de Engelse pagina's). Additief: tagt de
     lead zonder de NL-flow te raken, zodat Calvin Engelstalige aanvragen ziet. */
  const lang = (data.get('lang') ?? '').toString().trim().toLowerCase();
  const isEnglish = lang === 'en';

  /* Attributie-velden, geïnjecteerd door het site-brede attributie-script. */
  const utmSource = (data.get('utm_source') ?? '').toString().trim().slice(0, 255);
  const utmMedium = (data.get('utm_medium') ?? '').toString().trim().slice(0, 255);
  const utmCampaign = (data.get('utm_campaign') ?? '').toString().trim().slice(0, 255);
  const utmTerm = (data.get('utm_term') ?? '').toString().trim().slice(0, 255);
  const gclid = (data.get('gclid') ?? '').toString().trim().slice(0, 255);
  const referrerUrl = (data.get('referrer_url') ?? '').toString().trim().slice(0, 450);
  const landingPage = (data.get('landing_page') ?? '').toString().trim().slice(0, 450);

  /* Spam: twee honeypots met onschuldige veldnamen. Bots vullen vaak alles
     wat plausibel klinkt zoals `website_url` of `subject`.
     LET OP: géén `company`-honeypot meer — dat verborgen veld werd door de
     browser-adres-autofill (organisatie) ingevuld bij échte bezoekers op het
     contactformulier, waardoor legitieme leads stil werden weggegooid. */
  const honeypot1 = (data.get('website_url') ?? '').toString();
  const honeypot2 = (data.get('subject') ?? '').toString();
  if (honeypot1 || honeypot2) {
    return rejected();
  }

  /* Spam: form moet minimaal 2 sec open zijn (form-render-tijd in ms). */
  const startedAt = Number(data.get('form_started_at') ?? 0);
  if (startedAt && Date.now() - startedAt < 2000) {
    return rejected();
  }

  /* Validatie: naam, e-mail en bericht verplicht. */
  if (!name || !email || !message) {
    return json({ error: 'Vul alle verplichte velden in.' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'E-mailadres lijkt niet juist.' }, 400);
  }
  if (message.length < 10) {
    return json({ error: 'Bericht is te kort.' }, 400);
  }

  /* Content-filters: SEO/marketing-spam herkennen aan patronen. Bij een
     match een nette foutmelding (rejected) i.p.v. nep-succes, zodat een
     eventuele false-positive bij een echte bezoeker niet stil verdwijnt. */

  /* 1. Te veel URLs in het bericht — 99% van legitieme aanvragen heeft
     er 0 of 1, spam-pitches hebben er meerdere. */
  const urlCount = (message.match(/https?:\/\/|www\./gi) || []).length;
  if (urlCount > 2) return rejected();

  /* 2. Cyrillisch of Chinees schrift — niet-Latijnse karakters wijzen
     op niet-Nederlandse afzender, vrijwel altijd spam voor onze markt. */
  if (/[Ѐ-ӿ一-鿿]/.test(message + name)) {
    return rejected();
  }

  /* 3. Veelvoorkomende spam-frases (case-insensitive). Houden we kort
     om false positives te voorkomen — alleen termen die in een
     legitieme webdesign/SEO-aanvraag niet voorkomen. */
  const spamPatterns = /\b(?:crypto|bitcoin|casino|viagra|forex|seo backlinks?|guest post(?:ing)?|link insertion|increase your ranking|low cost seo|cheap seo|outsourc(?:e|ing)|virtual assistant|loan offer|investment opportunity)\b/i;
  if (spamPatterns.test(message)) return rejected();

  /* 4. Email-domain mismatch — als afzender domain @gmail.com is maar
     'message' een ander business-domein pusht, vaak cold outreach. Niet
     blokkeren maar wel een lichte heuristiek: alleen 4+ external domains
     in message zonder context = spam. */
  const domains = new Set((message.match(/[a-z0-9-]+\.(?:com|net|org|io|co|info|biz|ru|cn|xyz)/gi) || []).map((d) => d.toLowerCase()));
  if (domains.size >= 4) return rejected();

  /* === Lead naar Zoho CRM (best-effort, blokkeert de response niet) ===
     Company + Last Name zijn verplicht in Zoho — vandaar de fallbacks. */
  try {
    await pushToZohoLead({
      lastName: name || 'Website lead',
      email,
      phone,
      company: website || 'Onbekend (via website)',
      description: isEnglish ? `${message}\n\n— Taal: Engels (via /en/)` : message,
      formType: formSource === 'analyse' ? 'Gratis analyse' : 'Contactformulier',
      serviceInterest: deriveServiceInterest(formSource, onderwerp),
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      gclid,
      referrer: referrerUrl,
      landing: landingPage,
    });
  } catch (err) {
    console.error('Zoho push faalde (lead valt terug op Resend-mail):', err);
  }

  const html = `
    <h2>Nieuw bericht via froseo.nl</h2>
    <table cellpadding="6" style="font-family: system-ui, sans-serif; font-size: 14px; border-collapse: collapse;">
      ${onderwerp ? `<tr><td><strong>Onderwerp</strong></td><td>${escapeHtml(onderwerp)}</td></tr>` : ''}
      <tr><td><strong>Naam</strong></td><td>${escapeHtml(name)}</td></tr>
      <tr><td><strong>E-mail</strong></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      ${phone ? `<tr><td><strong>Telefoon</strong></td><td>${escapeHtml(phone)}</td></tr>` : ''}
      ${website ? `<tr><td><strong>Huidige website</strong></td><td>${escapeHtml(website)}</td></tr>` : ''}
    </table>
    <h3 style="font-family: system-ui, sans-serif; margin-top: 20px;">Bericht</h3>
    <p style="font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(message)}</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Froseo Website <${env.CONTACT_FROM_EMAIL}>`,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `${isEnglish ? '[EN] ' : ''}${
        onderwerp ? `[${onderwerp}] Nieuw bericht van ${name}` : `Nieuw bericht van ${name}`
      }`,
      html,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    console.error('Resend API error', res.status, errorBody);
    return json({ error: 'Mail kon niet worden verstuurd. Probeer het later opnieuw.' }, 502);
  }

  return json({ ok: true });
}
