import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Tody Admin</h1>

        <nav className="space-y-4">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/listings"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            📋 Listings
          </Link>
          <Link
            href="/admin/users"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            👥 Users
          </Link>
          <Link
            href="/admin/settings"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            ⚙️ Settings
          </Link>
          <Link
            href="/admin/logs"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            📝 Audit Logs
          </Link>
          <hr className="my-4 border-gray-700" />
          <Link
            href="/"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition text-sm text-gray-400"
          >
            ← Back to App
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  )
}
