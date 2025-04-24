// src/components/Lifestyle/LifestyleSection.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Book, UserCheck, Info, Star, Copy, Share2, Bookmark, Brain, Briefcase, Users, Coffee, ThumbsUp, ThumbsDown, HeartHandshake, RefreshCw, FileText, ArrowLeft, Moon, Sun, Sparkles, Calendar, BarChart2, Calculator, Lightbulb, Compass, Clock } from 'lucide-react';
import PersonalityQuiz from './PersonalityQuiz';
import PersonalityResults from './PersonalityResults';
import PersonalityTypeLibrary from './PersonalityTypeLibrary';
import ZodiacDateSelector from './ZodiacDateSelector';
import ZodiacResults from './ZodiacResults';
import ZodiacLibrary from './ZodiacLibrary';
import BiorhythmTracker from './BiorhythmTracker';
import NumerologyCalculator from './NumerologyCalculator';
import LifeTimelineView from './LifeTimelineView';
import DailyInsightsView from './DailyInsightsView';
import { getStorage, setStorage } from '../../utils/storage';
import { personalityTypes } from '../../utils/personalityData';
import { zodiacSigns, getZodiacSign } from '../../utils/zodiacData';

const LifestyleSection = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [quizResults, setQuizResults] = useState(null);
  const [savedResults, setSavedResults] = useState(getSavedResults());
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  
  // Zodiac state
  const [zodiacResults, setZodiacResults] = useState(null);
  const [savedZodiacResults, setSavedZodiacResults] = useState(getSavedZodiacResults());
  const [showDetailedZodiacResults, setShowDetailedZodiacResults] = useState(false);

  // Get saved personality results from storage
  function getSavedResults() {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = { personalityResults: null };
      setStorage(storage);
    }
    return storage.lifestyle.personalityResults;
  }

  useEffect(() => {
    // Scroll to top when activeScreen changes
    window.scrollTo(0, 0);
  }, [activeScreen]);

  // Get saved zodiac results from storage
  function getSavedZodiacResults() {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = { zodiacSign: null };
      setStorage(storage);
    } else if (storage.lifestyle.birthDate && !storage.lifestyle.zodiacSign) {
      // If we have a birth date but no zodiac sign data, create it
      const sign = getZodiacSign(new Date(storage.lifestyle.birthDate));
      if (sign) {
        storage.lifestyle.zodiacSign = sign;
        storage.lifestyle.zodiacTimestamp = new Date().toISOString();
        setStorage(storage);
      }
    }
    
    if (storage.lifestyle.birthDate && storage.lifestyle.zodiacSign) {
      return {
        birthDate: storage.lifestyle.birthDate,
        sign: storage.lifestyle.zodiacSign,
        signData: zodiacSigns[storage.lifestyle.zodiacSign],
        timestamp: storage.lifestyle.zodiacTimestamp || new Date().toISOString()
      };
    }
    
    return null;
  }

  // Get saved numerology results
  function getSavedNumerologyResults() {
    const storage = getStorage();
    return storage.lifestyle?.numerology || null;
  }

  // Check if birth date is available
  function hasBirthDate() {
    const storage = getStorage();
    return !!storage.lifestyle?.birthDate;
  }

  // Save personality results to storage
  function saveResults(results) {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = {};
    }
    storage.lifestyle.personalityResults = results;
    setStorage(storage);
    setSavedResults(results);
  }

  // Save zodiac results to storage
  function saveZodiacResults(results) {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = {};
    }
    
    storage.lifestyle.birthDate = results.birthDate;
    storage.lifestyle.zodiacSign = results.sign;
    storage.lifestyle.zodiacTimestamp = results.timestamp;
    
    setStorage(storage);
    setSavedZodiacResults(results);
  }

  // Handle completing a personality quiz
  const handleQuizComplete = (results) => {
    setQuizResults(results);
    saveResults(results);
    // Return to dashboard after saving results
    setActiveScreen('dashboard');
  };
  
  // Handle completing zodiac date entry
  const handleZodiacComplete = (results) => {
    setZodiacResults(results);
    saveZodiacResults(results);
    // Return to dashboard after saving results
    setActiveScreen('dashboard');
  };

  // Reset saved personality results
  const clearSavedResults = () => {
    saveResults(null);
    setQuizResults(null);
    setShowDetailedResults(false);
  };
  
  // Reset saved zodiac results
  const clearSavedZodiacResults = () => {
    const storage = getStorage();
    if (storage.lifestyle) {
      delete storage.lifestyle.birthDate;
      delete storage.lifestyle.zodiacSign;
      delete storage.lifestyle.zodiacTimestamp;
      setStorage(storage);
    }
    
    setZodiacResults(null);
    setSavedZodiacResults(null);
    setShowDetailedZodiacResults(false);
  };

  // Determine current personality type and zodiac sign
  const currentType = (quizResults || savedResults)?.type;
  const currentResults = quizResults || savedResults;
  
  const currentZodiacSign = (zodiacResults || savedZodiacResults)?.sign;
  const currentZodiacResults = zodiacResults || savedZodiacResults;
  
  // Check if numerology results exist
  const numerologyResults = getSavedNumerologyResults();
  const hasNumerologyResults = !!numerologyResults;
  const hasBirthDateInfo = hasBirthDate();

  // Render different screens based on active state
  const renderScreen = () => {
    switch (activeScreen) {
      case 'quiz':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveScreen('dashboard')}
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </button>
            <PersonalityQuiz 
              onComplete={handleQuizComplete} 
              onCancel={() => setActiveScreen('dashboard')}
            />
          </div>
        );

      case 'zodiac-selector':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveScreen('dashboard')}
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </button>
            <ZodiacDateSelector 
              onComplete={handleZodiacComplete} 
              onCancel={() => setActiveScreen('dashboard')}
            />
          </div>
        );

      case 'personality-library':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveScreen('dashboard')}
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </button>
            <PersonalityTypeLibrary 
              personalityTypes={personalityTypes}
              onClose={() => setActiveScreen('dashboard')}
              currentType={currentType}
            />
          </div>
        );

      case 'zodiac-library':
        return (
          <div className="space-y-4">
            <ZodiacLibrary 
              onBack={() => setActiveScreen('dashboard')}
              onSelectSign={(sign) => {
                // If we wanted to do something with the selected sign
              }}
            />
          </div>
        );

      case 'biorhythm-tracker':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveScreen('dashboard')}
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </button>
            <BiorhythmTracker />
          </div>
        );
        
      case 'numerology-calculator':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveScreen('dashboard')}
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </button>
            <NumerologyCalculator />
          </div>
        );

      case 'life-timeline':
        return (
          <LifeTimelineView 
            birthDate={hasBirthDateInfo ? getStorage().lifestyle.birthDate : null}
            onBack={() => setActiveScreen('dashboard')}
          />
        );

      case 'daily-insights':
        return (
          <DailyInsightsView 
            onBack={() => setActiveScreen('dashboard')}
          />
        );

      case 'dashboard':
      default:
        // If detailed personality results should be shown
        if (showDetailedResults && currentResults) {
          return (
            <div className="space-y-4">
              <button 
                onClick={() => setShowDetailedResults(false)}
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
              </button>
              <PersonalityResults 
                results={currentResults} 
                onReset={() => {
                  clearSavedResults();
                  setShowDetailedResults(false);
                }}
                onRetake={() => {
                  setShowDetailedResults(false);
                  setActiveScreen('quiz');
                }}
              />
            </div>
          );
        }
        
        // If detailed zodiac results should be shown
        if (showDetailedZodiacResults && currentZodiacResults) {
          return (
            <div className="space-y-4">
              <button 
                onClick={() => setShowDetailedZodiacResults(false)}
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
              </button>
              <ZodiacResults 
                results={currentZodiacResults} 
                onReset={() => {
                  clearSavedZodiacResults();
                  setShowDetailedZodiacResults(false);
                }}
                onRetake={() => {
                  setShowDetailedZodiacResults(false);
                  setActiveScreen('zodiac-selector');
                }}
                onViewLibrary={() => {
                  setShowDetailedZodiacResults(false);
                  setActiveScreen('zodiac-library');
                }}
              />
            </div>
          );
        }
        
        // Otherwise show the dashboard
        return renderDashboard();
    }
  };

  // Dashboard layout
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
            <Heart className="text-red-500 dark:text-red-400" size={28} />
            Lifestyle Dashboard
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-2 transition-colors">
            Explore your personality traits, discover your zodiac sign, track your biorhythms, calculate your numerology numbers, and learn more about what makes you unique.
          </p>
        </div>

        {/* NEW: Daily Insights Feature */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl shadow-sm p-6 border border-purple-100 dark:border-purple-800/30 transition-colors">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2 transition-colors">
                <Lightbulb className="text-amber-500 dark:text-amber-400" size={24} />
                Daily Insights
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Get personalized guidance combining your biorhythm data with zodiac transits for optimal daily planning.
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mt-3">
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400 mr-1"></div>
                  Physical Energy
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-1"></div>
                  Emotional Balance
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-1"></div>
                  Mental Clarity
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 mr-1"></div>
                  Cosmic Influences
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => setActiveScreen('daily-insights')}
              className={`px-6 py-3 rounded-lg font-medium ${
                hasBirthDateInfo
                  ? 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
              disabled={!hasBirthDateInfo}
            >
              {hasBirthDateInfo ? 'View Today\'s Insights' : 'Set Birth Date First'}
            </button>
          </div>
          
          {!hasBirthDateInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-4 text-sm text-blue-600 dark:text-blue-400">
              <Info className="inline-block mr-1" size={16} />
              Set your birth date in the Zodiac or Biorhythm sections to use Daily Insights.
            </div>
          )}
        </div>

        {/* NEW: Life Timeline Feature */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl shadow-sm p-6 border border-indigo-100 dark:border-indigo-800/30 transition-colors">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2 transition-colors">
                <Clock className="text-indigo-500 dark:text-indigo-400" size={24} />
                Life Timeline
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Discover the significant periods of your life based on numerology cycles and astrological transits.
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mt-3">
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400 mr-1"></div>
                  Personal Year Cycles
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-1"></div>
                  Major Life Transitions
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 mr-1"></div>
                  Life Path Periods
                </li>
                <li className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-1"></div>
                  Significant Years
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => setActiveScreen('life-timeline')}
              className={`px-6 py-3 rounded-lg font-medium ${
                hasBirthDateInfo
                  ? 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
              disabled={!hasBirthDateInfo}
            >
              {hasBirthDateInfo ? 'View Your Timeline' : 'Set Birth Date First'}
            </button>
          </div>
          
          {!hasBirthDateInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-4 text-sm text-blue-600 dark:text-blue-400">
              <Info className="inline-block mr-1" size={16} />
              Set your birth date in the Zodiac or Biorhythm sections to view your Life Timeline.
            </div>
          )}
        </div>

        {/* Current Personality Results (if available) */}
        {currentResults && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
              <Brain className="text-purple-500 dark:text-purple-400" size={24} />
              Your Personality Profile
            </h2>
            
            <div 
              className="bg-purple-50 dark:bg-purple-900/30 p-4 sm:p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 mb-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800/40 transition-colors"
              onClick={() => setShowDetailedResults(true)}
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-purple-200 dark:border-purple-700 shadow-sm">
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{currentType}</span>
                </div>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 break-words">
                  {personalityTypes[currentType].name}
                </h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm break-words">
                  {personalityTypes[currentType].description}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 italic">Click to view detailed results →</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveScreen('quiz')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Retake Quiz
              </button>
              
              <button
                onClick={clearSavedResults}
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
              
              <button
                onClick={() => setActiveScreen('personality-library')}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium flex items-center"
              >
                <FileText size={16} className="mr-2" />
                Explore All Types
              </button>
            </div>
          </div>
        )}

        {/* Current Zodiac Results (if available) */}
        {currentZodiacResults && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
              <Star className="text-amber-500 dark:text-amber-400" size={24} />
              Your Zodiac Profile
            </h2>
            
            <div 
              className="bg-amber-50 dark:bg-amber-900/30 p-4 sm:p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 mb-4 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-800/40 transition-colors"
              onClick={() => setShowDetailedZodiacResults(true)}
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-amber-200 dark:border-amber-700 shadow-sm">
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400" dangerouslySetInnerHTML={{ __html: zodiacSigns[currentZodiacSign].symbol }}></span>
                </div>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 break-words">
                  {zodiacSigns[currentZodiacSign].name}
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-1 break-words">
                  {zodiacSigns[currentZodiacSign].dates}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm break-words">
                  {zodiacSigns[currentZodiacSign].description}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">Click to view detailed profile →</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveScreen('zodiac-selector')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center"
              >
                <Calendar size={16} className="mr-2" />
                Update Birth Date
              </button>
              
              <button
                onClick={clearSavedZodiacResults}
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
              
              <button
                onClick={() => setActiveScreen('zodiac-library')}
                className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium flex items-center"
              >
                <FileText size={16} className="mr-2" />
                Explore All Signs
              </button>
            </div>
          </div>
        )}

        {/* Numerology Summary (if available) */}
        {hasNumerologyResults && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
              <Calculator className="text-indigo-500 dark:text-indigo-400" size={24} />
              Your Numerology Chart
            </h2>
            
            <div 
              className="bg-indigo-50 dark:bg-indigo-900/30 p-4 sm:p-6 rounded-xl mb-4 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
              onClick={() => setActiveScreen('numerology-calculator')}
            >
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 break-words">
                  {numerologyResults.fullName}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Life Path</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {numerologyResults.lifePathNumber}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Destiny</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {numerologyResults.destinyNumber}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Soul Urge</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {numerologyResults.soulUrgeNumber}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Personality</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {numerologyResults.personalityNumber}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Birthday</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {numerologyResults.birthdayNumber}
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-4 text-center italic">Click to view detailed numerology chart →</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveScreen('numerology-calculator')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Update Numerology
              </button>
            </div>
          </div>
        )}

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personality Quiz Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors h-full">
            <div className="flex items-center mb-4">
              <Brain className="text-purple-500 dark:text-purple-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3">
                16 Personalities
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {currentResults 
                ? "Want to learn more about your personality type and how it compares to others?"
                : "Discover your personality type based on the Myers-Briggs Type Indicator (MBTI)."}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveScreen('quiz')}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                {currentResults ? "Retake Test" : "Take Personality Test"}
              </button>
              
              <button
                onClick={() => setActiveScreen('personality-library')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium"
              >
                Browse All Types
              </button>
            </div>
          </div>
          
          {/* Zodiac Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors h-full">
            <div className="flex items-center mb-4">
              <Star className="text-amber-500 dark:text-amber-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3">
                Zodiac Signs
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {currentZodiacResults
                ? `Explore how your ${zodiacSigns[currentZodiacSign].name} sign influences different aspects of your life.`
                : "Discover your zodiac sign and learn how celestial forces might influence your personality and life."}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveScreen('zodiac-selector')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
              >
                {currentZodiacResults ? "Update Birth Date" : "Find Your Sign"}
              </button>
              
              <button
                onClick={() => setActiveScreen('zodiac-library')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium"
              >
                Explore All Signs
              </button>
            </div>
          </div>
          
          {/* Biorhythm Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors h-full">
            <div className="flex items-center mb-4">
              <BarChart2 className="text-blue-500 dark:text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3">
                Biorhythm Tracker
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Track your physical, emotional, and intellectual cycles to find your optimal days for different activities.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 mb-6">
              <div className="h-24 flex items-center justify-center">
                <div className="w-full h-16 relative">
                  {/* Placeholder for biorhythm waves */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-blue-200 dark:bg-blue-700"></div>
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-full">
                    <div className="w-full h-full flex justify-between items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-full flex flex-col justify-center">
                          <div 
                            className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"
                            style={{ marginTop: `${Math.sin(i * 1.5) * 20}px` }}
                          ></div>
                          <div 
                            className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2"
                            style={{ marginTop: `${Math.cos(i * 1.2) * 15}px` }}
                          ></div>
                          <div 
                            className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mt-2"
                            style={{ marginTop: `${Math.sin(i * 0.8 + 2) * 18}px` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setActiveScreen('biorhythm-tracker')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                Open Biorhythm Tracker
              </button>
            </div>
          </div>
          
          {/* Numerology Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors h-full">
            <div className="flex items-center mb-4">
              <Calculator className="text-indigo-500 dark:text-indigo-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3">
                Numerology
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {hasNumerologyResults
                ? "View your full numerology chart and discover what your numbers reveal about your life path."
                : "Calculate your life path number and discover its meaning for your personality and life journey."}
            </p>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div 
                    key={num}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-base font-bold text-indigo-700 dark:text-indigo-300"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setActiveScreen('numerology-calculator')}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                {hasNumerologyResults ? "View Your Numerology Chart" : "Calculate Your Numbers"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Why Take Personality Quizzes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
            <Info className="text-blue-500 dark:text-blue-400" size={24} />
            Why Explore Your Personality?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                <UserCheck size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300">
                  Self-awareness
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Understand your personality traits, strengths, and areas for growth
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg text-green-600 dark:text-green-400">
                <Briefcase size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300">
                  Career insights
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Discover careers and work environments where you might thrive
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                <Users size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300">
                  Better relationships
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Learn how to better communicate and connect with different personality types
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <Book size={20} />
              </div>
              <div>
                <h4 className="font-medium text-slate-700 dark:text-slate-300">
                  Personal growth
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Find personalized strategies for development based on your unique traits
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderScreen();
};

export default LifestyleSection;