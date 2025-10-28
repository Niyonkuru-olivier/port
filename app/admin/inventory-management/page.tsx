'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import '../../admin-dashboard/asset-management/asset-management.component.scss'

interface InventoryItem {
  id: number
  number: string
  name: string
  description: string
  condition: string
  qty_in: number
  qty_out: number
  balance_qty: number
  unit_price: number
  total_price: number
  threshold: number
}

function AdminInventoryManagementContent() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    condition: 'Good',
    qty_in: 0,
    qty_out: 0,
    unit_price: 0,
    threshold: 5
  })
  const router = useRouter()
  const searchParams = useSearchParams()

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
      loadInventory()
    } catch (error) {
      router.push('/login')
    }
  }, [router])

  // Apply low stock filter when query param lowStock=true is present
  useEffect(() => {
    const low = searchParams?.get('lowStock') === 'true'
    setShowLowStockOnly(low)
    // re-run filter with current query when toggled via URL
    filterInventory(searchQuery)
  }, [searchParams])

  const loadInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        const computed = data.map((item: any, index: number) => ({
          ...item,
          number: item.number || `INV-${String(index + 1).padStart(4, '0')}`, // Auto-generate item number
          qty_in: item.qtyin || item.qty_in || 0,
          qty_out: item.qtyout || item.qty_out || 0,
          balance_qty: (item.qtyin || item.qty_in || 0) - (item.qtyout || item.qty_out || 0),
          unit_price: item.unitprice || item.unit_price || 0,
          total_price: (item.unitprice || item.unit_price || 0) * ((item.qtyin || item.qty_in || 0) - (item.qtyout || item.qty_out || 0)),
        }))
        setInventory(computed)
        // Do not override filtered list here; filtering is driven by effect below
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
        item.description.toLowerCase().includes(lower)
    )

    if (showLowStockOnly) {
      filtered = filtered.filter((a) => a.balance_qty <= (a.threshold || 10))
    }

    setFilteredInventory(filtered)
  }

  // Keep filtered list in sync with data, query, and low-stock toggle
  useEffect(() => {
    filterInventory(searchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, showLowStockOnly])

  const handleAddItem = async () => {
    try {
      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/inventory/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newItem.name,
            description: newItem.description,
            condition: newItem.condition,
            qtyin: newItem.qty_in,
            qtyout: newItem.qty_out,
            unitprice: newItem.unit_price,
            threshold: newItem.threshold,
            performedBy: user?.email || 'system'
          })
        })

        if (response.ok) {
          await loadInventory()
          setShowAddDialog(false)
          setEditingItem(null)
          setNewItem({
            name: '',
            description: '',
            condition: 'Good',
            qty_in: 0,
            qty_out: 0,
            unit_price: 0,
            threshold: 5
          })
          alert('Item updated successfully!')
        } else {
          alert('Failed to update item')
        }
      } else {
        // Add new item
        const itemNumber = `INV-${String(inventory.length + 1).padStart(4, '0')}`
        
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newItem,
            number: itemNumber,
            qtyin: newItem.qty_in,
            qtyout: newItem.qty_out,
            unitprice: newItem.unit_price,
            performedBy: user?.email || 'system',
          })
        })

        if (response.ok) {
          await loadInventory()
          setShowAddDialog(false)
          setEditingItem(null)
          setNewItem({
            name: '',
            description: '',
            condition: 'Good',
            qty_in: 0,
            qty_out: 0,
            unit_price: 0,
            threshold: 5
          })
          alert('Item added successfully!')
        } else {
          alert('Failed to add item')
        }
      }
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Error saving item')
    }
  }

  const editItem = (item: InventoryItem) => {
    setEditingItem(item)
    setNewItem({
      name: item.name,
      description: item.description,
      condition: item.condition,
      qty_in: item.qty_in,
      qty_out: item.qty_out,
      unit_price: item.unit_price,
      threshold: item.threshold
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
        <h1>Inventory Management</h1>

        {/* Search */}
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => filterInventory(e.target.value)}
            placeholder="Search by name, number, or description"
          />
        </div>

        <button className="add-btn" onClick={() => setShowAddDialog(true)}>
          + Add Inventory Item
        </button>
      </div>

      {filteredInventory.length > 0 ? (
        <div className="table-container">
          <table className="full-width-table">
            <thead>
              <tr>
                <th>Item Number</th>
                <th>Name</th>
                <th>Description</th>
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

      {/* Add Item Dialog */}
      {showAddDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
            
            <form>
              <input
                style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                required
              />
              
              <textarea
                style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                rows={3}
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Description"
              />
              
              <select
                style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={newItem.condition}
                onChange={(e) => setNewItem({...newItem, condition: e.target.value})}
                required
              >
                <option value="Fair">Fair</option>
                <option value="Good">Good</option>
                <option value="Very Good">Very Good</option>
              </select>
              
              <input
                style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                type="number"
                min={0}
                value={newItem.qty_in}
                onChange={(e) => setNewItem({...newItem, qty_in: parseInt(e.target.value) || 0})}
                placeholder="Quantity In"
                required
              />
              
              <input
                style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                type="number"
                min={0}
                step="0.01"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value) || 0})}
                placeholder="Unit Price"
                required
              />
              
              <input
                style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                type="number"
                min={1}
                value={newItem.threshold}
                onChange={(e) => setNewItem({...newItem, threshold: parseInt(e.target.value) || 5})}
                placeholder="Reorder Threshold"
                required
              />
            </form>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingItem(null)
                  setNewItem({
                    name: '',
                    description: '',
                    condition: 'Good',
                    qty_in: 0,
                    qty_out: 0,
                    unit_price: 0,
                    threshold: 5
                  })
                }}
                style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!newItem.name || newItem.qty_in < 0 || newItem.unit_price < 0 || newItem.threshold < 1}
                style={{ 
                  backgroundColor: '#4361ee', 
                  color: 'white', 
                  padding: '8px 16px', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingItem ? 'Update' : 'Save'} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminInventoryManagement() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><div>Loading...</div></div>}>
      <AdminInventoryManagementContent />
    </Suspense>
  )
}