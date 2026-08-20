'use server'

import { supabase } from '@/lib/supabase'
import type { Listing } from '@/lib/types'

export interface Offer {
  id: string
  listing_id: string
  buyer_id: string
  offered_price: number
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  message?: string
  buyer_name?: string
  buyer_avatar?: string
  created_at: string
  updated_at: string
  expires_at: string
}

// Create a new offer
export async function createOffer(
  listingId: string,
  buyerId: string,
  offeredPrice: number,
  message?: string
): Promise<Offer | null> {
  try {
    // Set offer to expire in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('offers')
      .insert({
        listing_id: listingId,
        buyer_id: buyerId,
        offered_price: offeredPrice,
        message: message || null,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating offer:', error)
    return null
  }
}

// Get offers for a listing
export async function getListingOffers(listingId: string): Promise<Offer[]> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        buyer:users!buyer_id(
          full_name,
          avatar_url
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((offer: any) => ({
      ...offer,
      buyer_name: offer.buyer?.[0]?.full_name || 'Anonymous',
      buyer_avatar: offer.buyer?.[0]?.avatar_url,
    }))
  } catch (error) {
    console.error('Error fetching offers:', error)
    return []
  }
}

// Get buyer's offers for a listing
export async function getBuyerOffer(
  listingId: string,
  buyerId: string
): Promise<Offer | null> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .eq('status', 'pending')
      .single()

    if (error) return null
    return data
  } catch (error) {
    console.error('Error fetching buyer offer:', error)
    return null
  }
}

// Accept offer (seller action)
export async function acceptOffer(offerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('offers')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', offerId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error accepting offer:', error)
    return false
  }
}

// Reject offer (seller action)
export async function rejectOffer(offerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('offers')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', offerId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error rejecting offer:', error)
    return false
  }
}

// Update offer with new price (buyer can revise)
export async function updateOffer(
  offerId: string,
  newPrice: number,
  message?: string
): Promise<Offer | null> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .update({
        offered_price: newPrice,
        message: message || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offerId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating offer:', error)
    return null
  }
}
