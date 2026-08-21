'use server'

import { stripe, calculateFees, STRIPE_CONFIG } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

// ===== SELLER ONBOARDING =====

/**
 * Create a Stripe Connect Express account for seller onboarding
 */
export async function createStripeExpressAccount(
  sellerId: string,
  email: string,
  returnUrl: string
): Promise<{ accountLink: string | null; error?: string }> {
  try {
    // Create a Stripe Connected Account (Express)
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      country: 'US', // TODO: Make dynamic based on seller location
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      return_url: `${returnUrl}?account_id=${account.id}`,
      refresh_url: returnUrl,
    })

    // Save account ID to database
    const { error } = await supabase
      .from('users')
      .update({ stripe_account_id: account.id })
      .eq('id', sellerId)

    if (error) throw error

    return {
      accountLink: accountLink.url,
    }
  } catch (error) {
    console.error('Error creating Stripe Express account:', error)
    return {
      accountLink: null,
      error: error instanceof Error ? error.message : 'Failed to create Stripe account',
    }
  }
}

/**
 * Get seller's Stripe account status
 */
export async function getSellerStripeStatus(sellerId: string): Promise<{
  isOnboarded: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requirements?: string[]
}> {
  try {
    // Get seller's stripe account ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', sellerId)
      .single()

    if (userError || !user || !user.stripe_account_id) {
      return {
        isOnboarded: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      }
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripe_account_id)

    return {
      isOnboarded: account.charges_enabled && account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements?.eventually_due || [],
    }
  } catch (error) {
    console.error('Error getting Stripe status:', error)
    return {
      isOnboarded: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }
}

// ===== PAYMENT INTENT CREATION =====

/**
 * Create a PaymentIntent for checkout (with manual capture for escrow)
 */
export async function createPaymentIntent(
  orderId: string,
  amount: number, // in cents
  sellerId: string,
  buyerId: string
): Promise<{ clientSecret: string | null; error?: string }> {
  try {
    // Get seller's Stripe account
    const { data: seller, error: sellerError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', sellerId)
      .single()

    if (sellerError || !seller || !seller.stripe_account_id) {
      throw new Error('Seller has not set up Stripe account')
    }

    // Calculate fees
    const fees = calculateFees(amount)

    // Create PaymentIntent with manual capture (for escrow)
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amount, // Already in cents
        currency: 'usd',
        capture_method: 'manual', // Manual capture for escrow
        confirmation_method: 'automatic',
        application_fee_amount: fees.platformFeeAmount,
        transfer_data: {
          destination: seller.stripe_account_id,
        },
        metadata: {
          orderId,
          sellerId,
          buyerId,
          platformFee: fees.platformFeeAmount,
          sellerPayout: fees.sellerPayout,
        },
      },
      {
        stripeAccount: seller.stripe_account_id,
      }
    )

    // Save PaymentIntent ID to order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        status: 'payment_intent',
      })
      .eq('id', orderId)

    if (updateError) throw updateError

    return {
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error('Error creating PaymentIntent:', error)
    return {
      clientSecret: null,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    }
  }
}

// ===== PAYMENT CONFIRMATION & CAPTURE =====

/**
 * Confirm payment and create escrow hold
 */
export async function confirmPayment(
  orderId: string,
  paymentIntentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Confirm the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId
    )

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`)
    }

    // Get the charge ID - PaymentIntent should have latest_charge set after confirmation
    let chargeId = paymentIntent.latest_charge as string
    if (!chargeId) {
      // If latest_charge is not available, fetch the charge list
      const charges = await stripe.charges.list({ payment_intent: paymentIntentId })
      chargeId = charges.data[0]?.id
    }
    if (!chargeId) {
      throw new Error('No charge created')
    }

    // Create escrow hold record
    const { error: escrowError } = await supabase
      .from('escrow_holds')
      .insert({
        order_id: orderId,
        amount: paymentIntent.amount / 100, // Convert from cents
        charge_id: chargeId,
      })

    if (escrowError) throw escrowError

    // Update order status to PAID
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_charge_id: chargeId,
        payment_confirmed_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (orderError) throw orderError

    // Record payment event
    await recordPaymentEvent(orderId, 'payment_confirmed', 'succeeded', paymentIntent)

    return { success: true }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm payment',
    }
  }
}

// ===== ESCROW & CAPTURE =====

/**
 * Capture payment and release funds to seller
 * Called when buyer confirms receipt or after 24 hours
 */
export async function captureAndReleaseFunds(
  orderId: string,
  releaseReason: 'buyer_confirmed' | 'auto_release' = 'buyer_confirmed'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (!order.stripe_payment_intent_id) {
      throw new Error('No PaymentIntent found for order')
    }

    // Capture the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.capture(
      order.stripe_payment_intent_id
    )

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Capture failed with status: ${paymentIntent.status}`)
    }

    // Update escrow hold as released
    const { error: escrowError } = await supabase
      .from('escrow_holds')
      .update({
        released_at: new Date().toISOString(),
        released_reason: releaseReason,
      })
      .eq('order_id', orderId)

    if (escrowError) throw escrowError

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        buyer_confirmed_at: new Date().toISOString(),
        payout_completed_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (orderUpdateError) throw orderUpdateError

    // Create payout record
    const { error: payoutError } = await supabase
      .from('payouts')
      .insert({
        seller_id: order.seller_id,
        order_id: orderId,
        amount: order.seller_payout,
        status: 'in_transit',
        completed_date: new Date().toISOString(),
      })

    if (payoutError) throw payoutError

    // Record payment event
    await recordPaymentEvent(
      orderId,
      'funds_captured_and_released',
      'succeeded',
      paymentIntent
    )

    return { success: true }
  } catch (error) {
    console.error('Error capturing and releasing funds:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to capture funds',
    }
  }
}

/**
 * Refund a payment (before capture or if dispute resolved in buyer favor)
 */
export async function refundPayment(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (!order.stripe_charge_id) {
      throw new Error('No charge found for order')
    }

    // Create refund
    const refund = await stripe.refunds.create({
      charge: order.stripe_charge_id,
      reason: 'requested_by_customer', // Map reason to Stripe enum
      metadata: { orderId, reason },
    })

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'refunded',
        cancellation_reason: reason,
      })
      .eq('id', orderId)

    if (updateError) throw updateError

    // Update escrow hold as released
    await supabase
      .from('escrow_holds')
      .update({
        released_at: new Date().toISOString(),
        released_reason: 'refunded',
      })
      .eq('order_id', orderId)

    // Record payment event
    await recordPaymentEvent(orderId, 'refund_issued', 'succeeded', refund)

    return { success: true }
  } catch (error) {
    console.error('Error refunding payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund payment',
    }
  }
}

// ===== PAYMENT EVENT TRACKING =====

/**
 * Record a payment event in the database
 */
async function recordPaymentEvent(
  orderId: string,
  eventType: string,
  status: string,
  stripeData: any
): Promise<void> {
  try {
    await supabase.from('payment_events').insert({
      order_id: orderId,
      event_type: eventType,
      status,
      metadata: stripeData,
    })
  } catch (error) {
    console.error('Error recording payment event:', error)
  }
}

/**
 * Get payment events for an order
 */
export async function getPaymentEvents(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching payment events:', error)
    return []
  }
}

// ===== ORDER MANAGEMENT =====

/**
 * Create an order in the database
 */
export async function createOrder(
  listingId: string,
  sellerId: string,
  buyerId: string,
  price: number, // in cents
  quantity: number = 1
): Promise<{ orderId: string | null; error?: string }> {
  try {
    const fees = calculateFees(price)

    const { data, error } = await supabase
      .from('orders')
      .insert({
        listing_id: listingId,
        seller_id: sellerId,
        buyer_id: buyerId,
        quantity,
        price: price / 100, // Convert from cents to dollars
        platform_fee: fees.platformFeeAmount / 100,
        seller_payout: fees.sellerPayout / 100,
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) throw error

    return { orderId: data?.id }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      orderId: null,
      error: error instanceof Error ? error.message : 'Failed to create order',
    }
  }
}

/**
 * Get order details
 */
export async function getOrder(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        listing:listings(title, price),
        seller:users!seller_id(full_name, email, stripe_account_id),
        buyer:users!buyer_id(full_name, email)
      `
      )
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

/**
 * Get seller's orders
 */
export async function getSellerOrders(sellerId: string, status?: string) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        listing:listings(title, price),
        buyer:users!buyer_id(full_name, email, avatar_url)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    return []
  }
}

/**
 * Get buyer's orders
 */
export async function getBuyerOrders(buyerId: string, status?: string) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        listing:listings(title, price),
        seller:users!seller_id(full_name, email, avatar_url, rating)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching buyer orders:', error)
    return []
  }
}
