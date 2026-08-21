'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import MapListingCard from '@/components/MapListingCard'
import { getListingsForMap } from '@/lib/actions/map'

// Dynamic import to avoid SSR issues with Leaflet
const TodyMap = dynamic(() => import('@/components/TodyMap'), {
  loading: () => <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading map...</div>,
  ssr: false,
})

interface MapListing {
  id: string
  title: string
  price: number
  latitude: number
  longitude: number
  deal_score: number
  seller_id: string
  quantity: number
  sale_type: string
}

export default function MapPage() {
  const [listings, setListings] = useState<MapListing[]>([])
  const [selectedListing, setSelectedListing] = useState<MapListing | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [radiusKm, setRadiusKm] = useState(50)
  const [showRadius, setShowRadius] = useState(false)

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => {
          // Default to NYC if geolocation fails
          setUserLocation({ lat: 40.7128, lon: -74.006 })
        }
      )
    }
  }, [])

  // Fetch listings
  useEffect(() => {
    async function fetchListings() {
      if (!userLocation) return

      setLoading(true)
      const result = await getListingsForMap(
        userLocation.lat,
        userLocation.lon,
        radiusKm,
        150
      )

      if (result.success) {
        setListings(result.listings as MapListing[])
      }
      setLoading(false)
    }

    fetchListings()
  }, [userLocation, radiusKm])

  if (!userLocation) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-4 text-4xl">📍</div>
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Map */}
      <div className="w-full h-full">
        <TodyMap
          listings={listings}
          onListingSelect={setSelectedListing}
          userLatitude={userLocation.lat}
          userLongitude={userLocation.lon}
          zoom={12}
        />
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h2 className="font-bold text-lg mb-3">🗺️ Tody Deal Map</h2>

        {/* Radius Control */}
        <div className="mb-4">
          <button
            onClick={() => setShowRadius(!showRadius)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition text-sm"
          >
            📏 Radius: {radiusKm}km {showRadius ? '▲' : '▼'}
          </button>

          {showRadius && (
            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
              <input
                type="range"
                min="5"
                max="100"
                value={radiusKm}
                onChange={e => setRadiusKm(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-2 text-center">
                {radiusKm}km
              </div>
            </div>
          )}
        </div>

        {/* Listing Count */}
        <div className="text-sm text-gray-600">
          {loading ? (
            <p>Loading listings...</p>
          ) : (
            <p>
              📍 {listings.length} {listings.length === 1 ? 'deal' : 'deals'} nearby
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
          <p className="mb-2 font-semibold">Deal Score Color:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#ef4444' }}
              ></div>
              <span>80-100: Excellent</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#f97316' }}
              ></div>
              <span>60-79: Very Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#eab308' }}
              ></div>
              <span>40-59: Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#84cc16' }}
              ></div>
              <span>20-39: Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#22c55e' }}
              ></div>
              <span>0-19: Below Average</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Stats */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 text-sm text-gray-700">
        <div className="font-bold mb-2">📊 Map Stats</div>
        <div className="space-y-1 text-xs">
          <p>Radius: {radiusKm}km</p>
          <p>Listings: {listings.length}</p>
          {listings.length > 0 && (
            <>
              <p>
                Avg Deal Score:{' '}
                {Math.round(
                  listings.reduce((sum, l) => sum + l.deal_score, 0) / listings.length
                )}
              </p>
              <p>
                Price Range: ${Math.min(...listings.map(l => l.price / 100)).toFixed(0)} -{' '}
                ${Math.max(...listings.map(l => l.price / 100)).toFixed(0)}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Selected Listing Card */}
      {selectedListing && (
        <MapListingCard
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  )
}
