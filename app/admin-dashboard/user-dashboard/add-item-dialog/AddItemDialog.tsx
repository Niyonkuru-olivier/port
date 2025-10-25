'use client';

import React, { useState } from 'react';

interface Item {
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  description: string;
}

interface AddItemDialogProps {
  item?: Item;
  categories: string[];
  onClose: () => void;
  onSave: (item: Item) => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ item: initialItem, categories, onClose, onSave }) => {
  const [item, setItem] = useState<Item>(
    initialItem || { name: '', category: '', quantity: 0, threshold: 1, description: '' }
  );
  const isEditing = Boolean(initialItem);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'threshold' ? Number(value) : value
    }));
  };

  const handleSave = () => {
    onSave(item);
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
      <div>
        <form>
          <input
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Item Name"
            name="name"
            value={item.name}
            onChange={handleChange}
            required
          />
          <select
            style={{ width: '100%', marginBottom: '16px' }}
            name="category"
            value={item.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            style={{ width: '100%', marginBottom: '16px' }}
            type="number"
            name="quantity"
            min={0}
            value={item.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
          />
          <input
            style={{ width: '100%', marginBottom: '16px' }}
            type="number"
            name="threshold"
            min={1}
            value={item.threshold}
            onChange={handleChange}
            placeholder="Reorder Threshold"
            required
          />
          <textarea
            style={{ width: '100%', marginBottom: '16px' }}
            name="description"
            rows={3}
            value={item.description}
            onChange={handleChange}
            placeholder="Description"
          />
        </form>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
        <button type="button" onClick={onClose}>Cancel</button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!item.name || !item.category || item.quantity < 0 || item.threshold < 1}
          style={{ backgroundColor: '#4361ee', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}
        >
          {isEditing ? 'Update' : 'Save'} Item
        </button>
      </div>
    </div>
  );
};

export default AddItemDialog;
