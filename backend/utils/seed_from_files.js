const fs = require('fs')
const path = require('path')
const { pool } = require('../config/database')

const PLAYER_CSV = path.join(__dirname, '..', '..', 'playerlist.csv')
const ROLES_TXT = path.join(__dirname, '..', '..', 'roles.txt')

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  const headers = lines.shift().split(',').map(h => h.trim())
  return lines.map(line => {
    const cols = line.split(',').map(c => c.trim())
    const obj = {}
    headers.forEach((h, i) => obj[h] = cols[i])
    return obj
  })
}

function usernameFromName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20) || 'player'
}

function emailFor(name) {
  const base = usernameFromName(name)
  return `${base}@gmail.com`
}

function passFor(name) {
  const base = usernameFromName(name)
  return `${base}@321`
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function* dateRange(start, end, stepDays = 7) {
  const d = new Date(start)
  const endDate = new Date(end)
  while (d <= endDate) {
    yield new Date(d)
    d.setDate(d.getDate() + stepDays)
  }
}

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const csvText = fs.readFileSync(PLAYER_CSV, 'utf8')
    const rolesText = fs.readFileSync(ROLES_TXT, 'utf8')
    const players = parseCSV(csvText)

    // Map special roles from roles.txt
    const roleMap = {}
    rolesText.split(/\r?\n/).forEach(line => {
      const match = line.match(/:(.*)$/)
      if (match) {
        const mentions = match[1].match(/@([^\s]+)/g)
        if (mentions) {
          mentions.forEach(m => roleMap[m.replace('@','').toLowerCase()] = true)
        }
      }
    })

    console.log(`Seeding ${players.length} users…`)
    const userIds = []
    for (const p of players) {
      const full_name = p['Player Name']
      const email = emailFor(full_name)
      const phone = '0000000000'
      const date_of_birth = '1995-01-01'
      const membership_type = (p.Type || 'Senior').toLowerCase() === 'junior' ? 'junior' : 'senior'
      const basePrice = parseInt(p['Base Price'] || '80', 10)
      // elevated role for ops heads mentioned in roles.txt
      const key = usernameFromName(full_name)
      const role = roleMap[key] ? 'head_of_operations' : 'member'
      const password = passFor(full_name)

      // Create with active status
      const bcrypt = require('bcryptjs')
      const password_hash = await bcrypt.hash(password, 10)
      const ins = await client.query(`
        INSERT INTO users (full_name, email, phone, password_hash, status, role, membership_type, referral_name, is_verified, joined_date)
        VALUES ($1,$2,$3,$4,'active',$5,$6,$7,true,CURRENT_DATE)
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id
      `, [full_name, email, phone, password_hash, role, membership_type, 'seeded'])
      userIds.push({ id: ins.rows[0].id, name: full_name, basePrice, position: p.Position })
    }

    // Create a default team for matches
  const team1 = await client.query(`INSERT INTO teams (name, description) VALUES ('Team Green', 'Auto-seeded green side') RETURNING id`)
  const team2 = await client.query(`INSERT INTO teams (name, description) VALUES ('Team Orange', 'Auto-seeded orange side') RETURNING id`)
  const teamA = team1.rows[0].id
  const teamB = team2.rows[0].id

    // Add members to team A
    for (let i = 0; i < userIds.length; i++) {
      const u = userIds[i]
      await client.query(`INSERT INTO team_members (team_id, user_id, jersey_number) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [teamA, u.id, (i + 1)])
    }

    // Tournaments
    console.log('Seeding tournaments…')
    const tournaments = [
      { name: 'Winter Classic 2024', start: '2024-12-10', end: '2024-12-20' },
      { name: 'Spring Cup 2025', start: '2025-03-15', end: '2025-03-28' },
      { name: 'Summer Invitational 2025', start: '2025-06-10', end: '2025-06-25' },
    ]
    const tournamentIds = []
    for (const t of tournaments) {
      const res = await client.query(`
        INSERT INTO tournaments (name, start_date, end_date, status, location, prize_money, entry_fee, description)
        VALUES ($1,$2,$3,'completed','Home Ground',1000,100,'Seeded tournament') RETURNING id
      `, [t.name, t.start, t.end])
      tournamentIds.push(res.rows[0].id)
    }

  // Matches each 7 days between Nov 10 2024 and Sep 20 2025 (completed history)
    console.log('Seeding matches and statistics…')
    const start = new Date('2024-11-10T15:00:00Z')
    const end = new Date('2025-09-20T15:00:00Z')
    for (const d of dateRange(start, end, 7)) {
  const home_score = Math.floor(Math.random() * 5)
  const away_score = Math.floor(Math.random() * 5)
      const result = home_score === away_score ? 'draw' : (home_score > away_score ? 'win' : 'loss')
      const mvpu = pick(userIds)
      const matchRes = await client.query(`
        INSERT INTO matches (home_team_id, away_team_id, match_date, venue, home_score, away_score, result, is_completed, mvp_id)
        VALUES ($1,$2,$3,'Club Ground',$4,$5,$6,true,$7) RETURNING id
      `, [teamA, teamB, d.toISOString(), home_score, away_score, result, mvpu.id])
      const matchId = matchRes.rows[0].id

      // Generate stats: weight by base price to distribute contributions
      const participants = [...userIds].sort(() => 0.5 - Math.random()).slice(0, Math.min(22, userIds.length))
      // split sides
      const sideA = participants.slice(0, Math.ceil(participants.length / 2))
      const sideB = participants.slice(Math.ceil(participants.length / 2))
      for (const p of participants) {
        const isGK = /goalkeeper/i.test(p.position || '')
        const minutes = 60 + Math.floor(Math.random() * 40)
        let goals = 0, assists = 0, saves = 0, clean_sheet = false
        const weight = Math.max(1, Math.round(p.basePrice / 40)) // 1..4
        if (!isGK) {
          goals = Math.max(0, Math.round((Math.random() * 2 - 0.3) * weight))
          assists = Math.max(0, Math.round((Math.random() * 2 - 0.5) * weight))
        } else {
          saves = Math.max(0, Math.round(Math.random() * 6 * weight / 2))
          // clean sheet depends on side
          const onA = sideA.includes(p)
          clean_sheet = onA ? (away_score === 0) : (home_score === 0)
        }
        const team_id = sideA.includes(p) ? teamA : teamB
        await client.query(`
          INSERT INTO match_statistics (match_id, user_id, team_id, goals, assists, minutes_played, saves, clean_sheet, mvp_votes, position_played)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `, [matchId, p.id, team_id, goals, assists, minutes, saves, clean_sheet, p.id === mvpu.id ? 5 : Math.floor(Math.random() * 3), p.position || null])
      }
    }

    // Create upcoming matches for voting (next 6 weeks)
    console.log('Seeding upcoming matchdays…')
    const venues = ['Club Ground', 'City Sports Arena', 'Riverside Park', 'North Turf', 'East Field']
    const now = new Date()
    for (let i = 1; i <= 6; i++) {
      const date = new Date(now)
      date.setDate(now.getDate() + i * 7)
      await client.query(`
        INSERT INTO matches (home_team_id, away_team_id, match_date, venue, is_completed)
        VALUES ($1,$2,$3,$4,false)
        ON CONFLICT DO NOTHING
      `, [teamA, teamB, date.toISOString(), pick(venues)])
    }

    await client.query('COMMIT')
    console.log('✅ Seeding complete')
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  } finally {
    pool.end()
  }
}

seed()
