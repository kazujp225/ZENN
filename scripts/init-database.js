const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSqlFile() {
  try {
    console.log('🚀 Initializing Supabase database...')
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'init.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      try {
        // Skip empty statements
        if (!statement.trim()) continue
        
        // Execute via Supabase RPC or direct query
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        }).catch(async () => {
          // If RPC doesn't exist, try direct execution
          return await supabase.from('_sql').select(statement + ';')
        })
        
        if (error) {
          console.error(`❌ Error executing: ${statement.substring(0, 50)}...`)
          console.error(error.message)
          errorCount++
        } else {
          successCount++
          process.stdout.write('.')
        }
      } catch (err) {
        errorCount++
        console.error(`❌ Failed to execute statement: ${err.message}`)
      }
    }
    
    console.log('\n')
    console.log(`✅ Successfully executed ${successCount} statements`)
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements failed`)
    }
    
    // Test connection by checking tables
    console.log('\n🔍 Verifying tables...')
    
    const tables = [
      'users',
      'articles', 
      'topics',
      'books',
      'scraps',
      'notifications'
    ]
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ Table '${table}': Not found or error`)
      } else {
        console.log(`✅ Table '${table}': Ready (${count || 0} records)`)
      }
    }
    
    console.log('\n🎉 Database initialization complete!')
    console.log('You can now start using the application.')
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Alternative: Use direct PostgreSQL connection
async function initWithPostgres() {
  const { Client } = require('pg')
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })
  
  try {
    console.log('🔗 Connecting to PostgreSQL directly...')
    await client.connect()
    
    const sqlPath = path.join(__dirname, '..', 'supabase', 'init.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📝 Executing SQL script...')
    await client.query(sqlContent)
    
    console.log('✅ Database initialized successfully!')
    
    // Verify tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('\n📊 Created tables:')
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    
    // Try to provide helpful error messages
    if (error.message.includes('already exists')) {
      console.log('\n💡 Some tables already exist. This is normal if running multiple times.')
    }
    
  } finally {
    await client.end()
  }
}

// Check if pg is installed
try {
  require('pg')
  console.log('Using direct PostgreSQL connection...')
  initWithPostgres()
} catch {
  console.log('Using Supabase client...')
  executeSqlFile()
}