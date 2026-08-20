-- Add Offers table for Make an Offer feature
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offered_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,

  -- Constraints
  CONSTRAINT offered_price_positive CHECK (offered_price > 0),
  CONSTRAINT expires_after_created CHECK (expires_at > created_at),
  CONSTRAINT one_pending_offer_per_buyer CHECK (
    NOT (status = 'pending' AND EXISTS (
      SELECT 1 FROM offers o2
      WHERE o2.listing_id = offers.listing_id
      AND o2.buyer_id = offers.buyer_id
      AND o2.status = 'pending'
      AND o2.id != offers.id
    ))
  )
);

-- Create indexes for offers
CREATE INDEX idx_offers_listing_id ON offers(listing_id);
CREATE INDEX idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_created_at ON offers(created_at);
CREATE INDEX idx_offers_expires_at ON offers(expires_at);

-- Create trigger for offers updated_at
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update listings table to support drop pricing
-- Add columns for drop pricing (if not exists, ignored if already present)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS drop_min_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS drop_start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS drop_end_time TIMESTAMP;

-- Add constraint to check drop pricing is properly configured for drop listings
ALTER TABLE listings
ADD CONSTRAINT check_drop_pricing CHECK (
  (sale_type != 'drop') OR (
    drop_min_price IS NOT NULL AND
    drop_start_time IS NOT NULL AND
    drop_end_time IS NOT NULL AND
    drop_min_price > 0 AND
    drop_end_time > drop_start_time
  )
);
