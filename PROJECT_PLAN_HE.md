# 📱 פרויקט TODAY - Marketplace Auctions
## תיעוד בעברית - מה אנחנו בונים?

---

## 🎯 **מטרת הפרויקט**
בנות אפליקציית marketplace שבה המחיר של מוצרים יורד עד שמישהו קונה.

**תאריך התחלה:** 18.8.2026
**שפה:** עברית (RTL)
**סוג:** React + Firebase + Stripe/Google Pay

---

## 📋 **דפים שנבנה:**

### 1️⃣ **דף בית (Home Page)**
- הצגת מוצרים בauction חי
- countdown timer לכל מוצר
- מחיר יורד בזמן אמת
- כפתור "קנה עכשיו"
- חיפוש וסינון

### 2️⃣ **דף התחברות (Login)**
- התחברות עם אימייל
- התחברות עם Google
- התחברות עם Apple
- עמוד הרשמה

### 3️⃣ **דף Checkout (תשלום)**
- בחירת שיטת תשלום
- כרטיס אשראי
- Google Pay
- Apple Pay
- receipt אחרי קנייה

### 4️⃣ **דף פרופיל (Profile/Dashboard)**
- צפייה בהרווחים
- commission tracker
- היסטוריה של קניות
- שליחת כסף לבנק

### 5️⃣ **דף admin (Admin Panel)**
- הוספת מוצרים חדשים
- ניהול auctions
- ראיית סטטיסטיקות

---

## 🛠️ **טכנולוגיות שנשתמש בהן:**

### Frontend:
- ✅ React 18
- ✅ TypeScript (לauto-complete ובדיקות סוג)
- ✅ TailwindCSS (עיצוב יפה)
- ✅ Framer Motion (אנימציות חלקות)
- ✅ React Router (ניווט בין דפים)

### Backend:
- ✅ Firebase (authentication + database)
- ✅ Firebase Realtime (עדכוני מחיר בזמן אמת)
- ✅ Stripe API (תשלומים בכרטיס)
- ✅ Google Pay API
- ✅ Cloud Functions (חישובי קומיסיון)

### Database:
- Users (פרופיל, סיסמה מוצפנת)
- Products (מוצרים)
- Auctions (מחיר כרגע, זמן בחזירה)
- Transactions (תשלומים)
- Commission (הרווחים שלך)

---

## 🎨 **עיצוב וצבעים:**

```
Primary Color:    🟠 #F5A623 (Orange חם)
Secondary Color:  🟡 #FFD700 (Gold עשיר)
Accent Color:     🔴 #E74C3C (Red לחירום/countdown)
Background:       🟤 #FFF8EC (Cream חם)
Text Dark:        #1C1206 (Brown כהה)
Text Light:       #FFFFFF (לבן)
```

---

## 💰 **מערכת Commission (הרווח שלך):**

```
כל קנייה: 
- בעל המוצר: 85% מהמחיר
- אתה (האפליקציה): 15% מהמחיר

דוגמה:
- מוצר נמכר ב-₪3,450
- בעל המוצר מקבל: ₪2,932.50
- אתה מקבל: ₪517.50
```

---

## 📝 **שלבי הבנייה:**

### ✅ **שלב 1: Setup ותנאים** (עכשיו)
- [ ] יצירת React project
- [ ] התקנת dependencies
- [ ] Setup Firebase
- [ ] Setup Stripe

### 🔄 **שלב 2: Component בסיסיים**
- [ ] Layout ראשי (Header, Navigation)
- [ ] Footer
- [ ] Loading states

### 🔄 **שלב 3: Auctions & Products**
- [ ] קריאה מFirebase
- [ ] AuctionCard component
- [ ] Countdown timer
- [ ] Real-time price updates

### 🔄 **שלב 4: Authentication**
- [ ] Firebase Auth setup
- [ ] Login form
- [ ] Register form
- [ ] Google Sign-In
- [ ] Protected routes

### 🔄 **שלב 5: Payment System**
- [ ] Stripe integration
- [ ] Checkout form
- [ ] Payment processing
- [ ] Receipt generation

### 🔄 **שלב 6: Commission System**
- [ ] Dashboard
- [ ] Commission tracker
- [ ] Withdrawal system
- [ ] Transaction history

### 🔄 **שלב 7: Polish & Deploy**
- [ ] Animations & Transitions
- [ ] Mobile optimization
- [ ] Testing
- [ ] Deploy to production

---

## 🚀 **מה התוכנית?**

1. **בנות repository חדש עם React**
2. **התקנת כל ה-libraries**
3. **בנות כל component אחד אחד**
4. **Connection ל-Firebase**
5. **Integration עם Stripe**
6. **סטיילינג עם TailwindCSS**
7. **Animations עם Framer Motion**
8. **Testing ו-debugging**
9. **Deploy לinternet**

---

## 📊 **זמן משוער:**

- Setup: 30 דקות
- Components בסיסיים: 1 שעה
- Auctions & Products: 1.5 שעות
- Auth: 1 שעה
- Payment: 1.5 שעות
- Commission System: 1 שעה
- Polish & Deploy: 1 שעה

**סה"כ: ~7-8 שעות עבודה**

---

## ✨ **עדכונים בזמן בנייה:**

כל שלב שאנחנו משלימים אני אכתוב כאן מה עשינו.

---

## 📅 **עדכון: 18.8.2026**

### ✅ **שלב 1: Setup & Configuration** ✓ COMPLETED
- ✅ יצירת React + TypeScript project עם Vite
- ✅ התקנת dependencies:
  - react-router-dom (ניווט)
  - firebase (authentication + database)
  - framer-motion (אנימציות חלקות)
  - @stripe/react-stripe-js (תשלומים)
  - tailwindcss (styling)
- ✅ Setup Tailwind CSS עם צבעים מותאמים
- ✅ יצירת struktur folder:
  - src/components (Header, Footer, AuctionCard)
  - src/pages (Home, Auth/Login, Auth/Register, Checkout, Profile)
  - src/index.css (global styles + animations)

### 📝 **מה בנינו עד כה:**

#### Components:
1. **Header.tsx** 
   - Logo עם התנעה (Framer Motion)
   - Navigation links
   - Sign in button
   - Sticky positioning

2. **Footer.tsx**
   - Links
   - Contact info
   - Copyright

3. **AuctionCard.tsx** 
   - Emoji עם animation בעת דחיפות
   - מחיר כרגע עם real-time updates
   - Countdown timer עם color change בחירום
   - Discount badge
   - "קנה עכשיו" button

#### Pages:
1. **Home.tsx**
   - Hero section עם gradient background
   - Filter buttons
   - Grid של 4 products עם countdown timers
   - Real-time price drops (כל שנייה המחיר יורד)
   - "How it works" section

2. **Login.tsx**
   - Email/password login
   - Google Sign-In button
   - Apple Sign-In button
   - Link to register

3. **Register.tsx**
   - Name, Email, Password fields
   - Confirm password
   - Link to login

4. **Checkout.tsx**
   - Payment method selection (Card, Google Pay, Apple Pay)
   - Credit card form
   - Order summary sidebar
   - Price breakdown with discount

5. **Profile.tsx** (Dashboard)
   - Welcome message
   - 3 stats cards: Total earnings, This month, Pending
   - Withdrawal section
   - Transactions history table
   - FAQ section

### 🎨 **Design Features:**
- ✅ Warm color palette (Orange #F5A623, Gold #FFD700, Red #E74C3C)
- ✅ Smooth animations (hover effects, transitions)
- ✅ Hebrew RTL support
- ✅ Mobile responsive
- ✅ Button hover/tap effects with Framer Motion

### 🔄 **הצעדים הבאים:**
1. npm install - התקנת כל ה-packages
2. npm run dev - הפעלת dev server
3. Integration עם Firebase (Authentication)
4. Integration עם Stripe (Payment Processing)
5. Commission tracking system
6. Admin panel להוספת מוצרים

---

