import React, { useState, useEffect } from 'react';
import {AlertTriangle, Sun, Moon,X, ArrowLeft, Plus, Trash2, Save, Clock, Calendar, 
         MapPin, Dumbbell, Activity, Check, ChevronDown, 
         ChevronUp, RotateCcw, Heart, Route, Target,
         Users, Award, Zap, Droplet, Ruler, Gauge, Repeat, Edit } from 'lucide-react';
import { createWorkout, updateWorkout, getWorkoutTypes, getWorkoutLocations, getEquipmentOptions } from '../../utils/workoutUtils';
import { getWeightUnit } from '../../utils/storage';

const WorkoutForm = ({ workout, onSave, onCancel }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'strength',
    location: 'gym',
    duration: 45,
    frequency: ['mon', 'wed', 'fri'],
    timeOfDay: 'anytime',
    equipment: [],
    exercises: [],
    notes: '',
    limitations: '',
    // Additional fields for specific workout types
    distance: '',
    distanceUnit: 'km',
    targetPace: '',
    elevation: '',
    sportType: '',
    skillLevel: 'intermediate',
    intensityLevel: 'moderate',
    style: '',
    teamSize: '',
    focusAreas: []
  });
  
  const [errors, setErrors] = useState({});
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: 3,
    reps: 10,
    weight: '',
    restTime: 60,
    notes: '',
    // Add these new fields:
    isDurationBased: false,
    duration: 0,
    durationUnit: 'min', // 'min' or 'sec'
    distance: ''
  });
  
  // New state variables for exercise editing
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(null);
  const [isEditingExercise, setIsEditingExercise] = useState(false);
  
  // UI state
  const [showAllEquipment, setShowAllEquipment] = useState(false);
  const [activeInfoSection, setActiveInfoSection] = useState('basic');

  const [weightUnit, setWeightUnit] = useState('lbs');
  
  
  // Initialize form with existing workout data if editing
  useEffect(() => {
    setWeightUnit(getWeightUnit());
    if (workout) {
      setFormData({
        name: workout.name || '',
        type: workout.type || 'strength',
        location: workout.location || 'gym',
        duration: workout.duration || 45,
        frequency: workout.frequency || ['mon', 'wed', 'fri'],
        timeOfDay: workout.timeOfDay || 'anytime',
        equipment: workout.equipment || [],
        exercises: workout.exercises || [],
        notes: workout.notes || '',
        limitations: workout.limitations || '',
        // Additional fields
        distance: workout.distance || '',
        distanceUnit: workout.distanceUnit || 'km',
        targetPace: workout.targetPace || '',
        elevation: workout.elevation || '',
        sportType: workout.sportType || '',
        skillLevel: workout.skillLevel || 'intermediate',
        intensityLevel: workout.intensityLevel || 'moderate',
        style: workout.style || '',
        teamSize: workout.teamSize || '',
        focusAreas: workout.focusAreas || []
      });
    }
  }, [workout]);

  
  
  // Get form fields based on workout type
  const getTypeSpecificFields = () => {
    switch(formData.type) {
      case 'running':
      case 'cycling':
      case 'swimming':
      case 'walking':
      case 'cardio':
        return (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 w-full">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-4">
              <Route size={16} />
              Cardio Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <Ruler size={18} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <label htmlFor="distance" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Target Distance
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="distance"
                      name="distance"
                      value={formData.distance}
                      onChange={handleInputChange}
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="e.g., 5.0"
                    />
                    <select
                      name="distanceUnit"
                      value={formData.distanceUnit}
                      onChange={handleInputChange}
                      className="w-20 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    >
                      <option value="km">km</option>
                      <option value="mi">mi</option>
                      <option value="m">m</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                  <Gauge size={18} className="text-green-500 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <label htmlFor="targetPace" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Target Pace
                  </label>
                  <input
                    type="text"
                    id="targetPace"
                    name="targetPace"
                    value={formData.targetPace}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    placeholder={formData.distanceUnit === 'km' ? "min/km (e.g., 5:30)" : "min/mile (e.g., 8:45)"}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                  <Target size={18} className="text-purple-500 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <label htmlFor="intensityLevel" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Intensity Level
                  </label>
                  <select
                    id="intensityLevel"
                    name="intensityLevel"
                    value={formData.intensityLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                    <option value="intense">Intense</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
              </div>
              
              {(formData.type === 'running' || formData.type === 'cycling') && (
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                    <Activity size={18} className="text-amber-500 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="elevation" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Elevation Gain
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="elevation"
                        name="elevation"
                        value={formData.elevation}
                        onChange={handleInputChange}
                        className="w-full p-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        placeholder="e.g., 150"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400">
                        {formData.distanceUnit === 'mi' ? 'ft' : 'm'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
        case 'strength':
            case 'bodyweight':
            case 'hiit':
            case 'crossfit':
              return (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 w-full">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-4">
                    <Dumbbell size={16} />
                    Strength Training Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                        <Target size={18} className="text-red-500 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Focus Areas
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Push', 'Pull', 'Legs'].map(focus => (
                            <button
                              key={focus}
                              type="button"
                              onClick={() => handleFocusAreaToggle(focus)}
                              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                                formData.focusAreas.includes(focus)
                                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {focus}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                        <Repeat size={18} className="text-amber-500 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="style" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Training Style
                        </label>
                        <select
                          id="style"
                          name="style"
                          value={formData.style}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        >
                          <option value="">Select Style</option>
                          <option value="circuit">Circuit Training</option>
                          <option value="supersets">Supersets</option>
                          <option value="pyramid">Pyramid Sets</option>
                          <option value="dropsets">Drop Sets</option>
                          <option value="standard">Standard Sets</option>
                          <option value="emom">Every Minute on the Minute (EMOM)</option>
                          <option value="amrap">As Many Rounds as Possible (AMRAP)</option>
                          <option value="tabata">Tabata</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                        <Zap size={18} className="text-purple-500 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="intensityLevel" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Intensity Level
                        </label>
                        <select
                          id="intensityLevel"
                          name="intensityLevel"
                          value={formData.intensityLevel}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                        >
                          <option value="easy">Easy</option>
                          <option value="moderate">Moderate</option>
                          <option value="challenging">Challenging</option>
                          <option value="intense">Intense</option>
                          <option value="maximum">Maximum</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
        
      case 'sports':
      case 'boxing':
      case 'martial_arts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h4 className="col-span-full font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
              <Award size={16} />
              Sport Information
            </h4>
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <Activity size={18} className="text-green-500 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="sportType" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Sport Type
                </label>
                <input
                  type="text"
                  id="sportType"
                  name="sportType"
                  value={formData.sportType}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., Basketball, Tennis, Boxing"
                />
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="teamSize" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Team Size
                </label>
                <input
                  type="text"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., Solo, 2v2, 5v5"
                />
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <Award size={18} className="text-purple-500 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="skillLevel" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Skill Level
                </label>
                <select
                  id="skillLevel"
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        );
        
      case 'yoga':
      case 'pilates':
      case 'flexibility':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h4 className="col-span-full font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
              <Droplet size={16} />
              Flexibility & Mindfulness
            </h4>
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0">
                <Droplet size={18} className="text-teal-500 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="style" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Style/Approach
                </label>
                <input
                  type="text"
                  id="style"
                  name="style"
                  value={formData.style}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  placeholder="e.g., Vinyasa, Hatha, Restorative"
                />
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                <Target size={18} className="text-purple-500 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="focusAreas" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Focus Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Strength', 'Flexibility', 'Balance', 'Relaxation', 'Meditation', 'Core', 'Recovery'].map(focus => (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => handleFocusAreaToggle(focus)}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        formData.focusAreas.includes(focus)
                          ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="intensityLevel" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Intensity Level
                </label>
                <select
                  id="intensityLevel"
                  name="intensityLevel"
                  value={formData.intensityLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="gentle">Gentle</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="intense">Intense</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  // Handle focus area toggle
  const handleFocusAreaToggle = (area) => {
    setFormData(prev => {
      const currentAreas = [...prev.focusAreas];
      
      if (currentAreas.includes(area)) {
        return {
          ...prev,
          focusAreas: currentAreas.filter(a => a !== area)
        };
      } else {
        return {
          ...prev,
          focusAreas: [...currentAreas, area]
        };
      }
    });
  };
  
  // Handle frequency day toggle
  const handleFrequencyToggle = (day) => {
    setFormData(prev => {
      const currentFrequency = [...prev.frequency];
      
      if (currentFrequency.includes(day)) {
        return {
          ...prev,
          frequency: currentFrequency.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          frequency: [...currentFrequency, day]
        };
      }
    });
  };
  
  // Handle equipment toggle
  const handleEquipmentToggle = (item) => {
    setFormData(prev => {
      const currentEquipment = [...prev.equipment];
      
      if (currentEquipment.includes(item)) {
        return {
          ...prev,
          equipment: currentEquipment.filter(i => i !== item)
        };
      } else {
        return {
          ...prev,
          equipment: [...currentEquipment, item]
        };
      }
    });
  };
  
  // Handle exercise input changes
  const handleExerciseChange = (e) => {
    const { name, value } = e.target;
    setCurrentExercise(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle editing an existing exercise
  const handleEditExercise = (index) => {
    // Load the exercise data into the current exercise form
    setCurrentExercise({...formData.exercises[index]});
    setEditingExerciseIndex(index);
    setIsEditingExercise(true);
    
    // Scroll to the exercise form
    document.getElementById('exercise-form').scrollIntoView({ behavior: 'smooth' });
  };
  
  // Add or update exercise
  const addOrUpdateExercise = () => {
    if (!currentExercise.name.trim()) {
      return;
    }
    
    // Create a processed exercise object based on its type
    let processedExercise;
    
    if (currentExercise.isDurationBased) {
      // For duration-based exercise
      processedExercise = {
        name: currentExercise.name,
        isDurationBased: true,
        duration: parseInt(currentExercise.duration) || 0,
        durationUnit: currentExercise.durationUnit || 'min',
        distance: currentExercise.distance || '',
        restTime: parseInt(currentExercise.restTime) || 60,
        notes: currentExercise.notes || ''
      };
    } else {
      // For traditional strength exercise
      processedExercise = {
        name: currentExercise.name,
        isDurationBased: false,
        sets: parseInt(currentExercise.sets) || 3,
        reps: parseInt(currentExercise.reps) || 10,
        weight: currentExercise.weight || '',
        restTime: parseInt(currentExercise.restTime) || 60,
        notes: currentExercise.notes || ''
      };
    }
    
    setFormData(prev => {
      const updatedExercises = [...prev.exercises];
      
      if (isEditingExercise && editingExerciseIndex !== null) {
        // Update existing exercise
        updatedExercises[editingExerciseIndex] = processedExercise;
      } else {
        // Add new exercise
        updatedExercises.push(processedExercise);
      }
      
      return {
        ...prev,
        exercises: updatedExercises
      };
    });
    
    // Reset the form and editing state
    setCurrentExercise({
      name: '',
      sets: 3,
      reps: 10,
      weight: '',
      restTime: 60,
      notes: '',
      isDurationBased: false,
      duration: 0,
      durationUnit: 'min',
      distance: ''
    });
    setIsEditingExercise(false);
    setEditingExerciseIndex(null);
  };
  
  // Cancel editing an exercise
  const cancelExerciseEdit = () => {
    setCurrentExercise({
      name: '',
      sets: 3,
      reps: 10,
      weight: '',
      restTime: 60,
      notes: ''
    });
    setIsEditingExercise(false);
    setEditingExerciseIndex(null);
  };
  
  // Remove an exercise
  const removeExercise = (index) => {
    setFormData(prev => {
      const updatedExercises = [...prev.exercises];
      updatedExercises.splice(index, 1);
      return {
        ...prev,
        exercises: updatedExercises
      };
    });
    
    // If deleting the exercise that's currently being edited, reset the edit state
    if (editingExerciseIndex === index) {
      setIsEditingExercise(false);
      setEditingExerciseIndex(null);
      setCurrentExercise({
        name: '',
        sets: 3,
        reps: 10,
        weight: '',
        restTime: 60,
        notes: ''
      });
    } else if (editingExerciseIndex !== null && editingExerciseIndex > index) {
      // If deleting an exercise before the one being edited, update the index
      setEditingExerciseIndex(editingExerciseIndex - 1);
    }
  };
  
  // Validate the form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Workout name is required';
    }
    
    if (formData.frequency.length === 0) {
      newErrors.frequency = 'Select at least one day';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add this helper function at the top of your component or outside
  const getDefaultExercisesForType = (type, workoutDuration = 30) => {
    // If the workout duration is very short (< 5 minutes), use seconds as default unit for some types
    const useSeconds = workoutDuration < 5 && ['hiit', 'strength', 'bodyweight'].includes(type);
    const defaultDuration = useSeconds ? workoutDuration * 60 : workoutDuration;
    const defaultUnit = useSeconds ? 'sec' : 'min';
  
    switch(type) {
      case 'running':
        return [{
          name: 'Running Session',
          isDurationBased: true,
          duration: workoutDuration, // Use workout duration
          durationUnit: 'min', // Always use minutes for running
          distance: '', // user will fill in
          intensity: 'medium',
          notes: 'Track your time and distance'
        }];
      case 'walking':
        return [{
          name: 'Walking Session',
          isDurationBased: true,
          duration: workoutDuration,
          durationUnit: 'min', // Always use minutes for walking
          distance: '',
          intensity: 'light',
          notes: 'Track your steps and distance'
        }];
      case 'swimming':
        return [{
          name: 'Swimming Session',
          isDurationBased: true,
          duration: workoutDuration,
          durationUnit: 'min',
          distance: '',
          laps: '',
          intensity: 'medium',
          notes: 'Record distance and laps'
        }];
      case 'cycling':
        return [{
          name: 'Cycling Session',
          isDurationBased: true,
          duration: workoutDuration,
          durationUnit: 'min',
          distance: '',
          intensity: 'medium',
          notes: 'Track your cycling distance and time'
        }];
      case 'yoga':
      case 'pilates':
      case 'flexibility':
        return [{
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Practice`,
          isDurationBased: true,
          duration: workoutDuration,
          durationUnit: 'min',
          intensity: 'medium',
          notes: 'Focus on form and breathing'
        }];
      case 'sports':
      case 'martial_arts':
      case 'boxing':
        return [{
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Session`,
          isDurationBased: true,
          duration: workoutDuration,
          durationUnit: 'min',
          intensity: 'high',
          notes: 'Track your session time and intensity'
        }];
      case 'hiit':
        return [{
          name: 'HIIT Workout',
          isDurationBased: true,
          duration: defaultDuration, // Use seconds for HIIT when duration is short
          durationUnit: defaultUnit,
          intensity: 'high',
          notes: 'High intensity interval training'
        }];
      default:
        return [];
    }
  };
  

  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Clone form data to work with
      const dataToSave = { ...formData };
      
      // Only add default exercises if the exercises array is empty AND this is a workout type that needs default exercises
      if (dataToSave.exercises.length === 0) {
        const needsDefaultExercises = ['running', 'walking', 'swimming', 'cycling', 'yoga', 'pilates',
                                       'flexibility', 'sports', 'martial_arts', 'boxing', 'hiit'].includes(dataToSave.type);
        
        if (needsDefaultExercises) {
          const defaultExercises = getDefaultExercisesForType(dataToSave.type, dataToSave.duration);
          if (defaultExercises.length > 0) {
            dataToSave.exercises = defaultExercises;
          }
        }
      }
      
      // Save with the potentially updated exercises
      if (workout) {
        // Update existing workout
        const updatedWorkout = updateWorkout(workout.id, dataToSave);
        onSave(updatedWorkout);
      } else {
        // Create new workout
        const newWorkout = createWorkout(dataToSave);
        onSave(newWorkout);
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to save workout'
      }));
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
          {workout ? 'Edit Workout' : 'Create Workout'}
        </h2>
      </div>

      <div className="space-y-6">
        {/* Basic Info Section - Enhanced with icons and better styling */}
        {/* Basic Info Section */}
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
    {/* Section Header */}
    <button
      onClick={() => setActiveInfoSection(activeInfoSection === 'basic' ? '' : 'basic')}
      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Activity size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-medium text-slate-800 dark:text-slate-100">Basic Information</h3>
      </div>
      {activeInfoSection === 'basic' ? 
        <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> : 
        <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />
      }
    </button>
    
    {/* Section Content - Modified to have better mobile layout */}
    {activeInfoSection === 'basic' && (
      <div className="p-4">
        <div className="grid grid-cols-1 gap-6">
          {/* Workout Name */}
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Dumbbell size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Workout Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                placeholder="e.g., Full Body Strength"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>
              )}
            </div>
          </div>
          
          {/* Workout Type and Duration - Side by side on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Activity size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="type" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Workout Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                >
                  {getWorkoutTypes().map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <label htmlFor="duration" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="5"
                  max="180"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <MapPin size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <label htmlFor="location" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                {getWorkoutLocations().map(location => (
                  <option key={location.value} value={location.value}>{location.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Type-specific fields now rendered HERE - within the Basic Information section */}
          {getTypeSpecificFields()}
          
          {/* Notes */}
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <label htmlFor="notes" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-20"
                placeholder="Any additional notes about this workout..."
              />
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
        
        {/* Schedule Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => setActiveInfoSection(activeInfoSection === 'schedule' ? '' : 'schedule')}
            className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Calendar size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-slate-800 dark:text-slate-100">Schedule</h3>
            </div>
            {activeInfoSection === 'schedule' ? 
              <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> : 
              <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />
            }
          </button>
          
          {/* Section Content */}
          {activeInfoSection === 'schedule' && (
            <div className="p-4">
              <div className="space-y-6">
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Days of Week
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                      const isActive = formData.frequency.includes(day);
                      const dayName = day.charAt(0).toUpperCase() + day.slice(1, 3);
                      
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleFrequencyToggle(day)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            isActive
                              ? 'bg-blue-500 dark:bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {dayName}
                        </button>
                      );
                    })}
                  </div>
                  {errors.frequency && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">{errors.frequency}</p>
                  )}
                  
                  {/* Quick presets */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, frequency: ['mon', 'tue', 'wed', 'thu', 'fri']}))}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Weekdays
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, frequency: ['sat', 'sun']}))}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Weekends
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, frequency: ['mon', 'wed', 'fri']}))}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      M/W/F
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, frequency: ['tue', 'thu', 'sat']}))}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      T/Th/S
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({...prev, frequency: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']}))}
                      className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      Every Day
                    </button>
                  </div>
                </div>
                
                {/* Time of Day */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Time of Day
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'morning', label: 'Morning', icon: <Sun size={16} /> },
                      { value: 'afternoon', label: 'Afternoon', icon: <Sun size={16} /> },
                      { value: 'evening', label: 'Evening', icon: <Moon size={16} /> },
                      { value: 'anytime', label: 'Anytime', icon: <Clock size={16} /> }
                    ].map(time => (
                      <button
                        key={time.value}
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, timeOfDay: time.value}))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                          formData.timeOfDay === time.value
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {time.icon}
                        <span className="text-sm">{time.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Equipment Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {/* Section Header */}
          <button
            onClick={() => setActiveInfoSection(activeInfoSection === 'equipment' ? '' : 'equipment')}
            className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Dumbbell size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-medium text-slate-800 dark:text-slate-100">Equipment</h3>
            </div>
            {activeInfoSection === 'equipment' ? 
              <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> : 
              <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />
            }
          </button>
          
          {/* Section Content */}
          {activeInfoSection === 'equipment' && (
            <div className="p-4">
              <div className="mb-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Select the equipment needed for this workout:
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {getEquipmentOptions()
                    .slice(0, showAllEquipment ? getEquipmentOptions().length : 12)
                    .map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleEquipmentToggle(option.value)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                          formData.equipment.includes(option.value)
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent'
                        }`}
                      >
                        {formData.equipment.includes(option.value) && (
                          <Check size={12} className="inline-block mr-1" />
                        )}
                        {option.label}
                      </button>
                    ))}
                  
                  {!showAllEquipment && (
                    <button
                      type="button"
                      onClick={() => setShowAllEquipment(true)}
                      className="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
                    >
                      Show More...
                    </button>
                  )}
                  
                  {showAllEquipment && (
                    <button
                      type="button"
                      onClick={() => setShowAllEquipment(false)}
                      className="px-3 py-1.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent"
                    >
                      Show Less
                    </button>
                  )}
                </div>
              </div>
              
              {/* Selected Equipment List */}
              {formData.equipment.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Selected Equipment:</h4>
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    {formData.equipment.map(item => {
                      const option = getEquipmentOptions().find(opt => opt.value === item);
                      return (
                        <div
                          key={item}
                          className="flex items-center bg-white dark:bg-slate-800 px-2 py-1 rounded-full text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          <span>{option ? option.label : item}</span>
                          <button
                            type="button"
                            onClick={() => handleEquipmentToggle(item)}
                            className="ml-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Clear all button */}
              {formData.equipment.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, equipment: []}))}
                  className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <RotateCcw size={12} />
                  <span>Clear all</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Exercises Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
  {/* Section Header */}
  <button
    onClick={() => setActiveInfoSection(activeInfoSection === 'exercises' ? '' : 'exercises')}
    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
  >
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <Activity size={16} className="text-red-600 dark:text-red-400" />
      </div>
      <h3 className="font-medium text-slate-800 dark:text-slate-100">Exercises</h3>
    </div>
    {activeInfoSection === 'exercises' ? 
      <ChevronUp size={20} className="text-slate-500 dark:text-slate-400" /> : 
      <ChevronDown size={20} className="text-slate-500 dark:text-slate-400" />
    }
  </button>
  
  {/* Section Content */}
  {activeInfoSection === 'exercises' && (
    <div className="p-4">
      {/* Exercise Form */}
<div id="exercise-form" className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700">
  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
    {isEditingExercise ? 'Edit Exercise' : 'Add Exercise'}
  </h4>
  
  {/* Exercise Type Toggle */}
  <div className="mb-4">
    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
      Exercise Type
    </label>
    <div className="flex items-center">
      <label className="inline-flex items-center mr-4">
        <input
          type="radio"
          checked={!currentExercise.isDurationBased}
          onChange={() => setCurrentExercise(prev => ({...prev, isDurationBased: false}))}
          className="h-4 w-4 text-blue-600 dark:text-blue-500"
        />
        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Reps & Sets</span>
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          checked={currentExercise.isDurationBased}
          onChange={() => setCurrentExercise(prev => ({...prev, isDurationBased: true}))}
          className="h-4 w-4 text-blue-600 dark:text-blue-500"
        />
        <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Duration Based</span>
      </label>
    </div>
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
    <div>
      <label htmlFor="exercise-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        Exercise Name*
      </label>
      <input
        type="text"
        id="exercise-name"
        name="name"
        value={currentExercise.name}
        onChange={handleExerciseChange}
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
        placeholder={currentExercise.isDurationBased ? "e.g., Plank, Wall-sit" : "e.g., Barbell Squat"}
      />
    </div>
    
    {currentExercise.isDurationBased ? (
      // Duration-based exercise fields
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="exercise-duration" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Duration
          </label>
          <div className="flex">
            <input
              type="number"
              id="exercise-duration"
              name="duration"
              value={currentExercise.duration}
              onChange={handleExerciseChange}
              min="1"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
            />
            <select
              name="durationUnit"
              value={currentExercise.durationUnit}
              onChange={handleExerciseChange}
              className="p-2 border border-slate-300 dark:border-slate-600 border-l-0 rounded-r-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
            >
              <option value="sec">sec</option>
              <option value="min">min</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="exercise-distance" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Distance (opt)
          </label>
          <input
            type="text"
            id="exercise-distance"
            name="distance"
            value={currentExercise.distance}
            onChange={handleExerciseChange}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
            placeholder="e.g., 100m"
          />
        </div>
      </div>
    ) : (
      // Traditional strength exercise fields
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="exercise-sets" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Sets
          </label>
          <input
            type="number"
            id="exercise-sets"
            name="sets"
            value={currentExercise.sets}
            onChange={handleExerciseChange}
            min="1"
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
          />
        </div>
        <div>
          <label htmlFor="exercise-reps" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Reps
          </label>
          <input
            type="number"
            id="exercise-reps"
            name="reps"
            value={currentExercise.reps}
            onChange={handleExerciseChange}
            min="1"
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
          />
        </div>
      </div>
    )}
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
    {/* Show weight only for strength exercises */}
    {!currentExercise.isDurationBased && (
      <div>
        <label htmlFor="exercise-weight" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Weight (optional)
        </label>
        <div className="relative">
          <input
            type="text"
            id="exercise-weight"
            name="weight"
            value={currentExercise.weight}
            onChange={handleExerciseChange}
            className="w-full p-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
            placeholder="Weight"
          />
           <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500 dark:text-slate-400 text-sm">
              {weightUnit}
          </div>
        </div>
      </div>
    )}
  
    <div>
      <label htmlFor="exercise-rest" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
        Rest Time (seconds)
      </label>
      <input
        type="number"
        id="exercise-rest"
        name="restTime"
        value={currentExercise.restTime}
        onChange={handleExerciseChange}
        min="0"
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
      />
    </div>
  </div>
  
  <div className="mb-3">
    <label htmlFor="exercise-notes" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
      Notes (optional)
    </label>
    <input
      type="text"
      id="exercise-notes"
      name="notes"
      value={currentExercise.notes}
      onChange={handleExerciseChange}
      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
      placeholder="e.g., Focus on form, slow tempo"
    />
  </div>
  
  <div className="flex gap-2">
    <button
      type="button"
      onClick={addOrUpdateExercise}
      disabled={!currentExercise.name.trim()}
      className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
        !currentExercise.name.trim()
          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
          : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
      }`}
    >
      {isEditingExercise ? (
        <>
          <Edit size={16} />
          Update Exercise
        </>
      ) : (
        <>
          <Plus size={16} />
          Add Exercise
        </>
      )}
    </button>
    
    {isEditingExercise && (
      <button
        type="button"
        onClick={cancelExerciseEdit}
        className="py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        Cancel
      </button>
    )}
  </div>
</div>

      
      {/* Exercise List */}
      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
        Exercises ({formData.exercises.length})
      </h4>
      
      {formData.exercises.length > 0 ? (
        <div className="space-y-2">
          {formData.exercises.map((exercise, index) => (
            <div
              key={index}
              className={`flex items-start p-3 rounded-lg border transition-colors
                ${editingExerciseIndex === index
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700'
                }`}
            >
              {/* Number badge */}
              <div className="w-8 h-8 mr-3 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 dark:text-blue-300 font-medium">{index + 1}</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0"> 
                {/* Exercise name with text wrapping */}
                <div className="font-medium text-slate-700 dark:text-slate-200 text-sm break-words">
                  {exercise.name}
                </div>
                
                {/* Exercise details - Updated to handle both exercise types */}
<div className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
  {exercise.isDurationBased ? (
    // Duration-based exercise details
    <>
      {exercise.duration} {exercise.durationUnit || 'min'}
      {exercise.distance ? ` • ${exercise.distance} distance` : ''}
      {exercise.intensity ? ` • ${exercise.intensity} intensity` : ''}
      {exercise.restTime ? ` • ${exercise.restTime}s rest` : ''}
    </>
  ) : (
    // Traditional strength exercise details
    <>
      {exercise.sets}×{exercise.reps}
      {exercise.weight ? ` • ${exercise.weight} ${weightUnit}` : ''}
      {exercise.restTime ? ` • ${exercise.restTime}s rest` : ''}
    </>
  )}
</div>
                
                {/* Notes - with text wrapping, limited to 3 lines */}
                {exercise.notes && (
                  <div className="text-xs italic text-slate-500 dark:text-slate-400 mt-1 break-words line-clamp-3">
                    {exercise.notes}
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-1 ml-2">
                <button
                  type="button"
                  onClick={() => handleEditExercise(index)}
                  className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full flex-shrink-0"
                  title="Edit exercise"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full flex-shrink-0"
                  title="Delete exercise"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          No exercises added yet. Add your first exercise above.
        </div>
      )}
    </div>
  )}
</div>
        
        {/* Form Actions */}
        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            {errors.submit}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="order-2 sm:order-1 py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="order-1 sm:order-2 py-2 px-4 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {workout ? 'Update Workout' : 'Save Workout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutForm;