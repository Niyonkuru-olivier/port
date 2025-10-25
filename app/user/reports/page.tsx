'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserReports() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReportType, setSelectedReportType] = useState<'inventory' | 'asset'>('inventory')
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
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const generateReport = async () => {
    try {
      const reportData = {
        type: selectedReportType,
        format: selectedFormat,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }

      const url = selectedReportType === 'inventory' 
        ? '/api/reports/inventory' 
        : '/api/reports/assets'

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = `${selectedReportType}-report.${selectedFormat}`
      link.click()
      window.URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">Generate and View Reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/user/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <span className="text-gray-700">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Generate Report</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Select the type of report and format you want to generate.
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">
                    Report Type
                  </label>
                  <select
                    id="report-type"
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value as 'inventory' | 'asset')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="inventory">Inventory Report</option>
                    <option value="asset">Asset Report</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="report-format" className="block text-sm font-medium text-gray-700">
                    Format
                  </label>
                  <select
                    id="report-format"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as 'pdf' | 'xlsx' | 'csv')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="pdf">PDF</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={generateReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Available Reports</h3>
                <p className="text-3xl font-bold text-blue-600">2</p>
                <p className="text-sm text-gray-500">Inventory & Asset reports</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Export Formats</h3>
                <p className="text-3xl font-bold text-green-600">3</p>
                <p className="text-sm text-gray-500">PDF, Excel, CSV</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Last Generated</h3>
                <p className="text-3xl font-bold text-yellow-600">-</p>
                <p className="text-sm text-gray-500">No reports generated yet</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
