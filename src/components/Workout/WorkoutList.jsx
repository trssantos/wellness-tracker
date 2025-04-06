import React from 'react';
import { History, Plus, BarChart2, Activity, Clock, Calendar, ChevronRight, Dumbbell, Sparkles } from 'lucide-react';
import { getWorkoutTypes } from '../../utils/workoutUtils';

// Helper function to get icon for workout type
const getWorkoutTypeIcon = (type) => {
  switch (type) {
    case 'strength':
      return <Dumbbell size={16} className="text-blue-500 dark:text-blue-400" />;
    case 'cardio':
    case 'running':
    case 'cycling':
      return <Activity size={16} className="text-red-500 dark:text-red-400" />;
    default:
      return <Dumbbell size={16} className="text-slate-500 dark:text-slate-400" />;
  }
};

// Helper function to get label for workout type
const getWorkoutTypeLabel = (type) => {
  const types = getWorkoutTypes();
  const foundType = types.find(t => t.value === type);
  return foundType ? foundType.label : 'Workout';
};

const WorkoutList = ({ workouts, onSelectWorkout, onCreateWorkout, onCreateWithAI, onViewAnalytics,onViewHistory }) => {
  return (
    <div className="px-2 sm:px-0 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">My Workouts</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {workouts.length > 0 && (
            <button 
              onClick={onViewAnalytics}
              className="text-sm sm:text-base bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
            >
              <BarChart2 size={16} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          )}
<button
            onClick={onViewHistory}
            className="text-sm sm:text-base bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
          >
            <History size={16} />
            <span className="hidden sm:inline">History</span>
          </button>

          <button 
            onClick={onCreateWithAI}
            className="text-sm sm:text-base bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">AI Generate</span>
          </button>
          <button 
            onClick={onCreateWorkout}
            className="text-sm sm:text-base bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Workout</span>
          </button>
        </div>
      </div>

      {workouts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Dumbbell size={24} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">No workouts yet</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Create your first workout template to start tracking your fitness journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={onCreateWithAI}
              className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              <Sparkles size={16} />
              AI Generate
            </button>
            <button 
              onClick={onCreateWorkout}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 justify-center text-sm sm:text-base"
            >
              <Plus size={16} />
              Create Workout
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 overflow-x-hidden">
          {workouts.map(workout => (
            <div 
              key={workout.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectWorkout(workout.id)}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="font-medium text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate pr-2 min-w-0 flex-1">{workout.name}</h3>
                <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs">
                  {getWorkoutTypeIcon(workout.type)}
                  {getWorkoutTypeLabel(workout.type)}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  <Clock size={14} />
                  {workout.duration} min
                </span>
              </div>
              
              <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                {workout.notes || `A ${getWorkoutTypeLabel(workout.type).toLowerCase()} workout with ${workout.exercises.length} exercises.`}
              </div>
              
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={14} />
                  {workout.frequency.map(day => day.charAt(0).toUpperCase()).join(', ')}
                </div>
                
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {workout.exercises.length} exercises
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutList;