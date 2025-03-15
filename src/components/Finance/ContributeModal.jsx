import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText } from 'lucide-react';
import { contributeSavingsGoal } from '../../utils/financeUtils';
import ModalContainer from './ModalContainer';
import InputField from './InputField';

const ContributeModal = ({ goal, onClose, onContribute, currency = '$' }) => {
  // State variables
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Contribution amount must be a positive number');
      return;
    }
    
    try {
      // Contribute to the goal
      const updatedGoal = contributeSavingsGoal(goal.id, parseFloat(amount));
      
      // Notify parent component
      if (onContribute) {
        onContribute(goal.id, parseFloat(amount));
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to contribute to goal: ${error.message}`);
    }
  };

  return (
    <ModalContainer title={`Contribute to ${goal.name}`} onClose={onClose}>
      {error && (
        <div className="bg-red-900/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="p-4 rounded-lg bg-slate-700/50 dark:bg-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-sm text-slate-400 dark:text-slate-400">Current Progress</div>
            <div className="text-lg font-bold text-white dark:text-white">
              {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 dark:text-slate-400">Remaining</div>
            <div className="text-lg font-bold text-white dark:text-white">
              {formatCurrency(Math.max(0, goal.target - goal.current))}
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contribution Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white dark:text-white mb-2">
            Contribution Amount
          </label>
          <InputField
            icon={DollarSign}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            autoFocus
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex flex-col xs:flex-row justify-end gap-3 pt-2">
  <button
    type="button"
    onClick={onClose}
    className="w-full xs:w-auto mb-2 xs:mb-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
  >
    Cancel
  </button>
  <button
    type="submit"
    className={`w-full xs:w-auto px-4 py-2 rounded-lg font-medium text-white finance-bg-${goal.color || 'blue'}-600 hover:finance-bg-${goal.color || 'blue'}-700 dark:finance-bg-${goal.color || 'blue'}-600 dark:hover:finance-bg-${goal.color || 'blue'}-700`}
  >
    Make Contribution
  </button>
</div>
      </form>
    </ModalContainer>
  );
};

export default ContributeModal;