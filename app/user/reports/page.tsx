'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '../../admin-dashboard/user-dashboard/report1/report1.component.scss'

interface InventoryItem {
  id: number
  name: string
  description: string
  qtyin: number
  qtyout: number
  balanceqty: number
  unitprice: number
  threshold: number
  condition: string
  number: string
}

interface AssetItem {
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
  threshold: number
}

export default function UserReports() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [assetItems, setAssetItems] = useState<AssetItem[]>([])
  const [isLoadingInventory, setIsLoadingInventory] = useState(false)
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  const [inventoryError, setInventoryError] = useState('')
  const [assetError, setAssetError] = useState('')
  const [inventorySearchTerm, setInventorySearchTerm] = useState('')
  const [assetSearchTerm, setAssetSearchTerm] = useState('')
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<number[]>([])
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([])
  const [selectAllInventory, setSelectAllInventory] = useState(false)
  const [selectAllAssets, setSelectAllAssets] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx' | 'csv'>('pdf')
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
      fetchInventoryItems()
      fetchAssetItems()
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchInventoryItems = async () => {
    setIsLoadingInventory(true)
    setInventoryError('')
    try {
      const response = await fetch('/api/inventory')
      if (response.ok) {
        const data = await response.json()
        setInventoryItems(data)
      } else {
        setInventoryError('Failed to load inventory items')
      }
    } catch (error) {
      setInventoryError('Error loading inventory items')
    } finally {
      setIsLoadingInventory(false)
    }
  }

  const fetchAssetItems = async () => {
    setIsLoadingAssets(true)
    setAssetError('')
    try {
      const response = await fetch('/api/assets')
      if (response.ok) {
        const data = await response.json()
        setAssetItems(data)
      } else {
        setAssetError('Failed to load asset items')
      }
    } catch (error) {
      setAssetError('Error loading asset items')
    } finally {
      setIsLoadingAssets(false)
    }
  }

  const filteredInventoryItems = () => {
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(inventorySearchTerm.toLowerCase())
    )
  }

  const filteredAssetItems = () => {
    return assetItems.filter(item =>
      item.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(assetSearchTerm.toLowerCase())
    )
  }

  const toggleItemSelection = (type: 'inventory' | 'asset', itemId: number) => {
    if (type === 'inventory') {
      setSelectedInventoryIds(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      )
    } else {
      setSelectedAssetIds(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      )
    }
  }

  const toggleSelectAll = (type: 'inventory' | 'asset') => {
    if (type === 'inventory') {
      if (selectAllInventory) {
        setSelectedInventoryIds([])
      } else {
        setSelectedInventoryIds(filteredInventoryItems().map(item => item.id))
      }
      setSelectAllInventory(!selectAllInventory)
    } else {
      if (selectAllAssets) {
        setSelectedAssetIds([])
      } else {
        setSelectedAssetIds(filteredAssetItems().map(item => item.id))
      }
      setSelectAllAssets(!selectAllAssets)
    }
  }

  const generateInventoryReport = async () => {
    try {
      const selectedItems = inventoryItems.filter(item => selectedInventoryIds.includes(item.id))
      const reportData = {
        type: 'inventory',
        items: selectedItems,
        format: selectedFormat
      }

      const response = await fetch('/api/reports/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `inventory-report-${Date.now()}.${selectedFormat}`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      alert(`Inventory report generated successfully in ${selectedFormat.toUpperCase()} format!`)
    } catch (error) {
      console.error('Error generating inventory report:', error)
      alert('Failed to generate inventory report. Please try again.')
    }
  }

  const generateAssetReport = async () => {
    try {
      const selectedItems = assetItems.filter(item => selectedAssetIds.includes(item.id))
      const reportData = {
        type: 'asset',
        items: selectedItems,
        format: selectedFormat
      }

      const response = await fetch('/api/reports/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Handle file download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `asset-report-${Date.now()}.${selectedFormat}`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      alert(`Asset report generated successfully in ${selectedFormat.toUpperCase()} format!`)
    } catch (error) {
      console.error('Error generating asset report:', error)
      alert('Failed to generate asset report. Please try again.')
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
    <div className="report1-container">
      <h2>Download Reports</h2>
      
      {/* Format Selection */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>Report Format</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="format"
              value="pdf"
              checked={selectedFormat === 'pdf'}
              onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'xlsx' | 'csv')}
            />
            PDF (Text Format)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="format"
              value="xlsx"
              checked={selectedFormat === 'xlsx'}
              onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'xlsx' | 'csv')}
            />
            Excel (XLSX)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="format"
              value="csv"
              checked={selectedFormat === 'csv'}
              onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'xlsx' | 'csv')}
            />
            CSV
          </label>
        </div>
      </div>

      {/* Inventory Card */}
      <div className="report-card" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
          Inventory Item Reports
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ margin: '0' }}>Select Inventory items to include in the report:</p>

          {isLoadingInventory && (
            <div className="loading-container">
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p>Loading inventory items...</p>
            </div>
          )}

          {inventoryError && (
            <div className="error-message">
              {inventoryError}
              <button 
                onClick={fetchInventoryItems}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!isLoadingInventory && !inventoryError && (
            <>
              <div className="search-field">
                <input
                  type="text"
                  placeholder="Search Inventory"
                  value={inventorySearchTerm}
                  onChange={(e) => setInventorySearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectAllInventory}
                  onChange={() => toggleSelectAll('inventory')}
                />
                Select All
              </label>

              <div className="item-list">
                {filteredInventoryItems().map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedInventoryIds.includes(item.id)}
                      onChange={() => toggleItemSelection('inventory', item.id)}
                    />
                    {item.name}
                  </label>
                ))}
              </div>

              <button 
                onClick={generateInventoryReport}
                disabled={selectedInventoryIds.length === 0}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: selectedInventoryIds.length === 0 ? 0.6 : 1
                }}
              >
                Generate Inventory Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Asset Card */}
      <div className="report-card" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', margin: '0 0 1rem 0' }}>
          Asset Item Reports
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ margin: '0' }}>Select Asset items to include in the report:</p>

          {isLoadingAssets && (
            <div className="loading-container">
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1976d2',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p>Loading asset items...</p>
            </div>
          )}

          {assetError && (
            <div className="error-message">
              {assetError}
              <button 
                onClick={fetchAssetItems}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!isLoadingAssets && !assetError && (
            <>
              <div className="search-field">
                <input
                  type="text"
                  placeholder="Search Assets"
                  value={assetSearchTerm}
                  onChange={(e) => setAssetSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectAllAssets}
                  onChange={() => toggleSelectAll('asset')}
                />
                Select All
              </label>

              <div className="item-list">
                {filteredAssetItems().map(item => (
                  <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedAssetIds.includes(item.id)}
                      onChange={() => toggleItemSelection('asset', item.id)}
                    />
                    {item.name}
                  </label>
                ))}
              </div>

              <button 
                onClick={generateAssetReport}
                disabled={selectedAssetIds.length === 0}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: selectedAssetIds.length === 0 ? 0.6 : 1
                }}
              >
                Generate Asset Report
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}