import React, { useState } from 'react';
import { Calendar } from './components/Calendar';
import { FlowGuide } from './components/FlowGuide';
import { FloatingMenu } from './components/FloatingMenu';
import { DayChecklist } from './components/DayChecklist';
import { MoodSelector } from './components/MoodSelector';
import { MonthlyOverview } from './components/MonthlyOverview';
import { DayActionSelector } from './components/DayActionSelector';
import { AITaskGenerator } from './components/AITaskGenerator';
import { CustomTaskListCreator } from './components/CustomTaskListCreator';
import { TaskListSelector } from './components/TaskListSelector';
import { DayNotes } from './components/DayNotes';
import { WorkoutTracker } from './components/WorkoutTracker';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeToggle } from './components/ThemeToggle';
import { MobileThemeToggle } from './components/MobileThemeToggle';
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
        // Check if there are any tasks for this day
        const dayData = getStorage()[selectedDay] || {};
        const hasAnyTasks = 
          (dayData.aiTasks && dayData.aiTasks.length > 0) || 
          (dayData.customTasks && dayData.customTasks.length > 0) ||
          // Check if there are any checked items, which would indicate tasks exist
          (dayData.checked && Object.keys(dayData.checked).length > 0);
        
        if (hasAnyTasks) {
          // If tasks exist, go directly to the checklist
          document.getElementById('checklist-modal').showModal();
        } else {
          // If no tasks exist, show the task list selector
          document.getElementById('task-list-selector-modal').showModal();
        }
      } else if (action === 'generate') {
        document.getElementById('ai-generator-modal').showModal();
      } else if (action === 'custom') {
        document.getElementById('custom-tasklist-modal').showModal();
      } else if (action === 'notes') {
        document.getElementById('notes-modal').showModal();
      } else if (action === 'workout') {
        document.getElementById('workout-modal').showModal();
      }
    }, 100);
  };

  const handleTaskTypeSelection = (type) => {
    document.getElementById('task-list-selector-modal').close();
    
    setTimeout(() => {
      if (type === 'default') {
        // For default, directly show the checklist which already loads defaults
        document.getElementById('checklist-modal').showModal();
      } else if (type === 'ai') {
        document.getElementById('ai-generator-modal').showModal();
      } else if (type === 'custom') {
        document.getElementById('custom-tasklist-modal').showModal();
      }
    }, 100);
  };

  const handleAITasksGenerated = (generatedDate) => {
    // Update storage data first
    const updatedStorage = getStorage();
    setStorageData(updatedStorage);
    
    // Use the date from the generator if provided, otherwise use selectedDay
    const dateToUse = generatedDate || selectedDay;
    if (dateToUse !== selectedDay) {
      setSelectedDay(dateToUse);
    }
    
    // Close the AI modal
    document.getElementById('ai-generator-modal').close();
    
    // Force a storage version update to ensure the latest data is shown
    setStorageVersion(prev => prev + 1);
    
    console.log('AI tasks generated, opening checklist for date:', dateToUse);
    
    // Open the checklist modal with a delay
    setTimeout(() => {
      document.getElementById('checklist-modal').showModal();
    }, 100);
  };

  const handleCustomTasksCreated = () => {
    handleStorageUpdate(); // Update storage data first
    document.getElementById('custom-tasklist-modal').close();
    setTimeout(() => {
      document.getElementById('checklist-modal').showModal();
    }, 100);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daily Progress Tracker</h1>
            <div className="flex items-center gap-3">
              {/* Theme toggle only shown on desktop */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                onClick={() => document.getElementById('guide-modal').showModal()}
              >
                <HelpCircle size={20} />
                <span className="hidden sm:inline">Guide</span>
              </button>
            </div>
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
          onDaySelect={handleDaySelect}
        />
        
        {/* Mobile theme toggle fixed position */}
        <MobileThemeToggle />
        
        <FlowGuide />
        
        <DayActionSelector
          date={selectedDay}
          onClose={() => {
            document.getElementById('day-action-modal').close();
          }}
          onSelectAction={handleDayAction}
        />

        <TaskListSelector
          date={selectedDay}
          onClose={() => {
            document.getElementById('task-list-selector-modal').close();
          }}
          onSelectType={handleTaskTypeSelection}
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

        <CustomTaskListCreator
          date={selectedDay}
          onClose={() => {
            document.getElementById('custom-tasklist-modal').close();
            setSelectedDay(null);
            handleStorageUpdate();
          }}
          onTasksGenerated={handleCustomTasksCreated}
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

        <DayNotes 
          date={selectedDay}
          onClose={() => {
            document.getElementById('notes-modal').close();
            setSelectedDay(null);
            handleStorageUpdate();
          }}
        />

        <WorkoutTracker
          date={selectedDay}
          onClose={() => {
            document.getElementById('workout-modal').close();
            setSelectedDay(null);
            handleStorageUpdate();
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;