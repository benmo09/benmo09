'use client'

import { useState } from 'react'
import { calculateCurrentPrice, formatCountdown, getPriceDropIndicator } from '@/lib/utils/priceCalculator'
import type { ListingWithDealScore } from '@/lib/types'

interface VideoProductCardProps {
  listing: ListingWithDealScore
  onBuyClick?: (listingId: string) => void
  onSaveClick?: (listingId: string) => void
}

export default function VideoProductCard({
  listing,
  onBuyClick,
  onSaveClick,
}: VideoProductCardProps) {
  const [likes, setLikes] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [priceData, setPriceData] = useState(() =>
    calculateCurrentPrice({
      startingPrice: listing.price,
      floorPrice: listing.price * 0.5,
      createdAt: listing.created_at,
      expiresAt: listing.expires_at,
    })
  )
  const [countdown, setCountdown] = useState(() => {
    const cd = formatCountdown(priceData.timeRemaining)
    return cd.formatted
  })

  const priceDropInfo = getPriceDropIndicator(priceData.percentageDiscount)

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden snap-center">
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📦</div>
              <p>No image available</p>
            </div>
          </div>
        )}
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      </div>

      {/* Header - Seller Info */}
      <div className="absolute top-4 left-4 right-4 flex items-center gap-3 z-10">
        <img
          src={listing.seller?.avatar_url || '/default-avatar.png'}
          alt={listing.seller?.full_name || 'Seller'}
          className="w-12 h-12 rounded-full border-2 border-white"
        />
        <div className="text-white">
          <p className="font-bold text-sm">{listing.seller?.full_name || 'Seller'}</p>
          <p className="text-xs opacity-90">⭐ {listing.seller?.rating?.toFixed(1) || 'N/A'}</p>
        </div>
      </div>

      {/* Main Content - Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4 z-10">
        {/* Price Section - MOST PROMINENT */}
        <div className="space-y-2">
          {/* Current Price - HUGE */}
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white drop-shadow-lg">
              ${priceData.currentPrice.toFixed(2)}
            </span>
            <span className={`text-2xl font-bold ${priceDropInfo.color} drop-shadow`}>
              {priceDropInfo.emoji} {priceData.percentageDiscount.toFixed(0)}%
            </span>
          </div>

          {/* Original Price */}
          <p className="text-white text-lg opacity-80 line-through">
            Was ${priceData.startingPrice.toFixed(2)}
          </p>
        </div>

        {/* Product Title */}
        <h2 className="text-white font-bold text-2xl drop-shadow-lg line-clamp-2">
          {listing.title}
        </h2>

        {/* Location & Distance */}
        <div className="flex items-center gap-2 text-white text-sm opacity-90">
          <span>📍</span>
          <span>{listing.distance} km away</span>
        </div>

        {/* Countdown Timer - CRITICAL */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-4 py-3 text-white font-bold text-center text-2xl font-mono shadow-lg">
          ⏰ {countdown}
        </div>

        {/* Info Bar */}
        <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2 text-white text-sm flex justify-between">
          <span>💰 Save ${priceData.amountSaved.toFixed(2)}</span>
          <span>👁️ {Math.floor(Math.random() * 10000)} views</span>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-4 z-10">
        {/* Like Button */}
        <button
          onClick={() => setLikes(likes + 1)}
          className="flex flex-col items-center gap-2 text-white hover:scale-110 transition"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30">
            <span className="text-2xl">❤️</span>
          </div>
          <span className="text-xs font-bold drop-shadow">{likes}</span>
        </button>

        {/* Comment Button */}
        <button className="flex flex-col items-center gap-2 text-white hover:scale-110 transition">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30">
            <span className="text-2xl">💬</span>
          </div>
          <span className="text-xs font-bold drop-shadow">123</span>
        </button>

        {/* Share Button */}
        <button className="flex flex-col items-center gap-2 text-white hover:scale-110 transition">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30">
            <span className="text-2xl">↗️</span>
          </div>
          <span className="text-xs font-bold drop-shadow">45</span>
        </button>

        {/* Save Button */}
        <button
          onClick={() => {
            setIsSaved(!isSaved)
            onSaveClick?.(listing.id)
          }}
          className={`flex flex-col items-center gap-2 hover:scale-110 transition ${
            isSaved ? 'text-yellow-400' : 'text-white'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30">
            <span className="text-2xl">{isSaved ? '⭐' : '☆'}</span>
          </div>
          <span className="text-xs font-bold drop-shadow">Save</span>
        </button>
      </div>

      {/* Buy Now CTA - Bottom Center */}
      <button
        onClick={() => onBuyClick?.(listing.id)}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full w-full max-w-xs shadow-xl hover:shadow-2xl transition z-10 text-lg"
      >
        🚀 BUY NOW
      </button>
    </div>
  )
}
