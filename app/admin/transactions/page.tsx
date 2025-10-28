'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: number
  type: string
  itemname: string
  quantity: number
  date: string
  user: string
  reason?: string
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'custom'>('all')
  const [selectedDate, setSelectedDate] = useState('')
  const router = useRouter()

  const loadTransactions = async () => {
    try {
      let url = '/api/transactions'
      if (dateFilter === 'today') {
        const today = new Date()
        const yyyy = today.getFullYear()
        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        const dateStr = `${yyyy}-${mm}-${dd}`
        url = `/api/transactions?date=${dateStr}`
      } else if (dateFilter === 'custom' && selectedDate) {
        url = `/api/transactions?date=${selectedDate}`
      }
      console.log('Fetching transactions from:', url)
      const res = await fetch(url)
      const data: Transaction[] = res.ok ? await res.json() : []
      console.log('Transactions loaded:', data.length)
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

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
      loadTransactions()
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [dateFilter])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const filteredTransactions = transactions.filter(transaction => 
    (transaction.itemname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.user.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const deleteTransaction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadTransactions()
        alert('Transaction deleted successfully')
      } else {
        alert('Failed to delete transaction')
      }
    } catch (e) {
      console.error('Failed to delete', e)
      alert('Error deleting transaction')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="header">
        <h1>Transactions Management</h1>
        <div className="header-actions">
          <span>Welcome, {user.email}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flexBasis: '30%' }}>
          <input
            type="text"
            placeholder="Search transactions..."
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
        <div style={{ flexBasis: '30%', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setDateFilter('all')}
            className={dateFilter === 'all' ? 'active' : ''}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: dateFilter === 'all' ? '#4361ee' : 'white',
              color: dateFilter === 'all' ? 'white' : '#212529',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            View All Transactions
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={dateFilter === 'today' ? 'active' : ''}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: dateFilter === 'today' ? '#4361ee' : 'white',
              color: dateFilter === 'today' ? 'white' : '#212529',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Today Only
          </button>
        </div>
        <div style={{ flexBasis: '30%', display: 'flex', justifyContent: 'flex-end' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              const val = e.target.value
              setSelectedDate(val)
              setDateFilter(val ? 'custom' : 'all')
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div className="user-management-card" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            <p>No transactions found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Item</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Quantity</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>User</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{transaction.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={
                        transaction.type === 'add' ? 'badge-success' : 
                        transaction.type === 'remove' ? 'badge-danger' : 
                        'badge-warning'
                      } style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: transaction.type === 'add' ? '#d1fae5' : transaction.type === 'remove' ? '#fee2e2' : '#fef3c7',
                        color: transaction.type === 'add' ? '#065f46' : transaction.type === 'remove' ? '#b91c1c' : '#92400e'
                      }}>
                        {transaction.type === 'add' ? 'Add' : transaction.type === 'remove' ? 'Remove' : 'Update'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{transaction.itemname}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{transaction.quantity}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>{transaction.user}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#212529' }}>
                      {new Date(transaction.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #dc3545',
                          backgroundColor: 'white',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545'
                          e.currentTarget.style.color = 'white'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'white'
                          e.currentTarget.style.color = '#dc3545'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
