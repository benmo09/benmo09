'use server'

import { supabase } from '@/lib/supabase'
import type { Notification, NotificationType } from '@/lib/types'

// Create a notification
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message?: string,
  data?: Record<string, any>,
  relatedEntityId?: string
): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || null,
        related_entity_id: relatedEntityId,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, notification: notification as Notification }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

// Get notifications for user
export async function getUserNotifications(
  userId: string,
  limit = 50,
  offset = 0,
  unreadOnly = false
): Promise<{ success: boolean; notifications?: Notification[]; totalUnread?: number; error?: string }> {
  try {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get unread count
    const { data: unreadData } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false)

    return {
      success: true,
      notifications: notifications as Notification[],
      totalUnread: unreadData?.length || 0,
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { success: false, error: 'Failed to fetch notifications' }
  }
}

// Mark notification as read
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: 'Failed to mark as read' }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error marking all as read:', error)
    return { success: false, error: 'Failed to mark all as read' }
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting notification:', error)
    return { success: false, error: 'Failed to delete notification' }
  }
}

// Delete all notifications for user
export async function deleteAllNotifications(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting notifications:', error)
    return { success: false, error: 'Failed to delete notifications' }
  }
}

// Notify on new bid
export async function notifyNewBid(
  auctionListingId: string,
  buyerId: string,
  sellerId: string,
  bidAmount: number
): Promise<void> {
  try {
    await createNotification(
      sellerId,
      'new_bid',
      'New bid on your auction',
      `Someone placed a bid of $${(bidAmount / 100).toFixed(2)} on your listing`,
      { auction_listing_id: auctionListingId, bid_amount: bidAmount, bidder_id: buyerId },
      auctionListingId
    )
  } catch (error) {
    console.error('Error notifying new bid:', error)
  }
}

// Notify on offer received
export async function notifyOfferReceived(
  offerId: string,
  sellerId: string,
  buyerId: string,
  offerPrice: number,
  listingTitle: string
): Promise<void> {
  try {
    await createNotification(
      sellerId,
      'offer_received',
      'New offer received',
      `${buyerId} made an offer of $${(offerPrice / 100).toFixed(2)} on "${listingTitle}"`,
      { offer_id: offerId, offer_price: offerPrice, buyer_id: buyerId },
      offerId
    )
  } catch (error) {
    console.error('Error notifying offer received:', error)
  }
}

// Notify on offer accepted
export async function notifyOfferAccepted(
  offerId: string,
  buyerId: string,
  listingTitle: string,
  offerPrice: number
): Promise<void> {
  try {
    await createNotification(
      buyerId,
      'offer_accepted',
      'Your offer was accepted!',
      `Your offer of $${(offerPrice / 100).toFixed(2)} on "${listingTitle}" has been accepted`,
      { offer_id: offerId },
      offerId
    )
  } catch (error) {
    console.error('Error notifying offer accepted:', error)
  }
}

// Notify on auction won
export async function notifyAuctionWon(
  auctionId: string,
  winnerId: string,
  winningBid: number,
  listingTitle: string
): Promise<void> {
  try {
    await createNotification(
      winnerId,
      'auction_won',
      'You won an auction!',
      `Congratulations! You won "${listingTitle}" with a bid of $${(winningBid / 100).toFixed(2)}`,
      { auction_id: auctionId, winning_bid: winningBid },
      auctionId
    )
  } catch (error) {
    console.error('Error notifying auction won:', error)
  }
}

// Notify on outbid
export async function notifyOutbid(
  auctionId: string,
  previousBidderId: string,
  newBidAmount: number,
  listingTitle: string
): Promise<void> {
  try {
    await createNotification(
      previousBidderId,
      'auction_outbid',
      'You have been outbid',
      `Someone placed a higher bid on "${listingTitle}". You can place a new bid`,
      { auction_id: auctionId, new_bid_amount: newBidAmount },
      auctionId
    )
  } catch (error) {
    console.error('Error notifying outbid:', error)
  }
}

// Notify on listing approval
export async function notifyListingApproved(
  listingId: string,
  sellerId: string,
  listingTitle: string
): Promise<void> {
  try {
    await createNotification(
      sellerId,
      'listing_approved',
      'Your listing has been approved',
      `"${listingTitle}" is now live on the marketplace`,
      { listing_id: listingId },
      listingId
    )
  } catch (error) {
    console.error('Error notifying listing approved:', error)
  }
}

// Notify on listing rejection
export async function notifyListingRejected(
  listingId: string,
  sellerId: string,
  listingTitle: string,
  reason?: string
): Promise<void> {
  try {
    await createNotification(
      sellerId,
      'listing_rejected',
      'Your listing was rejected',
      reason || `"${listingTitle}" did not meet our guidelines`,
      { listing_id: listingId, reason },
      listingId
    )
  } catch (error) {
    console.error('Error notifying listing rejected:', error)
  }
}

// Notify on sale completed
export async function notifySaleCompleted(
  transactionId: string,
  buyerId: string,
  sellerId: string,
  amount: number,
  listingTitle: string
): Promise<void> {
  try {
    const saleAmount = `$${(amount / 100).toFixed(2)}`

    // Notify buyer
    await createNotification(
      buyerId,
      'sale_completed',
      'Purchase confirmed',
      `You successfully purchased "${listingTitle}" for ${saleAmount}`,
      { transaction_id: transactionId, amount },
      transactionId
    )

    // Notify seller
    await createNotification(
      sellerId,
      'payment_received',
      'Payment received',
      `You sold "${listingTitle}" for ${saleAmount}`,
      { transaction_id: transactionId, amount },
      transactionId
    )
  } catch (error) {
    console.error('Error notifying sale completed:', error)
  }
}

// Notify on price drop
export async function notifyPriceDrop(
  listingId: string,
  userId: string,
  listingTitle: string,
  oldPrice: number,
  newPrice: number
): Promise<void> {
  try {
    const savings = oldPrice - newPrice
    await createNotification(
      userId,
      'price_drop',
      'Price drop on your saved item!',
      `"${listingTitle}" dropped from $${(oldPrice / 100).toFixed(2)} to $${(newPrice / 100).toFixed(2)} (Save $${(savings / 100).toFixed(2)})`,
      {
        listing_id: listingId,
        old_price: oldPrice,
        new_price: newPrice,
      },
      listingId
    )
  } catch (error) {
    console.error('Error notifying price drop:', error)
  }
}
