import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface StripePaymentProps {
  amount: number
  onSuccess?: (paymentMethodId: string) => void
  onError?: (error: string) => void
  isLoading?: boolean
}

export default function StripePayment({
  amount,
  onSuccess,
  onError,
  isLoading = false,
}: StripePaymentProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setError('Payment system not loaded')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // Create payment method
      const { error: methodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        })

      if (methodError) {
        setError(methodError.message || 'Payment failed')
        onError?.(methodError.message || 'Payment failed')
        return
      }

      // Call success callback with payment method ID
      onSuccess?.(paymentMethod.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      setError(message)
      onError?.(message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Card Element */}
      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1C1206',
                fontFamily: 'Segoe UI, system-ui, sans-serif',
                '::placeholder': {
                  color: '#999999',
                },
              },
              invalid: {
                color: '#E74C3C',
              },
            },
          }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-accent p-4 rounded"
        >
          <p className="text-accent font-semibold">❌ {error}</p>
        </motion.div>
      )}

      {/* Amount Summary */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-lg">סה"כ לתשלום:</span>
          <span className="text-3xl font-bold">₪{amount.toLocaleString('he-IL')}</span>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!stripe || !elements || processing || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing || isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            עיבוד תשלום...
          </span>
        ) : (
          '✅ שלם עכשיו'
        )}
      </motion.button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
        <span>🔒</span>
        <span>הנתונים שלך מאובטחים על ידי Stripe</span>
      </div>
    </motion.form>
  )
}
