import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getStorage } from '../utils/storage';

export const Calendar = ({ selectedDay, onSelectDay }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const modal = document.getElementById('checklist-modal');
    if (selectedDay && modal) {
      modal.showModal();
    }
  }, [selectedDay]);

  const weeks = getCalendarWeeks(currentMonth);
  const storedData = getStorage();

  const getTotalItemCount = () => {
    const categories = [
      {
        title: "Morning Essentials",
        items: ["Open curtains for natural light", "Drink water with lemon", "3 deep breaths", 
                "Gentle 2-min stretch", "Make bed", "Basic hygiene without rushing", "Simple breakfast"]
      },
      {
        title: "Work Focus",
        items: ["Clear desk space", "Write top 3 tasks", "Check calendar", "Fill water bottle", 
                "Close unnecessary tabs", "Set first timer (25min)", "Quick workspace tidy"]
      },
      {
        title: "Creative Time",
        items: ["15-min coding practice", "Take one photo", "Write new project ideas", 
                "Document progress", "Quick inspiration browse", "Review learning notes"]
      },
      {
        title: "Self Care",
        items: ["Eat regular meal", "Take vitamins", "Stand/walk break", "Eye rest break", 
                "Shoulder stretches", "Hydration check", "5-min meditation"]
      },
      {
        title: "Evening Routine",
        items: ["Clean workspace", "Tomorrow's simple plan", "Relaxing activity", "Dim lights", 
                "Device wind-down", "Gratitude moment", "Set out tomorrow's clothes"]
      }
    ];
    
    return categories.reduce((total, category) => total + category.items.length, 0);
  };

  const getCompletionRate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayData = storedData[dateStr];
    
    if (!dayData || !dayData.checked) return 0;
    
    const totalPossibleItems = getTotalItemCount();
    const checkedItems = Object.values(dayData.checked).filter(Boolean).length;
    
    return Math.round((checkedItems / totalPossibleItems) * 100);
  };

  const getColorClass = (rate) => {
    if (rate === 0) return 'bg-white';
    if (rate <= 25) return 'bg-red-50';
    if (rate <= 50) return 'bg-yellow-50';
    if (rate <= 75) return 'bg-lime-50';
    return 'bg-green-50';
  };

  const getDotColor = (rate) => {
    if (rate <= 25) return 'bg-red-500';
    if (rate <= 50) return 'bg-yellow-500';
    if (rate <= 75) return 'bg-lime-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(prevMonth(currentMonth))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentMonth(nextMonth(currentMonth))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-slate-600">
              {day}
            </div>
          ))}
          
          {weeks.map((week, i) => 
            week.map((date, j) => {
              const dateStr = date.toISOString().split('T')[0];
              const completionRate = getCompletionRate(date);
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isSelected = selectedDay === dateStr;
              
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => onSelectDay(dateStr)}
                  className={`
                    aspect-square rounded-lg p-2 relative
                    ${isCurrentMonth ? getColorClass(completionRate) : 'bg-slate-50 opacity-50'}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    hover:ring-2 hover:ring-blue-200 transition-all
                  `}
                >
                  <span className="text-sm text-slate-600">{date.getDate()}</span>
                  {completionRate > 0 && (
                    <>
                      <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-full ${getDotColor(completionRate)}`} />
                      <div className="absolute top-1 right-1 text-xs text-slate-400">
                        {completionRate}%
                      </div>
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const getCalendarWeeks = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());
  
  const weeks = [];
  let currentWeek = [];
  
  for (let i = 0; i < 42; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    
    currentWeek.push(current);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  return weeks;
};

const prevMonth = (date) => {
  const prev = new Date(date);
  prev.setMonth(prev.getMonth() - 1);
  return prev;
};

const nextMonth = (date) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
};

export default Calendar;