-- Complete Tody Platform Schema
-- This migration creates all tables needed for the full Tody marketplace specification

-- ============================================
-- USER SYSTEM & ROLES
-- ============================================

-- User roles and seller tiers
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE seller_tier AS ENUM ('standard', 'business', 'premium');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'pending_verification');

-- Users table (extended from existing)
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS seller_tier seller_tier DEFAULT 'standard';
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'active';
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS verification_code TEXT;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS total_sales_count INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS total_purchases_count INTEGER DEFAULT 0;

-- ============================================
-- PRODUCT CATEGORIES & TYPES
-- ============================================

-- Extended categories for all product types mentioned in spec
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Pre-load main categories from spec
INSERT INTO categories (name, slug, description) VALUES
  ('Real Estate', 'real-estate', 'Houses, apartments, commercial property'),
  ('Vehicles', 'vehicles', 'Cars, motorcycles, trucks, boats'),
  ('Rentals', 'rentals', 'Short-term and long-term rentals'),
  ('Electronics', 'electronics', 'Phones, computers, appliances'),
  ('Fashion', 'fashion', 'Clothing, shoes, accessories'),
  ('Services', 'services', 'Professional and personal services'),
  ('Food & Drink', 'food-drink', 'Groceries, restaurants, expiring items'),
  ('Last Minute Deals', 'last-minute-deals', 'Quick sales and expiring products'),
  ('Books & Media', 'books-media', 'Books, movies, music'),
  ('Home & Garden', 'home-garden', 'Furniture, decor, gardening'),
  ('Sports & Outdoors', 'sports-outdoors', 'Equipment and gear'),
  ('Toys & Games', 'toys-games', 'Toys, games, hobbies')
ON CONFLICT DO NOTHING;

-- ============================================
-- LISTINGS & SALES TYPES
-- ============================================

-- Extended listing status and sale types
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'expired', 'hidden', 'pending_approval', 'rejected');
CREATE TYPE sale_type AS ENUM ('buy_now', 'auction', 'offer', 'drop', 'tody_live', 'rental');
CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'used', 'refurbished', 'vintage');

-- Main listings table (extended)
ALTER TABLE IF EXISTS listings ADD COLUMN IF NOT EXISTS admin_status listing_status DEFAULT 'pending_approval';
ALTER TABLE IF EXISTS listings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE IF EXISTS listings ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE IF EXISTS listings ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE IF EXISTS listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS listings ADD COLUMN IF NOT EXISTS boost_level INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS listings ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP;

-- ============================================
-- AUCTION SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
  start_price BIGINT NOT NULL,
  current_bid BIGINT,
  current_bidder_id UUID REFERENCES users(id),
  bid_count INTEGER DEFAULT 0,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  final_bidder_id UUID REFERENCES users(id),
  status ENUM('pending', 'active', 'ended', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES users(id),
  bid_amount BIGINT NOT NULL,
  bid_time TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- OFFERS SYSTEM (Make an Offer)
-- ============================================

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  offered_price BIGINT NOT NULL,
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- TODY DROP (Auto-declining Prices)
-- ============================================

CREATE TABLE IF NOT EXISTS tody_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
  start_price BIGINT NOT NULL,
  current_price BIGINT NOT NULL,
  final_price BIGINT NOT NULL,
  decline_per_hour BIGINT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  sold_to_id UUID REFERENCES users(id),
  status ENUM('active', 'sold', 'expired', 'cancelled') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- TODY LIVE (Live Shopping/Video)
-- ============================================

CREATE TABLE IF NOT EXISTS tody_live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_url TEXT,
  status ENUM('scheduled', 'live', 'ended', 'cancelled') DEFAULT 'scheduled',
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  viewer_count INTEGER DEFAULT 0,
  total_sales BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tody_live_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES tody_live_sessions(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id),
  title TEXT NOT NULL,
  price BIGINT NOT NULL,
  quantity_available INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tody_live_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES tody_live_sessions(id),
  product_id UUID NOT NULL REFERENCES tody_live_products(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  quantity INTEGER NOT NULL,
  price_paid BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- TODY STAYS (Vacation Rentals/Hospitality)
-- ============================================

CREATE TABLE IF NOT EXISTS stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'hotel', 'apartment', 'house', 'room', 'cottage', etc.
  address TEXT NOT NULL,
  lat NUMERIC(10, 8) NOT NULL,
  lng NUMERIC(11, 8) NOT NULL,
  price_per_night BIGINT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC(3, 1) NOT NULL,
  max_guests INTEGER NOT NULL,
  amenities TEXT[], -- JSON array: 'wifi', 'pool', 'kitchen', etc.
  rules TEXT[], -- House rules
  images TEXT[],
  rating NUMERIC(3, 2),
  review_count INTEGER DEFAULT 0,
  status ENUM('active', 'hidden', 'booked', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stay_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stay_id UUID NOT NULL REFERENCES stays(id),
  guest_id UUID NOT NULL REFERENCES users(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INTEGER NOT NULL,
  total_price BIGINT NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- FEED & SOCIAL SYSTEM (Vertical Scrolling Like TikTok)
-- ============================================

CREATE TABLE IF NOT EXISTS feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  content_type ENUM('text', 'image', 'video', 'product', 'live') NOT NULL,
  title TEXT,
  description TEXT,
  media_urls TEXT[],
  video_duration INTEGER, -- seconds
  thumbnail_url TEXT,
  product_ids UUID[], -- For product showcase posts
  listing_id UUID REFERENCES listings(id),
  live_session_id UUID REFERENCES tody_live_sessions(id),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status ENUM('published', 'draft', 'deleted', 'hidden') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES feed_comments(id),
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- MESSAGING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES users(id),
  participant_2_id UUID NOT NULL REFERENCES users(id),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- NOTIFICATIONS SYSTEM
-- ============================================

CREATE TYPE notification_type AS ENUM (
  'new_bid',
  'offer_received',
  'offer_accepted',
  'offer_rejected',
  'auction_won',
  'auction_outbid',
  'price_drop',
  'listing_approved',
  'listing_rejected',
  'message_received',
  'sale_completed',
  'payment_received',
  'promotion',
  'system'
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB, -- Additional context like listing_id, offer_id, etc.
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  related_entity_id UUID, -- ID of related listing, offer, auction, etc.
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewed_user_id UUID NOT NULL REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  transaction_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  images TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- WISHLIST & SAVED ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id),
  added_at TIMESTAMP DEFAULT now(),
  UNIQUE(wishlist_id, listing_id)
);

-- ============================================
-- SEARCH & RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- DEALS & PROMOTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed_amount', 'free_shipping') NOT NULL,
  discount_value BIGINT NOT NULL,
  min_purchase_amount BIGINT,
  max_discount_amount BIGINT,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  seller_id UUID REFERENCES users(id), -- NULL for platform promotions
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotion_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id),
  code TEXT NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- PAYMENTS & TRANSACTIONS
-- ============================================

CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE payment_method AS ENUM ('stripe', 'paypal', 'wallet', 'bank_transfer');

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  amount BIGINT NOT NULL, -- in cents
  platform_fee BIGINT NOT NULL,
  seller_payout BIGINT NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method payment_method,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_connect_account_id TEXT,
  escrow_released_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- REFUNDS & DISPUTES
-- ============================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  amount BIGINT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  stripe_refund_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  initiator_id UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status ENUM('open', 'in_review', 'resolved', 'closed') DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- SHIPPING & LOGISTICS
-- ============================================

CREATE TYPE shipping_method AS ENUM ('standard', 'express', 'overnight', 'local_pickup', 'mail');

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  shipping_method shipping_method NOT NULL,
  carrier TEXT, -- 'fedex', 'ups', 'usps', 'local', etc.
  tracking_number TEXT,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  status ENUM('pending', 'picked_up', 'in_transit', 'delivered', 'failed') DEFAULT 'pending',
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  estimated_delivery TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- SELLER DASHBOARD & ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS seller_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES users(id),
  total_listings INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  total_sales BIGINT DEFAULT 0,
  total_revenue BIGINT DEFAULT 0,
  average_rating NUMERIC(3, 2),
  review_count INTEGER DEFAULT 0,
  response_rate NUMERIC(5, 2),
  avg_response_time INTEGER, -- hours
  repeat_buyer_count INTEGER DEFAULT 0,
  cancellation_rate NUMERIC(5, 2),
  last_updated TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seller_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  views_count INTEGER,
  click_count INTEGER,
  conversion_count INTEGER,
  revenue BIGINT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(seller_id, date)
);

-- ============================================
-- ADMIN & COMPLIANCE
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- INTERNATIONALIZATION (Multi-language & Currency)
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  language_code TEXT DEFAULT 'en', -- 'en', 'es', 'fr', 'de', 'ja', 'zh', etc.
  currency_code TEXT DEFAULT 'USD', -- 'USD', 'EUR', 'GBP', etc.
  timezone TEXT,
  notification_preferences JSONB, -- Which notification types to receive
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(18, 8) NOT NULL,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- ============================================
-- SELLER BUSINESS TIER FEATURES
-- ============================================

CREATE TABLE IF NOT EXISTS seller_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL UNIQUE REFERENCES users(id),
  tier seller_tier NOT NULL DEFAULT 'standard',
  stripe_subscription_id TEXT,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  features JSONB, -- JSON of tier features
  boost_credits INTEGER DEFAULT 0,
  listing_limit INTEGER,
  started_at TIMESTAMP DEFAULT now(),
  ends_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_expires_at ON listings(expires_at);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING gist(ll_to_earth(lat, lng));

CREATE INDEX IF NOT EXISTS idx_auctions_listing_id ON auctions(listing_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_id ON auction_bids(auction_id);

CREATE INDEX IF NOT EXISTS idx_offers_listing_id ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_feed_posts_user_id ON feed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON feed_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1_id, participant_2_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_guest_id ON stay_bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_stay_bookings_check_in ON stay_bookings(check_in_date, check_out_date);

-- ============================================
-- ENABLE POSTGIS (if not already enabled)
-- ============================================

CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
