import React, { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, Play, Clock, Calendar, 
         MapPin, DollarSign, Dumbbell, Activity, AlertTriangle } from 'lucide-react';
import { getWorkoutTypes, getWorkoutLocations } from '../../utils/workoutUtils';

const WorkoutDetails = ({ workout, onEdit, onBack, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper function to get workout type label
  const getWorkoutTypeLabel = (type) => {
    const types = getWorkoutTypes();
    const foundType = types.find(t => t.value === type);
    return foundType ? foundType.label : 'Workout';
  };

  // Helper function to get workout location label
  const getLocationLabel = (location) => {
    const locations = getWorkoutLocations();
    const foundLocation = locations.find(l => l.value === location);
    return foundLocation ? foundLocation.label : 'Other';
  };

  // Helper function to get day name from abbreviation
  const getDayName = (day) => {
    const days = {
      'mon': 'Monday',
      'tue': 'Tuesday',
      'wed': 'Wednesday',
      'thu': 'Thursday',
      'fri': 'Friday',
      'sat': 'Saturday',
      'sun': 'Sunday'
    };
    return days[day] || day;
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  // Format the frequency days
  const frequencyText = workout.frequency.map(day => getDayName(day)).join(', ');

  return (
    <div className="px-2 sm:px-0 w-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
          {workout.name}
        </h2>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {/* Will implement in workout player phase */}}
          className="flex-1 py-2 sm:py-3 rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Play size={18} />
          Start Workout
        </button>
      </div>

      {/* Workout Overview */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4">Overview</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Activity size={16} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Type</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {getWorkoutTypeLabel(workout.type)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-green-500 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {workout.duration} minutes
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Location</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {getLocationLabel(workout.location)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Schedule</div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {workout.timeOfDay.charAt(0).toUpperCase() + workout.timeOfDay.slice(1)}
              </div>
            </div>
          </div>
        </div>
        
        {workout.notes && (
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300">
            {workout.notes}
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
          Schedule
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
            const isActive = workout.frequency.includes(day);
            return (
              <div
                key={day}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-blue-500 dark:bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </div>
            );
          })}
        </div>
        
        <div className="text-sm text-slate-600 dark:text-slate-400">
          This workout is scheduled for <span className="font-medium text-slate-700 dark:text-slate-300">{frequencyText}</span> in the <span className="font-medium text-slate-700 dark:text-slate-300">{workout.timeOfDay}</span>.
        </div>
      </div>

      {/* Equipment */}
      {workout.equipment && workout.equipment.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Dumbbell size={16} className="text-slate-500 dark:text-slate-400" />
            Equipment
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {workout.equipment.map((item, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Activity size={16} className="text-slate-500 dark:text-slate-400" />
          Exercises
        </h3>
        
        {workout.exercises.length === 0 ? (
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center p-4">
            No exercises added to this workout yet.
          </div>
        ) : (
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <div 
                key={index}
                className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-slate-700 dark:text-slate-200 text-sm">{exercise.name}</div>
                  <div className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    {exercise.sets} × {exercise.reps}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {exercise.weight && (
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} />
                      <span>{exercise.weight} lbs</span>
                    </div>
                  )}
                  
                  {exercise.restTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{exercise.restTime}s rest</span>
                    </div>
                  )}
                  
                  {exercise.notes && (
                    <div className="w-full mt-1 text-xs italic">
                      {exercise.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Delete Buttons */}
      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <button 
          onClick={onEdit}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
        >
          <Edit3 size={16} />
          Edit Workout
        </button>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4 text-amber-500 dark:text-amber-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">Delete Workout</h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-medium text-slate-800 dark:text-slate-100">{workout.name}</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetails;