'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EditInventoryDialog from './EditInventoryDialog'
import '../../admin-dashboard/asset-management/asset-management.component.scss'

interface InventoryItem {
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

export default function UserInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
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
      loadInventory()
      
      // Check for lowStock query parameter
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('lowStock') === 'true') {
        setShowLowStockOnly(true)
      }
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  const loadInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        const computed = data.map((item: any) => ({
          ...item,
          sku: item.sku || item.number, // Use number as SKU if SKU doesn't exist
          qty_in: item.qtyin || item.qty_in || 0,
          qty_out: item.qtyout || item.qty_out || 0,
          balance_qty: (item.qtyin || item.qty_in || 0) - (item.qtyout || item.qty_out || 0),
          unit_price: item.unitprice || item.unit_price || 0,
          total_price: (item.unitprice || item.unit_price || 0) * ((item.qtyin || item.qty_in || 0) - (item.qtyout || item.qty_out || 0)),
        }))
        setInventory(computed)
        setFilteredInventory(computed)
      }
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterInventory = (query: string) => {
    setSearchQuery(query)
    const lower = query.toLowerCase()
    let filtered = inventory.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.number.toLowerCase().includes(lower) ||
        item.sku.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower)
    )

    if (showLowStockOnly) {
      filtered = filtered.filter((a) => a.balance_qty <= (a.threshold || 10))
    }

    setFilteredInventory(filtered)
  }


  const editItem = (item: InventoryItem) => {
    setEditingItem(item)
  }

  const handleItemSave = async (updatedItem: InventoryItem) => {
    try {
      // Update the local state immediately for better UX
      setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
      setFilteredInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
      
      // Reload data from server to ensure consistency
      await loadInventory()
    } catch (error) {
      console.error('Error updating inventory item:', error)
    }
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
        <h1>Inventory Management</h1>

        {/* Search and Filters */}
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => filterInventory(e.target.value)}
            placeholder="Search by name, number, SKU, or description"
          />
        </div>

        <div className="filter-controls">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => {
                setShowLowStockOnly(e.target.checked)
                filterInventory(searchQuery)
              }}
            />
            Show Low Stock Only
          </label>
        </div>
      </div>

      {filteredInventory.length > 0 ? (
        <div className="table-container">
          <table className="full-width-table">
            <thead>
              <tr>
                <th>Item Number</th>
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
              {filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.number}</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.sku}</td>
                  <td>{item.condition}</td>
                  <td>{item.qty_in}</td>
                  <td>{item.qty_out}</td>
                  <td>{item.balance_qty}</td>
                  <td>
                    {item.balance_qty <= item.threshold ? (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        Low Stock
                      </span>
                    ) : (
                      <span style={{ color: "green" }}>OK</span>
                    )}
                  </td>
                  <td>{item.unit_price} RWF</td>
                  <td>{item.unit_price * item.balance_qty} RWF</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => editItem(item)}
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
          No inventory items found. Click "Add Inventory Item" to create your first item.
        </div>
      )}

      {editingItem && (
        <EditInventoryDialog
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleItemSave}
        />
      )}
    </div>
  )
}