import React, { useState, useEffect } from 'react';
import { 
  Calendar, DollarSign, Tag, FileText, TrendingUp, TrendingDown, 
  Bell, RepeatIcon, ChevronDown
} from 'lucide-react';
import ModalContainer from './ModalContainer';
import InputField from './InputField';
import { getFinanceData, addTransaction, addRecurringTransaction } from '../../utils/financeUtils';

const TransactionModal = ({ onClose, onTransactionAdded }) => {
  // State variables
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [error, setError] = useState('');
  
  // Recurring transaction options
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [createReminder, setCreateReminder] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);

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
    
    try {
      if (isRecurring) {
        // Create recurring transaction
        const recurring = {
          name: name.trim(),
          amount: type === 'expense' ? -parseFloat(amount) : parseFloat(amount),
          category,
          startDate: date,
          frequency,
          notes: notes.trim(),
          createReminder,
          reminderDays: parseInt(reminderDays)
        };
        
        addRecurringTransaction(recurring);
      } else {
        // Create regular transaction
        const transaction = {
          name: name.trim(),
          amount: type === 'expense' ? -parseFloat(amount) : parseFloat(amount),
          category,
          date,
          notes: notes.trim(),
          timestamp: new Date(date).toISOString()
        };
        
        addTransaction(transaction);
      }
      
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
    <ModalContainer title={`${isRecurring ? 'Add Recurring' : 'Add'} Transaction`} onClose={onClose}>
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
        
        {/* Recurring Switch */}
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-medium text-white dark:text-white flex items-center gap-2">
            <RepeatIcon size={16} className="text-slate-400" />
            <span>Recurring Transaction</span>
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={() => setIsRecurring(!isRecurring)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-400 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
          </label>
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
            placeholder={type === 'income' ? "E.g., Salary payment" : "E.g., Grocery shopping"}
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
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
        
        {/* Date */}
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-white dark:text-white mb-2">
            {isRecurring ? 'Start Date' : 'Date'}
          </label>
          <InputField
            icon={Calendar}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        {/* Recurring Options */}
        {isRecurring && (
          <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <RepeatIcon size={16} className="text-amber-400" />
              <span>Recurring Options</span>
            </h4>
            
            {/* Frequency */}
            <div className="mb-3">
              <label className="block text-sm text-slate-300 mb-2">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
            
            {/* Create Reminder */}
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Bell size={16} className="text-amber-400" />
                <span>Create Reminder</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={createReminder}
                  onChange={() => setCreateReminder(!createReminder)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-400 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>
            
            {/* Reminder Days */}
            {createReminder && (
              <div className="flex items-center mb-3">
                <span className="text-sm text-slate-300 mr-2">Remind me</span>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="0">Same day</option>
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">1 week</option>
                </select>
                <span className="text-sm text-slate-300 ml-2">before due date</span>
              </div>
            )}
          </div>
        )}
        
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
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              type === 'income'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isRecurring ? 'Add Recurring' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default TransactionModal;