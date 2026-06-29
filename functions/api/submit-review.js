// functions/api/submit-review.js
// Reçoit un avis client depuis le site et l'envoie par email pour validation manuelle.
// Aucun avis n'apparaît automatiquement sur le site : l'avis est ajouté à la main
// dans assets/data/reviews.json après validation.

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const name = String(body.name || '').slice(0, 80).trim();
    const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5));
    const message = String(body.message || '').slice(0, 1000).trim();

    if (!name || !message) {
      return json({ error: 'Champs obligatoires manquants' }, 400);
    }

    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non défini — avis non envoyé');
      return json({ error: "Le service d'envoi n'est pas configuré" }, 500);
    }

    const FROM = env.EMAIL_FROM || 'Easy Trip <onboarding@resend.dev>';
    const ADMIN_EMAIL = env.NOTIFY_EMAIL || 'easytrip.kit@gmail.com';

    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const emailSubject = `⭐ Nouvel avis client à valider — ${name} (${rating}/5)`;
    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2222;line-height:1.6;">
        <h2 style="margin:0 0 16px;">Nouvel avis client en attente de validation</h2>
        <p><strong>Nom :</strong> ${esc(name)}</p>
        <p><strong>Note :</strong> ${stars} (${rating}/5)</p>
        <p><strong>Avis :</strong></p>
        <p style="white-space:pre-wrap;background:#faf6ee;border:1px solid #e3dccb;border-radius:8px;padding:12px 16px;">${esc(message)}</p>
        <p style="margin-top:20px;color:#7a7e7b;font-size:12px;">Cet avis n'apparaît pas encore sur le site. Pour le publier, il faut l'ajouter à la main dans assets/data/reviews.json.</p>
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
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(data));

    return json({ ok: true }, 200);
  } catch (err) {
    console.error('[submit-review]', err);
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
