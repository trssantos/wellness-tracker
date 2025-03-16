import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, TrendingUp, TrendingDown, PiggyBank, RepeatIcon, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { getCategoryById, getCategoryIconComponent, deleteRecurringTransaction } from '../../utils/financeUtils';
import RecurringTransactionsManager from './RecurringTransactionsManager'; 
import EditRecurringModal from './EditRecurringModal';
import ConfirmationModal from './ConfirmationModal';

const UpcomingBills = ({ transactions = [], bills = [], onBillClick, onRefresh, currency = '€', compact = false }) => {
  const [showOptions, setShowOptions] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Get today's date and reset time to midnight for proper comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Helper functions
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  // Format time distance in words
  const formatTimeDistance = (futureDate) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffTime = Math.max(0, futureDate - today);
    const diffDays = Math.ceil(diffTime / msPerDay);
    
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "tomorrow";
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 14) return "in 1 week";
    if (diffDays < 30) return `in ${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 60) return "in 1 month";
    return `in ${Math.floor(diffDays / 30)} months`;
  };
  
  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${Math.abs(parseFloat(amount)).toFixed(2)}`;
  };

  // Handle edit recurring transaction
  const handleEditRecurring = (item) => {
    setEditingRecurring(item.original);
    setShowOptions(null);
  };

  // Handle delete recurring transaction
  const handleDeleteRecurring = (item) => {
    setConfirmDelete(item.original);
    setShowOptions(null);
  };

  // Confirm deletion
  const confirmDeleteRecurring = () => {
    if (confirmDelete) {
      deleteRecurringTransaction(confirmDelete.id);
      setConfirmDelete(null);
      if (onRefresh) onRefresh();
    }
  };

  // Process regular future transactions - these are always shown
  const futureTransactions = transactions.filter(transaction => {
    try {
      const txDate = new Date(transaction.date || transaction.timestamp);
      txDate.setHours(0, 0, 0, 0);
      return txDate > today;
    } catch (e) {
      return false; // Skip invalid dates
    }
  }).map(tx => ({
    ...tx,
    type: 'transaction',
    dueDate: new Date(tx.date || tx.timestamp),
    displayId: tx.id // Unique ID for deduplication
  }));

  // Process recurring transactions/bills - these are processed differently to avoid duplication
  const billsWithDate = bills.filter(bill => {
    try {
      // Skip bills without nextDate
      if (!bill.nextDate) return false;
      return new Date(bill.nextDate) > today;
    } catch (e) {
      return false; // Skip invalid dates
    }
  }).map(bill => {
    const dueDate = new Date(bill.nextDate);
    // Generate a unique display ID for this recurring date
    return {
      id: bill.id,
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      dueDate: dueDate,
      dueDateString: dueDate.toISOString().split('T')[0], // For deduplication check
      frequency: bill.frequency,
      type: 'recurring',
      original: bill,
      displayId: `recurring-${bill.id}-${dueDate.toISOString().split('T')[0]}` // Unique ID for deduplication
    };
  });

  // DEDUPLICATION LOGIC
  // Create a map of all transaction dates that were created from recurring transactions
  const recurringTransactionDates = {};

  // Mark all existing transactions that were created from a recurring config
  futureTransactions.forEach(tx => {
    if (tx.recurring) {
      // This transaction was created from a recurring config
      // Format: recurring-ID-YYYY-MM-DD
      const key = `recurring-${tx.recurring}-${tx.dueDate.toISOString().split('T')[0]}`;
      recurringTransactionDates[key] = true;
    }
  });

  // Filter out recurring configurations that already have a transaction
  const nonDuplicatedBills = billsWithDate.filter(bill => {
    // If there's already a transaction for this recurring config on this date, 
    // filter it out to avoid duplication
    return !recurringTransactionDates[bill.displayId];
  });

  // Combine both types of future financial events, without duplication
  const allUpcoming = [...futureTransactions, ...nonDuplicatedBills].sort((a, b) => 
    a.dueDate - b.dueDate
  );

  // Get upcoming events for next 30 days
  const thirtyDaysFromNow = addDays(today, 30);
  const next30Days = allUpcoming.filter(item => item.dueDate <= thirtyDaysFromNow);
  
  // Calculate total expenses and income for the next 30 days
  const totalUpcomingExpenses = next30Days
    .filter(item => (item.amount || 0) < 0)
    .reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0);
    
  const totalUpcomingIncome = next30Days
    .filter(item => (item.amount || 0) > 0)
    .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  const netCashFlow = totalUpcomingIncome - totalUpcomingExpenses;

  // Group items by time period
  const groupedItems = {};
  
  // Define time periods
  const today7days = addDays(today, 7);
  const today14days = addDays(today, 14);
  const today30days = addDays(today, 30);
  
  // Group items by time period
  allUpcoming.forEach(item => {
    let period;
    if (item.dueDate <= today7days) {
      period = 'This Week';
    } else if (item.dueDate <= today14days) {
      period = 'Next Week';
    } else if (item.dueDate <= today30days) {
      period = 'This Month';
    } else {
      period = 'Later';
    }
    
    if (!groupedItems[period]) {
      groupedItems[period] = [];
    }
    
    groupedItems[period].push(item);
  });
  
  // Sort items within each group by date
  Object.keys(groupedItems).forEach(period => {
    groupedItems[period].sort((a, b) => a.dueDate - b.dueDate);
  });

  // Display order for periods
  const periodOrder = ['This Week', 'Next Week', 'This Month', 'Later'];

  // For compact mode (dashboard), only show "This Week" transactions
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Only show "This Week" transactions */}
        {groupedItems['This Week'] && groupedItems['This Week'].length > 0 ? (
          groupedItems['This Week'].map(item => {
            const daysLeft = Math.ceil((item.dueDate - today) / (1000 * 60 * 60 * 24));
            const timeUntil = formatTimeDistance(item.dueDate);
            
            const statusClass = 
              daysLeft <= 3 ? 'bg-gray-900/30 border-gray-800/50' :
              daysLeft <= 7 ? 'bg-amber-900/30 border-amber-800/50' :
              'bg-blue-900/30 border-blue-800/50';
              
            // Get category details if available
            const category = getCategoryById(item.category);
            
            return (
              <div 
                key={item.displayId}
                className={`${statusClass} rounded-lg p-3 border relative transition-colors`}
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onBillClick && onBillClick(item.original || item)}
                  >
                    <div className="font-medium text-white flex items-center gap-1">
                      {item.name}
                      {item.amount > 0 ? (
                        <TrendingUp size={14} className="text-green-400" />
                      ) : (
                        <TrendingDown size={14} className="text-red-400" />
                      )}
                      {item.type === 'recurring' && (
                        <RepeatIcon size={14} className="text-amber-400" title={`Repeats ${item.frequency}`} />
                      )}
                    </div>
                    
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 mt-1">
                      <div className="text-xs text-slate-300 flex items-center gap-1">
                        <Calendar size={12} />
                        <span>
                          {item.dueDate.toLocaleDateString()} <span className="text-slate-400">({timeUntil})</span>
                        </span>
                      </div>
                      
                      {category && (
                        <div className="text-xs flex items-center gap-1 mt-1 xs:mt-0 xs:ml-2">
                          <span className="bg-slate-700/70 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            {getCategoryIconComponent(item.category, 10)}
                            <span className="text-slate-300">{category.name}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`text-lg font-bold ${item.amount > 0 ? 'text-green-400' : 'text-red-300'}`}>
                    {item.amount > 0 ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </div>
                </div>
                
                {/* Progress Bar for Days Left */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                    <span>{item.dueDate.toLocaleDateString('default', { weekday: 'short' })}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        daysLeft <= 3 ? 'bg-red-500' : 
                        daysLeft <= 7 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, 100 - ((daysLeft / 30) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-center h-32">
            <div className="text-center">
              <Calendar size={24} className="text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No upcoming transactions this week</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view for the Upcoming Bills tab
  return (
    <div className="space-y-4">
      {/* Financial Summary Card */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h3 className="text-white font-medium mb-3">30-Day Outlook</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-green-900/30 p-3 rounded-lg border border-green-800/50">
            <div className="text-sm text-slate-300">Upcoming Income</div>
            <div className="text-lg font-bold text-green-400 flex items-center">
              <TrendingUp size={16} className="mr-1" />
              {formatCurrency(totalUpcomingIncome)}
            </div>
          </div>
          
          <div className="bg-red-900/30 p-3 rounded-lg border border-red-800/50">
            <div className="text-sm text-slate-300">Upcoming Expenses</div>
            <div className="text-lg font-bold text-red-400 flex items-center">
              <TrendingDown size={16} className="mr-1" />
              {formatCurrency(totalUpcomingExpenses)}
            </div>
          </div>
          
          <div className={`${netCashFlow >= 0 ? 'bg-blue-900/30 border-blue-800/50' : 'bg-amber-900/30 border-amber-800/50'} p-3 rounded-lg border`}>
            <div className="text-sm text-slate-300">Net Cash Flow</div>
            <div className={`text-lg font-bold flex items-center ${netCashFlow >= 0 ? 'text-blue-400' : 'text-amber-400'}`}>
              <PiggyBank size={16} className="mr-1" />
              {netCashFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netCashFlow))}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-slate-400 italic">
          Based on scheduled transactions for the next 30 days
        </div>
      </div>
      
      {/* Upcoming Transactions Section */}
      {allUpcoming.length === 0 ? (
        <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-center h-40">
          <div className="text-center">
            <Calendar size={24} className="text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No upcoming transactions</p>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-medium text-white mt-6 mb-2 flex items-center gap-2">
            <Calendar className="text-amber-400" size={20} />
            Upcoming Transactions
          </h3>
          
          {/* Time-based Transaction Grouping */}
          <div className="space-y-4">
            {periodOrder.map(period => {
              if (!groupedItems[period] || groupedItems[period].length === 0) return null;
              
              return (
                <div key={period} className="space-y-2">
                  <h4 className={`text-sm font-medium flex items-center gap-1 
                    ${period === 'This Week' ? 'text-red-400' : 
                      period === 'Next Week' ? 'text-amber-400' : 
                      period === 'This Month' ? 'text-blue-400' : 'text-slate-400'}`}>
                    {period === 'This Week' ? <AlertCircle size={16} /> : 
                     period === 'Next Week' ? <Clock size={16} /> : 
                     <Calendar size={16} />}
                    {period}
                  </h4>
                  
                  <div className="space-y-2">
                    {groupedItems[period].map(item => {
                      const daysLeft = Math.ceil((item.dueDate - today) / (1000 * 60 * 60 * 24));
                      const timeUntil = formatTimeDistance(item.dueDate);
                      
                      const statusClass = 
                        daysLeft <= 3 ? 'bg-red-900/30 border-red-800/50' :
                        daysLeft <= 7 ? 'bg-amber-900/30 border-amber-800/50' :
                        'bg-blue-900/30 border-blue-800/50';
                        
                      // Get category details if available
                      const category = getCategoryById(item.category);
                      
                      return (
                        <div 
                          key={item.displayId}
                          className={`${statusClass} rounded-lg p-3 border relative transition-colors`}
                        >
                          <div className="flex justify-between items-start">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => onBillClick && onBillClick(item.original || item)}
                            >
                              <div className="font-medium text-white flex items-center gap-1">
                                {item.name}
                                {item.amount > 0 ? (
                                  <TrendingUp size={14} className="text-green-400" />
                                ) : (
                                  <TrendingDown size={14} className="text-red-400" />
                                )}
                                {item.type === 'recurring' && (
                                  <RepeatIcon size={14} className="text-amber-400" title={`Repeats ${item.frequency}`} />
                                )}
                              </div>
                              
                              <div className="flex flex-col xs:flex-row xs:items-center gap-1 mt-1">
                                <div className="text-xs text-slate-300 flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>
                                    {item.dueDate.toLocaleDateString()} <span className="text-slate-400">({timeUntil})</span>
                                  </span>
                                </div>
                                
                                {category && (
                                  <div className="text-xs flex items-center gap-1 mt-1 xs:mt-0 xs:ml-2">
                                    <span className="bg-slate-700/70 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                      {getCategoryIconComponent(item.category, 10)}
                                      <span className="text-slate-300">{category.name}</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className={`text-lg font-bold mr-2 ${item.amount > 0 ? 'text-green-400' : 'text-red-300'}`}>
                                {item.amount > 0 ? '+' : '-'}
                                {formatCurrency(item.amount)}
                              </div>
                              
                              {/* Action menu for recurring transactions */}
                              {item.type === 'recurring' && (
                                <div className="relative">
                                  <button 
                                    onClick={() => setShowOptions(showOptions === item.displayId ? null : item.displayId)}
                                    className="p-1 rounded-full hover:bg-slate-700/70 text-slate-300"
                                  >
                                    <MoreHorizontal size={16} />
                                  </button>
                                  
                                  {showOptions === item.displayId && (
                                    <div className="absolute right-0 top-8 z-10 bg-slate-700 rounded-lg shadow-lg p-1 min-w-36">
                                      <button
                                        className="flex items-center gap-2 text-blue-400 hover:bg-slate-600/70 w-full text-left px-3 py-2 rounded"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditRecurring(item);
                                        }}
                                      >
                                        <Edit size={14} />
                                        <span>Edit Recurring</span>
                                      </button>
                                      <button
                                        className="flex items-center gap-2 text-red-400 hover:bg-slate-600/70 w-full text-left px-3 py-2 rounded"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRecurring(item);
                                        }}
                                      >
                                        <Trash2 size={14} />
                                        <span>Delete Recurring</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress Bar for Days Left */}
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                              <span>{item.dueDate.toLocaleDateString('default', { weekday: 'short' })}</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  daysLeft <= 3 ? 'bg-red-500' : 
                                  daysLeft <= 7 ? 'bg-amber-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(100, 100 - ((daysLeft / 30) * 100))}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* For recurring bills, show additional info */}
                          {item.type === 'recurring' && (
                            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                              <RepeatIcon size={12} />
                              <span>Repeats {item.frequency}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Recurring Transactions Manager Section */}
      <RecurringTransactionsManager 
        recurringTransactions={bills} 
        onRefresh={onRefresh}
        currency={currency}
      />

      {/* Edit Recurring Modal */}
      {editingRecurring && (
        <EditRecurringModal
          recurring={editingRecurring}
          onClose={() => setEditingRecurring(null)}
          onRecurringUpdated={() => {
            setEditingRecurring(null);
            if (onRefresh) onRefresh();
          }}
          currency={currency}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Delete Recurring Transaction"
          message={`Are you sure you want to delete the recurring transaction "${confirmDelete.name}"? This will prevent future transactions from being generated. This action cannot be undone.`}
          onConfirm={confirmDeleteRecurring}
          onCancel={() => setConfirmDelete(null)}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default UpcomingBills;