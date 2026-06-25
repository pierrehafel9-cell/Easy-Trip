// functions/_emails.js
// Templates d'emails HTML pour Easy Trip (Cloudflare Pages Functions).

const BRAND = {
  ink: '#1f2222',
  cream: '#ece2d0',
  rust: '#c4452b',
  teal: '#2f8a8a',
  yellow: '#e8b820',
  bg: '#faf6ee',
  surface: '#ffffff',
  muted: '#7a7e7b',
  border: '#e3dccb',
};

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function fmtMoney(cents, currency = 'eur') {
  if (cents == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function row(label, value) {
  return `<tr><td style="padding:8px 0;font-size:13px;color:${BRAND.muted};font-weight:600;width:35%;vertical-align:top;">${label}</td><td style="padding:8px 0;font-size:14px;color:${BRAND.ink};vertical-align:top;">${value}</td></tr>`;
}
function wrap({ preheader, body, siteUrl }) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Easy Trip</title></head><body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.ink};"><div style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(preheader)}</div><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};padding:24px 12px;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${BRAND.surface};border-radius:12px;box-shadow:0 4px 16px rgba(31,34,34,0.08);overflow:hidden;"><tr><td style="background:${BRAND.ink};padding:24px;text-align:center;border-bottom:4px solid ${BRAND.rust};"><img src="${siteUrl}/assets/img/logo-email.png" alt="Easy Trip" style="height:48px;display:block;margin:0 auto;" /><p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;font-weight:600;color:${BRAND.cream};opacity:0.7;letter-spacing:3px;text-transform:uppercase;">Dors où tu veux quand tu veux</p></td></tr>${body}</table><p style="margin:16px 0 0;font-size:11px;color:${BRAND.muted};text-align:center;">Vous recevez cet email suite à une réservation sur easytrip.fr</p></td></tr></table></body></html>`;
}

export function clientEmail({ session, siteUrl }) {
  const m = session.metadata || {};
  const firstname = m.customer_firstname || '';
  const nights = parseInt(m.nights || '0', 10);
  const optionsList = (m.options || '').split(' | ').filter(Boolean)
    .map(o => `<li style="margin:0 0 4px 0;">${esc(o)}</li>`).join('');

  const subject = `Votre réservation Easy Trip est confirmée ✓`;
  const html = wrap({
    preheader: `Récap de votre location du ${fmtDate(m.dates_start)} au ${fmtDate(m.dates_end)}`,
    siteUrl,
    body: `
      <tr><td style="padding:32px 32px 8px;text-align:center;"><div style="display:inline-block;width:68px;height:68px;line-height:68px;border-radius:50%;background:${BRAND.teal};color:#fff;font-family:Georgia,serif;font-size:36px;font-weight:bold;">✓</div></td></tr>
      <tr><td style="padding:8px 32px 24px;text-align:center;"><h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 12px;color:${BRAND.ink};">Merci${firstname ? ', ' + esc(firstname) : ''} !</h1><p style="font-size:16px;color:${BRAND.ink};margin:0;">Votre réservation est confirmée.<br>On se retrouve bientôt pour votre aventure.</p></td></tr>
      <tr><td style="padding:0 32px 24px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;"><tr><td style="padding:20px 24px;"><p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:${BRAND.rust};text-transform:uppercase;">Récapitulatif</p>${row('Kit', m.kit || 'Kit Easy Trip')}${row('Dates', `${fmtDate(m.dates_start)} → ${fmtDate(m.dates_end)} <span style="color:${BRAND.muted};">(${nights} nuit${nights > 1 ? 's' : ''})</span>`)}${m.vehicle ? row('Véhicule', esc(m.vehicle)) : ''}${optionsList ? row('Options', `<ul style="margin:0;padding-left:18px;">${optionsList}</ul>`) : ''}<tr><td colspan="2" style="padding:12px 0 0;border-top:1px solid ${BRAND.border};"></td></tr>${row('Montant payé', `<strong style="color:${BRAND.rust};font-size:18px;font-family:Georgia,serif;">${fmtMoney(session.amount_total, session.currency)}</strong>`)}</td></tr></table></td></tr>
      <tr><td style="padding:0 32px 24px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fdf3ef;border-left:4px solid ${BRAND.rust};border-radius:8px;"><tr><td style="padding:18px 22px;"><p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${BRAND.ink};">🔒 La caution</p><p style="margin:0;font-size:13px;color:${BRAND.ink};line-height:1.6;">Le jour du retrait, une empreinte bancaire de <strong>500 €</strong> sera bloquée sur votre carte (sans débit). Le blocage est levé sous 72 h après le retour du kit en bon état.</p></td></tr></table></td></tr>
      <tr><td style="padding:0 32px 24px;"><h2 style="font-family:Georgia,serif;font-size:20px;margin:0 0 12px;color:${BRAND.ink};">Et maintenant ?</h2><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="padding:0 0 12px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;"><tr><td style="padding:14px 18px;font-size:14px;color:${BRAND.ink};line-height:1.5;">📍 <strong>Lieu de rendez-vous</strong> : vous serez contacté(e) très bientôt pour définir ensemble le point de rendez-vous selon vos besoins (secteur La Rochelle / Gratiot ou alentour ; Bordeaux / Arcachon sur demande).</td></tr></table></td></tr><tr><td style="padding:0 0 12px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;"><tr><td style="padding:14px 18px;font-size:14px;color:${BRAND.ink};line-height:1.5;">🪪 <strong>Le jour J</strong>, prévoyez votre pièce d'identité et votre permis de conduire (catégorie B). Comptez 30 min pour la prise en charge.</td></tr></table></td></tr></table></td></tr>
      <tr><td style="padding:8px 32px 32px;text-align:center;"><a href="${siteUrl}/comment-ca-marche.html" style="display:inline-block;background:${BRAND.rust};color:#fff;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;">Voir le mode d'emploi</a></td></tr>
      <tr><td style="padding:24px 32px;background:${BRAND.ink};color:${BRAND.cream};text-align:center;border-radius:0 0 12px 12px;"><p style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;font-weight:bold;">Easy Trip</p><p style="margin:0 0 14px;font-size:12px;opacity:0.8;">Les kits pour dormir où tu veux et quand tu veux.</p><p style="margin:0;font-size:13px;"><a href="mailto:easytrip.kit@gmail.com" style="color:${BRAND.yellow};text-decoration:none;">easytrip.kit@gmail.com</a> · <a href="tel:+33645044547" style="color:${BRAND.yellow};text-decoration:none;">+33 6 45 04 45 47</a></p></td></tr>
    `,
  });
  return { subject, html };
}

export function adminEmail({ session, siteUrl }) {
  const m = session.metadata || {};
  const nights = parseInt(m.nights || '0', 10);
  const subject = `🎉 Nouvelle réservation — ${m.customer_firstname || ''} ${m.customer_lastname || ''} (${fmtDate(m.dates_start)})`;
  const optionsList = (m.options || '').split(' | ').filter(Boolean);

  const html = wrap({
    preheader: `Paiement de ${fmtMoney(session.amount_total, session.currency)} reçu`,
    siteUrl,
    body: `
      <tr><td style="padding:32px 32px 16px;text-align:center;"><div style="display:inline-block;font-size:42px;">🎉</div><h1 style="font-family:Georgia,serif;font-size:24px;margin:8px 0 4px;color:${BRAND.ink};">Nouvelle réservation</h1><p style="margin:0;color:${BRAND.muted};font-size:14px;">Paiement reçu — à toi de jouer.</p></td></tr>
      <tr><td style="padding:0 32px 24px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;"><tr><td style="padding:20px 24px;"><p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:${BRAND.teal};text-transform:uppercase;">Client</p>${row('Nom', esc(`${m.customer_firstname || ''} ${m.customer_lastname || ''}`.trim()))}${row('Email', `<a href="mailto:${esc(session.customer_email)}" style="color:${BRAND.rust};">${esc(session.customer_email)}</a>`)}${m.customer_phone ? row('Téléphone', `<a href="tel:${esc(m.customer_phone)}" style="color:${BRAND.rust};">${esc(m.customer_phone)}</a>`) : ''}</td></tr></table></td></tr>
      <tr><td style="padding:0 32px 24px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;"><tr><td style="padding:20px 24px;"><p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:2px;color:${BRAND.teal};text-transform:uppercase;">Location</p>${row('Dates', `<strong>${fmtDate(m.dates_start)} → ${fmtDate(m.dates_end)}</strong> (${nights} nuit${nights > 1 ? 's' : ''})`)}${m.vehicle ? row('Véhicule', esc(m.vehicle)) : ''}${row('Montant', `<strong style="color:${BRAND.rust};font-size:16px;">${fmtMoney(session.amount_total, session.currency)}</strong>`)}${optionsList.length ? row('Options', optionsList.map(o => `<span style="display:inline-block;background:${BRAND.surface};border:1px solid ${BRAND.border};padding:3px 8px;border-radius:4px;font-size:12px;margin:0 4px 4px 0;">${esc(o)}</span>`).join('')) : ''}${m.customer_message ? row('Message', `<em style="color:${BRAND.ink};">"${esc(m.customer_message)}"</em>`) : ''}</td></tr></table></td></tr>
      <tr><td style="padding:0 32px 16px;"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff7e6;border-left:4px solid ${BRAND.yellow};border-radius:8px;"><tr><td style="padding:14px 18px;font-size:13px;color:${BRAND.ink};line-height:1.6;"><strong>À faire :</strong><br>1. Contacter le client rapidement pour définir le point de rendez-vous<br>2. Vérifier la compatibilité du véhicule si nécessaire<br>3. Le jour J : bloquer 500 € de caution via Stripe Dashboard</td></tr></table></td></tr>
      <tr><td style="padding:8px 32px 32px;text-align:center;"><a href="https://dashboard.stripe.com/payments/${session.payment_intent}" style="display:inline-block;background:${BRAND.ink};color:#fff;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;">Ouvrir dans Stripe</a></td></tr>
    `,
  });
  return { subject, html };
}
