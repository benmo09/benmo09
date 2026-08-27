'use client'

import { useState } from 'react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'saved' | 'settings'>('listings')

  // Mock user data
  const user = {
    name: 'John Seller',
    email: 'john@example.com',
    avatar: '👤',
    rating: 4.8,
    reviews: 234,
    joined: 'January 2024',
    verified: true,
    totalSales: 1250,
    activeListings: 12,
    savedItems: 8,
  }

  const myListings = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max 256GB',
      price: 899.99,
      startingPrice: 999.99,
      status: 'active',
      views: 342,
      image: '📱',
    },
    {
      id: '2',
      title: 'MacBook Pro 14" M3',
      price: 1299.99,
      startingPrice: 1499.99,
      status: 'active',
      views: 521,
      image: '💻',
    },
    {
      id: '3',
      title: 'PlayStation 5',
      price: 449.99,
      startingPrice: 499.99,
      status: 'sold',
      views: 1203,
      image: '🎮',
    },
  ]

  const myOrders = [
    {
      id: 'ORD-001',
      item: 'AirPods Pro',
      seller: 'Tech Store',
      price: 199.99,
      status: 'delivered',
      date: '2024-08-20',
    },
    {
      id: 'ORD-002',
      item: 'Nike Air Max',
      seller: 'Sports Outlet',
      price: 89.99,
      status: 'in-transit',
      date: '2024-08-25',
    },
  ]

  const savedItems = [
    {
      id: 'SAVE-001',
      title: 'Samsung 4K TV 55"',
      price: 599.99,
      seller: 'Electronics Hub',
      image: '📺',
    },
    {
      id: 'SAVE-002',
      title: 'DJI Air 3 Drone',
      price: 799.99,
      seller: 'Tech Deals',
      image: '🚁',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white pt-8 pb-6 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start gap-4">
            <div className="text-6xl">{user.avatar}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              {user.verified && (
                <p className="text-sm mt-1 flex items-center gap-1">
                  ✓ Verified Seller
                </p>
              )}
              <p className="text-blue-100 mt-2">
                ⭐ {user.rating} ({user.reviews} reviews)
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{user.activeListings}</p>
              <p className="text-xs text-blue-100">Active</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">${user.totalSales}</p>
              <p className="text-xs text-blue-100">Total Sales</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{user.savedItems}</p>
              <p className="text-xs text-blue-100">Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
            📤 Sell Item
          </button>
          <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition">
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {(['listings', 'orders', 'saved', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-2 text-center font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'listings' && `📦 My Listings`}
                {tab === 'orders' && `📋 Orders`}
                {tab === 'saved' && `❤️ Saved`}
                {tab === 'settings' && `⚙️ Settings`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
              <a href="/sell" className="text-blue-600 hover:underline text-sm font-semibold">
                + New Listing
              </a>
            </div>

            {myListings.length > 0 ? (
              <div className="space-y-3">
                {myListings.map(listing => (
                  <div key={listing.id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                    <div className="text-4xl">{listing.image}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{listing.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-lg font-bold text-blue-600">${listing.price}</span>
                        <span className="text-gray-500 line-through ml-2">${listing.startingPrice}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">👁️ {listing.views} views</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        listing.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.status === 'active' ? '🔴 Active' : '✓ Sold'}
                      </span>
                      <a href={`/product/${listing.id}`} className="block text-blue-600 hover:underline text-xs font-semibold mt-2">
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No active listings</p>
                <a href="/sell" className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                  📤 Create Your First Listing
                </a>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Orders</h2>

            {myOrders.length > 0 ? (
              <div className="space-y-3">
                {myOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{order.item}</h3>
                        <p className="text-sm text-gray-600">from {order.seller}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status === 'delivered' ? '✓ Delivered' : '📦 In Transit'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>${order.price}</span>
                      <span>{order.date}</span>
                    </div>
                    <button className="mt-3 text-blue-600 hover:underline text-sm font-semibold">
                      Track Order →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No orders yet</p>
              </div>
            )}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Saved Items</h2>

            {savedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-6xl">
                      {item.image}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-2">{item.seller}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-2xl font-bold text-blue-600">${item.price}</span>
                        <a href={`/product/${item.id}`} className="text-blue-600 hover:underline text-sm font-semibold">
                          View →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No saved items</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full bg-gray-100 border-0 rounded-lg px-4 py-2 text-gray-700"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Member Since</label>
                <input
                  type="text"
                  defaultValue={user.joined}
                  className="w-full bg-gray-100 border-0 rounded-lg px-4 py-2 text-gray-700"
                  disabled
                />
              </div>

              <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 rounded-lg transition">
                Change Password
              </button>

              <button className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-2 rounded-lg transition">
                Logout
              </button>

              <hr className="my-4" />

              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 Get notifications about: New messages, Order updates, Price drops</p>
                <p>🔐 Your account is verified and secure</p>
                <p>✓ Payment method saved and verified</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
