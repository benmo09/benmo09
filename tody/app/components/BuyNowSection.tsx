'use client'

import { formatPrice } from '@/lib/utils/pricing'
import type { ListingWithDealScore } from '@/lib/types'

interface BuyNowSectionProps {
  listing: ListingWithDealScore
  onPurchase: () => void
  isLoading?: boolean
}

export default function BuyNowSection({
  listing,
  onPurchase,
  isLoading = false,
}: BuyNowSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium">FIXED PRICE</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {formatPrice(listing.price)}
          </p>
          {listing.categoryAvgPrice > listing.price && (
            <p className="text-green-600 text-sm mt-2">
              ✓ {Math.round(100 - (listing.price / listing.categoryAvgPrice) * 100)}% below average
            </p>
          )}
        </div>
        <div className="bg-blue-100 rounded-lg p-3">
          <p className="text-sm text-blue-800 font-semibold">Deal Score</p>
          <p className="text-2xl font-bold text-blue-600">{listing.dealScore}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Stock:</span>
          <span className="font-semibold text-gray-900">{listing.quantity} available</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Seller:</span>
          <div className="flex items-center gap-2">
            {listing.seller.avatar_url && (
              <img
                src={listing.seller.avatar_url}
                alt={listing.seller.full_name || 'Seller'}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="font-semibold text-gray-900">
              {listing.seller.full_name || 'Unknown Seller'}
            </span>
            <span className="text-yellow-500">★ {listing.seller.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Condition:</span>
          <span className="font-semibold text-gray-900 capitalize">
            {listing.condition}
          </span>
        </div>
      </div>

      <button
        onClick={onPurchase}
        disabled={isLoading || listing.quantity === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors mb-3"
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </button>

      <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors">
        Add to Watchlist
      </button>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800 mb-2">
          <strong>Secure transaction:</strong> Your payment is protected
        </p>
        <p className="text-xs text-blue-800">
          <strong>Fast shipping:</strong> Ships within 1-2 business days
        </p>
      </div>
    </div>
  )
}
