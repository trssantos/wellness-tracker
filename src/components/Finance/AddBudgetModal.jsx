import React, { useState } from 'react';
import { Tag, DollarSign, FileText, FolderTree } from 'lucide-react';
import { 
  addBudget, getCategoriesFromConstants, getCategoryIconComponent,
  getCategoriesByGroup
} from '../../utils/financeUtils';
import ModalContainer from './ModalContainer';
import InputField from './InputField';

const AddBudgetModal = ({ onClose, onBudgetAdded, currency = '$' }) => {
  // State variables
  const [budgetType, setBudgetType] = useState('category'); // 'category' or 'group'
  const [category, setCategory] = useState('');
  const [categoryGroup, setCategoryGroup] = useState('');
  const [allocated, setAllocated] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  
  // Get categories and groups
  const categories = getCategoriesFromConstants();
  const categoryGroups = getCategoriesByGroup().expense;
  
  // Available groups array
  const groupsArray = Object.keys(categoryGroups).map(group => ({
    id: `group-${group.toLowerCase().replace(/\s+/g, '-')}`,
    name: group
  }));
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (budgetType === 'category' && !category) {
      setError('Please select a category');
      return;
    }
    
    if (budgetType === 'group' && !categoryGroup) {
      setError('Please select a category group');
      return;
    }
    
    if (!allocated || isNaN(parseFloat(allocated)) || parseFloat(allocated) <= 0) {
      setError('Budget amount must be a positive number');
      return;
    }
    
    try {
      // Determine the category ID based on the budget type
      const budgetCategoryId = budgetType === 'category' ? category : categoryGroup;
      
      // Create the budget
      const newBudget = addBudget({
        category: budgetCategoryId,
        allocated: parseFloat(allocated),
        spent: 0,
        notes,
        isGroupBudget: budgetType === 'group'
      });
      
      // Notify parent component
      if (onBudgetAdded) {
        onBudgetAdded(newBudget);
      } else {
        onClose();
      }
    } catch (error) {
      setError(`Failed to add budget: ${error.message}`);
    }
  };
  
  // Get selected category details
  const selectedCategory = categories.expense.find(cat => cat.id === category);
  const selectedGroup = groupsArray.find(group => group.id === categoryGroup);
  
  return (
    <ModalContainer title="Add New Budget" onClose={onClose}>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-2">
          <button
            type="button"
            onClick={() => setBudgetType('category')}
            className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
              budgetType === 'category'
                ? 'bg-amber-500 dark:bg-amber-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <Tag size={18} />
            <span>Category Budget</span>
          </button>
          
          <button
            type="button"
            onClick={() => setBudgetType('group')}
            className={`p-3 rounded-lg flex items-center justify-center gap-2 ${
              budgetType === 'group'
                ? 'bg-amber-500 dark:bg-amber-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            <FolderTree size={18} />
            <span>Group Budget</span>
          </button>
        </div>
        
        {/* Category Selection - show based on budget type */}
        {budgetType === 'category' ? (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Category
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-800 dark:text-slate-400 pointer-events-none">
                <Tag size={16} />
              </div>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-9 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                required
              >
                <option value="">Select a specific category</option>
                {/* Group categories by their group */}
                {(() => {
                  // Create groups from categories
                  const groups = {};
                  categories.expense.forEach(cat => {
                    const group = cat.group || 'Other';
                    if (!groups[group]) groups[group] = [];
                    groups[group].push(cat);
                  });
                  
                  return Object.entries(groups).map(([group, cats]) => (
                    <optgroup key={group} label={group}>
                      {cats.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </optgroup>
                  ));
                })()}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="categoryGroup" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Category Group
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-800 dark:text-slate-400 pointer-events-none">
                <FolderTree size={16} />
              </div>
              <select
                id="categoryGroup"
                value={categoryGroup}
                onChange={(e) => setCategoryGroup(e.target.value)}
                className="pl-9 w-full p-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                required
              >
                <option value="">Select a category group</option>
                {groupsArray.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        {/* Selected Category Preview */}
        {selectedCategory && (
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center gap-3">
            <div className={`p-2 rounded-md bg-${selectedCategory.color}-100 dark:bg-${selectedCategory.color}-900/50 text-${selectedCategory.color}-600 dark:text-${selectedCategory.color}-400`}>
              {getCategoryIconComponent(selectedCategory.id, 24)}
            </div>
            <div>
              <div className="text-slate-800 dark:text-white font-medium">{selectedCategory.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{selectedCategory.group || 'Other'} Category</div>
            </div>
          </div>
        )}
        
        {/* Selected Group Preview */}
        {selectedGroup && (
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <FolderTree size={24} />
            </div>
            <div>
              <div className="text-slate-800 dark:text-white font-medium">{selectedGroup.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Category Group</div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Includes all categories in the {selectedGroup.name} group
              </div>
            </div>
          </div>
        )}
        
        {/* Allocated Amount */}
        <div>
          <label htmlFor="allocated" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Notes (Optional)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-slate-800 dark:text-slate-400 pointer-events-none">
              <FileText size={16} />
            </div>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-10 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              placeholder="Add notes..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex flex-col xs:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full xs:w-auto mb-2 xs:mb-0 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full xs:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg"
          >
            Add Budget
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default AddBudgetModal;