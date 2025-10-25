export interface AssetItem {
    id?: number;
    number?: string;
    name: string;
    description: string;
    sku: string;
    condition: "Fair" | "Good" | "Very Good";
    qtyIn: number;
    qtyOut?: number;
    balanceQty?: number;
    unitPrice: number;
    totalPrice?: number;
    threshold?: number;
  }
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/assets";
  
  /**
   * ✅ Service for Asset Management API
   * Replaces Angular HttpClient service using Fetch
   */
  export const assetService = {
    async getAssets(): Promise<AssetItem[]> {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch assets");
      return response.json();
    },
  
    async addAsset(asset: AssetItem): Promise<AssetItem> {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
      });
      if (!response.ok) throw new Error("Failed to add asset");
      return response.json();
    },
  
    async updateAsset(id: number, asset: Partial<AssetItem>): Promise<AssetItem> {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
      });
      if (!response.ok) throw new Error("Failed to update asset");
      return response.json();
    },
  };
  