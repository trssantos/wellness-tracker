// src/components/Lifestyle/NumerologyCalculator.jsx
import React, { useState, useEffect } from 'react';
import { Calculator, Star, Calendar, FileText, User, Activity, Heart, Brain, CreditCard, ChevronDown, ChevronUp, Info, X, RefreshCw } from 'lucide-react';
import { 
  calculateLifePathNumber, 
  calculateDestinyNumber, 
  calculateSoulUrgeNumber,
  calculatePersonalityNumber,
  calculateBirthdayNumber,
  getLifePathInterpretation,
  getDestinyInterpretation,
  getSoulUrgeInterpretation,
  getPersonalityInterpretation,
  getBirthdayInterpretation,
  getNumerologyColor
} from '../../utils/numerologyUtils';
import { getStorage, setStorage } from '../../utils/storage';

const NumerologyCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [results, setResults] = useState(null);
  const [savedResults, setSavedResults] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [expandedSection, setExpandedSection] = useState('lifePath');
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Load saved results from storage
  useEffect(() => {
    const storage = getStorage();
    if (storage.lifestyle?.numerology) {
      setSavedResults(storage.lifestyle.numerology);
      // Pre-fill form with saved values
      if (storage.lifestyle.numerology.birthDate) {
        setBirthDate(storage.lifestyle.numerology.birthDate);
      }
      if (storage.lifestyle.numerology.fullName) {
        setFullName(storage.lifestyle.numerology.fullName);
      }
    }
  }, []);

  // Calculate numerology numbers
  const calculateNumbers = () => {
    setError('');
    
    // Validate inputs
    if (!birthDate) {
      setError('Please enter your birth date');
      return;
    }
    
    if (!fullName) {
      setError('Please enter your full name');
      return;
    }
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        // Calculate all numerology numbers
        const lifePathNumber = calculateLifePathNumber(birthDate);
        const destinyNumber = calculateDestinyNumber(fullName);
        const soulUrgeNumber = calculateSoulUrgeNumber(fullName);
        const personalityNumber = calculatePersonalityNumber(fullName);
        const birthdayNumber = calculateBirthdayNumber(birthDate);
        
        // Create results object
        const calculatedResults = {
          birthDate,
          fullName,
          lifePathNumber,
          destinyNumber,
          soulUrgeNumber,
          personalityNumber,
          birthdayNumber,
          timestamp: new Date().toISOString()
        };
        
        // Save results to state and storage
        setResults(calculatedResults);
        saveResults(calculatedResults);
        
        setIsCalculating(false);
      } catch (err) {
        setError('Error calculating numerology: ' + err.message);
        setIsCalculating(false);
      }
    }, 1500);
  };

  // Save results to storage
  const saveResults = (resultsData) => {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = {};
    }
    storage.lifestyle.numerology = resultsData;
    setStorage(storage);
    setSavedResults(resultsData);
  };

  // Clear results
  const clearResults = () => {
    const storage = getStorage();
    if (storage.lifestyle) {
      delete storage.lifestyle.numerology;
      setStorage(storage);
    }
    
    setResults(null);
    setSavedResults(null);
    setBirthDate('');
    setFullName('');
  };

  // Toggle expanded section
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get color classes for a number
  const getColorClasses = (number) => {
    const colors = getNumerologyColor(number);
    return {
      bg: `bg-${colors.light} dark:bg-${colors.main}/20`,
      border: `border-${colors.main}/30 dark:border-${colors.main}/40`,
      text: `text-${colors.main} dark:text-${colors.main}`,
      button: `bg-${colors.main} hover:bg-${colors.dark} dark:bg-${colors.main} dark:hover:bg-${colors.dark} text-white`
    };
  };

  // Current active results (either newly calculated or saved)
  const currentResults = results || savedResults;

  // If we have results, show them, otherwise show the calculator form
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <Calculator className="text-indigo-500 dark:text-indigo-400" size={24} />
            Numerology Calculator
          </h2>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Show information"
          >
            <Info size={18} />
          </button>
        </div>

        {showInfo && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-6 border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex justify-between items-start">
              <h3 className="text-indigo-800 dark:text-indigo-300 font-medium mb-2 flex items-center">
                <Info size={16} className="mr-2" />
                About Numerology
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 p-1 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              Numerology is the belief in the divine or mystical relationship between numbers and events. 
              It suggests that numbers have vibrational properties that can offer insights into your personality, 
              life purpose, and potential future events.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                <div className="flex items-center mb-1">
                  <Star className="text-indigo-500 dark:text-indigo-400 mr-2" size={14} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Life Path Number</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Calculated from your birth date. Represents your overall life purpose and the path you're destined to follow.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                <div className="flex items-center mb-1">
                  <FileText className="text-indigo-500 dark:text-indigo-400 mr-2" size={14} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Destiny Number</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Calculated from your full name. Represents your life's purpose and the talents you possess to fulfill that purpose.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                <div className="flex items-center mb-1">
                  <Heart className="text-indigo-500 dark:text-indigo-400 mr-2" size={14} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Soul Urge Number</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Calculated from the vowels in your name. Represents your inner desires, motivations, and what truly satisfies you.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800/40">
                <div className="flex items-center mb-1">
                  <User className="text-indigo-500 dark:text-indigo-400 mr-2" size={14} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Personality Number</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Calculated from the consonants in your name. Represents how others perceive you and your external personality.
                </p>
              </div>
            </div>
          </div>
        )}

        {!currentResults ? (
          // Calculator Form
          <div className="space-y-6">
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Birth Date
              </label>
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name (as given at birth)
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full birth name"
                className="w-full p-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <button
              onClick={calculateNumbers}
              disabled={isCalculating}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Your Numbers'}
            </button>
          </div>
        ) : (
          // Results Display
          <div className="space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 sm:p-6 rounded-xl">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Numerology Chart for {currentResults.fullName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDisplayDate(currentResults.birthDate)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                {/* Life Path Number */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Life Path</div>
                  <div className={`text-2xl font-bold text-${getNumerologyColor(currentResults.lifePathNumber).main}`}>
                    {currentResults.lifePathNumber}
                  </div>
                </div>
                
                {/* Destiny Number */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Destiny</div>
                  <div className={`text-2xl font-bold text-${getNumerologyColor(currentResults.destinyNumber).main}`}>
                    {currentResults.destinyNumber}
                  </div>
                </div>
                
                {/* Soul Urge Number */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Soul Urge</div>
                  <div className={`text-2xl font-bold text-${getNumerologyColor(currentResults.soulUrgeNumber).main}`}>
                    {currentResults.soulUrgeNumber}
                  </div>
                </div>
                
                {/* Personality Number */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Personality</div>
                  <div className={`text-2xl font-bold text-${getNumerologyColor(currentResults.personalityNumber).main}`}>
                    {currentResults.personalityNumber}
                  </div>
                </div>
                
                {/* Birthday Number */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Birthday</div>
                  <div className={`text-2xl font-bold text-${getNumerologyColor(currentResults.birthdayNumber).main}`}>
                    {currentResults.birthdayNumber}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detailed Interpretations */}
            <div className="space-y-4">
              {/* Life Path Section */}
              <div>
                <button
                  onClick={() => toggleSection('lifePath')}
                  className={`w-full flex justify-between items-center p-4 rounded-lg text-left ${
                    expandedSection === 'lifePath'
                      ? getColorClasses(currentResults.lifePathNumber).bg + ' ' + getColorClasses(currentResults.lifePathNumber).border
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Star className={`${getColorClasses(currentResults.lifePathNumber).text} mr-3`} size={20} />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        Life Path Number: <span className={getColorClasses(currentResults.lifePathNumber).text}>{currentResults.lifePathNumber}</span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getLifePathInterpretation(currentResults.lifePathNumber).title}
                      </p>
                    </div>
                  </div>
                  {expandedSection === 'lifePath' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSection === 'lifePath' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      {getLifePathInterpretation(currentResults.lifePathNumber).explanation}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Strengths</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {getLifePathInterpretation(currentResults.lifePathNumber).strengths}
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Challenges</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {getLifePathInterpretation(currentResults.lifePathNumber).challenges}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Career Paths</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getLifePathInterpretation(currentResults.lifePathNumber).career}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Destiny Section */}
              <div>
                <button
                  onClick={() => toggleSection('destiny')}
                  className={`w-full flex justify-between items-center p-4 rounded-lg text-left ${
                    expandedSection === 'destiny'
                      ? getColorClasses(currentResults.destinyNumber).bg + ' ' + getColorClasses(currentResults.destinyNumber).border
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <FileText className={`${getColorClasses(currentResults.destinyNumber).text} mr-3`} size={20} />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        Destiny Number: <span className={getColorClasses(currentResults.destinyNumber).text}>{currentResults.destinyNumber}</span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getDestinyInterpretation(currentResults.destinyNumber).title}
                      </p>
                    </div>
                  </div>
                  {expandedSection === 'destiny' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSection === 'destiny' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
                    <p className="text-slate-700 dark:text-slate-300">
                      {getDestinyInterpretation(currentResults.destinyNumber).message}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Soul Urge Section */}
              <div>
                <button
                  onClick={() => toggleSection('soulUrge')}
                  className={`w-full flex justify-between items-center p-4 rounded-lg text-left ${
                    expandedSection === 'soulUrge'
                      ? getColorClasses(currentResults.soulUrgeNumber).bg + ' ' + getColorClasses(currentResults.soulUrgeNumber).border
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Heart className={`${getColorClasses(currentResults.soulUrgeNumber).text} mr-3`} size={20} />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        Soul Urge Number: <span className={getColorClasses(currentResults.soulUrgeNumber).text}>{currentResults.soulUrgeNumber}</span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getSoulUrgeInterpretation(currentResults.soulUrgeNumber).title}
                      </p>
                    </div>
                  </div>
                  {expandedSection === 'soulUrge' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSection === 'soulUrge' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
                    <p className="text-slate-700 dark:text-slate-300">
                      {getSoulUrgeInterpretation(currentResults.soulUrgeNumber).message}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Personality Section */}
              <div>
                <button
                  onClick={() => toggleSection('personality')}
                  className={`w-full flex justify-between items-center p-4 rounded-lg text-left ${
                    expandedSection === 'personality'
                      ? getColorClasses(currentResults.personalityNumber).bg + ' ' + getColorClasses(currentResults.personalityNumber).border
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <User className={`${getColorClasses(currentResults.personalityNumber).text} mr-3`} size={20} />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        Personality Number: <span className={getColorClasses(currentResults.personalityNumber).text}>{currentResults.personalityNumber}</span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getPersonalityInterpretation(currentResults.personalityNumber).title}
                      </p>
                    </div>
                  </div>
                  {expandedSection === 'personality' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSection === 'personality' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
                    <p className="text-slate-700 dark:text-slate-300">
                      {getPersonalityInterpretation(currentResults.personalityNumber).message}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Birthday Section */}
              <div>
                <button
                  onClick={() => toggleSection('birthday')}
                  className={`w-full flex justify-between items-center p-4 rounded-lg text-left ${
                    expandedSection === 'birthday'
                      ? getColorClasses(currentResults.birthdayNumber).bg + ' ' + getColorClasses(currentResults.birthdayNumber).border
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Calendar className={`${getColorClasses(currentResults.birthdayNumber).text} mr-3`} size={20} />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-slate-200">
                        Birthday Number: <span className={getColorClasses(currentResults.birthdayNumber).text}>{currentResults.birthdayNumber}</span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getBirthdayInterpretation(currentResults.birthdayNumber).title}
                      </p>
                    </div>
                  </div>
                  {expandedSection === 'birthday' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {expandedSection === 'birthday' && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg mt-2">
                    <p className="text-slate-700 dark:text-slate-300">
                      {getBirthdayInterpretation(currentResults.birthdayNumber).message}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setBirthDate(currentResults.birthDate);
                  setFullName(currentResults.fullName);
                  setResults(null);
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Recalculate
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium flex items-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Clear Results
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Numerology Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Info className="text-indigo-500 dark:text-indigo-400" size={20} />
          Understanding Your Numerology Chart
        </h3>
        
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
          <p>
            Numerology provides a framework for understanding your life's purpose and potential. 
            Each number carries a specific vibration and meaning that can offer insights into different 
            aspects of your personality and life journey.
          </p>
          
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <Star className="text-indigo-500 dark:text-indigo-400 mr-2" size={16} />
                Life Path Number
              </h4>
              <p>
                Your Life Path Number is the most important number in your numerology chart. Calculated from your birth date,
                it reveals your life's purpose and the path you're destined to follow. It represents your innate traits,
                opportunities, and challenges throughout your life journey.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <FileText className="text-indigo-500 dark:text-indigo-400 mr-2" size={16} />
                Destiny/Expression Number
              </h4>
              <p>
                Your Destiny Number, calculated from all letters in your full birth name, reveals your talents,
                abilities, and the direction your life is meant to take. It represents how you express yourself
                and the goals you're meant to achieve during your lifetime.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <Heart className="text-indigo-500 dark:text-indigo-400 mr-2" size={16} />
                Soul Urge/Heart's Desire Number
              </h4>
              <p>
                Your Soul Urge Number, calculated from the vowels in your name, represents your inner cravings,
                motivations, and what truly makes you happy. It reveals your heart's true desires and what you
                value most deeply.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <User className="text-indigo-500 dark:text-indigo-400 mr-2" size={16} />
                Personality Number
              </h4>
              <p>
                Your Personality Number, calculated from the consonants in your name, reveals how others see you
                and your outer personality. It represents the parts of yourself that you're willing to share with
                the world and your approach to external situations.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                <Calendar className="text-indigo-500 dark:text-indigo-400 mr-2" size={16} />
                Birthday Number
              </h4>
              <p>
                Your Birthday Number represents a special talent or gift you possess. It gives additional insight
                into your personality and can indicate a particular ability or opportunity that can help you fulfill
                your Life Path.
              </p>
            </div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30 mt-6">
            <p className="text-sm italic">
              <strong>Note:</strong> Numerology is an ancient practice but is not scientifically validated. 
              Use these insights for personal reflection and self-discovery rather than as definitive predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumerologyCalculator;