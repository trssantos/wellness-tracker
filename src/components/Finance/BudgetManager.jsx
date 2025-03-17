import React, { useState, useEffect } from 'react';
import { 
  Wallet, Edit, Trash2, Plus, AlertTriangle, Check, RefreshCw
} from 'lucide-react';
import { 
  getFinanceData, deleteBudget, updateBudget, calculateFinancialStats, 
  getCategoryById, getCategoryColor 
} from '../../utils/financeUtils';
import EditBudgetModal from './EditBudgetModal';
import ConfirmationModal from './ConfirmationModal';

const BudgetManager = ({ compact = false, refreshTrigger = 0, onRefresh, currency = '$' }) => {
  // State variables
  const [budgets, setBudgets] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch budgets on initial render and when refreshTrigger changes
  useEffect(() => {
    const financeData = getFinanceData();
    setBudgets(financeData.budgets);
    
    // Calculate financial stats and budget progress
    const stats = calculateFinancialStats('month');
    setStatsData(stats);
    setBudgetProgress(stats.budgets);
  }, [refreshTrigger]);

  // Handle delete budget
  const handleDeleteBudget = (budget) => {
    setConfirmDelete(budget);
  };

  // Confirm deletion
  const confirmDeleteBudget = () => {
    if (confirmDelete) {
      deleteBudget(confirmDelete.id);
      setConfirmDelete(null);
      if (onRefresh) onRefresh();
    }
  };

  // Handle edit budget
  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
  };

  // Handle edit complete
  const handleEditComplete = () => {
    setEditingBudget(null);
    if (onRefresh) onRefresh();
  };

  // Reset all budgets for the new month
  const handleResetBudgets = () => {
    if (window.confirm('This will reset the spent amount for all budgets to 0. Continue?')) {
      // Reset each budget's spent amount
      budgets.forEach(budget => {
        updateBudget(budget.id, { spent: 0 });
      });
      
      if (onRefresh) onRefresh();
    }
  };

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };

  // Calculate percentage of budget spent
  const calculatePercentage = (spent, allocated) => {
    return Math.min(100, Math.round((spent / allocated) * 100));
  };

  // If compact mode, show simplified view
  if (compact) {
    const displayBudgets = budgetProgress.slice(0, 4);
    
    return (
      <div className="bg-slate-700/50 dark:bg-slate-700/50 rounded-lg p-4 transition-all">
        <div className="space-y-4">
          {displayBudgets.length > 0 ? (
            displayBudgets.map((budget) => {
              const category = getCategoryById(budget.category);
              const percentage = calculatePercentage(budget.spent, budget.allocated);
              const isOverBudget = budget.spent > budget.allocated;
              const colorName = category ? category.color : 'gray';
              
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white dark:text-white">
                      {category ? category.name : budget.category}
                    </span>
                    <span className={`font-medium ${
                      isOverBudget 
                        ? 'text-red-400 dark:text-red-400' 
                        : 'text-white dark:text-white'
                    }`}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-600 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        isOverBudget 
                          ? 'bg-red-500 dark:bg-red-600' 
                          : `bg-${colorName}-500 dark:bg-${colorName}-600`
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-400 dark:text-slate-400 p-2">
              No budgets found
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-600 dark:border-slate-600">
          <div className="text-sm text-slate-400 dark:text-slate-400">
            <div className="font-medium text-white">
              Total Budget: {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.allocated, 0))}
            </div>
            <div className="text-slate-300">
              Spent: {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.spent, 0))} 
              ({Math.round((budgetProgress.reduce((sum, b) => sum + b.spent, 0) / 
                budgetProgress.reduce((sum, b) => sum + b.allocated, 0)) * 100)}%)
            </div>
          </div>
          <button 
            onClick={onRefresh}
            className="px-3 py-1.5 bg-amber-600 dark:bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-700 text-white rounded-lg text-sm"
          >
            View All
          </button>
        </div>
      </div>
    );
  }

  // Full budget management view
  return (
    <div className="space-y-4">
      {/* Budget Overview */}
      <div className="bg-slate-800 dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-700 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[250px] xs:min-w-[200px] bg-amber-900/30 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-800/50 dark:border-amber-800/50">
    {/* Card content */}
            <h5 className="font-medium text-white dark:text-white mb-1">Total Budget</h5>
            <div className="text-lg font-bold text-amber-300 dark:text-amber-300">
              {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.allocated, 0))}
            </div>
            <div className="text-sm text-slate-400 dark:text-slate-400 mt-1">
              {budgetProgress.length} budget categories
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px] bg-green-900/30 dark:bg-green-900/30 p-4 rounded-lg border border-green-800/50 dark:border-green-800/50">
            <h5 className="font-medium text-white dark:text-white mb-1">Total Spent</h5>
            <div className="text-lg font-bold text-green-300 dark:text-green-300">
              {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.spent, 0))}
            </div>
            <div className="text-sm text-slate-400 dark:text-slate-400 mt-1">
              {Math.round((budgetProgress.reduce((sum, b) => sum + b.spent, 0) / 
                budgetProgress.reduce((sum, b) => sum + b.allocated, 0)) * 100)}% of budget
            </div>
          </div>
          
          <div className="flex-1 min-w-[200px] bg-blue-900/30 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-800/50 dark:border-blue-800/50">
            <h5 className="font-medium text-white dark:text-white mb-1">Remaining</h5>
            <div className="text-lg font-bold text-blue-300 dark:text-blue-300">
              {formatCurrency(
                budgetProgress.reduce((sum, b) => sum + b.allocated, 0) - 
                budgetProgress.reduce((sum, b) => sum + b.spent, 0)
              )}
            </div>
            <div className="text-sm text-slate-400 dark:text-slate-400 mt-1">
              {budgetProgress.filter(b => b.spent > b.allocated).length} categories over budget
            </div>
          </div>
        </div>
        
        {/* Budget Categories */}
        <h5 className="font-medium text-white dark:text-white mb-4">Budget Categories</h5>
        
        <div className="space-y-6">
          {budgetProgress.length > 0 ? (
            budgetProgress.map((budget) => {
              const category = getCategoryById(budget.category);
              const percentage = calculatePercentage(budget.spent, budget.allocated);
              const isOverBudget = budget.spent > budget.allocated;
              const colorName = category ? category.color : 'gray';
              
              return (
                <div key={budget.id} className={`p-4 rounded-lg ${
                  isOverBudget 
                    ? 'bg-red-900/30 dark:bg-red-900/30 border border-red-800/50 dark:border-red-800/50' 
                    : `bg-${colorName}-900/30 dark:bg-${colorName}-900/30 border border-${colorName}-800/50 dark:border-${colorName}-800/50`
                }`}>
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h6 className="font-medium text-white dark:text-white">
                          {category ? category.name : budget.category}
                        </h6>
                        {isOverBudget && (
                          <span className="flex items-center gap-1 text-xs text-red-400 dark:text-red-400 font-medium">
                            <AlertTriangle size={14} />
                            Over Budget
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 dark:text-slate-400">
                        {budget.notes || 'No description'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditBudget(budget)}
                        className="p-1.5 rounded-lg bg-slate-700 dark:bg-slate-700 text-blue-400 dark:text-blue-400 hover:bg-blue-900/30 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit Budget"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget)}
                        className="p-1.5 rounded-lg bg-slate-700 dark:bg-slate-700 text-red-400 dark:text-red-400 hover:bg-red-900/30 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete Budget"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-end gap-2 mb-2">
                    <div className="w-full md:w-3/4">
                      <div className="h-4 bg-slate-700 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isOverBudget 
                              ? 'bg-red-500 dark:bg-red-600' 
                              : `bg-${colorName}-500 dark:bg-${colorName}-600`
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-1/4 text-right">
                      <span className={`text-lg font-bold ${
                        isOverBudget 
                          ? 'text-red-400 dark:text-red-400' 
                          : 'text-white dark:text-white'
                      }`}>
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 dark:text-slate-300">{percentage}% used</span>
                    <span className="text-slate-300 dark:text-slate-300">
                      {formatCurrency(budget.allocated - budget.spent)} remaining
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-8 bg-slate-700/50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-slate-400 dark:text-slate-400 mb-4">
                No budgets found. Create a budget to track your spending.
              </div>
              <button
                onClick={() => onRefresh()}
                className="px-4 py-2 bg-amber-600 dark:bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-700 text-white rounded-lg inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Budget
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Budget Modal */}
      {editingBudget && (
        <EditBudgetModal
          budget={editingBudget}
          onClose={() => setEditingBudget(null)}
          onBudgetUpdated={handleEditComplete}
          currency={currency}
        />
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Budget"
          message={`Are you sure you want to delete the "${getCategoryById(confirmDelete.category)?.name || confirmDelete.category}" budget (${formatCurrency(confirmDelete.allocated)})? This action cannot be undone.`}
          onConfirm={confirmDeleteBudget}
          onCancel={() => setConfirmDelete(null)}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default BudgetManager;