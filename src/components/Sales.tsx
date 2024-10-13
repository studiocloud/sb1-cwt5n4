import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

interface Sale {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  sale_date: string;
  created_at?: string;
}

interface InventoryItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSale, setNewSale] = useState<Partial<Sale>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
    fetchInventory();
  }, []);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.error('Error fetching sales:', error);
      setError(`Error fetching sales: ${error.message}`);
    } else {
      setSales(data || []);
    }
  };

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, product_name, quantity, price')
      .order('product_name', { ascending: true });
    if (error) {
      console.error('Error fetching inventory:', error);
      setError(`Error fetching inventory: ${error.message}`);
    } else {
      setInventory(data || []);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSale({ ...newSale, [name]: name === 'product_id' ? parseInt(value) : parseFloat(value) });
  };

  const handleAddSale = async () => {
    setError(null);
    if (!newSale.product_id || !newSale.quantity) {
      setError('Please select a product and enter a quantity.');
      return;
    }

    const selectedProduct = inventory.find(item => item.id === newSale.product_id);
    if (!selectedProduct) {
      setError('Selected product not found in inventory.');
      return;
    }

    if (newSale.quantity > selectedProduct.quantity) {
      setError('Quantity exceeds available inventory.');
      return;
    }

    try {
      const currentDate = new Date().toISOString();
      // Insert the new sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          product_id: newSale.product_id,
          quantity: newSale.quantity,
          price: selectedProduct.price,
          sale_date: currentDate
        }])
        .select();

      if (saleError) throw saleError;

      if (saleData) {
        // Update inventory quantity
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: selectedProduct.quantity - newSale.quantity })
          .eq('id', selectedProduct.id);

        if (updateError) {
          console.error('Error updating inventory:', updateError);
          setError(`Sale added but failed to update inventory: ${updateError.message}`);
        } else {
          setSales([saleData[0], ...sales]);
          setIsAdding(false);
          setNewSale({});
          await fetchInventory(); // Refresh inventory
        }
      }
    } catch (error: any) {
      console.error('Error adding sale:', error);
      setError(`Failed to add sale: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Sales Management</h1>
      <Button
        onClick={() => setIsAdding(true)}
        className="mb-4"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New Sale
      </Button>
      {error && (
        <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isAdding && (
        <div className="mb-4 p-4 border rounded bg-card">
          <Select
            name="product_id"
            value={newSale.product_id || ''}
            onChange={handleInputChange}
            className="mb-2"
          >
            <option value="">Select a product</option>
            {inventory.map((item) => (
              <option key={item.id} value={item.id}>
                {item.product_name} - ${item.price.toFixed(2)} (Available: {item.quantity})
              </option>
            ))}
          </Select>
          <Input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={newSale.quantity || ''}
            onChange={handleInputChange}
            className="mb-2"
          />
          <Button
            onClick={handleAddSale}
            className="mt-2"
          >
            Add Sale
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
                Total
              </th>
              <th className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const product = inventory.find(item => item.id === sale.product_id);
              const total = sale.quantity * sale.price;
              return (
                <tr key={sale.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {product?.product_name}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {sale.quantity}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    ${sale.price.toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    ${total.toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;