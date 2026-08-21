'use client'

import Link from 'next/link'
import { getDealScoreLabel, getDealScoreColor } from '@/lib/utils/dealScore'

interface MapListing {
  id: string
  title: string
  price: number
  deal_score: number
  quantity: number
  sale_type: string
}

interface MapListingCardProps {
  listing: MapListing
  onClose: () => void
}

export default function MapListingCard({ listing, onClose }: MapListingCardProps) {
  const scoreLabel = getDealScoreLabel(listing.deal_score)
  const scoreColor = getDealScoreColor(listing.deal_score)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-40">
      <div className="bg-white rounded-t-lg w-full max-w-md p-6 shadow-lg animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Deal Score Badge */}
        <div className="mb-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white font-bold text-sm"
            style={{ backgroundColor: scoreColor }}
          >
            <span>🔥 Deal Score: {listing.deal_score}</span>
            <span className="text-xs">({scoreLabel})</span>
          </div>
        </div>

        {/* Listing Title */}
        <h2 className="text-2xl font-bold mb-2">{listing.title}</h2>

        {/* Price and Quantity */}
        <div className="mb-4 flex justify-between items-baseline">
          <div>
            <div className="text-4xl font-bold text-green-600">
              ${(listing.price / 100).toFixed(2)}
            </div>
          </div>
          <div className="text-gray-600">
            {listing.quantity} {listing.quantity === 1 ? 'item' : 'items'} available
          </div>
        </div>

        {/* Sale Type Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded font-semibold">
            {listing.sale_type === 'drop' && '📉 Tody Drop'}
            {listing.sale_type === 'auction' && '🏆 Auction'}
            {listing.sale_type === 'offer' && '💬 Make an Offer'}
            {listing.sale_type === 'buy_now' && '⚡ Buy Now'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link
            href={`/product/${listing.id}`}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-center"
          >
            View Details
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>

        {/* Map Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
          <p>📍 Click pin on map to view other listings nearby</p>
        </div>
      </div>
    </div>
  )
}
