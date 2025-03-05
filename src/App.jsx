import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { SectionContainer } from './components/Navigation/SectionContainer';
import { Overview } from './components/Sections/Overview';
import { Stats } from './components/Sections/Stats';
import { MeditationSection, DayCoachSection, TemplatesSection } from './components/Sections/Placeholders';
import HabitsPlaceholder from './components/Sections/HabitsPlaceholder';
import { FlowGuide } from './components/FlowGuide';
import { FloatingMenu } from './components/FloatingMenu';
import { DayChecklist } from './components/DayChecklist';
import { MoodSelector } from './components/MoodSelector';
import { DayActionSelector } from './components/DayActionSelector';
import { AITaskGenerator } from './components/AITaskGenerator';
import { CustomTaskListCreator } from './components/CustomTaskListCreator';
import { TaskListSelector } from './components/TaskListSelector';
import { DayNotes } from './components/DayNotes';
import { WorkoutTracker } from './components/WorkoutTracker';
import { ReminderSettings } from './components/ReminderSettings';
import { Settings } from './components/Settings';
import { ThemeProvider } from './components/ThemeProvider';
import { TaskReminder } from './components/TaskReminder';
import { VoiceTaskInput } from './components/VoiceTaskInput';
import MoodTimeTracker from './components/MoodTimeTracker'; // Import the new component
import { getStorage, setStorage } from './utils/storage';
import reminderService from './utils/reminderService';
import { migrateToMorningEveningFormat } from './utils/dataMigration';
import { findPreviousTaskDate, importDeferredTasks } from './utils/taskDeferralService';
import { DEFAULT_CATEGORIES } from './utils/defaultTasks';
import PendingTasksModal from './components/PendingTasksModal';
import HabitSection from './components/Sections/HabitSection';
import HabitTaskIntegration from './components/HabitTaskIntegration';
import { injectHabitTasks } from './utils/habitTrackerUtils';
import WorkoutSection from './components/Sections/WorkoutSection';


const App = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [storageData, setStorageData] = useState(getStorage());
  const [storageVersion, setStorageVersion] = useState(0);
  const [voiceInputDate, setVoiceInputDate] = useState(null);
  
  // Add new state for mood time tracker
  const [moodTimeDate, setMoodTimeDate] = useState(null);
  const [moodTimeDefaultTime, setMoodTimeDefaultTime] = useState('morning');
  const [pendingTasksDate, setPendingTasksDate] = useState(null);
const [pendingTasksForDate, setPendingTasksForDate] = useState(null);


  // Initialize reminder service on app start and run data migration
  useEffect(() => {
    // Run data migration for mood/energy levels
    const migrationResult = migrateToMorningEveningFormat();
    if (migrationResult.migrated) {
      console.log(`Data migration complete: Migrated ${migrationResult.count} entries to morning/evening format`);
      // Update the storage data after migration
      setStorageData(getStorage());
    }
    
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
    
    // Add a handler for opening actions from task reminders
    window.openTaskReminderAction = handleTaskReminderAction;
    
    // Setup service worker message listener for notification clicks
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event.data);
        
        // Handle open-reminder message
        if (event.data && event.data.type === 'open-reminder') {
          const today = new Date().toISOString().split('T')[0];
          handleDaySelect(today);
        }
        
        // Handle open-task-reminder message
        if (event.data && event.data.type === 'open-task-reminder') {
          if (event.data.dateKey && event.data.taskText) {
            handleTaskReminderAction(event.data.dateKey, event.data.taskText);
          }
        }
      });
    }
  }, []);

  // This function checks for pending tasks and shows the modal if needed
  const checkForPendingTasks = (currentDate) => {
    console.log('Checking for pending tasks for date:', currentDate);
    const prevDate = findPreviousTaskDate(currentDate);
    console.log('Previous date with pending tasks:', prevDate);
    
    if (prevDate) {
      console.log('Found pending tasks from date:', prevDate);
      setPendingTasksDate(prevDate);
      setPendingTasksForDate(currentDate);
      
      // Use setTimeout to ensure the state updates before showing the modal
      setTimeout(() => {
        const modal = document.getElementById('pending-tasks-modal');
        if (modal) {
          modal.showModal();
        } else {
          console.error('Pending tasks modal not found');
        }
      }, 100);
      
      return true;
    }
    return false;
  };

  // Add function to handle task-specific reminders
  const handleTaskReminderAction = (dateKey, taskText) => {
    console.log('Opening task reminder for date:', dateKey, 'and task:', taskText);
    
    // First select the date
    setSelectedDay(dateKey);
    
    // Then open the checklist modal
    setTimeout(() => {
      document.getElementById('checklist-modal').showModal();
    }, 100);
  };

  const handleVoiceInput = (dateStr) => {
    setVoiceInputDate(dateStr);
    document.getElementById('voice-task-modal').showModal();
  };

  const handleStorageUpdate = () => {
    setStorageData(getStorage());
    setStorageVersion(prev => prev + 1); // Increment version to force re-render
  };

  const handleDaySelect = (dateStr) => {
    setSelectedDay(dateStr);

    // Inject habit tasks into the daily task list
  injectHabitTasks(dateStr);

    document.getElementById('day-action-modal').showModal();
  };

  const handleDayAction = (action) => {
    document.getElementById('day-action-modal').close();
    
    setTimeout(() => {
      if (action === 'mood') {
        // Set the mood time date and open modal
        setMoodTimeDate(selectedDay);
        document.getElementById('mood-time-tracker-modal').showModal();
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
      } else if (action === 'notes') {
        document.getElementById('notes-modal').showModal();
      } else if (action === 'workout') {
        document.getElementById('workout-modal').showModal();
      }
    }, 100);
  };

  // Update the handleTaskTypeSelection function in App.jsx

  const handleTaskTypeSelection = (type) => {
    document.getElementById('task-list-selector-modal').close();
    
    if (type === 'default') {
      // Create default tasks
      const storage = getStorage();
      const dayData = storage[selectedDay] || {};
      
      // Only create if this date doesn't already have tasks
      if (!dayData.customTasks && !dayData.aiTasks && !dayData.defaultTasks) {
        // Store the DEFAULT_CATEGORIES directly in the storage
        const defaultTasks = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
        
        // Initialize checked state
        const initialChecked = {};
        defaultTasks.forEach(category => {
          category.items.forEach(item => {
            initialChecked[item] = false;
          });
        });
        
        // Save to storage
        storage[selectedDay] = {
          ...dayData,
          defaultTasks: defaultTasks, // Store the tasks explicitly
          checked: initialChecked
        };
        setStorage(storage);

        injectHabitTasks(selectedDay);

        handleStorageUpdate();
        
        console.log('Created default task list with', Object.keys(initialChecked).length, 'tasks');
        
        // Now check for pending tasks
        if (!checkForPendingTasks(selectedDay)) {
          // If no pending tasks, open checklist directly
          setTimeout(() => {
            document.getElementById('checklist-modal').showModal();
          }, 100);
        }
      } else {
        // Tasks already exist, just open the checklist
        setTimeout(() => {
          document.getElementById('checklist-modal').showModal();
        }, 100);
      }
    } else if (type === 'ai') {
      // For AI tasks, just open the generator
      setTimeout(() => {
        const aiModal = document.getElementById('ai-generator-modal');
        if (aiModal) {
          aiModal.dataset.selectedDate = selectedDay;
          aiModal.showModal();
        }
      }, 100);
    } else if (type === 'custom') {
      // For custom tasks, just open the creator
      setTimeout(() => {
        const customModal = document.getElementById('custom-tasklist-modal');
        if (customModal) {
          customModal.showModal();
        }
      }, 100);
    }
  };

// Update the handleAITasksGenerated function in App.jsx
const handleAITasksGenerated = (generatedDate) => {
  // Update storage data
  const dateToUse = generatedDate || selectedDay;

  injectHabitTasks(dateToUse);

  handleStorageUpdate();
  
  if (dateToUse !== selectedDay) {
    setSelectedDay(dateToUse);
  }
  
  document.getElementById('ai-generator-modal').close();

  // Check for pending tasks
  if (!checkForPendingTasks(dateToUse)) {
    // If no pending tasks, open checklist directly
    setTimeout(() => {
      document.getElementById('checklist-modal').showModal();
    }, 100);
  }
};

// Update the handleCustomTasksCreated function in App.jsx
const handleCustomTasksCreated = () => {
  // Close the custom task modal first
  document.getElementById('custom-tasklist-modal').close();

  injectHabitTasks(selectedDay);
  
  // Update storage state
  handleStorageUpdate();
  
  // Check for pending tasks
  if (!checkForPendingTasks(selectedDay)) {
    // If no pending tasks, open checklist directly
    setTimeout(() => {
      document.getElementById('checklist-modal').showModal();
    }, 100);
  }
};

const handlePendingTasksAction = (action, tasks = []) => {
  console.log('Handling pending tasks action:', action, 'with tasks:', tasks);
  
  if (action === 'import' && tasks.length > 0) {
    // Import tasks into the current day
    console.log('Importing tasks into day:', pendingTasksForDate);
    importDeferredTasks(pendingTasksForDate, tasks);

    injectHabitTasks(pendingTasksForDate);

    handleStorageUpdate();
  }
  
  // Close pending tasks modal
  const modal = document.getElementById('pending-tasks-modal');
  if (modal) {
    modal.close();
  }
  
  // Reset pending tasks state
  setPendingTasksDate(null);
  setPendingTasksForDate(null);
  
  // Open regular checklist with the current date
  setTimeout(() => {
    setSelectedDay(pendingTasksForDate);
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

  const handleHelpOpen = () => {
    document.getElementById('guide-modal').showModal();
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="flex">
          {/* Sidebar Navigation */}
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection}
            onReminderSettingsOpen={handleReminderSettingsOpen}
            onSettingsOpen={handleSettingsOpen}
            onHelpOpen={handleHelpOpen}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 md:ml-20 lg:ml-64 transition-all flex justify-center">
            <div className="w-full max-w-4xl px-4">
              {/* Section Containers */}
              <SectionContainer id="overview" isActive={activeSection === 'overview'}>
                <Overview 
                  selectedDay={selectedDay}
                  onSelectDay={handleDaySelect}
                  currentMonth={currentMonth}
                  onMonthChange={setCurrentMonth}
                  storageData={storageData}
                />
              </SectionContainer>

              <SectionContainer id="stats" isActive={activeSection === 'stats'}>
                <Stats 
                  storageData={storageData}
                  currentMonth={currentMonth}
                />
              </SectionContainer>
              <SectionContainer id="habits" isActive={activeSection === 'habits'}>
  <HabitSection />
</SectionContainer>

              <SectionContainer id="meditation" isActive={activeSection === 'meditation'}>
                <MeditationSection />
              </SectionContainer>

              <SectionContainer id="workout" isActive={activeSection === 'workout'}>
  <WorkoutSection />
</SectionContainer>

              <SectionContainer id="coach" isActive={activeSection === 'coach'}>
                <DayCoachSection />
              </SectionContainer>

              <SectionContainer id="templates" isActive={activeSection === 'templates'}>
                <TemplatesSection />
              </SectionContainer>



              <SectionContainer id="habitsShowcase" isActive={activeSection === 'habitsShowcase'}>
  <HabitsPlaceholder />
</SectionContainer>
              
            </div>
          </div>
        </div>

        {/* Floating action button */}
        <FloatingMenu 
          onDaySelect={handleDaySelect}
          onVoiceInput={handleVoiceInput}
        />
        
        {/* Modals */}
        <FlowGuide />
        
        <DayActionSelector
          date={selectedDay}
          onClose={() => {
            document.getElementById('day-action-modal').close();
          }}
          onSelectAction={handleDayAction}
        />
        
        {/* New Morning/Evening Mood Tracker */}
        <MoodTimeTracker
          date={moodTimeDate}
          onClose={() => {
            document.getElementById('mood-time-tracker-modal').close();
            setMoodTimeDate(null);
            handleStorageUpdate();
          }}
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

        {/* Pending Tasks Modal */}
        <PendingTasksModal
  currentDate={pendingTasksForDate}
  previousDate={pendingTasksDate}
  onAction={handlePendingTasksAction}
/>

        <VoiceTaskInput 
          date={voiceInputDate}
          onClose={() => {
            document.getElementById('voice-task-modal').close();
            setVoiceInputDate(null);
            handleStorageUpdate();
          }}
          onTaskAdded={(taskType) => {
            console.log('Task added via voice to task type:', taskType);
            handleStorageUpdate();
            
            // After voice task is added, close the modal and directly open checklist
            if (voiceInputDate) {
              // Close the current modal
              document.getElementById('voice-task-modal').close();
              
              // Update selected day
              setSelectedDay(voiceInputDate);
              
              // Force a storage version update to ensure the latest data is shown
              setStorageVersion(prev => prev + 1);
              
              // Directly open the checklist modal instead of the task selector
              setTimeout(() => {
                const checklistModal = document.getElementById('checklist-modal');
                if (checklistModal) {
                  checklistModal.showModal();
                } else {
                  console.error('Could not find checklist-modal element');
                  // Fallback to the regular flow if modal not found
                  handleDayAction('progress');
                }
              }, 100);
            }
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default App; 