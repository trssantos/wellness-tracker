import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Filter, TrendingUp, TrendingDown, X,
  Edit, Trash2, Calendar, DollarSign, ArrowDown, ArrowUp, Download
} from 'lucide-react';
import { getFinanceData, deleteTransaction, getCategoryById } from '../../utils/financeUtils';
import EditTransactionModal from './EditTransactionModal';

const ExpenseTracker = ({ compact = false, refreshTrigger = 0, onRefresh }) => {
  // State variables
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState({});

  // Fetch transactions and categories on initial render and when refreshTrigger changes
  useEffect(() => {
    const financeData = getFinanceData();
    setTransactions(financeData.transactions);
    setCategories(financeData.categories);
  }, [refreshTrigger]);

  // Apply filters and search whenever related states change
  useEffect(() => {
    let filtered = [...transactions];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.name.toLowerCase().includes(term) || 
        (transaction.notes && transaction.notes.toLowerCase().includes(term))
      );
    }
    
    // Apply date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const today = now.toISOString().split('T')[0];
      filtered = filtered.filter(transaction => 
        transaction.date === today
      );
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(transaction => 
        new Date(transaction.timestamp) >= oneWeekAgo
      );
    } else if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(transaction => 
        new Date(transaction.timestamp) >= oneMonthAgo
      );
    }
    
    // Apply type filter
    if (typeFilter === 'income') {
      filtered = filtered.filter(transaction => transaction.amount > 0);
    } else if (typeFilter === 'expense') {
      filtered = filtered.filter(transaction => transaction.amount < 0);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.timestamp) - new Date(b.timestamp)
          : new Date(b.timestamp) - new Date(a.timestamp);
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      } else if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });
    
    // Update filtered transactions
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, dateFilter, typeFilter, categoryFilter, sortBy, sortOrder]);

  // Handle delete transaction
  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      if (onRefresh) onRefresh();
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  // Handle edit complete
  const handleEditComplete = () => {
    setEditingTransaction(null);
    if (onRefresh) onRefresh();
  };

  // Toggle sort order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  // Export transactions as CSV
  const exportTransactions = () => {
    // Create CSV content
    let csv = 'Date,Name,Category,Amount,Notes\n';
    
    filteredTransactions.forEach(tx => {
      const date = formatDate(tx.timestamp);
      const name = tx.name.replace(/,/g, ' ');
      const category = getCategoryById(tx.category)?.name || '';
      const amount = tx.amount.toFixed(2);
      const notes = tx.notes ? tx.notes.replace(/,/g, ' ').replace(/\n/g, ' ') : '';
      
      csv += `${date},${name},${category},${amount},${notes}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions-export-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  // If compact mode, show only a few transactions with minimal filters
  if (compact) {
    const displayTransactions = filteredTransactions.slice(0, 5);
    
    return (
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden transition-all">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-colors"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="px-4 py-2 bg-white dark:bg-slate-700 border-t border-b border-slate-200 dark:border-slate-600">
            <div className="flex flex-wrap gap-2 text-xs">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-1.5 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-1.5 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {displayTransactions.length > 0 ? (
                displayTransactions.map(transaction => {
                  const category = getCategoryById(transaction.category);
                  return (
                    <tr key={transaction.id} className="text-sm">
                      <td className="p-2 text-slate-500 dark:text-slate-400">
                        {formatDate(transaction.timestamp)}
                      </td>
                      <td className="p-2 text-slate-700 dark:text-slate-300">
                        {transaction.name}
                      </td>
                      <td className="p-2">
                        {category && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs bg-${category.color}-100 dark:bg-${category.color}-900/30 text-${category.color}-800 dark:text-${category.color}-300`}>
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className={`p-2 text-right font-medium ${
                        transaction.amount > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500 dark:text-slate-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-2 text-center border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => onRefresh()}
            className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
          >
            View All Transactions
          </button>
        </div>
      </div>
    );
  }

  // Full transactions view
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <CreditCard className="text-amber-500 dark:text-amber-400" size={20} />
          Transactions
        </h4>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-colors"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
          >
            <Filter size={16} />
            <span>Filter</span>
          </button>
          
          <button
            onClick={exportTransactions}
            className="px-3 py-2 rounded-lg bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors flex items-center gap-1"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white dark:bg-slate-700 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-600">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Transaction Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
              >
                <option value="all">All Categories</option>
                <optgroup label="Income">
                  {categories.income && categories.income.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Expense">
                  {categories.expense && categories.expense.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Sort By
              </label>
              <div className="flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-32 p-2 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-l-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-slate-50 dark:bg-slate-600 border border-l-0 border-slate-200 dark:border-slate-500 rounded-r-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500"
                >
                  {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setTypeFilter('all');
                setCategoryFilter('all');
                setSortBy('date');
                setSortOrder('desc');
              }}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1 text-slate-500 dark:text-slate-400" />
                    <span>Date</span>
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="p-3 text-left cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Description</span>
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="p-3 text-left">Category</th>
                <th 
                  className="p-3 text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    <DollarSign size={16} className="mr-1 text-slate-500 dark:text-slate-400" />
                    <span>Amount</span>
                    {sortBy === 'amount' && (
                      sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => {
                  const category = getCategoryById(transaction.category);
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {formatDate(transaction.timestamp)}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{transaction.name}</div>
                        {transaction.notes && (
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1 line-clamp-1">
                            {transaction.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {category && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs bg-${category.color}-100 dark:bg-${category.color}-900/30 text-${category.color}-800 dark:text-${category.color}-300`}>
                            {category.name}
                          </span>
                        )}
                      </td>
                      <td className={`p-3 text-right font-medium ${
                        transaction.amount > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        <div className="flex items-center justify-end">
                          {transaction.amount > 0 ? (
                            <TrendingUp size={16} className="mr-1 text-green-500" />
                          ) : (
                            <TrendingDown size={16} className="mr-1 text-red-500" />
                          )}
                          {transaction.amount > 0 ? '+' : ''}
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500 dark:text-slate-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onTransactionUpdated={handleEditComplete}
        />
      )}
    </div>
  );
};

export default ExpenseTracker;