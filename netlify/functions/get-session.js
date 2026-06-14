// netlify/functions/get-session.js
// Récupère les détails d'une session Stripe pour la page de confirmation.

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

exports.handler = async (event) => {
  try {
    const sessionId = event.queryStringParameters?.session_id;
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'session_id invalide' }) };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: session.status,
        paymentStatus: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
        email: session.customer_email,
        metadata: session.metadata,
      }),
    };
  } catch (err) {
    console.error('[get-session]', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
