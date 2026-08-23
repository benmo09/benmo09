'use client'

import { useEffect, useState } from 'react'
import { getSellerStats, getSellerReviews, getSellerListings } from '@/lib/actions/seller'
import type { SellerStats, Review, Listing } from '@/lib/types'

export default function SellerProfilePage({ params }: { params: { sellerId: string } }) {
  const [seller, setSeller] = useState<(SellerStats & { user: any }) | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')

  useEffect(() => {
    loadSellerData()
  }, [params.sellerId])

  const loadSellerData = async () => {
    setLoading(true)
    try {
      const [statsRes, reviewsRes, listingsRes] = await Promise.all([
        getSellerStats(params.sellerId),
        getSellerReviews(params.sellerId, 10),
        getSellerListings(params.sellerId, 'active', 12),
      ])

      if (statsRes.success && statsRes.stats) setSeller(statsRes.stats)
      if (reviewsRes.success && reviewsRes.reviews) setReviews(reviewsRes.reviews)
      if (listingsRes.success && listingsRes.listings) setListings(listingsRes.listings)
    } catch (error) {
      console.error('Error loading seller data:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller profile...</p>
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Seller not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seller Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-6">
            <img
              src={seller.user?.avatar_url || '/default-avatar.png'}
              alt={seller.user?.full_name || 'Seller'}
              className="w-24 h-24 rounded-full border-4 border-white"
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{seller.user?.full_name || 'Seller'}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-blue-100">Rating</p>
                  <p className="font-bold text-lg">⭐ {seller.average_rating?.toFixed(1) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-blue-100">Reviews</p>
                  <p className="font-bold text-lg">{seller.review_count}</p>
                </div>
                <div>
                  <p className="text-blue-100">Sales</p>
                  <p className="font-bold text-lg">{seller.total_sales}</p>
                </div>
                <div>
                  <p className="text-blue-100">Response Rate</p>
                  <p className="font-bold text-lg">{seller.response_rate?.toFixed(0) || 0}%</p>
                </div>
              </div>
            </div>
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-lg transition">
              Contact Seller
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Seller Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Active Listings</p>
            <p className="text-3xl font-bold text-blue-600">{seller.active_listings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600">${(seller.total_revenue / 100).toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Avg Response</p>
            <p className="text-3xl font-bold text-purple-600">{seller.avg_response_time || 'N/A'}</p>
            <p className="text-xs text-gray-600">hours</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-1">Repeat Buyers</p>
            <p className="text-3xl font-bold text-orange-600">{seller.repeat_buyer_count}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === 'listings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Active Listings ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 font-semibold border-b-2 transition ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div className="p-6">
              {listings.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No active listings</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <a
                      key={listing.id}
                      href={`/product/${listing.id}`}
                      className="group cursor-pointer"
                    >
                      <div className="bg-gray-100 rounded-lg overflow-hidden h-48 mb-3 group-hover:shadow-lg transition">
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                        {listing.title}
                      </h3>
                      <div className="flex justify-between items-end">
                        <p className="text-lg font-bold text-blue-600">
                          ${(listing.price / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">{listing.quantity} available</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="p-6">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No reviews yet</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.reviewer?.avatar_url || '/default-avatar.png'}
                          alt={review.reviewer?.full_name || 'Reviewer'}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold">{review.reviewer?.full_name || 'Anonymous'}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {review.verified_purchase && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          {review.title && <p className="font-semibold mb-1">{review.title}</p>}
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                          {review.images?.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {review.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Review image ${idx + 1}`}
                                  className="w-16 h-16 rounded object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
