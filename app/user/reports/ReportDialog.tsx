'use client'

import React, { useState, useEffect } from 'react'

interface ReportDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: any[]
  type: 'inventory' | 'asset' | 'transaction'
}

const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose, title, data, type }) => {
  const [filteredData, setFilteredData] = useState(data)
  const [filterValue, setFilterValue] = useState('')

  useEffect(() => {
    setFilteredData(data)
  }, [data])

  useEffect(() => {
    if (filterValue.trim() === '') {
      setFilteredData(data)
    } else {
      const filtered = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(filterValue.toLowerCase())
        )
      )
      setFilteredData(filtered)
    }
  }, [filterValue, data])

  const getDisplayedColumns = () => {
    switch (type) {
      case 'inventory':
        return ['name', 'quantity', 'minimumQuantity', 'location', 'category']
      case 'asset':
        return ['name', 'quantity', 'minimumQuantity', 'location', 'category']
      case 'transaction':
        return ['date', 'type', 'itemName', 'quantity', 'user']
      default:
        return ['name', 'quantity']
    }
  }

  const getColumnHeaders = () => {
    switch (type) {
      case 'inventory':
        return ['Name', 'Quantity', 'Minimum Quantity', 'Location', 'Category']
      case 'asset':
        return ['Name', 'Quantity', 'Minimum Quantity', 'Location', 'Category']
      case 'transaction':
        return ['Date', 'Type', 'Item Name', 'Quantity', 'User']
      default:
        return ['Name', 'Quantity']
    }
  }

  const formatCellValue = (column: string, value: any) => {
    if (column === 'date' && value) {
      return new Date(value).toLocaleDateString()
    }
    if (column === 'quantity' || column === 'minimumQuantity') {
      return Number(value) || 0
    }
    return value || ''
  }

  if (!isOpen) return null

  const displayedColumns = getDisplayedColumns()
  const columnHeaders = getColumnHeaders()

  return (
    <div className="report-dialog-overlay">
      <div className="report-dialog">
        <div className="report-dialog-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="report-dialog-content">
          <div className="filter-field">
            <input
              type="text"
              placeholder="Search..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  {columnHeaders.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index}>
                      {displayedColumns.map((column, colIndex) => (
                        <td key={colIndex}>
                          {formatCellValue(column, item[column])}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={displayedColumns.length} className="no-data">
                      No data matching the filter "{filterValue}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportDialog
