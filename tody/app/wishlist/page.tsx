'use client'

import { useEffect, useState } from 'react'
import type { Listing } from '@/lib/types'

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<any[]>([])
  const [activeWishlist, setActiveWishlist] = useState<string | null>(null)
  const [wishlistItems, setWishlistItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [newWishlistName, setNewWishlistName] = useState('')
  const [showNewWishlist, setShowNewWishlist] = useState(false)

  useEffect(() => {
    loadWishlists()
  }, [])

  const loadWishlists = async () => {
    setLoading(true)
    // TODO: Fetch wishlists from API
    const mockWishlists = [
      { id: '1', name: 'My Favorite Deals', description: 'Best deals I found', is_public: false, items: [] },
      { id: '2', name: 'Summer Projects', description: 'Things for summer', is_public: true, items: [] },
    ]
    setWishlists(mockWishlists)
    if (mockWishlists.length > 0) {
      setActiveWishlist(mockWishlists[0].id)
    }
    setLoading(false)
  }

  const handleCreateWishlist = () => {
    if (newWishlistName.trim()) {
      // TODO: Create wishlist via API
      const newList = {
        id: Date.now().toString(),
        name: newWishlistName,
        description: '',
        is_public: false,
        items: [],
      }
      setWishlists((prev) => [...prev, newList])
      setNewWishlistName('')
      setShowNewWishlist(false)
      setActiveWishlist(newList.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">❤️ Wishlist</h1>
          <p className="text-gray-600 mt-1">Save your favorite items and manage wishlists</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wishlists Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Wishlists</h2>
                <button
                  onClick={() => setShowNewWishlist(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-2xl"
                >
                  +
                </button>
              </div>

              {/* New Wishlist Form */}
              {showNewWishlist && (
                <div className="mb-6 pb-6 border-b">
                  <input
                    type="text"
                    placeholder="Wishlist name..."
                    value={newWishlistName}
                    onChange={(e) => setNewWishlistName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateWishlist}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold text-sm"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewWishlist(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Wishlist List */}
              <div className="space-y-2">
                {loading ? (
                  <p className="text-gray-600 text-center py-4">Loading wishlists...</p>
                ) : wishlists.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No wishlists yet</p>
                ) : (
                  wishlists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => setActiveWishlist(list.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition ${
                        activeWishlist === list.id
                          ? 'bg-blue-100 text-blue-900 font-semibold border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <p className="font-semibold text-sm">{list.name}</p>
                      <p className="text-xs text-gray-600">{list.items?.length || 0} items</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Wishlist Content */}
          <div className="lg:col-span-2">
            {activeWishlist ? (
              <div className="bg-white rounded-xl shadow">
                <div className="border-b p-6">
                  {(() => {
                    const list = wishlists.find((l) => l.id === activeWishlist)
                    return (
                      <>
                        <h2 className="text-2xl font-bold mb-2">{list?.name}</h2>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600">{list?.description}</p>
                          <div className="flex items-center gap-2">
                            {list?.is_public ? (
                              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                Public
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                                Private
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Items Grid */}
                <div className="p-6">
                  {(() => {
                    const list = wishlists.find((l) => l.id === activeWishlist)
                    return list?.items && list.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {list.items.map((item: any) => (
                          <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                            {/* Item Image */}
                            <div className="h-40 bg-gray-200 overflow-hidden">
                              {item.images?.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover hover:scale-110 transition"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                                  <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Item Info */}
                            <div className="p-4">
                              <p className="font-bold line-clamp-2 mb-2">{item.title}</p>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-2xl font-bold text-blue-600">
                                    ${(item.price / 100).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-600">{item.quantity} available</p>
                                </div>
                                <button className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition">
                                  ✕
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg
                          className="w-12 h-12 mx-auto text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2m0-8c0 1.105-1.343 2-3 2s-3-.895-3-2m9-9c0-1.105 1.343-2 3-2s3 .895 3 2m0 9c0 1.105 1.343 2 3 2s3-.895 3-2"
                          />
                        </svg>
                        <p className="text-gray-600 text-lg">This wishlist is empty</p>
                        <p className="text-sm text-gray-600">Add items to save them for later</p>
                      </div>
                    )
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                </svg>
                <p className="text-gray-600 text-lg">Create a wishlist to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
