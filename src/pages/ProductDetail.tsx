import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuctions } from '../hooks/useAuctions'
import { useState, useEffect } from 'react'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { auctions } = useAuctions()
  const [auction, setAuction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const found = auctions.find((a) => a.id === id)
    setAuction(found)
    setLoading(false)
  }, [id, auctions])

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) return `${days}ד ${hours}ש`
    if (hours > 0) return `${hours}ש ${mins}דק`
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-gray-600">⏳ טוען...</p>
      </motion.div>
    )
  }

  if (!auction) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold mb-4">❌ אוקשן לא נמצא</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          חזור לבית
        </motion.button>
      </motion.div>
    )
  }

  const discount = Math.round(((auction.originalPrice - auction.currentPrice) / auction.originalPrice) * 100)
  const isUrgent = auction.timeRemaining < 300

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate('/')}
        className="mb-6 text-primary font-bold hover:underline"
      >
        ← חזור לבית
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-b from-primary to-secondary rounded-2xl p-12 text-center relative"
        >
          <motion.div
            animate={{ scale: isUrgent ? [1, 1.1, 1] : 1 }}
            transition={{ duration: isUrgent ? 0.5 : 1, repeat: isUrgent ? Infinity : 0 }}
            className="text-9xl mb-6"
          >
            {auction.emoji}
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg"
          >
            -{discount}%
          </motion.div>
        </motion.div>

        {/* Details Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold mb-2">{auction.productName}</h1>
            {auction.category && (
              <p className="text-gray-600 text-lg">קטגוריה: {auction.category}</p>
            )}
          </div>

          {/* Description */}
          {auction.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <h3 className="font-bold mb-2">📝 תיאור</h3>
              <p className="text-gray-700">{auction.description}</p>
            </motion.div>
          )}

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-600">מחיר מקורי:</span>
              <span className="text-xl line-through text-gray-500">
                ₪{auction.originalPrice.toLocaleString('he-IL')}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-bold text-lg">מחיר כעת:</span>
              <motion.span
                key={auction.currentPrice}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold text-primary"
              >
                ₪{auction.currentPrice.toLocaleString('he-IL')}
              </motion.span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-sm">
              <span className="text-gray-600">מחיר מינימום:</span>
              <span>₪{auction.minPrice.toLocaleString('he-IL')}</span>
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`p-4 rounded-lg text-center font-bold text-lg ${
              isUrgent
                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
            }`}
          >
            <div>⏱️ {formatTime(auction.timeRemaining)}</div>
            {isUrgent && <div className="text-sm mt-1">זה עומד להסתיים בקרוב!</div>}
          </motion.div>

          {/* Buy Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-4 text-lg font-bold"
            >
              🛒 קנה עכשיו - ₪{auction.currentPrice.toLocaleString('he-IL')}
            </button>
          </motion.div>

          {/* Seller Info */}
          {auction.sellerName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary"
            >
              <p className="text-sm text-gray-600">מוכר:</p>
              <p className="font-bold text-primary">{auction.sellerName}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Additional Info */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-12 bg-white rounded-2xl shadow-warm p-8"
      >
        <h2 className="text-2xl font-bold mb-6">ℹ️ איך זה עובד?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              emoji: '📉',
              title: 'המחיר יורד',
              desc: `המחיר יורד ₪${auction.priceDropPerMinute} בכל דקה`,
            },
            {
              emoji: '⏰',
              title: 'לא משנוני זמן',
              desc: `כולם רואים את אותו המחיר באותו הזמן`,
            },
            {
              emoji: '🏃',
              title: 'הראשון מנצח',
              desc: 'מי שקונה ראשון, מקבל את המוצר',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">{item.emoji}</div>
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}
