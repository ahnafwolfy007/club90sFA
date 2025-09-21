const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query, transaction } = require('../config/database');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Simple disk storage (in real deploy, use S3/Cloud)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-profile${ext}`);
  },
});
const upload = multer({ storage });

// Get current player's profile + positions summary
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userSql = `
      SELECT id, full_name, email, phone, date_of_birth, address,
             emergency_contact, emergency_phone, status, role,
             membership_type, profile_image
      FROM users WHERE id = $1
    `;
    const userRes = await query(userSql, [req.user.id]);
    const user = userRes.rows[0];

    const posSql = `
      SELECT id, position, is_primary
      FROM player_positions
      WHERE user_id = $1
      ORDER BY is_primary DESC, created_at ASC
    `;
    const posRes = await query(posSql, [req.user.id]);

    res.json({ success: true, data: { user, positions: posRes.rows } });
  } catch (err) {
    console.error('players/me error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update current player's profile details
router.put(
  '/me',
  authenticateToken,
  [
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isLength({ min: 6 }).withMessage('Phone too short'),
    body('address').optional().isLength({ min: 3 }).withMessage('Address too short'),
    body('emergency_contact').optional().isLength({ min: 2 }).withMessage('Emergency contact too short'),
    body('emergency_phone').optional().isLength({ min: 6 }).withMessage('Emergency phone too short'),
    body('date_of_birth').optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, phone, address, emergency_contact, emergency_phone, date_of_birth } = req.body;

      // If email is provided and different, ensure uniqueness
      if (email) {
        const exists = await query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, req.user.id]);
        if (exists.rowCount > 0) {
          return res.status(409).json({ success: false, message: 'Email already in use' });
        }
      }

      const fields = [];
      const values = [];
      let idx = 1;

      function addField(col, val) {
        fields.push(`${col} = $${idx++}`);
        values.push(val);
      }

      if (email !== undefined) addField('email', email);
      if (phone !== undefined) addField('phone', phone);
      if (address !== undefined) addField('address', address);
      if (emergency_contact !== undefined) addField('emergency_contact', emergency_contact);
      if (emergency_phone !== undefined) addField('emergency_phone', emergency_phone);
      if (date_of_birth !== undefined) addField('date_of_birth', date_of_birth);

      if (fields.length === 0) {
        return res.json({ success: true, message: 'No changes' });
      }

      values.push(req.user.id);
      const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, full_name, email, phone, date_of_birth, address, emergency_contact, emergency_phone, profile_image, membership_type`;
      const result = await query(sql, values);
      return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      console.error('players/me update error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// Update positions (replace all for simplicity)
router.put('/me/positions', authenticateToken, async (req, res) => {
  const { positions = [] } = req.body; // [{position: 'ST', is_primary: true}, ...]
  try {
    await transaction(async (client) => {
      await client.query('DELETE FROM player_positions WHERE user_id = $1', [req.user.id]);
      for (const pos of positions) {
        await client.query(
          'INSERT INTO player_positions (user_id, position, is_primary) VALUES ($1, $2, $3)',
          [req.user.id, pos.position, !!pos.is_primary]
        );
      }
    });
    res.json({ success: true, message: 'Positions updated' });
  } catch (err) {
    console.error('update positions error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Upload profile image
router.post('/me/profile-image', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const relPath = `/uploads/${req.file.filename}`;
    const update = await query('UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING profile_image', [relPath, req.user.id]);
    res.json({ success: true, data: { profile_image: update.rows[0].profile_image } });
  } catch (err) {
    console.error('upload profile image error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
