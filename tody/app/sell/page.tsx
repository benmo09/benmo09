'use client'

import { useState } from 'react'

export default function SellPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electronics',
    condition: 'new',
    images: [] as File[],
    imagePreviews: [] as string[],
    startingPrice: '',
    floorPrice: '',
    duration: 24,
    priceDropEnabled: true,
    shippingOption: 'both',
    pickupLocation: '',
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const categories = [
    { id: 'electronics', label: '📱 Electronics' },
    { id: 'fashion', label: '👗 Fashion' },
    { id: 'home', label: '🏠 Home & Garden' },
    { id: 'sports', label: '⚽ Sports' },
    { id: 'gaming', label: '🎮 Gaming' },
    { id: 'other', label: '📦 Other' },
  ]

  const conditions = [
    { id: 'new', label: '✨ New' },
    { id: 'like-new', label: '⭐ Like New' },
    { id: 'good', label: '👍 Good' },
    { id: 'fair', label: '👌 Fair' },
  ]

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    handleImageFiles(files)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleImageFiles(Array.from(e.target.files))
    }
  }

  const handleImageFiles = (files: File[]) => {
    const newFiles = [...formData.images, ...files].slice(0, 5)
    const previews = newFiles.map(f => URL.createObjectURL(f))

    setFormData(prev => ({
      ...prev,
      images: newFiles,
      imagePreviews: previews,
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handlePublish = () => {
    console.log('Publishing product:', formData)
    alert('Product published! (Demo)')
  }

  const progress = (step / 4) * 100

  return (
    <div className="min-h-screen bg-gray-50 pb-24 safe-area-inset-bottom">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-inset-top">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Sell Something</h1>
          <p className="text-sm text-gray-600 mt-1">Step {step} of 4</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Photos & Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">📸 Add Photos</h2>
              <div
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-input"
                />
                <label htmlFor="image-input" className="cursor-pointer">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="font-semibold text-gray-900">Drop images here or click</p>
                  <p className="text-sm text-gray-500 mt-1">Up to 5 images, JPG or PNG</p>
                </label>
              </div>

              {/* Image Previews */}
              {formData.imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    {formData.imagePreviews.length} image{formData.imagePreviews.length !== 1 ? 's' : ''} uploaded
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {formData.imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">📝 Product Title</h2>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.g., iPhone 15 Pro Max 256GB Blue"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-2">{formData.title.length}/100</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Description</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item, condition, any damage, original packaging, etc."
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-2">{formData.description.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {conditions.map(cond => (
                    <option key={cond.id} value={cond.id}>{cond.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">💡 Tip: Lower floor prices = faster sales but smaller profit margins</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">💰 Set Your Prices</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Starting Price</label>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 mr-2">$</span>
                    <input
                      type="number"
                      name="startingPrice"
                      value={formData.startingPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">What your item starts at</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Floor Price (Minimum)</label>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 mr-2">$</span>
                    <input
                      type="number"
                      name="floorPrice"
                      value={formData.floorPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Lowest price after countdown expires</p>
                </div>

                {formData.startingPrice && formData.floorPrice && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      ✓ Discount range: ${(Number(formData.startingPrice) - Number(formData.floorPrice)).toFixed(2)} ({((Number(formData.startingPrice) - Number(formData.floorPrice)) / Number(formData.startingPrice) * 100).toFixed(0)}%)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">⏱️ Auction Duration</h2>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours (Recommended)</option>
                <option value={48}>48 hours</option>
              </select>
            </div>

            <label className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                name="priceDropEnabled"
                checked={formData.priceDropEnabled}
                onChange={handleCheckChange}
                className="w-5 h-5 rounded"
              />
              <div>
                <p className="font-semibold text-gray-900">Enable Price Drop</p>
                <p className="text-sm text-gray-600">Price decreases from starting to floor price over duration</p>
              </div>
            </label>
          </div>
        )}

        {/* Step 3: Shipping & Pickup */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">📦 Shipping & Pickup</h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: formData.shippingOption === 'both' ? '#3b82f6' : undefined }}>
                  <input
                    type="radio"
                    name="shippingOption"
                    value="both"
                    checked={formData.shippingOption === 'both'}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Both Shipping & Pickup</p>
                    <p className="text-sm text-gray-600">Buyers can choose their preferred method</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: formData.shippingOption === 'shipping' ? '#3b82f6' : undefined }}>
                  <input
                    type="radio"
                    name="shippingOption"
                    value="shipping"
                    checked={formData.shippingOption === 'shipping'}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Shipping Only</p>
                    <p className="text-sm text-gray-600">Items will be shipped via USPS/FedEx</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition" style={{ borderColor: formData.shippingOption === 'pickup' ? '#3b82f6' : undefined }}>
                  <input
                    type="radio"
                    name="shippingOption"
                    value="pickup"
                    checked={formData.shippingOption === 'pickup'}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Pickup Only</p>
                    <p className="text-sm text-gray-600">Buyers must pick up in person</p>
                  </div>
                </label>
              </div>
            </div>

            {(formData.shippingOption === 'both' || formData.shippingOption === 'pickup') && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">📍 Pickup Location</h2>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="E.g., Downtown Coffee Shop, 123 Main St"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">Specific location where buyer can pick up</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Publish */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">✅ Review Your Listing</h2>

              <div className="space-y-4">
                {formData.imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Photos</p>
                    <div className="flex gap-2">
                      {formData.imagePreviews.slice(0, 3).map((img, idx) => (
                        <img key={idx} src={img} alt={`Preview ${idx}`} className="w-16 h-16 object-cover rounded-lg" />
                      ))}
                      {formData.imagePreviews.length > 3 && (
                        <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center text-sm font-bold">
                          +{formData.imagePreviews.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-700">Title</p>
                  <p className="text-gray-900">{formData.title}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Category</p>
                  <p className="text-gray-900">{categories.find(c => c.id === formData.category)?.label}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Starting Price</p>
                    <p className="text-2xl font-bold text-blue-600">${Number(formData.startingPrice).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Floor Price</p>
                    <p className="text-2xl font-bold text-green-600">${Number(formData.floorPrice).toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Duration</p>
                  <p className="text-gray-900">{formData.duration} hour{formData.duration !== 1 ? 's' : ''}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Shipping</p>
                  <p className="text-gray-900 capitalize">{formData.shippingOption.replace('-', ' ')}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                ⚠️ By publishing, you agree to Tody's terms. Listings cannot be edited after publishing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-bold transition"
            >
              ← Back
            </button>
          )}
          {step < 4 && (
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
            >
              Next →
            </button>
          )}
          {step === 4 && (
            <button
              onClick={handlePublish}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition text-lg"
            >
              🚀 Publish Listing
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
