# Bin cleaning booking website

A mobile-friendly booking form for 1–4 bins (including repeated colours) with weekday bin collection selection and Stripe Checkout subscriptions.

## Plans already configured
- Every 2 weeks: $10.00 per bin — `price_1UW8uKIjg1wP4x3iKkgxUdFz`
- Every 4 weeks: $12.50 per bin — `price_1UW8y5Ijg1wP4x3ixFiuiZkR`

Customers must choose the day bins are emptied (Monday–Friday); this choice is saved in Stripe checkout and subscription metadata. It is not an automatic cleaning appointment.

The Stripe Price IDs need to belong to the same Stripe account AND match the subscription frequency, currency and prices displayed in the form. Check these in your Stripe dashboard before going live.

## Preview without payments
Open `public/index.html` in a browser. The form and live price calculation work, but the payment button will not work from a file preview.

## Run online with Stripe
1. On a Node.js hosting provider (such as Render), create a web service from this folder/repository.
2. Build command: `npm install`; start command: `npm start`.
3. Set private environment variables `STRIPE_SECRET_KEY` and `PUBLIC_BASE_URL` (the public HTTPS URL, e.g. https://my-bin-cleaning-site.example). NEVER put a secret API key in frontend files.
4. Use a Stripe **live** secret key if the configured prices are live-mode IDs. Test-mode and live-mode IDs are not interchangeable.
5. Visit the site and run a complete test checkout. Check the collected booking information in Stripe Dashboard > Payments / Subscriptions metadata.
6. Add a privacy policy, subscription cancellation policy, accurate business name and contact details before inviting customers. Confirm coverage area, first booking dates, any cancellation terms and local taxes.

**Important:** The sample page says 'Fresh Bins' as a temporary brand label; replace with your real business name and approved contact details before launch. This implementation creates a Stripe subscription and stores booking details in metadata but does not schedule bin-cleaning visits, send your own confirmation email, or automate cancellation/customer service. Stripe’s customer-facing receipts depend on your Stripe settings. Do not treat returning to the success page by itself as proof of payment; use Stripe dashboard or verified webhooks to check payment status.

## Security
Stripe Checkout securely collects payment data and customer billing information. The application server validates bin selection and frequency before constructing checkout; the client cannot choose a Stripe Price ID or set a price.
