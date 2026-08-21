'use client'

import { useEffect, useState } from 'react'
import { getUsersForManagement, blockUser, unblockUser, updateUserRiskScore } from '@/lib/actions/admin'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_blocked: boolean
  risk_score: number
  risk_reason: string | null
  created_at: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRiskForm, setShowRiskForm] = useState(false)
  const [riskScore, setRiskScore] = useState(0)
  const [riskReason, setRiskReason] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const result = await getUsersForManagement(50, 0)
    if (result.success) {
      setUsers(result.users as User[])
    }
    setLoading(false)
  }

  async function handleBlock(user: User) {
    const reason = prompt(`Block ${user.full_name}? Enter reason:`)
    if (!reason) return

    setActionLoading(user.id)
    const result = await blockUser(user.id, reason)
    if (result.success) {
      await fetchUsers()
    }
    setActionLoading(null)
  }

  async function handleUnblock(user: User) {
    setActionLoading(user.id)
    const result = await unblockUser(user.id)
    if (result.success) {
      await fetchUsers()
    }
    setActionLoading(null)
  }

  async function handleUpdateRisk() {
    if (!selectedUser) return

    setActionLoading(selectedUser.id)
    const result = await updateUserRiskScore(selectedUser.id, riskScore, riskReason)
    if (result.success) {
      await fetchUsers()
      setShowRiskForm(false)
      setSelectedUser(null)
    }
    setActionLoading(null)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border flex justify-between items-center ${
                user.is_blocked
                  ? 'bg-red-50 border-red-200'
                  : user.risk_score > 70
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex-1">
                <h3 className="font-bold">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
                    {user.role}
                  </span>
                  {user.is_blocked && (
                    <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">
                      Blocked
                    </span>
                  )}
                  {user.risk_score > 0 && (
                    <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded">
                      Risk: {user.risk_score}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user)
                    setRiskScore(user.risk_score)
                    setRiskReason(user.risk_reason || '')
                    setShowRiskForm(true)
                  }}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Risk Score
                </button>
                {user.is_blocked ? (
                  <button
                    onClick={() => handleUnblock(user)}
                    disabled={actionLoading === user.id}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    onClick={() => handleBlock(user)}
                    disabled={actionLoading === user.id}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Block
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Score Modal */}
      {showRiskForm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Update Risk Score</h2>
            <p className="text-gray-600 mb-4">User: {selectedUser.full_name}</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Risk Score (0-100)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskScore}
                onChange={e => setRiskScore(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-center text-lg font-bold mt-2">{riskScore}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Reason</label>
              <textarea
                value={riskReason}
                onChange={e => setRiskReason(e.target.value)}
                className="w-full border rounded p-2 text-sm"
                rows={3}
                placeholder="Why is this user's risk score being updated?"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateRisk()}
                disabled={actionLoading === selectedUser.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Update
              </button>
              <button
                onClick={() => setShowRiskForm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
