export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">TODAY</h3>
            <p className="text-gray-300">
              זירת מסחר שבה המחיר יורד עד שמישהו קונה
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">קישורים</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-primary transition-smooth">עזרה</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">תנאים</a></li>
              <li><a href="#" className="hover:text-primary transition-smooth">פרטיות</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">צור קשר</h4>
            <p className="text-gray-300">support@today.com</p>
            <p className="text-gray-300">📱 1-800-TODAY</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 TODAY Marketplace. כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  )
}
