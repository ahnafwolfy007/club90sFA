// create-admin.js
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

const createAdminUser = async () => {
  try {
    console.log('🔨 Creating default admin user...');

    const adminEmail = 'admin@club90s.com';
    const adminPassword = 'Admin@90s2024';
    const adminFullName = 'Club 90s Administrator';
    const adminPhone = '+1234567890';
    const adminDateOfBirth = '1990-01-01';

    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const result = await pool.query(`
      INSERT INTO users (
        full_name, 
        email, 
        phone, 
        date_of_birth, 
        password_hash, 
        role, 
        status, 
        membership_type,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, full_name, email, role, status
    `, [
      adminFullName,
      adminEmail,
      adminPhone,
      adminDateOfBirth,
      hashedPassword,
      'admin',
      'active',
      'senior'
    ]);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 User ID:', result.rows[0].id);
    console.log('');
    console.log('🔐 IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    process.exit(0);
  }
};

// Run the function
createAdminUser();