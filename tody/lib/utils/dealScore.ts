// Calculate Tody Deal Score (1-100)
// Based on: price relative to category average, time remaining, and distance

interface DealScoreInput {
  price: number
  categoryAvgPrice: number
  timeRemaining: number // in milliseconds
  distance: number // in km
  maxDistance?: number // default 50km
}

export function calculateDealScore(input: DealScoreInput): number {
  const {
    price,
    categoryAvgPrice,
    timeRemaining,
    distance,
    maxDistance = 50,
  } = input

  // Price score (0-50 points)
  // Price at 50% of avg = 50 points
  // Price at 100% of avg = 25 points
  // Price at 150% of avg = 0 points
  const priceRatio = price / categoryAvgPrice
  let priceScore = 0
  if (priceRatio <= 0.5) {
    priceScore = 50
  } else if (priceRatio <= 1) {
    priceScore = 50 - (priceRatio - 0.5) * 50
  } else if (priceRatio <= 1.5) {
    priceScore = 25 - (priceRatio - 1) * 50
  } else {
    priceScore = 0
  }

  // Time score (0-30 points)
  // Less than 2 hours = 30 points
  // 24 hours = 5 points
  // Expired = 0 points
  const twoHoursMs = 2 * 60 * 60 * 1000
  const twentyFourHoursMs = 24 * 60 * 60 * 1000
  let timeScore = 0
  if (timeRemaining <= 0) {
    timeScore = 0
  } else if (timeRemaining <= twoHoursMs) {
    timeScore = 30
  } else if (timeRemaining <= twentyFourHoursMs) {
    const ratio = 1 - (timeRemaining - twoHoursMs) / (twentyFourHoursMs - twoHoursMs)
    timeScore = 5 + ratio * 25
  } else {
    timeScore = 5
  }

  // Distance score (0-20 points)
  // Less than 1km = 20 points
  // 50km = 0 points
  let distanceScore = 0
  if (distance <= 1) {
    distanceScore = 20
  } else if (distance >= maxDistance) {
    distanceScore = 0
  } else {
    distanceScore = 20 * (1 - (distance - 1) / (maxDistance - 1))
  }

  const totalScore = Math.round(priceScore + timeScore + distanceScore)
  return Math.max(1, Math.min(100, totalScore))
}

// Get deal score color based on score
export function getDealScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500' // Excellent
  if (score >= 60) return 'bg-green-500' // Good
  if (score >= 40) return 'bg-yellow-500' // Fair
  if (score >= 20) return 'bg-orange-500' // Poor
  return 'bg-red-500' // Very Poor
}

// Get deal score label
export function getDealScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  if (score >= 20) return 'Poor'
  return 'Very Poor'
}

// Calculate category average price
export function normalizePriceForAverage(price: number, categoryAvg: number): number {
  if (categoryAvg === 0) return 100
  return (price / categoryAvg) * 100
}
