import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usersAPI } from '../../utils/api'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import toast from 'react-hot-toast'

const roleOptions = [
  { value: 'member', label: 'Member' },
  { value: 'mod', label: 'Moderator' },
  { value: 'player_development', label: 'Player Development' },
  { value: 'head_of_operations', label: 'Head of Operations' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'admin', label: 'Admin' },
]

const PendingList = ({ refreshKey }) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await usersAPI.getPending()
      setItems(data.data || [])
    } catch (e) {
      toast.error('Failed to load pending members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshKey])

  const approve = async (id) => {
    try {
      await usersAPI.approve(id)
      toast.success('Member approved')
      load()
    } catch (e) {
      toast.error('Approval failed')
    }
  }

  return (
    <div>
      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">No pending members</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-gold-500/20">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Membership</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} className="border-b border-dark-800">
                  <td className="py-2 pr-4 text-white">{u.full_name}</td>
                  <td className="py-2 pr-4 text-gray-300">{u.email}</td>
                  <td className="py-2 pr-4 text-gray-300 capitalize">{u.membership_type}</td>
                  <td className="py-2 pr-4">
                    <Button size="sm" variant="primary" onClick={() => approve(u.id)}>Approve</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const ManageUsers = () => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])

  const load = async () => {
    setLoading(true)
    try {
  const { data } = await usersAPI.getAll()
  setItems((data.data && data.data.users) ? data.data.users : [])
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateRole = async (id, role) => {
    try {
      await usersAPI.updateRole(id, role)
      toast.success('Role updated')
      setItems(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    } catch (e) {
      toast.error('Failed to update role')
    }
  }

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return
    try {
      await usersAPI.deactivate(id)
      toast.success('User deactivated')
      load()
    } catch (e) {
      toast.error('Failed to deactivate')
    }
  }

  return (
    <div>
      {loading ? (
        <div className="text-gray-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">No users</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-gold-500/20">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} className="border-b border-dark-800">
                  <td className="py-2 pr-4 text-white">{u.full_name}</td>
                  <td className="py-2 pr-4 text-gray-300">{u.email}</td>
                  <td className="py-2 pr-4 text-gray-300 capitalize">{u.status}</td>
                  <td className="py-2 pr-4">
                    <select
                      className="bg-dark-900 text-gray-200 border border-gold-500/30 rounded px-2 py-1"
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                    >
                      {roleOptions.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-4">
                    <Button size="sm" variant="outline" onClick={() => deactivate(u.id)}>Deactivate</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (isAuthenticated && !isAdmin()) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate])

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-display font-bold text-gradient-gold">Admin Panel</h1>

        {/* Admin Shortcuts */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button as={Link} to="/admin/engagement" variant="primary">Engagement</Button>
              <Button as={Link} to="/admin/matches" variant="outline">Manage Matches</Button>
              <Button as={Link} to="/admin/players" variant="outline">View Players</Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex gap-2">
              <Button variant={tab === 'pending' ? 'primary' : 'outline'} onClick={() => setTab('pending')}>Pending Members</Button>
              <Button variant={tab === 'manage' ? 'primary' : 'outline'} onClick={() => setTab('manage')}>Manage Users</Button>
              <div className="ml-auto">
                <Button variant="outline" onClick={() => setRefreshKey(k => k + 1)}>Refresh</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            {tab === 'pending' ? <PendingList refreshKey={refreshKey} /> : <ManageUsers />}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
