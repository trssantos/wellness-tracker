import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, TrendingUp, TrendingDown, Bell, AlertCircle } from 'lucide-react';
import { addRecurringTransaction, getFinanceData } from '../../utils/financeUtils';

const AddRecurringModal = ({ onClose, onRecurringAdded }) => {
  // State variables
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState('monthly');
  const [notes, setNotes] = useState('');
  const [createReminder, setCreateReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
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
    
    if (!startDate) {
      setError('Start date is required');
      return;
    }
    
    // Create recurring transaction object
    const recurring = {
      name: name.trim(),
      amount: type === 'expense' ? -parseFloat(amount) : parseFloat(amount),
      category,
      startDate,
      frequency,
      notes: notes.trim(),
      createReminder,
      reminderDays: parseInt(reminderDays)
    };
    
    try {
      // Save recurring transaction
      addRecurringTransaction(recurring);
      
      // Notify parent component
      if (onRecurringAdded) {
        onRecurringAdded();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to add recurring transaction: ${error.message}`);
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
          <h3 className="modal-title">Add Recurring Transaction</h3>
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
                placeholder={type === 'income' ? "E.g., Salary payment" : "E.g., Rent payment"}
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
                {type === 'income' ? (
                  <optgroup label="Income">
                    {categories.income && categories.income.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </optgroup>
                ) : (
                  <optgroup label="Expense">
                    {categories.expense && categories.expense.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field pl-10"
                  required
                />
                <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
              </div>
            </div>
            
            {/* Frequency */}
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="input-field"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          
          {/* Reminder Settings */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="createReminder" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Create Reminder
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="createReminder"
                  type="checkbox"
                  checked={createReminder}
                  onChange={() => setCreateReminder(!createReminder)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>
            
            {createReminder && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-start mb-3">
                  <Bell size={18} className="text-amber-500 dark:text-amber-400 mt-0.5 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Reminder Settings
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      A task will be created in your daily checklist to remind you of this {type} transaction.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="reminderDays" className="text-sm text-slate-700 dark:text-slate-300 mr-3">
                    Remind me
                  </label>
                  <select
                    id="reminderDays"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(e.target.value)}
                    className="py-1 px-2 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded"
                  >
                    <option value="0">Same day</option>
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">1 week</option>
                  </select>
                  <span className="text-sm text-slate-700 dark:text-slate-300 ml-2">before due date</span>
                </div>
              </div>
            )}
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
              placeholder="Add more details about this recurring transaction"
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
              className={`px-4 py-2 rounded-lg font-medium text-white ${
                type === 'income'
                  ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
                  : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
              }`}
            >
              Add Recurring {type === 'income' ? 'Income' : 'Expense'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddRecurringModal;