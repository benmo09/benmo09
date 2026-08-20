'use server'

import { supabase } from '@/lib/supabase'
import { calculateDistance } from '@/lib/utils/distance'
import { calculateDealScore } from '@/lib/utils/dealScore'
import type {
  Listing,
  ListingWithSeller,
  ListingWithDealScore,
  MarketplaceFilters,
} from '@/lib/types'

// Fetch active listings with seller info within 24 hour expiry
export async function getActiveListings(
  filters: MarketplaceFilters
): Promise<ListingWithDealScore[]> {
  const now = new Date()
  const radiusKm = filters.radiusKm || 50

  try {
    // Fetch active listings that haven't expired
    let query = supabase
      .from('listings')
      .select(`
        *,
        seller:users!user_id(
          full_name,
          avatar_url,
          rating
        ),
        category:categories(id, name)
      `)
      .eq('status', 'active')
      .gt('expires_at', now.toISOString())
      .eq('sale_type', 'buy_now')

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin)
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax)
    }

    const { data: listings, error } = await query

    if (error) throw error
    if (!listings) return []

    // Calculate average price per category
    const categoryAverages = await getCategoryAveragePrices()

    // Filter by distance and calculate deal scores
    const enrichedListings: ListingWithDealScore[] = listings
      .map((listing: any) => {
        const distance = calculateDistance(
          filters.userLat,
          filters.userLng,
          listing.lat,
          listing.lng
        )

        // Skip if outside radius
        if (distance > radiusKm) return null

        const categoryAvgPrice = categoryAverages[listing.category_id] || listing.price
        const timeRemaining =
          new Date(listing.expires_at).getTime() - now.getTime()

        const dealScore = calculateDealScore({
          price: listing.price,
          categoryAvgPrice,
          timeRemaining,
          distance,
        })

        return {
          ...listing,
          seller: listing.seller?.[0] || {
            full_name: 'Unknown',
            avatar_url: null,
            rating: 0,
          },
          dealScore,
          distance: Math.round(distance * 10) / 10,
          timeRemaining,
          categoryAvgPrice,
        }
      })
      .filter((item): item is ListingWithDealScore => item !== null)

    // Sort by specified criteria
    return sortListings(enrichedListings, filters.sortBy || 'dealScore')
  } catch (error) {
    console.error('Error fetching listings:', error)
    return []
  }
}

// Get average price for each category
async function getCategoryAveragePrices(): Promise<
  Record<string, number>
> {
  try {
    const now = new Date()

    const { data, error } = await supabase.rpc(
      'get_category_avg_prices',
      {
        current_time: now.toISOString(),
      }
    )

    if (error) {
      // Fallback: calculate in application
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('category_id, price')
        .eq('status', 'active')
        .gt('expires_at', now.toISOString())

      if (listingsError || !listings) return {}

      const averages: Record<string, number> = {}
      const counts: Record<string, number> = {}

      listings.forEach((listing: any) => {
        averages[listing.category_id] =
          (averages[listing.category_id] || 0) + listing.price
        counts[listing.category_id] = (counts[listing.category_id] || 0) + 1
      })

      Object.keys(averages).forEach((categoryId) => {
        averages[categoryId] = Math.round(averages[categoryId] / counts[categoryId])
      })

      return averages
    }

    // Convert RPC result to record
    const result: Record<string, number> = {}
    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        result[row.category_id] = row.avg_price || row.price
      })
    }
    return result
  } catch (error) {
    console.error('Error calculating category averages:', error)
    return {}
  }
}

// Sort listings by criteria
function sortListings(
  listings: ListingWithDealScore[],
  sortBy: string
): ListingWithDealScore[] {
  const sorted = [...listings]

  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => a.price - b.price)
    case 'distance':
      return sorted.sort((a, b) => a.distance - b.distance)
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'dealScore':
    default:
      return sorted.sort((a, b) => b.dealScore - a.dealScore)
  }
}

// Get single listing with deal score
export async function getListingWithScore(
  listingId: string,
  userLat: number,
  userLng: number
): Promise<ListingWithDealScore | null> {
  try {
    const { data: listing, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!user_id(
          full_name,
          avatar_url,
          rating
        )
      `)
      .eq('id', listingId)
      .single()

    if (error || !listing) return null

    const now = new Date()
    const distance = calculateDistance(
      userLat,
      userLng,
      listing.lat,
      listing.lng
    )
    const categoryAverages = await getCategoryAveragePrices()
    const categoryAvgPrice = categoryAverages[listing.category_id] || listing.price
    const timeRemaining = new Date(listing.expires_at).getTime() - now.getTime()

    const dealScore = calculateDealScore({
      price: listing.price,
      categoryAvgPrice,
      timeRemaining,
      distance,
    })

    return {
      ...listing,
      seller: listing.seller?.[0] || {
        full_name: 'Unknown',
        avatar_url: null,
        rating: 0,
      },
      dealScore,
      distance: Math.round(distance * 10) / 10,
      timeRemaining,
      categoryAvgPrice,
    }
  } catch (error) {
    console.error('Error fetching listing:', error)
    return null
  }
}
