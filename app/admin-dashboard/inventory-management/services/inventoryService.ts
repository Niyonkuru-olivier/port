export interface InventoryItem {
  id?: number;
  number?: string;
  name: string;
  description: string;
  condition: 'Fair' | 'Good' | 'Very Good';
  qtyIn: number;
  qtyOut: number;
  balanceQty?: number;
  unitPrice: number;
  totalPrice?: number;
  threshold: number;
}

const API_URL = 'http://localhost:3000/inventory';

export const getInventory = async (): Promise<InventoryItem[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }
  return response.json();
};

export const addInventory = async (item: InventoryItem) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!response.ok) {
    throw new Error('Failed to add inventory item');
  }
  return response.json();
};

export const updateInventory = async (id: number, item: Partial<InventoryItem>) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });
  if (!response.ok) {
    throw new Error('Failed to update inventory item');
  }
  return response.json();
};
