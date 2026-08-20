'use client'

import { useEffect, useState } from 'react'
import { getListingWithScore } from '@/lib/actions/listings'
import { getAuctionByListingId } from '@/lib/actions/bids'
import { getBuyerOffer } from '@/lib/actions/offers'
import BuyNowSection from '@/app/components/BuyNowSection'
import MakeOfferSection from '@/app/components/MakeOfferSection'
import TodyDropSection from '@/app/components/TodyDropSection'
import AuctionSection from '@/app/components/AuctionSection'
import type { ListingWithDealScore } from '@/lib/types'
import type { AuctionData } from '@/lib/actions/bids'
import type { Offer } from '@/lib/actions/offers'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [listing, setListing] = useState<ListingWithDealScore | null>(null)
  const [auction, setAuction] = useState<AuctionData | null>(null)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.006 })
  const [buyerId] = useState('user-123') // TODO: Get from auth context

  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 40.7128, lng: -74.006 })
    } else {
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

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch listing with score
        const listingData = await getListingWithScore(
          params.id,
          userLocation.lat,
          userLocation.lng
        )

        if (!listingData) {
          setError('Listing not found')
          return
        }

        setListing(listingData)

        // Fetch auction if applicable
        if (listingData.sale_type === 'auction') {
          const auctionData = await getAuctionByListingId(params.id)
          setAuction(auctionData)
        }

        // Fetch buyer's existing offer
        if (listingData.sale_type === 'buy_now' && buyerId) {
          const existingOffer = await getBuyerOffer(params.id, buyerId)
          setOffer(existingOffer)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [params.id, userLocation, buyerId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <p className="text-red-600 font-semibold mb-4">{error || 'Product not found'}</p>
          <a
            href="/marketplace"
            className="text-blue-600 hover:underline font-semibold"
          >
            ← Back to Marketplace
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a
            href="/marketplace"
            className="text-blue-600 hover:underline text-sm font-medium mb-4 inline-block"
          >
            ← Back to Marketplace
          </a>
          <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
          <p className="text-gray-600 mt-2">{listing.category_id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 mb-6">
                {listing.images.slice(0, 4).map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`${listing.title} ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 border-2 border-gray-200"
                  />
                ))}
                {listing.images.length > 4 && (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center font-semibold text-gray-600">
                    +{listing.images.length - 4}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">
                {listing.description}
              </p>

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Purchase Options */}
          <div className="lg:col-span-1">
            {/* Sale Type Section */}
            {listing.sale_type === 'buy_now' && (
              <BuyNowSection
                listing={listing}
                onPurchase={() => console.log('Purchase initiated')}
              />
            )}

            {listing.sale_type === 'buy_now' && (
              <MakeOfferSection
                listingId={listing.id}
                listingPrice={listing.price}
                buyerId={buyerId}
                existingOffer={offer || undefined}
                onOfferCreated={() => console.log('Offer created')}
              />
            )}

            {listing.sale_type === 'drop' && (
              <TodyDropSection
                listingId={listing.id}
                startPrice={listing.price}
                minPrice={listing.price * 0.5}
                startTime={listing.created_at}
                endTime={listing.expires_at}
                onPurchase={() => console.log('Purchase initiated')}
              />
            )}

            {listing.sale_type === 'auction' && auction && (
              <AuctionSection
                auction={auction}
                bidderId={buyerId}
                onBidPlaced={() => console.log('Bid placed')}
              />
            )}

            {/* Seller Info Box */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>

              <div className="flex items-center gap-3 mb-4">
                {listing.seller.avatar_url && (
                  <img
                    src={listing.seller.avatar_url}
                    alt={listing.seller.full_name || 'Seller'}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {listing.seller.full_name || 'Unknown Seller'}
                  </p>
                  <p className="text-yellow-500 text-sm">
                    ★★★★★ ({listing.seller.rating.toFixed(1)})
                  </p>
                </div>
              </div>

              <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 rounded-lg transition-colors mb-2">
                View Profile
              </button>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
                Send Message
              </button>

              <p className="text-xs text-gray-600 text-center mt-4">
                ✓ Verified Seller • Member since 2023
              </p>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
              <h3 className="font-bold text-gray-900 mb-4">Shipping & Returns</h3>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📦</span>
                  <div>
                    <p className="font-semibold">Fast Shipping</p>
                    <p className="text-gray-600">Usually ships within 1-2 business days</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <p className="font-semibold">Buyer Protection</p>
                    <p className="text-gray-600">Full refund if item not as described</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-lg">↩️</span>
                  <div>
                    <p className="font-semibold">Easy Returns</p>
                    <p className="text-gray-600">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
