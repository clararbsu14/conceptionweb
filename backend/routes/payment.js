const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { sendInvoiceEmail, sendBookingConfirmationEmail } = require('../services/emailService');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY missing — payment routes will fail until set in .env');
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

async function loadBookingForEmail(bookingId) {
  const [rows] = await db.query(
    `SELECT b.*, v.marque, v.modele, v.immatriculation, v.categorie, v.prix_jour,
            u.nom, u.prenom, u.email, u.telephone
     FROM bookings b
     LEFT JOIN vehicles v ON v.id = b.vehicle_id
     LEFT JOIN users u    ON u.id = b.client_id
     WHERE b.id = ?`,
    [bookingId]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    booking: {
      id: r.id, date_debut: r.date_debut, date_fin_prevue: r.date_fin_prevue,
      prix_total: r.prix_total, caution_percue: r.caution_percue ?? 0, statut: r.statut,
    },
    client: { nom: r.nom, prenom: r.prenom, email: r.email, telephone: r.telephone },
    vehicle: { marque: r.marque, modele: r.modele, immatriculation: r.immatriculation, categorie: r.categorie, prix_jour: r.prix_jour },
  };
}

// POST /api/payment/create-intent — create a PaymentIntent for a pending booking (public)
router.post('/create-intent', async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) return res.status(400).json({ message: 'booking_id requis' });

    const [rows] = await db.query(
      'SELECT id, prix_total, paiement_statut, stripe_payment_id FROM bookings WHERE id = ?',
      [booking_id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Réservation introuvable' });
    const booking = rows[0];

    if (booking.paiement_statut === 'paye') {
      return res.status(409).json({ message: 'Cette réservation est déjà payée.' });
    }

    const amountCents = Math.round(Number(booking.prix_total) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return res.status(400).json({ message: 'Montant invalide' });
    }

    // Restrict to card-only — no Link / Klarna / Apple Pay / Google Pay clutter
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: { booking_id: String(booking.id) },
    });

    await db.query('UPDATE bookings SET stripe_payment_id = ? WHERE id = ?', [intent.id, booking.id]);

    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (err) {
    console.error('POST /api/payment/create-intent error:', err);
    res.status(500).json({ message: err.message || 'Erreur Stripe' });
  }
});

// Stripe webhook handler — exported separately because index.js mounts it
// with express.raw(...) (signature verification needs the raw body bytes).
async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[stripe] webhook called but STRIPE_WEBHOOK_SECRET is missing');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[stripe] webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      const bookingId = Number(intent.metadata?.booking_id);
      if (!bookingId) {
        console.warn('[stripe] payment_intent.succeeded without booking_id metadata');
        return res.json({ received: true });
      }

      await db.query(
        `UPDATE bookings
         SET statut = 'confirmee', paiement_statut = 'paye', stripe_payment_id = ?
         WHERE id = ?`,
        [intent.id, bookingId]
      );

      const [bookingRows] = await db.query('SELECT vehicle_id FROM bookings WHERE id = ?', [bookingId]);
      if (bookingRows.length) {
        await db.query("UPDATE vehicles SET statut = 'loue' WHERE id = ?", [bookingRows[0].vehicle_id]);
      }

      console.log(`[stripe] payment succeeded for booking #${bookingId} (${intent.id})`);

      loadBookingForEmail(bookingId)
        .then(async data => {
          if (!data) return;
          const confirmOk = await sendBookingConfirmationEmail(data.booking, data.client, data.vehicle);
          const invoiceOk = await sendInvoiceEmail(data.booking, data.client, data.vehicle);
          console.log(`[email] booking #${bookingId} — confirmation: ${confirmOk ? 'OK' : 'FAIL'}, invoice: ${invoiceOk ? 'OK' : 'FAIL'}`);
        })
        .catch(err => console.error('[email] post-payment send failed:', err.message));
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      console.warn(`[stripe] payment failed for intent ${intent.id}: ${intent.last_payment_error?.message}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[stripe] webhook handler error:', err);
    res.status(500).send('Webhook handler error');
  }
}

// POST /api/payment/refund — admin refund
router.post('/refund', auth(['admin', 'gerant']), async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) return res.status(400).json({ message: 'booking_id requis' });

    const [rows] = await db.query(
      'SELECT stripe_payment_id, paiement_statut FROM bookings WHERE id = ?',
      [booking_id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Réservation introuvable' });

    const { stripe_payment_id, paiement_statut } = rows[0];
    if (!stripe_payment_id) return res.status(400).json({ message: 'Aucun paiement Stripe associé' });
    if (paiement_statut === 'rembourse') return res.status(409).json({ message: 'Déjà remboursé' });
    if (paiement_statut !== 'paye') return res.status(400).json({ message: 'Le paiement doit être payé pour être remboursé' });

    const refund = await stripe.refunds.create({ payment_intent: stripe_payment_id });

    await db.query(
      "UPDATE bookings SET paiement_statut = 'rembourse' WHERE id = ?",
      [booking_id]
    );

    res.json({ success: true, refund_id: refund.id, status: refund.status });
  } catch (err) {
    console.error('POST /api/payment/refund error:', err);
    res.status(500).json({ message: err.message || 'Erreur Stripe' });
  }
});

module.exports = router;
module.exports.webhookHandler = webhookHandler;
