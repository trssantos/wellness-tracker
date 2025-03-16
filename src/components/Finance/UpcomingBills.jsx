import React from 'react';
import { Calendar, Clock, AlertCircle, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

// Update the component to accept transactions instead of bills
const UpcomingBills = ({ transactions = [], onBillClick, currency = '$' }) => {
  // Debug logging
  console.log("UpcomingBills received transactions:", transactions);
  
  // Get today's date and reset time to midnight for proper comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Helper functions
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  // Helper to safely parse dates from transaction objects
  const getTransactionDate = (transaction) => {
    // Try different possible date fields
    const dateStr = transaction.date || transaction.timestamp;
    
    if (!dateStr) return null;
    
    // If it's an ISO string with time component, extract just the date part
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      return new Date(dateStr.split('T')[0]);
    }
    
    return new Date(dateStr);
  };
  
  // Format time distance in words
  const formatTimeDistance = (futureDate) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffTime = futureDate - today;
    const diffDays = Math.ceil(diffTime / msPerDay);
    
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "tomorrow";
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 14) return "in 1 week";
    if (diffDays < 30) return `in ${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 60) return "in 1 month";
    return `in ${Math.floor(diffDays / 30)} months`;
  };
  
  // Filter for only future transactions
  const futureTransactions = transactions.filter(transaction => {
    const txDate = getTransactionDate(transaction);
    if (!txDate) return false;
    
    // Debug this transaction
    console.log(`Transaction: ${transaction.name}, Date: ${txDate}, Is Future: ${txDate > today}`);
    
    return txDate > today;
  });
  
  console.log("Filtered future transactions:", futureTransactions);
  
  // Get upcoming transactions for next 30 days
  const next30Days = futureTransactions.filter(transaction => {
    const txDate = getTransactionDate(transaction);
    if (!txDate) return false;
    
    const thirtyDaysFromNow = addDays(today, 30);
    return txDate <= thirtyDaysFromNow;
  });
  
  // Calculate total expenses and income for the next 30 days
  const totalUpcomingExpenses = next30Days
    .filter(tx => (tx.amount || 0) < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
    
  const totalUpcomingIncome = next30Days
    .filter(tx => (tx.amount || 0) > 0)
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  const netCashFlow = totalUpcomingIncome - totalUpcomingExpenses;

  if (!futureTransactions || futureTransactions.length === 0) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-center h-40">
        <div className="text-center">
          <Calendar size={24} className="text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No upcoming transactions</p>
        </div>
      </div>
    );
  }

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${Math.abs(amount).toFixed(2)}`;
  };
  
  // Group transactions by time period
  const groupedTransactions = {};
  
  // Define time periods
  const today7days = addDays(today, 7);
  const today14days = addDays(today, 14);
  const today30days = addDays(today, 30);
  
  // Group transactions by time period
  futureTransactions.forEach(transaction => {
    const txDate = getTransactionDate(transaction);
    if (!txDate) return;
    
    let period;
    if (txDate <= today7days) {
      period = 'This Week';
    } else if (txDate <= today14days) {
      period = 'Next Week';
    } else if (txDate <= today30days) {
      period = 'This Month';
    } else {
      period = 'Later';
    }
    
    if (!groupedTransactions[period]) {
      groupedTransactions[period] = [];
    }
    
    groupedTransactions[period].push(transaction);
  });
  
  // Sort transactions within each group by date
  Object.keys(groupedTransactions).forEach(period => {
    groupedTransactions[period].sort((a, b) => {
      const dateA = getTransactionDate(a);
      const dateB = getTransactionDate(b);
      if (!dateA || !dateB) return 0;
      return dateA - dateB;
    });
  });

  // Display order for periods
  const periodOrder = ['This Week', 'Next Week', 'This Month', 'Later'];

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
      
      {/* Time-based Transaction Grouping */}
      {periodOrder.map(period => {
        if (!groupedTransactions[period] || groupedTransactions[period].length === 0) return null;
        
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
              {groupedTransactions[period].map(transaction => {
                const txDate = getTransactionDate(transaction);
                if (!txDate) return null;
                
                const timeUntil = formatTimeDistance(txDate);
                const daysLeft = Math.ceil((txDate - today) / (1000 * 60 * 60 * 24));
                
                const statusClass = 
                  daysLeft <= 3 ? 'bg-red-900/30 border-red-800/50' :
                  daysLeft <= 7 ? 'bg-amber-900/30 border-amber-800/50' :
                  'bg-blue-900/30 border-blue-800/50';
                
                return (
                  <div 
                    key={transaction.id}
                    onClick={() => onBillClick && onBillClick(transaction)}
                    className={`${statusClass} rounded-lg p-3 border cursor-pointer hover:bg-opacity-60 transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white flex items-center">
                          {transaction.name}
                          {transaction.amount > 0 ? (
                            <TrendingUp size={14} className="ml-1 text-green-400" />
                          ) : (
                            <TrendingDown size={14} className="ml-1 text-red-400" />
                          )}
                        </div>
                        <div className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          <span>
                            {txDate.toLocaleDateString()} <span className="text-slate-400">({timeUntil})</span>
                          </span>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-300'}`}>
                        {transaction.amount > 0 ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                    
                    {/* Progress Bar for Days Left */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                        <span>{txDate.toLocaleDateString('default', { weekday: 'short' })}</span>
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
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UpcomingBills;