import React, { useState, useEffect } from 'react';
import { Clock, Bell, Volume2, VolumeX, Save, Plus, Trash2, Play, Pause, AlertTriangle } from 'lucide-react';
import { getTimerPresets, updateTimerPreset } from '../../utils/focusUtils';

const FocusSettings = () => {
  const [presets, setPresets] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingPreset, setEditingPreset] = useState(null);
  const [presetFormData, setPresetFormData] = useState({
    name: '',
    duration: 25,
    mode: 'countdown'
  });
  const [saveStatus, setSaveStatus] = useState(null);
  
  // Load presets on component mount
  useEffect(() => {
    const loadedPresets = getTimerPresets();
    setPresets(loadedPresets);
    
    // Load other settings from local storage
    const storedSoundEnabled = localStorage.getItem('focusSoundEnabled');
    const storedNotificationsEnabled = localStorage.getItem('focusNotificationsEnabled');
    
    if (storedSoundEnabled !== null) {
      setSoundEnabled(storedSoundEnabled === 'true');
    }
    
    if (storedNotificationsEnabled !== null) {
      setNotificationsEnabled(storedNotificationsEnabled === 'true');
    }
  }, []);
  
  // Save sound and notification settings
  useEffect(() => {
    localStorage.setItem('focusSoundEnabled', soundEnabled);
    localStorage.setItem('focusNotificationsEnabled', notificationsEnabled);
  }, [soundEnabled, notificationsEnabled]);
  
  // Handle edit preset
  const handleEditPreset = (preset) => {
    setEditingPreset(preset.key);
    setPresetFormData({
      name: preset.name,
      duration: preset.duration / 60, // Convert seconds to minutes for form
      mode: preset.mode || 'countdown'
    });
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPreset(null);
    setPresetFormData({
      name: '',
      duration: 25,
      mode: 'countdown'
    });
  };
  
  // Handle save preset
  const handleSavePreset = (presetKey) => {
    // Validate form data
    if (!presetFormData.name.trim()) {
      setSaveStatus({ type: 'error', message: 'Preset name is required' });
      return;
    }
    
    if (isNaN(presetFormData.duration) || presetFormData.duration <= 0) {
      setSaveStatus({ type: 'error', message: 'Duration must be a positive number' });
      return;
    }
    
    // Update preset
    const updatedPreset = {
      key: presetKey,
      name: presetFormData.name.trim(),
      duration: presetFormData.duration * 60, // Convert minutes to seconds
      mode: presetFormData.mode
    };
    
    // Save to storage
    updateTimerPreset(presetKey, updatedPreset);
    
    // Reload presets
    const loadedPresets = getTimerPresets();
    setPresets(loadedPresets);
    
    // Reset form
    setEditingPreset(null);
    setPresetFormData({
      name: '',
      duration: 25,
      mode: 'countdown'
    });
    
    // Show success status
    setSaveStatus({ type: 'success', message: 'Preset saved successfully' });
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };
  
  // Format seconds to minutes
  const formatMinutes = (seconds) => {
    return Math.floor(seconds / 60);
  };
  
  return (
    <div className="focus-settings">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-6 transition-colors">
        Focus Settings
      </h3>
      
      {/* General Settings */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 transition-colors">
          General Settings
        </h4>
        
        <div className="space-y-4">
          {/* Sound Effects */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 size={20} className="text-blue-500 dark:text-blue-400" />
              ) : (
                <VolumeX size={20} className="text-slate-500 dark:text-slate-400" />
              )}
              <span className="text-slate-700 dark:text-slate-300 transition-colors">Sound Effects</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                className="sr-only peer"
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)} 
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600 transition-colors"></div>
            </label>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors">
            <div className="flex items-center gap-3">
              <Bell size={20} className={notificationsEnabled ? "text-blue-500 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"} />
              <span className="text-slate-700 dark:text-slate-300 transition-colors">Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                className="sr-only peer"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600 transition-colors"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Timer Presets */}
      <div>
        <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-4 transition-colors flex items-center gap-2">
          <Clock size={18} className="text-blue-500 dark:text-blue-400" />
          Timer Presets
        </h4>
        
        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            saveStatus.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          } transition-colors`}>
            {saveStatus.type === 'success' ? (
              <Save size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}
        
        <div className="space-y-4">
          {presets.map(preset => (
            <div 
              key={preset.key}
              className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
            >
              {editingPreset === preset.key ? (
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                      Preset Name
                    </label>
                    <input
                      type="text"
                      value={presetFormData.name}
                      onChange={(e) => setPresetFormData({...presetFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={presetFormData.duration}
                      onChange={(e) => setPresetFormData({...presetFormData, duration: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                      Timer Mode
                    </label>
                    <select
                      value={presetFormData.mode}
                      onChange={(e) => setPresetFormData({...presetFormData, mode: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="countdown">Countdown Timer</option>
                      <option value="countup">Stopwatch (Count Up)</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSavePreset(preset.key)}
                      className="px-3 py-1.5 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // Display View
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        preset.mode === 'countdown' 
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                      } transition-colors`}>
                        {preset.mode === 'countdown' ? (
                          <Clock size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </div>
                      <h5 className="font-medium text-slate-800 dark:text-slate-200 transition-colors">
                        {preset.name}
                      </h5>
                    </div>
                    
                    <button
                      onClick={() => handleEditPreset(preset)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="pl-10">
                    <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">
                      {preset.mode === 'countdown' ? (
                        <>Timer for {formatMinutes(preset.duration)} minutes</>
                      ) : (
                        <>Stopwatch (counts up from zero)</>
                      )}
                    </p>
                    
                    {preset.description && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 transition-colors">
                        {preset.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusSettings;