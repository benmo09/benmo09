'use server'

import { supabase } from '@/lib/supabase'
import type { Wishlist, WishlistItem } from '@/lib/types'

// Create a wishlist
export async function createWishlist(
  userId: string,
  name: string,
  description?: string,
  isPublic = false
): Promise<{ success: boolean; wishlist?: Wishlist; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userId,
        name,
        description: description || null,
        is_public: isPublic,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, wishlist: data as Wishlist }
  } catch (error) {
    console.error('Error creating wishlist:', error)
    return { success: false, error: 'Failed to create wishlist' }
  }
}

// Get user's wishlists
export async function getUserWishlists(userId: string): Promise<{ success: boolean; wishlists?: Wishlist[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, wishlists: data as Wishlist[] }
  } catch (error) {
    console.error('Error fetching wishlists:', error)
    return { success: false, error: 'Failed to fetch wishlists' }
  }
}

// Get wishlist with items
export async function getWishlistWithItems(wishlistId: string): Promise<{
  success: boolean
  wishlist?: Wishlist & { items: any[] }
  error?: string
}> {
  try {
    const { data: wishlist, error: wishlistError } = await supabase
      .from('wishlists')
      .select('*')
      .eq('id', wishlistId)
      .single()

    if (wishlistError) throw wishlistError

    const { data: items, error: itemsError } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        listing:listings(*)
      `)
      .eq('wishlist_id', wishlistId)
      .order('added_at', { ascending: false })

    if (itemsError) throw itemsError

    return {
      success: true,
      wishlist: {
        ...(wishlist as Wishlist),
        items: (items || []).map((item: any) => item.listing),
      },
    }
  } catch (error) {
    console.error('Error fetching wishlist with items:', error)
    return { success: false, error: 'Failed to fetch wishlist' }
  }
}

// Add item to wishlist
export async function addToWishlist(
  wishlistId: string,
  listingId: string
): Promise<{ success: boolean; item?: WishlistItem; error?: string }> {
  try {
    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlistId)
      .eq('listing_id', listingId)
      .single()

    if (existing) {
      return { success: true, item: existing as WishlistItem }
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({
        wishlist_id: wishlistId,
        listing_id: listingId,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, item: data as WishlistItem }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return { success: false, error: 'Failed to add to wishlist' }
  }
}

// Remove item from wishlist
export async function removeFromWishlist(wishlistId: string, listingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlistId)
      .eq('listing_id', listingId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return { success: false, error: 'Failed to remove from wishlist' }
  }
}

// Check if item is in wishlist
export async function isInWishlist(wishlistId: string, listingId: string): Promise<{ success: boolean; inWishlist?: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlistId)
      .eq('listing_id', listingId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Not found
      return { success: true, inWishlist: false }
    }

    if (error) throw error
    return { success: true, inWishlist: !!data }
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return { success: false, error: 'Failed to check wishlist' }
  }
}

// Update wishlist
export async function updateWishlist(
  wishlistId: string,
  userId: string,
  updates: Partial<Wishlist>
): Promise<{ success: boolean; wishlist?: Wishlist; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .update(updates)
      .eq('id', wishlistId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { success: true, wishlist: data as Wishlist }
  } catch (error) {
    console.error('Error updating wishlist:', error)
    return { success: false, error: 'Failed to update wishlist' }
  }
}

// Delete wishlist
export async function deleteWishlist(wishlistId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete all items first
    const { error: itemsError } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlistId)

    if (itemsError) throw itemsError

    // Delete wishlist
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting wishlist:', error)
    return { success: false, error: 'Failed to delete wishlist' }
  }
}

// Get all listings saved by user across wishlists
export async function getUserSavedListings(userId: string): Promise<{ success: boolean; listings?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('get_user_saved_listings', { user_id: userId })

    if (error) throw error
    return { success: true, listings: data || [] }
  } catch (error) {
    console.error('Error fetching saved listings:', error)
    return { success: false, error: 'Failed to fetch saved listings' }
  }
}
