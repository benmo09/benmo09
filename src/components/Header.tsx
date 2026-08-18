import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Header() {
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
            📱 TODAY
          </motion.div>
        </Link>

        <nav className="flex gap-6 items-center">
          <Link
            to="/"
            className="text-dark hover:text-primary transition-smooth"
          >
            בית
          </Link>
          <Link
            to="/profile"
            className="text-dark hover:text-primary transition-smooth"
          >
            פרופיל
          </Link>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/login"
              className="btn-primary text-sm"
            >
              התחבר
            </Link>
          </motion.div>
        </nav>
      </div>
    </motion.header>
  )
}
