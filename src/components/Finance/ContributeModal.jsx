import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText } from 'lucide-react';
import { contributeSavingsGoal } from '../../utils/financeUtils';

const ContributeModal = ({ goal, onClose, onContribute }) => {
  // State variables
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

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
    <dialog 
      className="modal-base fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      open
    >
      <div 
        className="modal-content max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Contribute to {goal.name}</h3>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Current Progress</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Remaining</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                ${Math.max(0, goal.target - goal.current).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contribution Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contribution Amount
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-10"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
                autoFocus
              />
              <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium text-white bg-${goal.color || 'blue'}-500 hover:bg-${goal.color || 'blue'}-600 dark:bg-${goal.color || 'blue'}-600 dark:hover:bg-${goal.color || 'blue'}-700`}
            >
              Make Contribution
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default ContributeModal;