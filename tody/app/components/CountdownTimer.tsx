'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  expiresAt: string
  onExpired?: () => void
}

export default function CountdownTimer({
  expiresAt,
  onExpired,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number
    minutes: number
    seconds: number
    total: number
  } | null>(null)

  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime()
      const expireTime = new Date(expiresAt).getTime()
      const total = expireTime - now

      if (total <= 0) {
        setIsExpired(true)
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, total: 0 })
        onExpired?.()
        return
      }

      const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((total / (1000 * 60)) % 60)
      const seconds = Math.floor((total / 1000) % 60)

      setTimeRemaining({ hours, minutes, seconds, total })
      setIsExpired(false)
    }

    // Calculate immediately
    calculateTime()

    // Update every second
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  if (!timeRemaining) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  if (isExpired) {
    return <div className="text-sm font-semibold text-red-600">Expired</div>
  }

  const isUrgent = timeRemaining.total < 2 * 60 * 60 * 1000 // Less than 2 hours

  return (
    <div
      className={`text-sm font-semibold ${
        isUrgent ? 'text-red-600' : 'text-gray-600'
      }`}
    >
      <span className="inline-block">
        {String(timeRemaining.hours).padStart(2, '0')}:
        {String(timeRemaining.minutes).padStart(2, '0')}:
        {String(timeRemaining.seconds).padStart(2, '0')}
      </span>
      <span className="ml-2 text-xs text-gray-500">remaining</span>
    </div>
  )
}
