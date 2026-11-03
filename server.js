import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRICE_IDS = {
  fortnightly: process.env.STRIPE_PRICE_2_WEEKS,
  fourWeekly: process.env.STRIPE_PRICE_4_WEEKS
};
const ALLOWED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ALLOWED_BINS = ['Red bin', 'Yellow bin', 'Green bin', 'Other bin'];
app.use(express.json({ limit: '15kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/checkout', async (req, res) => {
  try {
    const { name, email, phone, address, suburb, postcode, frequency, bins, binCollectionDay, notes } = req.body || {};
    if (!process.env.STRIPE_SECRET_KEY || !process.env.PUBLIC_BASE_URL) return res.status(503).json({ error: 'Payments are not connected yet. Add STRIPE_SECRET_KEY and PUBLIC_BASE_URL on the server.' });
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100 ||
        typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150 ||
        typeof phone !== 'string' || !/^[+\d\s()\-]{8,25}$/.test(phone) ||
        typeof address !== 'string' || address.trim().length < 4 || address.length > 150 ||
        typeof suburb !== 'string' || suburb.trim().length < 2 || suburb.length > 80 ||
        typeof postcode !== 'string' || !/^\d{4}$/.test(postcode) ||
        !ALLOWED_DAYS.includes(binCollectionDay) || !Object.hasOwn(PRICE_IDS, frequency) || !Array.isArray(bins) || bins.length < 1 || bins.length > 4 ||
        !bins.every(b => ALLOWED_BINS.includes(b)) ||
        (notes && (typeof notes !== 'string' || notes.length > 500))) {
      return res.status(400).json({ error: 'Please check your details and bin selection.' });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = new URL(process.env.PUBLIC_BASE_URL);
    if (!['https:', 'http:'].includes(baseUrl.protocol)) throw new Error('Invalid PUBLIC_BASE_URL');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email.trim(),
      line_items: [{ price: PRICE_IDS[frequency], quantity: bins.length }],
      success_url: new URL('/success.html?session_id={CHECKOUT_SESSION_ID}', baseUrl).toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}'),
      cancel_url: new URL('/?cancelled=1', baseUrl).toString(),
      client_reference_id: undefined,
      subscription_data: {
        metadata: {
          customer_name: name.trim(), phone: phone.trim(), address: address.trim(), suburb: suburb.trim(), postcode,
          bins: bins.join(', '), frequency, bin_collection_day: binCollectionDay, notes: (notes || '').trim()
        }
      },
      metadata: { customer_name: name.trim(), phone: phone.trim(), address: address.trim(), suburb: suburb.trim(), postcode, bins: bins.join(', '), frequency, bin_collection_day: binCollectionDay, notes: (notes || '').trim() }
    });
    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Could not start checkout. Please try again or contact us.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Booking website ready');
});
