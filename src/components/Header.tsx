import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthContext } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setShowMenu(false)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-warm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-4xl font-bold text-primary"
          >
            🔥 TODAY
          </motion.div>
        </Link>

        <nav className="flex gap-6 items-center">
          <Link
            to="/"
            className="text-dark hover:text-primary transition-smooth font-bold"
          >
            🏠 בית
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className="text-dark hover:text-primary transition-smooth font-bold"
              >
                👤 פרופיל
              </Link>
              <Link
                to="/create-auction"
                className="text-dark hover:text-primary transition-smooth font-bold"
              >
                ➕ אוקשן חדש
              </Link>
              <div className="relative">
                <motion.button
                  onClick={() => setShowMenu(!showMenu)}
                  whileHover={{ scale: 1.05 }}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                >
                  {user.displayName || user.email?.split('@')[0]} ▼
                </motion.button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg min-w-[200px]"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 hover:bg-primary hover:text-white transition-smooth font-bold border-b border-gray-300 last:border-b-0"
                    >
                      🚪 התנתק
                    </button>
                    <Link
                      to="/profile"
                      onClick={() => setShowMenu(false)}
                      className="block w-full text-right px-4 py-2 hover:bg-primary hover:text-white transition-smooth font-bold border-b border-gray-300 last:border-b-0"
                    >
                      ⚙️ הגדרות
                    </Link>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="text-dark hover:text-primary transition-smooth font-bold border-2 border-primary px-4 py-2 rounded-lg"
                >
                  התחבר
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  הירשם
                </Link>
              </motion.div>
            </>
          )}
        </nav>
      </div>
    </motion.header>
  )
}
