import React from 'react';
import { Calendar, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

const UpcomingBills = ({ bills, onBillClick, currency = '$' }) => {
  if (!bills || bills.length === 0) {
    return (
      <div className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-center h-40">
        <div className="text-center">
          <Calendar size={24} className="text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No upcoming bills</p>
        </div>
      </div>
    );
  }

  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${Math.abs(amount).toFixed(2)}`;
  };

  // Group bills by due date
  const today = new Date();
  const overdue = [];
  const dueSoon = [];
  const upcoming = [];

  bills.forEach(bill => {
    const dueDate = new Date(bill.nextDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      overdue.push({ ...bill, daysDiff: diffDays });
    } else if (diffDays <= 7) {
      dueSoon.push({ ...bill, daysDiff: diffDays });
    } else {
      upcoming.push({ ...bill, daysDiff: diffDays });
    }
  });

  return (
    <div className="space-y-4">
      {/* Overdue bills */}
      {overdue.length > 0 && (
        <div>
          <h4 className="text-red-400 text-sm font-medium mb-2 flex items-center gap-1">
            <AlertCircle size={16} />
            Overdue
          </h4>
          
          <div className="space-y-2">
            {overdue.map(bill => (
              <div 
                key={bill.id}
                onClick={() => onBillClick && onBillClick(bill)}
                className="bg-red-900/30 border border-red-800/50 rounded-lg p-3 cursor-pointer hover:bg-red-900/40 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white flex items-center">
                      {bill.name}
                      {bill.amount > 0 ? (
                        <TrendingUp size={14} className="ml-1 text-green-400" />
                      ) : (
                        <TrendingDown size={14} className="ml-1 text-red-400" />
                      )}
                    </div>
                    <div className="text-xs text-red-300 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(bill.nextDate).toLocaleDateString()} ({Math.abs(bill.daysDiff)} days overdue)
                      </span>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${bill.amount > 0 ? 'text-green-400' : 'text-red-300'}`}>
                    {bill.amount > 0 ? '+' : ''}
                    {formatCurrency(bill.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Due soon */}
      {dueSoon.length > 0 && (
        <div>
          <h4 className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-1">
            <Clock size={16} />
            Due Soon
          </h4>
          
          <div className="space-y-2">
            {dueSoon.map(bill => (
              <div 
                key={bill.id}
                onClick={() => onBillClick && onBillClick(bill)}
                className={`${bill.amount > 0 
                  ? 'bg-green-900/30 border border-green-800/50 hover:bg-green-900/40' 
                  : 'bg-amber-900/30 border border-amber-800/50 hover:bg-amber-900/40'} 
                  rounded-lg p-3 cursor-pointer transition-colors`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white flex items-center">
                      {bill.name}
                      {bill.amount > 0 ? (
                        <TrendingUp size={14} className="ml-1 text-green-400" />
                      ) : (
                        <TrendingDown size={14} className="ml-1 text-amber-400" />
                      )}
                    </div>
                    <div className="text-xs text-amber-300 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(bill.nextDate).toLocaleDateString()} ({bill.daysDiff === 0 ? 'Today' : `${bill.daysDiff} days`})
                      </span>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${bill.amount > 0 ? 'text-green-400' : 'text-amber-300'}`}>
                    {bill.amount > 0 ? '+' : ''}
                    {formatCurrency(bill.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h4 className="text-blue-400 text-sm font-medium mb-2 flex items-center gap-1">
            <Calendar size={16} />
            Upcoming
          </h4>
          
          <div className="space-y-2">
            {upcoming.slice(0, 3).map(bill => (
              <div 
                key={bill.id}
                onClick={() => onBillClick && onBillClick(bill)}
                className={`${bill.amount > 0 
                  ? 'bg-green-900/30 border border-green-800/50 hover:bg-green-900/40' 
                  : 'bg-blue-900/30 border border-blue-800/50 hover:bg-blue-900/40'} 
                  rounded-lg p-3 cursor-pointer transition-colors`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white flex items-center">
                      {bill.name}
                      {bill.amount > 0 ? (
                        <TrendingUp size={14} className="ml-1 text-green-400" />
                      ) : (
                        <TrendingDown size={14} className="ml-1 text-blue-400" />
                      )}
                    </div>
                    <div className="text-xs text-blue-300 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(bill.nextDate).toLocaleDateString()} (in {bill.daysDiff} days)
                      </span>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${bill.amount > 0 ? 'text-green-400' : 'text-blue-300'}`}>
                    {bill.amount > 0 ? '+' : ''}
                    {formatCurrency(bill.amount)}
                  </div>
                </div>
              </div>
            ))}
            
            {upcoming.length > 3 && (
              <button className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2">
                View all {upcoming.length} upcoming bills
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingBills;