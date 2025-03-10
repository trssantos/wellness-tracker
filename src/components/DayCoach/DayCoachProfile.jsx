import React, { useState } from 'react';
import { User, Sparkles, Bell, AlertCircle, Settings, Save, Star, Award } from 'lucide-react';
import { saveUserPreferences } from '../../utils/dayCoachUtils';

const DayCoachProfile = ({ userData }) => {
  const [preferences, setPreferences] = useState(userData?.preferences || {
    notifications: true,
    proactiveMessages: true,
    dataAnalysis: true
  });
  
  const [isSaved, setIsSaved] = useState(false);
  
  // Handle preference changes
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setIsSaved(false);
  };
  
  // Save preferences
  const handleSavePreferences = () => {
    saveUserPreferences(preferences);
    setIsSaved(true);
    
    // Reset saved indicator after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
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
      
      <div className="bg-white dark:bg-slate-700 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Settings size={18} className="text-slate-500 dark:text-slate-400" />
          Coach Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-amber-500 dark:text-amber-400" />
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300">Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts when new coach insights are available</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow the coach to initiate conversations based on your data</p>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Allow the coach to analyze patterns and correlations in your data</p>
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
          
          <div className="flex justify-end">
            <button
              onClick={handleSavePreferences}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isSaved 
                  ? 'bg-green-500 dark:bg-green-600 text-white' 
                  : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {isSaved ? (
                <>
                  <Star size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Preferences</span>
                </>
              )}
              </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-700 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Award size={18} className="text-slate-500 dark:text-slate-400" />
          Coach Capabilities
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
      
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
          <Sparkles size={18} />
          Premium Coach Features
        </h3>
        <p className="text-white/90 mb-4">
          Upgrade to ZenTracker Premium to unlock advanced coaching capabilities:
        </p>
        <ul className="space-y-2 mb-4">
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>AI-powered wellbeing recommendations tailored to your unique patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Deep data analysis with professional health insights</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Personalized coaching plans based on your goals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5">•</span>
            <span>Connect with real wellness experts for monthly check-ins</span>
          </li>
        </ul>
        <button className="w-full py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
          Coming Soon
        </button>
      </div>
    </div>
  );
};

export default DayCoachProfile;