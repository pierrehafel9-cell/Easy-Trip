// functions/api/stripe-webhook.js
// Cloudflare Pages Function — reçoit les événements Stripe et envoie les emails de confirmation.
//
// Configuration Stripe :
//   Dashboard → Développeurs → Webhooks → Ajouter un endpoint
//   URL : https://easytripfrance.fr/api/stripe-webhook
//   Événements : checkout.session.completed, payment_intent.payment_failed, charge.refunded
//   Récupérer le "Signing secret" (whsec_...) → ajouter dans Cloudflare Pages env vars
//   sous le nom STRIPE_WEBHOOK_SECRET.

import Stripe from 'stripe';
import { clientEmail, adminEmail } from '../_emails.js';

export async function onRequestPost({ request, env }) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const sig = request.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET non défini');
    return new Response('Webhook secret non configuré', { status: 500 });
  }

  const body = await request.text();
  let stripeEvent;
  try {
    // On Cloudflare Workers, must use the async version (Web Crypto)
    stripeEvent = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object;
      console.log('✅ Réservation confirmée:', session.id, session.customer_email);
      await sendConfirmationEmails(session, env);
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

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sendConfirmationEmails(session, env) {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY non défini — emails non envoyés');
    return;
  }
  const FROM = env.EMAIL_FROM || 'Easy Trip <onboarding@resend.dev>';
  const ADMIN_EMAIL = env.NOTIFY_EMAIL || 'easytrip.kit@gmail.com';
  const SITE_URL = env.SITE_URL || 'https://easytripfrance.fr';

  // Email client
  if (session.customer_email) {
    const { subject, html } = clientEmail({ session, siteUrl: SITE_URL });
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: session.customer_email,
          subject,
          html,
          reply_to: ADMIN_EMAIL,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));
      console.log('📧 Email client envoyé:', data.id);
    } catch (e) {
      console.error('❌ Échec email client:', e.message);
    }
  }

  // Email admin
  try {
    const { subject, html } = adminEmail({ session, siteUrl: SITE_URL });
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: ADMIN_EMAIL,
        subject,
        html,
        reply_to: session.customer_email || undefined,
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(data));
    console.log('📧 Email admin envoyé:', data.id);
  } catch (e) {
    console.error('❌ Échec email admin:', e.message);
  }
}
