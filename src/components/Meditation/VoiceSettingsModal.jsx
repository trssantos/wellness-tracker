import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, Check, RotateCcw } from 'lucide-react';
import { getVoiceSettings, saveVoiceSettings } from '../../utils/meditationStorage';

const VoiceSettingsModal = ({ onClose }) => {
  const [settings, setSettings] = useState(getVoiceSettings());
  const [availableVoices, setAvailableVoices] = useState([]);
  const [testText, setTestText] = useState("This is a sample meditation voice. How does it sound?");
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const modalRef = useRef(null);
  
  // Open modal when component mounts
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.showModal();
    }
    
    // Cleanup when unmounting
    return () => {
      if (modalRef.current && modalRef.current.open) {
        modalRef.current.close();
      }
    };
  }, []);
  
  useEffect(() => {
    // Function to load voices
    const loadVoices = () => {
      const voices = speechSynthesisRef.current.getVoices();
      console.log("Loaded voices:", voices.length);
      setAvailableVoices(voices);
    };
    
    // Initial load attempt
    loadVoices();
    
    // Some browsers need this event
    if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
      speechSynthesisRef.current.onvoiceschanged = loadVoices;
    }
    
    // Make another attempt after a short delay (for some browsers)
    const timer = setTimeout(() => {
      if (availableVoices.length === 0) {
        loadVoices();
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
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
      selectedVoiceName: '',
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
      
      // Get all available voices
      const voices = speechSynthesisRef.current.getVoices();
      console.log("Available voices:", voices.map(v => v.name));
      
      let selectedVoice = null;
      
      // If user has selected a specific voice, use it
      if (settings.selectedVoiceName) {
        selectedVoice = voices.find(v => v.name === settings.selectedVoiceName);
      }
      
      // If no specific voice selected or not found, use default
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }
      
      // Apply selected voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log("Using voice:", selectedVoice.name);
      }
      
      speechSynthesisRef.current.speak(utterance);
    }
  };
  
  // Generate a categorized list of voices
  const groupedVoices = (() => {
    // Try to categorize voices
    const defaultGroup = [];
    const femaleGroup = [];
    const maleGroup = [];
    const otherGroup = [];
    
    availableVoices.forEach(voice => {
      const name = voice.name.toLowerCase();
      
      if (name.includes('female') || 
          name.includes('zira') || 
          name.includes('samantha') || 
          name.includes('victoria') || 
          name.includes('karen')) {
        femaleGroup.push(voice);
      } 
      else if (name.includes('male') || 
              name.includes('david') || 
              name.includes('mark') || 
              name.includes('daniel') || 
              name.includes('alex')) {
        maleGroup.push(voice);
      }
      else {
        // Split other voices roughly into male/female based on position
        // This is a heuristic - often first voice is female, second is male
        const index = availableVoices.indexOf(voice);
        if (index % 2 === 0) {
          defaultGroup.push(voice);
        } else {
          otherGroup.push(voice);
        }
      }
    });
    
    return { femaleGroup, maleGroup, defaultGroup, otherGroup };
  })();
  
  return (
    <dialog 
      id="voice-settings-modal" 
      ref={modalRef}
      className="modal-base"
      onClick={(e) => e.target.id === 'voice-settings-modal' && onClose()}
    >
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Voice Settings</h2>
          <button 
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Voice
            </label>
            <select 
              className="w-full p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
              value={settings.selectedVoiceName || ""}
              onChange={(e) => {
                const selectedName = e.target.value;
                setSettings({
                  ...settings,
                  selectedVoiceName: selectedName
                });
              }}
            >
              <option value="">System default voice</option>
              
              {groupedVoices.femaleGroup.length > 0 && (
                <optgroup label="Female Voices">
                  {groupedVoices.femaleGroup.map((voice, index) => (
                    <option key={`female-${index}`} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </optgroup>
              )}
              
              {groupedVoices.maleGroup.length > 0 && (
                <optgroup label="Male Voices">
                  {groupedVoices.maleGroup.map((voice, index) => (
                    <option key={`male-${index}`} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </optgroup>
              )}
              
              {groupedVoices.defaultGroup.length > 0 && (
                <optgroup label="Default Voices">
                  {groupedVoices.defaultGroup.map((voice, index) => (
                    <option key={`default-${index}`} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </optgroup>
              )}
              
              {groupedVoices.otherGroup.length > 0 && (
                <optgroup label="Other Voices">
                  {groupedVoices.otherGroup.map((voice, index) => (
                    <option key={`other-${index}`} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
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
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Test your voice settings:
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {availableVoices.length} voice{availableVoices.length !== 1 ? 's' : ''} available on your device
            </p>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter test text here"
              className="w-full p-2 mb-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
            />
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
              Note: Voice quality depends on your device and browser. For the best experience, test different voices and adjust pitch/speed.
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
    </dialog>
  );
};

export default VoiceSettingsModal;