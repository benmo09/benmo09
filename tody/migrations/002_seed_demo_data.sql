-- Seed demo data for testing
-- Run this after creating the schema

-- Insert demo users (sellers and buyers)
INSERT INTO users (id, email, full_name, role, lat, lng, avatar_url, rating, verification_status) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'seller1@example.com', 'John Smith', 'seller', 40.7128, -74.0060, NULL, 4.8, 'verified'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'seller2@example.com', 'Jane Doe', 'seller', 40.7580, -73.9855, NULL, 4.5, 'verified'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'seller3@example.com', 'Mike Johnson', 'seller', 40.7489, -73.9680, NULL, 4.9, 'verified'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'buyer@example.com', 'Alex Rivera', 'buyer', 40.7505, -73.9776, NULL, 4.7, 'verified');

-- Insert demo categories
INSERT INTO categories (id, name, slug, description, icon, parent_id) VALUES
  ('c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Electronics', 'electronics', 'Electronic devices and gadgets', '📱', NULL),
  ('c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2', 'Smartphones', 'smartphones', 'Mobile phones and accessories', '📱', 'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'),
  ('c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3', 'Laptops', 'laptops', 'Computers and laptop computers', '💻', 'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'),
  ('c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a4', 'Furniture', 'furniture', 'Home and office furniture', '🛋️', NULL),
  ('c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a5', 'Clothing', 'clothing', 'Apparel and fashion', '👕', NULL);

-- Insert demo listings (active, not expired)
INSERT INTO listings (
  id, user_id, title, description, price, category_id, sale_type, condition, quantity,
  lat, lng, images, tags, status, created_at, expires_at
) VALUES
  -- Smartphone listings
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'iPhone 14 Pro - Like New',
    'Excellent condition iPhone 14 Pro with original box and accessories. Barely used.',
    700,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2',
    'buy_now',
    'like_new',
    1,
    40.7128, -74.0060,
    ARRAY['https://via.placeholder.com/400x300?text=iPhone14Pro'],
    ARRAY['iphone', 'smartphone', 'apple'],
    'active',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '22 hours'
  ),
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1b',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Samsung Galaxy S23 Ultra',
    'Brand new, sealed in box. Never opened. Full warranty included.',
    800,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2',
    'buy_now',
    'new',
    2,
    40.7580, -73.9855,
    ARRAY['https://via.placeholder.com/400x300?text=GalaxyS23'],
    ARRAY['samsung', 'android', 'flagship'],
    'active',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '23 hours'
  ),
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1c',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Google Pixel 8 Pro - Great Price',
    'Lightly used Google Pixel 8 Pro. Works perfectly. Some minor scratches on back.',
    550,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2',
    'buy_now',
    'used',
    1,
    40.7489, -73.9680,
    ARRAY['https://via.placeholder.com/400x300?text=Pixel8Pro'],
    ARRAY['google', 'pixel', 'android'],
    'active',
    NOW() - INTERVAL '3 hours',
    NOW() + INTERVAL '21 hours'
  ),

  -- Laptop listings
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1d',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'MacBook Pro 16" M2 - Excellent',
    'Powerful MacBook Pro with M2 chip. 16GB RAM, 512GB SSD. Perfect for development and creative work.',
    1200,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3',
    'buy_now',
    'like_new',
    1,
    40.7128, -74.0060,
    ARRAY['https://via.placeholder.com/400x300?text=MacBookPro'],
    ARRAY['macbook', 'apple', 'laptop', 'work'],
    'active',
    NOW() - INTERVAL '4 hours',
    NOW() + INTERVAL '20 hours'
  ),
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1e',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Dell XPS 13 - Super Deal',
    'Compact and powerful Dell XPS 13 ultrabook. Intel i7, 16GB RAM, 512GB SSD. Minimal use.',
    750,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3',
    'buy_now',
    'like_new',
    1,
    40.7580, -73.9855,
    ARRAY['https://via.placeholder.com/400x300?text=DellXPS13'],
    ARRAY['dell', 'xps', 'laptop', 'ultrabook'],
    'active',
    NOW() - INTERVAL '2 hours',
    NOW() + INTERVAL '22 hours'
  ),

  -- Furniture listings
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1f',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Modern Leather Sofa - Must Go',
    'Beautiful modern leather sofa. Charcoal color. Slight wear but very comfortable. Moving sale.',
    450,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a4',
    'buy_now',
    'used',
    1,
    40.7489, -73.9680,
    ARRAY['https://via.placeholder.com/400x300?text=ModernSofa'],
    ARRAY['furniture', 'sofa', 'leather', 'home'],
    'active',
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '18 hours'
  ),
  (
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a1',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Standing Desk - Home Office Setup',
    'Electric standing desk with memory presets. Height adjustable from 28" to 48". Barely used.',
    300,
    'c1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a4',
    'buy_now',
    'like_new',
    1,
    40.7128, -74.0060,
    ARRAY['https://via.placeholder.com/400x300?text=StandingDesk'],
    ARRAY['desk', 'furniture', 'office', 'work'],
    'active',
    NOW() - INTERVAL '1 hour',
    NOW() + INTERVAL '23 hours'
  );

-- Create index for PostGIS queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_listings_geom ON listings USING GIST (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);

-- Optional: Create a view for category average prices
CREATE OR REPLACE VIEW category_avg_prices AS
SELECT
  category_id,
  ROUND(AVG(price)::numeric, 2) as avg_price,
  COUNT(*) as listing_count,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM listings
WHERE status = 'active' AND expires_at > NOW()
GROUP BY category_id;
