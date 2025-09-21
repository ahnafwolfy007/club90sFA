const express = require('express')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const { query } = require('../config/database')

const router = express.Router()

// Overall engagement: active users, matches played, avg participants, notices viewed
router.get('/engagement', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [users, matches, participants, notices] = await Promise.all([
      query(`SELECT COUNT(*)::int AS active_users FROM users WHERE status = 'active'`),
      query(`SELECT COUNT(*)::int AS matches FROM matches WHERE is_completed = true`),
      query(`SELECT AVG(c)::numeric(10,2) AS avg_participants FROM (
               SELECT COUNT(*) AS c FROM match_statistics GROUP BY match_id
             ) t`),
      query(`SELECT SUM(view_count)::int AS notice_views FROM notices`)
    ])

    res.json({ success: true, data: {
      active_users: users.rows[0].active_users || 0,
      matches_played: matches.rows[0].matches || 0,
      avg_participants: Number(participants.rows[0].avg_participants || 0),
      notice_views: notices.rows[0].notice_views || 0,
    }})
  } catch (e) {
    console.error('engagement error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Per player aggregated stats totals
router.get('/players/top', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const r = await query(`
      SELECT u.id, u.full_name,
             SUM(ms.goals)::int AS goals,
             SUM(ms.assists)::int AS assists,
             SUM(ms.saves)::int AS saves,
             SUM(CASE WHEN ms.clean_sheet THEN 1 ELSE 0 END)::int AS clean_sheets
      FROM users u
      JOIN match_statistics ms ON ms.user_id = u.id
      GROUP BY u.id
      ORDER BY goals DESC, assists DESC
      LIMIT 50
    `)
    res.json({ success: true, data: r.rows })
  } catch (e) {
    console.error('top players error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

// Player timeline by month for charts
router.get('/players/:id/timeline', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const r = await query(`
      SELECT to_char(m.match_date, 'YYYY-MM') AS ym,
             SUM(ms.goals)::int AS goals,
             SUM(ms.assists)::int AS assists,
             SUM(ms.saves)::int AS saves,
             SUM(CASE WHEN ms.clean_sheet THEN 1 ELSE 0 END)::int AS clean_sheets
      FROM match_statistics ms
      JOIN matches m ON m.id = ms.match_id
      WHERE ms.user_id = $1
      GROUP BY 1
      ORDER BY 1
    `, [req.params.id])
    res.json({ success: true, data: r.rows })
  } catch (e) {
    console.error('player timeline error', e)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

module.exports = router
