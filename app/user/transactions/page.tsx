'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Transaction {
  id: number
  type: 'add' | 'remove' | 'update' | string
  itemname: string
  quantity: number
  date: string
  user: string
  reason?: string
}

export default function UserTransactionsPage() {
  const [user, setUser] = useState<any>(null)
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'custom'>('all')
  const [selectedDate, setSelectedDate] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token || !userData) {
      router.push('/login')
      return
    }
    try {
      const parsed = JSON.parse(userData)
      if (parsed.role !== 'user' && parsed.role !== 'admin') {
        router.push('/login')
        return
      }
      setUser(parsed)
    } catch {
      router.push('/login')
    }
  }, [router])

  useEffect(() => {
    const load = async () => {
      try {
        let url = '/api/transactions'
        if (dateFilter === 'today') {
          const d = new Date()
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          url = `/api/transactions?date=${yyyy}-${mm}-${dd}`
        } else if (dateFilter === 'custom' && selectedDate) {
          url = `/api/transactions?date=${selectedDate}`
        }
        const res = await fetch(url)
        const data: Transaction[] = res.ok ? await res.json() : []
        setAllTransactions(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dateFilter, selectedDate])

  const userTransactions = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return allTransactions
      .filter(t => !user || t.user === user.email)
      .filter(t =>
        (t.itemname || '').toLowerCase().includes(q) ||
        (t.user || '').toLowerCase().includes(q) ||
        (t.type || '').toLowerCase().includes(q)
      )
  }, [allTransactions, user, searchQuery])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="header">
        <h1>My Transactions</h1>
        <div className="header-actions">
          <span>{user.email}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flexBasis: '30%' }}>
          <input
            type="text"
            placeholder="Search my transactions..."
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
            View All
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
              const v = e.target.value
              setSelectedDate(v)
              setDateFilter(v ? 'custom' : 'all')
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

      <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {userTransactions.length === 0 ? (
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
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Qty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#495057' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {userTransactions.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                    <td style={{ padding: '12px 16px' }}>{t.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: t.type === 'add' ? '#d1fae5' : t.type === 'remove' ? '#fee2e2' : '#fef3c7',
                          color: t.type === 'add' ? '#065f46' : t.type === 'remove' ? '#b91c1c' : '#92400e'
                        }}
                      >
                        {t.type === 'add' ? 'Add' : t.type === 'remove' ? 'Remove' : 'Update'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{t.itemname}</td>
                    <td style={{ padding: '12px 16px' }}>{t.quantity}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '12px 16px' }}>{t.reason || ''}</td>
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


