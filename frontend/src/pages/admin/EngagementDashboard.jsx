import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../utils/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const EngagementDashboard = () => {
  const [eng, setEng] = useState(null)
  const [tops, setTops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: e }, { data: t }] = await Promise.all([
          analyticsAPI.getEngagement(), analyticsAPI.getTopPlayers()
        ])
        setEng(e.data)
        setTops(t.data)
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const barData = {
    labels: tops.map(x => x.full_name),
    datasets: [
      { label: 'Goals', data: tops.map(x => x.goals), backgroundColor: '#d4af37' },
      { label: 'Assists', data: tops.map(x => x.assists), backgroundColor: '#6b7280' },
    ]
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-display font-bold text-gradient-gold">Club Engagement</h1>
        {loading && <div className="text-gray-400">Loading…</div>}
        {eng && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card><CardBody className="p-4"><div className="text-gray-400">Active Members</div><div className="text-3xl font-bold">{eng.active_users}</div></CardBody></Card>
            <Card><CardBody className="p-4"><div className="text-gray-400">Matches Played</div><div className="text-3xl font-bold">{eng.matches_played}</div></CardBody></Card>
            <Card><CardBody className="p-4"><div className="text-gray-400">Avg Participants</div><div className="text-3xl font-bold">{eng.avg_participants}</div></CardBody></Card>
            <Card><CardBody className="p-4"><div className="text-gray-400">Notice Views</div><div className="text-3xl font-bold">{eng.notice_views}</div></CardBody></Card>
          </div>
        )}

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4 gap-2">
              <h2 className="text-xl text-white font-bold">Top Players</h2>
              <div className="flex gap-2">
                <Button as={Link} to="/admin/players" variant="outline">View Players</Button>
                <Button as={Link} to="/admin/matches" variant="primary">Manage Matches</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tops.map(p => (
                <Link key={p.id} to={`/admin/players/${p.id}`} className="bg-dark-900 border border-gold-500/20 rounded p-3 hover:border-gold-500/50">
                  <div className="text-white font-semibold">{p.full_name}</div>
                  <div className="text-gray-400 text-sm">G {p.goals} • A {p.assists} • CS {p.clean_sheets}</div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default EngagementDashboard
