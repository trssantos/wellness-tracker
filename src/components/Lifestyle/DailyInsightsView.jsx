import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, BarChart2, Activity, Heart, Brain, Star, Calculator, RefreshCw, Info, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, ArrowRight, Moon, Zap } from 'lucide-react';
import { getDailyTransitAdvice } from '../../utils/transitUtils';
import { getStorage } from '../../utils/storage';
import { formatDateForStorage } from '../../utils/dateUtils';

const DailyInsightsView = ({ onBack }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState({
    physical: true,
    emotional: true,
    intellectual: true,
    zodiac: false,
    numerology: false,
    astrology: false
  });
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    generateInsights(selectedDate);
  }, [selectedDate]);
  
  const generateInsights = (date) => {
    setLoading(true);
    // Get birth date from storage
    const storage = getStorage();
    const birthDate = storage.lifestyle?.birthDate;
    
    if (!birthDate) {
      setError("Birth date not found. Please set your birth date in the Zodiac or Biorhythm sections first.");
      setLoading(false);
      return;
    }
    
    try {
      // Generate insights for the selected date
      const dailyInsights = getDailyTransitAdvice(birthDate, date);
      if (dailyInsights.success) {
        setInsights(dailyInsights);
        setError(null);
      } else {
        setError(dailyInsights.error || "Failed to generate insights");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Navigate to different dates
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    setSelectedDate(nextDay);
  };
  
  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(selectedDate.getDate() - 1);
    setSelectedDate(previousDay);
  };
  
  // Format date for display
  const formatSelectedDate = (dateObj) => {
    return dateObj.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Check if selected date is today
  const isToday = formatDateForStorage(selectedDate) === formatDateForStorage(new Date());
  
  // Color mappings for different elements
  const getBiorhythmColor = (type) => {
    switch (type) {
      case 'physical':
        return { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/40', text: 'text-red-700 dark:text-red-400' };
      case 'emotional':
        return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/40', text: 'text-blue-700 dark:text-blue-400' };
      case 'intellectual':
        return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800/40', text: 'text-green-700 dark:text-green-400' };
      default:
        return { bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300' };
    }
  };
  
  const getEnergyLevelStyle = (level) => {
    // For positive values (above 0)
    if (level > 70) {
      return { label: 'Very High', color: 'text-green-600 dark:text-green-400' };
    } else if (level > 30) {
      return { label: 'High', color: 'text-green-600 dark:text-green-400' };
    } else if (level > 0) {
      return { label: 'Above Average', color: 'text-green-600 dark:text-green-400' };
    } 
    // For zero or critical days
    else if (Math.abs(level) <= 5) {
      return { label: 'Critical Day', color: 'text-yellow-600 dark:text-yellow-400' };
    } 
    // For negative values (below 0)
    else if (level > -30) {
      return { label: 'Below Average', color: 'text-amber-600 dark:text-amber-400' };
    } else if (level > -70) {
      return { label: 'Low', color: 'text-orange-600 dark:text-orange-400' };
    } else {
      return { label: 'Very Low', color: 'text-red-600 dark:text-red-400' };
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Generating your daily insights...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800/30 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Error generating insights</p>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!insights) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>
        
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">No insights available.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 transition-colors">
              Daily Insights
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Show information"
            >
              <Info size={18} />
            </button>
            <button
              onClick={() => generateInsights(selectedDate)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              aria-label="Refresh insights"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
        
        {showInfo && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6 border border-purple-100 dark:border-purple-800/30">
            <h3 className="text-purple-800 dark:text-purple-300 font-medium mb-2">About Daily Insights</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              This view combines biorhythm data, zodiac influences, and numerology to provide a holistic picture 
              of your daily energetic patterns. It offers personalized guidance based on these different systems 
              to help you make the most of each day.
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li className="flex items-start gap-2">
                <Activity className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <span><strong>Physical biorhythm</strong> affects your energy, strength, coordination, and endurance</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                <span><strong>Emotional biorhythm</strong> influences your feelings, sensitivity, mood, and creativity</span>
              </li>
              <li className="flex items-start gap-2">
                <Brain className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" size={16} />
                <span><strong>Intellectual biorhythm</strong> affects your mental clarity, memory, and analytical abilities</span>
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={16} />
                <span><strong>Universal day number</strong> sets the numerological theme and energy of the day</span>
              </li>
            </ul>
          </div>
        )}
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
              {isToday ? 'Today' : formatSelectedDate(selectedDate)}
            </h3>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Go to Today
              </button>
            )}
          </div>
          
          <button
            onClick={goToNextDay}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
          >
            <ArrowRight size={20} />
          </button>
        </div>
        
        {/* Daily Theme Banner */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">
            Today's Theme: <span className="text-purple-600 dark:text-purple-400">{insights.insights.theme}</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="text-red-500 dark:text-red-400" size={18} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Physical</span>
                <span className={`text-xs ${getEnergyLevelStyle(insights.insights.physical.level).color}`}>
                  {getEnergyLevelStyle(insights.insights.physical.level).label}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${insights.insights.physical.level > 0 ? 'bg-red-500' : 'bg-red-300 dark:bg-red-800'}`}
                  style={{ width: `${Math.abs(insights.insights.physical.level)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="text-blue-500 dark:text-blue-400" size={18} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Emotional</span>
                <span className={`text-xs ${getEnergyLevelStyle(insights.insights.emotional.level).color}`}>
                  {getEnergyLevelStyle(insights.insights.emotional.level).label}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${insights.insights.emotional.level > 0 ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-800'}`}
                  style={{ width: `${Math.abs(insights.insights.emotional.level)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="text-green-500 dark:text-green-400" size={18} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Intellectual</span>
                <span className={`text-xs ${getEnergyLevelStyle(insights.insights.intellectual.level).color}`}>
                  {getEnergyLevelStyle(insights.insights.intellectual.level).label}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${insights.insights.intellectual.level > 0 ? 'bg-green-500' : 'bg-green-300 dark:bg-green-800'}`}
                  style={{ width: `${Math.abs(insights.insights.intellectual.level)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Optimal Activities and Cautions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-3 flex items-center">
              <CheckCircle className="text-green-500 dark:text-green-400 mr-2" size={20} />
              Optimal Activities
            </h3>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {insights.insights.optimalActivities.map((activity, index) => (
                <li 
                  key={`activity-${index}`}
                  className="flex items-start gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{activity}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-4">
            <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 mb-3 flex items-center">
              <AlertTriangle className="text-amber-500 dark:text-amber-400 mr-2" size={20} />
              Use Caution With
            </h3>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {insights.insights.cautionAreas.map((caution, index) => (
                <li 
                  key={`caution-${index}`}
                  className="flex items-start gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{caution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Detailed Sections */}
        <div className="space-y-4">
          {/* Physical Dimension */}
          <div className={`border ${getBiorhythmColor('physical').border} rounded-lg overflow-hidden`}>
            <button
              onClick={() => toggleSection('physical')}
              className={`w-full flex items-center justify-between p-4 text-left ${expandedSections.physical ? getBiorhythmColor('physical').bg : 'bg-white dark:bg-slate-800'}`}
            >
              <div className="flex items-center">
                <Activity className="text-red-500 dark:text-red-400 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Physical Energy
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {insights.insights.physical.level}% - {getEnergyLevelStyle(insights.insights.physical.level).label}
                  </p>
                </div>
              </div>
              {expandedSections.physical ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.physical && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  {insights.insights.physical.description}
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-red-700 dark:text-red-400">Advice:</strong> {insights.insights.physical.advice}
                </div>
              </div>
            )}
          </div>
          
          {/* Emotional Dimension */}
          <div className={`border ${getBiorhythmColor('emotional').border} rounded-lg overflow-hidden`}>
            <button
              onClick={() => toggleSection('emotional')}
              className={`w-full flex items-center justify-between p-4 text-left ${expandedSections.emotional ? getBiorhythmColor('emotional').bg : 'bg-white dark:bg-slate-800'}`}
            >
              <div className="flex items-center">
                <Heart className="text-blue-500 dark:text-blue-400 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Emotional Energy
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {insights.insights.emotional.level}% - {getEnergyLevelStyle(insights.insights.emotional.level).label}
                  </p>
                </div>
              </div>
              {expandedSections.emotional ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.emotional && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  {insights.insights.emotional.description}
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-blue-700 dark:text-blue-400">Advice:</strong> {insights.insights.emotional.advice}
                </div>
              </div>
            )}
          </div>
          
          {/* Intellectual Dimension */}
          <div className={`border ${getBiorhythmColor('intellectual').border} rounded-lg overflow-hidden`}>
            <button
              onClick={() => toggleSection('intellectual')}
              className={`w-full flex items-center justify-between p-4 text-left ${expandedSections.intellectual ? getBiorhythmColor('intellectual').bg : 'bg-white dark:bg-slate-800'}`}
            >
              <div className="flex items-center">
                <Brain className="text-green-500 dark:text-green-400 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Intellectual Energy
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {insights.insights.intellectual.level}% - {getEnergyLevelStyle(insights.insights.intellectual.level).label}
                  </p>
                </div>
              </div>
              {expandedSections.intellectual ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.intellectual && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  {insights.insights.intellectual.description}
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300">
                  <strong className="text-green-700 dark:text-green-400">Advice:</strong> {insights.insights.intellectual.advice}
                </div>
              </div>
            )}
          </div>
          
          {/* Zodiac Influence */}
          <div className={`border border-amber-200 dark:border-amber-800/40 rounded-lg overflow-hidden`}>
            <button
              onClick={() => toggleSection('zodiac')}
              className={`w-full flex items-center justify-between p-4 text-left ${expandedSections.zodiac ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-white dark:bg-slate-800'}`}
            >
              <div className="flex items-center">
                <Star className="text-amber-500 dark:text-amber-400 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Zodiac Influence: {insights.insights.zodiac.sign.charAt(0).toUpperCase() + insights.insights.zodiac.sign.slice(1)}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {insights.insights.zodiac.element} element • {insights.insights.zodiac.monthlyTheme} focus
                  </p>
                </div>
              </div>
              {expandedSections.zodiac ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.zodiac && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  {insights.insights.zodiac.advice}
                </p>
              </div>
            )}
          </div>
          
          {/* Numerology Influence */}
          <div className={`border border-indigo-200 dark:border-indigo-800/40 rounded-lg overflow-hidden`}>
            <button
              onClick={() => toggleSection('numerology')}
              className={`w-full flex items-center justify-between p-4 text-left ${expandedSections.numerology ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-800'}`}
            >
              <div className="flex items-center">
                <Calculator className="text-indigo-500 dark:text-indigo-400 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Universal Day: {insights.insights.numerology.universalDay}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {insights.insights.numerology.theme}
                  </p>
                </div>
              </div>
              {expandedSections.numerology ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.numerology && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Recommended Activities</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {insights.insights.numerology.recommendedActivities}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Best to Avoid</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {insights.insights.numerology.avoidToday}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Astrological Influences */}
          <div className={`border border-purple-200 dark:border-purple-800/40 rounded-lg overflow-hidden`}>
            <button
              onClick={() => toggleSection('astrology')}
              className={`w-full flex items-center justify-between p-4 text-left ${expandedSections.astrology ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-white dark:bg-slate-800'}`}
            >
              <div className="flex items-center">
                <Moon className="text-purple-500 dark:text-purple-400 mr-3" size={20} />
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Astrological Influences
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Moon Phase: {insights.insights.astrology.moonPhase} • 
                    Mercury: {insights.insights.astrology.mercuryRetrograde ? 'Retrograde' : 'Direct'}
                  </p>
                </div>
              </div>
              {expandedSections.astrology ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            
            {expandedSections.astrology && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                      <Moon className="text-purple-500 dark:text-purple-400 mr-2" size={16} />
                      Moon Phase
                    </h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                      <span className="font-medium">Energy:</span> {insights.insights.astrology.moonEnergy}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Activities:</span> {insights.insights.astrology.moonAdvice}
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                      <Zap className={insights.insights.astrology.mercuryRetrograde ? "text-amber-500 dark:text-amber-400" : "text-green-500 dark:text-green-400"} size={16} />
                      Mercury {insights.insights.astrology.mercuryRetrograde ? 'Retrograde' : 'Direct'}
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {insights.insights.astrology.mercuryAdvice}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* How to Apply Insights Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          How to Apply These Insights
        </h3>
        
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
          <p>
            These daily insights offer guidance based on your personal rhythms and cosmic influences. 
            To make the most of this information:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">
                For High-Energy Days
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Schedule important activities aligned with your peak dimensions</li>
                <li>Take on more challenging tasks in areas of strength</li>
                <li>Use your natural energy flow rather than fighting against it</li>
                <li>Set ambitious goals that align with the day's theme</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">
                For Low-Energy Days
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Focus on lighter activities in low-energy dimensions</li>
                <li>Practice self-care appropriate to the affected areas</li>
                <li>Be more cautious and double-check your work</li>
                <li>Reorganize your schedule if possible to better match your energy</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">
                For Critical Days (Near Zero)
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Take extra precautions in the affected dimension</li>
                <li>Avoid major decisions or activities in this area if possible</li>
                <li>Use these transition points for reflection and planning</li>
                <li>Be aware that energy is shifting, which can create instability</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">
                Working With Multiple Influences
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>When influences conflict, prioritize biorhythm data for physical activities</li>
                <li>For emotional matters, blend biorhythm with moon phase guidance</li>
                <li>For mental work and decisions, combine intellectual biorhythm with universal day</li>
                <li>Consider zodiac insights for your overall approach to the day</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mt-4">
            <h4 className="text-base font-medium text-purple-700 dark:text-purple-300 mb-2">
              Remember
            </h4>
            <p>
              These insights are tools to help you optimize your day, not rigid limitations. 
              Your awareness and free will always take precedence. Use this information to 
              make conscious choices that work with your natural rhythms rather than against them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyInsightsView;