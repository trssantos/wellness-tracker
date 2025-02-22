import React, { useState, useEffect } from 'react';
import { Calendar } from './components/Calendar';
import { FlowGuide } from './components/FlowGuide';
import { FloatingMenu } from './components/FloatingMenu';
import { DayChecklist } from './components/DayChecklist';
import { MoodSelector } from './components/MoodSelector';
import { MonthlyOverview } from './components/MonthlyOverview';
import { DayActionSelector } from './components/DayActionSelector';
import { HelpCircle } from 'lucide-react';
import { getStorage } from './utils/storage';

const App = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [storageData, setStorageData] = useState(getStorage());

  const handleStorageUpdate = () => {
    setStorageData(getStorage());
  };

  const handleDaySelect = (dateStr) => {
    setSelectedDay(dateStr);
    document.getElementById('day-action-modal').showModal();
  };

  // Keep the selected date when transitioning between modals
  const handleDayAction = (action) => {
    // The selectedDay is already set from handleDaySelect
    if (action === 'mood') {
      document.getElementById('day-action-modal').close();
      setTimeout(() => {
        document.getElementById('mood-modal').showModal();
      }, 100);
    } else if (action === 'progress') {
      document.getElementById('day-action-modal').close();
      setTimeout(() => {
        document.getElementById('checklist-modal').showModal();
      }, 100);
    }
  };

  const handleLogProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDay(today);
    document.getElementById('checklist-modal').showModal();
  };

  const handleLogMood = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDay(today);
    document.getElementById('mood-modal').showModal();
  };

  // Only clear selectedDay when completely done
  const handleCloseAction = () => {
    document.getElementById('day-action-modal').close();
    // Don't clear selectedDay here since we need it for the next modal
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Daily Progress Tracker</h1>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            onClick={() => document.getElementById('guide-modal').showModal()}
          >
            <HelpCircle size={20} />
            <span>Guide</span>
          </button>
        </header>

        <MonthlyOverview 
          currentMonth={currentMonth} 
          storageData={storageData}
        />
        
        <main>
          <Calendar 
            selectedDay={selectedDay} 
            onSelectDay={handleDaySelect}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            storageData={storageData}
          />
        </main>
      </div>

      <FloatingMenu 
        onLogProgress={handleLogProgress}
        onLogMood={handleLogMood}
      />
      
      <FlowGuide />
      
      <DayActionSelector
        date={selectedDay}
        onClose={handleCloseAction}
        onSelectAction={handleDayAction}
      />

      <MoodSelector 
        date={selectedDay} 
        onClose={() => {
          document.getElementById('mood-modal').close();
          setSelectedDay(null); // Clear selectedDay only when completely done
          handleStorageUpdate();
        }} 
      />
      
      <DayChecklist 
        date={selectedDay}
        onClose={() => {
          document.getElementById('checklist-modal').close();
          setSelectedDay(null); // Clear selectedDay only when completely done
          handleStorageUpdate();
        }}
      />
    </div>
  );
};

export default App;