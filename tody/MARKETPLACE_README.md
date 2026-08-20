# Tody Marketplace - Core Features

## Overview

The Tody marketplace uses an intelligent **Deal Score** algorithm to help users find the best local deals. It combines price, urgency, and proximity into a single score (1-100).

## Architecture

### Components

```
lib/
├── types.ts                 # TypeScript types for listings
├── actions/
│   └── listings.ts         # Server actions for fetching listings
└── utils/
    ├── distance.ts         # Haversine distance calculations
    └── dealScore.ts        # Deal score algorithm

app/
├── components/
│   ├── ListingCard.tsx     # Card display with deal score
│   └── CountdownTimer.tsx  # Real-time countdown
└── marketplace/
    └── page.tsx            # Main marketplace page
```

## Deal Score Algorithm

The **Tody Deal Score** (1-100) is calculated from three factors:

### 1. Price Score (0-50 points)
Compares the listing price to the category average:
- **50% of avg price** → 50 points (excellent deal)
- **100% of avg price** → 25 points (fair price)
- **150% of avg price** → 0 points (overpriced)

### 2. Time Score (0-30 points)
Measures urgency based on time remaining:
- **< 2 hours remaining** → 30 points (super urgent)
- **24 hours remaining** → 5 points (standard)
- **Expired** → 0 points

### 3. Distance Score (0-20 points)
Rewards nearby listings:
- **< 1 km away** → 20 points (very close)
- **50 km away** → 0 points (far away)
- Linear scale in between

### Score Ranges
- **80-100**: Excellent deal 🟢
- **60-79**: Good deal 🟢
- **40-59**: Fair deal 🟡
- **20-39**: Poor deal 🟠
- **1-19**: Very poor deal 🔴

## Key Features

### 1. Location-Based Discovery
```typescript
// Fetches listings within 50km radius of user
const listings = await getActiveListings({
  userLat: 40.7128,
  userLng: -74.0060,
  radiusKm: 50
})
```

Uses Haversine formula for accurate distance calculation:
```
Distance = 2 * R * atan2(√a, √(1-a))
where R = Earth radius (6371 km)
```

### 2. Real-Time Countdown
- Updates every second
- Shows time remaining for listings (expires in 24 hours)
- Highlights urgent deals (< 2 hours) in red

### 3. Smart Filtering
Users can filter by:
- **Search Radius**: 5km to 100km
- **Price Range**: Min and max price
- **Sort Order**:
  - Best Deals (default, by Deal Score)
  - Price (low to high)
  - Distance (closest first)
  - Newest first
- **Category**: Filter by product category (optional)

### 4. Seller Reputation
- Displays seller rating (0-5 stars)
- Shows seller name and avatar
- Links to seller profile

## Database Schema

### Key Tables

**listings**
- `expires_at`: Auto-set to NOW() + 24 hours
- `lat`, `lng`: PostGIS coordinates for distance queries
- `sale_type`: buy_now, auction, or drop
- `status`: active, sold, expired, hidden

**category_avg_prices** (view)
- Calculated from active listings only
- Updated in real-time
- Used for deal score calculation

## Usage

### Start Development Server
```bash
cd tody
npm run dev
```

### Access Marketplace
```
http://localhost:3000/marketplace
```

### Seed Demo Data
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy and run `migrations/002_seed_demo_data.sql`

This creates:
- 4 demo users (3 sellers, 1 buyer)
- 5 product categories
- 8 demo listings with various deal scores

## Real-Time Updates

### Countdown Timer (`CountdownTimer.tsx`)
- Client-side React component
- Updates every second
- Triggers callback when expired
- Gracefully handles expired listings

### Deal Score Recalculation
- Recalculates when user applies filters
- Automatically updates prices in real-time
- Time-based scoring updates on page refresh

## Performance Optimizations

1. **Distance Filtering**: Done in client after initial database fetch
2. **Category Averages**: Computed once per session
3. **Image Loading**: Lazy loading with Next.js Image component
4. **Debounced Filters**: Filters update listings on change

## Future Enhancements

### Phase 2: Authentication
- User login/signup
- Personalized listings
- Wishlist/favorites

### Phase 3: Messaging
- Chat between buyers and sellers
- Offer system

### Phase 4: Payments
- Stripe integration
- Secure checkout

### Phase 5: Advanced Features
- Auction bidding
- Drop orders
- Seller dashboard
- Analytics

## Testing the Deal Score

### Test Scenario 1: Excellent Deal (Score > 80)
- Price: 50% below category average
- Time remaining: < 2 hours
- Distance: < 1 km

### Test Scenario 2: Poor Deal (Score < 20)
- Price: 150% above category average
- Time remaining: > 20 hours
- Distance: > 40 km

### Test Scenario 3: Average Deal (Score 40-60)
- Price: At category average
- Time remaining: ~12 hours
- Distance: ~15 km

## API Reference

### `getActiveListings(filters: MarketplaceFilters)`
Fetches active listings with deal scores.

**Parameters:**
- `userLat`: User latitude
- `userLng`: User longitude
- `radiusKm`: Search radius (default: 50)
- `categoryId`: Filter by category (optional)
- `sortBy`: 'dealScore' | 'price' | 'distance' | 'newest'
- `priceMin`: Minimum price (optional)
- `priceMax`: Maximum price (optional)

**Returns:** `ListingWithDealScore[]`

### `calculateDealScore(input: DealScoreInput)`
Computes deal score from price, time, and distance.

**Returns:** `number` (1-100)

### `calculateDistance(lat1, lng1, lat2, lng2)`
Calculates distance between two coordinates.

**Returns:** `number` (kilometers)

## Troubleshooting

### No listings appear
- Check if demo data was seeded
- Verify user geolocation is working
- Check browser console for errors

### Deal scores seem wrong
- Verify category average prices are calculated
- Check if listings have `expires_at` in the future
- Ensure coordinates are in valid range

### Countdown timer not updating
- Check if countdown timer component is mounted
- Verify browser doesn't block automatic updates
- Check console for JavaScript errors

## Files Overview

| File | Purpose |
|------|---------|
| `lib/types.ts` | TypeScript interfaces for listings |
| `lib/actions/listings.ts` | Server actions for data fetching |
| `lib/utils/distance.ts` | Distance calculation utilities |
| `lib/utils/dealScore.ts` | Deal score algorithm |
| `app/components/ListingCard.tsx` | Card component display |
| `app/components/CountdownTimer.tsx` | Real-time countdown |
| `app/marketplace/page.tsx` | Main marketplace page |
| `migrations/002_seed_demo_data.sql` | Demo data |

---

Ready to explore the marketplace? Start with the demo data and check out how the Deal Score works! 🚀
