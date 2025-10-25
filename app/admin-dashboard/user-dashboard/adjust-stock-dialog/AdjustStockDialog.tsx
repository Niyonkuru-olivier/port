'use client';

import React, { useState } from 'react';
import styles from './adjust-stock-dialog.module.css';

interface Adjustment {
  type: 'add' | 'remove';
  quantity: number;
  reason?: string;
}

interface AdjustStockDialogProps {
  currentStock: number;
  onClose: () => void;
  onSave: (adjustment: Adjustment) => void;
}

const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({ currentStock, onClose, onSave }) => {
  const [adjustment, setAdjustment] = useState<Adjustment>({
    type: 'add',
    quantity: 1,
    reason: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdjustment(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const handleSave = () => {
    onSave(adjustment);
  };

  const isValid = adjustment.type && adjustment.quantity >= 1;

  return (
    <div>
      <h2>Adjust Stock</h2>
      <div>
        <form>
          <input
            className={styles.fullWidth}
            value={currentStock}
            disabled
            placeholder="Current Stock"
          />

          <select
            className={styles.fullWidth}
            name="type"
            value={adjustment.type}
            onChange={handleChange}
            required
          >
            <option value="add">Add to Stock</option>
            <option value="remove">Remove from Stock</option>
          </select>

          <input
            className={styles.fullWidth}
            type="number"
            name="quantity"
            min={1}
            value={adjustment.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />

          <input
            className={styles.fullWidth}
            name="reason"
            value={adjustment.reason}
            onChange={handleChange}
            placeholder="Reason (Optional)"
          />
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <button type="button" onClick={onClose}>Cancel</button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          style={{ backgroundColor: '#4361ee', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
        >
          Save Adjustment
        </button>
      </div>
    </div>
  );
};

export default AdjustStockDialog;
