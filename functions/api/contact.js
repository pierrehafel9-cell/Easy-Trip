// functions/api/contact.js
// Reçoit le formulaire de contact et envoie un email via Resend.

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const firstname = String(body.firstname || '').slice(0, 100).trim();
    const lastname = String(body.lastname || '').slice(0, 100).trim();
    const email = String(body.email || '').slice(0, 200).trim();
    const phone = String(body.phone || '').slice(0, 50).trim();
    const subject = String(body.subject || '').slice(0, 200).trim();
    const message = String(body.message || '').slice(0, 4000).trim();

    if (!firstname || !lastname || !email || !message) {
      return json({ error: 'Champs obligatoires manquants' }, 400);
    }

    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non défini — message de contact non envoyé');
      return json({ error: "Le service d'envoi n'est pas configuré" }, 500);
    }

    const FROM = env.EMAIL_FROM || 'Easy Trip <onboarding@resend.dev>';
    const ADMIN_EMAIL = env.NOTIFY_EMAIL || 'easytrip.kit@gmail.com';

    const emailSubject = `📩 Nouveau message de contact — ${firstname} ${lastname}`;
    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2222;line-height:1.6;">
        <h2 style="margin:0 0 16px;">Nouveau message via le formulaire de contact</h2>
        <p><strong>Nom :</strong> ${esc(firstname)} ${esc(lastname)}</p>
        <p><strong>Email :</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
        ${phone ? `<p><strong>Téléphone :</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
        ${subject ? `<p><strong>Sujet :</strong> ${esc(subject)}</p>` : ''}
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-wrap;background:#faf6ee;border:1px solid #e3dccb;border-radius:8px;padding:12px 16px;">${esc(message)}</p>
      </div>
    `;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: emailSubject,
        html,
        reply_to: email,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(data));

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[contact]', err);
    return json({ error: 'Erreur serveur' }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
