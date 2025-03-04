import React, { useState, useEffect } from 'react';
import { getHabits, initHabitTracker } from '../../utils/habitTrackerUtils';
import HabitList from '../Habits/HabitList';
import HabitDetail from '../Habits/HabitDetail';
import HabitForm from '../Habits/HabitForm';

const HabitSection = () => {
  const [habits, setHabits] = useState([]);
  const [activeHabit, setActiveHabit] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize and load habits
  useEffect(() => {
    // Initialize habit data
    initHabitTracker();
    // Load habits
    loadHabits();
  }, []);

  const loadHabits = () => {
    const habitData = getHabits();
    setHabits(habitData);
  };

  const handleSelectHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    setActiveHabit(habit);
    setIsEditing(false);
  };

  const handleCreateHabit = () => {
    setActiveHabit(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEditHabit = () => {
    setIsEditing(true);
  };

  const handleHabitSaved = () => {
    loadHabits();
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleHabitUpdated = (updatedHabit) => {
    loadHabits();
    setActiveHabit(updatedHabit);
    setIsEditing(false);
  };

  const handleBackToList = () => {
    setActiveHabit(null);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleHabitDeleted = () => {
    loadHabits();
    setActiveHabit(null);
  };

  return (
    <div className="space-y-6">
      {isCreating ? (
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
          />
        )
      ) : (
        <HabitList 
          habits={habits} 
          onSelectHabit={handleSelectHabit}
          onCreateHabit={handleCreateHabit}
        />
      )}
    </div>
  );
};

export default HabitSection;