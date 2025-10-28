'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// import '../admin-dashboard/user-dashboard/dashboard1/dashboard1.component.scss'
import './user-dashboard.css'

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [stats, setStats] = useState({
    totalInventoryItems: 0,
    totalAssetItems: 0,
    lowInventoryStock: 0,
    lowAssetStock: 0,
    todaysTransactions: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      // Allow both regular users and admins to access the user dashboard
      if (parsedUser.role !== 'user' && parsedUser.role !== 'admin') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
      loadDashboardData();
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Load inventory data
      const inventoryResponse = await fetch('/api/inventory');
      const inventoryData = inventoryResponse.ok ? await inventoryResponse.json() : [];
      
      // Load assets data
      const assetsResponse = await fetch('/api/assets');
      const assetsData = assetsResponse.ok ? await assetsResponse.json() : [];

      // Calculate stats
      const lowInventoryStock = inventoryData.filter((item: any) => item.balanceqty <= item.threshold).length;
      const lowAssetStock = assetsData.filter((asset: any) => asset.balance_qty <= asset.threshold).length;

      setStats({
        totalInventoryItems: inventoryData.length,
        totalAssetItems: assetsData.length,
        lowInventoryStock,
        lowAssetStock,
        todaysTransactions: 0 // You can implement this based on your transaction data
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const goTo = (route: string) => {
    router.push(`/user/${route}`);
  };

  const goToLowStock = (type: 'inventory' | 'assets') => {
    router.push(`/user/${type}?lowStock=true`);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div className="header">
        <h1>User Dashboard Overview</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <span className="material-icons">notifications</span>
            {stats.todaysTransactions > 0 && (
              <span className="badge">{stats.todaysTransactions}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container dashboard-cards">
        <div className="stat-card card" onClick={() => goTo('inventory')}>
          <div className="mat-card-header">
            <span className="material-icons">inventory</span>
            <h3>Total Inventory Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.totalInventoryItems}</div>
            <div className="card-subtext">Available</div>
          </div>
        </div>

        <div className="stat-card card" onClick={() => goTo('assets')}>
          <div className="mat-card-header">
            <span className="material-icons">inventory_2</span>
            <h3>Total Asset Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.totalAssetItems}</div>
            <div className="card-subtext">Available</div>
          </div>
        </div>

        <div className="stat-card card warning" onClick={() => goToLowStock('inventory')}>
          <div className="mat-card-header">
            <span className="material-icons">warning</span>
            <h3>Low Inventory Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.lowInventoryStock}</div>
            <div className="card-subtext">Needs attention</div>
          </div>
        </div>

        <div className="stat-card card warning" onClick={() => goToLowStock('assets')}>
          <div className="mat-card-header">
            <span className="material-icons">warning</span>
            <h3>Low Asset Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.lowAssetStock}</div>
            <div className="card-subtext">Needs attention</div>
          </div>
        </div>

        <div className="stat-card card" onClick={() => goTo('reports')}>
          <div className="mat-card-header">
            <span className="material-icons">assessment</span>
            <h3>Reports</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">Generate</div>
            <div className="card-subtext">PDF/Excel/CSV</div>
          </div>
        </div>

        <div className="stat-card card" onClick={() => goTo('transactions')}>
          <div className="mat-card-header">
            <span className="material-icons">receipt</span>
            <h3>Today's Transactions</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.todaysTransactions}</div>
            <div className="card-subtext">Movements</div>
          </div>
        </div>
      </div>
    </div>
  );
}
