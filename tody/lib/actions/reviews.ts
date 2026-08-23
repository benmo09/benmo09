'use server'

import { supabase } from '@/lib/supabase'
import type { Review } from '@/lib/types'

// Create a review
export async function createReview(
  reviewerId: string,
  reviewedUserId: string,
  rating: number,
  title: string,
  comment: string,
  listingId?: string,
  images?: string[]
): Promise<{ success: boolean; review?: Review; error?: string }> {
  try {
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' }
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: reviewerId,
        reviewed_user_id: reviewedUserId,
        listing_id: listingId,
        rating,
        title,
        comment,
        images: images || [],
        verified_purchase: !!listingId, // Mark as verified if from a listing
      })
      .select()
      .single()

    if (error) throw error

    // Update seller's average rating
    await updateSellerRating(reviewedUserId)

    return { success: true, review: data as Review }
  } catch (error) {
    console.error('Error creating review:', error)
    return { success: false, error: 'Failed to create review' }
  }
}

// Get reviews for a user
export async function getUserReviews(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ success: boolean; reviews?: (Review & { reviewer: any })[]; averageRating?: number; error?: string }> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviewer_id(id, full_name, avatar_url)
      `)
      .eq('reviewed_user_id', userId)
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
    console.error('Error fetching reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

// Get reviews with filters
export async function getReviewsWithFilters(
  userId: string,
  minRating?: number,
  sortBy: 'helpful' | 'recent' | 'rating' = 'recent'
): Promise<{ success: boolean; reviews?: any[]; error?: string }> {
  try {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviewer_id(id, full_name, avatar_url)
      `)
      .eq('reviewed_user_id', userId)

    if (minRating !== undefined) {
      query = query.gte('rating', minRating)
    }

    let orderBy: 'helpful_count' | 'created_at' | 'rating' = 'created_at'
    let ascending = false

    switch (sortBy) {
      case 'helpful':
        orderBy = 'helpful_count'
        ascending = false
        break
      case 'rating':
        orderBy = 'rating'
        ascending = false
        break
      default:
        orderBy = 'created_at'
        ascending = false
    }

    const { data, error } = await query.order(orderBy, { ascending })

    if (error) throw error

    const enriched = (data || []).map((review: any) => ({
      ...review,
      reviewer: review.reviewer?.[0] || null,
    }))

    return { success: true, reviews: enriched }
  } catch (error) {
    console.error('Error fetching filtered reviews:', error)
    return { success: false, error: 'Failed to fetch reviews' }
  }
}

// Mark review as helpful
export async function markReviewAsHelpful(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single()

    if (fetchError) throw fetchError

    const { error } = await supabase
      .from('reviews')
      .update({ helpful_count: (review.helpful_count || 0) + 1 })
      .eq('id', reviewId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error marking review as helpful:', error)
    return { success: false, error: 'Failed to mark as helpful' }
  }
}

// Update seller rating
async function updateSellerRating(sellerId: string): Promise<void> {
  try {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_user_id', sellerId)

    if (!reviews || reviews.length === 0) return

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await supabase
      .from('users')
      .update({ rating: avgRating })
      .eq('id', sellerId)
  } catch (error) {
    console.error('Error updating seller rating:', error)
  }
}

// Delete a review
export async function deleteReview(reviewId: string, reviewerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('reviewer_id', reviewerId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting review:', error)
    return { success: false, error: 'Failed to delete review' }
  }
}

// Get review statistics
export async function getReviewStats(userId: string): Promise<{
  success: boolean
  stats?: { totalReviews: number; averageRating: number; ratingBreakdown: Record<number, number> }
  error?: string
}> {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_user_id', userId)

    if (error) throw error

    const totalReviews = reviews?.length || 0
    const averageRating =
      totalReviews > 0 ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews?.forEach((r) => {
      ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1
    })

    return {
      success: true,
      stats: {
        totalReviews,
        averageRating,
        ratingBreakdown,
      },
    }
  } catch (error) {
    console.error('Error getting review stats:', error)
    return { success: false, error: 'Failed to get review statistics' }
  }
}
