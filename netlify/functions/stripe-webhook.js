// netlify/functions/stripe-webhook.js
// Reçoit les événements Stripe et envoie les emails de confirmation.
//
// Configuration Stripe :
//   Dashboard → Développeurs → Webhooks → Ajouter un endpoint
//   URL : https://easytrip.netlify.app/.netlify/functions/stripe-webhook
//   Événements à écouter :
//     - checkout.session.completed
//     - payment_intent.payment_failed
//     - charge.refunded
//   Récupérer le "Signing secret" (whsec_...) → ajouter dans Netlify env vars
//   sous le nom STRIPE_WEBHOOK_SECRET.

const Stripe = require('stripe');
const { Resend } = require('resend');
const { clientEmail, adminEmail } = require('./_emails');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const FROM = process.env.EMAIL_FROM || 'Easy Trip <onboarding@resend.dev>';
const ADMIN_EMAIL = process.env.NOTIFY_EMAIL || 'easytrip.kit@gmail.com';

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  if (!sig) return { statusCode: 400, body: 'Missing signature' };
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET non défini');
    return { statusCode: 500, body: 'Webhook secret non configuré' };
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object;
      console.log('✅ Réservation confirmée:', session.id, session.customer_email);
      await sendConfirmationEmails(session);
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = stripeEvent.data.object;
      console.warn('❌ Paiement échoué:', pi.id, pi.last_payment_error?.message);
      break;
    }
    case 'charge.refunded': {
      const charge = stripeEvent.data.object;
      console.log('💸 Remboursement effectué:', charge.id, charge.amount_refunded);
      break;
    }
    default:
      console.log('Événement Stripe non traité:', stripeEvent.type);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

async function sendConfirmationEmails(session) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non défini — emails non envoyés');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Email client (récap)
  if (session.customer_email) {
    const { subject, html } = clientEmail({ session });
    try {
      const r = await resend.emails.send({
        from: FROM,
        to: session.customer_email,
        subject,
        html,
        replyTo: ADMIN_EMAIL,
      });
      console.log('📧 Email client envoyé:', r.data?.id || r.id);
    } catch (e) {
      console.error('❌ Échec email client:', e.message);
    }
  }

  // Email à Pierre (notification)
  try {
    const { subject, html } = adminEmail({ session });
    const r = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject,
      html,
      replyTo: session.customer_email || undefined,
    });
    console.log('📧 Email admin envoyé:', r.data?.id || r.id);
  } catch (e) {
    console.error('❌ Échec email admin:', e.message);
  }
}
