import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Dumbbell, Calendar, Activity, Clock } from 'lucide-react';
import { getWorkouts, getWorkoutTypes } from '../../utils/workoutUtils';

const WorkoutSelector = ({ date, onClose, onSelectWorkout, onCreateWorkout }) => {
  const [workouts, setWorkouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    // Load all workouts on mount
    const allWorkouts = getWorkouts();
    setWorkouts(allWorkouts);
  }, []);

  // Helper function to get workout type label
  const getWorkoutTypeLabel = (type) => {
    const types = getWorkoutTypes();
    const foundType = types.find(t => t.value === type);
    return foundType ? foundType.label : 'Workout';
  };

  // Helper function to get workout type icon
  const getWorkoutTypeIcon = (type) => {
    switch(type) {
      case 'strength':
      case 'bodyweight':
        return <Dumbbell size={16} className="text-blue-500 dark:text-blue-400" />;
      case 'cardio':
      case 'running':
      case 'cycling':
        return <Activity size={16} className="text-red-500 dark:text-red-400" />;
      default:
        return <Dumbbell size={16} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  // Get unique workout types for filter - FIX: Convert Set to Array before mapping
  const uniqueTypes = Array.from(new Set(workouts.map(w => w.type)));
  const workoutTypes = [
    { value: 'all', label: 'All Types' },
    ...uniqueTypes.map(type => ({
      value: type,
      label: getWorkoutTypeLabel(type)
    }))
  ];

  // Filter workouts based on search and type filter
  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || workout.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Format the date for display
  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <dialog 
      id="workout-selector-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'workout-selector-modal' && onClose()}
    >
      <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title flex items-center gap-2">
              <Dumbbell className="text-blue-500 dark:text-blue-400" size={20} />
              Select Workout to Log
            </h3>
            <p className="modal-subtitle">
              {getFormattedDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            {workoutTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Workout List */}
        {filteredWorkouts.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No matching workouts found.
            </p>
            <button
              onClick={onCreateWorkout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Plus size={16} />
              Create New Workout
            </button>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-1">
            <div className="space-y-2">
              {filteredWorkouts.map(workout => (
                <button
                  key={workout.id}
                  onClick={() => onSelectWorkout(workout.id)}
                  className="w-full text-left p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800 dark:text-slate-100">{workout.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs">
                          {getWorkoutTypeIcon(workout.type)}
                          {getWorkoutTypeLabel(workout.type)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                          <Clock size={12} />
                          {workout.duration} min
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                          {workout.exercises.length} exercises
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create New Option */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onCreateWorkout}
            className="w-full p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <span>Create New Workout</span>
          </button>
        </div>

        {/* Quick Log Option */}
        <div className="mt-4 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Calendar size={16} className="flex-shrink-0" />
            <span>You can also log a quick workout without selecting a template by using the regular workout tracker.</span>
          </p>
        </div>
      </div>
    </dialog>
  );
};

export default WorkoutSelector;