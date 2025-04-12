import React, { useState, useEffect } from 'react';
import { Minus, X, Save, Dumbbell, Clock, Flame, Plus, Trash2 } from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { logWorkout } from '../../utils/workoutUtils';

// Available workout types with icons and colors - updated for dark mode
const WORKOUT_TYPES = {
  WEIGHTLIFTING: { 
    name: "Weightlifting", 
    icon: "🏋️", 
    color: "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700" 
  },
  CARDIO: { 
    name: "Cardio", 
    icon: "🏃", 
    color: "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700" 
  },
  YOGA: { 
    name: "Yoga", 
    icon: "🧘", 
    color: "bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700" 
  },
  SWIMMING: { 
    name: "Swimming", 
    icon: "🏊", 
    color: "bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-800/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700" 
  },
  CYCLING: { 
    name: "Cycling", 
    icon: "🚴", 
    color: "bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700" 
  },
  HIIT: { 
    name: "HIIT", 
    icon: "⚡", 
    color: "bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-800/40 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700" 
  },
  PILATES: { 
    name: "Pilates", 
    icon: "🤸", 
    color: "bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 dark:hover:bg-pink-800/40 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-700" 
  },
  BOXING: { 
    name: "Boxing", 
    icon: "🥊", 
    color: "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700" 
  },
  CALISTHENICS: { 
    name: "Calisthenics", 
    icon: "💪", 
    color: "bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700" 
  },
  STRETCHING: { 
    name: "Stretching", 
    icon: "🧠", 
    color: "bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-800/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-700" 
  },
  WALKING: { 
    name: "Walking", 
    icon: "👣", 
    color: "bg-lime-50 dark:bg-lime-900/30 hover:bg-lime-100 dark:hover:bg-lime-800/40 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-700" 
  },
  OTHER: { 
    name: "Other", 
    icon: "🏅", 
    color: "bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600" 
  }
};

// Predefined intensity levels - updated for dark mode
const INTENSITY_LEVELS = [
  { value: 1, label: "Light", color: "bg-green-100 dark:bg-green-900/40" },
  { value: 2, label: "Moderate", color: "bg-yellow-100 dark:bg-yellow-900/40" },
  { value: 3, label: "Challenging", color: "bg-orange-100 dark:bg-orange-900/40" },
  { value: 4, label: "Intense", color: "bg-red-100 dark:bg-red-900/40" },
  { value: 5, label: "Maximum", color: "bg-purple-100 dark:bg-purple-900/40" }
];

const QuickLogWorkout = ({ workout, date, onComplete, onClose, isDialog = true }) => {
  // Quick log form state
  const [workoutTypes, setWorkoutTypes] = useState([]);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState(3);
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [addExercises, setAddExercises] = useState(false);
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', weight: '' }]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [customType, setCustomType] = useState('');

  // Load workout data if editing
  useEffect(() => {
    if (workout) {
      // Load the workout data into the form
      setWorkoutTypes(workout.types || []);
      setDuration(workout.duration || 30);
      setIntensity(workout.intensity || 3);
      setCalories(workout.calories || '');
      setNotes(workout.notes || '');
      
      if (workout.exercises && workout.exercises.length > 0) {
        setExercises(workout.exercises);
        setAddExercises(true);
      } else {
        setExercises([{ name: '', sets: '', reps: '', weight: '' }]);
        setAddExercises(false);
      }
      
      setEditingWorkout(workout);
    }
  }, [workout]);

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

  const handleCaloriesChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    setCalories(value);
  };

  // Use parseInt to ensure duration is a number
  const adjustDuration = (amount) => {
    setDuration(prev => {
      const newValue = parseInt(prev) + amount;
      return Math.max(5, isNaN(newValue) ? 30 : newValue);
    });
  };

  const saveWorkout = () => {
    // Only save exercises if they have data
    const validExercises = addExercises 
      ? exercises.filter(ex => ex.name.trim() !== '')
      : [];
    
    // Create the workout data object
    const workoutData = {
      name: workoutTypes.map(type => WORKOUT_TYPES[type]?.name).join(', ') || 'Workout',
      type: workoutTypes[0]?.toLowerCase() || 'other',
      types: workoutTypes,
      duration: parseInt(duration) || 30,
      intensity,
      calories: calories || null,
      notes,
      exercises: validExercises
    };
    
    // Log the workout with the existing ID if editing
    const savedWorkout = logWorkout(date, workoutData, editingWorkout?.id);
    
    // Close the form and notify the parent
    if (onComplete) {
      onComplete(savedWorkout);
    }
  };

  const getDisplayedWorkoutTypes = () => {
    return showAllTypes
      ? Object.entries(WORKOUT_TYPES)
      : Object.entries(WORKOUT_TYPES).slice(0, 6);
  };

  const content = (
    <div className="space-y-6">
      <div className="modal-header">
        <div>
          <h3 className="modal-title flex items-center gap-2">
            <Dumbbell className="text-blue-500 dark:text-blue-400" size={20} />
            {editingWorkout ? 'Edit Workout' : 'Quick Log Workout'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="modal-close-button"
        >
          <X size={20} />
        </button>
      </div>

      {/* Workout Type Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
          Workout Type (select all that apply)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {getDisplayedWorkoutTypes().map(([key, { name, icon, color }]) => (
            <button
              key={key}
              onClick={() => handleTypeToggle(key)}
              className={`
                flex flex-col items-center p-2 rounded-lg border border-slate-200 dark:border-slate-700
                ${workoutTypes.includes(key) 
                  ? color.replace('hover:', '') 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}
                transition-colors
              `}
            >
              <span className="text-xl mb-1">{icon}</span>
              <span className="text-xs text-center leading-tight text-slate-700 dark:text-slate-300 transition-colors">{name}</span>
            </button>
          ))}
        </div>
        {!showAllTypes && (
          <button 
            onClick={() => setShowAllTypes(true)}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
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
            className="input-field text-sm p-2 flex-1"
          />
          <button
            onClick={handleAddCustomType}
            disabled={!customType.trim()}
            className={`
              p-2 rounded-md transition-colors ${!customType.trim() 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
                : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}
            `}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Duration and Calories (in a row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors">
              <Clock size={16} className="text-slate-500 dark:text-slate-400" />
              Duration (minutes)
            </label>
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-400 transition-colors">{duration} min</span>
          </div>
          {/* Duration Adjuster */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={() => adjustDuration(-5)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Minus size={16} className="text-slate-600 dark:text-slate-300" />
            </button>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="5"
              step="5"
              className="w-16 text-center font-semibold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 p-1"
            />
            <button
              onClick={() => adjustDuration(5)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Plus size={16} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full h-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500 dark:accent-blue-600 transition-colors"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            <span>5 min</span>
            <span>60 min</span>
            <span>120 min</span>
            <span>180 min</span>
          </div>
        </div>
        
        {/* Calories Burned Field */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors">
              <Flame size={16} className="text-red-500 dark:text-red-400" />
              Calories Burned
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={calories}
              onChange={handleCaloriesChange}
              placeholder="Enter calories..."
              className="input-field pr-14 pl-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400">
              kcal
            </div>
          </div>
        </div>
      </div>

      {/* Intensity Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1 transition-colors">
          <Flame size={16} className="text-slate-500 dark:text-slate-400" />
          Intensity Level
        </label>
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {INTENSITY_LEVELS.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setIntensity(value)}
              className={`
                p-2 rounded-lg text-center transition-colors
                ${intensity === value 
                  ? `${color} ring-2 ring-blue-500 font-medium` 
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}
              `}
            >
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-200 transition-colors">{value}</div>
              <div className="text-xs truncate text-slate-600 dark:text-slate-400 transition-colors">{label}</div>
            </button>
          ))}
        </div>
        
        {/* Adding a legend for mobile users */}
        <div className="mt-2 grid grid-cols-5 gap-1 sm:hidden text-center">
          {INTENSITY_LEVELS.map(({ value, label }) => (
            <div key={value} className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Tracking */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
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
            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600 transition-colors"></div>
          </label>
        </div>

        {addExercises && (
          <div className="space-y-3 mt-4 border-l-2 border-blue-200 dark:border-blue-800 pl-3 transition-colors">
            {exercises.map((exercise, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <input
                  className="col-span-5 p-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md transition-colors"
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                />
                <input
                  className="col-span-2 p-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md transition-colors"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                />
                <input
                  className="col-span-2 p-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md transition-colors"
                  placeholder="Reps"
                  value={exercise.reps}
                  onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                />
                <input
                  className="col-span-2 p-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md transition-colors"
                  placeholder="Weight"
                  value={exercise.weight}
                  onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                />
                <button
                  onClick={() => handleRemoveExercise(index)}
                  className="col-span-1 p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddExercise}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 transition-colors"
            >
              <Plus size={16} />
              Add exercise
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
          Notes (how did it feel, what went well, etc.)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about your workout..."
          className="textarea-field h-20"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors">
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
        
        <button
          onClick={saveWorkout}
          disabled={workoutTypes.length === 0}
          className={`
            flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors
            ${workoutTypes.length === 0 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
              : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}
          `}
        >
          <Save size={18} />
          {editingWorkout ? 'Update Workout' : 'Save Workout'}
        </button>
      </div>
    </div>
  );

  // Return differently based on whether this is used as a dialog or not
  if (isDialog) {
    return (
      <dialog 
        id="quick-log-workout-modal" 
        className="modal-base"
        onClick={(e) => e.target.id === 'quick-log-workout-modal' && onClose()}
      >
        <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
          {content}
        </div>
      </dialog>
    );
  } else {
    return content;
  }
};

export default QuickLogWorkout;