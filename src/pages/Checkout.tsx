import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  })

  const product = {
    name: 'iPhone 15 Pro',
    emoji: '📱',
    originalPrice: 10000,
    finalPrice: 3450,
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Processing payment:', { paymentMethod, cardData })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
    >
      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2 bg-white rounded-2xl shadow-warm p-8"
      >
        <h2 className="text-3xl font-bold mb-8">💳 בחר שיטת תשלום</h2>

        <div className="space-y-4 mb-8">
          {/* Payment Method Cards */}
          {[
            { id: 'card', name: '💳 כרטיס אשראי', icon: '💳' },
            { id: 'google', name: '🔵 Google Pay', icon: '🔵' },
            { id: 'apple', name: '🍎 Apple Pay', icon: '🍎' },
          ].map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setPaymentMethod(method.id)}
              className={`w-full p-4 rounded-xl text-right border-2 transition-smooth font-bold ${
                paymentMethod === method.id
                  ? 'border-primary bg-orange-50'
                  : 'border-gray-300 hover:border-primary'
              }`}
            >
              {method.icon} {method.name}
            </motion.button>
          ))}
        </div>

        {/* Credit Card Form */}
        {paymentMethod === 'card' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold mb-2">שם בעל הכרטיס</label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                placeholder="בן משה"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">מספר כרטיס</label>
              <input
                type="text"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">תאריך תפוגה</label>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">CVV</label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full btn-primary py-3 mt-6"
            >
              בצע תשלום
            </motion.button>
          </motion.form>
        )}

        {paymentMethod !== 'card' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="w-full btn-primary py-3 mt-6"
          >
            בצע תשלום
          </motion.button>
        )}
      </motion.div>

      {/* Order Summary Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-warm p-8 h-fit sticky top-24"
      >
        <h3 className="text-2xl font-bold mb-6">📋 סיכום הזמנה</h3>

        <div className="bg-gradient-to-b from-primary to-secondary rounded-xl p-8 text-center text-white mb-6">
          <div className="text-5xl mb-4">{product.emoji}</div>
          <h4 className="text-xl font-bold">{product.name}</h4>
        </div>

        <div className="space-y-3 border-t border-gray-300 pt-4">
          <div className="flex justify-between">
            <span>מחיר מקורי:</span>
            <span className="line-through">₪{product.originalPrice.toLocaleString('he-IL')}</span>
          </div>
          <div className="flex justify-between text-primary font-bold">
            <span>הנחה:</span>
            <span>-₪{(product.originalPrice - product.finalPrice).toLocaleString('he-IL')}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>סה"כ:</span>
            <span className="text-2xl text-primary">₪{product.finalPrice.toLocaleString('he-IL')}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg text-center">
          <p className="font-bold text-green-700">✓ תשלום מאובטח 100%</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
