// functions/api/planning.js
// Cloudflare Pages Function — liste les réservations payées (sessions Stripe complétées)
// pour alimenter le planning interne. Réservé à l'admin : protégé par ADMIN_TOOL_SECRET.

import Stripe from 'stripe';

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestGet({ request, env }) {
  try {
    if (!env.ADMIN_TOOL_SECRET) {
      return json({ error: "ADMIN_TOOL_SECRET non configuré sur Cloudflare" }, 500);
    }
    const providedSecret = request.headers.get('x-admin-secret') || '';
    if (providedSecret !== env.ADMIN_TOOL_SECRET) {
      return json({ error: 'Non autorisé' }, 401);
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const reservations = [];
    let startingAfter;
    for (let page = 0; page < 10; page++) {
      const list = await stripe.checkout.sessions.list({
        limit: 100,
        expand: ['data.payment_intent.latest_charge'],
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });

      for (const session of list.data) {
        if (session.mode !== 'payment') continue;
        if (session.payment_status !== 'paid') continue;
        const pi = session.payment_intent;
        const amountRefunded = pi?.latest_charge?.amount_refunded ?? 0;
        if (pi && amountRefunded >= pi.amount) continue; // entièrement remboursée : date libérée
        const m = session.metadata || {};
        if (!m.dates_start || !m.dates_end) continue;
        reservations.push({
          id: session.id,
          start: m.dates_start,
          end: m.dates_end,
          nights: m.nights || '',
          firstname: m.customer_firstname || '',
          lastname: m.customer_lastname || '',
          email: session.customer_email || '',
          phone: m.customer_phone || '',
          createdAt: session.created,
          status: session.status,
        });
      }

      if (!list.has_more) break;
      startingAfter = list.data[list.data.length - 1].id;
    }

    reservations.sort((a, b) => a.start.localeCompare(b.start));

    return json({ reservations }, 200);
  } catch (err) {
    console.error('[planning]', err);
    return json({ error: err.message || 'Erreur serveur' }, 500);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-secret',
  };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
