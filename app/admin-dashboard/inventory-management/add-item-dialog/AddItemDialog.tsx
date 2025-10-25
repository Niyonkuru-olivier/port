'use client';

import React, { useState } from 'react';

interface Item {
  name: string;
  description: string;
  condition: 'Fair' | 'Good' | 'Very Good';
  qtyIn: number;
  qtyOut: number;
  unitPrice: number;
  threshold: number;
}

interface AddItemDialogProps {
  item?: Item | null;
  onClose: () => void;
  onSave: (item: Item) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ item: initialItem, onClose, onSave }) => {
  const [item, setItem] = useState<Item>(
    initialItem || { 
      name: '', 
      description: '', 
      condition: 'Good', 
      qtyIn: 0, 
      qtyOut: 0, 
      unitPrice: 0, 
      threshold: 5 
    }
  );
  const isEditing = Boolean(initialItem);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'qtyIn' || name === 'qtyOut' || name === 'unitPrice' || name === 'threshold' 
        ? Number(value) 
        : value
    }));
  };

  const handleSave = () => {
    onSave(item);
  };

  return (
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
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </h2>
        
        <form>
          <input
            style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="Item Name"
            name="name"
            value={item.name}
            onChange={handleChange}
            required
          />
          
          <textarea
            style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            name="description"
            rows={3}
            value={item.description}
            onChange={handleChange}
            placeholder="Description"
          />
          
          <select
            style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            name="condition"
            value={item.condition}
            onChange={handleChange}
            required
          >
            <option value="Fair">Fair</option>
            <option value="Good">Good</option>
            <option value="Very Good">Very Good</option>
          </select>
          
          <input
            style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            type="number"
            name="qtyIn"
            min={0}
            value={item.qtyIn}
            onChange={handleChange}
            placeholder="Quantity In"
            required
          />
          
          <input
            style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            type="number"
            name="qtyOut"
            min={0}
            value={item.qtyOut}
            onChange={handleChange}
            placeholder="Quantity Out"
          />
          
          <input
            style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            type="number"
            name="unitPrice"
            min={0}
            step="0.01"
            value={item.unitPrice}
            onChange={handleChange}
            placeholder="Unit Price"
            required
          />
          
          <input
            style={{ width: '100%', marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            type="number"
            name="threshold"
            min={1}
            value={item.threshold}
            onChange={handleChange}
            placeholder="Reorder Threshold"
            required
          />
        </form>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
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
            disabled={!item.name || item.qtyIn < 0 || item.unitPrice < 0 || item.threshold < 1}
            style={{ 
              backgroundColor: '#4361ee', 
              color: 'white', 
              padding: '8px 16px', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isEditing ? 'Update' : 'Save'} Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemDialog;
