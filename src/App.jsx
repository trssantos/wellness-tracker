import React, { useState, useEffect } from 'react';
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
import { ReminderSettings } from './components/ReminderSettings';
import { Settings } from './components/Settings';
import { ThemeToggle } from './components/ThemeToggle';
import { MobileThemeToggle } from './components/MobileThemeToggle';
import { ThemeProvider } from './components/ThemeProvider';
import { HelpCircle, PenTool, Dumbbell, Bell, Settings as SettingsIcon } from 'lucide-react';
import { getStorage } from './utils/storage';
import reminderService from './utils/reminderService';

const App = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [storageData, setStorageData] = useState(getStorage());
  const [storageVersion, setStorageVersion] = useState(0); // Add this to force updates
  
  // Initialize reminder service on app start
  useEffect(() => {
    // Initialize the reminder service
    reminderService.init();
    
    // Add the service to window for access from other components
    window.reminderService = reminderService;
    
    // Add a handler for opening actions from reminders
    window.openReminderAction = () => {
      // Default action when a notification is clicked is to open today's tasks
      const today = new Date().toISOString().split('T')[0];
      handleDaySelect(today);
    };
    
    // Setup service worker message listener for notification clicks
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event.data);
        
        // Handle open-reminder message
        if (event.data && event.data.type === 'open-reminder') {
          const today = new Date().toISOString().split('T')[0];
          handleDaySelect(today);
        }
      });
    }
  }, []);

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

  const handleReminderSettingsOpen = () => {
    document.getElementById('reminder-settings-modal').showModal();
  };

  const handleSettingsOpen = () => {
    document.getElementById('settings-modal').showModal();
  };

  const handleSettingsClose = (needsRefresh = false) => {
    document.getElementById('settings-modal').close();
    if (needsRefresh) {
      handleStorageUpdate();
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 transition-colors">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">ZenTrack</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button 
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                onClick={handleSettingsOpen}
                aria-label="Settings"
              >
                <SettingsIcon size={20} />
              </button>
              <button 
                className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/40 transition-colors"
                onClick={handleReminderSettingsOpen}
                aria-label="Reminders"
              >
                <Bell size={20} />
              </button>
              <button 
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                onClick={() => document.getElementById('guide-modal').showModal()}
                aria-label="Guide"
              >
                <HelpCircle size={20} />
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
        
        {/* Mobile theme toggle removed - using same header icons on all devices */}
        
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
        
        <ReminderSettings
          onClose={() => {
            document.getElementById('reminder-settings-modal').close();
            handleStorageUpdate();
            
            // Reload reminders when settings are closed
            if (window.reminderService) {
              window.reminderService.loadReminders();
            }
          }}
        />
        
        <Settings
          onClose={handleSettingsClose}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;