// src/components/Lifestyle/ZodiacDateSelector.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getZodiacSign, zodiacSigns, getZodiacColors } from '../../utils/zodiacData';
import { getStorage, setStorage } from '../../utils/storage';

const ZodiacDateSelector = ({ onComplete, onCancel }) => {
  const [birthDate, setBirthDate] = useState('');
  const [zodiacSign, setZodiacSign] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');
  
  // Check if we already have a saved birth date
  useEffect(() => {
    const storage = getStorage();
    if (storage.lifestyle?.birthDate) {
      setBirthDate(storage.lifestyle.birthDate);
      
      // If we have a birthdate, calculate the sign
      if (storage.lifestyle.birthDate) {
        const sign = getZodiacSign(new Date(storage.lifestyle.birthDate));
        setZodiacSign(sign);
      }
    }
  }, []);

  // When birth date changes, calculate zodiac sign
  useEffect(() => {
    if (birthDate) {
      try {
        const dateObj = new Date(birthDate);
        if (!isNaN(dateObj.getTime())) {
          const sign = getZodiacSign(dateObj);
          setZodiacSign(sign);
          setError('');
        } else {
          setZodiacSign(null);
          setError('Please enter a valid date');
        }
      } catch (e) {
        setZodiacSign(null);
        setError('Invalid date format');
      }
    } else {
      setZodiacSign(null);
      setError('');
    }
  }, [birthDate]);

  // Calculate results based on birth date
  const calculateResults = () => {
    setIsCalculating(true);
    
    // Simulate a calculation delay
    setTimeout(() => {
      // Validate birth date
      if (!birthDate || !zodiacSign) {
        setError('Please enter a valid birth date');
        setIsCalculating(false);
        return;
      }
      
      // Create results object
      const results = {
        birthDate: birthDate,
        sign: zodiacSign,
        signData: zodiacSigns[zodiacSign],
        timestamp: new Date().toISOString()
      };
      
      // Save to storage
      const storage = getStorage();
      if (!storage.lifestyle) {
        storage.lifestyle = {};
      }
      storage.lifestyle.birthDate = birthDate;
      storage.lifestyle.zodiacSign = zodiacSign;
      storage.lifestyle.zodiacTimestamp = results.timestamp;
      setStorage(storage);
      
      setIsCalculating(false);
      onComplete(results);
    }, 1000);
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get sign preview if available
  const signPreview = zodiacSign ? zodiacSigns[zodiacSign] : null;
  const colors = zodiacSign ? getZodiacColors(zodiacSign) : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
          <Star className="text-amber-500 dark:text-amber-400" size={24} />
          Discover Your Zodiac Sign
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Birth Date Input */}
      <div className="mb-8">
        <label className="block text-slate-700 dark:text-slate-300 mb-2 font-medium">
          Enter your birth date
        </label>
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 pr-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          </div>
        </div>
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>

      {/* Sign Preview */}
      {signPreview && (
        <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 mb-6 flex items-center`}>
          <div className="w-16 h-16 flex-shrink-0 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mr-4 shadow-sm">
            <span className={`text-2xl ${colors.accent}`} dangerouslySetInnerHTML={{ __html: signPreview.symbol }}></span>
          </div>
          <div>
            <h3 className={`text-lg font-bold ${colors.text}`}>{signPreview.name}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{signPreview.dates}</p>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full mr-2">
                {signPreview.element}
              </span>
              <span className="text-xs font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                {signPreview.ruling_planet}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={calculateResults}
          disabled={isCalculating || !zodiacSign}
          className={`px-6 py-3 rounded-lg font-medium ${
            isCalculating || !zodiacSign
            ? 'bg-amber-300 dark:bg-amber-800 text-amber-100 cursor-not-allowed'
            : 'bg-amber-500 dark:bg-amber-600 text-white hover:bg-amber-600 dark:hover:bg-amber-700'
          }`}
        >
          {isCalculating ? 'Calculating...' : 'View Your Zodiac Profile'}
        </button>
      </div>
    </div>
  );
};

export default ZodiacDateSelector;