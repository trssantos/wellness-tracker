import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { updateTransaction, getFinanceData, getCategoryById } from '../../utils/financeUtils';

const EditTransactionModal = ({ transaction, onClose, onTransactionUpdated }) => {
  // State variables
  const [name, setName] = useState(transaction.name || '');
  const [amount, setAmount] = useState(Math.abs(transaction.amount) || '');
  const [type, setType] = useState(transaction.amount >= 0 ? 'income' : 'expense');
  const [category, setCategory] = useState(transaction.category || '');
  const [date, setDate] = useState(transaction.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(transaction.notes || '');
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
    
    // Create updated transaction object
    const updatedTransaction = {
      name: name.trim(),
      amount: type === 'expense' ? -parseFloat(amount) : parseFloat(amount),
      category,
      date,
      notes: notes.trim()
    };
    
    try {
      // Update transaction
      updateTransaction(transaction.id, updatedTransaction);
      
      // Notify parent component
      if (onTransactionUpdated) {
        onTransactionUpdated();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to update transaction: ${error.message}`);
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
          <h3 className="modal-title">Edit Transaction</h3>
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
              <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
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
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default EditTransactionModal;