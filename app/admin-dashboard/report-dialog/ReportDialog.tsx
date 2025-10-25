'use client';

import React, { useState, useMemo } from 'react';
import styles from './report-dialog.module.css';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: any[];
  type: 'inventory' | 'asset' | 'transaction' | string;
}

const ReportDialog: React.FC<ReportDialogProps> = ({ isOpen, onClose, title, items, type }) => {
  const [filter, setFilter] = useState('');

  const displayedColumns = useMemo(() => {
    switch (type) {
      case 'inventory':
      case 'asset':
        return ['name', 'quantity', 'minimumQuantity', 'location', 'category'];
      case 'transaction':
        return ['date', 'type', 'itemName', 'quantity', 'user'];
      default:
        return ['name', 'quantity'];
    }
  }, [type]);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    return items.filter((item) =>
      displayedColumns.some((col) =>
        String(item[col]).toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [filter, items, displayedColumns]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2>{title}</h2>

        <input
          className={styles.filterField}
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                {displayedColumns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={displayedColumns.length}>
                    No data matching "{filter}"
                  </td>
                </tr>
              ) : (
                filteredItems.map((row, idx) => (
                  <tr key={idx}>
                    {displayedColumns.map((col) => (
                      <td key={col}>
                        {col === 'date'
                          ? new Date(row[col]).toLocaleString()
                          : row[col]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReportDialog;
