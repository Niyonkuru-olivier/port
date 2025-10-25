'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalInventoryItems: number;
  totalAssetItems: number;
  lowInventoryStock: number;
  lowAssetStock: number;
  todaysTransactions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryItems: 0,
    totalAssetItems: 0,
    lowInventoryStock: 0,
    lowAssetStock: 0,
    todaysTransactions: 0,
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
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
      
      // Load users data
      const usersResponse = await fetch('/api/users');
      const usersData = usersResponse.ok ? await usersResponse.json() : [];

      // Calculate stats
      const lowInventoryStock = inventoryData.filter((item: any) => item.balanceqty <= item.threshold).length;
      const lowAssetStock = assetsData.filter((asset: any) => asset.balance_qty <= asset.threshold).length;

      setStats({
        totalInventoryItems: inventoryData.length,
        totalAssetItems: assetsData.length,
        lowInventoryStock,
        lowAssetStock,
        todaysTransactions: 0, // Mock for now
      });
      setTotalUsers(usersData.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const goTo = (path: string) => {
    switch (path) {
      case 'inventory-items':
        router.push('/admin/inventory-management');
        break;
      case 'asset-items':
        router.push('/admin/asset-management');
        break;
      case 'low-inventory-items':
        router.push('/admin/inventory-management?lowStock=true');
        break;
      case 'low-asset-items':
        router.push('/admin/asset-management?lowStock=true');
        break;
      case 'users':
        router.push('/admin/user-management');
        break;
      case 'transactions':
        router.push('/admin/transactions');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="header">
        <h1>Admin Dashboard Overview</h1>
        <div className="header-actions">
          <span>Welcome, {user.email}</span>
        </div>
      </div>
      
      <div className="stats-container">
        <div 
          onClick={() => goTo('inventory-items')}
          className="stat-card"
        >
          <div className="mat-card-header">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📦</div>
            <h3>Total Inventory Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.totalInventoryItems}</div>
            <div className="card-subtext">Items in stock</div>
          </div>
        </div>
        
        <div 
          onClick={() => goTo('asset-items')}
          className="stat-card"
        >
          <div className="mat-card-header">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏢</div>
            <h3>Total Asset Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.totalAssetItems}</div>
            <div className="card-subtext">Assets managed</div>
          </div>
        </div>
        
        <div 
          onClick={() => goTo('low-inventory-items')}
          className="stat-card warning"
        >
          <div className="mat-card-header">
            <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#f8961e' }}>⚠️</div>
            <h3>Low Inventory Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.lowInventoryStock}</div>
            <div className="card-subtext">Need restocking</div>
          </div>
        </div>
        
        <div 
          onClick={() => goTo('low-asset-items')}
          className="stat-card warning"
        >
          <div className="mat-card-header">
            <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#f8961e' }}>⚠️</div>
            <h3>Low Asset Items</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.lowAssetStock}</div>
            <div className="card-subtext">Need attention</div>
          </div>
        </div>
        
        <div 
          onClick={() => goTo('users')}
          className="stat-card"
        >
          <div className="mat-card-header">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
            <h3>Total Users</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{totalUsers}</div>
            <div className="card-subtext">Registered users</div>
          </div>
        </div>
        
        <div 
          onClick={() => goTo('transactions')}
          className="stat-card"
        >
          <div className="mat-card-header">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
            <h3>Today's Transactions</h3>
          </div>
          <div className="mat-card-content">
            <div className="card-value">{stats.todaysTransactions}</div>
            <div className="card-subtext">Activities today</div>
          </div>
        </div>
      </div>
    </div>
  );
}