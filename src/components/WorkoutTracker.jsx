import React, { useState, useEffect } from 'react';
import { X, Save, Dumbbell, Clock, Flame, BarChart, Plus, Trash2, Tag } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

// Available workout types with icons and colors
const WORKOUT_TYPES = {
  WEIGHTLIFTING: { 
    name: "Weightlifting", 
    icon: "🏋️", 
    color: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200" 
  },
  CARDIO: { 
    name: "Cardio", 
    icon: "🏃", 
    color: "bg-red-50 hover:bg-red-100 text-red-800 border-red-200" 
  },
  YOGA: { 
    name: "Yoga", 
    icon: "🧘", 
    color: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200" 
  },
  SWIMMING: { 
    name: "Swimming", 
    icon: "🏊", 
    color: "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200" 
  },
  CYCLING: { 
    name: "Cycling", 
    icon: "🚴", 
    color: "bg-green-50 hover:bg-green-100 text-green-800 border-green-200" 
  },
  HIIT: { 
    name: "HIIT", 
    icon: "⚡", 
    color: "bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200" 
  },
  PILATES: { 
    name: "Pilates", 
    icon: "🤸", 
    color: "bg-pink-50 hover:bg-pink-100 text-pink-800 border-pink-200" 
  },
  BOXING: { 
    name: "Boxing", 
    icon: "🥊", 
    color: "bg-red-50 hover:bg-red-100 text-red-800 border-red-200" 
  },
  CALISTHENICS: { 
    name: "Calisthenics", 
    icon: "💪", 
    color: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200" 
  },
  STRETCHING: { 
    name: "Stretching", 
    icon: "🧠", 
    color: "bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200" 
  },
  WALKING: { 
    name: "Walking", 
    icon: "👣", 
    color: "bg-lime-50 hover:bg-lime-100 text-lime-800 border-lime-200" 
  },
  OTHER: { 
    name: "Other", 
    icon: "🏅", 
    color: "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200" 
  }
};

// Predefined intensity levels
const INTENSITY_LEVELS = [
  { value: 1, label: "Light", color: "bg-green-100" },
  { value: 2, label: "Moderate", color: "bg-yellow-100" },
  { value: 3, label: "Challenging", color: "bg-orange-100" },
  { value: 4, label: "Intense", color: "bg-red-100" },
  { value: 5, label: "Maximum", color: "bg-purple-100" }
];

export const WorkoutTracker = ({ date, onClose }) => {
  // Main workout data
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState('');
  
  // Additional tracking fields
  const [addExercises, setAddExercises] = useState(false);
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', weight: '' }]);
  
  // UI states
  const [workoutSaved, setWorkoutSaved] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [customType, setCustomType] = useState('');
  
  // Load existing data
  useEffect(() => {
    if (date) {
      const storage = getStorage();
      const dayData = storage[date] || {};
      
      if (dayData.workout) {
        setWorkoutTypes(dayData.workout.types || []);
        setDuration(dayData.workout.duration || 30);
        setIntensity(dayData.workout.intensity || 3);
        setNotes(dayData.workout.notes || '');
        setExercises(dayData.workout.exercises || [{ name: '', sets: '', reps: '', weight: '' }]);
        setAddExercises(dayData.workout.exercises && dayData.workout.exercises.length > 0);
        setWorkoutSaved(true);
      } else {
        // Reset to defaults
        setWorkoutTypes([]);
        setDuration(30);
        setIntensity(3);
        setNotes('');
        setExercises([{ name: '', sets: '', reps: '', weight: '' }]);
        setAddExercises(false);
        setWorkoutSaved(false);
      }
    }
  }, [date]);

  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTypeToggle = (typeKey) => {
    if (workoutTypes.includes(typeKey)) {
      setWorkoutTypes(workoutTypes.filter(type => type !== typeKey));
    } else {
      setWorkoutTypes([...workoutTypes, typeKey]);
    }
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }]);
  };

  const handleRemoveExercise = (index) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleAddCustomType = () => {
    if (customType.trim()) {
      // Add to workout types
      handleTypeToggle('OTHER');
      // Add to notes
      const newNote = `Custom workout type: ${customType.trim()}`;
      setNotes(notes ? `${notes}\n${newNote}` : newNote);
      setCustomType('');
    }
  };

  const saveWorkout = () => {
    const storage = getStorage();
    const dayData = storage[date] || {};
    
    // Only save exercises if they have data
    const validExercises = addExercises 
      ? exercises.filter(ex => ex.name.trim() !== '')
      : [];
    
    storage[date] = {
      ...dayData,
      workout: {
        types: workoutTypes,
        duration,
        intensity,
        notes,
        exercises: validExercises,
        timestamp: new Date().toISOString()
      }
    };
    
    setStorage(storage);
    setWorkoutSaved(true);
    
    // Close the modal after saving
    onClose();
  };

  const deleteWorkout = () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      const storage = getStorage();
      const dayData = storage[date] || {};
      
      // Delete the workout property
      if (dayData.workout) {
        delete dayData.workout;
        storage[date] = dayData;
        setStorage(storage);
      }
      
      // Reset form
      setWorkoutTypes([]);
      setDuration(30);
      setIntensity(3);
      setNotes('');
      setExercises([{ name: '', sets: '', reps: '', weight: '' }]);
      setAddExercises(false);
      setWorkoutSaved(false);
    }
  };

  const getDisplayedWorkoutTypes = () => {
    return showAllTypes
      ? Object.entries(WORKOUT_TYPES)
      : Object.entries(WORKOUT_TYPES).slice(0, 6);
  };

  return (
    <dialog 
      id="workout-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'workout-modal' && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Dumbbell className="text-blue-500" size={20} />
              Workout Tracker
            </h3>
            <p className="text-sm text-slate-600">
              {getFormattedDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Workout Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Workout Type (select all that apply)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {getDisplayedWorkoutTypes().map(([key, { name, icon, color }]) => (
                <button
                  key={key}
                  onClick={() => handleTypeToggle(key)}
                  className={`
                    flex flex-col items-center p-2 rounded-lg border
                    ${workoutTypes.includes(key) 
                      ? color.replace('hover:', '') 
                      : 'bg-white border-slate-200 hover:bg-slate-50'}
                    transition-colors
                  `}
                >
                  <span className="text-xl mb-1">{icon}</span>
                  <span className="text-xs text-center leading-tight">{name}</span>
                </button>
              ))}
            </div>
            {!showAllTypes && (
              <button 
                onClick={() => setShowAllTypes(true)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Show more workout types
              </button>
            )}

            {/* Custom workout type */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Add custom workout type..."
                className="flex-1 p-2 text-sm border border-slate-200 rounded-md"
              />
              <button
                onClick={handleAddCustomType}
                disabled={!customType.trim()}
                className={`
                  p-2 rounded-md ${!customType.trim() 
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'}
                `}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Clock size={16} className="text-slate-500" />
                Duration (minutes)
              </label>
              <span className="text-lg font-semibold text-blue-700">{duration} min</span>
            </div>
            <input
              type="range"
              min="5"
              max="180"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>5 min</span>
              <span>60 min</span>
              <span>120 min</span>
              <span>180 min</span>
            </div>
          </div>

          {/* Intensity Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <Flame size={16} className="text-slate-500" />
              Intensity Level
            </label>
            <div className="grid grid-cols-5 gap-2">
              {INTENSITY_LEVELS.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setIntensity(value)}
                  className={`
                    p-2 rounded-lg text-center transition-colors
                    ${intensity === value 
                      ? `${color} ring-2 ring-blue-500 font-medium` 
                      : 'bg-slate-50 hover:bg-slate-100'}
                  `}
                >
                  <div className="text-lg font-semibold">{value}</div>
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Tracking */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                Track Exercises
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  value="" 
                  className="sr-only peer"
                  checked={addExercises}
                  onChange={() => setAddExercises(!addExercises)} 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {addExercises && (
              <div className="space-y-3 mt-4 border-l-2 border-blue-200 pl-3">
                {exercises.map((exercise, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <input
                      className="col-span-5 p-2 text-sm border border-slate-200 rounded-md"
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    />
                    <input
                      className="col-span-2 p-2 text-sm border border-slate-200 rounded-md"
                      placeholder="Sets"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    />
                    <input
                      className="col-span-2 p-2 text-sm border border-slate-200 rounded-md"
                      placeholder="Reps"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    />
                    <input
                      className="col-span-2 p-2 text-sm border border-slate-200 rounded-md"
                      placeholder="Weight"
                      value={exercise.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                    />
                    <button
                      onClick={() => handleRemoveExercise(index)}
                      className="col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddExercise}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  <Plus size={16} />
                  Add exercise
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (how did it feel, what went well, etc.)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your workout..."
              className="w-full h-20 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-200">
            {workoutSaved ? (
              <button
                onClick={deleteWorkout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg"
              >
                <Trash2 size={18} />
                Delete Workout
              </button>
            ) : (
              <div></div> // Empty div to maintain spacing with flex justify-between
            )}
            
            <button
              onClick={saveWorkout}
              disabled={workoutTypes.length === 0}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-medium
                ${workoutTypes.length === 0 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'}
              `}
            >
              <Save size={18} />
              {workoutSaved ? 'Update Workout' : 'Save Workout'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default WorkoutTracker;