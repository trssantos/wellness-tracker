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

    
    
    // Compare latest workout with previous one
    if (sortedWorkouts.length >= 2) {
      const latest = sortedWorkouts[sortedWorkouts.length - 1];
      const previous = sortedWorkouts[sortedWorkouts.length - 2];
      generateComparisonData(latest, previous);
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
  

  // Get trend direction for a metric
  const getTrendDirection = (metrics, key) => {
    if (!metrics || metrics.length < 2) return "neutral";
    
    const recent = metrics.slice(-2);
    const diff = recent[1][key] - recent[0][key];
    
    if (diff > 0) return "up";
    if (diff < 0) return "down";
    return "neutral";
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
               
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutProgress;