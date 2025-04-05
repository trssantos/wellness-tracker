import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Edit, Trash2, Plus, AlertTriangle, Check, RefreshCw,
  ChevronLeft, ChevronRight, Calendar, ChevronUp, ChevronDown, FolderTree
} from 'lucide-react';
import { 
  getFinanceData, deleteBudget, updateBudget, calculateFinancialStats, 
  getCategoryById, getCategoryColor, getCurrentMonthKey, formatMonthKey,
  getBudgetDisplayName, getCategoryIconComponent, getGroupNameFromId
} from '../../utils/financeUtils';
import EditBudgetModal from './EditBudgetModal';
import ConfirmationModal from './ConfirmationModal';
import BudgetTransactionsModal from './BudgetTransactionsModal';

const BudgetManager = ({ compact = false, refreshTrigger = 0, onRefresh, currency = '$' }) => {
  // State variables
  const [budgets, setBudgets] = useState([]);
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [editingBudget, setEditingBudget] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [viewingBudget, setViewingBudget] = useState(null);
  
  // Month picker state
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const monthPickerRef = useRef(null);

  // Fetch budgets on initial render and when refreshTrigger changes
  useEffect(() => {
    const financeData = getFinanceData();
    
    // Get the current month key
    const currentMonth = financeData.currentBudgetMonth || getCurrentMonthKey();
    
    // Set initially selected month (current month)
    if (!selectedMonth) {
      setSelectedMonth(currentMonth);
      // Set initial picker year
      const [year] = currentMonth.split('-').map(Number);
      setPickerYear(year);
    }
    
    // Check if selected month is current month
    setIsCurrentMonth(selectedMonth === currentMonth);
    
    // Get months with budget data for highlighting in UI
    const monthsWithData = financeData.budgetHistory ? Object.keys(financeData.budgetHistory).sort() : [];
    setAvailableMonths(monthsWithData);
    
    // Get budgets for the selected month (may be empty)
    const monthBudgets = financeData.budgetHistory && financeData.budgetHistory[selectedMonth] 
      ? financeData.budgetHistory[selectedMonth] 
      : (selectedMonth === currentMonth && financeData.budgets && financeData.budgets.length > 0) 
        ? financeData.budgets 
        : [];
    
    setBudgets(monthBudgets);
    
    // Calculate financial stats
    const stats = calculateFinancialStats('month');
    setStatsData(stats);
    
    // If viewing current month, use calculated budget progress
    // Otherwise use historical data directly
    if (selectedMonth === currentMonth) {
      setBudgetProgress(stats.budgets);
    } else {
      // For historical data, use values directly
      setBudgetProgress(monthBudgets.map(budget => ({
        ...budget,
        remaining: budget.allocated - budget.spent,
        percentage: Math.min(100, Math.round((budget.spent / budget.allocated) * 100))
      })));
    }
  }, [refreshTrigger, selectedMonth]);

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Parse month key to Date object
  const getMonthDate = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1);
  };
  
  // Generate month key from Date
  const getMonthKey = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Navigate to previous month
  const handlePreviousMonth = () => {
    // Get current selected month as a date
    const currentDate = getMonthDate(selectedMonth);
    
    // Go to previous month
    currentDate.setMonth(currentDate.getMonth() - 1);
    
    // Convert back to month key format
    setSelectedMonth(getMonthKey(currentDate));
    setPickerYear(currentDate.getFullYear()); // Update picker year
  };

  // Navigate to next month
  const handleNextMonth = () => {
    // Get current selected month as a date
    const currentDate = getMonthDate(selectedMonth);
    
    // Go to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    
    // Convert back to month key format
    const nextMonth = getMonthKey(currentDate);
    
    // Don't allow navigating past current month
    const currentMonthKey = getCurrentMonthKey();
    if (nextMonth <= currentMonthKey) {
      setSelectedMonth(nextMonth);
      setPickerYear(currentDate.getFullYear()); // Update picker year
    }
  };

  // Handle year navigation in picker
  const handlePreviousYear = () => {
    setPickerYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    if (pickerYear < currentYear) {
      setPickerYear(prev => prev + 1);
    }
  };

  // Handle month selection from picker
  const handleSelectMonth = (month) => {
    const newMonthKey = `${pickerYear}-${(month + 1).toString().padStart(2, '0')}`;
    const currentMonthKey = getCurrentMonthKey();
    
    // Only select if not in the future
    if (newMonthKey <= currentMonthKey) {
      setSelectedMonth(newMonthKey);
      setShowMonthPicker(false);
    }
  };

  // Handle budget click
  const handleBudgetClick = (budget) => {
    setViewingBudget(budget);
  };

  // Handle delete budget
  const handleDeleteBudget = (budget) => {
    setConfirmDelete(budget);
  };

  // Confirm deletion
  const confirmDeleteBudget = () => {
    if (confirmDelete) {
      deleteBudget(confirmDelete.id, selectedMonth);
      setConfirmDelete(null);
      if (onRefresh) onRefresh();
    }
  };

  // Handle edit budget
  const handleEditBudget = (budget) => {
    setEditingBudget({...budget, monthKey: selectedMonth});
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
        updateBudget(budget.id, { spent: 0 }, selectedMonth);
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

  // Check if a month has budget data
  const hasDataForMonth = (monthKey) => {
    return availableMonths.includes(monthKey);
  };

  // Get category color class based on color name
  const getCategoryStyleClasses = (category, isOverBudget = false, isGroupBudget = false) => {
    // Default styles
    let bgClass = 'bg-amber-100 dark:bg-amber-900/30';
    let borderClass = 'border-amber-200 dark:border-amber-800/50';
    let progressClass = 'bg-amber-500 dark:bg-amber-600';
    
    if (isOverBudget) {
      return {
        bgClass: 'bg-red-50 dark:bg-red-900/30',
        borderClass: 'border-red-200 dark:border-red-800/50',
        progressClass: 'bg-red-500 dark:bg-red-600'
      };
    }
    
    if (isGroupBudget) {
      return {
        bgClass: 'bg-blue-50 dark:bg-blue-900/30',
        borderClass: 'border-blue-200 dark:border-blue-800/50',
        progressClass: 'bg-blue-500 dark:bg-blue-600'
      };
    }
    
    if (!category) return { bgClass, borderClass, progressClass };

    // Map color names to specific classes
    const colorMap = {
      'blue': {
        bgClass: 'bg-blue-50 dark:bg-blue-900/30',
        borderClass: 'border-blue-200 dark:border-blue-800/50',
        progressClass: 'bg-blue-500 dark:bg-blue-600'
      },
      'green': {
        bgClass: 'bg-green-50 dark:bg-green-900/30',
        borderClass: 'border-green-200 dark:border-green-800/50',
        progressClass: 'bg-green-500 dark:bg-green-600'
      },
      'amber': {
        bgClass: 'bg-amber-50 dark:bg-amber-900/30',
        borderClass: 'border-amber-200 dark:border-amber-800/50',
        progressClass: 'bg-amber-500 dark:bg-amber-600'
      },
      'purple': {
        bgClass: 'bg-purple-50 dark:bg-purple-900/30',
        borderClass: 'border-purple-200 dark:border-purple-800/50',
        progressClass: 'bg-purple-500 dark:bg-purple-600'
      },
      'red': {
        bgClass: 'bg-red-50 dark:bg-red-900/30',
        borderClass: 'border-red-200 dark:border-red-800/50',
        progressClass: 'bg-red-500 dark:bg-red-600'
      },
      'pink': {
        bgClass: 'bg-pink-50 dark:bg-pink-900/30',
        borderClass: 'border-pink-200 dark:border-pink-800/50',
        progressClass: 'bg-pink-500 dark:bg-pink-600'
      },
      'indigo': {
        bgClass: 'bg-indigo-50 dark:bg-indigo-900/30',
        borderClass: 'border-indigo-200 dark:border-indigo-800/50',
        progressClass: 'bg-indigo-500 dark:bg-indigo-600'
      },
      'teal': {
        bgClass: 'bg-teal-50 dark:bg-teal-900/30',
        borderClass: 'border-teal-200 dark:border-teal-800/50',
        progressClass: 'bg-teal-500 dark:bg-teal-600'
      },
      'gray': {
        bgClass: 'bg-gray-50 dark:bg-gray-800/50',
        borderClass: 'border-gray-200 dark:border-gray-700/50',
        progressClass: 'bg-gray-500 dark:bg-gray-600'
      }
    };
    
    return colorMap[category.color] || { bgClass, borderClass, progressClass };
  };

  // Month names for picker
  const monthNames = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ];

  // If compact mode, show simplified view
  if (compact) {
    const displayBudgets = budgetProgress.slice(0, 4);
    
    return (
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 transition-all">
        <div className="space-y-4">
          {displayBudgets.length > 0 ? (
            displayBudgets.map((budget) => {
              const category = getCategoryById(budget.category);
              const percentage = calculatePercentage(budget.spent, budget.allocated);
              const isOverBudget = budget.spent > budget.allocated;
              const isGroupBudget = budget.isGroupBudget;
              const { progressClass } = getCategoryStyleClasses(category, isOverBudget, isGroupBudget);
              
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                      {getBudgetDisplayName(budget)}
                    </span>
                    <span className={`font-medium ${
                      isOverBudget 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${progressClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-800 dark:text-slate-400 p-2">
              No budgets found
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-300 dark:border-slate-600">
          <div className="text-sm text-slate-800 dark:text-slate-400">
            <div className="text-sm text-slate-900 dark:text-white">
              Total Budget: {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.allocated, 0))}
            </div>
            <div className="text-slate-700 dark:text-slate-300">
              Spent: {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.spent, 0))} 
              ({Math.round((budgetProgress.reduce((sum, b) => sum + b.spent, 0) / 
                budgetProgress.reduce((sum, b) => sum + b.allocated, 0)) * 100)}%)
            </div>
          </div>
          <button 
            onClick={onRefresh}
            className="px-3 py-1.5 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg text-sm"
          >
            View All
          </button>
        </div>
      </div>
    );
  }

  // Full budget management view
  return (
    <div className="space-y-4 overflow-x-auto -mx-4 px-4 sm:overflow-visible sm:mx-0 sm:px-0">
      {/* Budget Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-6 shadow-sm border border-slate-300 dark:border-slate-700 min-w-min">
        {/* Month Selector */}
        <div className="flex justify-between items-center mb-6 overflow-x-auto">
          
          {/* Month Navigation */}
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={handlePreviousMonth}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Month Display + Picker Trigger */}
            <div 
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ${
                hasDataForMonth(selectedMonth) 
                  ? 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white hover:bg-amber-600 dark:hover:bg-amber-700' 
                  : 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <Calendar size={16} className="text-current" />
              <span className="whitespace-nowrap">{selectedMonth ? formatMonthKey(selectedMonth) : "Current Month"}</span>
              {showMonthPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            
            <button 
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              disabled={isCurrentMonth}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
            
            {/* Month Picker Dropdown */}
            {showMonthPicker && (
              <div 
                ref={monthPickerRef}
                className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg p-3 z-10 w-full min-w-[240px] max-w-xs"
              >
                <div className="flex justify-between items-center mb-2">
                  <button 
                    onClick={handlePreviousYear}
                    className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="font-medium text-slate-900 dark:text-white">{pickerYear}</div>
                  <button 
                    onClick={handleNextYear}
                    className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                    disabled={pickerYear >= new Date().getFullYear()}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {monthNames.map((name, index) => {
                    const monthKey = `${pickerYear}-${(index + 1).toString().padStart(2, '0')}`;
                    const isCurrentMonth = monthKey === getCurrentMonthKey();
                    const isFutureMonth = monthKey > getCurrentMonthKey();
                    const hasData = hasDataForMonth(monthKey);
                    const isSelected = monthKey === selectedMonth;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !isFutureMonth && handleSelectMonth(index)}
                        className={`py-1 px-2 rounded text-sm ${
                          isFutureMonth ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed' :
                          isSelected ? 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white' :
                          hasData ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' :
                          'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                        disabled={isFutureMonth}
                      >
                        {name.substring(0, 3)}
                        {isCurrentMonth && <span className="ml-1 text-xs">•</span>}
                      </button>
                    );
                  })}
                </div>
                
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-600"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-amber-100 dark:bg-amber-900/50"></div>
                      <span>Has Data</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {budgetProgress.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[160px] xs:min-w-[180px] bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
                <h5 className="text-sm text-slate-800 dark:text-slate-100 mb-1">Total Budget</h5>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-300">
                  {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.allocated, 0))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {budgetProgress.length} budget categories
                </div>
              </div>
              
              <div className="flex-1 min-w-[160px] xs:min-w-[180px] bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
                <h5 className="font-medium text-slate-800 dark:text-slate-100 mb-1">Total Spent</h5>
                <div className="text-lg font-bold text-green-600 dark:text-green-300">
                  {formatCurrency(budgetProgress.reduce((sum, b) => sum + b.spent, 0))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {Math.round((budgetProgress.reduce((sum, b) => sum + b.spent, 0) / 
                    budgetProgress.reduce((sum, b) => sum + b.allocated, 0)) * 100)}% of budget
                </div>
              </div>
              
              <div className="flex-1 min-w-[160px] xs:min-w-[180px] bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <h5 className="font-medium text-slate-800 dark:text-slate-100 mb-1">Remaining</h5>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-300">
                  {formatCurrency(
                    budgetProgress.reduce((sum, b) => sum + b.allocated, 0) - 
                    budgetProgress.reduce((sum, b) => sum + b.spent, 0)
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {budgetProgress.filter(b => b.spent > b.allocated).length} categories over budget
                </div>
              </div>
            </div>
            
            {/* Budget Categories */}
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-medium text-slate-800 dark:text-slate-100">Budget Categories</h5>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {budgetProgress.map((budget) => {
                const category = getCategoryById(budget.category);
                const percentage = calculatePercentage(budget.spent, budget.allocated);
                const isOverBudget = budget.spent > budget.allocated;
                const isGroupBudget = budget.isGroupBudget || budget.category.startsWith('group-');
                
                const { bgClass, borderClass, progressClass } = getCategoryStyleClasses(
                  category, 
                  isOverBudget, 
                  isGroupBudget
                );
                
                return (
                  <div 
                    key={budget.id} 
                    className={`${bgClass} rounded-lg p-3 sm:p-4 border ${borderClass} cursor-pointer overflow-hidden`}
                    onClick={() => handleBudgetClick(budget)}
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
                      <div className="min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h6 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {getBudgetDisplayName(budget)}
                          </h6>
                          {isOverBudget && (
                            <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium whitespace-nowrap">
                              <AlertTriangle size={14} />
                              Over Budget
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {budget.notes || 'No description'}
                        </p>
                        
                        {/* Display previous month comparison if available */}
                        {budget.previousMonth && (
                          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 truncate">
                            Previous month: {formatCurrency(budget.previousMonth.spent)} / {formatCurrency(budget.previousMonth.allocated)} 
                            ({Math.round((budget.previousMonth.spent / budget.previousMonth.allocated) * 100)}%)
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCurrentMonth && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditBudget(budget);
                              }}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                              title="Edit Budget"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBudget(budget);
                              }}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              title="Delete Budget"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-end gap-2 mb-2">
                      <div className="w-full md:w-3/4 min-w-0">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${progressClass}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-1/4 text-right">
                        <span className={`text-xs sm:text-sm font-bold ${
                          isOverBudget 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-slate-900 dark:text-slate-100'
                        } whitespace-nowrap`}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">{percentage}% used</span>
                      <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {formatCurrency(budget.allocated - budget.spent)} remaining
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center p-8 sm:p-12 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <Calendar size={48} className="text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <div className="text-xl font-medium text-slate-900 dark:text-white mb-2">No Budgets Found</div>
            <div className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {hasDataForMonth(selectedMonth) ? 
                "There are no budgets configured for this month." :
                "No budget data exists for this month. You can create budgets for the current month."
              }
            </div>
            
            {isCurrentMonth && (
              <button
                onClick={() => onRefresh()}
                className="px-4 py-2 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Budget
              </button>
            )}
            
            {!isCurrentMonth && availableMonths.length > 0 && (
              <button
                onClick={() => setSelectedMonth(availableMonths[availableMonths.length - 1])}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2"
              >
                <Calendar size={18} />
                View Latest Month
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Budget Transactions Modal */}
      {viewingBudget && (
        <BudgetTransactionsModal
          budget={viewingBudget}
          monthKey={selectedMonth}
          transactions={getFinanceData().transactions || []}
          onClose={() => setViewingBudget(null)}
          currency={currency}
        />
      )}
      
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
          message={`Are you sure you want to delete the "${getBudgetDisplayName(confirmDelete)}" budget (${formatCurrency(confirmDelete.allocated)})? This action cannot be undone.`}
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