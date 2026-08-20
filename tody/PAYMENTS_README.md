# Tody Payments System - Complete Guide

Tody uses **Stripe Connect Express** to handle secure, escrow-based payments between buyers and sellers with automatic payout management.

## System Overview

```
Buyer Payment Flow:
1. Buyer purchases item
2. Payment Intent created (5% platform fee calculated)
3. Buyer enters card details
4. Payment captured (funds on hold in escrow)
5. Buyer confirms receipt (or 24 hours pass)
6. Funds released to seller via Stripe Connect
7. Seller receives payout in 2-3 business days

Seller Onboarding:
1. Seller clicks "Get Paid"
2. Redirected to Stripe Express Onboarding
3. Completes KYC verification
4. Bank account connected
5. Ready to receive payouts
```

## Environment Setup

### 1. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your keys:
   - **Secret Key** (sk_...)
   - **Publishable Key** (pk_...)

### 2. Set Webhook Secret

1. Go to **Developers > Webhooks**
2. Create new endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `payout.paid`
   - `payout.failed`
4. Copy the **Signing Secret** (whsec_...)

### 3. Update Environment Variables

Create `.env.local` (or update existing):

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
STRIPE_ONBOARDING_RETURN_URL=https://yourdomain.com/seller/onboarding/success
```

## Architecture

### Database Schema

**orders** table - Tracks all transactions
```sql
id, listing_id, seller_id, buyer_id
quantity, price, platform_fee, seller_payout
status (pending→payment_intent→paid→confirmed→completed)
stripe_payment_intent_id, stripe_charge_id
created_at, payment_confirmed_at, buyer_confirmed_at, payout_completed_at
```

**escrow_holds** table - Tracks funds on hold
```sql
id, order_id, amount, charge_id
held_at, release_scheduled_at (NOW + 24h)
released_at, released_reason
```

**payouts** table - Tracks seller payouts
```sql
id, seller_id, order_id, amount
status (pending→in_transit→paid)
stripe_payout_id, scheduled_date, completed_date
```

**payment_events** table - Audit trail
```sql
id, order_id, event_type, stripe_event_id
status, amount, metadata (raw Stripe data)
```

**disputes** table - Buyer/seller disputes
```sql
id, order_id, initiated_by_id, reason
status (open→under_review→resolved), resolution
```

### Fee Structure

- **Platform Fee**: 5% of transaction amount
- **Stripe Processing**: ~2.9% + $0.30 (included in platform fee for simplicity)
- **Settlement Time**: 2-3 business days via Stripe Connect

**Example:**
```
Buyer pays: $100
Platform fee (5%): $5
Seller receives: $95 (after Stripe charges processed)
```

## Implementation Details

### File Structure

```
lib/
├── stripe.ts                    # Stripe config & utils
└── actions/
    └── stripe.ts                # Server actions for payments

app/
├── api/
│   └── stripe/
│       ├── webhooks/
│       │   └── route.ts         # Webhook handler
│       ├── onboard/
│       │   └── route.ts         # Seller onboarding
│       ├── checkout/
│       │   └── route.ts         # Create PaymentIntent
│       ├── confirm/
│       │   └── route.ts         # Confirm payment
│       └── capture/
│           └── route.ts         # Capture & release funds
```

### Key Functions

#### Seller Onboarding

```typescript
// Create Stripe Express account
async function createStripeExpressAccount(
  sellerId: string,
  email: string,
  returnUrl: string
)

// Check seller status
async function getSellerStripeStatus(sellerId: string)
```

#### Payment Processing

```typescript
// Create order & PaymentIntent
async function createOrder(
  listingId, sellerId, buyerId, price, quantity
)

async function createPaymentIntent(
  orderId, amount, sellerId, buyerId
)

// Confirm payment (escrow hold created)
async function confirmPayment(
  orderId, paymentIntentId
)

// Capture funds & release to seller
async function captureAndReleaseFunds(
  orderId,
  releaseReason: 'buyer_confirmed' | 'auto_release'
)

// Refund payment
async function refundPayment(orderId, reason)
```

#### Order Management

```typescript
async function getOrder(orderId)
async function getSellerOrders(sellerId, status?)
async function getBuyerOrders(buyerId, status?)
async function getPaymentEvents(orderId)
```

## Payment Flow

### 1. Seller Onboarding

```
User clicks "Get Paid" or in seller settings
↓
POST /api/stripe/onboard
  - Creates Stripe Express Account
  - Generates Onboarding Link
  - Saves stripe_account_id to database
↓
User redirected to Stripe Onboarding URL
↓
User completes KYC & bank setup
↓
Redirected back to application
↓
Seller is now able to receive payments
```

### 2. Checkout Process

```
Buyer clicks "Buy Now" on listing
↓
POST /api/stripe/checkout
  {
    listingId, sellerId, buyerId,
    priceInCents: 10000 ($100),
    quantity: 1
  }
↓
Creates order in database (status: pending)
↓
Creates Stripe PaymentIntent with:
  - capture_method: 'manual' (escrow)
  - application_fee_amount: 500 (5%)
  - transfer_data.destination: seller's Stripe account
↓
Returns: { orderId, clientSecret }
↓
Client-side: Use Stripe.js to confirm payment
↓
POST /api/stripe/confirm
  {
    orderId,
    paymentIntentId
  }
↓
Payment confirmed:
  - Order status: paid
  - Escrow hold created (24h release scheduled)
  - Notification sent to seller
```

### 3. Buyer Confirms Receipt (or Auto-Release)

**Option A: Buyer confirms receipt (immediate)**
```
Buyer opens order details
↓
Clicks "Confirm Receipt"
↓
POST /api/stripe/capture
  { orderId, reason: 'buyer_confirmed' }
↓
Funds captured from card
↓
Order status: completed
↓
Payout created (status: in_transit)
↓
Seller receives payout in 2-3 business days
```

**Option B: Auto-release after 24 hours**
```
Cron job runs every hour:
  - Find escrow_holds where release_scheduled_at < NOW
  - Call captureAndReleaseFunds with reason: 'auto_release'
  - Funds automatically captured & released
```

### 4. Dispute Handling

```
Buyer opens dispute within 24 hours
↓
POST /api/disputes/create
↓
Order status: disputed
↓
Escrow hold maintained
↓
Admin reviews dispute
↓
If buyer wins:
  - POST /api/stripe/refund
  - Funds refunded to buyer
↓
If seller wins:
  - POST /api/stripe/capture
  - Funds released to seller
```

## Webhook Events

The webhook endpoint (`/api/webhooks/stripe`) handles:

### 1. `payment_intent.succeeded`
- Confirms payment went through
- Creates escrow hold record
- Updates order status to 'paid'

### 2. `payment_intent.payment_failed`
- Records failed payment
- Updates order status to 'canceled'
- Notifies buyer

### 3. `charge.refunded`
- Records refund event
- Updates order status to 'refunded'
- Releases escrow hold

### 4. `payout.paid`
- Updates payout status to 'paid'
- Records completion timestamp

### 5. `payout.failed`
- Updates payout status to 'failed'
- Records failure reason
- Triggers retry/notification

## API Reference

### Seller Onboarding

**POST /api/stripe/onboard**
```json
{
  "sellerId": "user-id",
  "email": "seller@example.com",
  "returnUrl": "https://yourdomain.com/seller/dashboard"
}
```

Response:
```json
{
  "accountLink": "https://connect.stripe.com/onboarding/...",
  "message": "Redirect seller to this URL"
}
```

### Create Checkout

**POST /api/stripe/checkout**
```json
{
  "listingId": "listing-id",
  "sellerId": "seller-id",
  "buyerId": "buyer-id",
  "priceInCents": 10000,
  "quantity": 1
}
```

Response:
```json
{
  "orderId": "order-id",
  "clientSecret": "pi_..._secret_...",
  "publishableKey": "pk_live_...",
  "message": "Use clientSecret with Stripe.js"
}
```

### Confirm Payment

**POST /api/stripe/confirm**
```json
{
  "orderId": "order-id",
  "paymentIntentId": "pi_..."
}
```

Response:
```json
{
  "success": true,
  "message": "Payment confirmed. Funds in escrow for 24 hours.",
  "orderId": "order-id"
}
```

### Capture & Release Funds

**POST /api/stripe/capture**
```json
{
  "orderId": "order-id",
  "reason": "buyer_confirmed" // or "auto_release"
}
```

Response:
```json
{
  "success": true,
  "message": "Funds captured and released to seller",
  "orderId": "order-id"
}
```

## Security Features

✅ **Escrow Protection**: Funds held for 24 hours
✅ **Buyer Verification**: Buyer must confirm receipt (or auto-release)
✅ **Seller Verification**: KYC via Stripe Express
✅ **Webhook Signature Verification**: All webhooks validated
✅ **Secure Storage**: Sensitive IDs stored in database
✅ **Audit Trail**: All payment events logged
✅ **Dispute System**: Resolution mechanism for conflicts
✅ **Encryption**: Stripe handles PCI compliance

## Testing

### Using Stripe Test Keys

1. Use **Test Mode** keys from Stripe Dashboard
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Test Seller Onboarding

```typescript
const result = await createStripeExpressAccount(
  'test-seller-id',
  'seller@test.com',
  'http://localhost:3000/callback'
)
// Open result.accountLink in browser
```

### Test Payment Flow

```typescript
// 1. Create order
const order = await createOrder(
  'listing-1',
  'seller-1',
  'buyer-1',
  10000, // $100
  1
)

// 2. Create PaymentIntent
const payment = await createPaymentIntent(
  order.orderId,
  10000,
  'seller-1',
  'buyer-1'
)

// 3. Confirm in client
const { paymentIntent } = await stripe.confirmCardPayment(
  payment.clientSecret,
  {
    payment_method: {
      card: { /* test card */ },
      billing_details: { /* ... */ }
    }
  }
)

// 4. Confirm on server
await confirmPayment(order.orderId, paymentIntent.id)

// 5. Capture funds
await captureAndReleaseFunds(order.orderId, 'buyer_confirmed')
```

## Troubleshooting

### "Seller has not completed Stripe onboarding"
- Seller needs to click "Get Paid"
- Complete Stripe Express onboarding
- Verify charges_enabled & payouts_enabled in Stripe

### "Payment declined"
- Check test card number
- Verify card details (expiry, CVC)
- Check for fraud detection

### "Webhook signature verification failed"
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check webhook endpoint is accessible
- Verify event is from Stripe

### "Payout hasn't arrived"
- Payouts take 2-3 business days
- Check payout status in Stripe Dashboard
- Verify seller bank account is correct

## Production Checklist

- [ ] Use live Stripe keys (not test)
- [ ] Set up webhook endpoint with live secret
- [ ] Configure return URLs in environment
- [ ] Test complete payment flow
- [ ] Test seller onboarding
- [ ] Test refund flow
- [ ] Set up error alerting
- [ ] Monitor webhook deliveries
- [ ] Test dispute resolution
- [ ] Load test payment processing
- [ ] Set up backup webhook delivery
- [ ] Document support procedures

## Future Enhancements

1. **Marketplace Payouts**: Pay sellers weekly automatically
2. **Split Payments**: Refund split between multiple sellers
3. **Subscription Billing**: Recurring payments
4. **Invoice Management**: Generate tax invoices
5. **Reconciliation**: Auto reconcile with Stripe
6. **Compliance**: 1099-K reporting for US sellers
7. **Multi-Currency**: Support international sellers
8. **3D Secure**: Enhanced security for card payments

---

Tody's payment system keeps buyers and sellers protected while ensuring fast, secure transactions! 💳✅
