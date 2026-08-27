'use client'

import { useState, useEffect } from 'react'
import { getActiveListings } from '@/lib/actions/listings'
import type { ListingWithDealScore } from '@/lib/types'

export default function SearchPage() {
  const [listings, setListings] = useState<ListingWithDealScore[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 })

  // Filter states
  const [filters, setFilters] = useState({
    maxPrice: 1000,
    distance: 50,
    category: 'all',
    condition: 'all',
    minDiscount: 0,
    timeRemaining: 'any',
    minRating: 0,
    shipping: 'any',
  })

  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        }
      )
    }
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  const handleSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)

    // Add to recent searches
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    try {
      const results = await getActiveListings({
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        radiusKm: filters.distance,
        sortBy: 'dealScore',
      })

      // Filter by search query and other filters
      const filtered = results.filter(listing => {
        const matchesQuery = listing.title.toLowerCase().includes(query.toLowerCase()) ||
          listing.description.toLowerCase().includes(query.toLowerCase())

        return matchesQuery
      })

      setListings(filtered)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: '📱 Electronics' },
    { id: 'fashion', label: '👗 Fashion' },
    { id: 'home', label: '🏠 Home & Garden' },
    { id: 'sports', label: '⚽ Sports' },
    { id: 'gaming', label: '🎮 Gaming' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search products, sellers, categories..."
              className="flex-1 bg-gray-100 border-0 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              🔍
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Max Price
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold text-gray-700">${filters.maxPrice}</span>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Distance
                </label>
                <select
                  value={filters.distance}
                  onChange={(e) => handleFilterChange('distance', Number(e.target.value))}
                  className="w-full bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={1000}>Nationwide</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Minimum Discount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Min Discount
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minDiscount}
                    onChange={(e) => handleFilterChange('minDiscount', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-bold text-gray-700">{filters.minDiscount}%</span>
                </div>
              </div>

              {/* Time Remaining */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Time Remaining
                </label>
                <select
                  value={filters.timeRemaining}
                  onChange={(e) => handleFilterChange('timeRemaining', e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="24h">More than 24 hours</option>
                  <option value="12h">More than 12 hours</option>
                  <option value="1h">More than 1 hour</option>
                  <option value="ending">Ending soon (&lt;1 hour)</option>
                </select>
              </div>

              {/* Seller Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Min Seller Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  className="w-full bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>Any rating</option>
                  <option value={3}>3+ stars</option>
                  <option value={4}>4+ stars</option>
                  <option value={4.5}>4.5+ stars</option>
                </select>
              </div>

              {/* Shipping */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Shipping
                </label>
                <select
                  value={filters.shipping}
                  onChange={(e) => handleFilterChange('shipping', e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="available">Shipping available</option>
                  <option value="pickup">Local pickup</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  setFilters({
                    maxPrice: 1000,
                    distance: 50,
                    category: 'all',
                    condition: 'all',
                    minDiscount: 0,
                    timeRemaining: 'any',
                    minRating: 0,
                    shipping: 'any',
                  })
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition"
              >
                Reset Filters
              </button>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Recent Searches (when no query) */}
        {!searchQuery && !loading && (
          <div className="space-y-6">
            {recentSearches.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Searches</h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(search => (
                    <button
                      key={search}
                      onClick={() => {
                        setSearchQuery(search)
                        handleSearch(search)
                      }}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition text-sm"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Popular Searches</h2>
              <div className="flex flex-wrap gap-2">
                {['iPhone', 'PlayStation', 'Nike Shoes', 'MacBook', 'Airpods'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term)
                      handleSearch(term)
                    }}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200 transition text-sm font-medium"
                  >
                    🔥 {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.slice(1).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      handleFilterChange('category', cat.id)
                      setShowFilters(true)
                    }}
                    className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition"
                  >
                    <div className="text-3xl mb-2">{cat.label.split(' ')[0]}</div>
                    <div className="text-sm font-semibold text-gray-700">{cat.label.replace(/^[\d\w]+\s+/, '')}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {loading ? 'Searching...' : `${listings.length} results for "${searchQuery}"`}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(listing => (
                  <a
                    key={listing.id}
                    href={`/product/${listing.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    {listing.images && listing.images[0] && (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2 mb-2">{listing.title}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">${listing.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 mt-1">📍 {listing.distance} km away</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">✓ {listing.dealScore}%</p>
                          <p className="text-xs text-yellow-500">⭐ {listing.seller?.rating?.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No results found for "{searchQuery}"</p>
                <p className="text-gray-500 text-sm mt-2">Try different keywords or adjust filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
