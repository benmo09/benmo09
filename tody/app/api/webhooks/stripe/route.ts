import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
    }

    // Verify Stripe webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object)
        break

      case 'payout.paid':
        await handlePayoutPaid(event.data.object)
        break

      case 'payout.failed':
        await handlePayoutFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in PaymentIntent metadata')
      return
    }

    // Record payment event
    await supabase.from('payment_events').insert({
      order_id: orderId,
      event_type: 'payment_intent.succeeded',
      stripe_event_id: paymentIntent.id,
      status: 'succeeded',
      amount: paymentIntent.amount / 100,
      metadata: paymentIntent,
    })

    // Update order status (if not already captured)
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_confirmed_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'payment_intent')

    console.log(`Payment succeeded for order ${orderId}`)
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error)
  }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in PaymentIntent metadata')
      return
    }

    // Record payment event
    await supabase.from('payment_events').insert({
      order_id: orderId,
      event_type: 'payment_intent.payment_failed',
      stripe_event_id: paymentIntent.id,
      status: 'failed',
      amount: paymentIntent.amount / 100,
      metadata: paymentIntent,
    })

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'canceled',
        cancellation_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
      })
      .eq('id', orderId)

    console.log(`Payment failed for order ${orderId}`)
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error)
  }
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(charge: any) {
  try {
    const orderId = charge.metadata?.orderId

    if (!orderId) {
      console.error('No orderId in charge metadata')
      return
    }

    // Record payment event
    await supabase.from('payment_events').insert({
      order_id: orderId,
      event_type: 'charge.refunded',
      stripe_event_id: charge.id,
      status: 'refunded',
      amount: charge.amount_refunded / 100,
      metadata: charge,
    })

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'refunded',
      })
      .eq('id', orderId)

    // Update escrow hold
    await supabase
      .from('escrow_holds')
      .update({
        released_at: new Date().toISOString(),
        released_reason: 'refunded',
      })
      .eq('order_id', orderId)

    console.log(`Charge refunded for order ${orderId}`)
  } catch (error) {
    console.error('Error handling charge.refunded:', error)
  }
}

/**
 * Handle payout.paid event
 */
async function handlePayoutPaid(payout: any) {
  try {
    // Find payout record by stripe_payout_id
    const { data: payoutRecord, error } = await supabase
      .from('payouts')
      .update({
        status: 'paid',
        completed_date: new Date().toISOString(),
      })
      .eq('stripe_payout_id', payout.id)

    if (error) throw error

    console.log(`Payout paid: ${payout.id}`)
  } catch (error) {
    console.error('Error handling payout.paid:', error)
  }
}

/**
 * Handle payout.failed event
 */
async function handlePayoutFailed(payout: any) {
  try {
    // Find payout record by stripe_payout_id
    const { data: payoutRecord, error } = await supabase
      .from('payouts')
      .update({
        status: 'failed',
        failure_reason: payout.failure_reason,
      })
      .eq('stripe_payout_id', payout.id)

    if (error) throw error

    console.log(`Payout failed: ${payout.id}`)
  } catch (error) {
    console.error('Error handling payout.failed:', error)
  }
}
