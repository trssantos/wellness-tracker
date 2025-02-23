import React, { useState } from 'react';
import { Calendar } from './components/Calendar';
import { FlowGuide } from './components/FlowGuide';
import { FloatingMenu } from './components/FloatingMenu';
import { DayChecklist } from './components/DayChecklist';
import { MoodSelector } from './components/MoodSelector';
import { MonthlyOverview } from './components/MonthlyOverview';
import { DayActionSelector } from './components/DayActionSelector';
import { AITaskGenerator } from './components/AITaskGenerator';
import { HelpCircle } from 'lucide-react';
import { getStorage } from './utils/storage';

const App = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [storageData, setStorageData] = useState(getStorage());
  const [storageVersion, setStorageVersion] = useState(0); // Add this to force updates

  const handleStorageUpdate = () => {
    setStorageData(getStorage());
    setStorageVersion(prev => prev + 1); // Increment version to force re-render
  };

  const handleDaySelect = (dateStr) => {
    setSelectedDay(dateStr);
    document.getElementById('day-action-modal').showModal();
  };

  const handleDayAction = (action) => {
    document.getElementById('day-action-modal').close();
    
    setTimeout(() => {
      if (action === 'mood') {
        document.getElementById('mood-modal').showModal();
      } else if (action === 'progress') {
        document.getElementById('checklist-modal').showModal();
      } else if (action === 'generate') {
        document.getElementById('ai-generator-modal').showModal();
      }
    }, 100);
  };

  const handleAITasksGenerated = () => {
    handleStorageUpdate(); // Update storage data first
    document.getElementById('ai-generator-modal').close();
    setTimeout(() => {
      document.getElementById('checklist-modal').showModal();
    }, 100);
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
        onClose={() => {
          document.getElementById('day-action-modal').close();
        }}
        onSelectAction={handleDayAction}
      />

      <AITaskGenerator
        date={selectedDay}
        onClose={() => {
          document.getElementById('ai-generator-modal').close();
          setSelectedDay(null);
          handleStorageUpdate();
        }}
        onTasksGenerated={handleAITasksGenerated}
      />

      <MoodSelector 
        date={selectedDay} 
        onClose={() => {
          document.getElementById('mood-modal').close();
          setSelectedDay(null);
          handleStorageUpdate();
        }} 
      />
      
      <DayChecklist 
        date={selectedDay}
        storageVersion={storageVersion} // Pass this to force updates
        onClose={() => {
          document.getElementById('checklist-modal').close();
          setSelectedDay(null);
          handleStorageUpdate();
        }}
      />
    </div>
  );
};

export default App;