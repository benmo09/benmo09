import { motion } from 'framer-motion'

interface Transaction {
  id: string
  product: string
  amount: number
  commission: number
  date: string
  status: 'completed' | 'pending'
}

export default function Profile() {
  const user = {
    name: 'בן משה',
    email: 'ben@example.com',
  }

  const stats = {
    total: 12450,
    thisMonth: 3200,
    pending: 450,
  }

  const transactions: Transaction[] = [
    {
      id: '1',
      product: 'iPhone 15 Pro',
      amount: 3450,
      commission: 517.50,
      date: '2026-08-18',
      status: 'completed',
    },
    {
      id: '2',
      product: 'MacBook Air M3',
      amount: 7200,
      commission: 1080,
      date: '2026-08-17',
      status: 'completed',
    },
    {
      id: '3',
      product: 'iPad Pro',
      amount: 2800,
      commission: 420,
      date: '2026-08-16',
      status: 'pending',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">שלום, {user.name}! 👋</h1>
            <p className="opacity-90">{user.email}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-primary px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-smooth"
          >
            ⚙️ הגדרות
          </motion.button>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: '💰 סה"כ הרווחים', value: `₪${stats.total.toLocaleString('he-IL')}`, color: 'from-green-400 to-green-600' },
          { label: '📊 החודש הזה', value: `₪${stats.thisMonth.toLocaleString('he-IL')}`, color: 'from-blue-400 to-blue-600' },
          { label: '⏳ ממתין לאישור', value: `₪${stats.pending.toLocaleString('he-IL')}`, color: 'from-yellow-400 to-yellow-600' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-warm`}
          >
            <p className="text-white/80 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Withdrawal Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-warm p-8"
      >
        <h2 className="text-2xl font-bold mb-6">🏦 שליחת כסף לבנק</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2">סכום להעברה</label>
            <input
              type="number"
              placeholder="₪1,000"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">בחר שיטת העברה</label>
            <select className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none">
              <option>העברה בנקאית</option>
              <option>ביט</option>
              <option>PayPal</option>
            </select>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary mt-6"
        >
          העבר כסף
        </motion.button>
      </motion.section>

      {/* Transactions Table */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-warm p-8"
      >
        <h2 className="text-2xl font-bold mb-6">📜 היסטוריה של עסקאות</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-right py-3 font-bold">מוצר</th>
                <th className="text-right py-3 font-bold">סכום מכירה</th>
                <th className="text-right py-3 font-bold">קומיסיון שלך (15%)</th>
                <th className="text-right py-3 font-bold">תאריך</th>
                <th className="text-right py-3 font-bold">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-smooth"
                >
                  <td className="py-4 font-bold text-primary">{tx.product}</td>
                  <td className="py-4">₪{tx.amount.toLocaleString('he-IL')}</td>
                  <td className="py-4 font-bold text-green-600">+₪{tx.commission.toLocaleString('he-IL')}</td>
                  <td className="py-4 text-gray-600">{tx.date}</td>
                  <td className="py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {tx.status === 'completed' ? '✓ הושלם' : '⏳ ממתין'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-warm p-8"
      >
        <h2 className="text-2xl font-bold mb-6">❓ שאלות נפוצות</h2>
        <div className="space-y-4">
          {[
            { q: 'מה הקומיסיון שלי?', a: 'אתה מקבל 15% מכל מכירה' },
            { q: 'מתי הכסף יגיע לחשבוני?', a: 'תוך 3-5 ימי עסקים לאחר ההעברה' },
            { q: 'איך אני משולם?', a: 'העברה בנקאית, ביט או PayPal' },
          ].map((faq, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 5 }}
              className="border-r-4 border-primary pl-4 py-2"
            >
              <p className="font-bold text-primary">{faq.q}</p>
              <p className="text-gray-600 mt-1">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  )
}
