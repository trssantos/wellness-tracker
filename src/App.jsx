import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Navigation/Sidebar';
import { SectionContainer } from './components/Navigation/SectionContainer';
import { Overview } from './components/Sections/Overview';
import { Stats } from './components/Sections/Stats';
import { MeditationSection, WorkoutSection, DayCoachSection, TemplatesSection } from './components/Sections/Placeholders';
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
import { getStorage } from './utils/storage';
import reminderService from './utils/reminderService';

const App = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [storageData, setStorageData] = useState(getStorage());
  const [storageVersion, setStorageVersion] = useState(0);
  const [voiceInputDate, setVoiceInputDate] = useState(null);
  
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