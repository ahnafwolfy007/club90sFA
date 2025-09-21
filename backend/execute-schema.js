const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function executeSchema() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Club90sFA',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log('📄 Reading schema...');
    const schema = fs.readFileSync('clean-schema.sql', 'utf8');
    
    console.log('🔨 Executing schema...');
    await pool.query(schema);
    
    console.log('✅ Schema executed successfully!');
    
    // Test by counting tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📊 Created ${result.rows.length} tables:`);
    result.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

executeSchema();