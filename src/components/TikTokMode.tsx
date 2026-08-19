import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Auction } from '../hooks/useAuctions'

interface TikTokModeProps {
  auctions: Auction[]
}

export default function TikTokMode({ auctions }: TikTokModeProps) {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none')
  const touchStartY = useRef(0)

  const currentAuction = auctions[currentIndex]

  const handleNext = () => {
    if (currentIndex < auctions.length - 1) {
      setDirection('up')
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('down')
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handlePrev()
      if (e.key === 'ArrowDown') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  if (!currentAuction) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-primary to-secondary">
        <p className="text-white text-2xl font-bold">אין אוקשנים זמינים</p>
      </div>
    )
  }

  const discount = Math.round(
    ((currentAuction.originalPrice - currentAuction.currentPrice) / currentAuction.originalPrice) * 100
  )
  const isUrgent = currentAuction.timeRemaining < 60

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{
            y: direction === 'up' ? 1000 : direction === 'down' ? -1000 : 0,
            opacity: 0,
          }}
          animate={{ y: 0, opacity: 1 }}
          exit={{
            y: direction === 'up' ? -1000 : direction === 'down' ? 1000 : 0,
            opacity: 0,
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary to-secondary"
        >
          {/* Emoji Section */}
          <motion.div
            animate={{ scale: isUrgent ? [1, 1.15, 1] : 1 }}
            transition={{
              duration: isUrgent ? 0.6 : 1,
              repeat: isUrgent ? Infinity : 0,
            }}
            className="text-9xl mb-8"
          >
            {currentAuction.emoji}
          </motion.div>

          {/* Product Name */}
          <h2 className="text-4xl font-bold text-white mb-4 text-center px-4">
            {currentAuction.productName}
          </h2>

          {/* Category */}
          {currentAuction.category && (
            <p className="text-white/80 text-lg mb-6">{currentAuction.category}</p>
          )}

          {/* Discount Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-8 right-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold text-2xl"
          >
            -{discount}%
          </motion.div>

          {/* Price Section */}
          <div className="space-y-4 mb-8 text-center">
            <div className="text-white/80 text-lg">מחיר מקורי:</div>
            <div className="text-white line-through opacity-75 text-xl">
              ₪{currentAuction.originalPrice.toLocaleString('he-IL')}
            </div>

            <motion.div
              key={currentAuction.currentPrice}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-6xl font-bold text-white"
            >
              ₪{currentAuction.currentPrice.toLocaleString('he-IL')}
            </motion.div>
          </div>

          {/* Timer */}
          <motion.div
            className={`px-8 py-4 rounded-full font-bold text-2xl mb-12 ${
              isUrgent
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-yellow-400/30 text-white border-2 border-yellow-400'
            }`}
          >
            <motion.div
              key={currentAuction.timeRemaining}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              ⏱️ {formatTime(currentAuction.timeRemaining)}
            </motion.div>
            {isUrgent && <div className="text-sm mt-2">🚨 עומד להסתיים!</div>}
          </motion.div>

          {/* Buy Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/product/${currentAuction.id}`)}
            className="bg-white text-primary px-12 py-4 rounded-full font-bold text-2xl mb-20 shadow-2xl hover:shadow-3xl transition-all"
          >
            🛒 קנה עכשיו
          </motion.button>

          {/* Swipe Instructions */}
          <div className="absolute bottom-8 text-white/60 text-sm text-center">
            <p>👆 סחוף למעלה למוצר הבא</p>
            <p>👇 סחוף למטה חזרה</p>
          </div>

          {/* Counter */}
          <div className="absolute bottom-20 right-6 text-white font-bold text-lg">
            {currentIndex + 1} / {auctions.length}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handlePrev}
          className="absolute top-8 left-8 z-50 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all backdrop-blur"
        >
          👆 הקודם
        </motion.button>
      )}

      {currentIndex < auctions.length - 1 && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleNext}
          className="absolute bottom-8 left-8 z-50 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all backdrop-blur"
        >
          👇 הבא
        </motion.button>
      )}
    </div>
  )
}
