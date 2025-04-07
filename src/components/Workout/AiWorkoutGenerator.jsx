import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, X, Brain, AlertTriangle, Sliders, Dumbbell, 
         Activity, Heart, Map, Clock, User, Loader, Book, Target, MessageSquare } from 'lucide-react';
import { generateWorkout } from '../../utils/workoutAiService';
import { getWorkoutTypes, getWorkoutLocations, getEquipmentOptions, createWorkout } from '../../utils/workoutUtils';

const AiWorkoutGenerator = ({ onWorkoutGenerated, onCancel }) => {
  // Form state for workout parameters
  const [params, setParams] = useState({
    type: 'strength',
    location: 'gym',
    duration: 45,
    equipment: [],
    fitnessLevel: 'intermediate',
    limitations: '',
    focusAreas: [],
    objective: '' // New field for workout objective/description
  });
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [error, setError] = useState(null);
  const [showAllEquipment, setShowAllEquipment] = useState(false);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle equipment toggle
  const handleEquipmentToggle = (item) => {
    setParams(prev => {
      const equipment = [...prev.equipment];
      
      if (equipment.includes(item)) {
        return { ...prev, equipment: equipment.filter(i => i !== item) };
      } else {
        return { ...prev, equipment: [...equipment, item] };
      }
    });
  };
  
  // Handle focus area toggle
  const handleFocusAreaToggle = (area) => {
    setParams(prev => {
      const focusAreas = [...prev.focusAreas];
      
      if (focusAreas.includes(area)) {
        return { ...prev, focusAreas: focusAreas.filter(a => a !== area) };
      } else {
        return { ...prev, focusAreas: [...focusAreas, area] };
      }
    });
  };
  
  // Generate workout with AI
  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);
    
    try {
      const workout = await generateWorkout(params);
      setGeneratedWorkout(workout);
    } catch (error) {
      console.error('Error generating workout:', error);
      setError(error.message || 'Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save the generated workout
  const handleSaveWorkout = () => {
    try {
      const savedWorkout = createWorkout(generatedWorkout);
      onWorkoutGenerated(savedWorkout);
    } catch (error) {
      console.error('Error saving workout:', error);
      setError(error.message || 'Failed to save workout. Please try again.');
    }
  };
  
  // Focus areas based on workout type
  const getFocusAreas = () => {
    switch (params.type) {
      case 'strength':
      case 'bodyweight':
      case 'hiit':
      case 'crossfit':
        return ['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Push', 'Pull', 'Legs'];
      case 'cardio':
      case 'running':
      case 'cycling':
        return ['Endurance', 'Speed', 'Intervals', 'Hills', 'Recovery'];
      case 'flexibility':
      case 'yoga':
      case 'pilates':
        return ['Flexibility', 'Balance', 'Mobility', 'Relaxation', 'Recovery'];
      default:
        return ['Full Body', 'Endurance', 'Strength', 'Flexibility'];
    }
  };
  
  return (
    <div className="px-2 sm:px-0 w-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <button 
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
          AI Workout Generator
        </h2>
      </div>
      
      {!generatedWorkout ? (
        // Workout parameters form
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Brain size={20} className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">
                  How it works
                </p>
                <p>
                  Tell us your preferences and any limitations, and our AI will create a personalized workout plan for you. You can review and edit the workout before saving it.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workout Type */}
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Activity size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="type" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Workout Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={params.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  {getWorkoutTypes().map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Duration */}
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="duration" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Duration (minutes)
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={params.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Map size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="location" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  value={params.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  {getWorkoutLocations().map(location => (
                    <option key={location.value} value={location.value}>{location.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Fitness Level */}
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="fitnessLevel" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Fitness Level
                </label>
                <select
                  id="fitnessLevel"
                  name="fitnessLevel"
                  value={params.fitnessLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Equipment */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell size={18} className="text-slate-700 dark:text-slate-300" />
              <h3 className="font-medium text-slate-800 dark:text-slate-100">
                Available Equipment
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {getEquipmentOptions()
                .slice(0, showAllEquipment ? getEquipmentOptions().length : 10)
                .map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleEquipmentToggle(option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                      params.equipment.includes(option.value)
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent'
                    }`}
                  >
                    {params.equipment.includes(option.value) && (
                      <CheckCircle size={12} className="inline-block mr-1" />
                    )}
                    {option.label}
                  </button>
                ))}
              
              {!showAllEquipment && (
                <button
                  type="button"
                  onClick={() => setShowAllEquipment(true)}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  Show More...
                </button>
              )}
            </div>
            
            {params.equipment.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No equipment selected. We'll generate a bodyweight workout.
              </p>
            )}
          </div>
          
          {/* Focus Areas */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-slate-700 dark:text-slate-300" />
              <h3 className="font-medium text-slate-800 dark:text-slate-100">
                Focus Areas
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {getFocusAreas().map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleFocusAreaToggle(area)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    params.focusAreas.includes(area)
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent'
                  }`}
                >
                  {params.focusAreas.includes(area) && (
                    <CheckCircle size={12} className="inline-block mr-1" />
                  )}
                  {area}
                </button>
              ))}
            </div>
            
            {params.focusAreas.length === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No focus areas selected. We'll create a balanced workout.
              </p>
            )}
          </div>
          
          {/* Workout Objective / Description - NEW SECTION */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={18} className="text-slate-700 dark:text-slate-300" />
              <h3 className="font-medium text-slate-800 dark:text-slate-100">
                Workout Objective
              </h3>
            </div>
            
            <textarea
              name="objective"
              value={params.objective}
              onChange={handleInputChange}
              placeholder="Describe your workout goals or objectives (e.g., 'lose belly fat', 'build muscle for beginners', 'improve endurance')"
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-20"
            />
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This helps AI understand your specific goals and create a more tailored workout.
            </p>
          </div>
          
          {/* Health Limitations */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} className="text-red-500 dark:text-red-400" />
              <h3 className="font-medium text-slate-800 dark:text-slate-100">
                Health Considerations
              </h3>
            </div>
            
            <textarea
              name="limitations"
              value={params.limitations}
              onChange={handleInputChange}
              placeholder="Describe any injuries, health conditions, or limitations we should consider when generating your workout..."
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-20"
            />
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This information helps us create a safer, more appropriate workout for you.
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle size={16} />
              <p>{error}</p>
            </div>
          )}
          
          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 
              ${isGenerating ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600' : 
                'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'}`}
          >
            {isGenerating ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Generating Workout...</span>
              </>
            ) : (
              <>
                <Brain size={18} />
                <span>Generate Workout</span>
              </>
            )}
          </button>
        </div>
      ) : (
        // Generated Workout Review
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <p className="font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Workout Generated Successfully!
                </p>
                <p>
                  Review your personalized workout below. You can save it as is or go back to adjust your preferences.
                </p>
              </div>
            </div>
          </div>
          
          {/* Workout Preview */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
                {generatedWorkout.name}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  <Activity size={14} />
                  {generatedWorkout.type.charAt(0).toUpperCase() + generatedWorkout.type.slice(1)}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                  <Clock size={14} />
                  {generatedWorkout.duration} minutes
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                  <Map size={14} />
                  {generatedWorkout.location.charAt(0).toUpperCase() + generatedWorkout.location.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              {/* Equipment */}
              {generatedWorkout.equipment && generatedWorkout.equipment.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <Dumbbell size={16} className="text-slate-500 dark:text-slate-400" />
                    Equipment
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedWorkout.equipment.map((item, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Exercises */}
              <div className="mb-4">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                  <Activity size={16} className="text-slate-500 dark:text-slate-400" />
                  Exercises
                </h4>
                <div className="space-y-3">
                  {generatedWorkout.exercises.map((exercise, index) => (
                    <div 
                      key={index}
                      className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-700 dark:text-slate-200">
                          {index + 1}. {exercise.name}
                        </div>
                        <div className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                          {exercise.sets} × {exercise.reps}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {exercise.weight && (
                          <div className="flex items-center gap-1">
                            <span>Weight: {exercise.weight}</span>
                          </div>
                        )}
                        
                        {exercise.restTime && (
                          <div className="flex items-center gap-1">
                            <span>Rest: {exercise.restTime}s</span>
                          </div>
                        )}
                      </div>
                      
                      {exercise.notes && (
                        <div className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                          {exercise.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notes */}
              {generatedWorkout.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <Book size={16} className="text-slate-500 dark:text-slate-400" />
                    Notes
                  </h4>
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                    {generatedWorkout.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={() => setGeneratedWorkout(null)}
              className="order-2 sm:order-1 py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Go Back & Edit
            </button>
            
            <button
              onClick={handleSaveWorkout}
              className="order-1 sm:order-2 py-2 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Save This Workout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiWorkoutGenerator;