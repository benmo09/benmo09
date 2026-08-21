-- Add admin role and flags to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Add status to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'approved' CHECK (admin_status IN ('pending', 'approved', 'rejected', 'frozen'));
ALTER TABLE listings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);

-- System settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Platform fee configuration
  platform_fee_percentage DECIMAL(5, 2) DEFAULT 5.00,
  min_platform_fee INT DEFAULT 0,  -- Minimum fee in cents

  -- Feature toggles
  enable_auctions BOOLEAN DEFAULT TRUE,
  enable_offers BOOLEAN DEFAULT TRUE,
  enable_tody_drop BOOLEAN DEFAULT TRUE,
  enable_messaging BOOLEAN DEFAULT TRUE,

  -- Country/region settings
  active_countries TEXT[], -- Array of country codes

  -- Category management
  active_categories UUID[],  -- Array of category IDs

  -- Payment settings
  minimum_transaction_amount INT DEFAULT 100,  -- cents
  maximum_transaction_amount INT DEFAULT 1000000,  -- cents
  stripe_processing_enabled BOOLEAN DEFAULT TRUE,

  -- Moderation settings
  auto_moderate_listings BOOLEAN DEFAULT FALSE,
  require_listing_approval BOOLEAN DEFAULT FALSE,
  spam_detection_enabled BOOLEAN DEFAULT TRUE,

  -- Rate limiting
  max_listings_per_day INT DEFAULT 50,
  max_messages_per_hour INT DEFAULT 100,

  -- Maintenance mode
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if not exists
INSERT INTO system_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,  -- e.g., 'listing_approved', 'user_blocked', 'setting_updated'

  -- What was affected
  entity_type TEXT NOT NULL,  -- 'listing', 'user', 'setting', 'category', etc
  entity_id UUID,  -- ID of the affected entity (if applicable)
  entity_name TEXT,  -- Human-readable name of affected entity

  -- Change details
  old_values JSONB,  -- Previous values
  new_values JSONB,  -- New values
  reason TEXT,  -- Admin-provided reason (optional)

  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
CREATE INDEX IF NOT EXISTS idx_users_risk_score ON users(risk_score);
CREATE INDEX IF NOT EXISTS idx_listings_admin_status ON listings(admin_status);
CREATE INDEX IF NOT EXISTS idx_listings_reviewed_by ON listings(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);

-- View for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT
  -- Revenue metrics
  (SELECT COUNT(*) FROM orders WHERE status = 'completed') as total_completed_orders,
  (SELECT COALESCE(SUM(platform_fee), 0) FROM orders WHERE status = 'completed') as total_platform_fees,
  (SELECT COALESCE(SUM(price * quantity), 0) FROM orders WHERE status = 'completed') as total_gmv,

  -- User metrics
  (SELECT COUNT(*) FROM users WHERE role = 'user') as total_buyers,
  (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers,
  (SELECT COUNT(*) FROM users WHERE is_blocked = TRUE) as blocked_users,

  -- Listing metrics
  (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_listings,
  (SELECT COUNT(*) FROM listings WHERE admin_status = 'pending') as pending_listings,
  (SELECT COUNT(*) FROM listings WHERE admin_status = 'rejected') as rejected_listings,
  (SELECT COUNT(*) FROM listings WHERE admin_status = 'frozen') as frozen_listings,
  (SELECT COUNT(*) FROM listings WHERE created_at > NOW() - INTERVAL '24 hours') as listings_24h,

  -- Recent activity
  (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '24 hours') as orders_24h,
  (SELECT COUNT(*) FROM bids WHERE created_at > NOW() - INTERVAL '24 hours') as bids_24h,
  (SELECT COUNT(*) FROM offers WHERE created_at > NOW() - INTERVAL '24 hours') as offers_24h
FROM (SELECT 1) as dummy;

-- Middleware helper: Check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM users WHERE id = user_id AND role = 'admin' AND is_blocked = FALSE
  )
$$ LANGUAGE SQL SECURITY DEFINER;
