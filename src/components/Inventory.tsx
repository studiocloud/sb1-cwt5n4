import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface InventoryItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  cost: number;
  supplier_id: number;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ supplier_id: 1 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('id', { ascending: true });
    if (error) console.error('Error fetching inventory:', error);
    else setInventory(data || []);
  };

  const handleAddItem = async () => {
    if (!newItem.product_name || newItem.quantity === undefined || newItem.price === undefined || newItem.cost === undefined) {
      setError('Product name, quantity, price, and cost are required.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{ ...newItem, supplier_id: newItem.supplier_id || 1 }])
        .select();

      if (error) throw error;

      setInventory([...inventory, data[0]]);
      setIsAdding(false);
      setNewItem({ supplier_id: 1 });
      setError(null);
    } catch (error: any) {
      console.error('Error adding item:', error);
      setError(`Failed to add item: ${error.message}`);
    }
  };

  const handleUpdateItem = async (id: number) => {
    const { error } = await supabase
      .from('inventory')
      .update(inventory.find(item => item.id === id))
      .eq('id', id);
    if (error) console.error('Error updating item:', error);
    else {
      setEditingId(null);
      fetchInventory();
    }
  };

  const handleDeleteItem = async (id: number) => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting item:', error);
    else {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: number | null) => {
    const { name, value } = e.target;
    if (id === null) {
      setNewItem({ ...newItem, [name]: value });
    } else {
      setInventory(inventory.map(item => 
        item.id === id ? { ...item, [name]: value } : item
      ));
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Inventory Management</h1>
      <Button
        onClick={() => setIsAdding(true)}
        className="mb-4"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New Item
      </Button>
      {error && (
        <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isAdding && (
        <div className="mb-4 p-4 border rounded bg-card">
          <Input
            type="text"
            name="product_name"
            placeholder="Product Name"
            value={newItem.product_name || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2"
          />
          <Input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={newItem.quantity || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2"
          />
          <Input
            type="number"
            name="price"
            placeholder="Price"
            value={newItem.price || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2"
          />
          <Input
            type="number"
            name="cost"
            placeholder="Cost"
            value={newItem.cost || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2"
          />
          <Input
            type="number"
            name="supplier_id"
            placeholder="Supplier ID"
            value={newItem.supplier_id || ''}
            onChange={(e) => handleInputChange(e, null)}
            className="mb-2"
          />
          <Button
            onClick={handleAddItem}
            className="mt-2"
          >
            Add Item
          </Button>
        </div>
      )}
      <div className="bg-card rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Supplier ID
              </th>
              <th className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {editingId === item.id ? (
                    <Input
                      type="text"
                      name="product_name"
                      value={item.product_name}
                      onChange={(e) => handleInputChange(e, item.id)}
                      className="w-full"
                    />
                  ) : (
                    item.product_name
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(e, item.id)}
                      className="w-full"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      name="price"
                      value={item.price}
                      onChange={(e) => handleInputChange(e, item.id)}
                      className="w-full"
                    />
                  ) : (
                    `$${item.price.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      name="cost"
                      value={item.cost}
                      onChange={(e) => handleInputChange(e, item.id)}
                      className="w-full"
                    />
                  ) : (
                    `$${item.cost.toFixed(2)}`
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      name="supplier_id"
                      value={item.supplier_id}
                      onChange={(e) => handleInputChange(e, item.id)}
                      className="w-full"
                    />
                  ) : (
                    item.supplier_id
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  {editingId === item.id ? (
                    <Button
                      onClick={() => handleUpdateItem(item.id)}
                      className="mr-2"
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingId(item.id)}
                      className="mr-2"
                    >
                      <Edit size={16} />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteItem(item.id)}
                    variant="destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;