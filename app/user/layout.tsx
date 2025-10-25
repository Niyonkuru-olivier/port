'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
// import '../admin-dashboard/user-dashboard/user-dashboard.module.css'

// Add Material Icons
if (typeof window !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #4361ee;
          --secondary: #3f37c9;
          --danger: #f72585;
          --success: #4cc9f0;
          --warning: #f8961e;
          --light: #f8f9fa;
          --dark: #212529;
        }
        
        .dashboard {
          display: grid;
          grid-template-columns: 250px 1fr;
          min-height: 100vh;
        }
        
        .sidebar {
          background-color: var(--dark);
          color: white;
          padding: 20px 0;
        }
        
        .sidebarHeader {
          padding: 0 20px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .sidebarHeader h2 {
          margin: 0;
          font-size: 1.2rem;
        }
        
        .sidebarHeader p {
          margin: 5px 0 0;
          font-size: 0.8rem;
          opacity: 0.8;
        }
        
        .sidebarMenu {
          padding: 20px 0;
        }
        
        .menuItem {
          padding: 12px 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          gap: 10px;
          text-decoration: none;
          color: white;
        }
        
        .menuItem:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .menuItem.active {
          background-color: var(--primary);
        }
        
        .mainContent {
          padding: 20px;
          background-color: #f5f7fa;
        }
        
        @media (max-width: 768px) {
          .dashboard {
            grid-template-columns: 1fr;
          }
          .sidebar {
            display: none;
          }
        }
      `}</style>
      
      <div className="dashboard">
        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
          <div className="sidebarHeader">
            <h2>Stock System</h2>
            <p>User Dashboard</p>
          </div>
          <div className="sidebarMenu">
            <Link href="/user/dashboard" className={`menuItem ${pathname === '/user/dashboard' ? 'active' : ''}`}>
              <span className="material-icons">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/user/assets" className={`menuItem ${pathname === '/user/assets' ? 'active' : ''}`}>
              <span className="material-icons">devices_other</span>
              <span>Asset Management</span>
            </Link>
            <Link href="/user/inventory" className={`menuItem ${pathname === '/user/inventory' ? 'active' : ''}`}>
              <span className="material-icons">inventory</span>
              <span>Inventory Management</span>
            </Link>
            <Link href="/user/reports" className={`menuItem ${pathname === '/user/reports' ? 'active' : ''}`}>
              <span className="material-icons">assessment</span>
              <span>Reports</span>
            </Link>
            <div className="menuItem" onClick={handleLogout}>
              <span className="material-icons">logout</span>
              <span>Logout</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mainContent">
          {children}
        </div>
      </div>
    </>
  )
}
