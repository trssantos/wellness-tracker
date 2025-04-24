import React, { useState } from 'react';
import { Heart, Book, UserCheck, Info, Star, Copy, Share2, Bookmark, Brain, Briefcase, Users, Coffee, ThumbsUp, ThumbsDown, HeartHandshake, RefreshCw, FileText, ArrowLeft, Moon, Sun, Sparkles } from 'lucide-react';
import PersonalityQuiz from './PersonalityQuiz';
import PersonalityResults from './PersonalityResults';
import PersonalityTypeLibrary from './PersonalityTypeLibrary';
import { getStorage, setStorage } from '../../utils/storage';
import { personalityTypes } from '../../utils/personalityData';

const LifestyleSection = () => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [quizResults, setQuizResults] = useState(null);
  const [savedResults, setSavedResults] = useState(getSavedResults());
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  // Get saved personality results from storage
  function getSavedResults() {
    const storage = getStorage();
    if (!storage.lifestyle) {
      storage.lifestyle = { personalityResults: null };
      setStorage(storage);
    }
    return storage.lifestyle.personalityResults;
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
    // Return to dashboard after saving results
    setActiveScreen('dashboard');
  }

  // Handle completing a quiz
  const handleQuizComplete = (results) => {
    setQuizResults(results);
    saveResults(results);
  };

  // Reset saved results
  const clearSavedResults = () => {
    saveResults(null);
    setQuizResults(null);
  };

  // Handle clicking on the personality card to show detailed results
  const handleShowDetailedResults = () => {
    setShowDetailedResults(true);
  };

  // Determine current personality type
  const currentType = (quizResults || savedResults)?.type;
  const currentResults = quizResults || savedResults;

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

      case 'library':
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

      case 'dashboard':
      default:
        // If detailed results should be shown
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
            Explore your personality traits, discover compatible types, and learn more about what makes you unique.
          </p>
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
              onClick={handleShowDetailedResults}
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
                onClick={() => setActiveScreen('library')}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium flex items-center"
              >
                <FileText size={16} className="mr-2" />
                Explore All Types
              </button>
            </div>
          </div>
        )}

        {/* Personality features grid */}
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
                onClick={() => setActiveScreen('library')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium"
              >
                Browse All Types
              </button>
            </div>
          </div>
          
          {/* Zodiac Card (placeholder) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors h-full">
            <div className="flex items-center mb-4">
              <Star className="text-amber-500 dark:text-amber-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3">
                Zodiac Signs
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Explore astrological signs and how they might relate to personality and compatibility.
            </p>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
              {/* Zodiac sign icons (placeholders) */}
              {['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((sign, index) => (
                <div 
                  key={index}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3 flex items-center justify-center text-amber-700 dark:text-amber-300 text-xl cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-800/40"
                >
                  {sign}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg text-sm font-medium">
                Coming Soon
              </button>
            </div>
          </div>
          
          {/* Biorhythm Card (placeholder) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors h-full">
            <div className="flex items-center mb-4">
              <Moon className="text-blue-500 dark:text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3">
                Biorhythm Tracker
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Track your physical, emotional, and intellectual cycles to find your optimal days.
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
                            className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"
                            style={{ marginTop: `${Math.sin(i * 1.5) * 20}px` }}
                          ></div>
                          <div 
                            className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 mt-2"
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
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                Coming Soon
              </button>
            </div>
          </div>
          
          {/* Life Path Number Card (placeholder) */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors h-full">
            <div className="flex items-center mb-4">
              <Sparkles className="text-indigo-500 dark:text-indigo-400" size={24} />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 ml-3">
                Numerology
              </h3>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Calculate your life path number and discover its meaning for your personality and life journey.
            </p>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <div 
                    key={num}
                    className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center text-lg font-bold text-indigo-700 dark:text-indigo-300"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                Coming Soon
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