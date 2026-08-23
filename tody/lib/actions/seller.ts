'use server'

import { supabase } from '@/lib/supabase'
import type { SellerStats, SellerPerformance } from '@/lib/types'

// Get seller statistics
export async function getSellerStats(sellerId: string): Promise<{
  success: boolean
  stats?: SellerStats & { user: any }
  error?: string
}> {
  try {
    let { data: stats, error } = await supabase
      .from('seller_stats')
      .select(
        `
        *,
        user:users!seller_id(id, full_name, avatar_url, rating)
      `
      )
      .eq('seller_id', sellerId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Create default stats if they don't exist
      const { data: newStats, error: createError } = await supabase
        .from('seller_stats')
        .insert({
          seller_id: sellerId,
          total_listings: 0,
          active_listings: 0,
          total_sales: 0,
          total_revenue: 0,
          average_rating: null,
          review_count: 0,
          response_rate: 0,
          avg_response_time: null,
          repeat_buyer_count: 0,
          cancellation_rate: 0,
        })
        .select()
        .single()

      if (createError) throw createError
      stats = newStats
    } else if (error) {
      throw error
    }

    return {
      success: true,
      stats: {
        ...stats,
        user: stats.user?.[0] || null,
      },
    }
  } catch (error) {
    console.error('Error fetching seller stats:', error)
    return { success: false, error: 'Failed to fetch seller statistics' }
  }
}

// Get seller performance metrics
export async function getSellerPerformance(
  sellerId: string,
  days = 30
): Promise<{ success: boolean; performance?: SellerPerformance[]; error?: string }> {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: performance, error } = await supabase
      .from('seller_performance')
      .select('*')
      .eq('seller_id', sellerId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error

    return { success: true, performance: performance as SellerPerformance[] }
  } catch (error) {
    console.error('Error fetching seller performance:', error)
    return { success: false, error: 'Failed to fetch performance metrics' }
  }
}

// Record performance metric
export async function recordPerformanceMetric(
  sellerId: string,
  views: number,
  clicks: number,
  conversions: number,
  revenue: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('seller_performance')
      .upsert(
        {
          seller_id: sellerId,
          date: today,
          views_count: views,
          click_count: clicks,
          conversion_count: conversions,
          revenue,
        },
        { onConflict: 'seller_id,date' }
      )

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error recording performance metric:', error)
    return { success: false, error: 'Failed to record metric' }
  }
}

// Get seller subscription/tier
export async function getSellerSubscription(sellerId: string): Promise<{
  success: boolean
  subscription?: any
  error?: string
}> {
  try {
    const { data: subscription, error } = await supabase
      .from('seller_subscriptions')
      .select('*')
      .eq('seller_id', sellerId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Create default standard tier subscription
      const { data: newSubscription, error: createError } = await supabase
        .from('seller_subscriptions')
        .insert({
          seller_id: sellerId,
          tier: 'standard',
          status: 'active',
          features: {
            listings: 50,
            boost_credits: 0,
            featured_listings: false,
            seller_badge: false,
            promoted_listings: false,
            analytics: false,
          },
          listing_limit: 50,
        })
        .select()
        .single()

      if (createError) throw createError
      return { success: true, subscription: newSubscription }
    } else if (error) {
      throw error
    }

    return { success: true, subscription }
  } catch (error) {
    console.error('Error fetching seller subscription:', error)
    return { success: false, error: 'Failed to fetch subscription' }
  }
}

// Upgrade to business tier
export async function upgradeToBusinessTier(
  sellerId: string,
  stripeSubscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update subscription
    const { error: subError } = await supabase
      .from('seller_subscriptions')
      .update({
        tier: 'business',
        stripe_subscription_id: stripeSubscriptionId,
        features: {
          listings: 500,
          boost_credits: 100,
          featured_listings: true,
          seller_badge: true,
          promoted_listings: true,
          analytics: true,
          api_access: true,
        },
        listing_limit: 500,
      })
      .eq('seller_id', sellerId)

    if (subError) throw subError

    // Update user tier
    const { error: userError } = await supabase
      .from('users')
      .update({ seller_tier: 'business' })
      .eq('id', sellerId)

    if (userError) throw userError

    return { success: true }
  } catch (error) {
    console.error('Error upgrading to business tier:', error)
    return { success: false, error: 'Failed to upgrade tier' }
  }
}

// Get seller's total earnings
export async function getSellerEarnings(
  sellerId: string,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; earnings?: { total: number; pending: number; available: number }; error?: string }> {
  try {
    let query = supabase
      .from('transactions')
      .select('seller_payout, status')
      .eq('seller_id', sellerId)

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: transactions, error } = await query

    if (error) throw error

    let total = 0
    let completed = 0
    let pending = 0

    ;(transactions || []).forEach((tx: any) => {
      total += tx.seller_payout || 0
      if (tx.status === 'completed') {
        completed += tx.seller_payout || 0
      } else if (tx.status === 'pending') {
        pending += tx.seller_payout || 0
      }
    })

    return {
      success: true,
      earnings: {
        total,
        pending,
        available: completed,
      },
    }
  } catch (error) {
    console.error('Error fetching seller earnings:', error)
    return { success: false, error: 'Failed to fetch earnings' }
  }
}

// Get seller's active listings
export async function getSellerListings(
  sellerId: string,
  status?: string,
  limit = 50,
  offset = 0
): Promise<{ success: boolean; listings?: any[]; total?: number; error?: string }> {
  try {
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('user_id', sellerId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: listings, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { success: true, listings, total: count }
  } catch (error) {
    console.error('Error fetching seller listings:', error)
    return { success: false, error: 'Failed to fetch listings' }
  }
}

// Get seller's recent orders
export async function getSellerOrders(
  sellerId: string,
  limit = 50,
  offset = 0
): Promise<{ success: boolean; orders?: any[]; error?: string }> {
  try {
    const { data: orders, error } = await supabase
      .from('transactions')
      .select(
        `
        *,
        buyer:users!buyer_id(id, full_name, avatar_url),
        listing:listings!listing_id(id, title)
      `
      )
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const enriched = (orders || []).map((order: any) => ({
      ...order,
      buyer: order.buyer?.[0] || null,
      listing: order.listing?.[0] || null,
    }))

    return { success: true, orders: enriched }
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}

// Get seller reviews
export async function getSellerReviews(
  sellerId: string,
  limit = 50,
  offset = 0
): Promise<{ success: boolean; reviews?: any[]; averageRating?: number; error?: string }> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(
        `
        *,
        reviewer:users!reviewer_id(id, full_name, avatar_url)
      `
      )
      .eq('reviewed_user_id', sellerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const enriched = (reviews || []).map((review: any) => ({
      ...review,
      reviewer: review.reviewer?.[0] || null,
    }))

    const avgRating =
      enriched.length > 0
        ? enriched.reduce((sum: number, r: any) => sum + r.rating, 0) / enriched.length
        : 0

    return { success: true, reviews: enriched, averageRating: avgRating }
  } catch (error) {
    console.error('Error fetching seller reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

// Get boost credits for seller
export async function getBoostCredits(sellerId: string): Promise<{ success: boolean; credits?: number; error?: string }> {
  try {
    const { data: subscription, error } = await supabase
      .from('seller_subscriptions')
      .select('boost_credits')
      .eq('seller_id', sellerId)
      .single()

    if (error) throw error

    return { success: true, credits: subscription.boost_credits || 0 }
  } catch (error) {
    console.error('Error fetching boost credits:', error)
    return { success: false, error: 'Failed to fetch boost credits' }
  }
}

// Apply boost to listing
export async function boostListing(
  listingId: string,
  sellerId: string,
  days: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check subscription has credits
    const { data: subscription, error: subError } = await supabase
      .from('seller_subscriptions')
      .select('boost_credits')
      .eq('seller_id', sellerId)
      .single()

    if (subError) throw subError
    if (!subscription || subscription.boost_credits < days) {
      return { success: false, error: 'Insufficient boost credits' }
    }

    // Update listing
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    const { error: listingError } = await supabase
      .from('listings')
      .update({
        boost_level: days,
        boost_expires_at: expiresAt.toISOString(),
      })
      .eq('id', listingId)
      .eq('user_id', sellerId)

    if (listingError) throw listingError

    // Deduct credits
    const { error: creditError } = await supabase
      .from('seller_subscriptions')
      .update({
        boost_credits: subscription.boost_credits - days,
      })
      .eq('seller_id', sellerId)

    if (creditError) throw creditError

    return { success: true }
  } catch (error) {
    console.error('Error boosting listing:', error)
    return { success: false, error: 'Failed to boost listing' }
  }
}
