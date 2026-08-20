import { NextRequest, NextResponse } from 'next/server'
import { confirmPayment } from '@/lib/actions/stripe'

/**
 * POST /api/stripe/confirm
 * Confirm payment after successful payment processing
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentIntentId } = await req.json()

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, paymentIntentId' },
        { status: 400 }
      )
    }

    const result = await confirmPayment(orderId, paymentIntentId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to confirm payment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed. Funds are now in escrow for 24 hours.',
      orderId,
    })
  } catch (error) {
    console.error('Error in confirm route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
