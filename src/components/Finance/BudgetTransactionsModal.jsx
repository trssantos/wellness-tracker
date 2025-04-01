import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, DollarSign, TrendingDown, Filter, ArrowDown, ArrowUp, Search } from 'lucide-react';
import { getCategoryById, getCategoryIconComponent } from '../../utils/financeUtils';
import { formatDateForStorage } from '../../utils/dateUtils';

const BudgetTransactionsModal = ({ budget, monthKey, transactions, onClose, currency = '$' }) => {
  // State for filters and sorting
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ref for click outside detection
  const modalRef = useRef(null);
  
  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Get category info
  const category = getCategoryById(budget.category);
  
  // Format month key to show date
  const formatMonthDisplay = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };
  
  // Filter transactions by this category and month
  const filterTransactionsByMonthAndCategory = () => {
    // Calculate start and end date for the month
    const [year, month] = monthKey.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 0); // Last day of month
    endDate.setHours(23, 59, 59, 999); // End of day
    
    // Filter transactions
    return transactions.filter(tx => {
      // Match category
      if (tx.category !== budget.category) return false;
      
      // Match expense (negative amount)
      if (tx.amount >= 0) return false;
      
      // Match date range
      const txDate = new Date(tx.timestamp);
      if (txDate < startDate || txDate > endDate) return false;
      
      // Match search query
      if (searchQuery && !tx.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get filtered and sorted transactions
  const getCategoryTransactions = () => {
    const filtered = filterTransactionsByMonthAndCategory();
    
    // Sort transactions
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' 
          ? Math.abs(a.amount) - Math.abs(b.amount) 
          : Math.abs(b.amount) - Math.abs(a.amount);
      } else {
        return 0;
      }
    });
  };
  
  // Handle sort click
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${currency}${Math.abs(parseFloat(amount)).toFixed(2)}`;
  };
  
  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  // Get category transactions
  const categoryTransactions = getCategoryTransactions();
  
  // Calculate total spent for these transactions
  const totalSpent = categoryTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  // Calculate total number of transactions
  const transactionCount = categoryTransactions.length;
  
  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Render the modal
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="bg-slate-800 text-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md bg-${category?.color || 'gray'}-900/50 text-${category?.color || 'gray'}-400`}>
              {getCategoryIconComponent(budget.category, 24)}
            </div>
            <div>
              <h3 className="text-lg font-medium">{category?.name || 'Category'} Transactions</h3>
              <p className="text-sm text-slate-400">{formatMonthDisplay(monthKey)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Budget Summary */}
        <div className="p-4 border-b border-slate-700 bg-slate-700/30">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <div className="text-sm text-slate-300 mb-1">Budget Progress</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{formatCurrency(totalSpent)}</span>
                <span className="text-slate-400">of {formatCurrency(budget.allocated)}</span>
                <span className={`text-sm ${totalSpent > budget.allocated ? 'text-red-400' : 'text-green-400'}`}>
                  ({Math.round((totalSpent / budget.allocated) * 100)}%)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-300 mb-1">Transactions</div>
              <div className="text-xl font-bold">{transactionCount}</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  totalSpent > budget.allocated 
                    ? 'bg-red-500' 
                    : `bg-${category?.color || 'blue'}-500`
                }`}
                style={{ width: `${Math.min(100, Math.round((totalSpent / budget.allocated) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Filters & Search */}
        <div className="p-3 border-b border-slate-700 bg-slate-700/30 flex flex-wrap gap-2 justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="absolute left-3 top-2 text-slate-400" size={16} />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort By:</span>
            <button 
              onClick={() => handleSort('date')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                sortBy === 'date' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <Calendar size={12} />
              <span>Date</span>
              {sortBy === 'date' && (
                sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
              )}
            </button>
            <button 
              onClick={() => handleSort('amount')}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                sortBy === 'amount' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              <DollarSign size={12} />
              <span>Amount</span>
              {sortBy === 'amount' && (
                sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
              )}
            </button>
          </div>
        </div>
        
        {/* Transactions List */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {categoryTransactions.length > 0 ? (
            <table className="w-full border-collapse">
              <thead className="bg-slate-700">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-slate-300 border-b border-slate-600">Date</th>
                  <th className="p-3 text-left text-xs font-medium text-slate-300 border-b border-slate-600">Description</th>
                  <th className="p-3 text-right text-xs font-medium text-slate-300 border-b border-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {categoryTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-3 text-sm text-slate-300 border-b border-slate-700">
                      {formatDate(transaction.timestamp)}
                    </td>
                    <td className="p-3 text-sm text-white border-b border-slate-700">
                      <div className="font-medium">{transaction.name}</div>
                      {transaction.notes && (
                        <div className="text-xs text-slate-400 mt-0.5">{transaction.notes}</div>
                      )}
                    </td>
                    <td className="p-3 text-sm font-medium text-right text-red-400 border-b border-slate-700">
                      <div className="flex items-center justify-end">
                        <TrendingDown size={14} className="mr-1" />
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <TrendingDown size={36} className="text-slate-500 mx-auto mb-2" />
              <p>No transactions found for this category in {formatMonthDisplay(monthKey)}.</p>
              {searchQuery && (
                <p className="mt-2 text-sm">Try adjusting your search query.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetTransactionsModal;