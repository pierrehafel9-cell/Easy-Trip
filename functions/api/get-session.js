// functions/api/get-session.js
// Cloudflare Pages Function — récupère les détails d'une session pour la page de confirmation.

import Stripe from 'stripe';

export async function onRequestGet({ request, env }) {
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return new Response(JSON.stringify({ error: 'session_id invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    return new Response(JSON.stringify({
      status: session.status,
      paymentStatus: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      email: session.customer_email,
      metadata: session.metadata,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[get-session]', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
