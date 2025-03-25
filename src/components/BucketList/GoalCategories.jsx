import React, { useState, useEffect } from 'react';
import { Plus, Mountain, Brain, Dumbbell, Briefcase, Wallet, Sparkles, Star, Edit, Check, Trash2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../utils/bucketListUtils';

const GoalCategories = ({ selectedCategory, onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Load categories on component mount
  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
  }, []);
  
  // Get icon based on category id
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'experiences': return <Mountain size={18} className="text-purple-500" />;
      case 'personal': return <Brain size={18} className="text-blue-500" />;
      case 'fitness': return <Dumbbell size={18} className="text-green-500" />;
      case 'career': return <Briefcase size={18} className="text-amber-500" />;
      case 'finance': return <Wallet size={18} className="text-emerald-500" />;
      case 'creative': return <Sparkles size={18} className="text-rose-500" />;
      default: return <Star size={18} className="text-slate-500" />;
    }
  };
  
  // Handle save category
  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) return;
    
    if (editingCategory) {
      // Update existing
      const updated = updateCategory(editingCategory.id, { name: newCategoryName });
      setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
    } else {
      // Create new
      const newCategory = createCategory({ name: newCategoryName });
      setCategories([...categories, newCategory]);
    }
    
    // Reset form
    setNewCategoryName('');
    setEditingCategory(null);
    setIsAddingNew(false);
  };
  
  // Handle delete category
  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? Goals in this category will become uncategorized.')) {
      deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      
      // If the deleted category was selected, switch to "all"
      if (selectedCategory === categoryId) {
        onSelectCategory('all');
      }
    }
  };
  
  // Start editing a category
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setIsAddingNew(true);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-slate-800 dark:text-slate-200">Categories</h3>
        {!isAddingNew && (
          <button 
            onClick={() => {
              setIsAddingNew(true);
              setEditingCategory(null);
              setNewCategoryName('');
            }}
            className="text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300"
          >
            <Plus size={18} />
          </button>
        )}
      </div>
      
      {isAddingNew && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
          <input 
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name..."
            className="w-full p-2 mb-2 border border-amber-200 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingCategory(null);
              }}
              className="text-slate-500 dark:text-slate-400 text-sm px-2 py-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCategory}
              className="bg-amber-500 dark:bg-amber-600 text-white text-sm px-3 py-1 rounded-lg flex items-center gap-1"
            >
              <Check size={14} />
              Save
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        {/* All Categories option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full flex items-center gap-2 p-2 text-left rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
            <Star size={14} className="text-slate-600 dark:text-slate-300" />
          </div>
          <span className="text-sm font-medium">All Goals</span>
        </button>
        
        {/* Category list */}
        {categories.map(category => (
          <div key={category.id} className="group relative">
            <button
              onClick={() => onSelectCategory(category.id)}
              className={`w-full flex items-center gap-2 p-2 text-left rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                {getCategoryIcon(category.id)}
              </div>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
            
            {/* Edit/Delete buttons on hover */}
            <div className="absolute right-2 top-2 hidden group-hover:flex bg-white dark:bg-slate-800 rounded-lg shadow-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCategory(category);
                }}
                className="p-1 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(category.id);
                }}
                className="p-1 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalCategories;