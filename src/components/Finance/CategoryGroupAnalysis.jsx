import React, { useState } from 'react';
import { PieChart, BarChart2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getCategoryById, getCategoryIconComponent } from '../../utils/financeUtils';

const CategoryGroupAnalysis = ({ spendingByGroup, totalExpenses, currency = '$', compact = false }) => {
  const [expandedGroup, setExpandedGroup] = useState(null);
  
  // Format currency amounts
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };
  
  // Toggle group expansion
  const toggleGroup = (groupName) => {
    if (expandedGroup === groupName) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupName);
    }
  };
  
  // Get color for a category group
  const getGroupColor = (groupName) => {
    const colorMap = {
      'Housing': 'amber',
      'Food': 'green',
      'Transportation': 'blue',
      'Utilities': 'teal',
      'Shopping': 'pink',
      'Healthcare': 'rose',
      'Entertainment': 'purple',
      'Subscriptions': 'violet',
      'Personal': 'cyan',
      'Other': 'gray'
    };
    
    return colorMap[groupName] || 'gray';
  };
  
  if (!spendingByGroup || spendingByGroup.length === 0) {
    return (
      <div className="text-center p-6 text-slate-400">
        <PieChart size={48} className="text-slate-600 mx-auto mb-3" />
        <p>No expense data to analyze by category.</p>
      </div>
    );
  }
  
  // For compact view, limit to top 3 groups
  const groupsToShow = compact ? spendingByGroup.slice(0, 3) : spendingByGroup;
  
  return (
    <div className="space-y-4">
      {/* Category Group Breakdown Header */}
      {!compact && (
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={18} className="text-amber-400" />
          <h4 className="text-base font-medium text-white">Category Group Analysis</h4>
        </div>
      )}
      
      {/* Category Groups */}
      {groupsToShow.map((group) => {
        const isExpanded = expandedGroup === group.name;
        const groupColor = getGroupColor(group.name);
        const percentOfTotal = totalExpenses > 0 ? (group.total / totalExpenses) * 100 : 0;
        
        return (
          <div key={group.name} className={`finance-bg-${groupColor}-900/30 rounded-lg border finance-border-${groupColor}-800/50 overflow-hidden`}>
            {/* Group Header */}
            <div 
              className="p-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleGroup(group.name)}
            >
              <div>
                <h5 className="font-medium text-white text-sm sm:text-base">{group.name}</h5>
                <div className="text-xs text-slate-300">{Math.round(percentOfTotal)}% of total expenses</div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-bold text-white text-sm sm:text-base">{formatCurrency(group.total)}</div>
                  <div className="text-xs text-slate-300">
                    {group.subcategories.length} {group.subcategories.length === 1 ? 'category' : 'categories'}
                  </div>
                </div>
                
                {isExpanded ? 
                  <ChevronUp size={18} className="text-slate-400" /> : 
                  <ChevronDown size={18} className="text-slate-400" />
                }
              </div>
            </div>
            
            {/* Subcategories - Only show if expanded */}
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-slate-700/50 pt-3 space-y-3">
                {/* Subcategory breakdown mini chart */}
                <div className="h-8 bg-slate-700 rounded-full overflow-hidden flex">
                  {group.subcategories.map((subcat, index) => {
                    const subcatPercent = Math.max(5, (subcat.total / group.total) * 100);
                    const category = getCategoryById(subcat.id);
                    const color = category?.color || 'gray';
                    
                    return (
                      <div 
                        key={subcat.id} 
                        className={`h-full finance-bg-${color}-500 dark:finance-bg-${color}-600`}
                        style={{ width: `${subcatPercent}%` }}
                        title={`${subcat.name}: ${formatCurrency(subcat.total)}`}
                      ></div>
                    );
                  })}
                </div>
                
                {/* Subcategory list */}
                <div className="space-y-2 mt-3">
                  {group.subcategories.map((subcat) => {
                    const subcatPercent = (subcat.total / group.total) * 100;
                    
                    return (
                      <div key={subcat.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getCategoryIconComponent(subcat.id, 14)}
                          <span className="text-sm text-white">{subcat.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-white">{formatCurrency(subcat.total)}</div>
                          <div className="text-xs bg-slate-600 px-1.5 py-0.5 rounded-full text-slate-300 min-w-[36px] text-center">
                            {Math.round(subcatPercent)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Insights section */}
                {group.subcategories.length >= 2 && (
                  <div className="mt-3 bg-slate-700/30 p-3 rounded-lg text-sm border border-slate-600/30">
                    <p className="text-white">
                      <span className="font-medium">{group.subcategories[0].name}</span> is your biggest expense in this category
                      {group.subcategories.length > 2 && (
                        <>, accounting for {Math.round((group.subcategories[0].total / group.total) * 100)}% of your {group.name.toLowerCase()} spending</>
                      )}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      {/* View all link for compact mode */}
      {compact && spendingByGroup.length > 3 && (
        <div className="text-center">
          <button className="text-amber-400 hover:text-amber-300 text-sm inline-flex items-center">
            <span>View all {spendingByGroup.length} categories</span>
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryGroupAnalysis;