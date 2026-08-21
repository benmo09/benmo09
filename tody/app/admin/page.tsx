'use client'

import { useEffect, useState } from 'react'
import { getAdminDashboardStats } from '@/lib/actions/admin'

interface DashboardStats {
  revenue: {
    totalGMV: number
    totalFees: number
    completedOrders: number
  }
  users: {
    buyers: number
    sellers: number
    blocked: number
  }
  listings: {
    active: number
    pending: number
    rejected: number
    frozen: number
    last24h: number
  }
  activity24h: {
    orders: number
    bids: number
    offers: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const result = await getAdminDashboardStats()
      if (result.success) {
        setStats(result.stats)
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!stats) {
    return <div className="text-center py-8 text-red-600">Failed to load stats</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Gross Merchandise Volume</div>
          <div className="text-3xl font-bold">${(stats.revenue.totalGMV / 100).toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Tody Fees Collected</div>
          <div className="text-3xl font-bold text-green-600">
            ${(stats.revenue.totalFees / 100).toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Completed Orders</div>
          <div className="text-3xl font-bold">{stats.revenue.completedOrders}</div>
        </div>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Active Buyers</div>
          <div className="text-3xl font-bold">{stats.users.buyers}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Active Sellers</div>
          <div className="text-3xl font-bold">{stats.users.sellers}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Blocked Users</div>
          <div className="text-3xl font-bold text-red-600">{stats.users.blocked}</div>
        </div>
      </div>

      {/* Listing Metrics */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm mb-2">Active Listings</div>
          <div className="text-2xl font-bold">{stats.listings.active}</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg shadow border border-yellow-200">
          <div className="text-gray-600 text-sm mb-2">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.listings.pending}</div>
        </div>
        <div className="bg-red-50 p-6 rounded-lg shadow border border-red-200">
          <div className="text-gray-600 text-sm mb-2">Rejected</div>
          <div className="text-2xl font-bold text-red-600">{stats.listings.rejected}</div>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-200">
          <div className="text-gray-600 text-sm mb-2">Frozen</div>
          <div className="text-2xl font-bold text-blue-600">{stats.listings.frozen}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg shadow border border-green-200">
          <div className="text-gray-600 text-sm mb-2">Added (24h)</div>
          <div className="text-2xl font-bold text-green-600">{stats.listings.last24h}</div>
        </div>
      </div>

      {/* Activity 24h */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Activity (Last 24 Hours)</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-gray-600 text-sm mb-2">Orders</div>
            <div className="text-2xl font-bold">{stats.activity24h.orders}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm mb-2">Bids</div>
            <div className="text-2xl font-bold">{stats.activity24h.bids}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm mb-2">Offers</div>
            <div className="text-2xl font-bold">{stats.activity24h.offers}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
