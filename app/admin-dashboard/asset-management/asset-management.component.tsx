"use client";

import React, { useEffect, useState } from "react";
import "./asset-management.component.scss";

interface AssetItem {
  id: number;
  number: string;
  name: string;
  description: string;
  sku: string;
  condition: "Fair" | "Good" | "Very Good";
  qty_in: number;
  qty_out: number;
  balance_qty: number;
  unit_price: number;
  total_price: number;
  threshold: number;
}

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const apiUrl = "http://localhost:3000/assets";

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const res = await fetch(apiUrl);
      const data: AssetItem[] = await res.json();
      const computed = data.map((asset) => ({
        ...asset,
        total_price: asset.unit_price * asset.balance_qty,
      }));

      setAssets(computed);
      setFilteredAssets(
        showLowStockOnly
          ? computed.filter((a) => a.balance_qty <= (a.threshold || 10))
          : computed
      );
    } catch (error) {
      console.error("Failed to load assets:", error);
    }
  };

  const filterAssets = (query: string) => {
    setSearchQuery(query);
    const lower = query.toLowerCase();
    let filtered = assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lower) ||
        asset.number.toLowerCase().includes(lower) ||
        asset.sku.toLowerCase().includes(lower) ||
        asset.description.toLowerCase().includes(lower)
    );

    if (showLowStockOnly) {
      filtered = filtered.filter((a) => a.balance_qty <= (a.threshold || 10));
    }

    setFilteredAssets(filtered);
  };

  const addAsset = async () => {
    alert("Add Asset dialog would open here.");
    // In Next.js, you can use a modal or redirect to a form page
  };

  const editAsset = (asset: AssetItem) => {
    alert(`Editing asset: ${asset.name}`);
    // Implement modal or edit form route later
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Asset Management</h1>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => filterAssets(e.target.value)}
            placeholder="Search by name, number, SKU, or description"
          />
        </div>

        <button className="add-btn" onClick={addAsset}>
          + Add Asset Item
        </button>
      </div>

      {filteredAssets.length > 0 ? (
        <div className="table-container">
          <table className="full-width-table">
            <thead>
              <tr>
                <th>Asset Number</th>
                <th>Name</th>
                <th>Description</th>
                <th>SKU</th>
                <th>Condition</th>
                <th>Qty In</th>
                <th>Qty Out</th>
                <th>Balance Qty</th>
                <th>Status</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>{asset.number}</td>
                  <td>{asset.name}</td>
                  <td>{asset.description}</td>
                  <td>{asset.sku}</td>
                  <td>{asset.condition}</td>
                  <td>{asset.qty_in}</td>
                  <td>{asset.qty_out}</td>
                  <td>{asset.balance_qty}</td>
                  <td>
                    {asset.balance_qty <= asset.threshold ? (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        Low Stock
                      </span>
                    ) : (
                      <span style={{ color: "green" }}>OK</span>
                    )}
                  </td>
                  <td>{asset.unit_price} RWF</td>
                  <td>{asset.unit_price * asset.balance_qty} RWF</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => editAsset(asset)}
                    >
                      ✎
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          No assets found. Click "Add Asset" to create your first asset.
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
