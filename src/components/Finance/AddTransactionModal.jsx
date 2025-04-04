import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { addTransaction, getFinanceData } from '../../utils/financeUtils';

const AddTransactionModal = ({ onClose, onTransactionAdded }) => {
  // State variables
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(formatDateForStorage(new Date()));
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [error, setError] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const financeData = getFinanceData();
    setCategories(financeData.categories);
  }, []);

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
      date,
      notes: notes.trim(),
      timestamp: new Date(date).toISOString()
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
        className="modal-content max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">Add Transaction</h3>
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
        
        <form onSubmit={handleSubmit}>
          {/* Transaction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-3 rounded-lg flex items-center justify-center gap-2 ${
                  type === 'income'
                    ? 'bg-green-500 dark:bg-green-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <TrendingUp size={18} />
                <span>Income</span>
              </button>
              
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-3 rounded-lg flex items-center justify-center gap-2 ${
                  type === 'expense'
                    ? 'bg-red-500 dark:bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <TrendingDown size={18} />
                <span>Expense</span>
              </button>
            </div>
          </div>
          
          {/* Transaction Description */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder="E.g., Grocery shopping"
                required
              />
              <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Amount */}
          <div className="mb-4">
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
          <div className="mb-4">
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
                <optgroup label="Income">
                  {categories.income && categories.income.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Expense">
                  {categories.expense && categories.expense.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </optgroup>
              </select>
              <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Date */}
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date
            </label>
            <div className="relative">
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field pl-10"
                required
              />
              <Calendar className="absolute left-3 top-3 text-slate-700 dark:text-slate-300" size={18} />
            </div>
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea-field"
              placeholder="Add more details about this transaction"
              rows="3"
            ></textarea>
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

export default AddTransactionModal;