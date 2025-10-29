import React, { useEffect, useState } from 'react';

type ReportType = 'inventory' | 'asset';
type FormatType = 'pdf' | 'xlsx' | 'csv';

interface ReportItem {
  name: string;
  description?: string;
  sku?: string;
  qtyIn?: number;
  qtyOut?: number;
  balance?: number;
  unitPrice?: number;
  totalPrice?: number;
}

const formatOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'csv', label: 'CSV' }
];

const Reports: React.FC = () => {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('inventory');
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('pdf');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedReportType]);

  const loadData = async () => {
    try {
      const url = selectedReportType === 'inventory'
        ? '/api/reports/inventory-items'
        : '/api/reports/asset-items';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const data = await response.json();
      setItems(data);
      setSelectedItems(new Set());
    } catch (err) {
      console.error('Error loading report data:', err);
    }
  };

  const toggleSelect = (name: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setSelectedItems(newSet);
  };

  const toggleAll = () => {
    if (selectedItems.size === items.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(items.map((i) => i.name)));
  };

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;

  const generateReport = async () => {
    if (!startDate || !endDate) return alert('Please select start and end dates');
    if (selectedItems.size === 0) return alert('Please select at least one item');

    try {
      const reportData = {
        items: Array.from(selectedItems),
        type: selectedReportType,
        format: selectedFormat,
        startDate,
        endDate
      };
      const url = selectedReportType === 'inventory' 
        ? '/api/reports/inventory' 
        : '/api/reports/assets';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${selectedReportType}-report.${selectedFormat}`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error generating report', err);
      alert('Error generating report. Please try again.');
    }
  };

  const getMimeType = (format: FormatType) => {
    switch (format) {
      case 'pdf': return 'application/pdf';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv': return 'text/csv';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Reports</h2>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select value={selectedReportType} onChange={(e) => setSelectedReportType(e.target.value as ReportType)}>
            <option value="inventory">Inventory Report</option>
            <option value="asset">Asset Report</option>
          </select>

          <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value as FormatType)}>
            {formatOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <button disabled={!startDate || !endDate || selectedItems.size === 0} onClick={generateReport}>
            Generate Report
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={isAllSelected} onChange={toggleAll} />
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
            {items.map((item) => (
              <tr key={item.name}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.name)}
                    onChange={() => toggleSelect(item.name)}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.sku}</td>
                <td>{item.qtyIn}</td>
                <td>{item.qtyOut}</td>
                <td>{item.balance}</td>
                <td>{item.unitPrice}</td>
                <td>{item.totalPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
