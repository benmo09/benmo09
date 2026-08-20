import { NextRequest, NextResponse } from 'next/server'
import {
  createOrder,
  createPaymentIntent,
  getSellerStripeStatus,
} from '@/lib/actions/stripe'

/**
 * POST /api/stripe/checkout
 * Create order and PaymentIntent for checkout
 */
export async function POST(req: NextRequest) {
  try {
    const {
      listingId,
      sellerId,
      buyerId,
      priceInCents,
      quantity = 1,
    } = await req.json()

    if (!listingId || !sellerId || !buyerId || !priceInCents) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: listingId, sellerId, buyerId, priceInCents',
        },
        { status: 400 }
      )
    }

    if (priceInCents <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if seller has Stripe account set up
    const stripeStatus = await getSellerStripeStatus(sellerId)
    if (!stripeStatus.isOnboarded) {
      return NextResponse.json(
        {
          error: 'Seller has not completed Stripe onboarding',
          chargesEnabled: stripeStatus.chargesEnabled,
          payoutsEnabled: stripeStatus.payoutsEnabled,
        },
        { status: 400 }
      )
    }

    // Create order in database
    const orderResult = await createOrder(
      listingId,
      sellerId,
      buyerId,
      priceInCents,
      quantity
    )

    if (orderResult.error || !orderResult.orderId) {
      return NextResponse.json(
        { error: orderResult.error || 'Failed to create order' },
        { status: 400 }
      )
    }

    // Create PaymentIntent
    const paymentResult = await createPaymentIntent(
      orderResult.orderId,
      priceInCents,
      sellerId,
      buyerId
    )

    if (paymentResult.error || !paymentResult.clientSecret) {
      return NextResponse.json(
        { error: paymentResult.error || 'Failed to create payment intent' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      orderId: orderResult.orderId,
      clientSecret: paymentResult.clientSecret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      message: 'Use clientSecret with Stripe.js to complete payment',
    })
  } catch (error) {
    console.error('Error in checkout route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
