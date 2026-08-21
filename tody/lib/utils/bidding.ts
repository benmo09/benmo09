// Utility functions for bidding (not Server Actions)

export function getAuctionStatus(
  startTime: string,
  endTime: string,
  currentTime?: Date
): 'pending' | 'active' | 'ended' {
  const now = currentTime || new Date()
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const current = now.getTime()

  if (current < start) return 'pending'
  if (current > end) return 'ended'
  return 'active'
}

export function formatBidPrice(amount: number): string {
  return `$${amount.toFixed(2)}`
}
