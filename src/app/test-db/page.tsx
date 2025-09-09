'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestDatabasePage() {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [tables, setTables] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        
        // Test basic connection by fetching tables
        const { data, error } = await supabase
          .from('articles')
          .select('id')
          .limit(1)

        if (error) {
          // If error is about missing table, that's expected for now
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            setStatus('Connected to database, but tables need to be created')
            setError('Run ./deploy-database.sh to create tables')
          } else {
            throw error
          }
        } else {
          setStatus('✅ Database connection successful!')
          
          // Try to get list of tables
          const { data: tablesData } = await supabase.rpc('get_tables', {})
          if (tablesData) {
            setTables(tablesData.map((t: any) => t.tablename))
          }
        }
      } catch (err: any) {
        setStatus('❌ Connection failed')
        setError(err.message || 'Unknown error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        <p className={`text-lg ${error ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {tables.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Available Tables:</h3>
            <ul className="list-disc list-inside">
              {tables.map(table => (
                <li key={table}>{table}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Database Info:</h3>
          <p className="text-sm">
            URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
          </p>
          <p className="text-sm mt-2">
            To deploy the database schema, run:
          </p>
          <code className="block mt-2 p-2 bg-gray-800 text-white rounded">
            ./deploy-database.sh
          </code>
        </div>
      </div>
    </div>
  )
}