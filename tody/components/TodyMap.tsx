'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getDealScoreColor } from '@/lib/utils/dealScore'

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

interface TodyMapProps {
  listings: MapListing[]
  onListingSelect: (listing: MapListing) => void
  userLatitude?: number
  userLongitude?: number
  zoom?: number
}

export default function TodyMap({
  listings,
  onListingSelect,
  userLatitude = 40.7128,
  userLongitude = -74.006,
  zoom = 12,
}: TodyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    map.current = L.map(mapContainer.current).setView([userLatitude, userLongitude], zoom)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map.current)

    // Add user location marker
    const userIcon = L.divIcon({
      html: `
        <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      `,
      iconSize: [24, 24],
      className: '',
    })

    L.marker([userLatitude, userLongitude], { icon: userIcon, title: 'Your location' }).addTo(
      map.current
    )

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [userLatitude, userLongitude, zoom])

  // Add/update markers
  useEffect(() => {
    if (!map.current) return

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current.clear()

    // Add new markers
    listings.forEach(listing => {
      const color = getDealScoreColor(listing.deal_score)
      const score = listing.deal_score

      const icon = L.divIcon({
        html: `
          <div class="flex flex-col items-center">
            <div class="relative">
              <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C10.48 0 6 4.48 6 10C6 17.59 16 40 16 40S26 17.59 26 10C26 4.48 21.52 0 16 0Z"
                      fill="${color}" stroke="white" stroke-width="1.5"/>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                ${score}
              </div>
            </div>
            <div class="bg-white rounded px-2 py-1 text-xs font-semibold shadow-md mt-1 whitespace-nowrap">
              $${(listing.price / 100).toFixed(0)}
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
        className: 'cursor-pointer',
      })

      const marker = L.marker([listing.latitude, listing.longitude], { icon })
        .addTo(map.current!)
        .on('click', () => onListingSelect(listing))

      markersRef.current.set(listing.id, marker)
    })
  }, [listings, onListingSelect])

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full bg-gray-200" />
    </div>
  )
}
