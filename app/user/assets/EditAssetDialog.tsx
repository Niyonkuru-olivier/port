'use client'

import React, { useState } from 'react'

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

interface EditAssetDialogProps {
  asset: Asset | null
  onClose: () => void
  onSave: (asset: Asset) => void
  mode?: 'add' | 'remove'
}

const EditAssetDialog: React.FC<EditAssetDialogProps> = ({ asset, onClose, onSave, mode }) => {
  const [formData, setFormData] = useState<Asset>(
    asset || {
      id: 0,
      number: '',
      name: '',
      description: '',
      sku: '',
      condition: 'Good',
      qty_in: 0,
      qty_out: 0,
      balance_qty: 0,
      unit_price: 0,
      total_price: 0,
      threshold: 5
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'qty_in' || name === 'qty_out' || name === 'unit_price' || name === 'threshold' || name === 'id'
        ? Number(value)
        : value
    }))
  }

  const handleSave = async () => {
    try {
      let performedBy = 'system'
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) performedBy = JSON.parse(userStr).email || 'system'
      } catch {}
      const response = await fetch(`/api/assets/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          condition: formData.condition,
          qty_in: formData.qty_in,
          qty_out: formData.qty_out,
          unit_price: formData.unit_price,
          threshold: formData.threshold,
          performedBy,
        }),
      })

      if (response.ok) {
        const updatedAsset = await response.json()
        onSave(updatedAsset)
        onClose()
      } else {
        alert('Failed to update asset')
      }
    } catch (error) {
      console.error('Error updating asset:', error)
      alert('Error updating asset')
    }
  }

  if (!asset) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '24px 24px 0 24px',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Asset</h2>
        </div>
        
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }} className="edit-dialog-scroll">
          <form>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Asset Number</label>
            <input
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              name="number"
              value={formData.number}
              onChange={handleChange}
              disabled={true}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Name</label>
            <input
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={mode === 'add' || mode === 'remove'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>SKU</label>
            <input
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              disabled={true}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Description</label>
            <textarea
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Condition</label>
            <select
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              <option value="Fair">Fair</option>
              <option value="Good">Good</option>
              <option value="Very Good">Very Good</option>
            </select>
          </div>

          {mode === 'remove' ? (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Quantity Out</label>
              <input
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                type="number"
                name="qty_out"
                min={0}
                value={formData.qty_out}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Quantity In</label>
              <input
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                type="number"
                name="qty_in"
                min={0}
                value={formData.qty_in}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Unit Price (RWF)</label>
            <input
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              type="number"
              name="unit_price"
              min={0}
              step="0.01"
              value={formData.unit_price}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Threshold</label>
            <input
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              type="number"
              name="threshold"
              min={1}
              value={formData.threshold}
              onChange={handleChange}
              required
              disabled={mode === 'add' || mode === 'remove'}
            />
          </div>

          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Balance Quantity:</strong> {formData.balance_qty}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Total Price:</strong> {formData.unit_price * formData.balance_qty} RWF
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Notes</label>
            <textarea
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              name="notes"
              rows={3}
              placeholder="Additional notes about this asset..."
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Last Updated</label>
            <input
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              type="datetime-local"
              value={new Date().toISOString().slice(0, 16)}
              disabled
            />
          </div>
          </form>
        </div>
        
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!formData.name || formData.qty_in < 0 || formData.unit_price < 0 || formData.threshold < 1}
            style={{ 
              backgroundColor: '#4361ee', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: (!formData.name || formData.qty_in < 0 || formData.unit_price < 0 || formData.threshold < 1) ? 0.5 : 1
            }}
          >
            Update Asset
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditAssetDialog
