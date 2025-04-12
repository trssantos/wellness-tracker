import React, { useState, useEffect } from 'react';
import { getWorkouts, createWorkout, deleteWorkout } from '../../utils/workoutUtils';
import WorkoutList from '../Workout/WorkoutList';
import WorkoutDetails from '../Workout/WorkoutDetails';
import WorkoutForm from '../Workout/WorkoutForm';
import WorkoutAnalytics from '../Workout/WorkoutAnalytics';
import AiWorkoutGenerator from '../Workout/AiWorkoutGenerator';
import WorkoutHistory from '../Workout/WorkoutHistory';
import WorkoutTracker from '../WorkoutTracker';
import { formatDateForStorage } from '../../utils/dateUtils';

const WorkoutSection = () => {
  // Main view state
  const [workouts, setWorkouts] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'detail', 'create', 'edit', 'ai', 'analytics', 'history'
  const [showWorkoutTracker, setShowWorkoutTracker] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState(null);
  
  // Initialize and load workouts
  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    const workoutData = getWorkouts();
    setWorkouts(workoutData);
  };

  // Handle viewing analytics dashboard
  const handleViewAnalytics = () => {
    setViewMode('analytics');
    setActiveWorkout(null);
  };
  
  // Handle viewing workout history
  const handleViewHistory = () => {
    setViewMode('history');
    setActiveWorkout(null);
  };

  // Handle selecting a workout to view details
  const handleSelectWorkout = (workoutId) => {
    const workout = workouts.find(w => w.id === workoutId);
    setActiveWorkout(workout);
    setViewMode('detail');
  };

  // Handle creating a new workout manually
  const handleCreateWorkout = () => {
    setActiveWorkout(null);
    setViewMode('create');
  };

  // Handle creating a workout with AI
  const handleCreateWithAI = () => {
    setActiveWorkout(null);
    setViewMode('ai');
  };

  // Handle when AI generates a workout
  const handleAIWorkoutGenerated = (workoutData) => {
    loadWorkouts();
    setViewMode('list');
  };

  // Handle editing an existing workout
  const handleEditWorkout = () => {
    setViewMode('edit');
  };
  
  // Handle editing a workout from history
  const handleEditWorkoutFromHistory = (workout) => {
    // Open a workout tracker with the specific workout to edit
    setWorkoutToEdit(workout);
    setShowWorkoutTracker(true);
    
    // Use setTimeout to ensure the modal element exists before trying to open it
    setTimeout(() => {
      const modal = document.getElementById('workout-modal');
      if (modal) {
        modal.showModal();
      }
    }, 50);
  };

  // Handle saving a new workout
  const handleWorkoutSaved = (newWorkout) => {
    loadWorkouts();
    setViewMode('list');
  };

  // Handle updating an existing workout
  const handleWorkoutUpdated = (updatedWorkout) => {
    loadWorkouts();
    setActiveWorkout(updatedWorkout);
    setViewMode('detail');
  };

  // Handle going back to the workout list
  const handleBackToList = () => {
    setActiveWorkout(null);
    setViewMode('list');
  };

  // Handle deleting a workout
  const handleWorkoutDeleted = () => {
    deleteWorkout(activeWorkout.id);
    loadWorkouts();
    setActiveWorkout(null);
    setViewMode('list');
  };

  // Render current view based on state
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'detail':
        return (
          <WorkoutDetails 
            workout={activeWorkout}
            onEdit={handleEditWorkout}
            onBack={handleBackToList}
            onDelete={handleWorkoutDeleted}
          />
        );
      case 'create':
        return (
          <WorkoutForm 
            onSave={handleWorkoutSaved}
            onCancel={handleBackToList}
          />
        );
      case 'edit':
        return (
          <WorkoutForm 
            workout={activeWorkout}
            onSave={handleWorkoutUpdated}
            onCancel={() => setViewMode('detail')}
          />
        );
      case 'ai':
        return (
          <AiWorkoutGenerator 
            onWorkoutGenerated={handleAIWorkoutGenerated}
            onCancel={handleBackToList}
          />
        );
      case 'analytics':
        return (
          <WorkoutAnalytics 
            onBack={handleBackToList}
          />
        );
      case 'history':
        return (
          <WorkoutHistory 
            onBack={handleBackToList}
            onEditWorkout={handleEditWorkoutFromHistory}
          />
        );
      case 'list':
      default:
        return (
          <WorkoutList 
            workouts={workouts}
            onSelectWorkout={handleSelectWorkout}
            onCreateWorkout={handleCreateWorkout}
            onCreateWithAI={handleCreateWithAI}
            onViewAnalytics={handleViewAnalytics}
            onViewHistory={handleViewHistory}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderCurrentView()}
      
      {/* Workout Tracker Modal for editing workouts from history */}
      {showWorkoutTracker && (
        <WorkoutTracker
          date={workoutToEdit?.date || formatDateForStorage(new Date())}
          workoutToEdit={workoutToEdit}
          onClose={() => {
            setShowWorkoutTracker(false);
            setWorkoutToEdit(null);
            
            // Close the modal
            const modal = document.getElementById('workout-modal');
            if (modal) {
              modal.close();
            }
            
            // Refresh data
            loadWorkouts();
          }}
        />
      )}
    </div>
  );
};

export default WorkoutSection;