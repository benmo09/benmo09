'use client'

import { useEffect, useState } from 'react'
import { getListingsForReview, updateListingStatus } from '@/lib/actions/admin'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  quantity: number
  admin_status: string
  users: { email: string; full_name: string }
  created_at: string
}

export default function ListingsManagement() {
  const [listings, setListings] = useState<Listing[]>([])
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [status])

  async function fetchListings() {
    setLoading(true)
    const result = await getListingsForReview(status, 50)
    if (result.success) {
      setListings(result.listings as Listing[])
    }
    setLoading(false)
  }

  async function handleApprove(listingId: string) {
    setActionLoading(listingId)
    const result = await updateListingStatus(listingId, 'approved')
    if (result.success) {
      await fetchListings()
    }
    setActionLoading(null)
  }

  async function handleReject(listingId: string, reason: string) {
    setActionLoading(listingId)
    const result = await updateListingStatus(listingId, 'rejected', reason)
    if (result.success) {
      await fetchListings()
    }
    setActionLoading(null)
  }

  async function handleFreeze(listingId: string) {
    setActionLoading(listingId)
    const result = await updateListingStatus(listingId, 'frozen', 'Frozen by admin')
    if (result.success) {
      await fetchListings()
    }
    setActionLoading(null)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Listing Management</h1>

      {/* Status Tabs */}
      <div className="flex gap-4 mb-8">
        {['pending', 'approved', 'rejected', 'frozen'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded font-semibold transition ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({listings.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No listings to review</div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-lg">{listing.title}</h3>
                  <p className="text-gray-600 text-sm">{listing.description.substring(0, 100)}...</p>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Seller</div>
                  <div className="font-semibold">{listing.users.full_name}</div>
                  <div className="text-sm text-gray-500">{listing.users.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Price / Qty</div>
                  <div className="font-semibold">${(listing.price / 100).toFixed(2)}</div>
                  <div className="text-sm">Qty: {listing.quantity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="font-semibold">{new Date(listing.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(listing.id)}
                    disabled={actionLoading === listing.id}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleReject(listing.id, 'Violates content policy')}
                    disabled={actionLoading === listing.id}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                  <button
                    onClick={() => handleFreeze(listing.id)}
                    disabled={actionLoading === listing.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    ❄️ Freeze
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
