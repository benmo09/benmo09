'use client'

import { useEffect, useState } from 'react'
import { searchStays } from '@/lib/actions/stays'
import type { Stay } from '@/lib/types'

export default function StaysPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 40.7128,
    lng: -74.006,
  })
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [guests, setGuests] = useState(1)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })
  const [stays, setStays] = useState<(Stay & { distance: number })[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null)

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Fallback to NYC if geolocation fails
        }
      )
    }

    // Set default dates
    const today = new Date()
    const checkIn = new Date(today)
    checkIn.setDate(checkIn.getDate() + 1)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 3)

    setCheckInDate(checkIn.toISOString().split('T')[0])
    setCheckOutDate(checkOut.toISOString().split('T')[0])
  }, [])

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates')
      return
    }

    setLoading(true)
    const result = await searchStays(
      userLocation.lat,
      userLocation.lng,
      50,
      checkInDate,
      checkOutDate,
      guests,
      priceRange.min,
      priceRange.max
    )

    if (result.success && result.stays) {
      setStays(result.stays.sort((a, b) => a.distance - b.distance))
    }
    setLoading(false)
  }

  const getTotalNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Tody Stays</h1>
          <p className="text-lg opacity-90">Discover unique places to stay near you</p>
        </div>
      </div>

      {/* Search Panel */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">Check In</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">Check Out</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-semibold mb-2">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} guest{n !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-semibold mb-2">Max Price/Night</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max price"
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Finding perfect stays...</p>
          </div>
        ) : stays.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">
              {checkInDate && checkOutDate ? 'No stays found. Try adjusting your search criteria.' : 'Search for stays'}
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {stays.length} stay{stays.length !== 1 ? 's' : ''} found
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stays.map((stay) => {
                const totalNights = getTotalNights()
                const totalPrice = stay.price_per_night * totalNights
                return (
                  <div
                    key={stay.id}
                    className="bg-white rounded-xl overflow-hidden shadow hover:shadow-xl transition cursor-pointer"
                    onClick={() => setSelectedStay(stay)}
                  >
                    {/* Image */}
                    {stay.images.length > 0 && (
                      <div className="relative h-48 overflow-hidden bg-gray-200">
                        <img
                          src={stay.images[0]}
                          alt={stay.title}
                          className="w-full h-full object-cover hover:scale-110 transition"
                        />
                        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                          ⭐ {stay.rating?.toFixed(1) || 'New'}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{stay.title}</h3>

                      {/* Details */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5M12 1.5v3M8 1.5v3M1.5 6.5h16.5M15 1.5h2M6.5 9v4M6.5 13h7" />
                          </svg>
                          {stay.bedrooms} bed{stay.bedrooms !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M12 6a2 2 0 110-4 2 2 0 010 4zM12 12a2 2 0 110-4 2 2 0 010 4zM12 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                          {stay.bathrooms} bath{stay.bathrooms !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          </svg>
                          {stay.max_guests} guests
                        </div>
                      </div>

                      {/* Distance */}
                      <p className="text-sm text-gray-500 mb-3">📍 {stay.distance.toFixed(1)} km away</p>

                      {/* Price */}
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-2xl font-bold">${(stay.price_per_night / 100).toFixed(2)}</p>
                            <p className="text-sm text-gray-600">per night</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{totalNights} nights</p>
                            <p className="text-lg font-semibold">${(totalPrice / 100).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mt-3">
                        Book Now
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedStay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedStay.title}</h2>
              <button
                onClick={() => setSelectedStay(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Image Gallery */}
              {selectedStay.images.length > 0 && (
                <img
                  src={selectedStay.images[0]}
                  alt={selectedStay.title}
                  className="w-full h-80 object-cover rounded-lg mb-6"
                />
              )}

              {/* Host Info */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                  <div>
                    <h3 className="font-bold text-lg">Hosted by Property Owner</h3>
                    <p className="text-gray-600">⭐ {selectedStay.rating?.toFixed(1) || 'New'} ({selectedStay.review_count} reviews)</p>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
                <div>
                  <p className="text-gray-600 text-sm">Bedrooms</p>
                  <p className="text-2xl font-bold">{selectedStay.bedrooms}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Bathrooms</p>
                  <p className="text-2xl font-bold">{selectedStay.bathrooms}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Guests</p>
                  <p className="text-2xl font-bold">{selectedStay.max_guests}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Category</p>
                  <p className="text-2xl font-bold capitalize">{selectedStay.category}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="font-bold text-lg mb-3">About this place</h4>
                <p className="text-gray-700">{selectedStay.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="font-bold text-lg mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedStay.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span>${(selectedStay.price_per_night / 100).toFixed(2)} × {getTotalNights()} nights</span>
                  <span>${((selectedStay.price_per_night * getTotalNights()) / 100).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${((selectedStay.price_per_night * getTotalNights()) / 100).toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
