// functions/api/create-checkout-session.js
// Cloudflare Pages Function — crée une session Stripe Checkout.

import Stripe from 'stripe';

const CAUTION_EUR = 500;

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });
    const SITE_URL = env.SITE_URL || 'https://easytripfrance.fr';

    const payload = await request.json();
    const { dates = {}, customer = {}, vehicle = {}, options = [], pricing = {}, persons = 1 } = payload;

    if (!dates.start || !dates.end || !customer.email) {
      return json({ error: 'Champs obligatoires manquants' }, 400);
    }
    const baseTotal = Math.round((pricing.baseTotal || 0) * 100);
    if (baseTotal <= 0) {
      return json({ error: 'Montant de location invalide' }, 400);
    }

    const lineItems = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Kit Easy Trip — ${dates.nights} nuit${dates.nights > 1 ? 's' : ''}`,
            description: `Location du ${formatDate(dates.start)} au ${formatDate(dates.end)}`,
          },
          unit_amount: baseTotal,
        },
        quantity: 1,
      },
      ...options.map((o) => ({
        price_data: {
          currency: 'eur',
          product_data: { name: `Option : ${o.name}` },
          unit_amount: Math.round((o.price || 0) * 100),
        },
        quantity: 1,
      })),
    ];

    const metadata = {
      kit: payload.kit || 'Kit Easy Trip',
      dates_start: dates.start,
      dates_end: dates.end,
      nights: String(dates.nights || 0),
      low_nights: String(dates.low || 0),
      high_nights: String(dates.high || 0),
      persons: String(persons),
      customer_firstname: customer.firstname || '',
      customer_lastname: customer.lastname || '',
      customer_phone: customer.phone || '',
      vehicle: `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim(),
      options: options.map((o) => `${o.name} (${Math.round(o.price)}€)`).join(' | ').slice(0, 490),
      caution_eur: String(CAUTION_EUR),
      customer_message: (customer.message || '').slice(0, 490),
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer.email,
      customer_creation: 'always',
      locale: 'fr',
      line_items: lineItems,
      payment_intent_data: {
        setup_future_usage: 'off_session',
        receipt_email: customer.email,
        description: `Location Easy Trip ${dates.start} → ${dates.end}`,
        metadata,
      },
      metadata,
      success_url: `${SITE_URL}/reservation-confirmee.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/reservation.html`,
    });

    return json({ url: session.url, sessionId: session.id }, 200);
  } catch (err) {
    console.error('[create-checkout-session]', err);
    return json({ error: err.message || 'Erreur serveur' }, 500);
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
