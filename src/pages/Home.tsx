import { motion } from 'framer-motion'
import { useAuctions } from '../hooks/useAuctions'
import AuctionCard from '../components/AuctionCard'

export default function Home() {
  const { auctions, loading } = useAuctions()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-warm text-white"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🔥 AUCTIONS LIVE
        </h1>
        <p className="text-xl mb-6">
          המחיר יורד עד שמישהו קונה!
        </p>
        <p className="text-lg opacity-90">
          קנה מוצרים במחיר הנמוך ביותר בשוק
        </p>
      </motion.section>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 flex-wrap justify-center"
      >
        {['הכל', 'טכנולוגיה', 'אלקטרוניקה', 'אביזרים'].map((filter) => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-full bg-white border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-smooth"
          >
            {filter}
          </motion.button>
        ))}
      </motion.div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {auctions.map((auction, index) => (
          <motion.div
            key={auction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AuctionCard auction={auction} />
          </motion.div>
        ))}
      </div>

      {/* Info Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-warm mt-12"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          כיצד זה עובד?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { emoji: '🛍️', title: 'בחר מוצר', desc: 'בחר מחד מהמוצרים השפם שלנו' },
            { emoji: '⏰', title: 'המתן להנמכת מחיר', desc: 'המחיר יורד בקצב קבוע עד שמישהו קונה' },
            { emoji: '💳', title: 'שלם וקנה', desc: 'בחר שיטת תשלום וסיים את הקנייה' },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="text-center p-6 bg-gradient-to-b from-background to-white rounded-xl"
            >
              <div className="text-5xl mb-4">{step.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
