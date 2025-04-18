import React from 'react';
import { 
  Activity, Route, Droplet, Clock, Target, MapPin, Users, Award, Zap, 
  Dumbbell, Repeat, Heart, Gauge
} from 'lucide-react';

const WorkoutTypeDetails = ({ workout }) => {
  if (!workout) return null;

  // Helper function to check if a set of fields exists
  const hasTypeSpecificInfo = () => {
    const type = workout.type;
    
    switch(type) {
      case 'swimming':
        return !!(workout.swimStroke || workout.poolLength || workout.swimGoal);
      case 'running':
      case 'walking':
        return !!(workout.runType || workout.surfaceType || workout.targetPace);
      case 'cycling':
        return !!(workout.cyclingType || workout.cyclingTargetType || workout.cyclingGoal);
      case 'yoga':
      case 'pilates':
      case 'flexibility':
        return !!(workout.practiceStyle || workout.experienceLevel || workout.poseTime);
      case 'sports':
        return !!(workout.sportType || workout.sportGoal || workout.teamSize);
      case 'martial_arts':
      case 'boxing':
        return !!(workout.martialStyle || workout.trainingType || workout.numRounds);
      case 'strength':
      case 'bodyweight':
      case 'hiit':
      case 'crossfit':
        return !!(workout.workoutFormat || workout.restInterval || workout.focusAreas?.length);
      default:
        return false;
    }
  };

  if (!hasTypeSpecificInfo()) return null;

  // Render type-specific details based on workout type
  const renderTypeSpecificDetails = () => {
    const type = workout.type;
    
    switch(type) {
      case 'swimming':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workout.swimStroke && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Droplet size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Stroke</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.swimStroke.charAt(0).toUpperCase() + workout.swimStroke.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.poolLength && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                  <Route size={18} className="text-teal-500 dark:text-teal-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Pool Length</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.poolLength}
                  </div>
                </div>
              </div>
            )}
            
            {workout.swimTargetType && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Target</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.swimTargetType.charAt(0).toUpperCase() + workout.swimTargetType.slice(1)}
                    {workout.swimTargetValue && `: ${workout.swimTargetValue}`}
                  </div>
                </div>
              </div>
            )}
            
            {workout.swimGoal && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Award size={18} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Goal</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.swimGoal.charAt(0).toUpperCase() + workout.swimGoal.slice(1)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'running':
      case 'walking':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workout.runType && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Type</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.runType.charAt(0).toUpperCase() + workout.runType.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.surfaceType && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Surface</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.surfaceType.charAt(0).toUpperCase() + workout.surfaceType.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.targetPace && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Gauge size={18} className="text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Target Pace</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.targetPace}
                  </div>
                </div>
              </div>
            )}
            
            {workout.distance && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Route size={18} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Distance</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.distance} {workout.distanceUnit || 'km'}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'cycling':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workout.cyclingType && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Type</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.cyclingType.charAt(0).toUpperCase() + workout.cyclingType.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.cyclingTargetType && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Target Metric</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.cyclingTargetType.charAt(0).toUpperCase() + workout.cyclingTargetType.slice(1)}
                    {workout.cyclingTargetValue && `: ${workout.cyclingTargetValue}`}
                  </div>
                </div>
              </div>
            )}
            
            {workout.distance && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Route size={18} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Distance</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.distance} {workout.distanceUnit || 'km'}
                  </div>
                </div>
              </div>
            )}
            
            {workout.cyclingGoal && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Award size={18} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Goal</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.cyclingGoal.charAt(0).toUpperCase() + workout.cyclingGoal.slice(1)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'yoga':
      case 'pilates':
      case 'flexibility':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workout.practiceStyle && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                  <Droplet size={18} className="text-teal-500 dark:text-teal-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Style</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.practiceStyle.charAt(0).toUpperCase() + workout.practiceStyle.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.experienceLevel && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Heart size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Level</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.experienceLevel.charAt(0).toUpperCase() + workout.experienceLevel.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.poseTime && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Hold Duration</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.poseTime.charAt(0).toUpperCase() + workout.poseTime.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.focusAreas && workout.focusAreas.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Focus Areas</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.focusAreas.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'sports':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workout.sportType && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} className="text-green-500 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Sport</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.sportType.charAt(0).toUpperCase() + workout.sportType.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.sportGoal && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Activity</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.sportGoal.charAt(0).toUpperCase() + workout.sportGoal.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.teamSize && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Team Size</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.teamSize}
                  </div>
                </div>
              </div>
            )}
            
            {workout.skillLevel && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Award size={18} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Skill Level</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.skillLevel.charAt(0).toUpperCase() + workout.skillLevel.slice(1)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'martial_arts':
      case 'boxing':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workout.martialStyle && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Activity size={18} className="text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Style</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.martialStyle.charAt(0).toUpperCase() + workout.martialStyle.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.trainingType && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Training Type</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.trainingType.charAt(0).toUpperCase() + workout.trainingType.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.numRounds && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Rounds</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.numRounds} × {workout.roundLength || 3}min
                  </div>
                </div>
              </div>
            )}
            
            {workout.skillLevel && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Award size={18} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Skill Level</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.skillLevel.charAt(0).toUpperCase() + workout.skillLevel.slice(1)}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'strength':
      case 'bodyweight':
      case 'hiit':
      case 'crossfit':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {workout.workoutFormat && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <Repeat size={18} className="text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Format</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.workoutFormat.charAt(0).toUpperCase() + workout.workoutFormat.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.restInterval && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Rest Intervals</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.restInterval.charAt(0).toUpperCase() + workout.restInterval.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.intensityLevel && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Intensity</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.intensityLevel.charAt(0).toUpperCase() + workout.intensityLevel.slice(1)}
                  </div>
                </div>
              </div>
            )}
            
            {workout.focusAreas && workout.focusAreas.length > 0 && (
              <div className="flex items-start gap-2">
                <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Focus Areas</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {workout.focusAreas.join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 mb-6">
      <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Activity size={16} className="text-slate-500 dark:text-slate-400" />
        {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)} Details
      </h3>
      
      {renderTypeSpecificDetails()}
    </div>
  );
};

export default WorkoutTypeDetails;