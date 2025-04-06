import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RepeatIcon, TrendingUp, TrendingDown, X, ArrowLeft } from 'lucide-react';
import { getCategoryById, getCategoryIconComponent } from '../../utils/financeUtils';
import { formatDateForStorage } from '../../utils/dateUtils';

const CalendarView = ({ transactions = [], bills = [], onDateClick, currency = '$' }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayTransactions, setDayTransactions] = useState([]);
  
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
    return `${currency}${Math.abs(parseFloat(amount)).toFixed(2)}`;
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
        bills: dayBills,
        // Calculate totals for this day
        income: [...dayTransactions, ...dayBills]
          .filter(t => (t.amount || 0) > 0)
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
        expense: [...dayTransactions, ...dayBills]
          .filter(t => (t.amount || 0) < 0)
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0),
        totalItems: dayTransactions.length + dayBills.length
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

  // Handle day click to show transactions
  const handleDayClick = (day) => {
    if (!day.day) return; // Skip empty days
    
    setSelectedDay(day);
    
    // Combine transactions and bills for the day
    const allItems = [
      ...day.transactions.map(t => ({
        ...t,
        type: 'transaction'
      })),
      ...day.bills.map(b => ({
        ...b,
        type: 'recurring'
      }))
    ];
    
    // Sort by amount (expenses first, then income)
    allItems.sort((a, b) => {
      // First sort by type: expenses (negative) before income (positive)
      if ((a.amount < 0 && b.amount > 0) || (a.amount > 0 && b.amount < 0)) {
        return a.amount < 0 ? -1 : 1;
      }
      // Then sort by absolute amount (largest first)
      return Math.abs(b.amount) - Math.abs(a.amount);
    });
    
    setDayTransactions(allItems);
    
    // If there's an external click handler, call it too
    if (onDateClick) {
      onDateClick(day.date);
    }
  };
  
  // Calendar data
  const calendarData = generateCalendarData();
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Determine if today is in the current month
  const today = new Date();
  const isToday = (day) => {
    return day.date === formatDateForStorage(today);
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Get net value for a day (to determine color)
  const getDayNetValue = (day) => {
    return day.income - day.expense;
  };
  
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
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Day names */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-slate-500 dark:text-slate-400 py-2 font-medium">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarData.map((day, index) => {
          // Calculate net value to determine color indicators
          const netValue = getDayNetValue(day);
          const hasIncome = day.income > 0;
          const hasExpense = day.expense > 0;
          const hasBoth = hasIncome && hasExpense;
          
          return (
            <div 
              key={index}
              className={`min-h-[70px] sm:min-h-[90px] relative border border-slate-200 dark:border-slate-700 rounded ${
                day.day ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/70' : ''
              } ${isToday(day) ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}`}
              onClick={() => day.day > 0 && handleDayClick(day)}
            >
              {day.day > 0 && (
                <>
                  {/* Day number */}
                  <div className={`p-1 text-xs sm:text-sm font-medium ${
                    isToday(day) 
                      ? 'bg-amber-500 dark:bg-amber-600 text-white rounded-tr-md rounded-bl-md absolute top-0 right-0 w-6 h-6 flex items-center justify-center' 
                      : 'text-slate-800 dark:text-white p-1'
                  }`}>
                    {day.day}
                  </div>
                  
                  {/* Transaction indicators for mobile - simplified dots */}
                  <div className="mt-6 sm:mt-10 flex flex-col gap-1 items-center justify-center px-1">
                    {/* Color-coded indicators based on net value */}
                    {day.totalItems > 0 && (
                      <div className="flex flex-wrap justify-center gap-1">
                        {hasBoth ? (
                          // Show both indicators if there's income and expense
                          <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
                            <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
                          </div>
                        ) : netValue >= 0 ? (
                          <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"></span>
                        )}
                        
                        {/* Badge for multiple items */}
                        {day.totalItems > 1 && (
                          <span className="text-xs sm:text-sm bg-slate-100 dark:bg-slate-700 px-1 rounded-full text-slate-700 dark:text-slate-300">
                            {day.totalItems}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Amounts visible only on larger screens */}
                    <div className="hidden sm:flex flex-col items-center text-xs">
                      {hasIncome && (
                        <span className="text-green-600 dark:text-green-400">
                          +{formatCurrency(day.income)}
                        </span>
                      )}
                      {hasExpense && (
                        <span className="text-red-600 dark:text-red-400">
                          -{formatCurrency(day.expense)}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Day transactions modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft size={16} />
                </button>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">
                  {formatDate(selectedDay.date)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-4 overflow-y-auto flex-1">
              {dayTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-700 dark:text-slate-400">No transactions on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Summary */}
                  <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 flex justify-between">
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Income</div>
                      <div className="text-base font-medium text-green-600 dark:text-green-400">
                        +{formatCurrency(selectedDay.income)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Expenses</div>
                      <div className="text-base font-medium text-red-600 dark:text-red-400">
                        -{formatCurrency(selectedDay.expense)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Net</div>
                      <div className={`text-base font-medium ${selectedDay.income - selectedDay.expense >= 0 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-amber-600 dark:text-amber-400'}`}>
                        {selectedDay.income - selectedDay.expense >= 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(selectedDay.income - selectedDay.expense))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Transaction list */}
                  {dayTransactions.map((item, idx) => {
                    const category = getCategoryById(item.category);
                    return (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        item.amount >= 0 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30' 
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                              {item.name}
                              {item.type === 'recurring' && (
                                <RepeatIcon size={14} className="text-amber-600 dark:text-amber-400" title={`Repeats ${item.frequency}`} />
                              )}
                            </div>
                            
                            {category && (
                              <div className="text-xs mt-1">
                                <span className="bg-slate-200 dark:bg-slate-700/70 px-1.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                  {getCategoryIconComponent(item.category, 10)}
                                  <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className={`text-lg font-bold ${item.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-300'}`}>
                            {item.amount > 0 ? (
                              <div className="flex items-center">
                                <TrendingUp size={14} className="mr-1" />
                                +{formatCurrency(item.amount)}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <TrendingDown size={14} className="mr-1" />
                                -{formatCurrency(Math.abs(item.amount))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {item.notes && (
                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-2 rounded">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;