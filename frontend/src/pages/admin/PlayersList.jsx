import React, { useEffect, useState } from 'react'
import { usersAPI } from '../../utils/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Link } from 'react-router-dom'

const PlayersList = () => {
  const [players, setPlayers] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data } = await usersAPI.getAll({ limit: 200, role: 'member' })
      setPlayers(data.users || [])
    }
    load()
  }, [])

  const filtered = players.filter(p => (p.full_name || '').toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-display font-bold text-gradient-gold">Players</h1>
        <Card>
          <CardBody className="p-6">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search players" className="bg-dark-900 border border-gold-500/30 rounded px-3 py-2 w-full text-white mb-4" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(u => (
                <Link key={u.id} to={`/admin/players/${u.id}`} className="bg-dark-900 border border-gold-500/20 rounded p-3 hover:border-gold-500/50">
                  <div className="text-white font-semibold">{u.full_name}</div>
                  <div className="text-gray-400 text-sm">{u.email}</div>
                </Link>
              ))}
              {filtered.length === 0 && <div className="text-gray-500">No players found</div>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default PlayersList
