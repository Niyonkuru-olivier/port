'use client';

import React, { useState, useEffect } from 'react';

interface AssetItem {
  id: string;
  number: string;
  name: string;
  description: string;
  sku: string;
  condition: string;
  qty_in: number;
  qty_out: number;
  balance_qty: number;
  threshold: number;
  unit_price: number;
}

interface AssetProps {
  assets: AssetItem[];
  openAddRemoveDialog: (asset: AssetItem, type: 'add' | 'remove') => void;
}

const Asset: React.FC<AssetProps> = ({ assets, openAddRemoveDialog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAssets, setFilteredAssets] = useState<AssetItem[]>(assets);

  useEffect(() => {
    filterAssets();
  }, [searchQuery, assets]);

  const filterAssets = () => {
    const query = searchQuery.toLowerCase();
    const filtered = assets.filter(asset =>
      asset.name.toLowerCase().includes(query) ||
      asset.number.toLowerCase().includes(query) ||
      asset.sku.toLowerCase().includes(query) ||
      asset.description.toLowerCase().includes(query)
    );
    setFilteredAssets(filtered);
  };

  const displayedColumns = [
    'number', 'name', 'description', 'sku', 'condition',
    'qty_in', 'qty_out', 'balance_qty', 'status', 'unit_price', 'total_price', 'actions'
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Asset Management</h1>
      </div>

      <input
        type="text"
        style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        placeholder="Search by name, number, SKU, or description"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />

      {filteredAssets.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {displayedColumns.map(col => (
                  <th key={col}>{col.replace('_', ' ').toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => (
                <tr key={asset.id}>
                  <td>{asset.number}</td>
                  <td>{asset.name}</td>
                  <td>{asset.description}</td>
                  <td>{asset.sku}</td>
                  <td>{asset.condition}</td>
                  <td>{asset.qty_in}</td>
                  <td>{asset.qty_out}</td>
                  <td>{asset.balance_qty}</td>
                  <td style={{ color: asset.balance_qty <= asset.threshold ? 'red' : 'green', fontWeight: asset.balance_qty <= asset.threshold ? 'bold' : 'normal' }}>
                    {asset.balance_qty <= asset.threshold ? 'Low Stock' : 'OK'}
                  </td>
                  <td>{asset.unit_price.toFixed(2)} RWF</td>
                  <td>{(asset.unit_price * asset.balance_qty).toFixed(2)} RWF</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => openAddRemoveDialog(asset, 'add')} title="Add Stock">
                      +
                    </button>
                    <button onClick={() => openAddRemoveDialog(asset, 'remove')} title="Remove Stock">
                      -
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No assets found.</div>
      )}
    </div>
  );
};

export default Asset;
