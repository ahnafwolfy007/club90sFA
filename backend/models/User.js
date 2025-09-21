const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// User model with security best practices
class User {
  // Create a new user
  static async create(userData) {
    const {
      full_name,
      email,
      phone,
      date_of_birth,
      password,
      referral_name,
      membership_type = 'junior'
    } = userData;

    return await transaction(async (client) => {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await client.query(`
        INSERT INTO users (
          full_name, email, phone, password_hash, 
          referral_name, membership_type, role, date_of_birth
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, full_name, email, phone, referral_name, 
                  membership_type, role, status, is_verified, 
                  joined_date, created_at
      `, [
        full_name,
        email.toLowerCase(),
        phone,
        password_hash,
        referral_name,
        membership_type,
        'member', // Default role for new registrations
        date_of_birth || null
      ]);

      return result.rows[0];
    });
  }

  // Authenticate user
  static async authenticate(email, password) {
    const result = await query(`
      SELECT id, email, password_hash, full_name, role, status,
             is_verified, last_login
      FROM users 
      WHERE email = $1 AND deleted_at IS NULL
    `, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check user status (must be active)
    if (user.status !== 'active') {
      throw new Error('Account pending admin approval');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // (removed duplicate generateTokens)

  // Get user by ID
  static async findById(id) {
    const result = await query(`
      SELECT id, full_name, email, phone, referral_name, role, 
             membership_type, is_verified, status, 
             profile_image, date_of_birth, address, 
             emergency_contact, emergency_phone, joined_date, 
             last_login, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    return result.rows[0] || null;
  }

  // Get user by email
  static async findByEmail(email) {
    const result = await query(`
      SELECT id, full_name, email, phone, referral_name, role, 
             membership_type, is_verified, status, 
             profile_image, date_of_birth, address, 
             emergency_contact, emergency_phone, joined_date, 
             last_login, created_at, updated_at
      FROM users 
      WHERE email = $1
    `, [email.toLowerCase()]);

    return result.rows[0] || null;
  }

  // Update user profile
  static async updateProfile(id, updateData) {
    const allowedFields = [
      'full_name', 'phone', 'date_of_birth', 'address',
      'emergency_contact', 'emergency_phone', 'profile_image'
    ];

    const updates = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    const result = await query(`
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
  RETURNING id, full_name, email, phone, referral_name, role, 
        membership_type, is_verified, status, 
                profile_image, date_of_birth, address, 
                emergency_contact, emergency_phone, joined_date, 
                last_login, created_at, updated_at
    `, values);

    return result.rows[0];
  }

  // Change password
  static async changePassword(id, currentPassword, newPassword) {
    return await transaction(async (client) => {
      // Get current password hash
      const userResult = await client.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [id]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword, 
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, id]
      );

      return { success: true, message: 'Password updated successfully' };
    });
  }

  // Get pending users (for admin approval)
  static async getPendingUsers() {
    const result = await query(`
      SELECT id, full_name, email, phone, referral_name, 
             membership_type, status, joined_date, created_at
      FROM users 
      WHERE status = 'pending' 
      ORDER BY created_at ASC
    `);

    return result.rows;
  }

  // Approve user
  static async approveUser(id, approvedBy) {
    return await transaction(async (client) => {
      const result = await client.query(`
        UPDATE users 
        SET status = 'active', is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 
        RETURNING id, full_name, email, role, membership_type
      `, [id]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Log the approval
      await client.query(`
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        approvedBy,
        'USER_APPROVED',
        'users',
        id,
        JSON.stringify({ approved_by: approvedBy })
      ]);

      return result.rows[0];
    });
  }

  // Update user role
  static async updateRole(id, newRole, updatedBy) {
    const allowedRoles = [
      'member', 'mod', 'admin', 'head_of_operations', 
      'board_member', 'player_development'
    ];

    if (!allowedRoles.includes(newRole)) {
      throw new Error('Invalid role');
    }

    return await transaction(async (client) => {
      const result = await client.query(`
        UPDATE users 
        SET role = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING id, full_name, email, role, membership_type
      `, [newRole, id]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Log the role change
      await client.query(`
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        updatedBy,
        'ROLE_UPDATED',
        'users',
        id,
        JSON.stringify({ new_role: newRole, updated_by: updatedBy })
      ]);

      return result.rows[0];
    });
  }

  // Get all users with pagination
  static async getAll(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramCount = 1;

    // Apply filters
    if (filters.role) {
      whereClause += ` AND role = $${paramCount}`;
      queryParams.push(filters.role);
      paramCount++;
    }

    if (filters.membership_type) {
      whereClause += ` AND membership_type = $${paramCount}`;
      queryParams.push(filters.membership_type);
      paramCount++;
    }

    if (filters.status) {
      whereClause += ` AND status = $${paramCount}`;
      queryParams.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      whereClause += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      queryParams.push(`%${filters.search}%`);
      paramCount++;
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) FROM users ${whereClause}
    `, queryParams);

    const totalCount = parseInt(countResult.rows[0].count);

    // Get users
    queryParams.push(limit, offset);
    const result = await query(`
      SELECT id, full_name, email, phone, referral_name, role, 
             membership_type, is_verified, status, 
             profile_image, joined_date, last_login, created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `, queryParams);

    return {
      users: result.rows,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        per_page: limit
      }
    };
  }

  // Delete user (soft delete by deactivating)
  static async deactivate(id, deactivatedBy) {
    return await transaction(async (client) => {
      const result = await client.query(`
        UPDATE users 
        SET status = 'inactive', is_verified = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 
        RETURNING id, full_name, email
      `, [id]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Log the deactivation
      await client.query(`
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        deactivatedBy,
        'USER_DEACTIVATED',
        'users',
        id,
        JSON.stringify({ deactivated_by: deactivatedBy })
      ]);

      return result.rows[0];
    });
  }

  // Find user by email (including password for auth)
  static async findByEmailWithPassword(email) {
    try {
      const sql = `
        SELECT id, full_name, email, phone, password_hash, date_of_birth, 
               address, emergency_contact, emergency_phone, status, role, 
               membership_type, created_at, updated_at
        FROM users 
        WHERE email = $1 AND deleted_at IS NULL
      `;
      const result = await query(sql, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database error');
    }
  }

  // Find user by email (without password)
  static async findByEmail(email) {
    try {
      const sql = `
        SELECT id, full_name, email, phone, date_of_birth, address, 
               emergency_contact, emergency_phone, status, role, 
               membership_type, created_at, updated_at
        FROM users 
        WHERE email = $1 AND deleted_at IS NULL
      `;
      const result = await query(sql, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Database error');
    }
  }

  // Update user password
  static async updatePassword(userId, hashedPassword) {
    try {
      const sql = `
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id
      `;
      const result = await query(sql, [hashedPassword, userId]);
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Database error');
    }
  }

  // Generate JWT tokens
  static generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }
}

module.exports = User;