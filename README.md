# 📱 TODAY - Marketplace with Falling Prices

A modern web application for buying products in a unique auction system where prices drop until someone buys.

## 🎯 Features

- **Live Auctions**: Watch prices drop in real-time
- **Multiple Payment Methods**: Credit card, Google Pay, Apple Pay
- **Commission Tracking**: Monitor your earnings from each sale
- **Hebrew Support**: Full RTL support for Hebrew language
- **Mobile Responsive**: Works on all devices
- **Beautiful UI**: Modern design with smooth animations
- **Real-time Updates**: Live price drops and countdowns

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Smooth animations
- **React Router** - Navigation

### Backend (Planned)
- **Firebase** - Authentication & Real-time Database
- **Stripe API** - Payment processing
- **Google Pay & Apple Pay** - Mobile payments
- **Cloud Functions** - Commission calculations

## 📁 Project Structure

```
today-marketplace/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── AuctionCard.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Checkout.tsx
│   │   └── Profile.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will open at `http://localhost:5173`

## 🎨 Color Palette

- **Primary**: `#F5A623` (Warm Orange)
- **Secondary**: `#FFD700` (Gold)
- **Accent**: `#E74C3C` (Red - for urgency)
- **Background**: `#FFF8EC` (Cream)
- **Dark**: `#1C1206` (Dark Brown)

## 💰 Commission System

- **Seller Earnings**: 85% of the final price
- **Platform Commission**: 15% of the final price
- **Example**: If a product sells for ₪3,450
  - Seller gets: ₪2,932.50
  - Platform gets: ₪517.50

## 📄 Pages

### 🏠 Home
- Display active auctions
- Real-time countdown timers
- Live price drops
- Product filtering

### 🔐 Login / Register
- Email authentication
- Google Sign-In
- Apple Sign-In
- User registration

### 💳 Checkout
- Multiple payment methods
- Credit card form
- Order summary
- Receipt generation

### 👤 Profile / Dashboard
- Earnings overview
- Commission tracking
- Withdrawal system
- Transaction history
- FAQ section

## 🔄 Development Phases

### Phase 1: Setup ✅ COMPLETED
- Project structure
- Components framework
- Styling with Tailwind

### Phase 2: Firebase Integration (In Progress)
- Authentication
- Real-time database
- User management

### Phase 3: Payment Integration (Planned)
- Stripe integration
- Google Pay support
- Apple Pay support
- Receipt system

### Phase 4: Advanced Features (Planned)
- Admin panel
- Product management
- Analytics dashboard
- Email notifications

## 📱 Responsive Design

The app is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Large screens

## ✨ Animations & Effects

- Smooth page transitions
- Hover effects on buttons
- Pulsing countdown timer when urgent
- Animated price updates
- Card flip effects
- Loading animations

## 🔒 Security

- TypeScript for type safety
- Environment variables for sensitive data
- HTTPS for all connections
- Stripe PCI DSS compliance
- Firebase security rules

## 📞 Support

For questions or issues, contact: support@today.com

## 📄 License

© 2026 TODAY Marketplace. All rights reserved.

---

**Built with ❤️ for the Israeli market**
