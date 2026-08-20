import { NextRequest, NextResponse } from 'next/server'
import { createStripeExpressAccount } from '@/lib/actions/stripe'

/**
 * POST /api/stripe/onboard
 * Create Stripe Express account and get onboarding link
 */
export async function POST(req: NextRequest) {
  try {
    const { sellerId, email, returnUrl } = await req.json()

    if (!sellerId || !email || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: sellerId, email, returnUrl' },
        { status: 400 }
      )
    }

    const result = await createStripeExpressAccount(sellerId, email, returnUrl)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      accountLink: result.accountLink,
      message: 'Redirect seller to this URL to complete Stripe onboarding',
    })
  } catch (error) {
    console.error('Error in onboard route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
}
