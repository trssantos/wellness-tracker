import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { updateTransaction, getFinanceData, getCategoryById } from '../../utils/financeUtils';
import ModalContainer from './ModalContainer';
import InputField from './InputField';
import { formatDateForStorage } from '../../utils/dateUtils';

const EditTransactionModal = ({ transaction, onClose, onTransactionUpdated, currency = '$' }) => {
  // State variables
  const [name, setName] = useState(transaction.name || '');
  const [amount, setAmount] = useState(Math.abs(transaction.amount) || '');
  const [type, setType] = useState(transaction.amount >= 0 ? 'income' : 'expense');
  const [category, setCategory] = useState(transaction.category || '');
  const [date, setDate] = useState(transaction.date || formatDateForStorage(new Date()));
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
    <ModalContainer title="Edit Transaction" onClose={onClose}>
      {error && (
        <div className="bg-red-900/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white dark:text-white mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-3 rounded-lg flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-green-600 dark:bg-green-600 text-white'
                  : 'bg-slate-700 dark:bg-slate-700 text-slate-300 dark:text-slate-300'
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
                  ? 'bg-red-600 dark:bg-red-600 text-white'
                  : 'bg-slate-700 dark:bg-slate-700 text-slate-300 dark:text-slate-300'
              }`}
            >
              <TrendingDown size={18} />
              <span>Expense</span>
            </button>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-white dark:text-white mb-2">
            Description
          </label>
          <InputField
            icon={FileText}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Grocery shopping"
            required
          />
        </div>
        
        {/* Amount */}
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-white dark:text-white mb-2">
            Amount
          </label>
          <InputField
            icon={DollarSign}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Category */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-white dark:text-white mb-2">
            Category
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <Tag size={18} />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-700 dark:bg-slate-700 text-white dark:text-white border border-slate-600 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
        
        {/* Date */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-white dark:text-white mb-2">
            Date
          </label>
          <InputField
            icon={Calendar}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-white dark:text-white mb-2">
            Notes (Optional)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
              <FileText size={18} />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-700 dark:bg-slate-700 text-white dark:text-white border border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              placeholder="Add more details about this transaction"
              rows="3"
            ></textarea>
          </div>
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
    className="w-full xs:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
  >
    Save Changes
  </button>
</div>
      </form>
    </ModalContainer>
  );
};

export default EditTransactionModal;