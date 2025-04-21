import React, { useState, useEffect } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Dumbbell, Activity, Calendar } from 'lucide-react';
import { getWeightUnit, getDistanceUnit } from '../../utils/storage';
import { getWorkouts, getAllCompletedWorkouts } from '../../utils/workoutUtils';

const ExerciseProgressionTracker = ({ workoutType, exerciseFilter = [] }) => {
  const [progressionData, setProgressionData] = useState([]); // Initialize as array
  const [showComponent, setShowComponent] = useState(true);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'strength', 'cardio'

  // Load progression data on mount
  useEffect(() => {
    // Set user preferences
    setWeightUnit(getWeightUnit());
    setDistanceUnit(getDistanceUnit());

    // Calculate progression data
    calculateExerciseProgressions();
  }, [exerciseFilter, workoutType]);

  // Calculate exercise progressions from workout data
  const calculateExerciseProgressions = () => {
    // Get all workout templates (to get initial values)
    const workoutTemplates = getWorkouts();
    
    // Initialize exercise map from all templates
    const exerciseMap = {};
    
    // Add all exercises from templates first (so we have even those with no changes)
    workoutTemplates.forEach(template => {
      if (template.exercises) {
        template.exercises.forEach(exercise => {
          if (!exercise || !exercise.name) return;
          
          const exerciseName = exercise.name;
          
          if (!exerciseMap[exerciseName]) {
            exerciseMap[exerciseName] = {
              name: exerciseName,
              isDurationBased: !!exercise.isDurationBased,
              versions: [{
                // Initial version from template
                planned: {
                  sets: exercise.sets,
                  reps: exercise.reps,
                  weight: exercise.weight,
                  duration: exercise.duration,
                  durationUnit: exercise.durationUnit,
                  distance: exercise.distance
                },
                isInitial: true,
                isCurrent: true,
                date: template.createdAt || new Date().toISOString()
              }],
              workouts: [template.name]
            };
          } else if (!exerciseMap[exerciseName].workouts.includes(template.name)) {
            // Add workout name if not already there
            exerciseMap[exerciseName].workouts.push(template.name);
          }
        });
      }
    });
    
    // Get all completed workouts to find baseline changes
    const allWorkouts = getAllCompletedWorkouts();
    
    // Find all exercises that have been changed through updateExerciseBaseline
    allWorkouts.forEach(workout => {
      if (!workout.workoutId || !workout.exercises) return;
      
      // Get the template for this workout
      const template = workoutTemplates.find(t => t.id === workout.workoutId);
      if (!template) return;
      
      // Compare each exercise with its template version
      workout.exercises.forEach(exercise => {
        if (!exercise || !exercise.name) return;
        
        const exerciseName = exercise.name;
        const templateExercise = template.exercises.find(e => e.name === exerciseName);
        if (!templateExercise) return;
        
        // Check if this represents a baseline change
        // We consider it a change if the actual values don't match the template's values
        // but match the current exercise values in the template (which would happen after updateExerciseBaseline)
        const currentTemplateExercise = template.exercises.find(e => e.name === exerciseName);
        
        const hasBaselineChange = (
          exercise.actualSets !== undefined && currentTemplateExercise.sets === exercise.actualSets ||
          exercise.actualReps !== undefined && currentTemplateExercise.reps === exercise.actualReps ||
          exercise.actualWeight !== undefined && currentTemplateExercise.weight === exercise.actualWeight ||
          exercise.actualDuration !== undefined && currentTemplateExercise.duration === exercise.actualDuration ||
          exercise.actualDistance !== undefined && currentTemplateExercise.distance === exercise.actualDistance
        );
        
        if (hasBaselineChange) {
          // Ensure the exercise exists in our map
          if (!exerciseMap[exerciseName]) {
            exerciseMap[exerciseName] = {
              name: exerciseName,
              isDurationBased: !!exercise.isDurationBased,
              versions: [],
              workouts: [workout.name]
            };
          }
          
          // Create a new version
          const newVersion = {
            planned: {
              sets: templateExercise.sets,
              reps: templateExercise.reps,
              weight: templateExercise.weight,
              duration: templateExercise.duration,
              durationUnit: templateExercise.durationUnit,
              distance: templateExercise.distance
            },
            actual: {
              sets: exercise.actualSets,
              reps: exercise.actualReps,
              weight: exercise.actualWeight,
              duration: exercise.actualDuration,
              durationUnit: exercise.actualDurationUnit,
              distance: exercise.actualDistance
            },
            date: workout.completedAt || workout.timestamp || workout.date
          };
          
          // Add this as a new version if it's different from the last one
          const existingVersions = exerciseMap[exerciseName].versions;
          const lastVersion = existingVersions[existingVersions.length - 1];
          
          // Check if this version is different from the last one
          let isDifferent = false;
          
          if (lastVersion) {
            // Compare values between versions
            if (exercise.isDurationBased) {
              isDifferent = (
                newVersion.actual.sets !== lastVersion.planned.sets ||
                newVersion.actual.duration !== lastVersion.planned.duration ||
                newVersion.actual.distance !== lastVersion.planned.distance
              );
            } else {
              isDifferent = (
                newVersion.actual.sets !== lastVersion.planned.sets ||
                newVersion.actual.reps !== lastVersion.planned.reps ||
                newVersion.actual.weight !== lastVersion.planned.weight
              );
            }
          }
          
          if (isDifferent) {
            // Add the new version and mark previous as not current
            if (lastVersion) {
              lastVersion.isCurrent = false;
            }
            
            // Add the new version as current
            newVersion.isCurrent = true;
            exerciseMap[exerciseName].versions.push(newVersion);
          }
        }
      });
    });
    
    // Second approach: Check for exercises in templates that have been updated
    workoutTemplates.forEach(template => {
      if (template.exercises) {
        template.exercises.forEach(exercise => {
          if (!exercise || !exercise.name) return;
          
          const exerciseName = exercise.name;
          
          if (exerciseMap[exerciseName]) {
            // Get the initial values
            const initialVersion = exerciseMap[exerciseName].versions[0];
            
            // Check if current template values differ from initial values
            if (initialVersion && initialVersion.planned) {
              const isDifferent = (
                parseInt(exercise.sets) !== parseInt(initialVersion.planned.sets) ||
                (exercise.reps && initialVersion.planned.reps && parseInt(exercise.reps) !== parseInt(initialVersion.planned.reps)) ||
                (exercise.weight && initialVersion.planned.weight && parseFloat(exercise.weight) !== parseFloat(initialVersion.planned.weight)) ||
                (exercise.duration && initialVersion.planned.duration && parseInt(exercise.duration) !== parseInt(initialVersion.planned.duration)) ||
                (exercise.distance && initialVersion.planned.distance && exercise.distance !== initialVersion.planned.distance)
              );
              
              if (isDifferent && initialVersion.isInitial) {
                // Create a new version based on current template values
                const newVersion = {
                  planned: {
                    sets: exercise.sets,
                    reps: exercise.reps,
                    weight: exercise.weight,
                    duration: exercise.duration,
                    durationUnit: exercise.durationUnit,
                    distance: exercise.distance
                  },
                  isCurrent: true,
                  date: template.lastUpdated || new Date().toISOString()
                };
                
                // Update initial version
                initialVersion.isCurrent = false;
                
                // Add the new version
                exerciseMap[exerciseName].versions.push(newVersion);
              }
            }
          }
        });
      }
    });
    
    // Convert to array for easier filtering/sorting
    let exercisesArray = Object.values(exerciseMap);
    
    // Sort versions within each exercise (newest first - meaning current is first)
    exercisesArray.forEach(exercise => {
      exercise.versions.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    // Count the baseline changes
    exercisesArray.forEach(exercise => {
      exercise.baselineChanges = exercise.versions.length > 1 ? exercise.versions.length - 1 : 0;
    });
    
    // Filter by workout type if specified
    if (workoutType) {
      const isCardioType = ['running', 'walking', 'cycling', 'swimming', 'cardio', 'hiit'].includes(workoutType);
      exercisesArray = exercisesArray.filter(exercise => isCardioType ? exercise.isDurationBased : !exercise.isDurationBased);
    }
    
    // Filter by exercise names if specified
    if (exerciseFilter && exerciseFilter.length > 0) {
      exercisesArray = exercisesArray.filter(exercise => 
        exerciseFilter.some(name => name.toLowerCase() === exercise.name.toLowerCase())
      );
    }
    
    setProgressionData(exercisesArray);
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

  // Get values from a version (actual or planned)
  const getVersionValues = (version) => {
    if (version.actual) {
      return version.actual;
    }
    return version.planned;
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
                Add exercises to your workouts to track progression.
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
              <div className="space-y-4">
                {progressionData
                  .filter(exercise => {
                    if (selectedType === 'all') return true;
                    if (selectedType === 'strength') return !exercise.isDurationBased;
                    if (selectedType === 'cardio') return exercise.isDurationBased;
                    return true;
                  })
                  .map((exercise) => (
                    <div key={exercise.name} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                      {/* Exercise header */}
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {exercise.isDurationBased ? (
                            <Activity size={16} className="text-green-500 dark:text-green-400" />
                          ) : (
                            <Dumbbell size={16} className="text-blue-500 dark:text-blue-400" />
                          )}
                          <h4 className="font-medium text-slate-800 dark:text-slate-100">{exercise.name}</h4>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {exercise.baselineChanges} baseline changes
                        </div>
                      </div>
                      
                      {/* Versions grid - with newest first */}
                      <div className="p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {exercise.versions.map((version, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-lg border ${
                                version.isCurrent
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Version {exercise.versions.length - idx}
                                </div>
                                {version.isCurrent && (
                                  <div className="text-xs text-green-600 dark:text-green-400">
                                    Current
                                  </div>
                                )}
                              </div>
                              
                              {/* Exercise details */}
                              {!exercise.isDurationBased ? (
                                // Strength exercise
                                <div className="space-y-1">
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
                                <div className="space-y-1">
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
                            </div>
                          ))}
                        </div>
                        
                        {/* Used in workouts list */}
                        {exercise.workouts && exercise.workouts.length > 0 && (
                          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Used in: {exercise.workouts.join(', ')}</span>
                          </div>
                        )}
                      </div>
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