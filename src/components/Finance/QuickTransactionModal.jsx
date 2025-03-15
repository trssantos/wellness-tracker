import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag } from 'lucide-react';
import { addTransaction, getFinanceData } from '../../utils/financeUtils';

const QuickTransactionModal = ({ type = 'expense', onClose, onTransactionAdded }) => {
  // State variables
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const financeData = getFinanceData();
    setCategories(financeData.categories);
    
    // Set default category if available
    if (type === 'income' && financeData.categories.income.length > 0) {
      setCategory(financeData.categories.income[0].id);
    } else if (type === 'expense' && financeData.categories.expense.length > 0) {
      setCategory(financeData.categories.expense[0].id);
    }
  }, [type]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    
    if (!category) {
      setError('Category is required');
      return;
    }
    
    // Create transaction object
    const transaction = {
      name: name.trim(),
      amount: type === 'expense' ? -parseFloat(amount) : parseFloat(amount),
      category,
      date: new Date().toISOString().split('T')[0],
      notes: '',
      timestamp: new Date().toISOString()
    };
    
    try {
      // Save transaction
      addTransaction(transaction);
      
      // Notify parent component
      if (onTransactionAdded) {
        onTransactionAdded();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to add transaction: ${error.message}`);
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
          <h3 className="modal-title">Quick {type === 'income' ? 'Income' : 'Expense'}</h3>
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder={`E.g., ${type === 'income' ? 'Paycheck' : 'Grocery shopping'}`}
              required
              autoFocus
            />
          </div>
          
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Amount
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
              />
              <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field pl-10 appearance-none"
                required
              >
                <option value="">Select a category</option>
                {type === 'income' ? (
                  categories.income && categories.income.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  categories.expense && categories.expense.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                )}
              </select>
              <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
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
              className={`px-4 py-2 rounded-lg font-medium text-white ${
                type === 'income'
                  ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                  : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
              }`}
            >
              Add {type === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default QuickTransactionModal;