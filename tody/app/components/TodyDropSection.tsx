'use client'

import { useEffect, useState } from 'react'
import { calculateTodyDropPrice, formatPrice } from '@/lib/utils/pricing'
import CountdownTimer from './CountdownTimer'

interface TodyDropSectionProps {
  listingId: string
  startPrice: number
  minPrice: number
  startTime: string
  endTime: string
  onPurchase: () => void
  isLoading?: boolean
}

export default function TodyDropSection({
  listingId,
  startPrice,
  minPrice,
  startTime,
  endTime,
  onPurchase,
  isLoading = false,
}: TodyDropSectionProps) {
  const [pricing, setPricing] = useState({
    price: startPrice,
    priceDropPercentage: 0,
    timeElapsedPercentage: 0,
  })

  // Update pricing every second
  useEffect(() => {
    const updatePricing = () => {
      const newPricing = calculateTodyDropPrice(
        startPrice,
        minPrice,
        startTime,
        endTime
      )
      setPricing(newPricing)
    }

    updatePricing()
    const interval = setInterval(updatePricing, 1000)

    return () => clearInterval(interval)
  }, [startPrice, minPrice, startTime, endTime])

  const priceSaved = startPrice - pricing.price
  const isMinPrice = pricing.price <= minPrice

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-md p-6 mb-6 border-2 border-orange-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-orange-600 text-sm font-bold flex items-center gap-2">
            📉 TODY DROP
          </p>
          <p className="text-gray-600 text-xs mt-1">Price drops in real-time</p>
        </div>
        <div className="bg-orange-100 rounded-lg p-3 text-center">
          <p className="text-xs text-orange-800 font-semibold">Time Left</p>
          <CountdownTimer expiresAt={endTime} />
        </div>
      </div>

      {/* Price Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-5xl font-bold text-gray-900">{formatPrice(pricing.price)}</p>
          <p className="text-lg line-through text-gray-500">{formatPrice(startPrice)}</p>
        </div>

        {priceSaved > 0 && (
          <p className="text-green-600 font-semibold text-sm">
            ✓ Save {formatPrice(priceSaved)} ({Math.round((priceSaved / startPrice) * 100)}%)
          </p>
        )}

        {isMinPrice && (
          <p className="text-red-600 font-bold text-sm mt-2">
            ⚠️ Minimum price reached!
          </p>
        )}
      </div>

      {/* Price Drop Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Price Progress</span>
          <span>{Math.round(pricing.priceDropPercentage)}% dropped</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
            style={{ width: `${pricing.priceDropPercentage}%` }}
          />
        </div>
      </div>

      {/* Time Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Time Elapsed</span>
          <span>{pricing.timeElapsedPercentage}% complete</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${pricing.timeElapsedPercentage}%` }}
          />
        </div>
      </div>

      {/* Price Range Info */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-xs text-center">
        <div className="bg-white rounded p-2">
          <p className="text-gray-600">Start Price</p>
          <p className="font-bold text-gray-900">{formatPrice(startPrice)}</p>
        </div>
        <div className="bg-white rounded p-2">
          <p className="text-gray-600">Current Price</p>
          <p className="font-bold text-orange-600">{formatPrice(pricing.price)}</p>
        </div>
        <div className="bg-white rounded p-2">
          <p className="text-gray-600">Floor Price</p>
          <p className="font-bold text-gray-900">{formatPrice(minPrice)}</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="p-3 bg-white rounded-lg mb-4 text-xs text-gray-700 border border-orange-200">
        <p className="font-semibold mb-1">💡 How Tody Drop Works:</p>
        <p>The price drops linearly from {formatPrice(startPrice)} to {formatPrice(minPrice)} over the listing duration. Best deal gets it!</p>
      </div>

      {/* Buy Now Button */}
      <button
        onClick={onPurchase}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 mb-2"
      >
        {isLoading ? 'Processing...' : '🔥 Buy Now at This Price!'}
      </button>

      <p className="text-center text-xs text-gray-600">
        Price updates every second • Limited stock
      </p>
    </div>
  )
}
