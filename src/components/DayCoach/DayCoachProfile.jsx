import React, { useState, useEffect } from 'react';
import { X,User, Sparkles, Bell, AlertCircle, Settings, Save, Star, Award, Edit, Check, PlusCircle, MinusCircle, Smile, Heart, Book, Target, Brain, Frown, HelpCircle, Info } from 'lucide-react';
import { saveUserPreferences, saveUserPersonalInfo } from '../../utils/dayCoachUtils';

const DayCoachProfile = ({ userData }) => {
  const [preferences, setPreferences] = useState(userData?.preferences || {
    notifications: true,
    proactiveMessages: true,
    dataAnalysis: true
  });
  
  const [personalInfo, setPersonalInfo] = useState(userData?.personalInfo || {
    qualities: [],
    interests: [],
    challenges: [],
    goals: [],
    communicationStyle: 'balanced'
  });
  
  const [newItem, setNewItem] = useState({
    qualities: '',
    interests: '',
    challenges: '',
    goals: ''
  });
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState({
    qualities: false,
    interests: false,
    challenges: false,
    goals: false
  });
  const [showInfoPopup, setShowInfoPopup] = useState(null);
  
  // Handle preference changes
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setIsSaved(false);
  };
  
  // Handle adding a new item to a list
  const handleAddItem = (category) => {
    if (newItem[category].trim()) {
      setPersonalInfo(prev => ({
        ...prev,
        [category]: [...prev[category], newItem[category].trim()]
      }));
      setNewItem(prev => ({ ...prev, [category]: '' }));
      setIsSaved(false);
    }
  };
  
  // Handle removing an item from a list
  const handleRemoveItem = (category, index) => {
    setPersonalInfo(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
    setIsSaved(false);
  };
  
  // Handle communication style change
  const handleCommunicationStyleChange = (style) => {
    setPersonalInfo(prev => ({
      ...prev,
      communicationStyle: style
    }));
    setIsSaved(false);
  };
  
  // Save all settings
  const handleSaveAll = () => {
    saveUserPreferences(preferences);
    saveUserPersonalInfo(personalInfo);
    setIsSaved(true);
    
    // Reset saved indicator after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };
  
  // Info text for tooltips
  const getInfoText = (category) => {
    switch(category) {
      case 'qualities':
        return "Share your strengths, values, or personality traits that define you. This helps Solaris emphasize these qualities in recommendations.";
      case 'interests':
        return "Activities or topics you enjoy. Solaris will incorporate these into suggestions and conversations.";
      case 'challenges':
        return "Areas you find difficult or want to improve. Solaris will tailor advice to help overcome these specific challenges.";
      case 'goals':
        return "What you're working toward. Solaris will keep these in mind when providing guidance.";
      case 'communicationStyle':
        return "Choose how Solaris communicates with you. This affects the tone and depth of responses.";
      default:
        return "";
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <User size={48} className="text-blue-500 dark:text-blue-400" />
          </div>
          <div className="absolute -right-1 -bottom-1 bg-blue-500 dark:bg-blue-600 rounded-full p-1.5 text-white">
            <Sparkles size={16} />
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
  <button 
    className={`py-2 px-2 sm:px-4 focus:outline-none whitespace-nowrap ${
      activeTab === 'personal' 
        ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
    }`}
    onClick={() => setActiveTab('personal')}
  >
    <div className="flex items-center gap-1.5">
      <User size={16} />
      <span className="hidden xs:inline">Profile</span>
      <span className="hidden sm:inline"> Info</span>
    </div>
  </button>

  <button 
    className={`py-2 px-2 sm:px-4 focus:outline-none whitespace-nowrap ${
      activeTab === 'preferences' 
        ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
    }`}
    onClick={() => setActiveTab('preferences')}
  >
    <div className="flex items-center gap-1.5">
      <Settings size={16} />
      <span className="hidden xs:inline">Preferences</span>
    </div>
  </button>
  
  <button 
    className={`py-2 px-2 sm:px-4 focus:outline-none whitespace-nowrap ${
      activeTab === 'capabilities' 
        ? 'border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400' 
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
    }`}
    onClick={() => setActiveTab('capabilities')}
  >
    <div className="flex items-center gap-1.5">
      <Award size={16} />
      <span className="hidden xs:inline">Features</span>
    </div>
  </button>
</div>
      
      {/* Preference Settings Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-700 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-slate-500 dark:text-slate-400" />
            Solaris Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-amber-500 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Notifications</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts when new Solaris insights are available</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={preferences.notifications} 
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-purple-500 dark:text-purple-400" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Proactive Coaching</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Allow Solaris to initiate conversations based on your data</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={preferences.proactiveMessages} 
                  onChange={(e) => handlePreferenceChange('proactiveMessages', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-red-500 dark:text-red-400" />
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Data Analysis</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Allow Solaris to analyze patterns and correlations in your data</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={preferences.dataAnalysis} 
                  onChange={(e) => handlePreferenceChange('dataAnalysis', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-slate-700 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <User size={18} className="text-slate-500 dark:text-slate-400" />
              About yourself
            </h3>
            
          </div>
          
          
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-slate-700 dark:text-slate-300 relative">
              <p>Sharing personal information helps Solaris provide more personalized guidance. This information is used to tailor advice, suggestions, and communication style to your unique personality and needs.</p>
            </div>
          
          
          <div className="space-y-6">
            {/* Qualities Section */}
            <div className="border-b border-slate-200 dark:border-slate-600 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Smile size={18} className="text-green-500 dark:text-green-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Your Qualities & Strengths</h4>
                </div>
                <button
                  onClick={() => setShowInfoPopup('qualities')}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full"
                >
                  <Info size={14} />
                </button>
              </div>
              
              {showInfoPopup === 'qualities' && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                  {getInfoText('qualities')}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {personalInfo.qualities.map((quality, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{quality}</span>
                    <button 
                      onClick={() => handleRemoveItem('qualities', index)}
                      className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-200"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
                
                {personalInfo.qualities.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">No qualities added yet</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newItem.qualities}
                  onChange={(e) => setNewItem({...newItem, qualities: e.target.value})}
                  placeholder="Add a quality or strength..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('qualities')}
                />
                <button
                  onClick={() => handleAddItem('qualities')}
                  className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
            
            {/* Interests Section */}
            <div className="border-b border-slate-200 dark:border-slate-600 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-red-500 dark:text-red-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Your Interests & Hobbies</h4>
                </div>
                <button
                  onClick={() => setShowInfoPopup('interests')}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full"
                >
                  <Info size={14} />
                </button>
              </div>
              
              {showInfoPopup === 'interests' && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                  {getInfoText('interests')}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {personalInfo.interests.map((interest, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{interest}</span>
                    <button 
                      onClick={() => handleRemoveItem('interests', index)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-200"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
                
                {personalInfo.interests.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">No interests added yet</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newItem.interests}
                  onChange={(e) => setNewItem({...newItem, interests: e.target.value})}
                  placeholder="Add an interest or hobby..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('interests')}
                />
                <button
                  onClick={() => handleAddItem('interests')}
                  className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
            
            {/* Challenges Section */}
            <div className="border-b border-slate-200 dark:border-slate-600 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Frown size={18} className="text-amber-500 dark:text-amber-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Your Challenges & Difficulties</h4>
                </div>
                <button
                  onClick={() => setShowInfoPopup('challenges')}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full"
                >
                  <Info size={14} />
                </button>
              </div>
              
              {showInfoPopup === 'challenges' && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                  {getInfoText('challenges')}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {personalInfo.challenges.map((challenge, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{challenge}</span>
                    <button 
                      onClick={() => handleRemoveItem('challenges', index)}
                      className="text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-200"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
                
                {personalInfo.challenges.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">No challenges added yet</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newItem.challenges}
                  onChange={(e) => setNewItem({...newItem, challenges: e.target.value})}
                  placeholder="Add a challenge or difficulty..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('challenges')}
                />
                <button
                  onClick={() => handleAddItem('challenges')}
                  className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/40"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
            
            {/* Goals Section */}
            <div className="border-b border-slate-200 dark:border-slate-600 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-blue-500 dark:text-blue-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Your Goals & Aspirations</h4>
                </div>
                <button
                  onClick={() => setShowInfoPopup('goals')}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full"
                >
                  <Info size={14} />
                </button>
              </div>
              
              {showInfoPopup === 'goals' && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                  {getInfoText('goals')}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                {personalInfo.goals.map((goal, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1"
                  >
                    <span>{goal}</span>
                    <button 
                      onClick={() => handleRemoveItem('goals', index)}
                      className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200"
                    >
                      <MinusCircle size={14} />
                    </button>
                  </div>
                ))}
                
                {personalInfo.goals.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">No goals added yet</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newItem.goals}
                  onChange={(e) => setNewItem({...newItem, goals: e.target.value})}
                  placeholder="Add a goal or aspiration..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem('goals')}
                />
                <button
                  onClick={() => handleAddItem('goals')}
                  className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            </div>
            
            {/* Communication Style Preference */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-purple-500 dark:text-purple-400" />
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Preferred Communication Style</h4>
                </div>
                <button
                  onClick={() => setShowInfoPopup('communicationStyle')}
                  className="p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full"
                >
                  <Info size={14} />
                </button>
              </div>
              
              {showInfoPopup === 'communicationStyle' && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                  {getInfoText('communicationStyle')}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleCommunicationStyleChange('direct')}
                  className={`p-3 rounded-lg text-left ${
                    personalInfo.communicationStyle === 'direct'
                      ? 'bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-500 dark:border-purple-400'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Direct & Concise</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Straightforward, brief responses with clear actions</p>
                </button>
                
                <button
                  onClick={() => handleCommunicationStyleChange('balanced')}
                  className={`p-3 rounded-lg text-left ${
                    personalInfo.communicationStyle === 'balanced'
                      ? 'bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-500 dark:border-purple-400'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Balanced</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Mix of information and warmth, with moderate detail</p>
                </button>
                
                <button
                  onClick={() => handleCommunicationStyleChange('supportive')}
                  className={`p-3 rounded-lg text-left ${
                    personalInfo.communicationStyle === 'supportive'
                      ? 'bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-500 dark:border-purple-400'
                      : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-1">Supportive & Detailed</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Empathetic, encouraging with thorough explanations</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Coach Capabilities Tab */}
      {activeTab === 'capabilities' && (
        <div className="bg-white dark:bg-slate-700 rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Award size={18} className="text-slate-500 dark:text-slate-400" />
            Solaris Capabilities
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <h4 className="flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium mb-1">
                <User size={16} />
                <span>Personalized Support</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Receives contextual information about your day and health patterns to provide relevant guidance.
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <h4 className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-medium mb-1">
                <Sparkles size={16} />
                <span>Data Insights</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Analyzes patterns in your mood, energy, task completion, and workouts to identify trends.
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <h4 className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium mb-1">
                <Bell size={16} />
                <span>Proactive Check-ins</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Initiates conversations based on important changes in your tracked data.
              </p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <h4 className="flex items-center gap-1 text-green-700 dark:text-green-300 font-medium mb-1">
                <Star size={16} />
                <span>Motivation & Accountability</span>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Provides encouragement and accountability to help you stay on track with your goals.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Save Button (always visible) */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAll}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isSaved 
              ? 'bg-green-500 dark:bg-green-600 text-white' 
              : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
          }`}
        >
          {isSaved ? (
            <>
              <Check size={16} />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
      
      
    </div>
  );
};

export default DayCoachProfile;