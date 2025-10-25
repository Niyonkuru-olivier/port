'use client';

import React from 'react';
import styles from './user-dashboard.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
}

const UserDashboard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const logout = () => {
    // Clear session/localStorage if needed
    localStorage.removeItem('token');
    router.push('/login');
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'material-symbols:dashboard', route: '/dashboard1' },
    { label: 'Asset Management', icon: 'material-symbols:devices-other', route: '/asset' },
    { label: 'Inventory Management', icon: 'material-symbols:inventory', route: '/inventory' },
    { label: 'Reports', icon: 'material-symbols:assessment', route: '/report1' },
    { label: 'Logout', icon: 'material-symbols:logout', action: logout },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Stock System</h2>
          <p>User Dashboard</p>
        </div>
        <div className={styles.sidebarMenu}>
          {menuItems.map((item) =>
            item.route ? (
              <Link key={item.label} href={item.route} className={styles.menuItem}>
                <Icon icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <div key={item.label} className={styles.menuItem} onClick={item.action}>
                <Icon icon={item.icon} />
                <span>{item.label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>{children}</div>
    </div>
  );
};

export default UserDashboard;
