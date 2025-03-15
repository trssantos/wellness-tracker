import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign, FileText } from 'lucide-react';
import { addBudget, getFinanceData } from '../../utils/financeUtils';

const AddBudgetModal = ({ onClose, onBudgetAdded }) => {
  // State variables
  const [category, setCategory] = useState('');
  const [allocated, setAllocated] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState({ expense: [] });
  const [existingBudgets, setExistingBudgets] = useState([]);
  const [error, setError] = useState('');

  // Fetch categories and existing budgets on mount
  useEffect(() => {
    const financeData = getFinanceData();
    setCategories(financeData.categories);
    setExistingBudgets(financeData.budgets || []);
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!category) {
      setError('Category is required');
      return;
    }
    
    if (!allocated || isNaN(parseFloat(allocated)) || parseFloat(allocated) <= 0) {
      setError('Budget amount must be a positive number');
      return;
    }
    
    // Check if budget for this category already exists
    if (existingBudgets.some(b => b.category === category)) {
      setError('A budget for this category already exists');
      return;
    }
    
    // Create budget object
    const budget = {
      category,
      allocated: parseFloat(allocated),
      spent: 0,
      notes: notes.trim()
    };
    
    try {
      // Save budget
      addBudget(budget);
      
      // Notify parent component
      if (onBudgetAdded) {
        onBudgetAdded();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to add budget: ${error.message}`);
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
          <h3 className="modal-title">Add Budget</h3>
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
                {categories.expense && categories.expense.map(cat => (
                  <option 
                    key={cat.id} 
                    value={cat.id}
                    disabled={existingBudgets.some(b => b.category === cat.id)}
                  >
                    {cat.name} {existingBudgets.some(b => b.category === cat.id) ? '(Already budgeted)' : ''}
                  </option>
                ))}
              </select>
              <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Budget Amount */}
          <div>
            <label htmlFor="allocated" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Budget Amount
            </label>
            <div className="relative">
              <input
                id="allocated"
                type="number"
                value={allocated}
                onChange={(e) => setAllocated(e.target.value)}
                className="input-field pl-10"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
              <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <div className="relative">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="textarea-field pl-10"
                placeholder="Add notes about this budget"
                rows="3"
              ></textarea>
              <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
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
              className="btn-primary"
            >
              Add Budget
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddBudgetModal;