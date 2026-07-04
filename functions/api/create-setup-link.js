// functions/api/create-setup-link.js
// Cloudflare Pages Function — génère un lien Stripe "Setup" (enregistrement de carte, 0 € débité, 0 frais)
// pour un client existant. Réservé à l'admin : protégé par ADMIN_TOOL_SECRET.

import Stripe from 'stripe';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.ADMIN_TOOL_SECRET) {
      return json({ error: "ADMIN_TOOL_SECRET non configuré sur Cloudflare" }, 500);
    }
    const providedSecret = request.headers.get('x-admin-secret') || '';
    if (providedSecret !== env.ADMIN_TOOL_SECRET) {
      return json({ error: 'Non autorisé' }, 401);
    }

    const { email } = await request.json();
    if (!email) {
      return json({ error: 'Email requis' }, 400);
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });
    const SITE_URL = env.SITE_URL || 'https://easytripfrance.fr';

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer = customers.data[0];
    if (!customer) {
      customer = await stripe.customers.create({ email });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customer.id,
      payment_method_types: ['card'],
      locale: 'fr',
      success_url: `${SITE_URL}/carte-enregistree.html`,
      cancel_url: `${SITE_URL}/carte-enregistree.html?annule=1`,
    });

    return json({ url: session.url, customerId: customer.id }, 200);
  } catch (err) {
    console.error('[create-setup-link]', err);
    return json({ error: err.message || 'Erreur serveur' }, 500);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
  };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
