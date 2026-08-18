import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Register:', formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-warm p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          👤 הרשמה חדשה
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-bold mb-2">שם מלא</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="בן משה"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
            />
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-bold mb-2">אימייל</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
            />
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-bold mb-2">סיסמה</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
            />
          </motion.div>

          {/* Confirm Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-bold mb-2">אימות סיסמה</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-smooth"
            />
          </motion.div>

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full btn-primary py-3 mt-6"
          >
            הירשם
          </motion.button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            כבר יש לך חשבון?{' '}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              התחבר כאן
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
