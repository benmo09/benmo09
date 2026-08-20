import { NextRequest, NextResponse } from 'next/server'
import { captureAndReleaseFunds } from '@/lib/actions/stripe'

/**
 * POST /api/stripe/capture
 * Capture payment and release funds to seller
 * Called when buyer confirms receipt or after 24 hours
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, reason = 'buyer_confirmed' } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing required field: orderId' },
        { status: 400 }
      )
    }

    if (!['buyer_confirmed', 'auto_release'].includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason: must be buyer_confirmed or auto_release' },
        { status: 400 }
      )
    }

    const result = await captureAndReleaseFunds(orderId, reason)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to capture and release funds' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Funds captured and released to seller',
      orderId,
      reason,
    })
  } catch (error) {
    console.error('Error in capture route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture funds' },
      { status: 500 }
    )
  }
}
