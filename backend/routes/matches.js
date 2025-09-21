const express = require('express')
const { body, validationResult } = require('express-validator')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const { query } = require('../config/database')

const router = express.Router()

// List matches with optional date filters
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { start, end, limit = 100, offset = 0 } = req.query
    const params = []
    let where = 'WHERE 1=1'
    if (start) { params.push(start); where += ` AND match_date >= $${params.length}` }
    if (end) { params.push(end); where += ` AND match_date <= $${params.length}` }
    params.push(limit, offset)
    const sql = `
      SELECT m.*, COALESCE(ms.count_stats,0) AS participants,
             (m.match_date - interval '48 hours') AS poll_close_at
      FROM matches m
      LEFT JOIN (
        SELECT match_id, COUNT(*) AS count_stats FROM match_statistics GROUP BY match_id
      ) ms ON ms.match_id = m.id
      ${where}
      ORDER BY match_date DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `
    const result = await query(sql, params)
    res.json({ success: true, data: result.rows })
  } catch (e) {
    console.error('list matches error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Create match
router.post('/', authenticateToken, requireAdmin, [
  body('match_date').notEmpty(),
  body('home_team_id').optional(),
  body('away_team_id').optional(),
  body('venue').optional(),
  body('notes').optional().isString().isLength({ max: 1000 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
  try {
    const { home_team_id, away_team_id, match_date, venue, notes } = req.body
    const result = await query(`
      INSERT INTO matches (home_team_id, away_team_id, match_date, venue, notes)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [home_team_id || null, away_team_id || null, match_date, venue || null, notes || null])
    res.status(201).json({ success: true, data: { ...result.rows[0], poll_close_at: new Date(new Date(match_date).getTime() - 48*60*60*1000) } })
  } catch (e) {
    console.error('create match error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Get match by id
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const m = await query("SELECT *, (match_date - interval '48 hours') AS poll_close_at FROM matches WHERE id = $1", [req.params.id])
    if (m.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' })
    const stats = await query(`
      SELECT ms.*, u.full_name, t.name AS team_name
      FROM match_statistics ms
      LEFT JOIN users u ON u.id = ms.user_id
      LEFT JOIN teams t ON t.id = ms.team_id
      WHERE ms.match_id = $1
      ORDER BY goals DESC, assists DESC
    `, [req.params.id])
    // group by team
    const green = stats.rows.filter(r => /green/i.test(r.team_name || ''))
    const orange = stats.rows.filter(r => /orange/i.test(r.team_name || ''))
    res.json({ success: true, data: { match: m.rows[0], statistics: stats.rows, sides: { green, orange } } })
  } catch (e) {
    console.error('get match error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Update match
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const fields = ['home_team_id','away_team_id','match_date','venue','home_score','away_score','result','is_completed','notes']
    const updates = []
    const values = []
    let i = 1
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = $${i++}`); values.push(req.body[f]) }
    }
    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No updates' })
    values.push(req.params.id)
    const sql = `UPDATE matches SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`
    const r = await query(sql, values)
    res.json({ success: true, data: r.rows[0] })
  } catch (e) {
    console.error('update match error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Delete match
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await query('DELETE FROM matches WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (e) {
    console.error('delete match error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Set MVP
router.post('/:id/mvp', authenticateToken, requireAdmin, [ body('user_id').notEmpty() ], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
  try {
    const r = await query('UPDATE matches SET mvp_id = $1 WHERE id = $2 RETURNING *', [req.body.user_id, req.params.id])
    res.json({ success: true, data: r.rows[0] })
  } catch (e) {
    console.error('set mvp error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Upsert statistics (scorers/assists/clean sheets)
router.post('/:id/statistics', authenticateToken, requireAdmin, [
  body('entries').isArray({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() })
  try {
    const matchId = req.params.id
    for (const e of req.body.entries) {
      const { user_id, goals = 0, assists = 0, saves = 0, clean_sheet = false, minutes_played = 90, position_played = null } = e
      await query(`
        INSERT INTO match_statistics (match_id, user_id, goals, assists, saves, clean_sheet, minutes_played, position_played)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (id) DO NOTHING
      `, [matchId, user_id, goals, assists, saves, clean_sheet, minutes_played, position_played])
    }
    res.json({ success: true })
  } catch (e) {
    console.error('upsert stats error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Availability summary for a match
router.get('/:id/votes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const counts = await query(`
      SELECT status, COUNT(*) FROM match_availability WHERE match_id = $1 GROUP BY status
    `, [req.params.id])
    res.json({ success: true, data: counts.rows })
  } catch (e) {
    console.error('votes error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

module.exports = router
