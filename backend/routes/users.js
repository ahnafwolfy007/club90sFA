const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Player history (admin): per match stats + availability votes
router.get('/:id/history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { query } = require('../config/database');
    const history = await query(`
      SELECT m.id AS match_id,
             m.match_date,
             m.venue,
             m.is_completed,
             m.home_score,
             m.away_score,
             ms.goals,
             ms.assists,
             ms.saves,
             ms.clean_sheet,
             ma.status AS vote_status,
             (m.match_date - interval '48 hours') AS poll_close_at
      FROM matches m
      LEFT JOIN match_statistics ms ON ms.match_id = m.id AND ms.user_id = $1
      LEFT JOIN match_availability ma ON ma.match_id = m.id AND ma.user_id = $1
      ORDER BY m.match_date DESC
      LIMIT 200
    `, [userId]);
    res.json({ success: true, data: history.rows || [] });
  } catch (err) {
    console.error('get user history error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// List users (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, role, status, membership_type, search } = req.query;
    const filters = {};
    if (role) filters.role = role;
    if (status) filters.status = status;
    if (membership_type) filters.membership_type = membership_type;
    if (search) filters.search = search;

    const result = await User.getAll(parseInt(page, 10), parseInt(limit, 10), filters);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('list users error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get pending users for approval
router.get('/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.getPendingUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('get pending users error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Approve a user
router.patch('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.approveUser(req.params.id, req.user.id);
    res.json({ success: true, message: 'User approved', data: user });
  } catch (err) {
    console.error('approve user error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to approve user' });
  }
});

// Update a user's role
router.patch('/:id/role', authenticateToken, requireAdmin, [
  body('role').isString().isLength({ min: 3, max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  try {
    const { role } = req.body;
    const user = await User.updateRole(req.params.id, role, req.user.id);
    res.json({ success: true, message: 'Role updated', data: user });
  } catch (err) {
    console.error('update role error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to update role' });
  }
});

// Deactivate a user
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.deactivate(req.params.id, req.user.id);
    res.json({ success: true, message: 'User deactivated', data: user });
  } catch (err) {
    console.error('deactivate user error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to deactivate user' });
  }
});

// Get a single user by id
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('get user error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
