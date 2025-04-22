import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { SectionContainer } from './components/Navigation/SectionContainer';
import { Overview } from './components/Sections/Overview';
import { Stats } from './components/Sections/Stats';
import { MeditationSectionPlaceholder, DayCoachSection } from './components/Sections/Placeholders';
import SleepTracker from './components/SleepTracker';
import TemplatesSection from './components/Sections/TemplatesSection';
import HabitsPlaceholder from './components/Sections/HabitsPlaceholder';
import FinancePlaceholder from './components/Finance/FinancePlaceholder';
import FinanceSection from './components/Finance/FinanceSection';
import FocusPlaceholder from './components/Sections/FocusPlaceholder';
import FocusSection from './components/Sections/FocusSection';
import { FlowGuide } from './components/FlowGuide';
import { FloatingMenu } from './components/FloatingMenu';
import { DayChecklist } from './components/DayChecklist';
import { MoodSelector } from './components/MoodSelector';
import { DayActionSelector } from './components/DayActionSelector';
import { AITaskGenerator } from './components/AITaskGenerator';
import CustomTaskListCreator from './components/CustomTaskListCreator';
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
// Import the WorkoutThemeProvider
import { WorkoutThemeProvider } from './context/ThemeContext';
import { saveFocusSessionState } from './utils/FocusSessionState';
import DayCoach from './components/DayCoach/DayCoach';
import { initTaskRegistry, migrateTasksToRegistry } from './utils/taskRegistry';
import { NutritionPlaceholder } from './components/Nutrition/NutritionPlaceholder';
import NutritionTracker from './components/Nutrition/NutritionTracker';
import BucketList from './components/Goals/BucketList';
import MeditationSection  from './components/Meditation/MeditationSection';
import { formatDateForStorage } from './utils/dateUtils';
import TaskSearchModal from './components/TaskSearchModal';
import NotesSection from './components/Notes/NotesSection';

const App = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [storageData, setStorageData] = useState(getStorage());
  const [storageVersion, setStorageVersion] = useState(0);
  const [voiceInputDate, setVoiceInputDate] = useState(null);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  
  // Add new state for mood time tracker
  const [moodTimeDate, setMoodTimeDate] = useState(null);
  const [moodTimeDefaultTime, setMoodTimeDefaultTime] = useState('morning');
  const [pendingTasksDate, setPendingTasksDate] = useState(null);
const [pendingTasksForDate, setPendingTasksForDate] = useState(null);
const [sleepDate, setSleepDate] = useState(null);
const [taskParams, setTaskParams] = useState(null);
const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

// Track if Focus section has an active session
const hasFocusSession = useRef(false);
const preventNavigationAway = useRef(false);


  // Initialize reminder service on app start and run data migration
  useEffect(() => {
    // Run data migration for mood/energy levels
    const migrationResult = migrateToMorningEveningFormat();
    if (migrationResult.migrated) {
      console.log(`Data migration complete: Migrated ${migrationResult.count} entries to morning/evening format`);
      // Update the storage data after migration
      setStorageData(getStorage());
    }

    // Initialize task registry - this should only run once
  const initRegistry = async () => {
    console.log('Initializing task registry...');
    
    // Initialize the task registry
    const registry = initTaskRegistry();
    
    // Check if we need to run migration (if there are no tasks yet)
    if (!registry.tasks || Object.keys(registry.tasks).length === 0) {
      console.log('No tasks in registry, starting migration...');
      
      try {
        // Show a small delay to not block the UI
        setTimeout(() => {
          const result = migrateTasksToRegistry();
          if (result.migrated) {
            console.log(`Migration complete: found ${result.uniqueTasks} unique tasks from ${result.tasksProcessed} total tasks`);
            // Force a refresh of storage data
            handleStorageUpdate();
          }
        }, 500);
      } catch (error) {
        console.error('Error during task registry migration:', error);
      }
    } else {
      console.log(`Task registry already contains ${Object.keys(registry.tasks).length} tasks`);
    }
  };
  
  initRegistry();
    
    // Initialize the reminder service
    reminderService.init();
    
    // Add the service to window for access from other components
    window.reminderService = reminderService;
    
    // Add a handler for opening actions from reminders
    window.openReminderAction = () => {
      // Default action when a notification is clicked is to open today's tasks
      const today = formatDateForStorage(new Date());
      handleDaySelect(today);
    };

     // Add our new function to make it accessible from DayChecklist
  window.checkForPendingTasksMultiDay = checkForPendingTasksMultiDay;
    
    // Add a handler for opening actions from task reminders
    window.openTaskReminderAction = handleTaskReminderAction;
    
    // Setup service worker message listener for notification clicks
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event.data);
        
        // Handle open-reminder message
        if (event.data && event.data.type === 'open-reminder') {
          const today = formatDateForStorage(new Date());
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

 
  
  const handleOpenSearch = () => {
    setIsSearchModalOpen(true);
    
    // Use setTimeout to ensure state is updated before opening the modal
    setTimeout(() => {
      const searchModal = document.getElementById('task-search-modal');
      if (searchModal) {
        searchModal.showModal();
      }
    }, 50);
  };

  // 1. Add a new function to check for pending tasks from multiple days
  const checkForPendingTasksMultiDay = (currentDate, daysToCheck = 7) => {
    console.log(`Checking for pending tasks for date ${currentDate} from up to ${daysToCheck} days ago`);
    
    // This will store all dates with pending tasks
    const datesWithPendingTasks = [];
    
    // Convert currentDate to Date object if it's a string
    const currentDateObj = new Date(currentDate);
    
    // Check each of the past days
    for (let i = 1; i <= daysToCheck; i++) {
      // Calculate the date to check
      const checkDateObj = new Date(currentDateObj);
      checkDateObj.setDate(currentDateObj.getDate() - i);
      const checkDateStr = formatDateForStorage(checkDateObj);
      
      // Check if this date has pending tasks
      const hasPendingTasks = hasPendingTasksOnDate(checkDateStr);
      
      if (hasPendingTasks) {
        datesWithPendingTasks.push(checkDateStr);
      }
    }
    
    // If we found any dates with pending tasks
    if (datesWithPendingTasks.length > 0) {
      console.log(`Found pending tasks from dates: ${datesWithPendingTasks.join(', ')}`);
      
      // Use the most recent date with pending tasks for the modal
      // (it will scan back from there in the component)
      datesWithPendingTasks.sort((a, b) => new Date(b) - new Date(a));
      const mostRecentDate = datesWithPendingTasks[0];
      
      // Set state for the pending tasks modal
      setPendingTasksDate(mostRecentDate);
      setPendingTasksForDate(currentDate);
      
      // Show the modal
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
    
    console.log('No pending tasks found from previous days');
    return false;
  };

// 2. This helper function checks if a specific date has pending tasks
// Similar to logic in findPreviousTaskDate but for a specific date
const hasPendingTasksOnDate = (dateToCheck, targetDate) => {
  const storage = getStorage();
  const dayData = storage[dateToCheck];
  
  // If no data for this day, it has no pending tasks
  if (!dayData) return false;
  
  // Only consider days with checked items
  if (!dayData.checked) return false;
  
  // Get all task items from various possible task lists
  const taskCategories = dayData.customTasks || dayData.aiTasks || dayData.defaultTasks;
  if (!taskCategories || !Array.isArray(taskCategories)) return false;
  
  // Helper function to check if a task is from a habit
  const isHabitTask = (taskText) => {
    return taskText.startsWith('[') && taskText.includes(']');
  };
  
  // If target date is provided, get all its tasks to exclude
  const targetDayTasks = new Set();
  if (targetDate) {
    const targetDayData = storage[targetDate];
    if (targetDayData) {
      const targetTaskCategories = targetDayData.customTasks || targetDayData.aiTasks || targetDayData.defaultTasks;
      if (targetTaskCategories && Array.isArray(targetTaskCategories)) {
        targetTaskCategories.forEach(category => {
          if (category && category.items && Array.isArray(category.items)) {
            category.items.forEach(task => {
              targetDayTasks.add(task);
            });
          }
        });
      }
    }
  }
  
  // Helper function to check if a task was completed in a date range
  const wasCompletedInDateRange = (taskText, startDateStr, endDateStr) => {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Loop through each day in the range
    const currentCheck = new Date(startDate);
    currentCheck.setDate(currentCheck.getDate() + 1); // Start from the day after
    
    while (currentCheck <= endDate) {
      const checkDateStr = formatDateForStorage(currentCheck);
      const checkDayData = storage[checkDateStr];
      
      // If this day has data and the task was completed, return true
      if (checkDayData && checkDayData.checked) {
        // Check both category-based format and old format
        const wasCompleted = Object.entries(checkDayData.checked).some(([key, isChecked]) => {
          // For category-based format, extract just the task text
          const taskTextPart = key.includes('|') ? key.split('|')[1] : key;
          return isChecked === true && taskTextPart === taskText;
        });
        
        if (wasCompleted) return true;
      }
      
      // Move to next day
      currentCheck.setDate(currentCheck.getDate() + 1);
    }
    
    return false;
  };
  
  // Check if any tasks on this date are uncompleted, not in target day, not habits, not completed later
  let hasUncompletedTasks = false;
  
  for (const category of taskCategories) {
    for (const task of category.items) {
      // Use both old and new category-based checked format
      const taskId = `${category.title}|${task}`;
      const isTaskChecked = dayData.checked[taskId] === true || dayData.checked[task] === true;
      
      // Skip if task is completed, is a habit task, already in target day, or completed later
      if (!isTaskChecked && 
          !isHabitTask(task) && 
          !targetDayTasks.has(task) &&
          !wasCompletedInDateRange(task, dateToCheck, targetDate || formatDateForStorage(new Date()))) {
        hasUncompletedTasks = true;
        break;
      }
    }
    if (hasUncompletedTasks) break;
  }
  
  return hasUncompletedTasks;
};

  // Update event listeners to handle the page unload event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // If there's an active focus session, save it before page unload
      if (window.currentFocusState?.focusActive && !window.currentFocusState?.sessionComplete) {
        saveFocusSessionState(window.currentFocusState);
        
        // Modern browsers require returnValue to be set
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
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

  const handleDaySelect = (dateStr, params = {}) => {
    setSelectedDay(dateStr);
    setTaskParams(params); // Store the category/task info
  
    // If openTaskList flag is set, bypass day action modal and open checklist directly
    if (params?.openTaskList) {
      // Skip day action modal and go directly to checklist
      setTimeout(() => {
        const checklistModal = document.getElementById('checklist-modal');
        if (checklistModal) {
          checklistModal.showModal();
        }
      }, 50);
    } else {
      // Use the standard flow
      document.getElementById('day-action-modal').showModal();
    }
  };

  const handleDayAction = (action) => {
    document.getElementById('day-action-modal').close();
    
    setTimeout(() => {
      if (action === 'mood') {
        // Set the mood time date and open modal
        setMoodTimeDate(selectedDay);
        document.getElementById('mood-time-tracker-modal').showModal();
      } else if (action === 'sleep') {
        // Set the sleep date and open modal
        setSleepDate(selectedDay);
        document.getElementById('sleep-tracker-modal').showModal();
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
  // Store the date before resetting state
  const targetDate = pendingTasksForDate;
  // Reset pending tasks state
  setPendingTasksDate(null);
  setPendingTasksForDate(null);
  // Only try to open the checklist modal if we have a valid date
  if (targetDate) {
  // First check if the modal exists
  setTimeout(() => {
  setSelectedDay(targetDate);
  const checklistModal = document.getElementById('checklist-modal');
  if (checklistModal) {
  checklistModal.showModal();
  } else {
  console.error('Could not find checklist-modal element');
  }
  }, 100);
  }
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

  const handleSectionChange = (newSection) => {
    // If leaving the focus section and there's an active session
    if (activeSection === 'focus' && newSection !== 'focus' && window.currentFocusState?.focusActive) {
      console.log('Attempting to navigate away from active focus session...');
      
      // Save the focus state
      saveFocusSessionState(window.currentFocusState);
      
      // Set the new section
      setActiveSection(newSection);
      
      console.log('Saved focus state and navigated to:', newSection);
    } else {
      // Normal navigation
      setActiveSection(newSection);
    }
  };

  return (
    <ThemeProvider>
      <WorkoutThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors ${isFullscreenActive ? 'fullscreen-app-mode' : ''}">
  <div className="grid grid-cols-[auto_1fr]">
          {/* Sidebar Navigation */}
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
            onReminderSettingsOpen={handleReminderSettingsOpen}
            onSettingsOpen={handleSettingsOpen}
            onHelpOpen={handleHelpOpen}
          />
          
          {/* Main Content Area */}
          <div className="w-full flex justify-center px-4 py-4">
      <div className="w-full max-w-6xl">
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

<SectionContainer id="bucketList" isActive={activeSection === 'bucketList'}>
  <BucketList />
</SectionContainer>

              <SectionContainer id="meditationShowcase" isActive={activeSection === 'meditationShowcase'}>
                <MeditationSectionPlaceholder />
              </SectionContainer>

              <SectionContainer id="workout" isActive={activeSection === 'workout'}>
  <WorkoutSection />
</SectionContainer>

              <SectionContainer id="coach" isActive={activeSection === 'coach'}>
                <DayCoach />
              </SectionContainer>

              <SectionContainer id="focus" isActive={activeSection === 'focus'}>
  <FocusSection 
    onFullscreenChange={setIsFullscreenActive} 
  />
</SectionContainer>
<SectionContainer id="nutrition" isActive={activeSection === 'nutrition'}>
  <NutritionTracker />
</SectionContainer>


<SectionContainer id="finance" isActive={activeSection === 'finance'}>
  <FinanceSection />
</SectionContainer>


              <SectionContainer id="templates" isActive={activeSection === 'templates'}>
                <TemplatesSection />
              </SectionContainer>

              <SectionContainer id="notes" isActive={activeSection === 'notes'}>
  <NotesSection />
</SectionContainer>



              <SectionContainer id="habitsShowcase" isActive={activeSection === 'habitsShowcase'}>
  <HabitsPlaceholder />
</SectionContainer>
<SectionContainer id="focusShowcase" isActive={activeSection === 'focusShowcase'}>
  <FocusPlaceholder />
</SectionContainer>


<SectionContainer id="financeShowcase" isActive={activeSection === 'financeShowcase'}>
  <FinancePlaceholder />
</SectionContainer>


<SectionContainer id="nutritionShowcase" isActive={activeSection === 'nutritionShowcase'}>
  <NutritionPlaceholder />
</SectionContainer>


              
            </div>
          </div>
        </div>

        {/* Floating action button */}
        {activeSection === 'overview' && (
        <FloatingMenu 
          onDaySelect={handleDaySelect}
          onVoiceInput={handleVoiceInput}
          onSearch={handleOpenSearch}
        />
        )}
        
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
  storageVersion={storageVersion}
  taskParams={taskParams} // Pass the task parameters
  onClose={() => {
    document.getElementById('checklist-modal').close();
    setSelectedDay(null);
    setTaskParams(null); // Reset task params when closing
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

<SleepTracker
        date={sleepDate}
        onClose={() => {
          document.getElementById('sleep-tracker-modal').close();
          setSleepDate(null);
          handleStorageUpdate();
        }}
      />

{isSearchModalOpen && (
  <TaskSearchModal
    onClose={() => {
      setIsSearchModalOpen(false);
      const modal = document.getElementById('task-search-modal');
      if (modal) {
        modal.close();
      }
    }}
    onSelectDay={handleDaySelect}
  />
)}

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
      </WorkoutThemeProvider>
    </ThemeProvider>
  );
};

export default App; 