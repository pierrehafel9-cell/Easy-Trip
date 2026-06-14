// netlify/functions/create-checkout-session.js
// Crée une session Stripe Checkout pour la location.
// Le paiement de la location est encaissé immédiatement.
// La carte est sauvegardée (setup_future_usage) pour pouvoir débiter
// la caution ou les éventuels dégâts plus tard, sans nouvelle saisie du client.

const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

const SITE_URL = process.env.SITE_URL || 'https://zippy-daifuku-39c51c.netlify.app';
const CAUTION_EUR = 1200;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return cors({ statusCode: 204, body: '' });
  }
  if (event.httpMethod !== 'POST') {
    return cors({ statusCode: 405, body: 'Method not allowed' });
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { dates = {}, customer = {}, vehicle = {}, options = [], pricing = {}, persons = 1 } = payload;

    // Validation basique
    if (!dates.start || !dates.end || !customer.email) {
      return cors({ statusCode: 400, body: JSON.stringify({ error: 'Champs obligatoires manquants' }) });
    }

    const baseTotal = Math.round((pricing.baseTotal || 0) * 100);
    if (baseTotal <= 0) {
      return cors({ statusCode: 400, body: JSON.stringify({ error: 'Montant de location invalide' }) });
    }

    // Lignes du panier : la location + chaque option
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

    // Metadata : tout ce qu'il faut pour gérer la résa côté Easy Trip
    const metadata = {
      kit: payload.kit || 'Kit M — SUV / Break',
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
      locale: 'fr',
      line_items: lineItems,
      // Sauvegarde la carte pour pouvoir débiter la caution / les dégâts plus tard
      payment_intent_data: {
        setup_future_usage: 'off_session',
        receipt_email: customer.email,
        description: `Location Easy Trip ${dates.start} → ${dates.end}`,
        metadata,
      },
      metadata,
      success_url: `${SITE_URL}/reservation-confirmee.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/reservation.html`,
      // Note : la caution de 1200 € sera pré-autorisée le jour du début de la location
      // via une fonction séparée (create-deposit-hold.js), et libérée/capturée au retour.
    });

    return cors({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    });
  } catch (err) {
    console.error('[create-checkout-session]', err);
    return cors({
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Erreur serveur' }),
    });
  }
};

function cors(response) {
  return {
    ...response,
    headers: {
      ...(response.headers || {}),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  };
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
