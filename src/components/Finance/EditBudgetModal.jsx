import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign, FileText } from 'lucide-react';
import { updateBudget, getFinanceData, getCategoryById } from '../../utils/financeUtils';
import ModalContainer from './ModalContainer';
import InputField from './InputField';

const EditBudgetModal = ({ budget, onClose, onBudgetUpdated, currency = '$' }) => {
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
    <ModalContainer title="Edit Budget" onClose={onClose}>
      {error && (
        <div className="bg-red-900/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category (display only) */}
        <div>
          <label className="block text-sm font-medium text-white dark:text-white mb-2">
            Category
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <Tag size={18} />
            </div>
            <div className="w-full pl-10 py-3 bg-slate-700 dark:bg-slate-700 text-white dark:text-white border border-slate-600 dark:border-slate-600 rounded-lg">
              {categoryName}
            </div>
          </div>
        </div>
        
        {/* Budget Amount */}
        <div>
          <label htmlFor="allocated" className="block text-sm font-medium text-white dark:text-white mb-2">
            Budget Amount
          </label>
          <InputField
            icon={DollarSign}
            type="number"
            value={allocated}
            onChange={(e) => setAllocated(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Spent Amount */}
        <div>
          <label htmlFor="spent" className="block text-sm font-medium text-white dark:text-white mb-2">
            Spent Amount
          </label>
          <InputField
            icon={DollarSign}
            type="number"
            value={spent}
            onChange={(e) => setSpent(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        {/* Notes */}
        <div>
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
              placeholder="Add notes about this budget"
              rows="3"
            ></textarea>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default EditBudgetModal;