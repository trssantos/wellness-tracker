import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RepeatIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { getCategoryById, getCategoryIconComponent } from '../../utils/financeUtils';
import { formatDateForStorage } from '../../utils/dateUtils';

const CalendarView = ({ transactions = [], bills = [], onDateClick, currency = '$' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${Math.abs(amount).toFixed(2)}`;
  };
  
  // Generate calendar data
  const generateCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Create calendar grid
    const calendarDays = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ day: 0, transactions: [], bills: [] });
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDateForStorage(date);
      
      // Get transactions for this date
      const dayTransactions = transactions.filter(t => {
        const txDate = t.date || t.timestamp;
        if (!txDate) return false;
        
        if (typeof txDate === 'string' && txDate.includes('T')) {
          return txDate.split('T')[0] === dateString;
        }
        
        return formatDateForStorage(new Date(txDate)) === dateString;
      });
      
      // Get bills for this date
      const dayBills = bills.filter(b => {
        if (!b.nextDate) return false;
        const billDate = new Date(b.nextDate);
        return billDate.getFullYear() === year && 
               billDate.getMonth() === month && 
               billDate.getDate() === day;
      });
      
      calendarDays.push({
        day,
        date: dateString,
        transactions: dayTransactions,
        bills: dayBills
      });
    }
    
    return calendarDays;
  };
  
  // Navigate to previous/next month
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  // Calendar data
  const calendarData = generateCalendarData();
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 className="text-lg font-medium text-slate-800 dark:text-white">
          {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day names */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-slate-500 dark:text-slate-400 py-2 font-medium">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarData.map((day, index) => (
          <div 
            key={index}
            className={`p-1 min-h-[80px] text-center border border-slate-200 dark:border-slate-700 rounded ${
              day.day ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700' : ''
            }`}
            onClick={() => day.day && onDateClick && onDateClick(day.date)}
          >
            {day.day > 0 && (
              <>
                <div className={`text-sm font-medium ${
                  formatDateForStorage(new Date()) === day.date
                    ? 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                    : 'text-slate-800 dark:text-white'
                }`}>
                  {day.day}
                </div>
                
                {/* Transaction indicators */}
                <div className="mt-1 flex flex-col gap-1 items-center">
                  {day.transactions.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1">
                      {day.transactions.slice(0, 3).map((t, i) => {
                        const category = getCategoryById(t.category);
                        return (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${t.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            title={`${t.name}: ${formatCurrency(t.amount)}`}
                          ></span>
                        );
                      })}
                      {day.transactions.length > 3 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">+{day.transactions.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Bill indicators */}
                  {day.bills.length > 0 && (
                    <div className="flex flex-col gap-1 w-full">
                      {day.bills.map((bill, i) => (
                        <div 
                          key={i}
                          className="text-xs flex items-center gap-1 justify-center"
                          title={`${bill.name}: ${formatCurrency(bill.amount)}`}
                        >
                          <RepeatIcon size={10} className="text-amber-500 dark:text-amber-400" />
                          <span className={`text-xs ${bill.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} truncate max-w-[60px]`}>
                            {bill.name}
                          </span>
                        </div>
                      )).slice(0, 2)}
                      
                      {day.bills.length > 2 && (
                        <div 
                          className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded w-full"
                          title={`${day.bills.length} recurring item(s)`}
                        >
                          {formatCurrency(day.bills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Total for the day */}
                  {(day.transactions.length > 0 || day.bills.length > 0) && (
                    <div className="mt-1 text-xs w-full">
                      <div className="flex justify-between px-1">
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(
                            [...day.transactions, ...day.bills]
                              .filter(item => item.amount > 0)
                              .reduce((sum, item) => sum + Math.abs(item.amount), 0)
                          )}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(
                            [...day.transactions, ...day.bills]
                              .filter(item => item.amount < 0)
                              .reduce((sum, item) => sum + Math.abs(item.amount), 0)
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;