import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign, FileText, FolderTree } from 'lucide-react';
import { 
  addBudget, getCategoriesFromConstants, getCategoryIconComponent,
  getCategoriesByGroup
} from '../../utils/financeUtils';
import ModalContainer from './ModalContainer';

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
  
  // Reset category/group when switching budget types
  useEffect(() => {
    setCategory('');
    setCategoryGroup('');
  }, [budgetType]);
  
  return (
    <ModalContainer title="Add New Budget" onClose={onClose}>
      {error && (
        <div className="bg-red-900/30 text-red-400 p-3 rounded-lg mb-4">
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
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <FolderTree size={18} />
            <span>Group Budget</span>
          </button>
        </div>
        
        {/* Category Selection - show based on budget type */}
        {budgetType === 'category' ? (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-white mb-1">
              Select Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag size={16} className="text-slate-400" />
              </div>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-9 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
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
            <label htmlFor="categoryGroup" className="block text-sm font-medium text-white mb-1">
              Select Category Group
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FolderTree size={16} className="text-slate-400" />
              </div>
              <select
                id="categoryGroup"
                value={categoryGroup}
                onChange={(e) => setCategoryGroup(e.target.value)}
                className="pl-9 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
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
          <div className="p-3 rounded-lg bg-slate-700/50 flex items-center gap-3">
            <div className={`p-2 rounded-md bg-${selectedCategory.color}-900/50 text-${selectedCategory.color}-400`}>
              {getCategoryIconComponent(selectedCategory.id, 24)}
            </div>
            <div>
              <div className="text-white font-medium">{selectedCategory.name}</div>
              <div className="text-xs text-slate-400">{selectedCategory.group || 'Other'} Category</div>
            </div>
          </div>
        )}
        
        {/* Selected Group Preview */}
        {selectedGroup && (
          <div className="p-3 rounded-lg bg-slate-700/50 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-900/50 text-blue-400">
              <FolderTree size={24} />
            </div>
            <div>
              <div className="text-white font-medium">{selectedGroup.name}</div>
              <div className="text-xs text-slate-400">Category Group</div>
              <div className="text-xs text-amber-400 mt-1">
                Includes all categories in the {selectedGroup.name} group
              </div>
            </div>
          </div>
        )}
        
        {/* Allocated Amount */}
        <div>
          <label htmlFor="allocated" className="block text-sm font-medium text-white mb-1">
            Budget Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              id="allocated"
              value={allocated}
              onChange={(e) => setAllocated(e.target.value)}
              className="pl-9 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-white mb-1">
            Notes (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="pl-9 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
              placeholder="Add notes..."
            />
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
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
          >
            Add Budget
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};

export default AddBudgetModal;