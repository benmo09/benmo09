'use client'

import { useEffect, useState } from 'react'
import { getActiveListings } from '@/lib/actions/listings'
import ListingCard from '@/app/components/ListingCard'
import type { ListingWithDealScore, MarketplaceFilters } from '@/lib/types'

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingWithDealScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [filters, setFilters] = useState<Partial<MarketplaceFilters>>({
    radiusKm: 50,
    sortBy: 'dealScore',
  })

  // Get user's geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        console.error('Geolocation error:', error)
        // Fallback to default location (NYC)
        setUserLocation({
          lat: 40.7128,
          lng: -74.006,
        })
      }
    )
  }, [])

  // Fetch listings when user location or filters change
  useEffect(() => {
    if (!userLocation) return

    const fetchListings = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await getActiveListings({
          userLat: userLocation.lat,
          userLng: userLocation.lng,
          ...filters,
        } as MarketplaceFilters)

        setListings(response)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch listings'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [userLocation, filters])

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Find amazing deals near you with our Deal Score
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Radius Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius
              </label>
              <select
                value={filters.radiusKm || 50}
                onChange={(e) =>
                  handleFilterChange('radiusKm', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'dealScore'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dealScore">Best Deals</option>
                <option value="price">Price: Low to High</option>
                <option value="distance">Closest First</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={filters.priceMin || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMin',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="$0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                value={filters.priceMax || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'priceMax',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="$999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location Display */}
          {userLocation && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              📍 Searching near: {userLocation.lat.toFixed(4)},
              {userLocation.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading amazing deals...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              No listings found matching your criteria
            </p>
            <p className="text-gray-400">
              Try adjusting your filters or search radius
            </p>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found <span className="font-semibold text-gray-900">{listings.length}</span> amazing deals
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
