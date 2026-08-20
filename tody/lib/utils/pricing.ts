// Dynamic pricing calculations for Tody Drop

export function calculateTodyDropPrice(
  startPrice: number,
  minPrice: number,
  startTime: string,
  endTime: string,
  currentTime?: Date
): {
  price: number
  priceDropPercentage: number
  timeElapsedPercentage: number
} {
  const now = currentTime || new Date()
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const current = now.getTime()

  // Total time duration
  const totalTime = end - start
  const elapsedTime = Math.max(0, current - start)

  // If time hasn't started yet
  if (elapsedTime <= 0) {
    return {
      price: startPrice,
      priceDropPercentage: 0,
      timeElapsedPercentage: 0,
    }
  }

  // If time has ended, return minimum price
  if (elapsedTime >= totalTime) {
    return {
      price: minPrice,
      priceDropPercentage: 100,
      timeElapsedPercentage: 100,
    }
  }

  // Linear price drop: Current Price = Start - ((Elapsed / Total) * (Start - Min))
  const timeElapsedPercentage = (elapsedTime / totalTime) * 100
  const priceDifference = startPrice - minPrice
  const priceReduction = (elapsedTime / totalTime) * priceDifference
  const currentPrice = startPrice - priceReduction
  const priceDropPercentage = (priceReduction / priceDifference) * 100

  return {
    price: Math.max(minPrice, Math.round(currentPrice * 100) / 100),
    priceDropPercentage: Math.min(100, Math.round(priceDropPercentage)),
    timeElapsedPercentage: Math.round(timeElapsedPercentage),
  }
}

// Get price label based on sale type
export function getPriceLabel(saleType: string): string {
  switch (saleType) {
    case 'buy_now':
      return 'Buy Now'
    case 'auction':
      return 'Current Bid'
    case 'drop':
      return 'Current Price'
    default:
      return 'Price'
  }
}

// Format price for display
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}
