'use client'

import { useState } from 'react'

export default function LiveShoppingPage() {
  const [activeStream, setActiveStream] = useState<string | null>('stream-1')
  const [viewerCount, setViewerCount] = useState(1234)
  const [messages, setMessages] = useState([
    { id: 1, user: 'Sarah', message: '🔥 This is amazing!', time: '2m ago' },
    { id: 2, user: 'Mike', message: 'Just bought 2!', time: '1m ago' },
    { id: 3, user: 'Emma', message: 'Is this still available?', time: '30s ago' },
  ])

  const liveStreams = [
    {
      id: 'stream-1',
      sellerName: 'TechDeals Store',
      sellerRating: 4.8,
      title: '🎮 Gaming Setup Bundle - LIMITED TIME!',
      currentPrice: 89.99,
      originalPrice: 199.99,
      discount: 55,
      viewers: 1234,
      productImage: '🎮',
      status: 'live',
      startedAt: '15 mins ago',
    },
    {
      id: 'stream-2',
      sellerName: 'Fashion Boutique',
      sellerRating: 4.9,
      title: '👗 Summer Collection Flash Sale',
      currentPrice: 24.99,
      originalPrice: 79.99,
      discount: 69,
      viewers: 856,
      productImage: '👗',
      status: 'live',
      startedAt: '8 mins ago',
    },
    {
      id: 'stream-3',
      sellerName: 'Electronics Hub',
      sellerRating: 4.7,
      title: '⌚ Smart Watch Liquidation',
      currentPrice: 49.99,
      originalPrice: 199.99,
      discount: 75,
      viewers: 2104,
      productImage: '⌚',
      status: 'scheduled',
      startedAt: 'Starts in 45 mins',
    },
  ]

  const currentStreamData = liveStreams.find((s) => s.id === activeStream)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🎥 Tody LIVE</h1>
          <div className="text-sm text-white/70">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            {viewerCount.toLocaleString()} watching
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stream Player */}
          <div className="lg:col-span-2 space-y-4">
            {currentStreamData && (
              <>
                {/* Video Player Area */}
                <div className="relative bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-center text-white space-y-4">
                    <div className="text-8xl">{currentStreamData.productImage}</div>
                    <div>
                      <p className="text-2xl font-bold">{currentStreamData.title}</p>
                      <p className="text-sm opacity-75 mt-2">
                        🔴 LIVE • {currentStreamData.startedAt}
                      </p>
                    </div>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>

                  {/* Viewers Count */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    👁️ {currentStreamData.viewers.toLocaleString()}
                  </div>
                </div>

                {/* Product Info Card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-90">Current Product</p>
                      <h2 className="text-2xl font-bold">{currentStreamData.title}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-75">by {currentStreamData.sellerName}</p>
                      <p className="text-yellow-300 text-sm">⭐ {currentStreamData.sellerRating}</p>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/20 rounded-lg p-3 text-center">
                      <p className="text-xs opacity-75 mb-1">Current</p>
                      <p className="text-2xl font-bold">${currentStreamData.currentPrice}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 text-center line-through opacity-75">
                      <p className="text-xs mb-1">Original</p>
                      <p className="text-lg">${currentStreamData.originalPrice}</p>
                    </div>
                    <div className="bg-yellow-400/30 rounded-lg p-3 text-center">
                      <p className="text-xs mb-1">Save</p>
                      <p className="text-2xl font-bold">{currentStreamData.discount}%</p>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/30">
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    <div>
                      <p className="font-semibold">{currentStreamData.sellerName}</p>
                      <p className="text-xs opacity-75">⭐ {currentStreamData.sellerRating} rating</p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition">
                      🛒 BUY NOW
                    </button>
                    <button className="flex-1 bg-white/20 border border-white text-white font-bold py-3 rounded-xl hover:bg-white/30 transition">
                      💬 Questions?
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Streams & Chat */}
          <div className="space-y-6">
            {/* Upcoming Streams */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-4 text-sm uppercase">📺 Other Streams</h3>
              <div className="space-y-3">
                {liveStreams
                  .filter((s) => s.id !== activeStream)
                  .map((stream) => (
                    <button
                      key={stream.id}
                      onClick={() => setActiveStream(stream.id)}
                      className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-3 transition group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{stream.productImage}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold line-clamp-2 group-hover:text-blue-400">
                            {stream.title}
                          </p>
                          <p className="text-white/50 text-xs mt-1">
                            {stream.status === 'live' ? (
                              <>
                                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                                {stream.viewers} watching
                              </>
                            ) : (
                              <>⏰ {stream.startedAt}</>
                            )}
                          </p>
                          <p className="text-green-400 text-xs font-bold mt-1">💰 {stream.discount}% OFF</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Live Chat */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 flex flex-col h-96">
              <h3 className="text-white font-bold mb-3 text-sm uppercase">💬 Chat</h3>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-thin scrollbar-thumb-white/20">
                {messages.map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <span className="font-semibold text-white">{msg.user}</span>
                    <span className="text-white/50 ml-2">{msg.time}</span>
                    <p className="text-white/75 mt-1">{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <input
                  type="text"
                  placeholder="Send message..."
                  className="flex-1 bg-white/10 text-white text-xs px-3 py-2 rounded-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition">
                  Send
                </button>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 rounded-xl transition text-lg shadow-lg">
              🔔 Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
