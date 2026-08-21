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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-3xl font-bold text-white">
              🎁 <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Tody</span>
            </div>
            <div className="flex gap-4 items-center">
              <Link href="/marketplace" className="text-gray-300 hover:text-white transition">Marketplace</Link>
              <Link href="/admin" className="text-gray-300 hover:text-white transition">Admin</Link>
              <Link href="/marketplace" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            Buy & Sell <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Anything</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">The ultimate marketplace for deals, auctions, and offers. Connect with buyers and sellers instantly.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-2">🔨</div>
              <h3 className="text-white font-bold mb-2">Live Auctions</h3>
              <p className="text-gray-400">Bid on exclusive items in real-time</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-2">💰</div>
              <h3 className="text-white font-bold mb-2">Make Offers</h3>
              <p className="text-gray-400">Negotiate prices with sellers directly</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/20 transition">
              <div className="text-4xl mb-2">📉</div>
              <h3 className="text-white font-bold mb-2">Price Drops</h3>
              <p className="text-gray-400">Get alerts when prices hit your target</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg transition text-lg">
              Explore Marketplace →
            </Link>
            <Link href="/admin" className="bg-white/10 backdrop-blur border border-white/30 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-lg transition text-lg">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Why Choose Tody?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure Transactions</h3>
              <p className="text-gray-400">Escrow payments with 24-hour hold for buyer protection. Stripe-powered security.</p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Listings</h3>
              <p className="text-gray-400">Post items in seconds. Multiple sale types: Buy Now, Auctions, Make an Offer, Tody Drops.</p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Analytics</h3>
              <p className="text-gray-400">Track sales, bids, and offers. Real-time deal scoring and performance metrics.</p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-400">Built with Next.js and React. Optimized for speed and performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Trading?</h2>
        <p className="text-xl text-gray-300 mb-8">Join thousands of buyers and sellers on Tody</p>
        <Link href="/marketplace" className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-lg transition text-lg">
          Browse Marketplace Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 text-gray-400 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Tody Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
