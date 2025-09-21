import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api, { playersAPI } from '../../utils/api'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { PageTransition } from '../../components/animations/PageTransition'
import toast from 'react-hot-toast'

const PositionEditor = ({ initialPositions = [], onSave, onClose }) => {
  const [positions, setPositions] = useState(initialPositions)
  const [newPos, setNewPos] = useState('')
  const addPos = () => {
    if (!newPos.trim()) return
    setPositions(prev => [...prev, { position: newPos.trim(), is_primary: prev.length === 0 }])
    setNewPos('')
  }
  const togglePrimary = (idx) => {
    setPositions(prev => prev.map((p, i) => ({ ...p, is_primary: i === idx })))
  }
  const remove = (idx) => setPositions(prev => prev.filter((_, i) => i !== idx))
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-card p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">Edit Preferred Positions</h3>
        <div className="flex gap-2 mb-3">
          <input className="flex-1 bg-dark-800 text-white px-3 py-2 rounded" placeholder="e.g., ST, GK, CM" value={newPos} onChange={(e) => setNewPos(e.target.value)} />
          <Button onClick={addPos} variant="primary">Add</Button>
        </div>
        <ul className="space-y-2 max-h-64 overflow-auto">
          {positions.map((p, idx) => (
            <li key={idx} className="flex items-center justify-between bg-dark-800 px-3 py-2 rounded">
              <div className="text-white">{p.position}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300 flex items-center gap-1">
                  <input type="radio" name="primary" checked={!!p.is_primary} onChange={() => togglePrimary(idx)} /> Primary
                </label>
                <Button variant="outline" size="sm" onClick={() => remove(idx)}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(positions)}>Save</Button>
        </div>
      </div>
    </div>
  )
}

const ProfileEditor = ({ initialProfile, onSave, onClose }) => {
  const [form, setForm] = useState({
    email: initialProfile?.email || '',
    phone: initialProfile?.phone || '',
    address: initialProfile?.address || '',
    emergency_contact: initialProfile?.emergency_contact || '',
    emergency_phone: initialProfile?.emergency_phone || '',
    date_of_birth: initialProfile?.date_of_birth ? initialProfile.date_of_birth.substring(0,10) : ''
  })
  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = () => onSave(form)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-card p-6 rounded-lg w-full max-w-lg">
        <h3 className="text-xl font-bold text-white mb-4">Edit Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input name="email" value={form.email} onChange={change} className="w-full bg-dark-800 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Phone</label>
            <input name="phone" value={form.phone} onChange={change} className="w-full bg-dark-800 text-white px-3 py-2 rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400">Address</label>
            <input name="address" value={form.address} onChange={change} className="w-full bg-dark-800 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Emergency Contact</label>
            <input name="emergency_contact" value={form.emergency_contact} onChange={change} className="w-full bg-dark-800 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Emergency Phone</label>
            <input name="emergency_phone" value={form.emergency_phone} onChange={change} className="w-full bg-dark-800 text-white px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Date of Birth</label>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={change} className="w-full bg-dark-800 text-white px-3 py-2 rounded" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Save</Button>
        </div>
      </div>
    </div>
  )
}

export const PlayerDashboard = () => {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [positions, setPositions] = useState([])
  const [editingPositions, setEditingPositions] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [notices, setNotices] = useState([])
  const [prevMatches, setPrevMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const avatarUrl = useMemo(() => profile?.profile_image || (process.env.PUBLIC_URL + '/favicon.svg'), [profile])

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: me }, { data: noticesRes }, { data: prev }, { data: upc }, { data: tour } ] = await Promise.all([
          api.get('/players/me'),
          api.get('/dashboard/notices'),
          api.get('/dashboard/matches/previous'),
          api.get('/dashboard/matches/upcoming'),
          api.get('/dashboard/tournaments/upcoming')
        ])
        setProfile(me.data.user)
        setPositions(me.data.positions)
        setNotices(noticesRes.data)
        setPrevMatches(prev.data)
        setUpcomingMatches(upc.data)
        setUpcomingTournaments(tour.data)
      } catch (err) {
        toast.error('Failed to load dashboard')
      }
    }
    load()
  }, [])

  const savePositions = async (newPositions) => {
    try {
      await api.put('/players/me/positions', { positions: newPositions })
      setPositions(newPositions)
      setEditingPositions(false)
      toast.success('Positions updated')
    } catch (err) {
      toast.error('Failed to update positions')
    }
  }

  const saveProfile = async (form) => {
    try {
      const { data } = await playersAPI.updateMe(form)
      setProfile(prev => ({ ...prev, ...data.data }))
      setEditingProfile(false)
      toast.success('Profile updated')
    } catch (err) {
      // error handled globally; still show toast if needed
      toast.error('Failed to update profile')
    }
  }

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await api.post('/players/me/profile-image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfile(p => ({ ...p, profile_image: res.data.data.profile_image }))
      toast.success('Profile image updated')
    } catch (err) {
      toast.error('Failed to upload image')
    }
  }

  const voteMatch = async (id, status) => {
    try {
      await api.post(`/dashboard/matches/${id}/vote`, { status })
      toast.success('Vote submitted')
    } catch (err) {
      toast.error('Failed to submit vote')
    }
  }

  const voteTournament = async (id, status) => {
    try {
      await api.post(`/dashboard/tournaments/${id}/vote`, { status })
      toast.success('Vote submitted')
    } catch (err) {
      toast.error('Failed to submit vote')
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark-gradient">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold text-gradient-gold">Player Dashboard</h1>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
          {/* Admin Tools (visible only to admin/head_of_operations) */}
          {user && (user.role === 'admin' || user.role === 'head_of_operations') && (
            <div className="bg-dark-900 border border-gold-500/20 rounded p-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-gray-300 mr-2">Admin Tools:</span>
                <Button as={Link} to="/admin" variant="outline" size="sm">Admin Panel</Button>
                <Button as={Link} to="/admin/engagement" variant="outline" size="sm">Engagement</Button>
                <Button as={Link} to="/admin/matches" variant="outline" size="sm">Manage Matches</Button>
                <Button as={Link} to="/admin/players" variant="outline" size="sm">View Players</Button>
              </div>
            </div>
          )}
          {/* Profile Card */}
          <Card>
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <img src={avatarUrl} alt="avatar" className="w-28 h-28 rounded-full object-cover border border-gold-500" />
                  <label className="absolute bottom-0 right-0 bg-gold-500 text-dark-900 px-2 py-1 rounded cursor-pointer text-xs">Change
                    <input type="file" className="hidden" accept="image/*" onChange={onAvatarChange} />
                  </label>
                </div>
                <div className="flex-1 w-full">
                  <h2 className="text-2xl font-bold text-white">{profile?.full_name}</h2>
                  <p className="text-gray-400">{profile?.email} • {profile?.membership_type}</p>
                  <div className="mt-3">
                    <p className="text-gray-300 text-sm">Preferred positions:</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {positions.map((p, i) => (
                        <span key={i} className={`px-3 py-1 rounded-full text-sm ${p.is_primary ? 'bg-gold-500 text-dark-900' : 'bg-dark-800 text-gray-200'}`}>{p.position}</span>
                      ))}
                      {positions.length === 0 && <span className="text-gray-500">No positions yet</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => setEditingProfile(true)}>Edit Profile</Button>
                  <Button variant="outline" onClick={() => setEditingPositions(true)}>Edit Positions</Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notices */}
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Club Notices</h3>
                <ul className="space-y-3 max-h-80 overflow-auto">
                  {notices.map(n => (
                    <li key={n.id} className="bg-dark-800 p-3 rounded">
                      <div className="text-white font-semibold">{n.title}</div>
                      <div className="text-gray-400 text-sm line-clamp-3">{n.content}</div>
                    </li>
                  ))}
                  {notices.length === 0 && <li className="text-gray-500">No notices</li>}
                </ul>
              </CardBody>
            </Card>

            {/* Recent Results */}
            <Card className="lg:col-span-1">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Previous Results</h3>
                <ul className="space-y-3 max-h-80 overflow-auto">
                  {prevMatches.map(m => (
                    <li key={m.id} className="bg-dark-800 p-3 rounded text-gray-200">
                      <div className="text-white">{new Date(m.match_date).toLocaleString()}</div>
                      <div className="text-sm">Score: {m.home_score} - {m.away_score} ({m.result || 'N/A'})</div>
                    </li>
                  ))}
                  {prevMatches.length === 0 && <li className="text-gray-500">No recent results</li>}
                </ul>
              </CardBody>
            </Card>

            {/* Upcoming + Voting */}
            <Card className="lg:col-span-1">
              <CardBody className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Upcoming</h3>
                <div className="space-y-4 max-h-80 overflow-auto">
                  {upcomingMatches.map(m => {
                    const closed = m.poll_close_at && new Date(m.poll_close_at).getTime() <= Date.now()
                    return (
                      <div key={m.id} className="bg-dark-800 p-3 rounded text-gray-200">
                        <div className="text-white">Match • {new Date(m.match_date).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Poll closes: {m.poll_close_at ? new Date(m.poll_close_at).toLocaleString() : '—'}</div>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="primary" disabled={closed} onClick={() => voteMatch(m.id, 'in')}>Vote In</Button>
                          <Button size="sm" variant="outline" disabled={closed} onClick={() => voteMatch(m.id, 'maybe')}>Maybe</Button>
                          <Button size="sm" variant="outline" disabled={closed} onClick={() => voteMatch(m.id, 'out')}>Out</Button>
                        </div>
                        {closed && <div className="text-xs text-rose-400 mt-1">Voting closed</div>}
                      </div>
                    )
                  })}
                  {upcomingTournaments.map(t => (
                    <div key={t.id} className="bg-dark-800 p-3 rounded text-gray-200">
                      <div className="text-white">Tournament • {t.name} ({new Date(t.start_date).toLocaleDateString()})</div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="primary" onClick={() => voteTournament(t.id, 'in')}>Vote In</Button>
                        <Button size="sm" variant="outline" onClick={() => voteTournament(t.id, 'maybe')}>Maybe</Button>
                        <Button size="sm" variant="outline" onClick={() => voteTournament(t.id, 'out')}>Out</Button>
                      </div>
                    </div>
                  ))}
                  {upcomingMatches.length === 0 && upcomingTournaments.length === 0 && (
                    <div className="text-gray-500">No upcoming events</div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {editingPositions && (
          <PositionEditor
            initialPositions={positions}
            onClose={() => setEditingPositions(false)}
            onSave={savePositions}
          />
        )}

        {editingProfile && (
          <ProfileEditor
            initialProfile={profile}
            onClose={() => setEditingProfile(false)}
            onSave={saveProfile}
          />
        )}
      </div>
    </PageTransition>
  )
}

export default PlayerDashboard
