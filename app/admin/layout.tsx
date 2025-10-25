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
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { id: 'user-dashboard', label: 'User Dashboard', icon: 'group', path: '/admin/user-dashboard' },
    { id: 'user-management', label: 'User Management', icon: 'supervisor_account', path: '/admin/user-management' },
    { id: 'asset-management', label: 'Asset Management', icon: 'devices_other', path: '/admin/asset-management' },
    { id: 'inventory-management', label: 'Inventory Management', icon: 'inventory', path: '/admin/inventory-management' },
  ]

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.id)
    router.push(item.path)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
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
    </div>
  )
}
