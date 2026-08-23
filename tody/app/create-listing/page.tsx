'use client'

import { useState } from 'react'
import type { SaleType, ListingCondition } from '@/lib/types'

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    saleType: 'buy_now' as SaleType,
    price: 0,
    quantity: 1,
    condition: 'used' as ListingCondition,
    images: [] as string[],
    tags: [] as string[],
    lat: 40.7128,
    lng: -74.006,
    // Auction fields
    auctionStartTime: '',
    auctionEndTime: '',
    auctionStartPrice: 0,
    // Offer fields
    allowOffers: true,
    // Tody Drop fields
    dropFinalPrice: 0,
    dropDeclinePerHour: 0,
    dropEndTime: '',
  })

  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tagInput, setTagInput] = useState('')

  const categories = [
    { value: 'real-estate', label: '🏠 Real Estate' },
    { value: 'vehicles', label: '🚗 Vehicles' },
    { value: 'rentals', label: '🏨 Rentals' },
    { value: 'electronics', label: '📱 Electronics' },
    { value: 'fashion', label: '👔 Fashion' },
    { value: 'services', label: '💼 Services' },
    { value: 'food-drink', label: '🍔 Food & Drink' },
    { value: 'books-media', label: '📚 Books & Media' },
    { value: 'home-garden', label: '🏡 Home & Garden' },
  ]

  const saleTypes = [
    { value: 'buy_now', label: '💰 Buy Now', description: 'Fixed price, immediate purchase' },
    { value: 'auction', label: '🔨 Auction', description: 'Bid competition, highest bidder wins' },
    { value: 'offer', label: '🤝 Make an Offer', description: 'Buyer proposes price, you accept/reject' },
    { value: 'drop', label: '📉 Tody Drop', description: 'Price decreases over time until sold' },
    { value: 'tody_live', label: '🎥 Tody LIVE', description: 'Live shopping event with real-time sales' },
  ]

  const conditions = [
    { value: 'new', label: '✨ New' },
    { value: 'like_new', label: '⭐ Like New' },
    { value: 'used', label: '👍 Used' },
    { value: 'refurbished', label: '🔧 Refurbished' },
    { value: 'vintage', label: '🎨 Vintage' },
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImagePreview((prev) => [...prev, ...newImages])
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }))
    }
  }

  const handleRemoveImage = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index))
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Validate required fields
      if (!formData.title || !formData.category || !formData.price) {
        throw new Error('Please fill in all required fields')
      }

      // TODO: Call createListing action
      setMessage('✅ Listing created successfully!')
      setFormData({
        title: '',
        description: '',
        category: '',
        saleType: 'buy_now',
        price: 0,
        quantity: 1,
        condition: 'used',
        images: [],
        tags: [],
        lat: 40.7128,
        lng: -74.006,
        auctionStartTime: '',
        auctionEndTime: '',
        auctionStartPrice: 0,
        allowOffers: true,
        dropFinalPrice: 0,
        dropDeclinePerHour: 0,
        dropEndTime: '',
      })
      setImagePreview([])
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Create a Listing</h1>
          <p className="text-gray-600 mt-1">Sell your items on Tody in minutes</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="What are you selling?"
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Be specific - include brand, model, and key features</p>
              </div>

              <div>
                <label className="block font-semibold mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your item in detail..."
                  rows={5}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Include condition, features, and any defects</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Condition *</label>
                  <select
                    required
                    value={formData.condition}
                    onChange={(e) => setFormData((prev) => ({ ...prev, condition: e.target.value as ListingCondition }))}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {conditions.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold mb-2">Tags (Optional)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Photos</h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageInput"
              />
              <label htmlFor="imageInput" className="cursor-pointer">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="text-gray-600">Click to upload photos or drag and drop</p>
                <p className="text-xs text-gray-600">PNG, JPG up to 10MB each</p>
              </label>
            </div>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {imagePreview.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Sale Type */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Sale Type & Pricing</h2>

            <div className="space-y-4">
              {/* Sale Type Selection */}
              <div>
                <label className="block font-semibold mb-4">How do you want to sell? *</label>
                <div className="space-y-3">
                  {saleTypes.map((type) => (
                    <label key={type.value} className="border rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition">
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="saleType"
                          value={type.value}
                          checked={formData.saleType === type.value}
                          onChange={(e) => setFormData((prev) => ({ ...prev, saleType: e.target.value as SaleType }))}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold">{type.label}</p>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    {formData.saleType === 'auction' ? 'Starting Price' : 'Price'} *
                  </label>
                  <div className="flex items-center border rounded-lg">
                    <span className="bg-gray-100 px-4 py-2">$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {formData.saleType !== 'auction' && (
                  <div>
                    <label className="block font-semibold mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData((prev) => ({ ...prev, quantity: parseInt(e.target.value) }))}
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Auction Fields */}
              {formData.saleType === 'auction' && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">Start Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.auctionStartTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, auctionStartTime: e.target.value }))}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">End Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.auctionEndTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, auctionEndTime: e.target.value }))}
                        className="w-full border rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tody Drop Fields */}
              {formData.saleType === 'drop' && (
                <div className="bg-orange-50 p-4 rounded-lg space-y-4">
                  <p className="text-sm text-gray-600">Price will automatically decrease over time until sold</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">Final Price (Floor)</label>
                      <div className="flex items-center border rounded-lg">
                        <span className="bg-gray-100 px-4 py-2">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.dropFinalPrice}
                          onChange={(e) => setFormData((prev) => ({ ...prev, dropFinalPrice: parseFloat(e.target.value) }))}
                          className="flex-1 px-4 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">Decline Per Hour</label>
                      <div className="flex items-center border rounded-lg">
                        <span className="bg-gray-100 px-4 py-2">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.dropDeclinePerHour}
                          onChange={(e) => setFormData((prev) => ({ ...prev, dropDeclinePerHour: parseFloat(e.target.value) }))}
                          className="flex-1 px-4 py-2"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.dropEndTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dropEndTime: e.target.value }))}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-4 px-6 rounded-lg transition text-lg"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
