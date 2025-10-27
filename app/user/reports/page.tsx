'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './reports.css'

interface ReportItem {
  id: number
  name: string
  description: string
  sku?: string
  qtyIn?: number
  qtyOut?: number
  balance?: number
  balance_qty?: number
  unitPrice?: number
  unit_price?: number
  totalPrice?: number
  total_price?: number
  qty_in?: number
  qty_out?: number
}

interface ReportData {
  items: string[]
  type: string
  format: string
  startDate: Date
  endDate: Date
}

const ReportsPage: React.FC = () => {
  const router = useRouter()
  const [dataSource, setDataSource] = useState<ReportItem[]>([])
  const [selectedItems, setSelectedItems] = useState<ReportItem[]>([])
  const [selectedReportType, setSelectedReportType] = useState<'inventory' | 'asset'>('inventory')
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx' | 'csv'>('pdf')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ]

  const displayedColumns = [
    'select',
    'name',
    'description',
    'sku',
    'qtyIn',
    'qtyOut',
    'balance',
    'unitPrice',
    'totalPrice'
  ]

  useEffect(() => {
    loadData()
  }, [selectedReportType])

  const loadData = async () => {
    setLoading(true)
    try {
      const endpoint = selectedReportType === 'inventory' 
        ? '/api/reports/inventory-items' 
        : '/api/reports/asset-items'
      const response = await fetch(endpoint)
      const data = await response.json()
      
      setDataSource(data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAllSelected = () => {
    return selectedItems.length === dataSource.length && dataSource.length > 0
  }

  const toggleAllRows = () => {
    if (isAllSelected()) {
      setSelectedItems([])
    } else {
      setSelectedItems([...dataSource])
    }
  }

  const toggleRow = (item: ReportItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id)
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id)
      } else {
        return [...prev, item]
      }
    })
  }

  const isRowSelected = (item: ReportItem) => {
    return selectedItems.some(selected => selected.id === item.id)
  }

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    if (selectedItems.length === 0) {
      alert('Please select at least one item')
      return
    }

    const reportData: ReportData = {
      items: selectedItems.map(item => item.name),
      type: selectedReportType,
      format: selectedFormat,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    }

    try {
      const endpoint = selectedReportType === 'inventory' 
        ? '/api/reports/inventory' 
        : '/api/reports/assets'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${selectedReportType}-report.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        const error = await response.json()
        alert(`Error generating report: ${error.message || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    }
  }

  const exportAsCSV = () => {
    const headers = ['Name', 'Description', 'SKU', 'Qty In', 'Qty Out', 'Balance', 'Unit Price', 'Total Price']
    const rows = [
      headers,
      ...dataSource.map(item => [
        item.name,
        item.description,
        item.sku || '',
        item.qtyIn || 0,
        item.qtyOut || 0,
        item.balance || 0,
        item.unitPrice || 0,
        item.totalPrice || 0
      ])
    ]
    const csvContent = rows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedReportType}_report.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const exportAsPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      doc.setFontSize(16)
      doc.text(`${selectedReportType.toUpperCase()} REPORT`, 20, 20)
      
      const headers = ['Name', 'Description', 'Qty In', 'Qty Out', 'Balance', 'Unit Price', 'Total Price']
      const rows = dataSource.map(item => [
        item.name,
        item.description,
        item.qtyIn || 0,
        item.qtyOut || 0,
        item.balance || 0,
        item.unitPrice || 0,
        item.totalPrice || 0
      ])
      
      // Simple table implementation
      let y = 40
      const colWidths = [40, 50, 20, 20, 20, 25, 25]
      const startX = 20
      
      // Headers
      doc.setFontSize(10)
      headers.forEach((header, i) => {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
        doc.text(header, x, y)
      })
      
      y += 10
      
      // Data rows
      rows.forEach(row => {
        row.forEach((cell, i) => {
          const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
          doc.text(String(cell), x, y)
        })
        y += 10
        if (y > 280) {
          doc.addPage()
          y = 20
        }
      })
      
      doc.save(`${selectedReportType}_report.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const exportAsExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(dataSource)
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] }
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedReportType}_report.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating Excel:', error)
      alert('Error generating Excel. Please try again.')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reports</h2>
        <div className="report-controls">
          <div className="form-field">
            <label>Report Type</label>
            <select 
              value={selectedReportType} 
              onChange={(e) => setSelectedReportType(e.target.value as 'inventory' | 'asset')}
            >
              <option value="inventory">Inventory Report</option>
              <option value="asset">Asset Report</option>
            </select>
          </div>

          <div className="form-field">
            <label>Format</label>
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'xlsx' | 'csv')}>
              {formatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="date-range">
            <div className="form-field">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={generateReport}
            disabled={!startDate || !endDate || selectedItems.length === 0}
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th className="select-column">
                <input
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={toggleAllRows}
                />
              </th>
              <th>Name</th>
              <th>Description</th>
              <th>SKU</th>
              <th>Qty In</th>
              <th>Qty Out</th>
              <th>Balance</th>
              <th>Unit Price</th>
              <th>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {dataSource.map((row) => (
              <tr key={row.id}>
                <td className="select-column">
                  <input
                    type="checkbox"
                    checked={isRowSelected(row)}
                    onChange={() => toggleRow(row)}
                  />
                </td>
                <td>{row.name}</td>
                <td>{row.description}</td>
                <td>{row.sku || ''}</td>
                <td className="number-cell">{row.qtyIn || 0}</td>
                <td className="number-cell">{row.qtyOut || 0}</td>
                <td className="number-cell">{row.balance || 0}</td>
                <td className="number-cell">{row.unitPrice || 0}</td>
                <td className="number-cell">{row.totalPrice || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="export-buttons">
        <button className="btn btn-secondary" onClick={exportAsCSV}>
          Export as CSV
        </button>
        <button className="btn btn-secondary" onClick={exportAsPDF}>
          Export as PDF
        </button>
        <button className="btn btn-secondary" onClick={exportAsExcel}>
          Export as Excel
        </button>
      </div>
    </div>
  )
}

export default ReportsPage