# 🏗️ Architecture - TODAY Marketplace

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE (React)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      App.tsx                              │   │
│  │              (Main Router & Layout)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Header  │  Main Content (Routes)  │  Footer             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Pages:                                                          │
│  ├─ Home (/) - Auctions Display                                 │
│  ├─ Login (/login) - User Authentication                        │
│  ├─ Register (/register) - New User Registration               │
│  ├─ Checkout (/checkout) - Payment Processing                  │
│  └─ Profile (/profile) - User Dashboard & Commissions          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         │                                           │
         │                                           │
         ▼                                           ▼
  ┌──────────────┐                          ┌──────────────────┐
  │  Firebase    │                          │  Stripe API      │
  │  Auth        │                          │  (Payments)      │
  │  Realtime DB │                          │  Google Pay      │
  │              │                          │  Apple Pay       │
  └──────────────┘                          └──────────────────┘
         │                                           │
         ▼                                           ▼
  ┌────────────────────────────────────────────────────────────┐
  │              BACKEND SERVICES (Cloud Functions)             │
  │  - User Authentication                                     │
  │  - Auction Management                                      │
  │  - Commission Calculations                                 │
  │  - Payment Processing                                      │
  │  - Notifications                                           │
  └────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
today-marketplace/
│
├── src/
│   │
│   ├── components/
│   │   ├── Header.tsx          # Navigation bar with logo
│   │   ├── Footer.tsx          # Footer with links
│   │   └── AuctionCard.tsx     # Product card component
│   │
│   ├── pages/
│   │   ├── Home.tsx            # Home page with auctions
│   │   ├── Auth/
│   │   │   ├── Login.tsx       # User login page
│   │   │   └── Register.tsx    # User registration
│   │   ├── Checkout.tsx        # Payment page
│   │   └── Profile.tsx         # User dashboard
│   │
│   ├── App.tsx                 # Main app with router
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
│
├── public/                     # Static assets
│
├── Configuration Files
│   ├── vite.config.ts          # Vite configuration
│   ├── tsconfig.json           # TypeScript config
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── postcss.config.js       # PostCSS config
│   ├── package.json            # Dependencies
│   └── index.html              # HTML template
│
├── Documentation
│   ├── README.md               # Project overview
│   ├── PROJECT_PLAN_HE.md      # Hebrew project plan
│   └── ARCHITECTURE.md         # This file
│
└── Environment
    ├── .env.example            # Environment template
    └── .gitignore              # Git ignore rules
```

## 🔄 Data Flow

### Auction Flow
```
1. User lands on Home page
   ↓
2. Fetch auctions from Firebase (real-time)
   ↓
3. Display AuctionCard with countdown timer
   ↓
4. Price drops every second (local state update)
   ↓
5. User clicks "קנה עכשיו"
   ↓
6. Redirect to Checkout page
   ↓
7. User selects payment method
   ↓
8. Stripe/Google Pay/Apple Pay processes payment
   ↓
9. Backend creates transaction record
   ↓
10. Commission calculated (15% to platform, 85% to seller)
    ↓
11. Redirect to success page
    ↓
12. Update user's commission balance
```

### User Authentication Flow
```
Register Flow:
1. User fills form (name, email, password)
   ↓
2. Submit to Firebase Auth
   ↓
3. Create user account
   ↓
4. Redirect to Home

Login Flow:
1. User enters email & password
   ↓
2. Firebase authenticates
   ↓
3. Store auth token
   ↓
4. Redirect to Home

Google/Apple Flow:
1. Click "Sign in with Google/Apple"
   ↓
2. Redirect to provider
   ↓
3. User approves
   ↓
4. Callback to app with user data
   ↓
5. Create/update user in Firebase
   ↓
6. Redirect to Home
```

## 🎨 Component Hierarchy

```
App
├── Header
│   ├── Logo (Link to Home)
│   ├── Navigation Links
│   └── Sign In Button
│
├── Main Content (Routes)
│   ├── Home
│   │   ├── Hero Section
│   │   ├── Filter Buttons
│   │   ├── AuctionCard (x4)
│   │   │   ├── Product Emoji
│   │   │   ├── Price Display
│   │   │   ├── Countdown Timer
│   │   │   └── Buy Button
│   │   └── How It Works Section
│   │
│   ├── Login
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Login Button
│   │   ├── Social Login Buttons
│   │   └── Register Link
│   │
│   ├── Register
│   │   ├── Name Input
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Confirm Password
│   │   ├── Register Button
│   │   └── Login Link
│   │
│   ├── Checkout
│   │   ├── Payment Method Selection
│   │   │   ├── Credit Card Option
│   │   │   ├── Google Pay Option
│   │   │   └── Apple Pay Option
│   │   ├── Credit Card Form
│   │   │   ├── Name Input
│   │   │   ├── Card Number
│   │   │   ├── Expiry Date
│   │   │   ├── CVV
│   │   │   └── Submit Button
│   │   └── Order Summary
│   │       ├── Product Image
│   │       ├── Original Price
│   │       ├── Discount
│   │       ├── Final Price
│   │       └── Security Badge
│   │
│   └── Profile
│       ├── User Info Header
│       ├── Stats Cards (3)
│       │   ├── Total Earnings
│       │   ├── This Month
│       │   └── Pending
│       ├── Withdrawal Section
│       │   ├── Amount Input
│       │   ├── Method Selection
│       │   └── Transfer Button
│       ├── Transactions Table
│       │   ├── Product
│       │   ├── Sale Amount
│       │   ├── Commission (15%)
│       │   ├── Date
│       │   └── Status
│       └── FAQ Section
│
└── Footer
    ├── Logo & Description
    ├── Links
    ├── Contact Info
    └── Copyright
```

## 🎯 Key Features Explained

### 1. Real-time Countdown Timer
```typescript
// Updates every second
useEffect(() => {
  const interval = setInterval(() => {
    setAuctions((prev) =>
      prev.map((auction) => ({
        ...auction,
        timeRemaining: Math.max(auction.timeRemaining - 1, 0),
        currentPrice: Math.max(currentPrice - 50, minPrice),
      }))
    )
  }, 1000)
}, [])
```

### 2. Commission Calculation
```
Sale Price: ₪3,450
- Platform Commission (15%): ₪517.50
= Seller Receives (85%): ₪2,932.50

User Commission Tracking:
- Total Earnings: Sum of all commissions
- This Month: Current month commissions
- Pending: Commissions waiting for withdrawal
```

### 3. Payment Processing
```
Credit Card:
- User enters card details
- Stripe tokenizes (secure)
- Backend processes payment
- Store transaction record

Google/Apple Pay:
- Single click payment
- Device authenticates
- Faster checkout experience
```

## 🔐 Security Considerations

1. **Authentication**
   - Firebase Auth handles passwords securely
   - No passwords stored in frontend
   - Auth tokens managed by Firebase

2. **Payment Data**
   - PCI DSS compliant via Stripe
   - No card data stored in our database
   - Encrypted communication

3. **Data Protection**
   - Firebase security rules
   - Input validation
   - HTTPS only

## 📊 State Management Strategy

### Client State (React Hooks)
- Current user data
- Auction list
- UI state (loading, errors)
- Form data

### Server State (Firebase)
- User accounts
- Auction data
- Transaction history
- Commission records

## 🚀 Deployment Flow

```
Local Development:
npm run dev → http://localhost:5173

Production Build:
npm run build → Creates optimized dist/

Deploy Options:
- Vercel (Recommended for React)
- Firebase Hosting
- Netlify
- AWS S3 + CloudFront
```

## 📈 Performance Optimizations

- **Code Splitting**: Routes use React lazy loading
- **Image Optimization**: Emoji reduce file size
- **Memoization**: Framer Motion animations optimized
- **CSS**: Tailwind purges unused styles
- **Bundling**: Vite creates minimal bundle

## 🔗 External Services

1. **Firebase**
   - Authentication
   - Realtime Database
   - Cloud Functions
   - Hosting (optional)

2. **Stripe**
   - Payment processing
   - PCI compliance
   - Webhook notifications

3. **Google/Apple**
   - OAuth authentication
   - Payment processing
   - Device security

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md)
- **Desktop**: 1024px - 1280px (lg)
- **Large**: > 1280px (xl)

---

**Last Updated**: 2026-08-18
