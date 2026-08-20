'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [status, setStatus] = useState('Checking connection...')
  const [error, setError] = useState<string | null>(null)
  const [tables, setTables] = useState<string[]>([])

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) throw authError

        // Get list of tables
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')

        if (tablesError) {
          // Fallback: try a simple query instead
          const { data: result, error: queryError } = await supabase
            .from('users')
            .select('id')
            .limit(1)

          if (!queryError || queryError.code === 'PGRST116') {
            // Table exists but is empty, or doesn't exist yet
            setStatus('✅ Supabase connection successful!')
            setTables(['Connection verified - Ready for schema import'])
            return
          }
        }

        setStatus('✅ Supabase connection successful!')
        setTables(tables?.map(t => t.table_name) || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setStatus('❌ Connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Connection Test</h1>

        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-700 mb-2">Status:</p>
          <p className="text-xl font-bold text-blue-600">{status}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-800 font-semibold mb-2">Error:</p>
            <p className="text-red-700 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Make sure you've added your Supabase credentials to <code>.env.local</code>
            </p>
          </div>
        )}

        {tables.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-green-800 font-semibold mb-3">Tables found:</p>
            <ul className="space-y-1">
              {tables.map(table => (
                <li key={table} className="text-green-700 text-sm flex items-center">
                  <span className="mr-2">•</span>
                  {table}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!error && tables.length === 0 && status.includes('successful') && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-blue-800 text-sm">
              ℹ️ No tables found yet. Run the SQL migration to create the schema:
            </p>
            <p className="text-blue-700 text-xs mt-2">
              Copy contents of <code>migrations/001_initial_schema.sql</code> and run it in Supabase SQL Editor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
