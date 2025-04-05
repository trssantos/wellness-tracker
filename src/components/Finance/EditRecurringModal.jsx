import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Tag, FileText, Bell, RepeatIcon, ChevronDown } from 'lucide-react';
import { updateRecurringTransaction, getCategoryById, getFinanceData } from '../../utils/financeUtils';
import ModalContainer from './ModalContainer';
import InputField from './InputField';

const EditRecurringModal = ({ recurring, onClose, onRecurringUpdated, currency = '$' }) => {
  // State variables
  const [name, setName] = useState(recurring.name || '');
  const [amount, setAmount] = useState(Math.abs(recurring.amount) || '');
  const [category, setCategory] = useState(recurring.category || '');
  const [startDate, setStartDate] = useState(recurring.startDate || '');
  const [nextDate, setNextDate] = useState(recurring.nextDate || '');
  const [frequency, setFrequency] = useState(recurring.frequency || 'monthly');
  const [notes, setNotes] = useState(recurring.notes || '');
  const [createReminder, setCreateReminder] = useState(recurring.createReminder !== false);
  const [reminderDays, setReminderDays] = useState(recurring.reminderDays || 3);
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
    
    if (!nextDate) {
      setError('Next date is required');
      return;
    }
    
    // Create updated recurring transaction object
    const updatedRecurring = {
      name: name.trim(),
      amount: recurring.amount >= 0 ? parseFloat(amount) : -parseFloat(amount),
      category,
      startDate,
      nextDate,
      frequency,
      notes: notes.trim(),
      createReminder,
      reminderDays: parseInt(reminderDays)
    };
    
    try {
      // Update recurring transaction
      updateRecurringTransaction(recurring.id, updatedRecurring);
      
      // Notify parent component
      if (onRecurringUpdated) {
        onRecurringUpdated();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to update recurring transaction: ${error.message}`);
    }
  };

  return (
    <ModalContainer title="Edit Recurring Transaction" onClose={onClose}>
      {error && (
        <div className="bg-red-900/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">
            Description
          </label>
          <InputField
            icon={FileText}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Monthly Rent"
            required
          />
        </div>
        
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">
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
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">
            Category
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <Tag size={18} />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-700 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-600 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              required
            >
              <option value="">Select a category</option>
              {recurring.amount >= 0 ? (
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
        
        {/* Next Date */}
        <div>
          <label htmlFor="nextDate" className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">
            Next Occurrence Date
          </label>
          <InputField
            icon={Calendar}
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            required
          />
        </div>
        
        {/* Frequency */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">
            Frequency
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <RepeatIcon size={18} />
            </div>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-700 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-600 dark:border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
        
        {/* Reminder Settings */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="createReminder" className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Bell size={16} className="text-amber-400" />
              <span>Create Reminder</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="createReminder"
                type="checkbox"
                checked={createReminder}
                onChange={() => setCreateReminder(!createReminder)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-400 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
            </label>
          </div>
          
          {createReminder && (
            <div className="p-3 bg-amber-900/30 rounded-lg border border-amber-800/50">
              <div className="flex items-center">
                <span className="text-sm text-slate-800 dark:text-slate-100 mr-2">Remind me</span>
                <select
                  value={reminderDays}
                  onChange={(e) => setReminderDays(e.target.value)}
                  className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="0">Same day</option>
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">1 week</option>
                </select>
                <span className="text-sm text-slate-800 dark:text-slate-100 ml-2">before due date</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">
            Notes (Optional)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
              <FileText size={18} />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-700 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              placeholder="Add notes about this recurring transaction"
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

export default EditRecurringModal;