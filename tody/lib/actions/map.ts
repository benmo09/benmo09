'use server'

import { createClient } from '@supabase/supabase-js'
import { calculateDealScore } from '@/lib/utils/dealScore'
import { calculateDistance } from '@/lib/utils/distance'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface MapListingResult {
  id: string
  title: string
  price: number
  quantity: number
  latitude: number
  longitude: number
  deal_score: number
  sale_type: string
  created_at: string
  users: {
    full_name: string
    rating: number
  }
}

export async function getListingsForMap(
  userLatitude: number,
  userLongitude: number,
  radiusKm: number = 50,
  limit: number = 100
) {
  try {
    // Get all active listings
    const { data: listings, error } = await supabase
      .from('listings')
      .select(
        `
        id, title, price, quantity, latitude, longitude,
        created_at, sale_type, status,
        users:seller_id(full_name, rating)
      `
      )
      .eq('status', 'active')
      .eq('admin_status', 'approved')
      .limit(limit)

    if (error) {
      return { error: error.message }
    }

    if (!listings || listings.length === 0) {
      return { success: true, listings: [] }
    }

    // Filter by radius and calculate deal scores
    const resultsWithScore: MapListingResult[] = listings
      .filter(listing => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          listing.latitude || 0,
          listing.longitude || 0
        )
        return distance <= radiusKm
      })
      .map(listing => {
        const timeUrgency = Math.max(0, 7 - (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          listing.latitude || 0,
          listing.longitude || 0
        )

        const dealScore = calculateDealScore(
          listing.price,
          timeUrgency,
          distance,
          listing.price // Assume average price for comparison
        )

        return {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          quantity: listing.quantity,
          latitude: listing.latitude || 0,
          longitude: listing.longitude || 0,
          deal_score: Math.round(dealScore),
          sale_type: listing.sale_type,
          created_at: listing.created_at,
          users: listing.users,
        }
      })
      .sort((a, b) => b.deal_score - a.deal_score)

    return { success: true, listings: resultsWithScore }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch listings',
    }
  }
}

export async function getListingsInBounds(
  northLatitude: number,
  southLatitude: number,
  eastLongitude: number,
  westLongitude: number,
  userLatitude: number,
  userLongitude: number
) {
  try {
    // Get listings in map bounds
    const { data: listings, error } = await supabase
      .from('listings')
      .select(
        `
        id, title, price, quantity, latitude, longitude,
        created_at, sale_type, status,
        users:seller_id(full_name, rating)
      `
      )
      .eq('status', 'active')
      .eq('admin_status', 'approved')
      .gte('latitude', southLatitude)
      .lte('latitude', northLatitude)
      .gte('longitude', westLongitude)
      .lte('longitude', eastLongitude)
      .limit(200)

    if (error) {
      return { error: error.message }
    }

    if (!listings || listings.length === 0) {
      return { success: true, listings: [] }
    }

    // Calculate deal scores
    const resultsWithScore: MapListingResult[] = listings.map(listing => {
      const timeUrgency = Math.max(0, 7 - (Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        listing.latitude || 0,
        listing.longitude || 0
      )

      const dealScore = calculateDealScore(
        listing.price,
        timeUrgency,
        distance,
        listing.price
      )

      return {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        quantity: listing.quantity,
        latitude: listing.latitude || 0,
        longitude: listing.longitude || 0,
        deal_score: Math.round(dealScore),
        sale_type: listing.sale_type,
        created_at: listing.created_at,
        users: listing.users,
      }
    })

    return { success: true, listings: resultsWithScore }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch listings',
    }
  }
}
