'use client'

import { useEffect, useRef, useState } from 'react'
import { getActiveListings } from '@/lib/actions/listings'
import VideoProductCard from '@/app/components/VideoProductCard'
import type { ListingWithDealScore } from '@/lib/types'

export default function VideoFeedPage() {
  const [listings, setListings] = useState<ListingWithDealScore[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 })
  const [viewMode, setViewMode] = useState<'video' | 'grid'>('video')
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

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
          // Fallback to NYC
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        }
      )
    }
  }, [])

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        const result = await getActiveListings({
          userLat: userLocation.lat,
          userLng: userLocation.lng,
          radiusKm: 100,
          sortBy: 'dealScore',
        })
        setListings(result)
      } catch (error) {
        console.error('Error fetching listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [userLocation])

  // Handle scroll/swipe
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      scrollTimeout.current = setTimeout(() => {
        const scrollPosition = container.scrollTop
        const itemHeight = container.clientHeight
        const newIndex = Math.round(scrollPosition / itemHeight)

        setCurrentIndex(Math.min(newIndex, listings.length - 1))
      }, 100)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [listings.length])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setCurrentIndex(Math.min(currentIndex + 1, listings.length - 1))
      } else if (e.key === 'ArrowUp') {
        setCurrentIndex(Math.max(currentIndex - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, listings.length])

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading marketplace feed...</p>
        </div>
      </div>
    )
  }

  if (!listings.length) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-2xl font-bold mb-4">No listings found</p>
          <p className="opacity-75">Try expanding your search area</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video Feed View */}
      {viewMode === 'video' && (
        <div
          ref={containerRef}
          className="w-full h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {listings.map((listing) => (
            <div key={listing.id} className="snap-always snap-center">
              <VideoProductCard
                listing={listing}
                onBuyClick={(id) => {
                  window.location.href = `/product/${id}`
                }}
                onSaveClick={(id) => {
                  console.log('Saved listing:', id)
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="w-full h-screen bg-gray-900 overflow-y-scroll pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((listing) => (
                <a
                  key={listing.id}
                  href={`/product/${listing.id}`}
                  className="bg-black rounded-lg overflow-hidden hover:shadow-lg transition hover:shadow-blue-500/20"
                >
                  {listing.images && listing.images[0] && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="text-white text-sm font-bold line-clamp-2 mb-2">{listing.title}</h3>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-lg font-bold text-blue-400">${listing.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">📍 {listing.distance}km</p>
                      </div>
                      <p className="text-xs font-bold text-green-400">⭐ {listing.seller?.rating?.toFixed(1)}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-white font-bold text-2xl">🎁 Tody Feed</h1>
          <div className="flex gap-3">
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium text-sm transition">
              For You
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium text-sm transition">
              Near Me
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-medium text-sm transition">
              🔥 Trending
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'video' ? 'grid' : 'video')}
              className={`px-3 py-2 rounded-full font-medium text-sm transition ${
                viewMode === 'video'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {viewMode === 'video' ? '📹' : '📊'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Progress Indicator (video view only) */}
      {viewMode === 'video' && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full z-50">
          {currentIndex + 1} / {listings.length}
        </div>
      )}

      {/* Scroll Hint (disappears after first scroll, video view only) */}
      {viewMode === 'video' && currentIndex === 0 && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white animate-bounce z-50">
          <p className="text-sm opacity-75">Scroll to explore ↓</p>
        </div>
      )}
    </div>
  )
}
