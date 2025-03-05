import React, { useState, useEffect } from 'react';
import { initWorkoutData, getWorkouts, getWorkoutById, deleteWorkout } from '../../utils/workoutUtils';
import WorkoutList from '../Workout/WorkoutList';
import WorkoutDetails from '../Workout/WorkoutDetails';
import WorkoutForm from '../Workout/WorkoutForm';
import WorkoutAnalytics from '../Workout/WorkoutAnalytics';
import AiWorkoutGenerator from '../Workout/AiWorkoutGenerator';

const WorkoutSection = () => {
  // Main view states
  const [workouts, setWorkouts] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [viewingAnalytics, setViewingAnalytics] = useState(false);

  // Initialize and load workouts
  useEffect(() => {
    // Initialize workout data structure if needed
    initWorkoutData();
    // Load workouts
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    const workoutData = getWorkouts();
    setWorkouts(workoutData);
  };

  // Handle viewing analytics dashboard
  const handleViewAnalytics = () => {
    setViewingAnalytics(true);
    setActiveWorkout(null);
    setIsCreating(false);
    setIsEditing(false);
    setIsGeneratingWithAI(false);
  };

  // Handle selecting a workout to view details
  const handleSelectWorkout = (workoutId) => {
    const workout = getWorkoutById(workoutId);
    setActiveWorkout(workout);
    setIsEditing(false);
    setViewingAnalytics(false);
    setIsGeneratingWithAI(false);
  };

  // Handle creating a new workout manually
  const handleCreateWorkout = () => {
    setActiveWorkout(null);
    setIsCreating(true);
    setIsEditing(false);
    setViewingAnalytics(false);
    setIsGeneratingWithAI(false);
  };

  // Handle creating a workout with AI
  const handleCreateWithAI = () => {
    setActiveWorkout(null);
    setIsCreating(false);
    setIsEditing(false);
    setViewingAnalytics(false);
    setIsGeneratingWithAI(true);
  };

  // Handle editing an existing workout
  const handleEditWorkout = () => {
    setIsEditing(true);
  };

  // Handle saving a new workout
  const handleWorkoutSaved = (newWorkout) => {
    loadWorkouts();
    setIsCreating(false);
    setIsEditing(false);
    setIsGeneratingWithAI(false);
    setActiveWorkout(newWorkout);
  };

  // Handle updating an existing workout
  const handleWorkoutUpdated = (updatedWorkout) => {
    loadWorkouts();
    setActiveWorkout(updatedWorkout);
    setIsEditing(false);
  };

  // Handle going back to the workout list
  const handleBackToList = () => {
    setActiveWorkout(null);
    setIsCreating(false);
    setIsEditing(false);
    setViewingAnalytics(false);
    setIsGeneratingWithAI(false);
  };

  // Handle deleting a workout
  const handleWorkoutDeleted = () => {
    if (activeWorkout) {
      deleteWorkout(activeWorkout.id);
      loadWorkouts();
      setActiveWorkout(null);
    }
  };

  return (
    <div className="space-y-6">
      {viewingAnalytics ? (
        <WorkoutAnalytics 
          onBack={handleBackToList}
        />
      ) : isGeneratingWithAI ? (
        <AiWorkoutGenerator
          onWorkoutGenerated={handleWorkoutSaved}
          onCancel={handleBackToList}
        />
      ) : isCreating ? (
        <WorkoutForm 
          onSave={handleWorkoutSaved} 
          onCancel={handleBackToList}
        />
      ) : activeWorkout ? (
        isEditing ? (
          <WorkoutForm 
            workout={activeWorkout}
            onSave={handleWorkoutUpdated}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <WorkoutDetails 
            workout={activeWorkout} 
            onEdit={handleEditWorkout}
            onBack={handleBackToList}
            onDelete={handleWorkoutDeleted}
          />
        )
      ) : (
        <WorkoutList 
          workouts={workouts} 
          onSelectWorkout={handleSelectWorkout}
          onCreateWorkout={handleCreateWorkout}
          onCreateWithAI={handleCreateWithAI}
          onViewAnalytics={handleViewAnalytics}
        />
      )}
    </div>
  );
};

export default WorkoutSection;