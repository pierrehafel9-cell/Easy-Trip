// netlify/functions/stripe-webhook.js
// Reçoit les événements Stripe : confirme la résa, envoie email à Pierre.
//
// Configuration côté Stripe :
//   Dashboard → Développeurs → Webhooks → Ajouter un endpoint
//   URL : https://easytrip.netlify.app/.netlify/functions/stripe-webhook
//   Événements à écouter :
//     - checkout.session.completed
//     - charge.succeeded
//     - payment_intent.payment_failed
//     - charge.refunded
//   Stripe vous donne ensuite un "Signing secret" (whsec_...) à copier dans
//   la variable d'env Netlify STRIPE_WEBHOOK_SECRET.

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

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
      const m = session.metadata || {};
      console.log('✅ Nouvelle réservation confirmée:', {
        sessionId: session.id,
        email: session.customer_email,
        amount: session.amount_total,
        kit: m.kit,
        dates: `${m.dates_start} → ${m.dates_end}`,
        nights: m.nights,
        customer: `${m.customer_firstname} ${m.customer_lastname}`,
        phone: m.customer_phone,
        vehicle: m.vehicle,
        options: m.options,
      });
      // TODO Pierre : pour recevoir un email à chaque résa, brancher Resend / SendGrid ici.
      //   import { Resend } from 'resend';
      //   await new Resend(process.env.RESEND_API_KEY).emails.send({...});
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
      console.log('Événement Stripe reçu (non traité):', stripeEvent.type);
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
