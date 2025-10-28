'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import '../admin-dashboard/admin-dashboard.component.scss'

// Add Material Icons
if (typeof window !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { id: 'user-dashboard', label: 'User Dashboard', icon: 'group', path: '/user/dashboard' },
    { id: 'user-management', label: 'User Management', icon: 'supervisor_account', path: '/admin/user-management' },
    { id: 'asset-management', label: 'Asset Management', icon: 'devices_other', path: '/admin/asset-management' },
    { id: 'inventory-management', label: 'Inventory Management', icon: 'inventory', path: '/admin/inventory-management' },
    { id: 'transactions', label: 'Transactions', icon: 'receipt_long', path: '/admin/transactions' },
  ]

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id)
    router.push(item.path)
  }

  const handleLogout = () => {
    setShowLogoutDialog(true)
  }

  const confirmLogout = (confirmed: boolean) => {
    setShowLogoutDialog(false)
    if (confirmed) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Stock System</h2>
          <p>Admin Dashboard</p>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`menu-item ${pathname === item.path ? 'active' : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              <span className="material-icons">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          
          <div className="menu-item" onClick={handleLogout}>
            <span className="material-icons">logout</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
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
            width: '400px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => confirmLogout(false)}
                style={{ marginRight: '8px', padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmLogout(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  backgroundColor: '#4361ee',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
