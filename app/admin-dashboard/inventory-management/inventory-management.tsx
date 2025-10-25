import { useEffect, useState } from 'react';
import styles from './inventory-management.module.css';
import { InventoryItem, getInventory, addInventory, updateInventory } from './services/inventoryService';
import AddItemDialog from './add-item-dialog/AddItemDialog';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowLowStockOnly(params.get('lowStock') === 'true');
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const data = await getInventory();
    const mapped = data.map(item => ({
      ...item,
      balanceQty: item.qtyIn - (item.qtyOut || 0),
      totalPrice: item.unitPrice * (item.qtyIn - (item.qtyOut || 0)),
    }));

    setInventory(mapped);
    filterInventory(mapped, searchQuery, showLowStockOnly);
  };

  const filterInventory = (
    items: InventoryItem[] = inventory,
    query: string = searchQuery,
    lowStockOnly: boolean = showLowStockOnly
  ) => {
    let filtered = items.filter(
      item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.number?.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    );

    if (lowStockOnly) {
      filtered = filtered.filter(item => item.balanceQty! <= (item.threshold || 10));
    }

    setFilteredInventory(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    filterInventory(undefined, e.target.value);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowDialog(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowDialog(true);
  };

  const handleDialogSave = async (item: InventoryItem) => {
    if (editingItem) {
      await updateInventory(editingItem.id!, {
        ...item,
        balanceQty: item.qtyIn - editingItem.qtyOut,
        totalPrice: item.qtyIn * item.unitPrice,
      });
    } else {
      await addInventory({
        ...item,
        qtyOut: 0,
        balanceQty: item.qtyIn,
        totalPrice: item.qtyIn * item.unitPrice,
      });
    }
    setShowDialog(false);
    loadInventory();
  };

  return (
    <div className={styles['inventory-management']}>
      <h2>Inventory Management</h2>

      <input
        type="text"
        className={styles['search-field']}
        placeholder="Search by Name, Number or Description"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <button onClick={handleAdd}>Add Item</button>

      <div className={styles['table-container']}>
        <table>
          <thead>
            <tr>
              {['Number','Item Name','Description','Condition','Qty In','Qty Out','Balance','Status','Unit Price','Total Price','Actions'].map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td>{item.number}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.condition}</td>
                <td>{item.qtyIn}</td>
                <td>{item.qtyOut}</td>
                <td>{item.balanceQty}</td>
                <td className={item.balanceQty! <= (item.threshold || 10) ? styles['low-stock'] : styles['ok-stock']}>
                  {item.balanceQty! <= (item.threshold || 10) ? 'Low Stock' : 'OK'}
                </td>
                <td>{item.unitPrice} RWF</td>
                <td>{item.totalPrice} RWF</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <AddItemDialog
          item={editingItem}
          onClose={() => setShowDialog(false)}
          onSave={handleDialogSave}
        />
      )}
    </div>
  );
}
