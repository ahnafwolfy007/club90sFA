/**
 * Simple Database Test and Setup
 * Tests if database is available and sets up basic configuration
 */

const { Pool } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔄 Testing database connection...\n');
  
  // Try different common configurations
  const configs = [
    {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'club90s_management',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
    },
    {
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: '',
      port: 5432,
    }
  ];
  
  for (const config of configs) {
    try {
      console.log(`🔍 Trying connection to ${config.host}:${config.port}/${config.database}...`);
      
      const pool = new Pool(config);
      const result = await pool.query('SELECT NOW() as timestamp');
      
      console.log('✅ Database connection successful!');
      console.log(`📅 Server time: ${result.rows[0].timestamp}`);
      console.log(`🗄️  Connected to: ${config.database}`);
      
      await pool.end();
      
      // If successful, create .env with working config
      const envContent = `# Club 90s Database Configuration
DB_HOST=${config.host}
DB_PORT=${config.port}
DB_USER=${config.user}
DB_PASSWORD=${config.password}
DB_NAME=club90s_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
`;
      
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '..', '.env');
      
      if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env configuration file');
      }
      
      return true;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      continue;
    }
  }
  
  console.log('\n❌ No working database connection found.');
  console.log('\n💡 Database Setup Options:');
  console.log('   1. Install PostgreSQL locally');
  console.log('   2. Use a cloud database service');
  console.log('   3. Use Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres');
  console.log('\n🔧 For now, the application will run without database connectivity.');
  console.log('   Authentication will work in demo mode.');
  
  return false;
}

// Run if called directly
if (require.main === module) {
  testDatabaseConnection().then(success => {
    if (success) {
      console.log('\n🎉 Database setup completed!');
      console.log('   You can now run: npm run setup-schema');
    } else {
      console.log('\n⚠️  Application will run in demo mode without database.');
    }
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testDatabaseConnection };