'use client'

import { useEffect, useState } from 'react'
import { calculateCurrentPrice, formatCountdown, getPriceDropIndicator } from '@/lib/utils/priceCalculator'
import type { CurrentPrice } from '@/lib/utils/priceCalculator'

interface LivePriceDisplayProps {
  startingPrice: number
  floorPrice: number
  createdAt: string
  expiresAt: string
  compact?: boolean
}

export default function LivePriceDisplay({
  startingPrice,
  floorPrice,
  createdAt,
  expiresAt,
  compact = false,
}: LivePriceDisplayProps) {
  const [priceData, setPriceData] = useState<CurrentPrice | null>(null)
  const [countdown, setCountdown] = useState<string>('00:00:00')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updatePrice = () => {
      const data = calculateCurrentPrice({
        startingPrice,
        floorPrice,
        createdAt,
        expiresAt,
      })

      setPriceData(data)

      if (data.timeRemaining <= 0) {
        setIsExpired(true)
        setCountdown('00:00:00')
      } else {
        setIsExpired(false)
        const countdownData = formatCountdown(data.timeRemaining)
        setCountdown(countdownData.formatted)
      }
    }

    updatePrice()
    const interval = setInterval(updatePrice, 1000)
    return () => clearInterval(interval)
  }, [startingPrice, floorPrice, createdAt, expiresAt])

  if (!priceData) {
    return <div className="animate-pulse bg-gray-200 h-12 rounded-lg" />
  }

  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-bold text-lg">Listing Expired</p>
        <p className="text-red-500 text-sm">This item is no longer available</p>
      </div>
    )
  }

  const priceDropInfo = getPriceDropIndicator(priceData.percentageDiscount)

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-600">${priceData.currentPrice.toFixed(2)}</span>
          <span className="text-sm text-gray-500 line-through">${priceData.startingPrice.toFixed(2)}</span>
          <span className={`text-sm font-bold ${priceDropInfo.color}`}>
            {priceDropInfo.emoji} {priceData.percentageDiscount.toFixed(0)}% off
          </span>
        </div>
        <div className="text-lg font-mono font-bold text-orange-600">{countdown}</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 space-y-6">
      {/* Current Price - MOST PROMINENT */}
      <div className="text-center space-y-2">
        <div className="text-6xl font-black text-blue-600 leading-none">
          ${priceData.currentPrice.toFixed(2)}
        </div>
        <div className="flex items-center justify-center gap-4 text-lg">
          <span className="text-gray-500 line-through">${priceData.startingPrice.toFixed(2)}</span>
          <span className={`font-bold text-2xl ${priceDropInfo.color}`}>
            {priceDropInfo.emoji} {priceData.percentageDiscount.toFixed(0)}% OFF
          </span>
        </div>
      </div>

      {/* Savings Info */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">You Save:</span>
          <span className="text-2xl font-bold text-green-600">
            ${priceData.amountSaved.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${priceData.progressPercentage}%` }}
          />
        </div>
        <div className="text-sm text-gray-500">
          {priceData.progressPercentage}% of auction completed
        </div>
      </div>

      {/* Countdown Timer - HIGHLY PROMINENT */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white text-center space-y-2">
        <div className="text-sm font-semibold opacity-90">TIME REMAINING</div>
        <div className="text-5xl font-mono font-black tracking-wider">
          {countdown}
        </div>
        <div className="text-sm opacity-90">
          Price will be locked at ${priceData.floorPrice.toFixed(2)} when timer expires
        </div>
      </div>

      {/* Price Drop History */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Starting Price:</span>
          <span className="font-bold">${priceData.startingPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Price:</span>
          <span className="font-bold text-blue-600">${priceData.currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Floor Price:</span>
          <span className="font-bold">${priceData.floorPrice.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-sm font-semibold">
          <span>Amount Dropped:</span>
          <span className="text-green-600">${priceData.amountSaved.toFixed(2)}</span>
        </div>
      </div>

      {/* CTA Button */}
      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 text-lg shadow-lg">
        BUY NOW 🚀
      </button>
    </div>
  )
}
