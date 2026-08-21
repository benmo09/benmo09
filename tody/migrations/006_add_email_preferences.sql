-- Email preferences table for tracking user communication opt-in/out
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Communication preferences
  sales_notifications BOOLEAN DEFAULT TRUE,        -- New sale/offer/bid notifications
  price_drop_alerts BOOLEAN DEFAULT TRUE,          -- Price drop alerts
  auction_alerts BOOLEAN DEFAULT TRUE,             -- Auction notifications
  marketing_emails BOOLEAN DEFAULT FALSE,          -- Marketing/promotional emails
  weekly_digest BOOLEAN DEFAULT TRUE,              -- Weekly summary email

  -- Email verification
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  email_verification_sent_at TIMESTAMP,

  -- Tracking
  last_email_sent_at TIMESTAMP,
  email_send_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient lookups
CREATE INDEX idx_email_preferences_user_id ON email_preferences(user_id);

-- Add email_sent_at column to payment_events for tracking
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS email_template TEXT;

-- Add email_sent_at to orders for sale notifications
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_notified_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_notified_at TIMESTAMP;

-- Add email_sent_at to bids for auction notifications
ALTER TABLE bids ADD COLUMN IF NOT EXISTS seller_notified_at TIMESTAMP;

-- Add email_sent_at to offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS seller_notified_at TIMESTAMP;
