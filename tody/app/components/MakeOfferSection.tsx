'use client'

import { useState } from 'react'
import { createOffer, updateOffer } from '@/lib/actions/offers'
import type { Offer } from '@/lib/actions/offers'
import { formatPrice } from '@/lib/utils/pricing'

interface MakeOfferSectionProps {
  listingId: string
  listingPrice: number
  buyerId?: string
  existingOffer?: Offer
  onOfferCreated?: () => void
}

export default function MakeOfferSection({
  listingId,
  listingPrice,
  buyerId,
  existingOffer,
  onOfferCreated,
}: MakeOfferSectionProps) {
  const [offeredPrice, setOfferedPrice] = useState(
    existingOffer?.offered_price.toString() || (listingPrice * 0.8).toString()
  )
  const [message, setMessage] = useState(existingOffer?.message || '')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const priceAsNumber = parseFloat(offeredPrice) || 0
  const savingsPercent = Math.round(((listingPrice - priceAsNumber) / listingPrice) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buyerId) {
      setError('You must be logged in to make an offer')
      return
    }

    if (priceAsNumber <= 0) {
      setError('Offer price must be greater than 0')
      return
    }

    if (priceAsNumber >= listingPrice) {
      setError('Offer price must be less than the listing price')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let result
      if (existingOffer) {
        result = await updateOffer(existingOffer.id, priceAsNumber, message)
      } else {
        result = await createOffer(listingId, buyerId, priceAsNumber, message)
      }

      if (result) {
        setSubmitted(true)
        onOfferCreated?.()
        setTimeout(() => setSubmitted(false), 3000)
      } else {
        setError('Failed to submit offer. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">💬 Make an Offer</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Offer Price Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Offer Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={loading}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <p>List Price: {formatPrice(listingPrice)}</p>
              {savingsPercent > 0 && (
                <p className="text-green-600 font-semibold">
                  Save {savingsPercent}% ({formatPrice(listingPrice - priceAsNumber)})
                </p>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => setOfferedPrice((listingPrice * 0.9).toString())}
                className="text-blue-600 hover:underline"
              >
                -10%
              </button>
              {' | '}
              <button
                type="button"
                onClick={() => setOfferedPrice((listingPrice * 0.75).toString())}
                className="text-blue-600 hover:underline"
              >
                -25%
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Would love to buy this! Can you ship immediately?"
            rows={3}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
          />
        </div>

        {/* Info Box */}
        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p>
            <strong>How it works:</strong> The seller will be notified of your offer. They can
            accept, reject, or counter your offer within 7 days.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success Message */}
        {submitted && (
          <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
            ✓ {existingOffer ? 'Offer updated!' : 'Offer submitted!'} Seller will respond soon.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition-colors"
        >
          {loading
            ? 'Submitting...'
            : existingOffer
              ? 'Update Offer'
              : 'Submit Offer'}
        </button>
      </form>

      {/* Offer Status */}
      {existingOffer && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900">Current Offer Status</p>
          <p className="text-sm text-blue-800 mt-1">
            Status: <span className="font-bold capitalize">{existingOffer.status}</span>
          </p>
          <p className="text-sm text-blue-800 mt-1">
            Amount: <span className="font-bold">{formatPrice(existingOffer.offered_price)}</span>
          </p>
          {existingOffer.expires_at && (
            <p className="text-xs text-blue-700 mt-2">
              Expires: {new Date(existingOffer.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
