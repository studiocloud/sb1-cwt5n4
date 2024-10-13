import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "./ui/button";

const Account: React.FC = () => {
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetData = async () => {
    setIsResetting(true);
    setResetMessage('');

    try {
      // Delete all sales records
      const { error: salesError } = await supabase
        .from('sales')
        .delete()
        .not('id', 'is', null);

      if (salesError) throw salesError;

      // Delete all inventory records
      const { error: inventoryError } = await supabase
        .from('inventory')
        .delete()
        .not('id', 'is', null);

      if (inventoryError) throw inventoryError;

      setResetMessage('All data has been successfully reset.');
    } catch (error: any) {
      console.error('Error resetting data:', error);
      setResetMessage(`Failed to reset data: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md">
        <p className="mb-4">Email: {user?.email}</p>
        <h2 className="text-xl font-semibold mb-2">Reset Data</h2>
        <p className="mb-4">Warning: This action will delete all sales and inventory data. This cannot be undone.</p>
        <Button
          variant="destructive"
          onClick={handleResetData}
          disabled={isResetting}
        >
          {isResetting ? 'Resetting...' : 'Reset All Data'}
        </Button>
        {resetMessage && (
          <p className={`mt-4 ${resetMessage.includes('Failed') ? 'text-destructive' : 'text-green-500'}`}>
            {resetMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default Account;