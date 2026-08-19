import { useState } from 'react'
import { motion } from 'framer-motion'
import StripePayment from '../components/StripePayment'
import { processPurchase } from '../lib/purchase'

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isProcessing, setIsProcessing] = useState(false)

  const product = {
    id: '1',
    name: 'iPhone 15 Pro',
    emoji: '📱',
    originalPrice: 10000,
    finalPrice: 3450,
    sellerId: 'seller1',
  }

  const handlePaymentSuccess = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true)
      // Process purchase through Firebase
      const result = await processPurchase(
        product.id,
        product.sellerId,
        product.finalPrice
      )
      console.log('Purchase successful:', result)
      // Redirect to success page or show confirmation
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
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

        {/* Payment Forms */}
        {paymentMethod === 'card' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <StripePayment
              amount={product.finalPrice}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isLoading={isProcessing}
            />
          </motion.div>
        )}

        {paymentMethod === 'google' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isProcessing}
            className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2"
          >
            <span>🔵</span>
            <span>Pay with Google Pay</span>
          </motion.button>
        )}

        {paymentMethod === 'apple' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isProcessing}
            className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2"
          >
            <span>🍎</span>
            <span>Pay with Apple Pay</span>
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
