import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Auction } from '../hooks/useAuctions'

export default function AuctionCard({ auction }: { auction: Auction }) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const discount = Math.round(((auction.originalPrice - auction.currentPrice) / auction.originalPrice) * 100)
  const isUrgent = auction.timeRemaining < 60

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-warm transition-smooth"
    >
      {/* Image/Emoji Section */}
      <div className="relative bg-gradient-to-b from-primary to-secondary p-8 text-center">
        <motion.div
          animate={{ scale: isUrgent ? [1, 1.1, 1] : 1 }}
          transition={{ duration: isUrgent ? 0.5 : 1, repeat: isUrgent ? Infinity : 0 }}
          className="text-6xl"
        >
          {auction.emoji}
        </motion.div>

        {/* Discount Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full font-bold text-sm"
        >
          -{discount}%
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-dark mb-4">{auction.productName}</h3>

        {/* Price Section */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">מחיר כעת:</span>
            <motion.span
              key={auction.currentPrice}
              initial={{ scale: 1.2, color: '#F5A623' }}
              animate={{ scale: 1, color: '#1C1206' }}
              className="text-2xl font-bold text-primary"
            >
              ₪{auction.currentPrice.toLocaleString('he-IL')}
            </motion.span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>מחיר מקורי:</span>
            <span className="line-through">₪{auction.originalPrice.toLocaleString('he-IL')}</span>
          </div>
        </div>

        {/* Timer */}
        <motion.div
          className={`p-3 rounded-lg mb-4 text-center font-bold ${
            isUrgent
              ? 'bg-red-100 text-accent animate-pulse'
              : 'bg-yellow-100 text-primary'
          }`}
        >
          <motion.div
            key={auction.timeRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            ⏱️ {formatTime(auction.timeRemaining)}
          </motion.div>
          {isUrgent && <div className="text-xs mt-1">! זה עומד להסתיים !</div>}
        </motion.div>

        {/* Buy Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/checkout"
            className="w-full btn-primary text-center block"
          >
            קנה עכשיו
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
