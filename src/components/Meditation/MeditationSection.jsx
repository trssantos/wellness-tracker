import React, { useState, useEffect, useRef } from 'react';
import { Brain, Wind, Music, Leaf, Clock, Moon, Sun, CloudRain, 
         Waves, Coffee, Radio, Sparkles, Heart, PieChart, 
         BookOpen, Timer, Bell, PlayCircle, User, 
         Lightbulb, Zap, FilePlus, VolumeX, Volume2, ArrowRight, X } from 'lucide-react';
import { getMeditationStorage, saveMeditationStorage } from '../../utils/meditationStorage';
import BreathingExercise from './BreathingExercise';
import MeditationAnalytics from './MeditationAnalytics';
import GuidedMeditation from './GuidedMeditation';
import AmbientSounds from './AmbientSounds';
import GroundingExercises from './GroundingExercises';
import MeditationJournal from './JournalHub';
import MeditationTips from './MeditationTips';
import SleepSounds from './SleepSounds';
import VoiceSettingsModal from './VoiceSettingsModal';

const MeditationSection = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [meditationData, setMeditationData] = useState({
    sessions: [],
    favorites: [],
    journalEntries: [],
    recentlyUsed: []
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
  // Load meditation data from storage
  useEffect(() => {
    const data = getMeditationStorage();
    if (data) {
      setMeditationData(data);
    }
  }, []);
  
  // Save session data
  const saveSession = (sessionData) => {
    const newSessions = [
      ...meditationData.sessions,
      {
        ...sessionData,
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    ];
    
    // Update recently used
    let newRecentlyUsed = [sessionData.exerciseId, ...meditationData.recentlyUsed];
    newRecentlyUsed = [...new Set(newRecentlyUsed)].slice(0, 5); // Remove duplicates and limit to 5
    
    const updatedData = {
      ...meditationData,
      sessions: newSessions,
      recentlyUsed: newRecentlyUsed
    };
    
    setMeditationData(updatedData);
    saveMeditationStorage(updatedData);
    return true;
  };
  
  // Toggle favorite status of an exercise
  const toggleFavorite = (exerciseId) => {
    let updatedFavorites = [...meditationData.favorites];
    
    if (updatedFavorites.includes(exerciseId)) {
      updatedFavorites = updatedFavorites.filter(id => id !== exerciseId);
    } else {
      updatedFavorites.push(exerciseId);
    }
    
    const updatedData = {
      ...meditationData,
      favorites: updatedFavorites
    };
    
    setMeditationData(updatedData);
    saveMeditationStorage(updatedData);
  };
  
  // Save journal entry
  const saveJournalEntry = (entry) => {
    const newEntries = [
      ...meditationData.journalEntries,
      {
        ...entry,
        id: `journal-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    ];
    
    const updatedData = {
      ...meditationData,
      journalEntries: newEntries
    };
    
    setMeditationData(updatedData);
    saveMeditationStorage(updatedData);
  };
  
  // Handle selecting an exercise
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };
  
  // Handle closing the exercise modal
  const handleCloseExercise = () => {
    setSelectedExercise(null);
  };
  
  // Toggle voice settings modal
  const toggleVoiceSettings = () => {
    setShowVoiceSettings(!showVoiceSettings);
  };

  // Main category data for the grid
  const categories = [
    {
      id: 'breathing',
      title: 'Breathing Exercises',
      icon: <Wind className="text-blue-500 dark:text-blue-400" size={24} />,
      color: 'bg-blue-50 dark:bg-blue-900/30',
      exercises: [
        { id: 'box-breathing', name: 'Box Breathing', icon: <Square size={24} />, duration: 5 },
        { id: '4-7-8-breathing', name: '4-7-8 Technique', icon: <Timer size={24} />, duration: 5 },
        { id: 'deep-breathing', name: 'Deep Breathing', icon: <Wind size={24} />, duration: 5 },
        { id: 'alternate-nostril', name: 'Alternate Nostril', icon: <User size={24} />, duration: 8 }
      ]
    },
    {
      id: 'guided',
      title: 'Guided Meditation',
      icon: <Brain className="text-purple-500 dark:text-purple-400" size={24} />,
      color: 'bg-purple-50 dark:bg-purple-900/30',
      exercises: [
        { id: 'body-scan', name: 'Body Scan', icon: <User size={24} />, duration: 10 },
        { id: 'loving-kindness', name: 'Loving Kindness', icon: <Heart size={24} />, duration: 12 },
        { id: 'mindfulness', name: 'Mindfulness', icon: <Zap size={24} />, duration: 15 },
        { id: 'gratitude', name: 'Gratitude', icon: <Sparkles size={24} />, duration: 10 }
      ]
    },
    {
      id: 'grounding',
      title: 'Grounding Techniques',
      icon: <Leaf className="text-green-500 dark:text-green-400" size={24} />,
      color: 'bg-green-50 dark:bg-green-900/30',
      exercises: [
        { id: '5-4-3-2-1', name: '5-4-3-2-1 Senses', icon: <Eye size={24} />, duration: 5 },
        { id: '3-3-3', name: '3-3-3 Method', icon: <Zap size={24} />, duration: 3 },
        { id: 'progressive-relaxation', name: 'Progressive Relaxation', icon: <User size={24} />, duration: 10 },
        { id: 'object-focus', name: 'Object Focus', icon: <Target size={24} />, duration: 5 }
      ]
    },
    {
      id: 'ambient',
      title: 'Ambient Sounds',
      icon: <Music className="text-amber-500 dark:text-amber-400" size={24} />,
      color: 'bg-amber-50 dark:bg-amber-900/30',
      exercises: [
        { id: 'rain', name: 'Rainfall', icon: <CloudRain size={24} />, duration: 30 },
        { id: 'waves', name: 'Ocean Waves', icon: <Waves size={24} />, duration: 30 },
        { id: 'white-noise', name: 'White Noise', icon: <Radio size={24} />, duration: 30 },
        { id: 'cafe', name: 'Café Ambience', icon: <Coffee size={24} />, duration: 30 }
      ]
    },
    {
      id: 'sleep',
      title: 'Sleep Sounds',
      icon: <Moon className="text-indigo-500 dark:text-indigo-400" size={24} />,
      color: 'bg-indigo-50 dark:bg-indigo-900/30',
      exercises: [
        { id: 'sleep-story', name: 'Sleep Story', icon: <BookOpen size={24} />, duration: 20 },
        { id: 'delta-waves', name: 'Delta Waves', icon: <Radio size={24} />, duration: 60 },
        { id: 'brown-noise', name: 'Brown Noise', icon: <Volume2 size={24} />, duration: 60 },
        { id: 'night-sounds', name: 'Night Sounds', icon: <Moon size={24} />, duration: 60 }
      ]
    },
    {
      id: 'quick',
      title: 'Quick Calm',
      icon: <Zap className="text-rose-500 dark:text-rose-400" size={24} />,
      color: 'bg-rose-50 dark:bg-rose-900/30',
      exercises: [
        { id: 'one-minute', name: '1-Minute Reset', icon: <Timer size={24} />, duration: 1 },
        { id: 'quick-breath', name: 'Quick Breath', icon: <Wind size={24} />, duration: 2 },
        { id: 'tension-release', name: 'Tension Release', icon: <Sparkles size={24} />, duration: 3 },
        { id: 'visualize', name: 'Quick Visualization', icon: <Sun size={24} />, duration: 2 }
      ]
    }
  ];
  
  // Function to render Square icon for box breathing
  function Square(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    );
  }
  
  // Function to render Eye icon for 5-4-3-2-1 technique
  function Eye(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  
  // Function to render Target icon for object focus
  function Target(props) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    );
  }

  // Recently used exercises
  const recentlyUsedExercises = meditationData.recentlyUsed.map(typeId => {
    // Find the exercise data
    for (const category of categories) {
      const exercise = category.exercises.find(ex => ex.id === typeId);
      if (exercise) {
        return {
          ...exercise,
          category: category.id,
          categoryColor: category.color,
          categoryIcon: category.icon
        };
      }
    }
    return null;
  }).filter(Boolean);
  
  // Favorite exercises
  const favoriteExercises = meditationData.favorites.map(typeId => {
    // Find the exercise data
    for (const category of categories) {
      const exercise = category.exercises.find(ex => ex.id === typeId);
      if (exercise) {
        return {
          ...exercise,
          category: category.id,
          categoryColor: category.color,
          categoryIcon: category.icon
        };
      }
    }
    return null;
  }).filter(Boolean);

  // Get appropriate glow colors for the background effect
  const getCategoryGlowColor = (categoryId) => {
    switch(categoryId) {
      case 'breathing':
        return 'rgba(59, 130, 246, 0.15)'; // blue
      case 'guided':
        return 'rgba(139, 92, 246, 0.15)'; // purple  
      case 'grounding':
        return 'rgba(16, 185, 129, 0.15)'; // green
      case 'ambient':
        return 'rgba(245, 158, 11, 0.15)'; // amber
      case 'sleep':
        return 'rgba(99, 102, 241, 0.15)'; // indigo
      case 'quick':
        return 'rgba(244, 63, 94, 0.15)'; // rose
      default:
        return 'rgba(99, 102, 241, 0.15)'; // indigo default
    }
  };
  
  // Get appropriate hover glow colors for categories
  const getHoverGlowColor = (categoryId) => {
    switch(categoryId) {
      case 'breathing':
        return 'rgba(59, 130, 246, 0.5)'; // blue
      case 'guided':
        return 'rgba(139, 92, 246, 0.5)'; // purple  
      case 'grounding':
        return 'rgba(16, 185, 129, 0.5)'; // green
      case 'ambient':
        return 'rgba(245, 158, 11, 0.5)'; // amber
      case 'sleep':
        return 'rgba(99, 102, 241, 0.5)'; // indigo
      case 'quick':
        return 'rgba(244, 63, 94, 0.5)'; // rose
      default:
        return 'rgba(99, 102, 241, 0.5)'; // indigo default
    }
  };

  // Function to render a category card
  const renderCategoryCard = (category) => (
      <div 
        key={category.id}
        className={`${category.color} rounded-xl p-3 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02] cursor-pointer group relative category-card w-full`}
        onClick={() => {
          // Check if there's a selectedExercise specified, otherwise use the first exercise
          // This ensures we're selecting a specific exercise, not just a category
          const selectedExercise = category.exercises && category.exercises.length > 0 
            ? category.exercises[0] 
            : null;
            
          console.log('Selected from category:', selectedExercise?.id || 'none available');
          
          handleSelectExercise({ 
            type: 'exercise', 
            data: selectedExercise, 
            categoryData: category 
          });
        }}
      >
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-2">
          <div className="transition-transform duration-300 transform group-hover:scale-110 group-hover:rotate-3 category-icon-animation flex-shrink-0">
            {category.icon}
          </div>
          <h3 className="text-sm xs:text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 ml-2 truncate">
            {category.title}
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-1 mt-2">
  {category.exercises.slice(0, 4).map(exercise => (
    <div 
      key={exercise.id} 
      className="bg-white dark:bg-slate-700 bg-opacity-60 dark:bg-opacity-30 rounded-lg p-1 text-center flex flex-col items-center cursor-pointer"
      onClick={(e) => {
        // Stop propagation to prevent the category click handler from firing
        e.stopPropagation();
        
        // Select this specific exercise
        console.log('Selecting specific exercise from grid:', exercise.id);
        handleSelectExercise({ 
          type: 'exercise', 
          data: exercise, 
          categoryData: category 
        });
      }}
    >
      <div className="text-slate-700 dark:text-slate-300">
        {exercise.icon}
      </div>
      <p className="text-xs mt-1 text-slate-700 dark:text-slate-300 truncate w-full">{exercise.name}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.duration}m</p>
    </div>
  ))}
</div>
      </div>
      
      {/* Add a subtle border glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none glow-effect"
        style={{ 
          boxShadow: `0 0 15px 2px ${getHoverGlowColor(category.id)}`, 
          zIndex: -1 
        }} 
      />
    </div>
  );

  // Function to render the Recent & Favorites section
  const renderRecentAndFavorites = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Clock className="text-blue-500 dark:text-blue-400" size={20} />
          <span>Recently Used</span>
        </h3>
        
        {meditationData.sessions.length > 0 && (
          <button 
            onClick={() => setActiveTab('analytics')}
            className="text-xs text-blue-600 dark:text-blue-400 flex items-center"
          >
            <span>View Analytics</span> <ArrowRight size={16} className="ml-1" />
          </button>
        )}
      </div>
      
      {recentlyUsedExercises.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          {recentlyUsedExercises.map(exercise => (
            <div 
              key={exercise.id}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer relative overflow-hidden group"
              onClick={() => handleSelectExercise({ 
                type: 'exercise', 
                data: exercise, 
                categoryData: categories.find(c => c.id === exercise.category)
              })}
            >
              <div className={`w-8 h-8 mx-auto mb-1 rounded-full text-slate-800 dark:text-slate-100 flex items-center justify-center`}>
                {exercise.icon}
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-full">{exercise.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.duration}m</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Your recently used exercises will appear here.
        </p>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Heart className="text-rose-500 dark:text-rose-400" size={20} />
          <span>Favorites</span>
        </h3>
      </div>
      
      {favoriteExercises.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {favoriteExercises.map(exercise => (
            <div 
              key={exercise.id}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2 text-center shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer relative overflow-hidden group"
              onClick={() => handleSelectExercise({ 
                type: 'exercise', 
                data: exercise, 
                categoryData: categories.find(c => c.id === exercise.category)
              })}
            >
              <div className={`w-8 h-8 mx-auto mb-1 rounded-full ${exercise.categoryColor} flex items-center justify-center`}>
                {exercise.icon}
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-full">{exercise.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{exercise.duration}m</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Add exercises to your favorites to quickly access them here.
        </p>
      )}
    </div>
  );

  // Function to render the daily tip section
  const renderDailyTip = () => {
    // Hard-coded tips - in a full implementation you'd rotate these or use a service
    const tips = [
      {
        title: "Mindful Moments",
        content: "Try to take a few mindful breaths before reaching for your phone in the morning."
      },
      {
        title: "Stress Relief",
        content: "When feeling stressed, place one hand on your heart and one on your stomach, then take 5 deep breaths."
      },
      {
        title: "Focus Enhancement",
        content: "Before starting work, take 1-2 minutes to focus on your breath to improve concentration."
      },
      {
        title: "Sleep Better",
        content: "Practice the 4-7-8 breathing technique (inhale for 4, hold for 7, exhale for 8) before bed for better sleep."
      }
    ];
    
    // Get a random tip or one based on the date
    const today = new Date().getDate();
    const tip = tips[today % tips.length];
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-2 xs:p-3 sm:p-4 mb-4 xs:mb-6 transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1 w-full max-w-full overflow-hidden">
        <div className="flex items-start">
          <div className="bg-white dark:bg-slate-800 rounded-full p-2 mr-2 xs:mr-3 transform transition-all duration-500 hover:rotate-12 flex-shrink-0">
            <Lightbulb className="text-amber-500 dark:text-amber-400" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm xs:text-base font-medium text-slate-800 dark:text-slate-100 mb-1 truncate">
              Daily Tip: {tip.title}
            </h3>
            <p className="text-xs xs:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{tip.content}</p>
            
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleSelectExercise({ type: 'tips' })}
                className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
              >
                View all tips <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden meditation-container">
      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-2 transition-colors">
        <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 -mx-4 px-4">
          <button
            className={`pb-3 px-2 relative transition-colors ${activeTab === 'practice' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
            onClick={() => setActiveTab('practice')}
          >
            <div className="flex items-center justify-center">
              <Brain size={20} />
              <span className="ml-2 font-medium hidden sm:inline">Practice</span>
            </div>
            {activeTab === 'practice' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            className={`pb-3 px-2 relative transition-colors ${activeTab === 'analytics' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
            onClick={() => setActiveTab('analytics')}
          >
            <div className="flex items-center justify-center">
              <PieChart size={20} />
              <span className="ml-2 font-medium hidden sm:inline">Analytics</span>
            </div>
            {activeTab === 'analytics' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            className={`pb-3 px-2 relative transition-colors ${activeTab === 'journal' 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
            onClick={() => setActiveTab('journal')}
          >
            <div className="flex items-center justify-center">
              <BookOpen size={20} />
              <span className="ml-2 font-medium hidden sm:inline">Journal</span>
            </div>
            {activeTab === 'journal' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></div>
            )}
          </button>
          <button
            className={`pb-3 px-2 relative transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100`}
            onClick={toggleVoiceSettings}
          >
            <div className="flex items-center justify-center">
              <Volume2 size={20} />
              <span className="ml-2 font-medium hidden sm:inline">Voice Settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Practice Tab */}
      {activeTab === 'practice' && (
        <>
          {/* Render Daily Tip */}
          {renderDailyTip()}
          
          {/* Recent & Favorites */}
          {renderRecentAndFavorites()}
          
          {/* Main Categories Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
            {categories.map(renderCategoryCard)}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <MeditationAnalytics 
          sessions={meditationData.sessions}
          categories={categories}
        />
      )}

      {/* Journal Tab */}
      {activeTab === 'journal' && (
        <MeditationJournal
          journalEntries={meditationData.journalEntries}
          onSaveEntry={saveJournalEntry}
        />
      )}

      {/* Exercise Modal */}
      {selectedExercise && (() => {
        if (selectedExercise.type === 'category') {
          switch (selectedExercise.data.id) {
            case 'breathing':
              return (
                <BreathingExercise
                  category={selectedExercise.data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'guided':
              return (
                <GuidedMeditation
                  category={selectedExercise.data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'grounding':
              return (
                <GroundingExercises
                  category={selectedExercise.data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'ambient':
              return (
                <AmbientSounds
                  category={selectedExercise.data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'sleep':
              return (
                <SleepSounds
                  category={selectedExercise.data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'quick':
              return (
                <BreathingExercise // Reuse the breathing component for quick exercises
                  category={selectedExercise.data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                  isQuick={true}
                />
              );
            default:
              return null;
          }
        } else if (selectedExercise.type === 'exercise') {
          // Individual exercise
          const { data, categoryData } = selectedExercise;
          
          switch (categoryData.id) {
            case 'breathing':
              return (
                <BreathingExercise
                  category={categoryData}
                  selectedExercise={data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'guided':
              return (
                <GuidedMeditation
                  category={categoryData}
                  selectedExercise={data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'grounding':
              return (
                <GroundingExercises
                  category={categoryData}
                  selectedExercise={data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'ambient':
              return (
                <AmbientSounds
                  category={categoryData}
                  selectedExercise={data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'sleep':
              return (
                <SleepSounds
                  category={categoryData}
                  selectedExercise={data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                />
              );
            case 'quick':
              return (
                <BreathingExercise
                  category={categoryData}
                  selectedExercise={data}
                  onClose={handleCloseExercise}
                  onComplete={saveSession}
                  onToggleFavorite={toggleFavorite}
                  favorites={meditationData.favorites}
                  isQuick={true}
                />
              );
            default:
              return null;
          }
        } else if (selectedExercise.type === 'tips') {
          return (
            <MeditationTips 
              onClose={handleCloseExercise}
            />
          );
        }
        return null;
      })()}
    
      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <VoiceSettingsModal 
          onClose={() => setShowVoiceSettings(false)} 
        />
      )}
    
      {/* Add animation styles */}
      <style jsx>{`
        .category-icon-animation {
          animation: rotate-icon 6s ease-in-out infinite;
        }
        
        .exercise-card-animation {
          animation: gentle-float 4s ease-in-out infinite;
        }
        
        .glow-effect {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        
        @keyframes gentle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.8;
            transform: scale(1);
          }
        }
        
        @keyframes rotate-icon {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(3deg);
          }
          75% {
            transform: rotate(-3deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
      
      <style jsx global>{`
        body {
          overflow-x: hidden;
        }
        
        .meditation-container {
          max-width: 100%;
          overflow-x: hidden;
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        .category-card {
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MeditationSection;