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

  /* Spam: honeypot moet leeg zijn (verborgen veld). */
  const honeypot = (data.get('website_url') ?? '').toString();
  if (honeypot) return json({ ok: true }, 200); // silent succeed for bots

  /* Spam: form moet minimaal 2 sec open zijn (form-render-tijd in ms). */
  const startedAt = Number(data.get('form_started_at') ?? 0);
  if (startedAt && Date.now() - startedAt < 2000) {
    return json({ ok: true }, 200); // silent succeed for too-fast bots
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

  const html = `
    <h2>Nieuw bericht via froseo.nl</h2>
    <table cellpadding="6" style="font-family: system-ui, sans-serif; font-size: 14px; border-collapse: collapse;">
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
      subject: `Nieuw bericht van ${name}`,
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
