-- Insert examples of each sale type for demo

-- 1. Example Tody Drop listing
INSERT INTO listings (
  id, user_id, title, description, price, category_id, sale_type, condition, quantity,
  lat, lng, images, tags, status, created_at, expires_at,
  drop_min_price, drop_start_time, drop_end_time
) VALUES
  (
    '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'AirPods Pro - Dynamic Price Drop',
    'Brand new AirPods Pro with active noise cancellation. Price drops every hour!',
    400,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2',
    'drop',
    'new',
    3,
    40.7128, -74.0060,
    ARRAY['https://via.placeholder.com/400x300?text=AirPodsPro'],
    ARRAY['airpods', 'wireless', 'audio'],
    'active',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '10 hours',
    150,
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '22 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Create auction listing and corresponding auction record
INSERT INTO listings (
  id, user_id, title, description, price, category_id, sale_type, condition, quantity,
  lat, lng, images, tags, status, created_at, expires_at
) VALUES
  (
    '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Vintage Camera - Auction Ends Tonight',
    'Beautiful vintage film camera from the 1970s. Perfect condition. No starting price, bids start at $50.',
    50,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    'auction',
    'used',
    1,
    40.7580, -73.9855,
    ARRAY['https://via.placeholder.com/400x300?text=VintageCamera'],
    ARRAY['camera', 'vintage', 'photography'],
    'active',
    NOW() - INTERVAL '12 hours',
    NOW() + INTERVAL '12 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert auction details
INSERT INTO auctions (
  id, listing_id, starting_price, current_price, start_time, end_time, status
) VALUES
  (
    '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d',
    '3c3c3c3c-3c3c-3c3c-3c3c-3c3c3c3c3c3c',
    50,
    75,
    NOW() - INTERVAL '12 hours',
    NOW() + INTERVAL '12 hours',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert some example bids for the auction
INSERT INTO bids (auction_id, bidder_id, amount, created_at) VALUES
  (
    '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    50.00,
    NOW() - INTERVAL '8 hours'
  ),
  (
    '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    60.00,
    NOW() - INTERVAL '5 hours'
  ),
  (
    '4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    75.00,
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT DO NOTHING;

-- 3. Add example offers for a buy_now listing
INSERT INTO offers (
  listing_id, buyer_id, offered_price, status, message, expires_at
) VALUES
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    600.00,
    'pending',
    'Would you accept $600? In a hurry to get this phone.',
    NOW() + INTERVAL '7 days'
  ),
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    650.00,
    'pending',
    'Can you do $650?',
    NOW() + INTERVAL '7 days'
  )
ON CONFLICT DO NOTHING;

-- Update category average prices view
DROP VIEW IF EXISTS category_avg_prices;
CREATE VIEW category_avg_prices AS
SELECT
  category_id,
  ROUND(AVG(price)::numeric, 2) as avg_price,
  COUNT(*) as listing_count,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM listings
WHERE status = 'active' AND expires_at > NOW()
GROUP BY category_id;
