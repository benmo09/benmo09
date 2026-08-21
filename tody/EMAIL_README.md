# Tody Email System - Complete Guide

Tody uses **Resend** and **React Email** to send beautifully designed, transactional emails to buyers and sellers with real-time notifications about sales, offers, bids, and price drops.

## System Overview

```
Email Flow:
1. Event triggered (new sale, offer, bid, price drop)
2. Server action calls email function
3. Email template rendered with React Email
4. HTML sent through Resend API
5. Email delivered to recipient with tracking
```

## Architecture

### Core Components

**lib/email.ts** - Central email configuration
```typescript
- sendEmail(): Core function for sending emails via Resend
- SENDER_EMAIL: noreply@tody.app
- SUPPORT_EMAIL: support@tody.app
- TypeScript interfaces for email data
```

**lib/emails/** - Email template components
```
├── verification-email.tsx    # Email verification
├── new-sale-email.tsx        # Seller: New sale notification
├── new-offer-email.tsx       # Seller: Offer/Bid notification
├── auction-won-email.tsx     # Buyer: Auction win notification
└── price-drop-email.tsx      # Buyer: Price drop alert
```

**lib/actions/email.ts** - Server actions for sending emails
```typescript
- sendVerificationEmail()
- sendNewSaleEmail()
- sendNewOfferEmail()
- sendAuctionWonEmail()
- sendPriceDropEmail()
```

## Environment Setup

### 1. Get Resend API Key

1. Go to [Resend Dashboard](https://resend.com)
2. Sign up or log in
3. Navigate to **API Tokens**
4. Create new token
5. Copy the API key

### 2. Update Environment Variables

Add to `.env.local`:

```bash
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Application base URL (used for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure Email Domain (Production)

For production, configure a custom email domain:

1. Go to Resend > **Domains**
2. Add your domain (e.g., mail.tody.app)
3. Follow DNS setup instructions
4. Update sender email from noreply@tody.app to noreply@yourdomain.com

## Email Templates

### 1. Verification Email

Sent when user signs up or changes email.

**When triggered:**
- User signs up
- User requests email verification

**Data required:**
```typescript
{
  userName: string
  verificationLink: string
  expiresIn?: string
}
```

**Usage:**
```typescript
await sendVerificationEmail(
  'user@example.com',
  'John Doe',
  'verification-token-xyz',
  'https://tody.app'
)
```

### 2. New Sale Email

Sent to seller when item is purchased (Buy Now or Auction won).

**When triggered:**
- Payment confirmed
- Order created

**Data required:**
```typescript
{
  sellerEmail: string
  sellerName: string
  listingTitle: string
  buyerName: string
  price: number
  quantity: number
  orderId: string
  baseUrl: string
}
```

**Usage:**
```typescript
await sendNewSaleEmail(
  'seller@example.com',
  'Jane Smith',
  'iPhone 14 Pro',
  'John Doe',
  899.99,
  1,
  'order-123',
  'https://tody.app'
)
```

### 3. New Offer/Bid Email

Sent to seller when offer is made (Make an Offer) or bid is placed (Auction).

**When triggered:**
- Offer created (Make an Offer)
- Bid placed (Auction)

**Data required:**
```typescript
{
  sellerEmail: string
  sellerName: string
  listingTitle: string
  buyerName: string
  offerPrice: number
  originalPrice: number
  offerId: string
  baseUrl: string
  messagePreview?: string
  isAuction: boolean
}
```

**Usage - Offer:**
```typescript
await sendNewOfferEmail(
  'seller@example.com',
  'Jane Smith',
  'iPhone 14 Pro',
  'John Doe',
  800.00,
  899.99,
  'offer-456',
  'https://tody.app',
  'Would you accept $800?',
  false
)
```

**Usage - Bid:**
```typescript
await sendNewOfferEmail(
  'seller@example.com',
  'Jane Smith',
  'iPhone 14 Pro',
  'John Doe',
  950.00,
  undefined,
  'bid-789',
  'https://tody.app',
  undefined,
  true
)
```

### 4. Auction Won Email

Sent to buyer when auction ends and they are the highest bidder.

**When triggered:**
- Auction ends
- Buyer has highest bid

**Data required:**
```typescript
{
  buyerEmail: string
  buyerName: string
  listingTitle: string
  winningBid: number
  sellerName: string
  auctionId: string
  baseUrl: string
}
```

**Usage:**
```typescript
await sendAuctionWonEmail(
  'buyer@example.com',
  'John Doe',
  'iPhone 14 Pro',
  950.00,
  'Jane Smith',
  'auction-789',
  'https://tody.app'
)
```

### 5. Price Drop Email

Sent to buyer when Tody Drop price decreases.

**When triggered:**
- Price drops in Tody Drop
- Buyer set price target

**Data required:**
```typescript
{
  buyerEmail: string
  buyerName: string
  listingTitle: string
  currentPrice: number
  previousPrice: number
  targetPrice: number
  timeRemaining: string
  listingId: string
  baseUrl: string
}
```

**Usage:**
```typescript
await sendPriceDropEmail(
  'buyer@example.com',
  'John Doe',
  'iPhone 14 Pro',
  799.99,
  899.99,
  700.00,
  '2 hours',
  'listing-123',
  'https://tody.app'
)
```

## Integration Points

### Seller Notifications

**New Sale (Payment Confirmed)**

In `lib/actions/stripe.ts`, after `confirmPayment()`:

```typescript
await sendNewSaleEmail(
  sellerEmail,
  sellerName,
  listing.title,
  buyerName,
  order.price,
  order.quantity,
  orderId,
  process.env.NEXT_PUBLIC_APP_URL!
)
```

**New Offer (Make an Offer)**

In `lib/actions/offers.ts`, after creating offer:

```typescript
await sendNewOfferEmail(
  sellerEmail,
  sellerName,
  listing.title,
  buyerName,
  offerPrice,
  listing.price,
  offerId,
  process.env.NEXT_PUBLIC_APP_URL!,
  offerMessage,
  false // not auction
)
```

**New Bid (Auction)**

In `lib/actions/bids.ts`, after creating bid:

```typescript
await sendNewOfferEmail(
  sellerEmail,
  sellerName,
  listing.title,
  buyerName,
  bidAmount,
  currentHighestBid,
  bidId,
  process.env.NEXT_PUBLIC_APP_URL!,
  undefined,
  true // is auction
)
```

### Buyer Notifications

**Auction Won**

In auction completion logic:

```typescript
await sendAuctionWonEmail(
  buyerEmail,
  buyerName,
  listing.title,
  winningBid,
  sellerName,
  auctionId,
  process.env.NEXT_PUBLIC_APP_URL!
)
```

**Price Drop (Tody Drop)**

Triggered by scheduled task or webhook:

```typescript
await sendPriceDropEmail(
  buyerEmail,
  buyerName,
  listing.title,
  currentPrice,
  previousPrice,
  targetPrice,
  timeRemaining,
  listingId,
  process.env.NEXT_PUBLIC_APP_URL!
)
```

## Email Rendering

Emails are rendered using React Email, which converts React components to HTML:

```typescript
import { render } from 'react-email'
import NewSaleEmail from '@/lib/emails/new-sale-email'

const html = render(
  NewSaleEmail({
    sellerName: 'Jane',
    listingTitle: 'iPhone 14',
    // ... other props
  })
)

await sendEmail({
  to: 'seller@example.com',
  subject: '🎉 New Sale: iPhone 14',
  html,
})
```

## Testing

### Using Resend Test API Key

1. Use test API key from Resend dashboard
2. Emails will be delivered to sandbox inbox
3. Check delivery logs in Resend dashboard

### Test Recipients

```bash
# Successfully delivered
test@resend.dev

# Bounce simulation
bounce@resend.dev

# Complaint simulation
complaint@resend.dev
```

### Test Email Function

```typescript
import { sendVerificationEmail } from '@/lib/actions/email'

// In your test page or component
const result = await sendVerificationEmail(
  'test@resend.dev',
  'Test User',
  'test-token-123',
  'http://localhost:3000'
)

console.log(result)
// { success: true, messageId: '...' }
```

## Production Setup

### 1. DNS Configuration

Add Resend records to your DNS provider:

```
CNAME: mail._domainkey.yourdomain.com -> rs.mg.yourdomain.com
CNAME: email.yourdomain.com -> mg.yourdomain.com
```

### 2. Email Warmup

- Start with low email volume
- Monitor bounce rates
- Gradually increase sending limits
- Keep bounce rate < 1%

### 3. Monitoring

Track in Resend dashboard:
- Delivery rate (target: > 98%)
- Bounce rate (target: < 1%)
- Spam complaints (target: 0%)
- Open rates
- Click rates

### 4. Compliance

- **Unsubscribe links**: Include in email footer
- **Privacy policy**: Link in footer
- **CAN-SPAM**: Comply with email regulations
- **GDPR**: Store user consent for emails

## Troubleshooting

### "Resend API key missing"

```
Error: RESEND_API_KEY environment variable not set
```

**Fix:**
1. Add `RESEND_API_KEY` to `.env.local`
2. Restart dev server
3. Verify key in Resend dashboard

### "Email not received"

1. Check Resend activity log for delivery status
2. Verify recipient email is correct
3. Check spam/junk folder
4. Ensure domain is verified (production)

### "HTML rendering error"

```
Error: Failed to render email template
```

**Fix:**
1. Verify React Email component syntax
2. Check all required props are passed
3. Look for TypeScript errors in template

### "Daily sending limit exceeded"

**Fix:**
1. Check Resend plan limits
2. Contact Resend support for limit increase
3. Implement queue for high-volume sends

## Email Best Practices

✅ **DO:**
- Use clear, descriptive subject lines
- Include call-to-action buttons
- Test across email clients
- Monitor delivery metrics
- Provide unsubscribe option
- Use consistent branding

❌ **DON'T:**
- Send from generic addresses
- Use only images for content
- Send duplicate emails
- Ignore bounce/complaint rates
- Spam filter words in subject
- Change sender email frequently

## Advanced Features

### 1. Email Tracking

Track opens and clicks via Resend:

```typescript
await sendEmail({
  to: 'user@example.com',
  subject: 'Your Order',
  html,
  // Resend tracks opens/clicks automatically
})
```

### 2. Email Templates in Resend Dashboard

Save templates in Resend for reuse:
1. Go to Resend > **Templates**
2. Create new template
3. Use in `sendEmail()` with `template_id`

### 3. Batch Sending

For high volume, use Resend batch API:

```typescript
await resend.batch.send([
  {
    from: SENDER_EMAIL,
    to: 'recipient1@example.com',
    subject: 'Hello',
    html: '<h1>Hello</h1>',
  },
  {
    from: SENDER_EMAIL,
    to: 'recipient2@example.com',
    subject: 'Hello',
    html: '<h1>Hello</h1>',
  },
])
```

## API Reference

### sendEmail()

```typescript
sendEmail({
  to: string              // Recipient email
  subject: string         // Email subject
  html: string            // HTML content
  replyTo?: string        // Reply-to address
})

Returns: {
  success: boolean
  messageId?: string
  error?: string
}
```

### Email Action Functions

All functions are async and return `{ success: boolean, error?: string }`

```typescript
sendVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string,
  baseUrl: string
)

sendNewSaleEmail(
  sellerEmail: string,
  sellerName: string,
  listingTitle: string,
  buyerName: string,
  price: number,
  quantity: number,
  orderId: string,
  baseUrl: string
)

sendNewOfferEmail(
  sellerEmail: string,
  sellerName: string,
  listingTitle: string,
  buyerName: string,
  offerPrice: number,
  originalPrice: number,
  offerId: string,
  baseUrl: string,
  messagePreview?: string,
  isAuction?: boolean
)

sendAuctionWonEmail(
  buyerEmail: string,
  buyerName: string,
  listingTitle: string,
  winningBid: number,
  sellerName: string,
  auctionId: string,
  baseUrl: string
)

sendPriceDropEmail(
  buyerEmail: string,
  buyerName: string,
  listingTitle: string,
  currentPrice: number,
  previousPrice: number,
  targetPrice: number,
  timeRemaining: string,
  listingId: string,
  baseUrl: string
)
```

---

Tody's email system keeps buyers and sellers engaged with real-time notifications! 📧✨
