import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Heart, Star, Zap, Brain, Info, 
  MessageCircle, BellRing, BarChart2, Activity, Edit, Check, ArrowRight,
  X, Plus, Server, Cpu
} from 'lucide-react';
import { getStorage, setStorage } from '../../utils/storage';
import { saveUserPreferences, saveUserPersonalInfo, getUserPersonalInfo } from '../../utils/dayCoachUtils';

const DayCoachProfile = ({ userData, onPreferencesUpdated }) => {
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    qualities: [],
    interests: [],
    challenges: [],
    goals: [],
    communicationStyle: 'balanced'
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    proactiveMessages: true,
    dataAnalysis: true,
    useTwoPassAI: true // Added two-pass AI option
  });
  
  // Editing states
  const [isEditingQualities, setIsEditingQualities] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [isEditingChallenges, setIsEditingChallenges] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  
  // Form input states
  const [qualitiesInput, setQualitiesInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [challengesInput, setChallengesInput] = useState('');
  const [goalsInput, setGoalsInput] = useState('');
  
  // Load user data when component mounts or when userData changes
  useEffect(() => {
    if (userData) {
      // Load preferences from userData
      if (userData.preferences) {
        setPreferences(userData.preferences);
      }
      
      // Load personal info from userData
      if (userData.personalInfo) {
        setPersonalInfo(userData.personalInfo);
      } else {
        // If no personal info in userData, try to get it from storage directly
        const personalInfo = getUserPersonalInfo();
        setPersonalInfo(personalInfo);
      }
    } else {
      // Try to get userData directly from storage if not provided as prop
      const storage = getStorage();
      if (storage.dayCoach && storage.dayCoach.userData) {
        if (storage.dayCoach.userData.preferences) {
          setPreferences(storage.dayCoach.userData.preferences);
        }
        if (storage.dayCoach.userData.personalInfo) {
          setPersonalInfo(storage.dayCoach.userData.personalInfo);
        }
      }
    }
  }, [userData]);
  
  // Handle preference toggle
  const handleTogglePreference = (key) => {
    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    // Update local state
    setPreferences(updatedPreferences);
    
    // Save to storage
    if (saveUserPreferences(updatedPreferences)) {
      console.log(`Preference ${key} updated to ${updatedPreferences[key]}`);
      
      // Notify parent component if callback provided
      if (onPreferencesUpdated) {
        onPreferencesUpdated(updatedPreferences);
      }
    }
  };
  
  // Handle communication style change
  const handleCommunicationStyleChange = (style) => {
    const updatedInfo = {
      ...personalInfo,
      communicationStyle: style
    };
    
    // Update local state
    setPersonalInfo(updatedInfo);
    
    // Save to storage
    saveUserPersonalInfo(updatedInfo);
  };
  
  // Add tag to a list
  const addTag = (listName, newTag) => {
    if (!newTag.trim()) return;
    
    const updatedInfo = { ...personalInfo };
    
    // Add the tag if it doesn't already exist
    if (!updatedInfo[listName].includes(newTag.trim())) {
      updatedInfo[listName] = [...updatedInfo[listName], newTag.trim()];
      
      // Update local state
      setPersonalInfo(updatedInfo);
      
      // Save to storage
      saveUserPersonalInfo(updatedInfo);
    }
    
    // Clear input based on which list we're updating
    if (listName === 'qualities') setQualitiesInput('');
    else if (listName === 'interests') setInterestsInput('');
    else if (listName === 'challenges') setChallengesInput('');
    else if (listName === 'goals') setGoalsInput('');
  };
  
  // Remove tag from a list
  const removeTag = (listName, tagToRemove) => {
    const updatedInfo = { ...personalInfo };
    updatedInfo[listName] = updatedInfo[listName].filter(tag => tag !== tagToRemove);
    
    // Update local state
    setPersonalInfo(updatedInfo);
    
    // Save to storage
    saveUserPersonalInfo(updatedInfo);
  };
  
  // Handle saving personal info items
  const handleSaveQualities = () => {
    addTag('qualities', qualitiesInput);
    // Don't exit edit mode
  };
  
  const handleSaveInterests = () => {
    addTag('interests', interestsInput);
    // Don't exit edit mode
  };
  
  const handleSaveChallenges = () => {
    addTag('challenges', challengesInput);
    // Don't exit edit mode
  };
  
  const handleSaveGoals = () => {
    addTag('goals', goalsInput);
    // Don't exit edit mode
  };
  
  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* About Section */}
      <div className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <MessageCircle size={18} className="text-indigo-500 dark:text-indigo-400" />
          About Solaris
        </h3>
        
        <div className="text-slate-600 dark:text-slate-300 space-y-4">
          <p>
            Solaris is your personal wellness coach, designed to help you build better habits, track your progress, 
            and provide insights based on your data. Think of Solaris as a supportive friend who's always ready to listen 
            and offer gentle guidance.
          </p>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-500 dark:border-indigo-400">
            <h4 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm mb-2">What Solaris can do:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
              <li>Analyze your moods, tasks, habits, and other data to provide personalized insights</li>
              <li>Suggest adjustments to your habits and routines based on your patterns</li>
              <li>Offer encouragement and accountability for your goals</li>
              <li>Respond to questions about your progress and wellbeing</li>
              <li>Help you reflect on your journey and celebrate your wins</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <Settings size={18} className="text-indigo-500 dark:text-indigo-400" />
          Coach Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <BellRing size={20} className="text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Notifications</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Show alerts for new coach messages</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleTogglePreference('notifications')}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.notifications 
                  ? 'bg-blue-500' 
                  : 'bg-slate-300 dark:bg-slate-600'
              } relative`}
            >
              <span 
                className={`absolute top-1 transition-transform ${
                  preferences.notifications 
                    ? 'right-1 bg-white' 
                    : 'left-1 bg-slate-100 dark:bg-slate-400'
                } w-4 h-4 rounded-full`}
              ></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <MessageCircle size={20} className="text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Proactive Messages</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Allow Solaris to send messages based on your data</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleTogglePreference('proactiveMessages')}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.proactiveMessages 
                  ? 'bg-purple-500' 
                  : 'bg-slate-300 dark:bg-slate-600'
              } relative`}
            >
              <span 
                className={`absolute top-1 transition-transform ${
                  preferences.proactiveMessages 
                    ? 'right-1 bg-white' 
                    : 'left-1 bg-slate-100 dark:bg-slate-400'
                } w-4 h-4 rounded-full`}
              ></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <BarChart2 size={20} className="text-green-500 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Data Analysis</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enable advanced analysis of your data patterns</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleTogglePreference('dataAnalysis')}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.dataAnalysis 
                  ? 'bg-green-500' 
                  : 'bg-slate-300 dark:bg-slate-600'
              } relative`}
            >
              <span 
                className={`absolute top-1 transition-transform ${
                  preferences.dataAnalysis 
                    ? 'right-1 bg-white' 
                    : 'left-1 bg-slate-100 dark:bg-slate-400'
                } w-4 h-4 rounded-full`}
              ></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Cpu size={20} className="text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Two-Pass AI</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Use more advanced (but slower) two-pass AI processing</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleTogglePreference('useTwoPassAI')}
              className={`w-12 h-6 rounded-full transition-colors ${
                preferences.useTwoPassAI 
                  ? 'bg-indigo-500' 
                  : 'bg-slate-300 dark:bg-slate-600'
              } relative`}
            >
              <span 
                className={`absolute top-1 transition-transform ${
                  preferences.useTwoPassAI 
                    ? 'right-1 bg-white' 
                    : 'left-1 bg-slate-100 dark:bg-slate-400'
                } w-4 h-4 rounded-full`}
              ></span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Communication Style Section */}
      <div className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <MessageCircle size={18} className="text-indigo-500 dark:text-indigo-400" />
          Communication Style
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Choose how you'd prefer Solaris to communicate with you.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleCommunicationStyleChange('direct')}
            className={`p-4 rounded-lg border ${
              personalInfo.communicationStyle === 'direct'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50'
            }`}
          >
            <div className="mb-2 text-center">
              <Zap size={24} className={`mx-auto ${
                personalInfo.communicationStyle === 'direct'
                  ? 'text-blue-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`} />
            </div>
            <h4 className={`font-medium text-center ${
              personalInfo.communicationStyle === 'direct'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              Direct & Concise
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              Straightforward and to-the-point guidance
            </p>
          </button>
          
          <button
            onClick={() => handleCommunicationStyleChange('balanced')}
            className={`p-4 rounded-lg border ${
              personalInfo.communicationStyle === 'balanced'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50'
            }`}
          >
            <div className="mb-2 text-center">
              <Activity size={24} className={`mx-auto ${
                personalInfo.communicationStyle === 'balanced'
                  ? 'text-purple-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`} />
            </div>
            <h4 className={`font-medium text-center ${
              personalInfo.communicationStyle === 'balanced'
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              Balanced
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              Mix of information and encouragement
            </p>
          </button>
          
          <button
            onClick={() => handleCommunicationStyleChange('supportive')}
            className={`p-4 rounded-lg border ${
              personalInfo.communicationStyle === 'supportive'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/50'
            }`}
          >
            <div className="mb-2 text-center">
              <Heart size={24} className={`mx-auto ${
                personalInfo.communicationStyle === 'supportive'
                  ? 'text-green-500'
                  : 'text-slate-400 dark:text-slate-500'
              }`} />
            </div>
            <h4 className={`font-medium text-center ${
              personalInfo.communicationStyle === 'supportive'
                ? 'text-green-700 dark:text-green-300'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              Supportive & Detailed
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              Warm, encouraging with thorough explanations
            </p>
          </button>
        </div>
      </div>
      
      {/* Personal Info Section */}
      <div className="bg-white dark:bg-slate-700 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
          <User size={18} className="text-indigo-500 dark:text-indigo-400" />
          Your Personal Information
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Help Solaris understand you better by sharing some information about yourself.
          This helps tailor advice and suggestions to your unique situation.
        </p>
        
        <div className="space-y-6">
          {/* Qualities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                Your Qualities & Strengths
              </h4>
              
              <button 
                onClick={() => setIsEditingQualities(!isEditingQualities)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
              >
                <Edit size={14} />
              </button>
            </div>
            
            {/* Display tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {personalInfo.qualities && personalInfo.qualities.length > 0 ? (
                personalInfo.qualities.map((quality, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs flex items-center"
                  >
                    {quality}
                    {isEditingQualities && (
                      <button 
                        className="ml-1 text-amber-400 hover:text-amber-600 dark:hover:text-amber-200" 
                        onClick={() => removeTag('qualities', quality)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No qualities added yet. What are you good at?
                </p>
              )}
            </div>
            
            {/* Add new tag input shown in edit mode */}
            {isEditingQualities && (
              <div className="flex mt-2">
                <input
                  type="text"
                  value={qualitiesInput}
                  onChange={(e) => setQualitiesInput(e.target.value)}
                  placeholder="Add a quality or strength..."
                  className="flex-1 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveQualities();
                    }
                  }}
                />
                <button 
                  onClick={handleSaveQualities}
                  className="px-3 py-2 bg-amber-500 text-white rounded-r-lg hover:bg-amber-600 transition-colors"
                  disabled={!qualitiesInput.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          
          {/* Interests */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                Your Interests & Hobbies
              </h4>
              
              <button 
                onClick={() => setIsEditingInterests(!isEditingInterests)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
              >
                <Edit size={14} />
              </button>
            </div>
            
            {/* Display tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {personalInfo.interests && personalInfo.interests.length > 0 ? (
                personalInfo.interests.map((interest, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs flex items-center"
                  >
                    {interest}
                    {isEditingInterests && (
                      <button 
                        className="ml-1 text-red-400 hover:text-red-600 dark:hover:text-red-200" 
                        onClick={() => removeTag('interests', interest)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No interests added yet. What do you enjoy doing?
                </p>
              )}
            </div>
            
            {/* Add new tag input shown in edit mode */}
            {isEditingInterests && (
              <div className="flex mt-2">
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="Add an interest or hobby..."
                  className="flex-1 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveInterests();
                    }
                  }}
                />
                <button 
                  onClick={handleSaveInterests}
                  className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors"
                  disabled={!interestsInput.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          
          {/* Challenges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Zap size={16} className="text-purple-500" />
                Challenges You're Working On
              </h4>
              
              <button 
                onClick={() => setIsEditingChallenges(!isEditingChallenges)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
              >
                <Edit size={14} />
              </button>
            </div>
            
            {/* Display tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {personalInfo.challenges && personalInfo.challenges.length > 0 ? (
                personalInfo.challenges.map((challenge, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs flex items-center"
                  >
                    {challenge}
                    {isEditingChallenges && (
                      <button 
                        className="ml-1 text-purple-400 hover:text-purple-600 dark:hover:text-purple-200" 
                        onClick={() => removeTag('challenges', challenge)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No challenges added yet. What are you working to improve?
                </p>
              )}
            </div>
            
            {/* Add new tag input shown in edit mode */}
            {isEditingChallenges && (
              <div className="flex mt-2">
                <input
                  type="text"
                  value={challengesInput}
                  onChange={(e) => setChallengesInput(e.target.value)}
                  placeholder="Add a challenge you're working on..."
                  className="flex-1 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveChallenges();
                    }
                  }}
                />
                <button 
                  onClick={handleSaveChallenges}
                  className="px-3 py-2 bg-purple-500 text-white rounded-r-lg hover:bg-purple-600 transition-colors"
                  disabled={!challengesInput.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          
          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Brain size={16} className="text-blue-500" />
                Your Goals & Aspirations
              </h4>
              
              <button 
                onClick={() => setIsEditingGoals(!isEditingGoals)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
              >
                <Edit size={14} />
              </button>
            </div>
            
            {/* Display tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {personalInfo.goals && personalInfo.goals.length > 0 ? (
                personalInfo.goals.map((goal, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs flex items-center"
                  >
                    {goal}
                    {isEditingGoals && (
                      <button 
                        className="ml-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200" 
                        onClick={() => removeTag('goals', goal)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No goals added yet. What are you working toward?
                </p>
              )}
            </div>
            
            {/* Add new tag input shown in edit mode */}
            {isEditingGoals && (
              <div className="flex mt-2">
                <input
                  type="text"
                  value={goalsInput}
                  onChange={(e) => setGoalsInput(e.target.value)}
                  placeholder="Add a goal or aspiration..."
                  className="flex-1 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveGoals();
                    }
                  }}
                />
                <button 
                  onClick={handleSaveGoals}
                  className="px-3 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
                  disabled={!goalsInput.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayCoachProfile;