'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pb-20">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-3xl font-bold">
              🎁 <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Tody</span>
            </div>
            <div className="hidden md:flex gap-6 items-center text-sm">
              <Link href="/feed-video" className="text-gray-300 hover:text-white transition">Feed</Link>
              <Link href="/search" className="text-gray-300 hover:text-white transition">Search</Link>
              <Link href="/live" className="text-gray-300 hover:text-white transition">Live</Link>
              <Link href="/sell" className="text-gray-300 hover:text-white transition">Sell</Link>
            </div>
            <div className="flex gap-3 items-center">
              <Link href="/profile" className="text-gray-300 hover:text-white transition text-sm">
                Profile
              </Link>
              <Link href="/feed-video" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition text-sm">
                Browse Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 safe-area-inset-top">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-black mb-6">
            Prices <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">DROP</span> in Real-Time
          </h1>
          <p className="text-xl text-gray-300 mb-8">Watch deals get better every hour. Video-first marketplace where time = money.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-2">📉</div>
              <h3 className="text-white font-bold mb-1">Prices Drop</h3>
              <p className="text-gray-400 text-sm">Every second counts as deals get better</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-2">🎥</div>
              <h3 className="text-white font-bold mb-1">Video First</h3>
              <p className="text-gray-400 text-sm">TikTok-style discovery of thousands of deals</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-2">⏰</div>
              <h3 className="text-white font-bold mb-1">Act Fast</h3>
              <p className="text-gray-400 text-sm">Limited time offers expire in 24 hours</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/feed-video" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition text-lg transform hover:scale-105">
              🎬 Watch Feed →
            </Link>
            <Link href="/search" className="bg-white/10 backdrop-blur border border-white/30 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-lg transition text-lg">
              🔍 Search Deals
            </Link>
            <Link href="/sell" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-lg transition text-lg transform hover:scale-105">
              📤 Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">The Tody Experience</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/feed-video" className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 hover:bg-white/10 hover:border-white/20 transition group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">📱</div>
              <h3 className="text-xl font-bold mb-2">Video Feed</h3>
              <p className="text-gray-400">Vertical scrolling discovery. Browse products like TikTok.</p>
            </Link>

            <Link href="/feed-video?view=grid" className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 hover:bg-white/10 hover:border-white/20 transition group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">📊</div>
              <h3 className="text-xl font-bold mb-2">Grid View</h3>
              <p className="text-gray-400">Traditional marketplace grid. Same deals, your preference.</p>
            </Link>

            <Link href="/search" className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 hover:bg-white/10 hover:border-white/20 transition group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🔍</div>
              <h3 className="text-xl font-bold mb-2">Smart Search</h3>
              <p className="text-gray-400">Find exactly what you want. Advanced filters for deals.</p>
            </Link>

            <Link href="/live" className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 hover:bg-white/10 hover:border-white/20 transition group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">🔴</div>
              <h3 className="text-xl font-bold mb-2">Live Shopping</h3>
              <p className="text-gray-400">Watch sellers demo products. Interact in real-time.</p>
            </Link>

            <Link href="/sell" className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 hover:bg-white/10 hover:border-white/20 transition group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">📤</div>
              <h3 className="text-xl font-bold mb-2">Easy Selling</h3>
              <p className="text-gray-400">Upload in 4 steps. Set your own prices and duration.</p>
            </Link>

            <Link href="/profile" className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 hover:bg-white/10 hover:border-white/20 transition group">
              <div className="text-5xl mb-4 group-hover:scale-110 transition">👤</div>
              <h3 className="text-xl font-bold mb-2">Your Profile</h3>
              <p className="text-gray-400">Manage listings, orders, and saved items.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How Prices Drop</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">🛍️ For Buyers</h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Browse video feed or use search to find products</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Watch the countdown timer ticking down</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>See the price drop lower every minute</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Buy when price reaches your target</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">5.</span>
                  <span>Secure checkout with buyer protection</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6">📦 For Sellers</h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold">1.</span>
                  <span>Upload photos and write description in 4 steps</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold">2.</span>
                  <span>Set starting price, floor price, and duration</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold">3.</span>
                  <span>Watch your listing appear in the feed</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold">4.</span>
                  <span>Live stream to interact with buyers</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-400 font-bold">5.</span>
                  <span>Get paid securely after delivery</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white/5 backdrop-blur border-t border-b border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Join the Movement</h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-400">50K+</div>
              <p className="text-gray-400 mt-2">Active Listings</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">25K+</div>
              <p className="text-gray-400 mt-2">Satisfied Buyers</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400">4.8★</div>
              <p className="text-gray-400 mt-2">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Start Saving Now</h2>
        <p className="text-xl text-gray-300 mb-8">Watch prices drop. Find amazing deals. Shop smarter.</p>
        <Link href="/feed-video" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-lg transition text-lg transform hover:scale-105">
          Explore Deals Now 🚀
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-gray-400 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Tody - Real-time Price Drop Marketplace</p>
        </div>
      </footer>
    </div>
  )
}
