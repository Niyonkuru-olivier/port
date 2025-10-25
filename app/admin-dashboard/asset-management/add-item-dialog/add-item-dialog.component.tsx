"use client";

import React, { useEffect, useState } from "react";
import "./add-item-dialog.component.scss";

interface AssetItem {
  name: string;
  sku: string;
  description: string;
  condition: "Fair" | "Good" | "Very Good";
  qtyIn: number;
  qtyOut: number;
  unitPrice: number;
  totalPrice: number;
  threshold: number;
}

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: AssetItem) => void;
  item?: AssetItem;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onSave,
  item,
}) => {
  const [assetItem, setAssetItem] = useState<AssetItem>({
    name: "",
    sku: "",
    description: "",
    condition: "Good",
    qtyIn: 0,
    qtyOut: 0,
    unitPrice: 0,
    totalPrice: 0,
    threshold: 5,
  });

  const [isEditing, setIsEditing] = useState(false);
  const conditions = ["Fair", "Good", "Very Good"];

  useEffect(() => {
    if (item) {
      setAssetItem(item);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAssetItem((prev) => ({
      ...prev,
      [name]: name.includes("qty") || name === "unitPrice" || name === "threshold"
        ? Number(value)
        : value,
    }));
  };

  const handleSave = () => {
    if (assetItem.name && assetItem.sku) {
      onSave(assetItem);
    }
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-container">
        <h2>{isEditing ? "Edit Item" : "Add New Item"}</h2>

        <form className="dialog-form" onSubmit={(e) => e.preventDefault()}>
          <div className="full-width">
            <label>Item Name</label>
            <input
              name="name"
              value={assetItem.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="full-width">
            <label>SKU (Code)</label>
            <input
              name="sku"
              value={assetItem.sku}
              onChange={handleChange}
              required
            />
          </div>

          <div className="full-width">
            <label>Condition</label>
            <select
              name="condition"
              value={assetItem.condition}
              onChange={handleChange}
              required
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          <div className="full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={assetItem.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="full-width">
            <label>Quantity In</label>
            <input
              type="number"
              name="qtyIn"
              min={0}
              value={assetItem.qtyIn}
              onChange={handleChange}
              required
            />
          </div>

          <div className="full-width">
            <label>Stock Threshold</label>
            <input
              type="number"
              name="threshold"
              min={0}
              value={assetItem.threshold}
              onChange={handleChange}
              required
            />
          </div>

          <div className="full-width">
            <label>Unit Price (RWF)</label>
            <input
              type="number"
              name="unitPrice"
              min={0}
              step="0.01"
              value={assetItem.unitPrice}
              onChange={handleChange}
              required
            />
          </div>

          {isEditing && (
            <div className="info-section">
              <p>
                <strong>Balance Quantity:</strong>{" "}
                {assetItem.qtyIn - assetItem.qtyOut}
              </p>
              <p>
                <strong>Total Price:</strong>{" "}
                {(assetItem.qtyIn - assetItem.qtyOut) * assetItem.unitPrice} RWF
              </p>
            </div>
          )}
        </form>

        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleSave}
            disabled={!assetItem.name || !assetItem.sku}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemDialog;
