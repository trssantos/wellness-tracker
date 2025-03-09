import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Clock, Star, Zap, FileText, AlertCircle } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

const SleepTracker = ({ date, onClose }) => {
  // Sleep data states
  const [duration, setDuration] = useState(7.5); // In hours
  const [quality, setQuality] = useState(3); // 1-5 scale
  const [bedtime, setBedtime] = useState('22:30'); // 24hr format
  const [wakeTime, setWakeTime] = useState('06:00'); // 24hr format
  const [factors, setFactors] = useState([]); // Array of factors affecting sleep
  const [notes, setNotes] = useState('');
  const [saveError, setSaveError] = useState(null);

  // Available sleep factors
  const SLEEP_FACTORS = [
    { id: 'interrupted', label: 'Interrupted Sleep', icon: <Clock size={16} /> },
    { id: 'vivid_dreams', label: 'Vivid Dreams', icon: <Moon size={16} /> },
    { id: 'caffeine', label: 'Caffeine Late', icon: <Zap size={16} /> },
    { id: 'screen_time', label: 'Late Screen Time', icon: <FileText size={16} /> },
    { id: 'stress', label: 'Stress/Anxiety', icon: <AlertCircle size={16} /> },
    { id: 'exercise', label: 'Exercise', icon: <Zap size={16} /> },
    { id: 'alcohol', label: 'Alcohol', icon: <AlertCircle size={16} /> },
    { id: 'noise', label: 'Noise/Disturbances', icon: <AlertCircle size={16} /> }
  ];

  useEffect(() => {
    if (date) {
      // Load existing data for this date
      const storage = getStorage();
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const dayData = storage[dateStr] || {};
      
      // Check for existing sleep data
      if (dayData.sleep) {
        setDuration(dayData.sleep.duration || 7.5);
        setQuality(dayData.sleep.quality || 3);
        setBedtime(dayData.sleep.bedtime || '22:30');
        setWakeTime(dayData.sleep.wakeTime || '06:00');
        setFactors(dayData.sleep.factors || []);
        setNotes(dayData.sleep.notes || '');
      } else {
        // Reset to defaults if no data exists
        setDuration(7.5);
        setQuality(3);
        setBedtime('22:30');
        setWakeTime('06:00');
        setFactors([]);
        setNotes('');
      }
    }
  }, [date]);

  // Helper function to calculate sleep duration from bedtime and wake time
  useEffect(() => {
    if (bedtime && wakeTime) {
      const bedtimeParts = bedtime.split(':').map(Number);
      const waketimeParts = wakeTime.split(':').map(Number);
      
      let bedtimeHours = bedtimeParts[0] + bedtimeParts[1] / 60;
      let waketimeHours = waketimeParts[0] + waketimeParts[1] / 60;
      
      // Handle overnight sleep (e.g., 23:00 to 06:00)
      if (waketimeHours < bedtimeHours) {
        waketimeHours += 24;
      }
      
      const calculatedDuration = parseFloat((waketimeHours - bedtimeHours).toFixed(2));
      setDuration(calculatedDuration);
    }
  }, [bedtime, wakeTime]);

  const getFormattedDate = () => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
    return dateObj.toLocaleDateString('default', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleFactor = (factorId) => {
    if (factors.includes(factorId)) {
      setFactors(factors.filter(id => id !== factorId));
    } else {
      setFactors([...factors, factorId]);
    }
  };

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const saveData = () => {
    if (!date) {
      setSaveError("No date selected. Please try again.");
      return;
    }
    
    try {
      const storage = getStorage();
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      const dayData = storage[dateStr] || {};
      
      // Save sleep data
      storage[dateStr] = {
        ...dayData,
        sleep: {
          duration,
          quality,
          bedtime,
          wakeTime,
          factors,
          notes
        }
      };
      
      setStorage(storage);
      setSaveError(null);
      onClose();
    } catch (error) {
      console.error('Error saving sleep data:', error);
      setSaveError(`Failed to save: ${error.message}`);
    }
  };

  return (
    <dialog 
      id="sleep-tracker-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'sleep-tracker-modal' && onClose()}
    >
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header mb-6">
          <div>
            <h3 className="modal-title">Track Sleep</h3>
            <p className="modal-subtitle">
              {getFormattedDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Sleep Times */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Sleep Schedule
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Moon size={16} className="text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Bedtime</span>
                </div>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sun size={16} className="text-amber-500 dark:text-amber-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">Wake time</span>
                </div>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                />
              </div>
            </div>
            <div className="mt-2 text-center text-sm font-medium">
              <span className="text-indigo-600 dark:text-indigo-400">{formatDuration(duration)}</span> of sleep
            </div>
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Sleep Quality
            </label>
            <div className="mb-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 dark:accent-indigo-400"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very good</span>
                <span>Excellent</span>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  onClick={() => setQuality(star)}
                  className={`cursor-pointer ${
                    star <= quality
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                  } transition-colors`}
                />
              ))}
            </div>
          </div>

          {/* Sleep Factors */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Factors Affecting Sleep
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SLEEP_FACTORS.map((factor) => (
                <button
                  key={factor.id}
                  onClick={() => toggleFactor(factor.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors
                    ${factors.includes(factor.id)
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
                    }`}
                >
                  <span className={`${factors.includes(factor.id) ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {factor.icon}
                  </span>
                  <span>{factor.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your sleep..."
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 h-20 transition-colors"
            />
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg transition-colors">
              <AlertCircle size={20} />
              <p>{saveError}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveData}
            className="w-full py-3 px-4 bg-indigo-500 dark:bg-indigo-600 text-white rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-700 font-medium transition-colors"
          >
            Save Sleep Data
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SleepTracker;