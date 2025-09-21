import React, { useEffect, useState } from 'react'
import { matchesAPI, usersAPI } from '../../utils/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'

const MatchesManager = () => {
  const [matches, setMatches] = useState([])
  const [form, setForm] = useState({ match_date: '', venue: 'Club Ground', notes: '' })
  const [users, setUsers] = useState([])

  const load = async () => {
    const [{ data: m }, { data: u }] = await Promise.all([
      matchesAPI.getAll({ limit: 50 }), usersAPI.getAll()
    ])
    setMatches(m.data)
    setUsers((u.data && u.data.users) ? u.data.users : [])
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.match_date) return
    await matchesAPI.create(form)
    setForm({ match_date: '', venue: 'Club Ground' })
    await load()
  }

  const setMVP = async (matchId, userId) => {
    await matchesAPI.setMVP(matchId, userId)
    await load()
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-gradient-gold">Match Management</h1>
          <Button as={Link} to="/admin/players" variant="outline">View Players</Button>
        </div>

        <Card>
          <CardBody className="p-6">
            <div className="grid md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Match Date & Time</label>
                <input type="datetime-local" value={form.match_date} onChange={e => setForm(f => ({ ...f, match_date: e.target.value }))} className="bg-dark-900 border border-gold-500/30 rounded px-3 py-2 w-full text-white" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Venue</label>
                <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} className="bg-dark-900 border border-gold-500/30 rounded px-3 py-2 w-full text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-1">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-dark-900 border border-gold-500/30 rounded px-3 py-2 w-full text-white" placeholder="Any extra details (duration, kit color, fee, etc.)" />
              </div>
              <div>
                <Button onClick={create} variant="primary">Create Matchday</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid gap-4">
          {matches.map(m => (
            <Card key={m.id}>
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{new Date(m.match_date).toLocaleString()} • {m.venue || 'TBD'}</div>
                    <div className="text-gray-400 text-sm">Score: {m.home_score}-{m.away_score} • Participants: {m.participants}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select onChange={(e) => setMVP(m.id, e.target.value)} defaultValue="" className="bg-dark-900 text-gray-200 border border-gold-500/30 rounded px-2 py-1">
                      <option value="" disabled>{m.mvp_id ? 'Change MVP' : 'Set MVP'}</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                    <Button variant="outline" onClick={async () => {
                      const r = await matchesAPI.getById(m.id)
                      const sides = r.data.data.sides
                      const g = (sides.green || []).map(x => `🟢 ${x.full_name} — G${x.goals}/A${x.assists}${x.clean_sheet ? ' • CS' : ''}`)
                      const o = (sides.orange || []).map(x => `🟠 ${x.full_name} — G${x.goals}/A${x.assists}${x.clean_sheet ? ' • CS' : ''}`)
                      alert([`Team Green:\n${g.join('\n')}`, `Team Orange:\n${o.join('\n')}`].join('\n\n') || 'No stats')
                    }}>View Sides</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MatchesManager
