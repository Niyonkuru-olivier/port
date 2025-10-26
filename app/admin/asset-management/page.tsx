'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../admin-dashboard/asset-management/asset-management.component.scss'
import '../../admin-dashboard/asset-management/add-item-dialog/add-item-dialog.component.scss'

interface Asset {
  id: number
  number: string
  name: string
  description: string
  sku: string
  condition: string
  qty_in: number
  qty_out: number
  balance_qty: number
  unit_price: number
  total_price: number
  threshold: number
}

export default function AdminAssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [newAsset, setNewAsset] = useState({
    number: '',
    name: '',
    description: '',
    sku: '',
    condition: 'Good',
    qty_in: 0,
    qty_out: 0,
    unit_price: 0,
    threshold: 5
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'admin') {
        router.push('/login')
        return
      }
      setUser(parsedUser)
      loadAssets()
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  const loadAssets = async () => {
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const data = await response.json()
        const computed = data.map((asset: Asset) => ({
          ...asset,
          total_price: asset.unit_price * asset.balance_qty,
        }))
        setAssets(computed)
        setFilteredAssets(computed)
      }
    } catch (error) {
      console.error('Error loading assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAssets = (query: string) => {
    setSearchQuery(query)
    const lower = query.toLowerCase()
    let filtered = assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(lower) ||
        asset.number.toLowerCase().includes(lower) ||
        asset.sku.toLowerCase().includes(lower) ||
        asset.description.toLowerCase().includes(lower)
    )

    if (showLowStockOnly) {
      filtered = filtered.filter((a) => a.balance_qty <= (a.threshold || 10))
    }

    setFilteredAssets(filtered)
  }

  const handleAddAsset = async () => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset)
      })

      if (response.ok) {
        await loadAssets()
        setShowAddDialog(false)
        setNewAsset({
          number: '',
          name: '',
          description: '',
          sku: '',
          condition: 'Good',
          qty_in: 0,
          qty_out: 0,
          unit_price: 0,
          threshold: 5
        })
        alert('Asset added successfully!')
      } else {
        alert('Failed to add asset')
      }
    } catch (error) {
      console.error('Error adding asset:', error)
      alert('Error adding asset')
    }
  }

  const editAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setNewAsset({
      number: asset.number,
      name: asset.name,
      description: asset.description,
      sku: asset.sku,
      condition: asset.condition,
      qty_in: asset.qty_in,
      qty_out: asset.qty_out,
      unit_price: asset.unit_price,
      threshold: asset.threshold
    })
    setShowAddDialog(true)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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

        <button className="add-btn" onClick={() => setShowAddDialog(true)}>
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

      {/* Add Asset Dialog */}
      {showAddDialog && (
        <div className="dialog-overlay">
          <div className="dialog-container" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>

            <form className="dialog-form" onSubmit={(e) => e.preventDefault()}>
              <div className="full-width">
                <label>Asset Number</label>
                <input
                  type="text"
                  value={newAsset.number}
                  onChange={(e) => setNewAsset({...newAsset, number: e.target.value})}
                  placeholder="Enter asset number"
                  required
                />
              </div>

              <div className="full-width">
                <label>Asset Name</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="Enter asset name"
                  required
                />
              </div>

              <div className="full-width">
                <label>SKU (Code)</label>
                <input
                  type="text"
                  value={newAsset.sku}
                  onChange={(e) => setNewAsset({...newAsset, sku: e.target.value})}
                  placeholder="Enter SKU"
                  required
                />
              </div>

              <div className="full-width">
                <label>Condition</label>
                <select
                  value={newAsset.condition}
                  onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
                  required
                >
                  <option value="Fair">Fair</option>
                  <option value="Good">Good</option>
                  <option value="Very Good">Very Good</option>
                </select>
              </div>

              <div className="full-width">
                <label>Description</label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                  rows={3}
                  placeholder="Enter description"
                />
              </div>

              <div className="full-width">
                <label>Quantity In</label>
                <input
                  type="number"
                  min={0}
                  value={newAsset.qty_in}
                  onChange={(e) => setNewAsset({...newAsset, qty_in: parseInt(e.target.value) || 0})}
                  required
                />
              </div>

              <div className="full-width">
                <label>Stock Threshold</label>
                <input
                  type="number"
                  min={0}
                  value={newAsset.threshold}
                  onChange={(e) => setNewAsset({...newAsset, threshold: parseInt(e.target.value) || 5})}
                  required
                />
              </div>

              <div className="full-width">
                <label>Unit Price (RWF)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={newAsset.unit_price}
                  onChange={(e) => setNewAsset({...newAsset, unit_price: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
            </form>

            <div className="dialog-actions">
              <button type="button" onClick={() => {
                setShowAddDialog(false)
                setEditingAsset(null)
                setNewAsset({
                  number: '',
                  name: '',
                  description: '',
                  sku: '',
                  condition: 'Good',
                  qty_in: 0,
                  qty_out: 0,
                  unit_price: 0,
                  threshold: 5
                })
              }}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleAddAsset}
                disabled={!newAsset.number || !newAsset.name || !newAsset.sku || newAsset.qty_in <= 0 || newAsset.unit_price <= 0}
              >
                {editingAsset ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
