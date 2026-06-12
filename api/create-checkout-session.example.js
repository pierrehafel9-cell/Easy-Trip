/**
 * Exemple d'endpoint Stripe Checkout pour Easy Trip
 * ---------------------------------------------------
 * À déployer comme fonction serverless (Netlify Functions, Vercel,
 * Cloudflare Workers...). Le formulaire de réservation poste sur
 * `/api/create-checkout-session` et attend une réponse `{ url: "..." }`.
 *
 * 1) Renommez ce fichier en `create-checkout-session.js`
 * 2) Installez Stripe : `npm install stripe`
 * 3) Ajoutez la variable d'env STRIPE_SECRET_KEY (sk_live_... ou sk_test_...)
 *
 * Exemple Netlify Functions : placer le fichier dans `netlify/functions/`
 * Exemple Vercel : placer dans `api/create-checkout-session.js`
 */

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Adaptez selon votre hébergeur (Netlify utilise event.body, Vercel req.body, etc.)
exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body || '{}');
    const { dates, customer, options = [], pricing = {} } = payload;

    const lineItems = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Easy Trip — Kit M SUV/Break (${dates.nights} nuit${dates.nights > 1 ? 's' : ''})`,
            description: `Du ${dates.start} au ${dates.end}`,
          },
          unit_amount: Math.round((pricing.baseTotal || 0) * 100),
        },
        quantity: 1,
      },
      ...options.map(o => ({
        price_data: {
          currency: 'eur',
          product_data: { name: `Option : ${o.name}` },
          unit_amount: Math.round(o.price * 100),
        },
        quantity: 1,
      })),
    ];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer?.email,
      line_items: lineItems,
      metadata: {
        kit: payload.kit || 'Kit M',
        dates_start: dates.start,
        dates_end: dates.end,
        nights: String(dates.nights),
        firstname: customer?.firstname || '',
        lastname: customer?.lastname || '',
        phone: customer?.phone || '',
        caution_eur: String(pricing.caution || 800),
      },
      success_url: `${process.env.SITE_URL}/reservation-confirmee.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/reservation.html`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
