import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { analyticsAPI, usersAPI } from '../../utils/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const PlayerProfile = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [history, setHistory] = useState([])

  useEffect(() => {
    const load = async () => {
      const [{ data: u }, { data: t }, { data: h }] = await Promise.all([
        usersAPI.getById(id), analyticsAPI.getPlayerTimeline(id), usersAPI.getHistory(id)
      ])
      setUser(u.data)
      setTimeline(t.data)
      setHistory(Array.isArray(h.data) ? h.data : (h.data?.rows || []))
    }
    load()
  }, [id])

  const labels = timeline.map(x => x.ym)
  const lineData = {
    labels,
    datasets: [
      { label: 'Goals', data: timeline.map(x => x.goals), borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.2)' },
      { label: 'Assists', data: timeline.map(x => x.assists), borderColor: '#6b7280', backgroundColor: 'rgba(107,114,128,0.2)' },
      { label: 'Saves', data: timeline.map(x => x.saves), borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.2)' },
      { label: 'Clean Sheets', data: timeline.map(x => x.clean_sheets), borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.2)' },
    ]
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {user && (
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient-gold">{user.full_name}</h1>
            <div className="text-gray-400">{user.email} • {user.membership_type}</div>
          </div>
        )}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-xl text-white font-bold mb-4">Performance Timeline</h2>
            <div className="min-w-[600px]">
              <Line data={lineData} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <h2 className="text-xl text-white font-bold mb-4">Match History & Votes</h2>
            <div className="space-y-2 max-h-[480px] overflow-auto">
              {history.map(m => (
                <div key={m.match_id} className="bg-dark-900 border border-gold-500/20 rounded p-3 text-gray-200">
                  <div className="text-white">{new Date(m.match_date).toLocaleString()} • {m.venue || 'TBD'}</div>
                  <div className="text-sm">Vote: {m.vote_status || '—'} • Score: {m.home_score ?? '-'} - {m.away_score ?? '-'}</div>
                  <div className="text-sm">Stats: G{m.goals ?? 0} A{m.assists ?? 0} S{m.saves ?? 0} {m.clean_sheet ? '• CS' : ''}</div>
                </div>
              ))}
              {history.length === 0 && <div className="text-gray-500">No history</div>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default PlayerProfile
