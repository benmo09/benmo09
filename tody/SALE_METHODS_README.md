# Tody Sale Methods - Complete Guide

Tody supports four distinct sale methods, each optimized for different seller and buyer needs:

## 1. Buy Now 💰

**Best for:** Standard e-commerce, fixed-price sales

### How It Works
- Seller sets a fixed price
- Buyer can purchase immediately at that price
- Simple, straightforward transaction

### Features
- `BuyNowSection` component displays:
  - Fixed price prominently
  - Deal Score badge
  - Seller information and rating
  - Stock availability
  - Discount percentage vs category average
  - "Buy Now" and "Add to Wishlist" buttons

### Database
```sql
- sale_type: 'buy_now'
- price: Fixed price in listing
- No additional tables needed
```

### Example
```
iPhone 14 Pro - $700 (Buy Now)
Stock: 1 available
Deal Score: 73 (Good)
```

---

## 2. Make an Offer 🤝

**Best for:** Negotiable items, building relationships between buyers and sellers

### How It Works
1. Buyer submits an offer with a price below the listing price
2. Seller receives notification of the offer
3. Seller can accept, reject, or counter the offer
4. Offers expire after 7 days if not responded to

### Features
- `MakeOfferSection` component with:
  - Price input with validation
  - Quick discount buttons (-10%, -25%)
  - Optional message to seller
  - Savings calculation
  - Offer status tracking
  - Current offer display for existing buyers

### Database Tables
```sql
-- offers table
id (UUID)
listing_id (FK)
buyer_id (FK)
offered_price (DECIMAL)
status (pending/accepted/rejected/expired)
message (TEXT)
expires_at (TIMESTAMP - default 7 days)
created_at, updated_at
```

### Server Actions
```typescript
// lib/actions/offers.ts
createOffer(listingId, buyerId, offeredPrice, message)
getListingOffers(listingId)          // Get all offers for a listing
getBuyerOffer(listingId, buyerId)    // Get buyer's pending offer
acceptOffer(offerId)                 // Seller action
rejectOffer(offerId)                 // Seller action
updateOffer(offerId, newPrice, msg)  // Buyer can revise offer
```

### Example Flow
```
1. Seller lists iPhone 14 Pro for $700
2. Buyer submits offer: $600 with message "Can you do $600?"
3. Seller sees offer notification
4. Seller accepts → Transaction proceeds
   OR rejects → Buyer can submit new offer
   OR ignores → Offer expires in 7 days
```

---

## 3. Tody Drop 📉

**Best for:** Creating urgency, flash sales, clearing inventory

### How It Works
1. Seller sets:
   - Starting price (e.g., $400)
   - Minimum price (e.g., $150)
   - Duration (e.g., 24 hours)
2. Price drops linearly from start to minimum over the duration
3. First buyer to purchase at their desired price gets it
4. Price updates every second in real-time

### Dynamic Price Formula
```
Current Price = Start Price - ((Elapsed Time / Total Time) × (Start Price - Min Price))

Example:
- Start: $400
- Min: $150
- Duration: 24 hours
- After 12 hours: $400 - ((12/24) × $250) = $275
```

### Features
- `TodyDropSection` component with:
  - Real-time price updates (every second)
  - Animated price bars showing:
    - Price drop progress
    - Time elapsed progress
  - Current price prominently displayed
  - Price comparison (started at, current, floor)
  - Savings amount
  - "Buy Now at This Price!" CTA
  - Countdown timer to completion

### Database
```sql
-- In listings table
sale_type: 'drop'
price: Starting price
drop_min_price: Minimum price (floor)
drop_start_time: When drop begins
drop_end_time: When drop ends (auto-calculated as 24h from creation)

-- Example:
INSERT INTO listings (..., sale_type = 'drop', price = 400, drop_min_price = 150, drop_start_time = NOW(), drop_end_time = NOW() + INTERVAL '24 hours')
```

### Real-Time Updates
- Uses interval-based updates every 1 second
- Client-side calculation (no server polling needed)
- Efficient and responsive

### Example
```
AirPods Pro - Tody Drop
Started: $400
Current: $275 (after 12 hours)
Floor: $150
Time Left: 12:00:00

Price Progress: ▓▓▓▓░░░░░░ 50%
Time Progress:  ▓▓▓▓▓░░░░░ 50%

Save: $125 (31% off!)
```

---

## 4. Auction 🔨

**Best for:** Collectibles, rare items, competitive pricing, time-sensitive sales

### How It Works
1. Seller creates auction with:
   - Starting bid price
   - Duration (e.g., 24 hours)
2. Buyers place bids (must be higher than current highest)
3. Real-time bid updates using Supabase
4. Highest bidder wins when auction ends
5. Automatic status management (pending → active → ended)

### Features
- `AuctionSection` component with:
  - Current highest bid display
  - Starting bid information
  - Real-time bid list (top 10 bids)
  - Countdown timer with status
  - Bid form with validation
  - Quick bid buttons (+$1, +$5, +$10, +$25)
  - Auction status indicator
  - Bidder information (name, avatar)
  - Bid history with bidder details

### Database Tables
```sql
-- auctions table
id (UUID)
listing_id (UUID, UNIQUE)
starting_price (DECIMAL)
current_price (DECIMAL)
highest_bidder_id (UUID, nullable)
start_time (TIMESTAMP)
end_time (TIMESTAMP)
status (pending/active/ended/canceled)
created_at, updated_at

-- bids table
id (UUID)
auction_id (UUID)
bidder_id (UUID)
amount (DECIMAL)
created_at
```

### Server Actions
```typescript
// lib/actions/bids.ts
placeBid(auctionId, bidderId, amount)
getAuctionWithBids(auctionId)
getAuctionByListingId(listingId)
getAuctionStatus(startTime, endTime) // pending/active/ended
formatBidPrice(amount)
```

### Auction Lifecycle
```
State: pending
└─ start_time arrives
   ├─ State: active
   │  ├─ Bids can be placed
   │  ├─ Real-time updates
   │  └─ end_time arrives
   │     └─ State: ended
   │        └─ Highest bidder wins
   └─ (or seller cancels → State: canceled)
```

### Example
```
Vintage Camera - Auction
Starting Bid: $50
Current Bid: $125 (by Mike Johnson)
Total Bids: 8

Bid History:
#1 - $125 - Mike Johnson (You) 🏆
#2 - $110 - Jane Smith
#3 - $100 - Alex Rivera
#4 - $75 - Sam Lee
...

Time Remaining: 05:30:45

[Your Bid: $135] [Place Bid!]
[Quick Actions: +$1 | +$5 | +$10 | +$25]
```

---

## Implementation Details

### File Structure
```
lib/
├── actions/
│   ├── listings.ts     (Fetch listings with scores)
│   ├── offers.ts       (Create/accept/reject offers)
│   └── bids.ts         (Place bids, get auction data)
├── utils/
│   ├── distance.ts     (Location calculations)
│   ├── dealScore.ts    (Deal score algorithm)
│   └── pricing.ts      (Tody Drop formula, price formatting)
└── types.ts            (TypeScript interfaces)

app/
├── components/
│   ├── BuyNowSection.tsx       (Fixed price purchase)
│   ├── MakeOfferSection.tsx    (Offer negotiation)
│   ├── TodyDropSection.tsx     (Dynamic pricing)
│   ├── AuctionSection.tsx      (Bidding system)
│   └── CountdownTimer.tsx      (Real-time countdown)
├── marketplace/
│   └── page.tsx                (Listings grid)
└── product/
    └── [id]/
        └── page.tsx            (Product detail page)

migrations/
├── 001_initial_schema.sql      (Core tables)
├── 002_seed_demo_data.sql      (Demo listings)
├── 003_add_offers_table.sql    (Offers feature)
└── 004_add_sale_type_examples.sql (Example data)
```

### Real-Time Features

#### Countdown Timers
- `CountdownTimer` component
- Updates every second
- Used by all sale methods
- Shows HH:MM:SS format
- Changes color for urgency

#### Tody Drop Dynamic Pricing
- Client-side calculation
- No server polling needed
- Updates every second
- Efficient interval-based approach

#### Auction Bidding (Future Enhancement)
- Can integrate Supabase Realtime for:
  - Live bid notifications
  - Instant highest bidder updates
  - Multi-user bid conflicts
  
```typescript
// Future Supabase Realtime integration
const channel = supabase
  .channel(`auction:${auctionId}`)
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'bids' },
    (payload) => {
      // Update UI with new bid
    }
  )
  .subscribe()
```

---

## Buyer Guide

### Which Method Should I Choose?

**Buy Now** - I want it immediately
- Fixed price, no negotiation
- Best for popular items
- Fast transaction

**Make an Offer** - I want to negotiate
- Propose your price
- Seller might counter
- Flexible pricing
- Personal communication

**Tody Drop** - I want to wait for the best price
- Price gets better over time
- Must buy before it expires
- Creates urgency
- Risk: Someone beats you to it

**Auction** - I want to compete for a deal
- Bid against other buyers
- Highest bid wins
- Exciting competitive experience
- Good for unique/collectible items

---

## Seller Guide

### Which Method Should I Choose?

**Buy Now** - I know my exact price
- Quick, straightforward sales
- No negotiation overhead
- Best for commodities

**Make an Offer** - I'm flexible on price
- Accept higher offers than expected
- Build buyer relationships
- Better than rejecting sales

**Tody Drop** - I want to create urgency
- Generate excitement
- Move inventory fast
- Clear lower-value stock
- Create multiple transactions over time

**Auction** - I'm selling something unique
- Maximize price through competition
- Collectible items
- Rare/one-of-a-kind products
- Good for items with unpredictable value

---

## Testing

### Test Data Included
```sql
-- migrations/004_add_sale_type_examples.sql

Buy Now:     iPhone 14 Pro ($700)
Make Offer:  (Added to buy_now listings)
Tody Drop:   AirPods Pro ($400 → $150)
Auction:     Vintage Camera (starts $50)
```

### Test Workflows

**Test Buy Now with Make an Offer:**
1. Go to product page
2. Review price and deal score
3. Click "Make an Offer"
4. Submit offer with message
5. Verify offer created

**Test Tody Drop:**
1. Go to product page
2. Watch price update every second
3. See progress bars move
4. Wait for next second update
5. Verify calculations correct

**Test Auction Bidding:**
1. Go to auction product
2. Place initial bid ($50+)
3. View bid history
4. Place higher bid
5. Become highest bidder

---

## Performance Considerations

- **Offer Validation**: Check constraints in DB
- **Bid Validation**: Validate minimum bid amount
- **Real-Time Updates**: Efficient interval-based (not polling)
- **Database Indexes**: All foreign keys and status fields indexed
- **Image Optimization**: Lazy loading with Next.js Image

---

## Future Enhancements

1. **Supabase Realtime** for live auction updates
2. **Counter-offers** for more negotiation options
3. **Auto-bid** for auctions (set max bid, auto-increment)
4. **Reserve prices** for auctions
5. **Bulk operations** for sellers
6. **Analytics dashboard** for sellers
7. **Payment processing** (Stripe integration)
8. **Escrow system** for secure transactions

---

Ready to sell? Choose your sale method and let Tody's unique Deal Score algorithm help buyers find you! 🚀
