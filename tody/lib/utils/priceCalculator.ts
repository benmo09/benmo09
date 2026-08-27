/**
 * Calculate the current price of a listing based on dynamic pricing
 * This is the HEART of Tody - prices decrease over time
 */

export interface DynamicPriceData {
  startingPrice: number
  floorPrice: number
  createdAt: string
  expiresAt: string
}

export interface CurrentPrice {
  currentPrice: number
  startingPrice: number
  floorPrice: number
  amountSaved: number
  percentageDiscount: number
  timeRemaining: number
  progressPercentage: number
  isPriceMinimized: boolean
}

/**
 * Calculate current price based on time elapsed
 * Price decreases linearly from starting price to floor price
 */
export function calculateCurrentPrice(data: DynamicPriceData): CurrentPrice {
  const now = new Date().getTime()
  const createdTime = new Date(data.createdAt).getTime()
  const expiresTime = new Date(data.expiresAt).getTime()

  // Total duration from creation to expiration
  const totalDuration = expiresTime - createdTime
  // Time elapsed since creation
  const timeElapsed = now - createdTime
  // Time remaining until expiration
  const timeRemaining = Math.max(0, expiresTime - now)

  // Calculate progress (0 to 1)
  const progress = Math.max(0, Math.min(1, timeElapsed / totalDuration))

  // Calculate price decrease
  const priceRange = data.startingPrice - data.floorPrice
  const currentPrice = Math.max(data.floorPrice, data.startingPrice - priceRange * progress)

  // Calculate discount metrics
  const amountSaved = data.startingPrice - currentPrice
  const percentageDiscount = (amountSaved / data.startingPrice) * 100

  return {
    currentPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimals
    startingPrice: data.startingPrice,
    floorPrice: data.floorPrice,
    amountSaved: Math.round(amountSaved * 100) / 100,
    percentageDiscount: Math.round(percentageDiscount * 10) / 10,
    timeRemaining,
    progressPercentage: Math.round(progress * 100),
    isPriceMinimized: currentPrice <= data.floorPrice,
  }
}

/**
 * Format countdown time as HH:MM:SS
 */
export function formatCountdown(milliseconds: number): {
  hours: number
  minutes: number
  seconds: number
  formatted: string
} {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    hours,
    minutes,
    seconds,
    formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  }
}

/**
 * Get price drop indicator for visual feedback
 */
export function getPriceDropIndicator(discount: number): {
  level: 'small' | 'medium' | 'large' | 'massive'
  emoji: string
  color: string
} {
  if (discount < 5) {
    return { level: 'small', emoji: '📉', color: 'text-gray-500' }
  }
  if (discount < 20) {
    return { level: 'medium', emoji: '📉', color: 'text-yellow-500' }
  }
  if (discount < 40) {
    return { level: 'large', emoji: '🔥', color: 'text-orange-500' }
  }
  return { level: 'massive', emoji: '💥', color: 'text-red-500' }
}
