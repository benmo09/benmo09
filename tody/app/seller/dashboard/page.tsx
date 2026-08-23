'use client'

import { useEffect, useState } from 'react'
import {
  getSellerStats,
  getSellerPerformance,
  getSellerEarnings,
  getSellerListings,
  getSellerOrders,
  getSellerSubscription,
} from '@/lib/actions/seller'
import type { SellerStats, SellerPerformance } from '@/lib/types'

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [performance, setPerformance] = useState<SellerPerformance[]>([])
  const [earnings, setEarnings] = useState<{ total: number; pending: number; available: number } | null>(null)
  const [listings, setListings] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sellerId] = useState('') // TODO: Get from auth context

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    const sellerId = 'temp-seller-id' // TODO: Get from auth

    try {
      const [statsRes, perfRes, earningsRes, listingsRes, ordersRes, subRes] = await Promise.all([
        getSellerStats(sellerId),
        getSellerPerformance(sellerId, 30),
        getSellerEarnings(sellerId),
        getSellerListings(sellerId, undefined, 5),
        getSellerOrders(sellerId, 5),
        getSellerSubscription(sellerId),
      ])

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats)
      if (perfRes.success && perfRes.performance) setPerformance(perfRes.performance)
      if (earningsRes.success && earningsRes.earnings) setEarnings(earningsRes.earnings)
      if (listingsRes.success && listingsRes.listings) setListings(listingsRes.listings)
      if (ordersRes.success && ordersRes.orders) setOrders(ordersRes.orders)
      if (subRes.success && subRes.subscription) setSubscription(subRes.subscription)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's your performance overview.
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                {subscription?.tier.toUpperCase() || 'STANDARD'} Tier
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Total Revenue</h3>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.16 2.75a.75.75 0 00-.75.75v5.69H2.5a.75.75 0 000 1.5h4.91v5.69a.75.75 0 001.5 0V10.69h4.91a.75.75 0 000-1.5H9.41V3.5a.75.75 0 00-.75-.75z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">${(earnings?.total || 0) / 100}</p>
            <p className="text-sm text-gray-600 mt-2">All time earnings</p>
          </div>

          {/* Available Balance Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Available Balance</h3>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">${(earnings?.available || 0) / 100}</p>
            <p className="text-sm text-gray-600 mt-2">Ready to withdraw</p>
          </div>

          {/* Active Listings Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Active Listings</h3>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{stats?.active_listings || 0}</p>
            <p className="text-sm text-gray-600 mt-2">Of {subscription?.listing_limit || 50} available</p>
          </div>

          {/* Seller Rating Card */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold">Your Rating</h3>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold">{stats?.average_rating?.toFixed(1) || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-2">{stats?.review_count || 0} reviews</p>
          </div>
        </div>

        {/* Recent Orders & Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow">
            <div className="border-b p-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {orders.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  <p>No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{order.listing?.title || 'Product'}</p>
                        <p className="text-sm text-gray-600">Buyer: {order.buyer?.full_name || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(order.amount / 100).toFixed(2)}</p>
                        <p className={`text-xs font-semibold ${
                          order.status === 'completed' ? 'text-green-600' :
                          order.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {order.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Listings Preview */}
          <div className="bg-white rounded-xl shadow">
            <div className="border-b p-6">
              <h2 className="text-xl font-bold">Active Listings</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {listings.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  <p>No active listings</p>
                </div>
              ) : (
                listings.map((listing) => (
                  <div key={listing.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold line-clamp-2">{listing.title}</p>
                        <p className="text-sm text-gray-600">
                          Expires: {new Date(listing.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">${(listing.price / 100).toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{listing.quantity} available</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition">
            Create Listing
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition">
            View Analytics
          </button>
          {subscription?.tier === 'standard' && (
            <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition">
              Upgrade to Business
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
