'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../admin-dashboard/asset-management/asset-management.component.scss'

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

export default function UserAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
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
      if (parsedUser.role !== 'user') {
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


  const editAsset = (asset: Asset) => {
    alert(`Editing asset: ${asset.name}`)
    // Implement modal or edit form route later
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
  )
}