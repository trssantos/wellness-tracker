import React, { useState, useEffect } from 'react';
import { ChevronDown, X, DollarSign, Tag } from 'lucide-react';
import { addTransaction, getFinanceData, getCategoriesByGroup } from '../../utils/financeUtils';

const QuickTransactionModal = ({ type = 'expense', onClose, onTransactionAdded }) => {
  // State variables
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [groupedCategories, setGroupedCategories] = useState({ income: {}, expense: {} });
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const financeData = getFinanceData();
    setCategories(financeData.categories);
    
    // Get categories grouped by their group attribute
    const grouped = getCategoriesByGroup();
    setGroupedCategories(grouped);
    
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
    className="modal-content max-w-md w-full bg-slate-800"
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
          
          
<div className="relative">
  <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
    <DollarSign size={18} />
  </div>
  <input
    id="amount"
    type="number"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="w-full pl-10 py-3 bg-slate-700 dark:bg-slate-700 text-white dark:text-white border border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
    placeholder="0.00"
    min="0.01"
    step="0.01"
    required
  />
</div>


<div className="relative">
  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
    <Tag size={18} />
  </div>
  <select
    id="category"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full pl-10 pr-10 py-3 bg-slate-700 dark:bg-slate-700 text-white dark:text-white border border-slate-600 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
    required
  >
    <option value="">Select a category</option>
    {type === 'income' ? (
      // Group income categories by their group
      Object.entries(groupedCategories.income).map(([group, cats]) => (
        <optgroup key={group} label={group}>
          {cats.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </optgroup>
      ))
    ) : (
      // Group expense categories by their group
      Object.entries(groupedCategories.expense).map(([group, cats]) => (
        <optgroup key={group} label={group}>
          {cats.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </optgroup>
      ))
    )}
  </select>
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
    <ChevronDown size={18} />
  </div>
</div>
          
          {/* Form Actions */}
          <div className="flex flex-col xs:flex-row justify-end gap-3 pt-2">
  <button
    type="button"
    onClick={onClose}
    className="w-full xs:w-auto mb-2 xs:mb-0 btn-secondary"
  >
    Cancel
  </button>
  <button
    type="submit"
    className={`w-full xs:w-auto px-4 py-2 rounded-lg font-medium text-white ${
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