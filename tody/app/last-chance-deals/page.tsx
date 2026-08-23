'use client'

import { useEffect, useState } from 'react'
import { getActiveListings } from '@/lib/actions/listings'
import type { ListingWithDealScore } from '@/lib/types'

export default function LastChanceDealPage() {
  const [listings, setListings] = useState<ListingWithDealScore[]>([])
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 })
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    // Get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        }
      )
    }

    loadDeals()
  }, [])

  const loadDeals = async () => {
    setLoading(true)
    // Get listings that are expiring soon (within 2 hours)
    const result = await getActiveListings({
      userLat: userLocation.lat,
      userLng: userLocation.lng,
      radiusKm: 100,
      sortBy: 'dealScore',
    })

    if (result) {
      // Filter for items expiring within 2 hours
      const now = new Date().getTime()
      const twoHoursMs = 2 * 60 * 60 * 1000
      const expiringDeals = result.filter(
        (listing) =>
          listing.timeRemaining > 0 && listing.timeRemaining < twoHoursMs
      )
      setListings(expiringDeals.sort((a, b) => a.timeRemaining - b.timeRemaining))
    }
    setLoading(false)
  }

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m left`
    }
    return `${minutes}m left`
  }

  const getUrgencyColor = (timeRemaining: number) => {
    const minutes = Math.floor(timeRemaining / (1000 * 60))
    if (minutes < 15) return 'bg-red-500'
    if (minutes < 30) return 'bg-orange-500'
    return 'bg-yellow-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">⏰ Last Chance Deals</h1>
          <p className="text-lg opacity-90">
            Grab these deals before they expire! Listings ending in the next 2 hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading last chance deals...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Last Chance Deals Right Now</h3>
            <p className="text-gray-600">Check back soon for expiring deals in your area!</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {listings.length} deal{listings.length !== 1 ? 's' : ''} expiring soon
              </h2>
              <p className="text-gray-600 mt-1">
                Based on your location • Sorted by deal score
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                      </div>
                    )}

                    {/* Time Remaining Badge */}
                    <div className={`absolute top-3 right-3 ${getUrgencyColor(listing.timeRemaining)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                      {formatTimeRemaining(listing.timeRemaining)}
                    </div>

                    {/* Deal Score Badge */}
                    <div className="absolute top-3 left-3 bg-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg">
                      <div>
                        <p className="text-xs text-gray-600">SCORE</p>
                        <p className="text-lg text-green-600">{Math.round(listing.dealScore)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                      {listing.title}
                    </h3>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                      <img
                        src={listing.seller.avatar_url || '/default-avatar.png'}
                        alt={listing.seller.full_name || 'Seller'}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{listing.seller.full_name || 'Seller'}</p>
                        <p className="text-xs text-yellow-600">⭐ {listing.seller.rating.toFixed(1)}</p>
                      </div>
                    </div>

                    {/* Price & Details */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-red-600">
                          ${(listing.price / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">{listing.quantity} in stock</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        📍 {listing.distance} km away
                      </p>
                    </div>

                    {/* Action */}
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition">
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
