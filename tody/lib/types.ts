// Database types
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'buyer' | 'seller' | 'admin'
  lat: number | null
  lng: number | null
  rating: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  category_id: string
  sale_type: 'buy_now' | 'auction' | 'drop'
  condition: 'new' | 'like_new' | 'used' | 'refurbished'
  quantity: number
  lat: number
  lng: number
  images: string[]
  tags: string[]
  status: 'active' | 'sold' | 'expired' | 'hidden'
  created_at: string
  expires_at: string
  updated_at: string
}

export interface ListingWithSeller extends Listing {
  seller: {
    full_name: string | null
    avatar_url: string | null
    rating: number
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
