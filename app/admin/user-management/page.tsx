'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../admin-dashboard/user-management/user-management.component.scss'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'admin') {
        router.push('/login')
        return
      }
      setUser(parsedUser)
      loadUsers()
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        await loadUsers()
        setShowAddDialog(false)
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'user'
        })
        alert('User added successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to add user')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Error adding user')
    }
  }

  const toggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active'
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await loadUsers()
        alert(`User ${newStatus.toLowerCase()} successfully!`)
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Error updating user status')
    }
  }

  const editUser = (user: User) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setShowAddDialog(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const updateData: any = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }

      if (newUser.password) {
        updateData.password = newUser.password
      }

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        await loadUsers()
        setShowAddDialog(false)
        setEditingUser(null)
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'user'
        })
        alert('User updated successfully!')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="user-management">
      <h2>User Management</h2>

      <div className="search-container">
        <input
          className="search-field"
          type="text"
          placeholder="Search by name, email or role"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <button onClick={() => setShowAddDialog(true)}>
        Add User
      </button>

      {filteredUsers.length === 0 ? (
        <div style={{ marginTop: 16 }}>No users found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((userItem) => (
              <tr key={userItem.id}>
                <td>{userItem.id}</td>
                <td>{userItem.name}</td>
                <td>{userItem.role}</td>
                <td>{userItem.email}</td>
                <td>
                  <span className={userItem.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                    {userItem.status}
                  </span>
                </td>
                <td>{userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : ''}</td>
                <td>
                  <button onClick={() => editUser(userItem)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => toggleUserStatus(userItem.id, userItem.status)}>
                    {userItem.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', borderRadius: 8, width: '90%', maxWidth: 500, padding: 24 }}>
            <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
            <form>
              <input
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder={editingUser ? 'New Password (optional)' : 'Password'}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required={!editingUser}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </form>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => {
                setShowAddDialog(false)
                setEditingUser(null)
                setNewUser({ name: '', email: '', password: '', role: 'user' })
              }}>Cancel</button>
              <button onClick={editingUser ? handleUpdateUser : handleAddUser} disabled={!newUser.name || !newUser.email || (!editingUser && !newUser.password)}>
                {editingUser ? 'Update' : 'Add'} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
