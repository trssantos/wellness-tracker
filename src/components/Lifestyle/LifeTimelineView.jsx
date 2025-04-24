import React, { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Clock, Calendar, Sparkles } from 'lucide-react';
import { generateLifeTimeline } from '../../utils/timelineUtils';
import { getStorage, setStorage } from '../../utils/storage';

const LifeTimelineView = ({ birthDate, onBack }) => {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearsToShow, setYearsToShow] = useState(10);
  const [expandedPeriods, setExpandedPeriods] = useState({});
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    if (birthDate) {
      try {
        setLoading(true);
        // Generate timeline data
        const timelineData = generateLifeTimeline(birthDate, yearsToShow);
        if (timelineData.success) {
          setTimeline(timelineData);
          setError(null);
        } else {
          setError(timelineData.error || "Failed to generate timeline");
        }
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Birth date is required to generate a timeline");
      setLoading(false);
    }
  }, [birthDate, yearsToShow]);
  
  const togglePeriod = (periodId) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [periodId]: !prev[periodId]
    }));
  };
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Format birthday to display
  const formatBirthday = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Color mapping for different types of years
  const getYearColor = (personalYear) => {
    const colors = {
      1: 'bg-red-500 dark:bg-red-600',
      2: 'bg-blue-500 dark:bg-blue-600',
      3: 'bg-yellow-500 dark:bg-yellow-600',
      4: 'bg-green-500 dark:bg-green-600',
      5: 'bg-orange-500 dark:bg-orange-600',
      6: 'bg-pink-500 dark:bg-pink-600',
      7: 'bg-purple-500 dark:bg-purple-600',
      8: 'bg-indigo-500 dark:bg-indigo-600',
      9: 'bg-teal-500 dark:bg-teal-600'
    };
    
    return colors[personalYear] || 'bg-slate-500 dark:bg-slate-600';
  };
  
  const getYearTextColor = (personalYear) => {
    const colors = {
      1: 'text-red-600 dark:text-red-400',
      2: 'text-blue-600 dark:text-blue-400',
      3: 'text-yellow-600 dark:text-yellow-400',
      4: 'text-green-600 dark:text-green-400',
      5: 'text-orange-600 dark:text-orange-400',
      6: 'text-pink-600 dark:text-pink-400',
      7: 'text-purple-600 dark:text-purple-400',
      8: 'text-indigo-600 dark:text-indigo-400',
      9: 'text-teal-600 dark:text-teal-400'
    };
    
    return colors[personalYear] || 'text-slate-600 dark:text-slate-400';
  };
  
  const getYearBgColor = (personalYear) => {
    const colors = {
      1: 'bg-red-50 dark:bg-red-900/20',
      2: 'bg-blue-50 dark:bg-blue-900/20',
      3: 'bg-yellow-50 dark:bg-yellow-900/20',
      4: 'bg-green-50 dark:bg-green-900/20',
      5: 'bg-orange-50 dark:bg-orange-900/20',
      6: 'bg-pink-50 dark:bg-pink-900/20',
      7: 'bg-purple-50 dark:bg-purple-900/20',
      8: 'bg-indigo-50 dark:bg-indigo-900/20',
      9: 'bg-teal-50 dark:bg-teal-900/20'
    };
    
    return colors[personalYear] || 'bg-slate-50 dark:bg-slate-800';
  };
  
  const getYearBorderColor = (personalYear) => {
    const colors = {
      1: 'border-red-200 dark:border-red-800/50',
      2: 'border-blue-200 dark:border-blue-800/50',
      3: 'border-yellow-200 dark:border-yellow-800/50',
      4: 'border-green-200 dark:border-green-800/50',
      5: 'border-orange-200 dark:border-orange-800/50',
      6: 'border-pink-200 dark:border-pink-800/50',
      7: 'border-purple-200 dark:border-purple-800/50',
      8: 'border-indigo-200 dark:border-indigo-800/50',
      9: 'border-teal-200 dark:border-teal-800/50'
    };
    
    return colors[personalYear] || 'border-slate-200 dark:border-slate-700';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Generating your life timeline...</p>
        </div>
      </div>
    );
  }
  
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
          <p className="text-red-600 dark:text-red-400 mb-2">Error generating timeline</p>
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          
          {!birthDate && (
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Please set your birth date in the Zodiac or Biorhythm sections first.
            </p>
          )}
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
              Your Life Timeline
            </h2>
          </div>
          
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
            <h3 className="text-indigo-800 dark:text-indigo-300 font-medium mb-2">About Your Life Timeline</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              This timeline shows significant periods in your life based on numerology and astrological patterns. 
              It combines Personal Year cycles (9-year patterns), Life Path periods, and major astrological transits 
              to give you insights into the energetic themes of different periods in your life.
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-indigo-500 flex-shrink-0 mt-0.5"></div>
                <span><strong>Personal Years</strong> are 9-year cycles that influence the themes and energies of each year</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-purple-500 flex-shrink-0 mt-0.5"></div>
                <span><strong>Life Path Periods</strong> show the three major chapters of your life journey</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-500 flex-shrink-0 mt-0.5"></div>
                <span><strong>Saturn Returns</strong> are pivotal 29-year cycles that mark major life transitions</span>
              </li>
            </ul>
          </div>
        )}
        
        {timeline && (
          <div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  Birth Date: {formatBirthday(birthDate)}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Life Path Number: <span className="font-bold text-indigo-600 dark:text-indigo-400">{timeline.lifePathNumber}</span> • 
                  Current Personal Year: <span className={`font-bold ${getYearTextColor(timeline.currentPersonalYear)}`}>{timeline.currentPersonalYear}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">Years to show:</span>
                <select 
                  value={yearsToShow}
                  onChange={(e) => setYearsToShow(Number(e.target.value))}
                  className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 px-3 py-2"
                >
                  <option value="5">5 years</option>
                  <option value="10">10 years</option>
                  <option value="20">20 years</option>
                  <option value="50">50 years</option>
                  <option value="100">Lifetime</option>
                </select>
              </div>
            </div>
            
            {/* Life Path Periods Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <Clock className="text-purple-500 dark:text-purple-400 mr-2" size={20} />
                Your Life Path Periods
              </h3>
              
              <div className="space-y-3">
                {timeline.lifePathPeriods.map((period, index) => {
                  const isExpanded = expandedPeriods[`period-${index}`];
                  const isPast = period.endYear && period.endYear < currentYear;
                  const isCurrent = (!period.endYear || period.endYear >= currentYear) && 
                                    period.startYear <= currentYear;
                  
                  return (
                    <div 
                      key={`period-${index}`}
                      className={`border rounded-lg overflow-hidden ${
                        isCurrent 
                          ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30' 
                          : isPast 
                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' 
                            : 'border-indigo-200 dark:border-indigo-800/40 bg-indigo-50 dark:bg-indigo-900/20'
                      }`}
                    >
                      <button
                        onClick={() => togglePeriod(`period-${index}`)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getYearColor(period.number)} text-white flex items-center justify-center font-bold`}>
                            {period.number}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800 dark:text-slate-200">
                              {index === 0 ? 'First Period' : index === 1 ? 'Second Period' : 'Third Period'}: {period.interpretation.focus}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Age {period.age.start} to {period.age.end || 'end of life'} ({period.startYear} - {period.endYear || 'onward'})
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <p className="text-slate-700 dark:text-slate-300 mb-4">
                            {period.interpretation.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Key Lessons</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {period.interpretation.lessons}
                              </p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Potential Challenges</h5>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {period.interpretation.challenges}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Saturn Returns Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <Calendar className="text-blue-500 dark:text-blue-400 mr-2" size={20} />
                Major Life Transitions
              </h3>
              
              <div className="space-y-3">
                {timeline.saturnReturns.map((transit, index) => {
                  const isExpanded = expandedPeriods[`saturn-${index}`];
                  const isPast = transit.endYear < currentYear;
                  const isCurrent = transit.startYear <= currentYear && transit.endYear >= currentYear;
                  
                  return (
                    <div 
                      key={`saturn-${index}`}
                      className={`border rounded-lg overflow-hidden ${
                        isCurrent 
                          ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30' 
                          : isPast 
                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50' 
                            : 'border-indigo-200 dark:border-indigo-800/40 bg-indigo-50 dark:bg-indigo-900/20'
                      }`}
                    >
                      <button
                        onClick={() => togglePeriod(`saturn-${index}`)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div>
                          <h4 className="font-medium text-slate-800 dark:text-slate-200">
                            {transit.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Age {transit.age.start}-{transit.age.end} ({transit.startYear}-{transit.endYear})
                          </p>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <p className="text-slate-700 dark:text-slate-300">
                            {transit.description}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Significant Years Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <Sparkles className="text-amber-500 dark:text-amber-400 mr-2" size={20} />
                Significant Years
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {timeline.significantYears
                  .filter(year => year.year >= new Date().getFullYear() - 1) // Show recent and future years
                  .sort((a, b) => a.year - b.year) // Sort by year ascending
                  .slice(0, 6) // Limit to 6 entries
                  .map((year, index) => (
                    <div 
                      key={`significant-${index}`}
                      className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">
                          {year.year} (Age {year.age})
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          year.intensity === 'very high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          year.intensity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {year.intensity}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
                        {year.type}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {year.description}
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* Personal Year Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <Calendar className="text-indigo-500 dark:text-indigo-400 mr-2" size={20} />
                Your Personal Year Timeline
              </h3>
              
              <div className="overflow-x-auto pb-4">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-white dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Year
                      </th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Personal Year
                      </th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Theme
                      </th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Energy
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {timeline.personalYears
                      .filter(year => {
                        // Show a range from 3 years ago to X years ahead
                        const threeYearsAgo = currentYear - 3;
                        const yearsAhead = currentYear + yearsToShow;
                        return year.year >= threeYearsAgo && year.year <= yearsAhead;
                      })
                      .map((year, index) => {
                        const birthYear = new Date(birthDate).getFullYear();
                        const age = year.year - birthYear;
                        const isCurrent = year.year === currentYear;
                        
                        return (
                          <tr key={`year-${index}`} className={isCurrent ? getYearBgColor(year.personalYear) : ''}>
                            <td className={`sticky left-0 z-10 ${isCurrent ? getYearBgColor(year.personalYear) : 'bg-white dark:bg-slate-800'} p-3 whitespace-nowrap text-sm font-medium ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {year.year} {isCurrent && <span className="text-xs ml-1 font-normal text-slate-500 dark:text-slate-400">(current)</span>}
                            </td>
                            <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                              {age}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full ${getYearColor(year.personalYear)} text-white flex items-center justify-center font-medium text-sm`}>
                                  {year.personalYear}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                              {year.title}
                            </td>
                            <td className="p-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                year.energy === 'high' 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                  : year.energy === 'low'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}>
                                {year.energy}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Interpretation Guide */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          How to Use Your Life Timeline
        </h3>
        
        <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
          <p>
            Your life timeline is a powerful tool for understanding the energetic rhythms and themes 
            that influence different periods of your life. Here's how to make the most of this information:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">
                For Personal Years
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Year 1: Set new intentions and initiate projects</li>
                <li>Year 2: Build relationships and practice patience</li>
                <li>Year 3: Express yourself creatively and socially</li>
                <li>Year 4: Create stable foundations through hard work</li>
                <li>Year 5: Embrace change and seek new experiences</li>
                <li>Year 6: Focus on responsibilities and creating harmony</li>
                <li>Year 7: Reflect, analyze, and develop spiritually</li>
                <li>Year 8: Focus on achievement and material success</li>
                <li>Year 9: Complete cycles and let go of what no longer serves you</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">
                For Life Path Periods
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Understand the overarching themes of each major life chapter</li>
                <li>Recognize how these themes influence your development</li>
                <li>Use the key lessons as guidance for personal growth</li>
                <li>Be aware of potential challenges to navigate them consciously</li>
                <li>Align your long-term goals with the energetic support of each period</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mt-4">
            <h4 className="text-base font-medium text-indigo-700 dark:text-indigo-300 mb-2">
              Key Insight
            </h4>
            <p>
              These cycles operate alongside your free will, not in place of it. Use them as a guide to understand 
              the natural energetic support available to you during different periods, allowing you to work with 
              these influences rather than against them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeTimelineView;