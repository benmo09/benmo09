'use client'

import { useEffect, useState } from 'react'
import { placeBid, getAuctionStatus } from '@/lib/actions/bids'
import CountdownTimer from './CountdownTimer'
import type { AuctionData, Bid } from '@/lib/actions/bids'
import { formatPrice } from '@/lib/utils/pricing'

interface AuctionSectionProps {
  auction: AuctionData
  bidderId?: string
  onBidPlaced?: () => void
}

export default function AuctionSection({
  auction,
  bidderId,
  onBidPlaced,
}: AuctionSectionProps) {
  const [bidAmount, setBidAmount] = useState((auction.current_price + 1).toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [auctionStatus, setAuctionStatus] = useState<'pending' | 'active' | 'ended'>(
    getAuctionStatus(auction.start_time, auction.end_time)
  )
  const [bids, setBids] = useState<Bid[]>(auction.bids)

  const bidAmountNum = parseFloat(bidAmount) || 0
  const isValidBid = bidAmountNum > auction.current_price
  const isHighestBidder = bidderId === auction.highest_bidder_id

  // Update auction status every second
  useEffect(() => {
    const updateStatus = () => {
      setAuctionStatus(getAuctionStatus(auction.start_time, auction.end_time))
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)

    return () => clearInterval(interval)
  }, [auction.start_time, auction.end_time])

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bidderId) {
      setError('You must be logged in to place a bid')
      return
    }

    if (!isValidBid) {
      setError(`Bid must be higher than ${formatPrice(auction.current_price)}`)
      return
    }

    if (auctionStatus !== 'active') {
      setError('Auction is not active')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newBid = await placeBid(auction.id, bidderId, bidAmountNum)

      if (newBid) {
        setSuccess(true)
        setBidAmount((bidAmountNum + 1).toString())
        setBids([newBid, ...bids])
        onBidPlaced?.()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError('Failed to place bid. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 mb-6 border-2 border-purple-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-purple-600 text-sm font-bold flex items-center gap-2">
            🔨 AUCTION
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {auctionStatus === 'pending' && 'Auction starts soon'}
            {auctionStatus === 'active' && 'Auction is live'}
            {auctionStatus === 'ended' && 'Auction ended'}
          </p>
        </div>
        <div className="bg-purple-100 rounded-lg p-3 text-center">
          <p className="text-xs text-purple-800 font-semibold">Time Left</p>
          <CountdownTimer expiresAt={auction.end_time} />
        </div>
      </div>

      {/* Current Bid */}
      <div className="mb-6">
        <p className="text-gray-600 text-sm font-medium mb-1">Current Bid</p>
        <p className="text-5xl font-bold text-purple-600 mb-2">
          {formatPrice(auction.current_price)}
        </p>
        {auction.highest_bidder_id && (
          <p className="text-sm text-gray-700">
            Highest bidder:{' '}
            <span className="font-semibold">
              {bids[0]?.bidder_name || 'Anonymous'}
              {isHighestBidder && ' (You)'}
            </span>
          </p>
        )}
      </div>

      {/* Starting Price Info */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-lg p-3 text-xs">
          <p className="text-gray-600">Starting Bid</p>
          <p className="font-bold text-gray-900">{formatPrice(auction.starting_price)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 text-xs">
          <p className="text-gray-600">Total Bids</p>
          <p className="font-bold text-gray-900">{bids.length}</p>
        </div>
      </div>

      {/* Bid Form */}
      {auctionStatus === 'active' && (
        <form onSubmit={handlePlaceBid} className="mb-6 space-y-3">
          {/* Minimum Bid Display */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
            <p>
              <strong>Minimum bid:</strong> {formatPrice(auction.current_price + 0.01)}
            </p>
          </div>

          {/* Bid Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Bid
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">$</span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                step="0.01"
                min={auction.current_price + 0.01}
                disabled={loading}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Quick Bid Buttons */}
          <div className="flex gap-2 text-xs">
            {[1, 5, 10, 25].map((increment) => (
              <button
                key={increment}
                type="button"
                onClick={() =>
                  setBidAmount((auction.current_price + increment).toFixed(2))
                }
                className="flex-1 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 font-semibold transition-colors"
              >
                +${increment}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">{error}</div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
              ✓ Bid placed successfully! You're the highest bidder.
            </div>
          )}

          {/* Place Bid Button */}
          <button
            type="submit"
            disabled={loading || !isValidBid}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 rounded-lg transition-all"
          >
            {loading ? 'Placing bid...' : `Place Bid (${formatPrice(bidAmountNum)})`}
          </button>
        </form>
      )}

      {auctionStatus === 'ended' && (
        <div className="p-4 bg-gray-50 rounded-lg mb-6 text-center">
          <p className="text-gray-700 font-semibold">This auction has ended</p>
          {auction.highest_bidder_id && (
            <p className="text-sm text-gray-600 mt-2">
              Won by: <span className="font-bold">{bids[0]?.bidder_name || 'Anonymous'}</span>
            </p>
          )}
        </div>
      )}

      {auctionStatus === 'pending' && (
        <div className="p-4 bg-blue-50 rounded-lg mb-6 text-center">
          <p className="text-blue-700 font-semibold">Auction hasn't started yet</p>
          <p className="text-sm text-blue-600">
            Starts at: {new Date(auction.start_time).toLocaleString()}
          </p>
        </div>
      )}

      {/* Bid History */}
      {bids.length > 0 && (
        <div className="border-t border-purple-200 pt-6">
          <h4 className="font-bold text-gray-900 mb-3">Recent Bids</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bids.slice(0, 10).map((bid, index) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  bid.bidder_id === auction.highest_bidder_id
                    ? 'bg-purple-100 border border-purple-300'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-600 text-sm">#{index + 1}</span>
                  {bid.bidder_avatar && (
                    <img
                      src={bid.bidder_avatar}
                      alt={bid.bidder_name || 'Bidder'}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {bid.bidder_name}
                    {bid.bidder_id === bidderId && ' (You)'}
                  </span>
                </div>
                <p className="font-bold text-purple-600">{formatPrice(bid.amount)}</p>
              </div>
            ))}
          </div>
          {bids.length > 10 && (
            <p className="text-xs text-gray-600 text-center mt-2">+{bids.length - 10} more bids</p>
          )}
        </div>
      )}
    </div>
  )
}
