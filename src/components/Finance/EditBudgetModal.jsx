import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign, FileText } from 'lucide-react';
import { updateBudget, getFinanceData, getCategoryById } from '../../utils/financeUtils';

const EditBudgetModal = ({ budget, onClose, onBudgetUpdated }) => {
  // State variables
  const [category, setCategory] = useState(budget.category || '');
  const [allocated, setAllocated] = useState(budget.allocated || '');
  const [spent, setSpent] = useState(budget.spent || 0);
  const [notes, setNotes] = useState(budget.notes || '');
  const [categories, setCategories] = useState({ expense: [] });
  const [error, setError] = useState('');
  const [categoryName, setCategoryName] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    const financeData = getFinanceData();
    setCategories(financeData.categories);
    
    // Get category name
    const cat = getCategoryById(budget.category);
    if (cat) {
      setCategoryName(cat.name);
    }
  }, [budget.category]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!allocated || isNaN(parseFloat(allocated)) || parseFloat(allocated) <= 0) {
      setError('Budget amount must be a positive number');
      return;
    }
    
    // Create updated budget object
    const updatedBudget = {
      ...budget,
      allocated: parseFloat(allocated),
      spent: parseFloat(spent),
      notes: notes.trim()
    };
    
    try {
      // Update budget
      updateBudget(budget.id, updatedBudget);
      
      // Notify parent component
      if (onBudgetUpdated) {
        onBudgetUpdated();
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to update budget: ${error.message}`);
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
          <h3 className="modal-title">Edit Budget</h3>
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
          {/* Category (display only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category
            </label>
            <div className="input-field pl-10 bg-slate-50 dark:bg-slate-600 relative flex items-center">
              <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
              <span>{categoryName}</span>
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
          
          {/* Spent Amount */}
          <div>
            <label htmlFor="spent" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Spent Amount
            </label>
            <div className="relative">
              <input
                id="spent"
                type="number"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
                className="input-field pl-10"
                placeholder="0.00"
                min="0"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default EditBudgetModal;