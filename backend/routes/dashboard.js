const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

// List notices (latest)
router.get('/notices', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT id, title, content, is_urgent, publish_date
      FROM notices
      WHERE is_published = TRUE
      ORDER BY publish_date DESC
      LIMIT 20
    `;
    const result = await query(sql);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('dashboard/notices error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Previous match results (last 10 completed)
router.get('/matches/previous', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT id, match_date, venue, home_score, away_score, result
      FROM matches
      WHERE is_completed = TRUE
      ORDER BY match_date DESC
      LIMIT 10
    `;
    const result = await query(sql);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('dashboard/matches/previous error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Upcoming matches (next 10)
router.get('/matches/upcoming', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT m.id, m.match_date, m.venue, m.home_score, m.away_score,
             (m.match_date - interval '48 hours') AS poll_close_at,
             ma.status AS my_vote
      FROM matches m
      LEFT JOIN match_availability ma
        ON ma.match_id = m.id AND ma.user_id = $1
      WHERE m.is_completed = FALSE AND m.match_date >= NOW()
      ORDER BY m.match_date ASC
      LIMIT 10
    `;
    const result = await query(sql, [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('dashboard/matches/upcoming error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Upcoming tournaments (next 10)
router.get('/tournaments/upcoming', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT id, name, start_date, end_date, location, status
      FROM tournaments
      WHERE status IN ('upcoming', 'ongoing')
      ORDER BY start_date ASC
      LIMIT 10
    `;
    const result = await query(sql);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('dashboard/tournaments/upcoming error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Vote availability for a match
router.post('/matches/:id/vote', authenticateToken, async (req, res) => {
  const { status, note } = req.body; // 'in' | 'out' | 'maybe'
  const matchId = req.params.id;
  try {
    // Enforce poll closes 48 hours before match day
    const m = await query('SELECT match_date FROM matches WHERE id = $1', [matchId]);
    if (m.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    const matchDate = new Date(m.rows[0].match_date);
    const now = new Date();
    const msUntilMatch = matchDate.getTime() - now.getTime();
    const fortyEightHours = 48 * 60 * 60 * 1000;
    if (msUntilMatch <= fortyEightHours) {
      return res.status(403).json({ success: false, message: 'Voting closed 48 hours before match' });
    }

    const sql = `
      INSERT INTO match_availability (match_id, user_id, status, note)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, match_id) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, updated_at = CURRENT_TIMESTAMP
      RETURNING id, status, note
    `;
    const result = await query(sql, [matchId, req.user.id, status, note || null]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('vote match error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Vote availability for a tournament
router.post('/tournaments/:id/vote', authenticateToken, async (req, res) => {
  const { status, note } = req.body; // 'in' | 'out' | 'maybe'
  const tournamentId = req.params.id;
  try {
    const sql = `
      INSERT INTO tournament_availability (tournament_id, user_id, status, note)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, tournament_id) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, updated_at = CURRENT_TIMESTAMP
      RETURNING id, status, note
    `;
    const result = await query(sql, [tournamentId, req.user.id, status, note || null]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('vote tournament error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
