'use client'

import { useEffect, useState } from 'react'
import { getSystemSettings, updateSystemSettings } from '@/lib/actions/admin'

interface SystemSettings {
  platform_fee_percentage: number
  min_platform_fee: number
  enable_auctions: boolean
  enable_offers: boolean
  enable_tody_drop: boolean
  enable_messaging: boolean
  minimum_transaction_amount: number
  maximum_transaction_amount: number
  require_listing_approval: boolean
  maintenance_mode: boolean
  maintenance_message: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<SystemSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    const result = await getSystemSettings()
    if (result.success) {
      setSettings(result.settings)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const result = await updateSystemSettings(settings, 'Admin updated system settings')
    if (result.success) {
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } else {
      setMessage(`Error: ${result.error}`)
    }
    setSaving(false)
  }

  const handleChange = (key: keyof SystemSettings, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">System Settings</h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.includes('Error')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8 space-y-6 max-w-2xl">
        {/* Platform Fee */}
        <div>
          <h2 className="text-xl font-bold mb-4">💰 Platform Fee</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Platform Fee Percentage
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={settings.platform_fee_percentage || 0}
                  onChange={e => handleChange('platform_fee_percentage', parseFloat(e.target.value))}
                  className="flex-1 border rounded px-3 py-2"
                />
                <span className="text-gray-600">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Minimum Platform Fee (cents)
              </label>
              <input
                type="number"
                value={settings.min_platform_fee || 0}
                onChange={e => handleChange('min_platform_fee', parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-bold mb-4">🎯 Features</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enable_auctions || false}
                onChange={e => handleChange('enable_auctions', e.target.checked)}
              />
              <span>Enable Auctions</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enable_offers || false}
                onChange={e => handleChange('enable_offers', e.target.checked)}
              />
              <span>Enable Offers</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enable_tody_drop || false}
                onChange={e => handleChange('enable_tody_drop', e.target.checked)}
              />
              <span>Enable Tody Drop</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enable_messaging || false}
                onChange={e => handleChange('enable_messaging', e.target.checked)}
              />
              <span>Enable Messaging</span>
            </label>
          </div>
        </div>

        {/* Transaction Limits */}
        <div>
          <h2 className="text-xl font-bold mb-4">💳 Transaction Limits</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Minimum Transaction (cents)
              </label>
              <input
                type="number"
                value={settings.minimum_transaction_amount || 0}
                onChange={e => handleChange('minimum_transaction_amount', parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Maximum Transaction (cents)
              </label>
              <input
                type="number"
                value={settings.maximum_transaction_amount || 0}
                onChange={e => handleChange('maximum_transaction_amount', parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Moderation */}
        <div>
          <h2 className="text-xl font-bold mb-4">⚖️ Moderation</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.require_listing_approval || false}
                onChange={e => handleChange('require_listing_approval', e.target.checked)}
              />
              <span>Require Admin Approval for New Listings</span>
            </label>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div>
          <h2 className="text-xl font-bold mb-4">🔧 Maintenance</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.maintenance_mode || false}
                onChange={e => handleChange('maintenance_mode', e.target.checked)}
              />
              <span>Maintenance Mode</span>
            </label>
            {settings.maintenance_mode && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Maintenance Message
                </label>
                <textarea
                  value={settings.maintenance_message || ''}
                  onChange={e => handleChange('maintenance_message', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Message shown to users when maintenance mode is enabled"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
