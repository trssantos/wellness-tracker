import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, Check, RotateCcw } from 'lucide-react';
import { getVoiceSettings, saveVoiceSettings } from '../../utils/meditationStorage';

const VoiceSettingsModal = ({ onClose }) => {
  const [settings, setSettings] = useState(getVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState([]);
  const [testText, setTestText] = useState("This is a sample meditation voice. How does it sound?");
  const speechSynthesisRef = useRef(window.speechSynthesis);
  
  useEffect(() => {
    // Get available voices
    const loadVoices = () => {
      const voices = speechSynthesisRef.current.getVoices();
      setAvailableVoices(voices);
    };
    
    // Some browsers need this event
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    loadVoices();
    
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);
  
  const handleSave = () => {
    saveVoiceSettings(settings);
    onClose();
  };
  
  const handleReset = () => {
    const defaultSettings = {
      useExternalVoice: false,
      voiceType: 'female',
      voicePitch: 0.9,
      voiceRate: 0.85,
      voiceVolume: 0.8
    };
    
    setSettings(defaultSettings);
  };
  
  const testVoice = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(testText);
      utterance.rate = settings.voiceRate;
      utterance.pitch = settings.voicePitch;
      utterance.volume = settings.voiceVolume;
      
      // Select voice based on user preference
      const voices = speechSynthesisRef.current.getVoices();
      
      let selectedVoice = null;
      
      if (settings.voiceType === 'female') {
        selectedVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('female') ||
          voice.name.includes('Samantha')
        );
      } else if (settings.voiceType === 'male') {
        selectedVoice = voices.find(voice => 
          voice.name.includes('Male') || 
          voice.name.includes('male') ||
          voice.name.includes('Daniel')
        );
      }
      
      // Use the selected voice or default
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      speechSynthesisRef.current.speak(utterance);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-800 dark:text-slate-100">Voice Settings</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Voice Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings({...settings, voiceType: 'female'})}
                className={`p-3 rounded-lg text-center transition-colors ${
                  settings.voiceType === 'female'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Female Voice
              </button>
              <button
                onClick={() => setSettings({...settings, voiceType: 'male'})}
                className={`p-3 rounded-lg text-center transition-colors ${
                  settings.voiceType === 'male'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Male Voice
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Voice Speed: {settings.voiceRate.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={settings.voiceRate}
              onChange={e => setSettings({...settings, voiceRate: parseFloat(e.target.value)})}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Voice Pitch: {settings.voicePitch.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.voicePitch}
              onChange={e => setSettings({...settings, voicePitch: parseFloat(e.target.value)})}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Deeper</span>
              <span>Higher</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Voice Volume: {(settings.voiceVolume * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.voiceVolume}
              onChange={e => setSettings({...settings, voiceVolume: parseFloat(e.target.value)})}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Test your voice settings:
            </p>
            <div className="flex gap-2">
              <button
                onClick={testVoice}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
              >
                <Volume2 size={16} />
                Test Voice
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">
              Note: Voice quality depends on your device and browser. For premium guided meditations, consider using the ambient sounds without voice guidance.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2"
              >
                <Check size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsModal;