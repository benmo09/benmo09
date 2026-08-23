// Database types - Complete Tody Platform Schema

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone_number: string | null
  bio: string | null
  role: 'buyer' | 'seller' | 'admin'
  seller_tier: 'standard' | 'business' | 'premium'
  status: 'active' | 'suspended' | 'banned' | 'pending_verification'
  lat: number | null
  lng: number | null
  rating: number
  risk_score: number
  total_sales_count: number
  total_purchases_count: number
  verified_at: string | null
  last_login: string | null
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  language_code: string
  currency_code: string
  timezone: string | null
  notification_preferences: Record<string, boolean>
  created_at: string
  updated_at: string
}

// ============================================
// CATEGORY & PRODUCT TYPES
// ============================================

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  display_order: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================
// LISTING & SALE TYPE INTERFACES
// ============================================

export type ListingStatus = 'active' | 'sold' | 'expired' | 'hidden' | 'pending_approval' | 'rejected'
export type SaleType = 'buy_now' | 'auction' | 'offer' | 'drop' | 'tody_live' | 'rental'
export type ListingCondition = 'new' | 'like_new' | 'used' | 'refurbished' | 'vintage'

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  category_id: string
  sale_type: SaleType
  condition: ListingCondition
  quantity: number
  lat: number
  lng: number
  images: string[]
  tags: string[]
  status: ListingStatus
  admin_status: ListingStatus
  admin_notes: string | null
  is_featured: boolean
  boost_level: number
  boost_expires_at: string | null
  created_at: string
  expires_at: string
  updated_at: string
}

export interface ListingWithSeller extends Listing {
  seller: {
    full_name: string | null
    avatar_url: string | null
    rating: number
    seller_tier: 'standard' | 'business' | 'premium'
  }
}

export interface ListingWithDealScore extends ListingWithSeller {
  dealScore: number
  distance: number
  timeRemaining: number
  categoryAvgPrice: number
}

export interface MarketplaceFilters {
  userLat: number
  userLng: number
  radiusKm?: number
  categoryId?: string
  sortBy?: 'dealScore' | 'price' | 'distance' | 'newest'
  priceMin?: number
  priceMax?: number
}

// ============================================
// AUCTION TYPES
// ============================================

export interface Auction {
  id: string
  listing_id: string
  start_price: number
  current_bid: number | null
  current_bidder_id: string | null
  bid_count: number
  start_time: string
  end_time: string
  final_bidder_id: string | null
  status: 'pending' | 'active' | 'ended' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface AuctionBid {
  id: string
  auction_id: string
  bidder_id: string
  bid_amount: number
  bid_time: string
  created_at: string
}

// ============================================
// OFFER TYPES (Make an Offer)
// ============================================

export interface Offer {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  offered_price: number
  message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at: string
  created_at: string
  updated_at: string
}

// ============================================
// TODY DROP TYPES (Auto-declining Prices)
// ============================================

export interface TodyDrop {
  id: string
  listing_id: string
  start_price: number
  current_price: number
  final_price: number
  decline_per_hour: number
  start_time: string
  end_time: string
  sold_to_id: string | null
  status: 'active' | 'sold' | 'expired' | 'cancelled'
  created_at: string
  updated_at: string
}

// ============================================
// TODY LIVE TYPES (Live Shopping)
// ============================================

export interface TodyLiveSession {
  id: string
  seller_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  stream_url: string | null
  status: 'scheduled' | 'live' | 'ended' | 'cancelled'
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  viewer_count: number
  total_sales: number
  created_at: string
}

export interface TodyLiveProduct {
  id: string
  session_id: string
  listing_id: string | null
  title: string
  price: number
  quantity_available: number
  quantity_sold: number
  display_order: number | null
  created_at: string
}

// ============================================
// TODY STAYS TYPES (Vacation Rentals)
// ============================================

export interface Stay {
  id: string
  host_id: string
  title: string
  description: string | null
  category: string
  address: string
  lat: number
  lng: number
  price_per_night: number
  bedrooms: number
  bathrooms: number
  max_guests: number
  amenities: string[]
  rules: string[]
  images: string[]
  rating: number | null
  review_count: number
  status: 'active' | 'hidden' | 'booked' | 'maintenance'
  created_at: string
  updated_at: string
}

export interface StayBooking {
  id: string
  stay_id: string
  guest_id: string
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}

// ============================================
// FEED & SOCIAL TYPES
// ============================================

export interface FeedPost {
  id: string
  user_id: string
  content_type: 'text' | 'image' | 'video' | 'product' | 'live'
  title: string | null
  description: string | null
  media_urls: string[]
  video_duration: number | null
  thumbnail_url: string | null
  product_ids: string[]
  listing_id: string | null
  live_session_id: string | null
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  status: 'published' | 'draft' | 'deleted' | 'hidden'
  created_at: string
  updated_at: string
}

export interface FeedComment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id: string | null
  like_count: number
  created_at: string
  updated_at: string
}

// ============================================
// MESSAGING TYPES
// ============================================

export interface Conversation {
  id: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  read_at: string | null
  created_at: string
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | 'new_bid'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'auction_won'
  | 'auction_outbid'
  | 'price_drop'
  | 'listing_approved'
  | 'listing_rejected'
  | 'message_received'
  | 'sale_completed'
  | 'payment_received'
  | 'promotion'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  data: Record<string, any> | null
  is_read: boolean
  read_at: string | null
  related_entity_id: string | null
  created_at: string
}

// ============================================
// REVIEW & RATING TYPES
// ============================================

export interface Review {
  id: string
  reviewer_id: string
  reviewed_user_id: string
  listing_id: string | null
  rating: number
  title: string | null
  comment: string | null
  verified_purchase: boolean
  helpful_count: number
  images: string[]
  created_at: string
  updated_at: string
}

// ============================================
// WISHLIST TYPES
// ============================================

export interface Wishlist {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
}

export interface WishlistItem {
  id: string
  wishlist_id: string
  listing_id: string
  added_at: string
}

// ============================================
// TRANSACTION & PAYMENT TYPES
// ============================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed'
export type PaymentMethod = 'stripe' | 'paypal' | 'wallet' | 'bank_transfer'
export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'local_pickup' | 'mail'

export interface Transaction {
  id: string
  listing_id: string | null
  buyer_id: string
  seller_id: string
  amount: number
  platform_fee: number
  seller_payout: number
  status: PaymentStatus
  payment_method: PaymentMethod | null
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  stripe_connect_account_id: string | null
  escrow_released_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Shipment {
  id: string
  transaction_id: string
  seller_id: string
  buyer_id: string
  shipping_method: ShippingMethod
  carrier: string | null
  tracking_number: string | null
  from_address: string
  to_address: string
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
  shipped_at: string | null
  delivered_at: string | null
  estimated_delivery: string | null
  created_at: string
}

// ============================================
// SELLER ANALYTICS TYPES
// ============================================

export interface SellerStats {
  id: string
  seller_id: string
  total_listings: number
  active_listings: number
  total_sales: number
  total_revenue: number
  average_rating: number | null
  review_count: number
  response_rate: number
  avg_response_time: number | null
  repeat_buyer_count: number
  cancellation_rate: number
  last_updated: string
}

export interface SellerPerformance {
  id: string
  seller_id: string
  date: string
  views_count: number | null
  click_count: number | null
  conversion_count: number | null
  revenue: number | null
  created_at: string
}
