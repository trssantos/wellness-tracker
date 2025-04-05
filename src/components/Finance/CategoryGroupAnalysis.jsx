import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ShoppingCart, Utensils, Home, Car } from 'lucide-react';
import { getCategoryIconComponent, getCategoryById } from '../../utils/financeUtils';

// Category color map with light and dark mode variants
const CATEGORY_COLORS = {
  'Food': 'bg-emerald-100/80 dark:bg-emerald-800/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/40',
  'Housing': 'bg-amber-100/80 dark:bg-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-800/40',
  'Transportation': 'bg-purple-100/80 dark:bg-purple-800/30 hover:bg-purple-100 dark:hover:bg-purple-800/40',
  'Utilities': 'bg-blue-100/80 dark:bg-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-800/40',
  'Shopping': 'bg-pink-100/80 dark:bg-pink-800/30 hover:bg-pink-100 dark:hover:bg-pink-800/40',
  'Entertainment': 'bg-indigo-100/80 dark:bg-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/40',
  'Healthcare': 'bg-red-100/80 dark:bg-red-800/30 hover:bg-red-100 dark:hover:bg-red-800/40',
  'Personal': 'bg-cyan-100/80 dark:bg-cyan-800/30 hover:bg-cyan-100 dark:hover:bg-cyan-800/40',
  'Education': 'bg-violet-100/80 dark:bg-violet-800/30 hover:bg-violet-100 dark:hover:bg-violet-800/40',
  'Other': 'bg-gray-100/80 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/40',
};

// Progress bar colors for both modes
const PROGRESS_BAR_COLORS = {
  'Food': 'bg-emerald-500',
  'Housing': 'bg-amber-500',
  'Transportation': 'bg-purple-500',
  'Utilities': 'bg-blue-500',
  'Shopping': 'bg-pink-500',
  'Entertainment': 'bg-indigo-500',
  'Healthcare': 'bg-red-500',
  'Personal': 'bg-cyan-500',
  'Education': 'bg-violet-500',
  'Other': 'bg-gray-500',
};

// Subcategory backgrounds for both modes
const SUBCATEGORY_BG = 'bg-gray-200/80 dark:bg-slate-600/80';

const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || 'bg-gray-100/80 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/40';
};

const getProgressBarColor = (category) => {
  return PROGRESS_BAR_COLORS[category] || 'bg-blue-500';
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food':
      return <ShoppingCart size={18} />;
    case 'Housing':
      return <Home size={18} />;
    case 'Transportation':
      return <Car size={18} />;
    case 'Dining Out':
      return <Utensils size={18} />;
    default:
      return null;
  }
};

const CategoryGroupAnalysis = ({ 
  spendingByGroup, 
  totalExpenses, 
  currency = '€', 
  compact = false 
}) => {
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});

  // Format currency
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Get percentage of total expenses
  const getPercentage = (amount) => {
    return totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
  };

  // Sort groups by amount spent (descending)
  const sortedGroups = [...spendingByGroup].sort((a, b) => b.total - a.total);

  // Limit to top categories if compact view
  const displayGroups = compact ? sortedGroups.slice(0, 3) : sortedGroups;

  return (
    <div className="space-y-2">
      {displayGroups.map(group => {
        const isExpanded = expandedCategories[group.name] || false;
        const percentage = getPercentage(group.total);
        const categoryColor = getCategoryColor(group.name);
        const progressBarColor = getProgressBarColor(group.name);
        const categoryIcon = getCategoryIcon(group.name);
        const subcategoryCount = group.subcategories.length;
        
        return (
          <div 
            key={group.name} 
            className={`rounded-lg overflow-hidden transition-all ${categoryColor}`}
          >
            {/* Category Header */}
            <div 
              className="flex items-center justify-between p-3 cursor-pointer"
              onClick={() => toggleCategory(group.name)}
            >
              <div className="flex items-center gap-2 text-gray-800 dark:text-white">
                {categoryIcon}
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">{group.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-300">{percentage}% of total expenses • {subcategoryCount} {subcategoryCount === 1 ? 'category' : 'categories'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 dark:text-white">{formatCurrency(group.total)}</span>
                {!compact && (
                  isExpanded ? 
                  <ChevronUp size={16} className="text-gray-600 dark:text-slate-300" /> : 
                  <ChevronDown size={16} className="text-gray-600 dark:text-slate-300" />
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-white dark:bg-slate-700">
              <div 
                className={`h-full ${progressBarColor}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            {/* Subcategories */}
            {isExpanded && (
              <div className="divide-y divide-white/30 dark:divide-slate-700/30">
                {group.subcategories.map(subcat => {
                  const subcatPercentage = Math.round((subcat.total / group.total) * 100);
                  const subcategory = getCategoryById(subcat.id);
                  
                  return (
                    <div key={subcat.id} className={`flex items-center justify-between px-3 py-2 ${SUBCATEGORY_BG}`}>
                      <div className="flex items-center gap-2 text-gray-800 dark:text-white">
                        {getCategoryIconComponent(subcat.id, 16)}
                        <span className="text-sm text-gray-800 dark:text-white">{subcat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{formatCurrency(subcat.total)}</span>
                        <span className="text-xs text-gray-600 dark:text-slate-300">{subcatPercentage}%</span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Category Insight */}
                {group.subcategories.length > 0 && (
                  <div className="p-3 bg-slate-300/50 dark:bg-slate-600/50 text-sm text-gray-700 dark:text-slate-200">
                    {group.subcategories[0].name} is your biggest expense in this category.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Show message if no data */}
      {displayGroups.length === 0 && (
        <div className="text-center p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
          <p className="text-gray-600 dark:text-slate-300">No spending data available.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryGroupAnalysis;