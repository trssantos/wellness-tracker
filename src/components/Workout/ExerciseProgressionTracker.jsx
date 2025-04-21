import React, { useState, useEffect } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Dumbbell, Activity, Calendar } from 'lucide-react';
import { getWeightUnit, getDistanceUnit } from '../../utils/storage';
import { getExerciseProgressionHistory } from '../../utils/workoutUtils';

const ExerciseProgressionTracker = ({ workoutType, exerciseFilter = [] }) => {
  const [progressionData, setProgressionData] = useState([]); // Initialize as array
  const [showComponent, setShowComponent] = useState(false);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'strength', 'cardio'
  const [expandedExercises, setExpandedExercises] = useState({}); // Track expanded exercises

  // Load progression data on mount
  useEffect(() => {
    // Set user preferences
    setWeightUnit(getWeightUnit());
    setDistanceUnit(getDistanceUnit());

    // Load exercise progression data
    loadExerciseProgressions();
  }, [exerciseFilter, workoutType]);

  // Load exercise progressions data from the new version history
  const loadExerciseProgressions = () => {
    // Process exercises from filters if provided
    if (Array.isArray(exerciseFilter) && exerciseFilter.length > 0) {
      const exerciseData = [];
      
      // For each exercise name, get its progression history
      exerciseFilter.forEach(exerciseName => {
        if (!exerciseName) return;
        
        // Get all versions for this exercise
        const versions = getExerciseProgressionHistory(exerciseName, 15); // Get up to 15 versions
        
        if (versions.length > 0) {
          // Identify if this is a duration-based exercise
          const isDurationBased = versions.some(v => v.isDurationBased) || 
                                  versions.some(v => v.duration) ||
                                  versions.some(v => !v.reps);
          
          // Extract unique workout names this exercise appears in
          const workoutNames = [...new Set(versions.map(v => v.workoutName).filter(Boolean))];
          
          // Group versions by having unique exercise parameters (to prevent duplicates)
          const uniqueVersions = [];
          const seen = new Set();
          
          versions.forEach(version => {
            const key = `${version.sets}-${version.reps}-${version.weight}-${version.duration}-${version.distance}`;
            
            if (!seen.has(key)) {
              seen.add(key);
              // Create a formatted version object
              uniqueVersions.push({
                planned: {
                  sets: version.sets,
                  reps: version.reps,
                  weight: version.weight,
                  duration: version.duration,
                  durationUnit: version.durationUnit,
                  distance: version.distance
                },
                date: version.date,
                source: version.source,
                isCurrent: version.source === 'current',
                isInitial: version.source === 'initial'
              });
            }
          });
          
          // Add exercise data with its versions
          exerciseData.push({
            name: exerciseName,
            isDurationBased: isDurationBased,
            versions: uniqueVersions,
            workouts: workoutNames,
            baselineChanges: uniqueVersions.length - 1
          });
        }
      });
      
      setProgressionData(exerciseData);
    } else {
      // No filters provided, we can't show anything
      setProgressionData([]);
    }
  };

  // Filter exercises by type
  const filterExercises = (type = 'all') => {
    setSelectedType(type);
  };

  // Count exercises by type
  const countExercisesByType = (type) => {
    if (!progressionData || !progressionData.length) return 0;
    
    if (type === 'all') return progressionData.length;
    
    return progressionData.filter(
      exercise => type === 'strength' ? !exercise.isDurationBased : exercise.isDurationBased
    ).length;
  };

  // Get values from a version
  const getVersionValues = (version) => {
    return version.planned;
  };

  // Toggle exercise expansion
  const toggleExercise = (exerciseName) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }));
  };
  
  // Format date display
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('default', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="mb-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header with toggle */}
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setShowComponent(!showComponent)}
      >
        <h3 className="font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <TrendingUp size={18} className="text-purple-500 dark:text-purple-400" />
          Exercise Progression
        </h3>
        {showComponent ? 
          <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> :
          <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />
        }
      </div>

      {/* Content */}
      {showComponent && (
        <div className="p-4">
          {progressionData.length === 0 ? (
            <div className="text-center p-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              <p className="text-slate-600 dark:text-slate-400">
                No exercise data available yet.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                Add exercises to your workouts and update them to track progression.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter tabs */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => filterExercises('all')}
                  className={`px-3 py-1.5 rounded-full text-sm ${
                    selectedType === 'all'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  All ({countExercisesByType('all')})
                </button>
                <button
                  onClick={() => filterExercises('strength')}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                    selectedType === 'strength'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Dumbbell size={14} />
                  Strength ({countExercisesByType('strength')})
                </button>
                <button
                  onClick={() => filterExercises('cardio')}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                    selectedType === 'cardio'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Activity size={14} />
                  Cardio ({countExercisesByType('cardio')})
                </button>
              </div>

              {/* Exercise list with progressions */}
              <div className="space-y-3">
                {progressionData
                  .filter(exercise => {
                    if (selectedType === 'all') return true;
                    if (selectedType === 'strength') return !exercise.isDurationBased;
                    if (selectedType === 'cardio') return exercise.isDurationBased;
                    return true;
                  })
                  .map((exercise) => (
                    <div key={exercise.name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      {/* Exercise header */}
                      <div 
                        className="p-3 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleExercise(exercise.name)}
                      >
                        <div className="flex items-center gap-2">
                          {exercise.isDurationBased ? (
                            <Activity size={16} className="text-green-500 dark:text-green-400" />
                          ) : (
                            <Dumbbell size={16} className="text-blue-500 dark:text-blue-400" />
                          )}
                          <h4 className="font-medium text-slate-800 dark:text-slate-100">{exercise.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {exercise.baselineChanges} baseline changes
                          </span>
                          {expandedExercises[exercise.name] ? (
                            <ChevronUp size={16} className="text-slate-500 dark:text-slate-400" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Versions grid - only shown if exercise is expanded */}
                      {expandedExercises[exercise.name] && (
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                          {/* Horizontal scrollable container for versions */}
                          <div className="overflow-x-auto pb-2">
                            <div className="flex gap-3" style={{ minWidth: "min-content" }}>
                              {exercise.versions.map((version, idx) => (
                                <div 
                                  key={idx}
                                  className={`flex-shrink-0 p-3 rounded-lg border w-44 ${
                                    version.isCurrent
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                      Version {exercise.versions.length - idx}
                                    </div>
                                    {version.isCurrent && (
                                      <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                                        Current
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Exercise details */}
                                  {!exercise.isDurationBased ? (
                                    // Strength exercise
                                    <div className="space-y-1 text-sm">
                                      {/* Sets */}
                                      <div className="flex justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Sets:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                          {getVersionValues(version).sets}
                                        </span>
                                      </div>
                                      
                                      {/* Reps */}
                                      {getVersionValues(version).reps && (
                                        <div className="flex justify-between">
                                          <span className="text-xs text-slate-500 dark:text-slate-400">Reps:</span>
                                          <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {getVersionValues(version).reps}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Weight */}
                                      {getVersionValues(version).weight && (
                                        <div className="flex justify-between">
                                          <span className="text-xs text-slate-500 dark:text-slate-400">Weight:</span>
                                          <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {getVersionValues(version).weight} {weightUnit}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    // Cardio/duration exercise
                                    <div className="space-y-1 text-sm">
                                      {/* Duration */}
                                      {getVersionValues(version).duration && (
                                        <div className="flex justify-between">
                                          <span className="text-xs text-slate-500 dark:text-slate-400">Duration:</span>
                                          <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {getVersionValues(version).duration}
                                            {getVersionValues(version).durationUnit === 'sec' ? 'sec' : ''}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {/* Sets */}
                                      <div className="flex justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Sets:</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                          {getVersionValues(version).sets || 1}
                                        </span>
                                      </div>
                                      
                                      {/* Distance */}
                                      {getVersionValues(version).distance && (
                                        <div className="flex justify-between">
                                          <span className="text-xs text-slate-500 dark:text-slate-400">Distance:</span>
                                          <span className="font-medium text-slate-700 dark:text-slate-300">
                                            {getVersionValues(version).distance}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Show percentage changes if this isn't the first version */}
                                  {idx < exercise.versions.length - 1 && (
                                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                      {(() => {
                                        const nextVersion = exercise.versions[idx + 1];
                                        const currentValues = getVersionValues(version);
                                        const prevValues = getVersionValues(nextVersion);
                                        
                                        // Calculate changes
                                        const changes = [];
                                        
                                        // For duration-based exercises
                                        if (exercise.isDurationBased) {
                                          if (currentValues.duration && prevValues.duration) {
                                            const diff = parseInt(currentValues.duration) - parseInt(prevValues.duration);
                                            if (diff !== 0) {
                                              changes.push({
                                                label: 'Duration',
                                                diff,
                                                value: `${Math.abs(diff)}${currentValues.durationUnit === 'sec' ? 'sec' : ''}`
                                              });
                                            }
                                          }
                                        } else {
                                          // For strength exercises
                                          if (currentValues.reps && prevValues.reps) {
                                            const diff = parseInt(currentValues.reps) - parseInt(prevValues.reps);
                                            if (diff !== 0) {
                                              changes.push({
                                                label: 'Reps',
                                                diff,
                                                value: Math.abs(diff)
                                              });
                                            }
                                          }
                                          
                                          if (currentValues.weight && prevValues.weight) {
                                            const diff = parseFloat(currentValues.weight) - parseFloat(prevValues.weight);
                                            if (diff !== 0) {
                                              changes.push({
                                                label: 'Weight',
                                                diff,
                                                value: `${Math.abs(diff)} ${weightUnit}`
                                              });
                                            }
                                          }
                                        }
                                        
                                        // Sets for both types
                                        if (currentValues.sets && prevValues.sets) {
                                          const diff = parseInt(currentValues.sets) - parseInt(prevValues.sets);
                                          if (diff !== 0) {
                                            changes.push({
                                              label: 'Sets',
                                              diff,
                                              value: Math.abs(diff)
                                            });
                                          }
                                        }
                                        
                                        return changes.length > 0 ? (
                                          <div className="text-xs">
                                            {changes.map((change, changeIdx) => (
                                              <div 
                                                key={changeIdx}
                                                className={`flex items-center justify-between ${
                                                  change.diff > 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-red-500 dark:text-red-400'
                                                }`}
                                              >
                                                <span>{change.label + ':'}</span>
                                                <span className="font-medium">
                                                  {change.diff > 0 ? '+' : '-'}{change.value}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : null;
                                      })()}
                                    </div>
                                  )}
                                  
                                  {/* Date display */}
                                  <div className="mt-2 pt-1 text-xs text-slate-400 dark:text-slate-500">
                                    {formatDate(version.date)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Used in workouts list */}
                          {exercise.workouts && exercise.workouts.length > 0 && (
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar size={12} />
                              <span>Used in: {exercise.workouts.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExerciseProgressionTracker;