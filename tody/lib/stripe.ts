import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

// Stripe configuration constants
export const STRIPE_CONFIG = {
  platformFeePercentage: 5, // 5% platform fee
  payoutDelay: 24 * 60 * 60, // 24 hours in seconds
  escrowHoldDuration: 24 * 60 * 60, // 24 hours in seconds
}

// Calculate fees
export function calculateFees(amount: number) {
  const platformFeeAmount = Math.round(amount * (STRIPE_CONFIG.platformFeePercentage / 100))
  const sellerPayout = amount - platformFeeAmount

  return {
    grossAmount: amount,
    platformFeeAmount,
    sellerPayout,
    platformFeePercentage: STRIPE_CONFIG.platformFeePercentage,
  }
}
