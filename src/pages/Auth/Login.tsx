import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signInWithApple, loading, error } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLocalError(null)
      await signInWithGoogle()
      navigate('/')
    } catch (err) {
      setLocalError('Google login failed')
    }
  }

  const handleAppleLogin = async () => {
    try {
      setLocalError(null)
      await signInWithApple()
      navigate('/')
    } catch (err) {
      setLocalError('Apple login failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-warm p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔐 התחברות
        </h1>

        {/* Error Message */}
        {(error || localError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-accent p-4 rounded mb-6"
          >
            <p className="text-accent font-semibold">❌ {error || localError}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-bold mb-2">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-bold mb-2">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
            />
          </motion.div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'מחכה...' : 'התחבר'}
          </motion.button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 border-t-2 border-gray-300"></div>
          <span className="text-gray-500">או</span>
          <div className="flex-1 border-t-2 border-gray-300"></div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-smooth font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔵 התחבר עם Google
          </motion.button>
          <motion.button
            type="button"
            onClick={handleAppleLogin}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dark text-dark rounded-lg hover:bg-dark hover:text-white transition-smooth font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🍎 התחבר עם Apple
          </motion.button>
        </div>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            אין לך חשבון?{' '}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              הירשם כאן
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
