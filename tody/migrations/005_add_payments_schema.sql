-- Add payments and orders schema for Tody

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',           -- Order created, awaiting payment
  'payment_intent',    -- PaymentIntent created
  'paid',              -- Payment captured, in escrow
  'confirmed',         -- Buyer confirmed receipt
  'completed',         -- Payout to seller completed
  'disputed',          -- Buyer opened dispute
  'refunded',          -- Order refunded
  'canceled'           -- Order canceled
);

-- Orders table (tracks all transactions)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL, -- 5% of price
  seller_payout DECIMAL(10, 2) NOT NULL, -- price - platform_fee
  status order_status DEFAULT 'pending',

  -- Stripe info
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),

  -- Timeline
  created_at TIMESTAMP DEFAULT NOW(),
  payment_confirmed_at TIMESTAMP,
  buyer_confirmed_at TIMESTAMP,
  payout_completed_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',

  -- Metadata
  buyer_message TEXT,
  cancellation_reason TEXT,

  CONSTRAINT price_positive CHECK (price > 0),
  CONSTRAINT platform_fee_positive CHECK (platform_fee > 0),
  CONSTRAINT seller_payout_positive CHECK (seller_payout > 0),
  CONSTRAINT seller_not_buyer CHECK (seller_id != buyer_id)
);

-- Create indexes for orders
CREATE INDEX idx_orders_listing_id ON orders(listing_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_expires_at ON orders(expires_at);
CREATE INDEX idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);

-- Payment history table (tracks all payment events)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- payment_intent_created, charge_succeeded, payout_completed, etc
  stripe_event_id VARCHAR(255) UNIQUE,
  status VARCHAR(50), -- succeeded, failed, pending, etc
  amount DECIMAL(10, 2),
  metadata JSONB, -- Store raw Stripe event data
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for payment events
CREATE INDEX idx_payment_events_order_id ON payment_events(order_id);
CREATE INDEX idx_payment_events_event_type ON payment_events(event_type);
CREATE INDEX idx_payment_events_stripe_event_id ON payment_events(stripe_event_id);

-- Payouts table (tracks seller payouts)
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_transit, paid, failed
  stripe_payout_id VARCHAR(255),
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Create indexes for payouts
CREATE INDEX idx_payouts_seller_id ON payouts(seller_id);
CREATE INDEX idx_payouts_order_id ON payouts(order_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created_at ON payouts(created_at);

-- Escrow holds table (tracks funds on hold)
CREATE TABLE IF NOT EXISTS escrow_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  charge_id VARCHAR(255), -- Stripe charge ID
  held_at TIMESTAMP DEFAULT NOW(),
  release_scheduled_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
  released_at TIMESTAMP,
  released_reason VARCHAR(100), -- buyer_confirmed, auto_release, dispute_resolved

  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Create indexes for escrow holds
CREATE INDEX idx_escrow_holds_order_id ON escrow_holds(order_id);
CREATE INDEX idx_escrow_holds_release_scheduled_at ON escrow_holds(release_scheduled_at);
CREATE INDEX idx_escrow_holds_released_at ON escrow_holds(released_at);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  initiated_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open', -- open, under_review, resolved
  resolution TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for disputes
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_initiated_by_id ON disputes(initiated_by_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at);

-- Create trigger for orders updated_at (if not using default)
CREATE TRIGGER update_orders_status
  BEFORE UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_updated_at_column();

-- View for seller payouts due
CREATE OR REPLACE VIEW payouts_due AS
SELECT
  seller_id,
  SUM(seller_payout) as total_amount,
  COUNT(*) as order_count,
  MAX(buyer_confirmed_at) as latest_confirmation
FROM orders
WHERE status = 'confirmed'
  AND payout_completed_at IS NULL
  AND (buyer_confirmed_at IS NOT NULL OR (created_at + INTERVAL '24 hours') < NOW())
GROUP BY seller_id;

-- View for active escrow holds
CREATE OR REPLACE VIEW active_escrow AS
SELECT
  eh.id,
  eh.order_id,
  eh.amount,
  o.seller_id,
  o.buyer_id,
  eh.release_scheduled_at,
  EXTRACT(EPOCH FROM (eh.release_scheduled_at - NOW())) / 3600 as hours_until_release
FROM escrow_holds eh
JOIN orders o ON eh.order_id = o.id
WHERE eh.released_at IS NULL
  AND o.status IN ('paid', 'confirmed');
