'use client'

import { getDealScoreColor, getDealScoreLabel } from '@/lib/utils/dealScore'
import type { ListingWithDealScore } from '@/lib/types'
import CountdownTimer from './CountdownTimer'
import Image from 'next/image'

interface ListingCardProps {
  listing: ListingWithDealScore
}

export default function ListingCard({ listing }: ListingCardProps) {
  const pricePercentage = Math.round(
    (listing.price / listing.categoryAvgPrice) * 100
  )
  const isPriceDiscount = pricePercentage < 100

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">No image</span>
          </div>
        )}

        {/* Deal Score Badge */}
        <div
          className={`absolute top-2 right-2 ${getDealScoreColor(
            listing.dealScore
          )} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
        >
          <div className="flex flex-col items-center">
            <span className="text-xs">Deal</span>
            <span className="text-base">{listing.dealScore}</span>
          </div>
        </div>

        {/* Price Discount Badge */}
        {isPriceDiscount && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {100 - pricePercentage}% OFF
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-70 text-white px-2 py-1 rounded text-xs capitalize">
          {listing.condition}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {listing.title}
        </h3>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-3">
          {listing.seller.avatar_url ? (
            <img
              src={listing.seller.avatar_url}
              alt={listing.seller.full_name || 'Seller'}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300" />
          )}
          <div>
            <p className="text-xs text-gray-600">
              {listing.seller.full_name || 'Unknown Seller'}
            </p>
            <p className="text-xs text-yellow-500">
              ★ {listing.seller.rating.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-gray-900">
            ${listing.price.toFixed(2)}
          </p>
          {listing.categoryAvgPrice > listing.price && (
            <p className="text-xs text-emerald-600">
              Avg: ${listing.categoryAvgPrice.toFixed(2)}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3 text-xs">
          {/* Distance */}
          <div className="bg-gray-100 rounded p-2">
            <p className="text-gray-600">Distance</p>
            <p className="font-semibold text-gray-900">
              {listing.distance}km
            </p>
          </div>

          {/* Time Remaining */}
          <div className="bg-gray-100 rounded p-2">
            <p className="text-gray-600">Time Left</p>
            <CountdownTimer expiresAt={listing.expires_at} />
          </div>

          {/* Deal Quality */}
          <div className="bg-gray-100 rounded p-2">
            <p className="text-gray-600">Quality</p>
            <p className="font-semibold text-gray-900">
              {getDealScoreLabel(listing.dealScore)}
            </p>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {listing.tags.length > 3 && (
              <span className="inline-block text-xs text-gray-500">
                +{listing.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
          View Details
        </button>
      </div>
    </div>
  )
}
