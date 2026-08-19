import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { createAuction } from '../lib/purchase'

const EMOJIS = ['📱', '💻', '🖥️', '🎧', '⌚', '📷', '🎮', '💾', '⚡', '🎯']
const CATEGORIES = ['אלקטרוניקה', 'טכנולוגיה', 'אביזרים', 'ציוד', 'משהו אחר']

export default function CreateAuction() {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    productName: '',
    emoji: '📱',
    originalPrice: '',
    minPrice: '',
    priceDropPerMinute: '1',
    durationHours: '24',
    category: 'אלקטרוניקה',
    description: '',
  })

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold mb-4">🔐 נדרש התחברות</h1>
        <p className="text-gray-600 mb-6">אתה צריך להתחבר כדי ליצור אוקשן חדש</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          התחבר עכשיו
        </motion.button>
      </motion.div>
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.productName || !formData.originalPrice || !formData.minPrice) {
        setError('אנא מלא את כל השדות')
        setLoading(false)
        return
      }

      const originalPrice = parseFloat(formData.originalPrice)
      const minPrice = parseFloat(formData.minPrice)

      if (minPrice >= originalPrice) {
        setError('מחיר מינימום חייב להיות קטן מהמחיר המקורי')
        setLoading(false)
        return
      }

      await createAuction(
        formData.productName,
        formData.emoji,
        originalPrice,
        minPrice,
        parseFloat(formData.priceDropPerMinute),
        parseInt(formData.durationHours),
        formData.category,
        formData.description
      )

      // Success - redirect to home
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create auction'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-warm p-8">
        <h1 className="text-3xl font-bold mb-2">➕ יצירת אוקשן חדש</h1>
        <p className="text-gray-600 mb-8">בחר מוצר ותן לשוק להחליט את המחיר!</p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-accent p-4 rounded mb-6"
          >
            <p className="text-accent font-semibold">❌ {error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-bold mb-2">שם המוצר *</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="iPhone 15 Pro"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
            />
          </motion.div>

          {/* Emoji & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emoji Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-bold mb-2">בחר אימוג'י</label>
              <div className="grid grid-cols-5 gap-2">
                {EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, emoji }))}
                    whileHover={{ scale: 1.1 }}
                    className={`text-3xl p-2 rounded-lg transition-smooth ${
                      formData.emoji === emoji
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Category */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-bold mb-2">קטגוריה *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-bold mb-2">תיאור (אופציונלי)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="תאר את המוצר בפירוט..."
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth resize-none"
            />
          </motion.div>

          {/* Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Price */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-bold mb-2">מחיר מקורי (₪) *</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="10000"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
              />
            </motion.div>

            {/* Min Price */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-bold mb-2">מחיר מינימום (₪) *</label>
              <input
                type="number"
                name="minPrice"
                value={formData.minPrice}
                onChange={handleChange}
                placeholder="5000"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
              />
            </motion.div>
          </div>

          {/* Price Drop & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Drop Per Minute */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-bold mb-2">ירידת מחיר לדקה (₪)</label>
              <input
                type="number"
                name="priceDropPerMinute"
                value={formData.priceDropPerMinute}
                onChange={handleChange}
                placeholder="1"
                min="0.1"
                step="0.1"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
              />
              <p className="text-xs text-gray-500 mt-1">כל דקה המחיר יורד בסכום זה</p>
            </motion.div>

            {/* Duration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-sm font-bold mb-2">משך אוקשן (שעות)</label>
              <select
                name="durationHours"
                value={formData.durationHours}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
              >
                <option value="1">1 שעה</option>
                <option value="6">6 שעות</option>
                <option value="12">12 שעות</option>
                <option value="24">24 שעות</option>
                <option value="48">48 שעות</option>
                <option value="72">72 שעות</option>
              </select>
            </motion.div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ יוצר אוקשן...' : '✅ צור אוקשן'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-smooth"
            >
              ❌ בטל
            </motion.button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  )
}
