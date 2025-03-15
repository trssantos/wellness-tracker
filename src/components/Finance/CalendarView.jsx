import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarView = ({ transactions, bills, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
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
      const dateString = date.toISOString().split('T')[0];
      
      // Get transactions for this date
      const dayTransactions = transactions.filter(t => {
        return t.date === dateString;
      });
      
      // Get bills for this date
      const dayBills = bills.filter(b => {
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
    <div className="bg-slate-800 dark:bg-slate-800 rounded-lg p-4">
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-300"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 className="text-lg font-medium text-white">
          {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day names */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-slate-400 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarData.map((day, index) => (
          <div 
            key={index}
            className={`p-1 min-h-[80px] text-center border border-slate-700 rounded ${
              day.day ? 'cursor-pointer hover:bg-slate-700' : ''
            }`}
            onClick={() => day.day && onDateClick && onDateClick(day.date)}
          >
            {day.day > 0 && (
              <>
                <div className={`text-sm font-medium ${
                  new Date().toISOString().split('T')[0] === day.date
                    ? 'text-amber-400 bg-amber-900/30 rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                    : 'text-white'
                }`}>
                  {day.day}
                </div>
                
                {/* Transaction indicators */}
                <div className="mt-1 flex flex-col gap-1 items-center">
                  {day.transactions.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1">
                      {day.transactions.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full ${t.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                          title={`${t.name}: $${Math.abs(t.amount).toFixed(2)}`}
                        ></span>
                      ))}
                      {day.transactions.length > 3 && (
                        <span className="text-xs text-slate-400">+{day.transactions.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Bill indicators */}
                  {day.bills.length > 0 && (
                    <div 
                      className="text-xs bg-amber-900/30 text-amber-400 px-1 py-0.5 rounded w-full"
                      title={`${day.bills.length} bill(s) due`}
                    >
                      ${day.bills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0).toFixed(2)}
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