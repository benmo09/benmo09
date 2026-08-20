# Tody Platform - Development Plan

## Overview
Tody is a marketplace platform built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Auth + DB), and Shadcn UI.

## Tech Stack
- **Frontend**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Authentication & Database**: Supabase
- **Maps/Geolocation**: PostGIS (Supabase)
- **Payments**: Stripe

## Development Phases

### Phase 1: Foundation & Database Setup ✅
- [x] Next.js project initialization with TypeScript and Tailwind
- [x] Supabase integration
- [ ] Database schema and migrations
- [ ] Environment configuration

### Phase 2: Authentication
- [ ] Supabase Auth setup
- [ ] User registration flow
- [ ] User login flow
- [ ] User profile management

### Phase 3: Core Features
- [ ] Listings CRUD (Create, Read, Update, Delete)
- [ ] Categories and subcategories
- [ ] Search and filtering
- [ ] Geolocation-based listing discovery

### Phase 4: Marketplace Features
- [ ] Buy Now functionality
- [ ] Auction system
- [ ] Drop (bulk sales) system
- [ ] Messaging between users

### Phase 5: Payments & Seller Tools
- [ ] Stripe integration
- [ ] Payment processing
- [ ] Seller dashboard
- [ ] Order management

### Phase 6: Advanced Features
- [ ] Reviews and ratings
- [ ] User verification
- [ ] Admin panel
- [ ] Analytics and reporting

## Database Schema

### Tables

#### 1. users
- `id` (UUID, Primary Key) - Auto-generated
- `email` (VARCHAR, Unique) - User email
- `full_name` (VARCHAR) - User's full name
- `avatar_url` (VARCHAR, Nullable) - Profile picture
- `role` (ENUM: buyer, seller, admin) - User role
- `phone` (VARCHAR, Nullable) - Phone number
- `address` (VARCHAR, Nullable) - Physical address
- `city` (VARCHAR, Nullable) - City
- `state` (VARCHAR, Nullable) - State/Province
- `country` (VARCHAR, Nullable) - Country
- `postal_code` (VARCHAR, Nullable) - Postal code
- `lat` (FLOAT, Nullable) - Latitude for location
- `lng` (FLOAT, Nullable) - Longitude for location
- `stripe_account_id` (VARCHAR, Nullable) - Stripe seller account
- `verification_status` (ENUM: unverified, pending, verified) - Verification state
- `rating` (FLOAT) - Average user rating
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update date

#### 2. categories
- `id` (UUID, Primary Key)
- `name` (VARCHAR) - Category name
- `slug` (VARCHAR, Unique) - URL-friendly name
- `description` (TEXT, Nullable) - Category description
- `icon` (VARCHAR, Nullable) - Icon identifier
- `parent_id` (UUID, Nullable, Foreign Key) - Parent category for subcategories
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 3. listings
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key) - Seller's user ID
- `title` (VARCHAR) - Listing title
- `description` (TEXT) - Detailed description
- `price` (DECIMAL) - Price in the primary currency
- `category_id` (UUID, Foreign Key) - Associated category
- `sale_type` (ENUM: buy_now, auction, drop) - Type of sale
- `condition` (ENUM: new, like_new, used, refurbished) - Product condition
- `quantity` (INTEGER) - Available quantity
- `lat` (FLOAT) - Latitude for geolocation
- `lng` (FLOAT) - Longitude for geolocation
- `images` (VARCHAR[]) - Array of image URLs
- `tags` (VARCHAR[]) - Search tags
- `status` (ENUM: active, sold, expired, hidden) - Listing status
- `created_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP) - Default 24 hours from creation
- `updated_at` (TIMESTAMP)

#### 4. auctions (for auction listings)
- `id` (UUID, Primary Key)
- `listing_id` (UUID, Foreign Key) - Associated listing
- `starting_price` (DECIMAL) - Starting bid price
- `current_price` (DECIMAL) - Current highest bid
- `highest_bidder_id` (UUID, Foreign Key, Nullable) - User with highest bid
- `start_time` (TIMESTAMP) - Auction start time
- `end_time` (TIMESTAMP) - Auction end time
- `status` (ENUM: pending, active, ended, canceled) - Auction status
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 5. bids (for auction bids)
- `id` (UUID, Primary Key)
- `auction_id` (UUID, Foreign Key)
- `bidder_id` (UUID, Foreign Key)
- `amount` (DECIMAL)
- `created_at` (TIMESTAMP)

#### 6. messages
- `id` (UUID, Primary Key)
- `sender_id` (UUID, Foreign Key)
- `recipient_id` (UUID, Foreign Key)
- `listing_id` (UUID, Foreign Key, Nullable) - Related listing
- `content` (TEXT)
- `read_at` (TIMESTAMP, Nullable)
- `created_at` (TIMESTAMP)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps
1. Add your Supabase credentials to `.env.local`
2. Run migrations in Supabase dashboard or via CLI
3. Set up authentication policies (RLS)
4. Begin Phase 2: Authentication implementation
