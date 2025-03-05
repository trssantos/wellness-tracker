import React, { useState, useEffect } from 'react';
import { getHabits, initHabitTracker, createHabit } from '../../utils/habitTrackerUtils';
import HabitList from '../Habits/HabitList';
import HabitDetail from '../Habits/HabitDetail';
import HabitForm from '../Habits/HabitForm';
import AiHabitGenerator from '../Habits/AiHabitGenerator';
import HabitAnalytics from '../Habits/HabitAnalytics';
import HabitBadges from '../Habits/HabitBadges';
import StreakMilestoneCelebration from '../Habits/StreakMilestoneCelebration';

const HabitSection = () => {
  // Main view state
  const [habits, setHabits] = useState([]);
  const [activeHabit, setActiveHabit] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUsingAI, setIsUsingAI] = useState(false);
  const [viewingAnalytics, setViewingAnalytics] = useState(false);
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ streak: 0, habitName: '' });

  // Initialize and load habits
  useEffect(() => {
    // Initialize habit data structure if needed
    initHabitTracker();
    // Load habits
    loadHabits();
  }, []);

  const loadHabits = () => {
    const habitData = getHabits();
    setHabits(habitData);
  };

  // Handle viewing analytics dashboard
  const handleViewAnalytics = () => {
    setViewingAnalytics(true);
    setActiveHabit(null);
    setIsCreating(false);
    setIsEditing(false);
    setIsUsingAI(false);
  };

  // Handle selecting a habit to view details
  const handleSelectHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    setActiveHabit(habit);
    setIsEditing(false);
    setIsUsingAI(false);
    setViewingAnalytics(false);
  };

  // Handle creating a new habit manually
  const handleCreateHabit = () => {
    setActiveHabit(null);
    setIsCreating(true);
    setIsEditing(false);
    setIsUsingAI(false);
    setViewingAnalytics(false);
  };

  // Handle creating a habit with AI
  const handleCreateWithAI = () => {
    setActiveHabit(null);
    setIsCreating(false);
    setIsEditing(false);
    setIsUsingAI(true);
    setViewingAnalytics(false);
  };

  // Handle when AI generates a habit
  const handleAIHabitGenerated = (habitData) => {
    const newHabit = createHabit(habitData);
    loadHabits();
    setIsUsingAI(false);
    
    // Show celebration for creating first habit
    if (habits.length === 0) {
      setCelebrationData({
        streak: 0,
        habitName: newHabit.name,
        message: "You've created your first habit!"
      });
      setShowCelebration(true);
    }
  };

  // Handle editing an existing habit
  const handleEditHabit = () => {
    setIsEditing(true);
  };

  // Handle saving a new habit
  const handleHabitSaved = (newHabit) => {
    loadHabits();
    setIsCreating(false);
    setIsEditing(false);
    
    // Show celebration for creating first habit if this is the first one
    if (habits.length === 0) {
      setCelebrationData({
        streak: 0,
        habitName: newHabit.name,
        message: "You've created your first habit!"
      });
      setShowCelebration(true);
    }
  };

  // Handle updating an existing habit
  const handleHabitUpdated = (updatedHabit) => {
    loadHabits();
    setActiveHabit(updatedHabit);
    setIsEditing(false);
  };

  // Handle going back to the habit list
  const handleBackToList = () => {
    setActiveHabit(null);
    setIsCreating(false);
    setIsEditing(false);
    setIsUsingAI(false);
    setViewingAnalytics(false);
  };

  // Handle deleting a habit
  const handleHabitDeleted = () => {
    loadHabits();
    setActiveHabit(null);
  };

  // Handle streak milestones and celebrations
  const handleStreakMilestone = (habit, streak) => {
    setCelebrationData({
      streak,
      habitName: habit.name
    });
    setShowCelebration(true);
  };

  return (
    <div className="space-y-6">
      {viewingAnalytics ? (
        <HabitAnalytics 
          onBack={handleBackToList}
        />
      ) : isUsingAI ? (
        <AiHabitGenerator 
          onHabitGenerated={handleAIHabitGenerated}
          onCancel={handleBackToList}
        />
      ) : isCreating ? (
        <HabitForm 
          onSave={handleHabitSaved} 
          onCancel={handleBackToList}
        />
      ) : activeHabit ? (
        isEditing ? (
          <HabitForm 
            habit={activeHabit}
            onSave={handleHabitUpdated}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <HabitDetail 
            habit={activeHabit} 
            onEdit={handleEditHabit}
            onBack={handleBackToList}
            onDelete={handleHabitDeleted}
            onUpdate={loadHabits}
            onStreakMilestone={handleStreakMilestone}
          />
        )
      ) : (
        <>
          <HabitList 
            habits={habits} 
            onSelectHabit={handleSelectHabit}
            onCreateHabit={handleCreateHabit}
            onCreateWithAI={handleCreateWithAI}
            onViewAnalytics={handleViewAnalytics}
          />

          {habits.length > 0 && (
            <div className="mt-8">
              <HabitBadges habits={habits} />
            </div>
          )}
        </>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <StreakMilestoneCelebration 
          streak={celebrationData.streak}
          habitName={celebrationData.habitName}
          message={celebrationData.message}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
};

export default HabitSection;