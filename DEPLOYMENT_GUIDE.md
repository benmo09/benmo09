# 🚀 TODAY Marketplace - Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Node.js 18+** installed
2. **Firebase CLI** installed: `npm install -g firebase-tools`
3. **Firebase Project** created at [firebase.google.com](https://firebase.google.com)
4. **Stripe Account** for payment processing

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "today-marketplace"
3. Enable the following services:
   - **Authentication** (Email/Password, Google, Apple)
   - **Realtime Database** (Start in test mode)
   - **Cloud Functions** (Node.js 18)
   - **Hosting** (for deployment)

### 1.2 Get Firebase Config

1. In Firebase Console, go to Project Settings
2. Copy your `Web API Key`, `Auth Domain`, `Project ID`, etc.
3. Create `.env` file in project root:

```bash
cp .env.example .env
```

4. Fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

### 1.3 Set Up Firebase Database Rules

```bash
cd firebase
firebase deploy --only database
```

This deploys the security rules from `database.rules.json`

---

## Step 2: Deploy Cloud Functions

### 2.1 Initialize Firebase Functions

```bash
cd firebase/functions
npm install
```

### 2.2 Deploy Functions

```bash
firebase deploy --only functions
```

This deploys:
- `updateAuctionPrices` - Updates prices every minute
- `processPurchase` - Handles purchase transactions
- `processWithdrawal` - Handles seller withdrawals
- `createAuction` - Creates new auction listings

---

## Step 3: Build Frontend

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` folder.

### 3.3 Test Production Build Locally

```bash
npm run preview
```

---

## Step 4: Deploy to Firebase Hosting

### 4.1 Authenticate with Firebase

```bash
firebase login
```

### 4.2 Initialize Hosting

```bash
firebase init hosting
```

Select:
- Project: today-marketplace
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No` (we'll use GitHub Actions)

### 4.3 Deploy

```bash
npm run build
firebase deploy --only hosting
```

Your site is now live! 🎉

---

## Step 5: Set Up Continuous Deployment (Optional)

### GitHub Actions Setup

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: today-marketplace
```

2. Get Firebase Service Account:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

3. Add to GitHub Secrets:
   - Go to GitHub Repo → Settings → Secrets
   - Create `FIREBASE_SERVICE_ACCOUNT` secret
   - Paste the entire JSON content

---

## Step 6: Stripe Integration

### 6.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a business account

### 6.2 Get API Keys

1. Dashboard → Developers → API Keys
2. Copy your **Publishable Key** and **Secret Key**
3. Add to `.env`:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_STRIPE_SECRET_KEY=sk_test_...
```

### 6.3 Create Stripe Webhooks

In Cloud Functions, you would add:

```javascript
// Handle Stripe webhooks
exports.handleStripeWebhook = functions.https.onRequest((req, res) => {
  // Process payment events
  // Update transaction status
  // Trigger commission payouts
});
```

---

## Step 7: Email & Notifications (Optional)

### SendGrid Integration

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendPurchaseNotification = functions.https.onCall(async (data) => {
  await sgMail.send({
    to: data.buyerEmail,
    from: 'noreply@today-marketplace.com',
    subject: '✅ Your purchase was successful!',
    html: `<h1>Congratulations!</h1><p>You got ${data.productName} for ₪${data.price}</p>`,
  });
});
```

---

## Monitoring & Maintenance

### View Logs

```bash
firebase functions:log
```

### Monitor Database

```bash
firebase database:get /
```

### Check Function Execution

Firebase Console → Functions → See all execution logs

---

## Database Structure Reference

```
auctions/
├── auctionId/
│   ├── productName
│   ├── currentPrice
│   ├── originalPrice
│   ├── minPrice
│   ├── endTime
│   └── status (active/sold/ended)

users/
├── userId/
│   ├── email
│   ├── displayName
│   ├── earnings/
│   │   ├── total
│   │   └── pending
│   └── purchases/

transactions/
├── transactionId/
│   ├── auctionId
│   ├── buyerId
│   ├── sellerId
│   ├── price
│   ├── timestamp
│   └── status

withdrawals/
└── withdrawalId/
    ├── sellerId
    ├── amount
    ├── status (pending/completed)
```

---

## Troubleshooting

### 404 errors after deployment

Make sure `firebase.json` has the rewrite rule:
```json
"rewrites": [{
  "source": "**",
  "destination": "/index.html"
}]
```

### Cloud Functions not executing

1. Check that Node.js version in `package.json` matches deployment target
2. Verify environment variables are set correctly
3. Check function logs: `firebase functions:log`

### Database rules blocking writes

Review `database.rules.json` and test with Firebase Emulator:
```bash
firebase emulators:start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_FIREBASE_API_KEY | ✅ | Firebase API key |
| VITE_FIREBASE_PROJECT_ID | ✅ | Firebase project ID |
| VITE_STRIPE_PUBLIC_KEY | ✅ | Stripe publishable key |
| VITE_APP_ENV | ❌ | Environment: development/production |

---

## Next Steps

After deployment:

1. ✅ Test all pages in production
2. ✅ Monitor error logs
3. ✅ Set up analytics
4. ✅ Configure email notifications
5. ✅ Plan marketing launch

---

**Status**: Ready for deployment! 🚀

Built with ❤️ using React, Firebase, and Stripe
