import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalInventoryItems: number;
  totalAssetItems: number;
  lowInventoryStock: number;
  lowAssetStock: number;
  todaysTransactions: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInventoryItems: 0,
    totalAssetItems: 0,
    lowInventoryStock: 0,
    lowAssetStock: 0,
    todaysTransactions: 0,
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for now - replace with actual API calls
        setStats({
          totalInventoryItems: 0,
          totalAssetItems: 0,
          lowInventoryStock: 0,
          lowAssetStock: 0,
          todaysTransactions: 0,
        });
        setTotalUsers(0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '2rem', fontWeight: 'bold' }}>
        Admin Dashboard Overview
      </h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px' 
      }}>
        <div 
          onClick={() => goTo('inventory-items')}
          style={{
            padding: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📦</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Total Inventory Items</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalInventoryItems}</p>
        </div>
        <div 
          onClick={() => goTo('asset-items')}
          style={{
            padding: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏢</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Total Asset Items</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalAssetItems}</p>
        </div>
        <div 
          onClick={() => goTo('low-inventory-items')}
          style={{
            padding: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#ff9800' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Low Inventory Items</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.lowInventoryStock}</p>
        </div>
        <div 
          onClick={() => goTo('low-asset-items')}
          style={{
            padding: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px', color: '#ff9800' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Low Asset Items</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.lowAssetStock}</p>
        </div>
        <div 
          onClick={() => goTo('users')}
          style={{
            padding: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Total Users</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{totalUsers}</p>
        </div>
        <div 
          onClick={() => goTo('transactions')}
          style={{
            padding: '24px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Today's Transactions</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.todaysTransactions}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
