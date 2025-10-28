'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
        // Log a transaction for adding a user
        try {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemid: 0,
              itemname: newUser.email,
              type: 'add',
              quantity: 1,
              user: user?.email || 'system',
              reason: `User ${newUser.email} created`
            })
          })
        } catch (_) {}
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
        alert(error.message || 'Email already registered')
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
        // Log a transaction for activation/deactivation
        try {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemid: 0,
              itemname: `user:${userId}`,
              type: 'update',
              quantity: 1,
              user: user?.email || 'system',
              reason: `User ${userId} set to ${newStatus}`
            })
          })
        } catch (_) {}
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
    <div style={{ padding: '24px' }}>
      <div className="header">
        <h1>User Management</h1>
        <div className="header-actions">
          <span>Welcome, {user.email}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flexBasis: '30%' }}>
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ flexBasis: '30%', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => setShowAddDialog(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#4361ee',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3651d4'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4361ee'}
          >
            <span>+</span> Add User
          </button>
        </div>
        <div style={{ flexBasis: '30%' }} />
      </div>

      <div className="user-management-card" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <p>No users found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Created At</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{userItem.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{userItem.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{userItem.role}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{userItem.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={userItem.status === 'Active' ? 'badge-success' : 'badge-danger'}>
                        {userItem.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>
                      {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : ''}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => editUser(userItem)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #4361ee',
                            backgroundColor: 'white',
                            color: '#4361ee',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#4361ee'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.color = '#4361ee'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleUserStatus(userItem.id, userItem.status)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: userItem.status === 'Active' ? '#f72585' : '#4cc9f0',
                            backgroundColor: 'white',
                            color: userItem.status === 'Active' ? '#f72585' : '#4cc9f0',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = userItem.status === 'Active' ? '#f72585' : '#4cc9f0'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                            e.currentTarget.style.color = userItem.status === 'Active' ? '#f72585' : '#4cc9f0'
                          }}
                        >
                          {userItem.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddDialog && (
        <div style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            width: '90%', 
            maxWidth: '500px', 
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#212529' }}>
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
              <input
                type="password"
                placeholder={editingUser ? 'New Password (optional)' : 'Password'}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required={!editingUser}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                required
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  width: '100%',
                  cursor: 'pointer'
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </form>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '8px', 
              marginTop: '20px' 
            }}>
              <button
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingUser(null)
                  setNewUser({ name: '', email: '', password: '', role: 'user' })
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  color: '#495057',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                disabled={!newUser.name || !newUser.email || (!editingUser && !newUser.password)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#4361ee',
                  color: 'white',
                  cursor: (!newUser.name || !newUser.email || (!editingUser && !newUser.password)) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: (!newUser.name || !newUser.email || (!editingUser && !newUser.password)) ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {editingUser ? 'Update' : 'Add'} User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
