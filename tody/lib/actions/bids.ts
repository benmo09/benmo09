'use server'

import { supabase } from '@/lib/supabase'

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  bidder_name?: string
  bidder_avatar?: string
  created_at: string
}

export interface AuctionData {
  id: string
  listing_id: string
  starting_price: number
  current_price: number
  highest_bidder_id: string | null
  start_time: string
  end_time: string
  status: 'pending' | 'active' | 'ended' | 'canceled'
  bids: Bid[]
}

// Place a bid on an auction
export async function placeBid(
  auctionId: string,
  bidderId: string,
  amount: number
): Promise<Bid | null> {
  try {
    // Get current auction state
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) throw new Error('Auction not found')

    // Validate bid amount
    if (amount <= auction.current_price) {
      throw new Error('Bid must be higher than current price')
    }

    // Create bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        bidder_id: bidderId,
        amount,
      })
      .select()
      .single()

    if (bidError) throw bidError

    // Update auction with new highest bid
    const { error: updateError } = await supabase
      .from('auctions')
      .update({
        current_price: amount,
        highest_bidder_id: bidderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', auctionId)

    if (updateError) throw updateError

    return bid
  } catch (error) {
    console.error('Error placing bid:', error)
    return null
  }
}

// Get auction with bids
export async function getAuctionWithBids(auctionId: string): Promise<AuctionData | null> {
  try {
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) return null

    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select(`
        *,
        bidder:users!bidder_id(
          full_name,
          avatar_url
        )
      `)
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })

    if (bidsError) throw bidsError

    const enrichedBids = (bids || []).map((bid: any) => ({
      ...bid,
      bidder_name: bid.bidder?.[0]?.full_name || 'Anonymous',
      bidder_avatar: bid.bidder?.[0]?.avatar_url,
    }))

    return {
      ...auction,
      bids: enrichedBids,
    }
  } catch (error) {
    console.error('Error fetching auction:', error)
    return null
  }
}

// Get auction by listing ID
export async function getAuctionByListingId(listingId: string): Promise<AuctionData | null> {
  try {
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('listing_id', listingId)
      .single()

    if (auctionError || !auction) return null

    const { data: bids, error: bidsError } = await supabase
      .from('bids')
      .select(`
        *,
        bidder:users!bidder_id(
          full_name,
          avatar_url
        )
      `)
      .eq('auction_id', auction.id)
      .order('amount', { ascending: false })

    if (bidsError) throw bidsError

    const enrichedBids = (bids || []).map((bid: any) => ({
      ...bid,
      bidder_name: bid.bidder?.[0]?.full_name || 'Anonymous',
      bidder_avatar: bid.bidder?.[0]?.avatar_url,
    }))

    return {
      ...auction,
      bids: enrichedBids,
    }
  } catch (error) {
    console.error('Error fetching auction by listing:', error)
    return null
  }
}

// Utility functions moved to lib/utils/bidding.ts
// Import them from there instead
