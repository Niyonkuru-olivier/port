interface DashboardStats {
  totalInventoryItems: number;
  totalAssetItems: number;
  lowStockItems: number;
  todaysTransactions: number;
}

export class DashboardService {
  private apiUrl = 'http://localhost:3000/reports/dashboard-data'; // Adjust API URL

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}
