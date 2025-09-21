#!/usr/bin/env node

/**
 * Database Setup Script for Club 90s Football Academy
 * This script creates the database and all required tables
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default database first
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

async function setupDatabase() {
  let pool;
  
  try {
    console.log('🔄 Setting up Club 90s Football Academy Database...\n');
    
    // Connect to PostgreSQL
    pool = new Pool(config);
    
    // Create database if it doesn't exist
    console.log('📋 Creating database if not exists...');
    await pool.query(`
      SELECT 1 FROM pg_database WHERE datname = 'club90s_management'
    `).then(async (result) => {
      if (result.rows.length === 0) {
        await pool.query('CREATE DATABASE club90s_management');
        console.log('✅ Database "club90s_management" created successfully');
      } else {
        console.log('✅ Database "club90s_management" already exists');
      }
    }).catch(async (error) => {
      if (error.code === '42P04') {
        console.log('✅ Database "club90s_management" already exists');
      } else {
        // Try to create database anyway
        try {
          await pool.query('CREATE DATABASE club90s_management');
          console.log('✅ Database "club90s_management" created successfully');
        } catch (createError) {
          console.log('ℹ️  Database creation skipped (may already exist)');
        }
      }
    });
    
    await pool.end();
    
    // Connect to the specific database
    const dbConfig = { ...config, database: 'club90s_management' };
    pool = new Pool(dbConfig);
    
    // Read and execute schema
    console.log('\n📄 Reading database schema...');
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔨 Executing database schema...');
    await pool.query(schema);
    console.log('✅ Database schema executed successfully');
    
    // Create initial admin user
    console.log('\n👤 Creating initial admin user...');
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('Admin123!@#', 12);
    
    const adminUser = await pool.query(`
      INSERT INTO users (
        full_name, email, phone, password_hash, role, status, 
        membership_type, is_verified, created_at, updated_at
      ) VALUES (
        'System Administrator', 
        'admin@club90s.com', 
        '+1234567890', 
        $1, 
        'admin', 
        'active', 
        'senior', 
        true, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      ) 
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email
    `, [adminPassword]);
    
    if (adminUser.rows.length > 0) {
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@club90s.com');
      console.log('🔑 Password: Admin123!@#');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Test database connection
    console.log('\n🔍 Testing database connection...');
    const testResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Database test successful - ${testResult.rows[0].count} users in database`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Database Information:');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Make sure PostgreSQL is installed and running');
      console.log('   - Check connection settings in .env file');
      console.log('   - Verify PostgreSQL service is started');
    }
    
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };