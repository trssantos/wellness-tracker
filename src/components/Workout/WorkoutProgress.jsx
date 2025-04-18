import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChevronDown, ChevronUp, TrendingUp, Clock, Dumbbell, Route, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const WorkoutProgress = ({ workout, completedWorkouts }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetails, setShowDetails] = useState(false);
  const [progressData, setProgressData] = useState([]);
  const [exerciseProgress, setExerciseProgress] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseMetrics, setExerciseMetrics] = useState([]);
  const [compareData, setCompareData] = useState(null);

  // Process workout data on mount and when completedWorkouts changes
  useEffect(() => {
    if (completedWorkouts && completedWorkouts.length > 0) {
      processWorkoutData();
    }
  }, [completedWorkouts]);

  // Process workout data to generate progress metrics
  const processWorkoutData = () => {
    // Sort workouts by date (newest first)
    const sortedWorkouts = [...completedWorkouts].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.timestamp || a.date);
      const dateB = new Date(b.completedAt || b.timestamp || b.date);
      return dateA - dateB; // Oldest to newest for charts
    });

    // Generate data for overall progress metrics (time, intensity, etc.)
    const progressData = sortedWorkouts.map((workout, index) => {
      const date = new Date(workout.completedAt || workout.timestamp || workout.date);
      return {
        name: date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
        duration: workout.duration || 0,
        intensity: getIntensityValue(workout.intensity) || 3,
        date: date,
        workout: workout,
        index: index
      };
    });

    setProgressData(progressData);

    // Process exercise-specific progress (exercise completion, weights, etc.)
    processExerciseProgress(sortedWorkouts);
    
    // Compare latest workout with previous one
    if (sortedWorkouts.length >= 2) {
      const latest = sortedWorkouts[sortedWorkouts.length - 1];
      const previous = sortedWorkouts[sortedWorkouts.length - 2];
      generateComparisonData(latest, previous);
    }
  };

  // Process exercise-specific progress
  const processExerciseProgress = (sortedWorkouts) => {
    // Get all unique exercises across workouts
    const allExercises = new Map();
    
    sortedWorkouts.forEach(workout => {
      if (workout.exercises && workout.exercises.length > 0) {
        workout.exercises.forEach(exercise => {
          if (!exercise) return;
          
          const exerciseName = exercise.name;
          if (!allExercises.has(exerciseName)) {
            allExercises.set(exerciseName, {
              name: exerciseName,
              history: [],
              isDurationBased: exercise.isDurationBased || false
            });
          }
          
          // Add this instance to the exercise history
          const date = new Date(workout.completedAt || workout.timestamp || workout.date);
          allExercises.get(exerciseName).history.push({
            date: date,
            dateStr: date.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
            weight: exercise.actualWeight || exercise.weight || '',
            reps: exercise.actualReps || exercise.reps || 0,
            sets: exercise.actualSets || exercise.sets || 0,
            duration: exercise.actualDuration || exercise.duration || 0,
            durationUnit: exercise.actualDurationUnit || exercise.durationUnit || 'min',
            distance: exercise.actualDistance || exercise.distance || '',
            intensity: exercise.actualIntensity || exercise.intensity || 'medium',
            completed: exercise.completed !== false, // Default to true if not specified
            isDurationBased: exercise.isDurationBased || false
          });
        });
      }
    });
    
    // Convert to array and sort by frequency (most common exercises first)
    const exercisesArray = Array.from(allExercises.values())
      .map(ex => ({
        ...ex,
        frequency: ex.history.length,
        lastPerformed: ex.history.length > 0 ? ex.history[ex.history.length - 1].date : null
      }))
      .sort((a, b) => b.frequency - a.frequency);
    
    setExerciseProgress(exercisesArray);
    
    // Set initial selected exercise
    if (exercisesArray.length > 0) {
      setSelectedExercise(exercisesArray[0].name);
      generateExerciseMetrics(exercisesArray[0]);
    }
  };

  // Generate comparison data between latest and previous workout
  const generateComparisonData = (latest, previous) => {
    // Duration comparison
    const durationDiff = (latest.duration || 0) - (previous.duration || 0);
    const durationPercent = previous.duration ? Math.round((durationDiff / previous.duration) * 100) : 0;
    
    // Intensity comparison
    const latestIntensity = getIntensityValue(latest.intensity);
    const previousIntensity = getIntensityValue(previous.intensity);
    const intensityDiff = latestIntensity - previousIntensity;
    
    // Exercise completion rate
    const latestCompleted = latest.exercises?.filter(ex => ex.completed !== false).length || 0;
    const latestTotal = latest.exercises?.length || 0;
    const latestCompletionRate = latestTotal > 0 ? Math.round((latestCompleted / latestTotal) * 100) : 0;
    
    const previousCompleted = previous.exercises?.filter(ex => ex.completed !== false).length || 0;
    const previousTotal = previous.exercises?.length || 0;
    const previousCompletionRate = previousTotal > 0 ? Math.round((previousCompleted / previousTotal) * 100) : 0;
    
    const completionDiff = latestCompletionRate - previousCompletionRate;
    
    setCompareData({
      duration: {
        latest: latest.duration || 0,
        previous: previous.duration || 0,
        diff: durationDiff,
        percent: durationPercent
      },
      intensity: {
        latest: latestIntensity,
        previous: previousIntensity,
        diff: intensityDiff
      },
      completion: {
        latest: latestCompletionRate,
        previous: previousCompletionRate,
        diff: completionDiff
      },
      dates: {
        latest: new Date(latest.completedAt || latest.timestamp || latest.date),
        previous: new Date(previous.completedAt || previous.timestamp || previous.date)
      }
    });
  };

  // Generate metrics for a specific exercise
  const generateExerciseMetrics = (exerciseData) => {
    if (!exerciseData || !exerciseData.history || exerciseData.history.length === 0) {
      setExerciseMetrics([]);
      return;
    }
    
    const metrics = exerciseData.history.map(item => {
      // For traditional strength exercises
      if (!exerciseData.isDurationBased) {
        // Calculate volume (sets * reps * weight)
        const sets = parseInt(item.sets) || 0;
        const reps = parseInt(item.reps) || 0;
        const weight = parseFloat(item.weight) || 0;
        const volume = sets * reps * weight;
        
        return {
          dateStr: item.dateStr,
          date: item.date,
          weight: weight, 
          reps: reps,
          sets: sets,
          volume: weight > 0 ? volume : null, // Only show volume if weight is tracked
          completed: item.completed
        };
      } else {
        // For duration-based exercises
        const duration = parseInt(item.duration) || 0;
        const durationInSeconds = item.durationUnit === 'min' ? duration * 60 : duration;
        
        // Try to parse distance if available
        let distance = 0;
        if (item.distance) {
          const match = item.distance.match(/\d+(\.\d+)?/);
          if (match) {
            distance = parseFloat(match[0]);
          }
        }
        
        const pace = distance > 0 && durationInSeconds > 0 ? 
          durationInSeconds / 60 / distance : // minutes per distance unit
          null;
        
        return {
          dateStr: item.dateStr,
          date: item.date,
          duration: duration,
          durationUnit: item.durationUnit,
          distance: distance > 0 ? distance : null,
          pace: pace,
          sets: parseInt(item.sets) || 1,
          intensity: getIntensityValue(item.intensity),
          completed: item.completed
        };
      }
    });
    
    setExerciseMetrics(metrics);
  };

  // Helper function to convert intensity string to numeric value
  const getIntensityValue = (intensity) => {
    if (!intensity) return 3;
    
    if (typeof intensity === 'number') {
      return intensity;
    }
    
    switch(intensity.toLowerCase()) {
      case 'light':
      case 'easy':
        return 1;
      case 'moderate':
        return 2; 
      case 'medium':
        return 3;
      case 'challenging':
        return 4;
      case 'intense':
      case 'high':
      case 'maximum':
        return 5;
      default:
        return 3;
    }
  };

  // Get string representation of intensity
  const getIntensityLabel = (value) => {
    switch(value) {
      case 1: return "Light";
      case 2: return "Moderate";
      case 3: return "Medium";
      case 4: return "Challenging";
      case 5: return "Intense";
      default: return "Medium";
    }
  };
  
  // Handle exercise selection
  const handleExerciseSelect = (exerciseName) => {
    setSelectedExercise(exerciseName);
    const exercise = exerciseProgress.find(ex => ex.name === exerciseName);
    if (exercise) {
      generateExerciseMetrics(exercise);
    }
  };

  // Get trend direction for a metric
  const getTrendDirection = (metrics, key) => {
    if (!metrics || metrics.length < 2) return "neutral";
    
    const recent = metrics.slice(-2);
    const diff = recent[1][key] - recent[0][key];
    
    if (diff > 0) return "up";
    if (diff < 0) return "down";
    return "neutral";
  };

  // Get the appropriate icon for a trend
  const getTrendIcon = (direction, isPositive = true) => {
    if (direction === "up") {
      return <ArrowUp size={16} className={isPositive ? "text-green-500" : "text-red-500"} />;
    }
    if (direction === "down") {
      return <ArrowDown size={16} className={isPositive ? "text-red-500" : "text-green-500"} />;
    }
    return <Minus size={16} className="text-slate-500" />;
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('default', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    });
  };

  // Check if we have enough data to show progress
  const hasEnoughData = progressData.length >= 2;

  // Render comparison section
  const renderComparison = () => {
    if (!compareData) return null;
    
    return (
      <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Latest vs Previous Workout
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-4 text-sm">
          <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 dark:text-slate-400">Duration</span>
              {compareData.duration.diff !== 0 && (
                <span className={`flex items-center ${compareData.duration.diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {compareData.duration.diff > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="transform rotate-180" />}
                  {Math.abs(compareData.duration.diff)} min
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {compareData.duration.latest} min
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs {compareData.duration.previous} min
              </span>
            </div>
          </div>
          
          <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 dark:text-slate-400">Intensity</span>
              {compareData.intensity.diff !== 0 && (
                <span className={`flex items-center ${compareData.intensity.diff > 0 ? 'text-green-500' : 'text-amber-500'}`}>
                  {compareData.intensity.diff > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="transform rotate-180" />}
                  {Math.abs(compareData.intensity.diff)} level{Math.abs(compareData.intensity.diff) !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {getIntensityLabel(compareData.intensity.latest)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs {getIntensityLabel(compareData.intensity.previous)}
              </span>
            </div>
          </div>
          
          <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 dark:text-slate-400">Completion</span>
              {compareData.completion.diff !== 0 && (
                <span className={`flex items-center ${compareData.completion.diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {compareData.completion.diff > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="transform rotate-180" />}
                  {Math.abs(compareData.completion.diff)}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {compareData.completion.latest}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                vs {compareData.completion.previous}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {compareData.dates.latest && compareData.dates.previous && (
            <div className="flex justify-between">
              <span>Previous: {formatDate(compareData.dates.previous)}</span>
              <span>Latest: {formatDate(compareData.dates.latest)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render exercise progress charts
  const renderExerciseCharts = () => {
    const selectedExerciseData = exerciseProgress.find(ex => ex.name === selectedExercise);
    
    if (!selectedExerciseData || exerciseMetrics.length < 2) {
      return (
        <div className="text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">
            Not enough data to show exercise progress charts.
          </p>
        </div>
      );
    }
    
    return (
      <div>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* For strength exercises, show weight, reps, volume */}
            {!selectedExerciseData.isDurationBased && (
              <>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exerciseMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateStr" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      {exerciseMetrics.some(m => m.weight > 0) && (
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#3b82f6" 
                          activeDot={{ r: 8 }} 
                          name="Weight" 
                        />
                      )}
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="reps" 
                        stroke="#10b981" 
                        name="Reps" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {exerciseMetrics.some(m => m.volume !== null) && (
                  <div className="h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={exerciseMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateStr" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="volume" fill="#8884d8" name="Volume (sets × reps × weight)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
            
            {/* For duration exercises, show duration, distance, pace */}
            {selectedExerciseData.isDurationBased && (
              <>
                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exerciseMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateStr" />
                      <YAxis yAxisId="left" />
                      {exerciseMetrics.some(m => m.distance !== null) && (
                        <YAxis yAxisId="right" orientation="right" />
                      )}
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#3b82f6" 
                        activeDot={{ r: 8 }} 
                        name="Duration" 
                      />
                      {exerciseMetrics.some(m => m.distance !== null) && (
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="distance" 
                          stroke="#10b981" 
                          name="Distance" 
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {exerciseMetrics.some(m => m.pace !== null) && (
                  <div className="h-64 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={exerciseMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateStr" />
                        <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="pace" 
                          stroke="#f59e0b" 
                          name="Pace (min/unit)" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Performance Insights</h4>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300">
            {!selectedExerciseData.isDurationBased ? (
              // Strength exercise insights
              <>
                {exerciseMetrics.length >= 3 && (
                  <p>
                    {selectedExerciseData.name} has been performed {exerciseMetrics.length} times. 
                    {getTrendDirection(exerciseMetrics, 'weight') === 'up' && " You've been consistently increasing weight - great progress!"}
                    {getTrendDirection(exerciseMetrics, 'reps') === 'up' && " Your rep count is trending upward, showing improved endurance."}
                    {getTrendDirection(exerciseMetrics, 'weight') === 'neutral' && getTrendDirection(exerciseMetrics, 'reps') === 'neutral' && 
                      " You've been maintaining consistent performance."}
                  </p>
                )}
                
                {exerciseMetrics.length >= 2 && exerciseMetrics.some(m => m.volume !== null) && (
                  <p className="mt-2">
                    {getTrendDirection(exerciseMetrics, 'volume') === 'up' 
                      ? "Your total volume (sets × reps × weight) is increasing, indicating overall strength gains."
                      : getTrendDirection(exerciseMetrics, 'volume') === 'down'
                        ? "Your total volume has decreased recently. Consider adjusting your training to build back up."
                        : "Your total volume has remained steady."}
                  </p>
                )}
              </>
            ) : (
              // Duration exercise insights
              <>
                {exerciseMetrics.length >= 3 && (
                  <p>
                    {selectedExerciseData.name} has been performed {exerciseMetrics.length} times.
                    {getTrendDirection(exerciseMetrics, 'duration') === 'up' && " Your duration is increasing, showing improved endurance."}
                    {getTrendDirection(exerciseMetrics, 'distance') === 'up' && " You're covering more distance over time - excellent progress!"}
                  </p>
                )}
                
                {exerciseMetrics.length >= 2 && exerciseMetrics.some(m => m.pace !== null) && (
                  <p className="mt-2">
                    {getTrendDirection(exerciseMetrics, 'pace') === 'down'
                      ? "Your pace is improving (lower minutes per distance unit), showing better efficiency."
                      : getTrendDirection(exerciseMetrics, 'pace') === 'up'
                        ? "Your pace has slowed recently. This could be intentional or might indicate fatigue."
                        : "Your pace has remained consistent."}
                  </p>
                )}
              </>
            )}
            
            {exerciseMetrics.length >= 5 && (
              <p className="mt-2">
                Your consistency with this exercise is excellent, which typically leads to better long-term results.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main rendering
  return (
    <div className="workout-progress">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
        <div 
          className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <h3 className="font-medium flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <TrendingUp size={18} className="text-blue-500 dark:text-blue-400" />
            Workout Progress
          </h3>
          {showDetails ? 
            <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> :
            <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />
          }
        </div>

        {showDetails && (
          <div className="p-4">
            {!hasEnoughData ? (
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">
                  Complete this workout at least twice to see progress tracking metrics.
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm ${
                      activeTab === 'overview'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('exercises')}
                    className={`px-4 py-2 text-sm ${
                      activeTab === 'exercises'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Exercise Tracking
                  </button>
                </div>
                
                {/* Tab content */}
                {activeTab === 'overview' && (
                  <div>
                    {/* Latest vs Previous comparison */}
                    {renderComparison()}
                    
                    {/* Overview charts */}
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Workout Duration Trend
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="duration" 
                              stroke="#3b82f6" 
                              activeDot={{ r: 8 }} 
                              name="Duration (minutes)" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Workout Intensity Trend
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 5]} />
                            <Tooltip formatter={(value) => [`${value} (${getIntensityLabel(value)})`, 'Intensity']} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="intensity" 
                              stroke="#ef4444" 
                              activeDot={{ r: 8 }} 
                              name="Intensity" 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Frequency metrics */}
                    <div className="mt-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Workout Frequency
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <div className="w-full sm:w-auto flex-1 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Completions</div>
                          <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{completedWorkouts.length}</div>
                        </div>
                        
                        {completedWorkouts.length >= 2 && (
                          <div className="w-full sm:w-auto flex-1 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Average Frequency</div>
                            <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                              {(() => {
                                // Calculate average time between workouts
                                const sortedDates = progressData.map(d => d.date).sort((a, b) => a - b);
                                const firstDate = sortedDates[0];
                                const lastDate = sortedDates[sortedDates.length - 1];
                                const daysDiff = Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24));
                                const frequency = sortedDates.length > 1 ? Math.round(daysDiff / (sortedDates.length - 1)) : 0;
                                
                                return frequency > 0 ? `Every ${frequency} day${frequency !== 1 ? 's' : ''}` : 'N/A';
                              })()}
                            </div>
                          </div>
                        )}
                        
                        <div className="w-full sm:w-auto flex-1 bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Completed</div>
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {completedWorkouts.length > 0 && 
                              formatDate(new Date(completedWorkouts[completedWorkouts.length - 1].completedAt || 
                                                 completedWorkouts[completedWorkouts.length - 1].timestamp || 
                                                 completedWorkouts[completedWorkouts.length - 1].date))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'exercises' && (
                  <div>
                    {/* Exercise selector */}
                    <div className="mb-4">
                      <label htmlFor="exercise-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Select Exercise
                      </label>
                      <select
                        id="exercise-select"
                        value={selectedExercise || ''}
                        onChange={(e) => handleExerciseSelect(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      >
                        {exerciseProgress.map(exercise => (
                          <option key={exercise.name} value={exercise.name}>
                            {exercise.name} ({exercise.frequency} times)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Exercise charts */}
                    {renderExerciseCharts()}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutProgress;