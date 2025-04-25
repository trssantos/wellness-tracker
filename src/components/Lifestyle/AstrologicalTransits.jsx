// src/components/Lifestyle/AstrologicalTransits.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Moon, Sparkles, AlertTriangle, Sun, Cloud, Sunrise, RefreshCw, ArrowDown, ArrowUp, Star, ChevronRight, Compass, ArrowLeft, ArrowRight } from 'lucide-react';
import { getStorage } from '../../utils/storage';
// Import zodiac data and colors
import { zodiacSigns, getZodiacColors } from '../../utils/zodiacData';
// Import date formatting utility
import { formatDateForStorage } from '../../utils/dateUtils';
// Import consolidated astrology utilities (assuming they include necessary functions)
import {
    calculateMoonPhase,
    getPlanetaryPositions,
    getCurrentRetrogrades,
    getPlanetaryRuler,
    getElementForSign,
    getModalityForSign, // Import getModalityForSign
    getPlanetSymbol,
    generateDailyHoroscope // Keep generateDailyHoroscope for the daily tab
} from '../../utils/astrologyUtils';


const AstrologicalTransits = ({ onBack }) => {
  const [userZodiac, setUserZodiac] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moonPhase, setMoonPhase] = useState({});
  const [transits, setTransits] = useState([]);
  const [weeklyForecast, setWeeklyForecast] = useState({}); // Revert to object structure
  const [retrogrades, setRetrogrades] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user's zodiac sign from storage
    const storage = getStorage();
    if (storage.lifestyle?.zodiacSign) {
      setUserZodiac(storage.lifestyle.zodiacSign);
    }

    // Generate data for today on initial load
    generateAstrologicalData(new Date());
  }, []);

  const generateAstrologicalData = (date) => {
    setIsLoading(true);

    // Ensure the date is set to midnight for consistent calculations
    const dateAtMidnight = new Date(date);
    dateAtMidnight.setHours(0, 0, 0, 0);

    setCurrentDate(dateAtMidnight);

    // Calculate moon phase for the given date using the utility function
    const moonData = calculateMoonPhase(dateAtMidnight);
    setMoonPhase(moonData);

    // Calculate planetary transits for the given date using the utility function
     const planetaryTransits = getPlanetaryPositions(dateAtMidnight);
     setTransits(planetaryTransits);


    // Generate weekly forecast starting from the given date - now generates category advice for 7 days
    generateWeeklyForecast(dateAtMidnight);

    // Check for retrogrades using the utility function
    // Call checkRetrogrades separately after loading retrogrades from the utility
     const currentRetrogrades = getCurrentRetrogrades(dateAtMidnight);
     // Update the retrograde state and then generate personalized impact
     setRetrogrades(currentRetrogrades); // Set raw retrogrades first
     checkRetrogrades(dateAtMidnight, currentRetrogrades); // Then process for personal impact

    setIsLoading(false);
  };

   // Helper function to generate a personalized daily advice based on limited inputs (for daily tab)
   // This function remains for the 'daily' tab summary
  const generateDailyAdvice = (zodiac, transits, moonPhase, retrogrades) => {
    if (!zodiac || !transits || !moonPhase) return '';

    // Get a transit with strongest personal connection (simplified: Sun or Moon or first planet)
    const keyTransit = transits.find(t => t.name === 'Sun' || t.name === 'Moon') || transits[0];
    if (!keyTransit) return ''; // Should not happen with standard planets


    let advice = '';

    // Base advice on zodiac sign element and moon phase energy
    const element = getElementForSign(zodiac); // Use utility function
    if (element === 'Fire') {
      advice = moonPhase.energy === 'high' || moonPhase.energy === 'assertive'
        ? `With ${keyTransit.name} in ${keyTransit.signName} and the ${moonPhase.name}, your fiery energy is amplified. Channel it into creative projects and self-expression. The cosmos supports your assertive action today.`
        : `With ${keyTransit.name} in ${keyTransit.signName} and the ${moonPhase.name}, take time to recharge and strategize before taking action.`;
    } else if (element === 'Earth') {
      advice = moonPhase.energy === 'high' || moonPhase.energy === 'focused'
        ? `The ${moonPhase.name} combined with ${keyTransit.name} in ${keyTransit.signName} brings productive energy to your practical nature. Focus on tangible progress in material goals.`
        : `The ${moonPhase.name} combined with ${keyTransit.name} in ${keyTransit.signName} brings reflective energy to your practical nature. Focus on reorganizing your resources and priorities.`;
    } else if (element === 'Air') {
      advice = moonPhase.energy === 'high' || moonPhase.energy === 'communicative'
        ? `Your intellectual air energy aligns with the ${moonPhase.name} and ${keyTransit.name} in ${keyTransit.signName}, making this an ideal day for communication and social connections. Express your ideas boldly.`
        : `Your intellectual air energy aligns with the ${moonPhase.name} and ${keyTransit.name} in ${keyTransit.signName}, focus on mental clarity and analysis. Listen to different perspectives.`;
    } else { // Water
      advice = moonPhase.energy === 'high' || moonPhase.energy === 'clearing'
        ? `The intuitive connection between your water sign, the ${moonPhase.name}, and ${keyTransit.name} in ${keyTransit.signName} creates a powerful day for emotional expression and spiritual connection. Trust your intuition.`
        : `The intuitive connection between your water sign, the ${moonPhase.name}, and ${keyTransit.name} in ${keyTransit.signName} makes it a day for inner healing and establishing boundaries.`;
    }

     // Add a sentence about retrogrades if any are active
    if (retrogrades.length > 0) {
        const retrogradePlanets = retrogrades.map(r => r.planet).join(', ');
        advice += ` Be mindful of ${retrogradePlanets} retrograde, which may affect related areas like communication or plans.`;
    }


    return advice;
  };


  // Generate weekly forecast - generates category-based advice for 7 days
  const generateWeeklyForecast = (startDate) => {
    if (!userZodiac) {
      setWeeklyForecast({});
      return;
    }

    const forecast = {};
    const areas = ['love', 'career', 'health', 'social', 'finances'];
    const baseDate = new Date(startDate);
    const userElement = getElementForSign(userZodiac); // Get user's element once
    const userModality = getModalityForSign(userZodiac); // Get user's modality once
    const userZodiacName = zodiacSigns[userZodiac]?.name || 'Your Sign';


    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(baseDate);
      currentDay.setDate(baseDate.getDate() + i);
      const dayKey = currentDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); // e.g., "Mon, Jan 1"

      const dayForecast = {};

      // Simulate transits and moon phase for the current day of the week
      const dailyTransits = getPlanetaryPositions(currentDay); // Use utility function
      const dailyMoonPhase = calculateMoonPhase(currentDay); // Use utility function

      // Simplified mapping of planets to areas of influence
      const planetInfluence = {
          love: ['Venus', 'Moon'],
          career: ['Sun', 'Mars', 'Jupiter', 'Saturn', 'Mercury'],
          health: ['Mars', 'Sun', 'Moon'],
          social: ['Venus', 'Mercury', 'Moon'],
          finances: ['Jupiter', 'Saturn', 'Venus', 'Mercury']
      };


      areas.forEach(area => {
         // Keep random rating for now - a true non-random rating needs complex logic
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars

        // Generate more dynamic advice/opportunities/challenges
        let advice = '';
        let opportunities = '';
        let challenges = '';

        const dayOfWeek = currentDay.getDay(); // 0 for Sunday, 6 for Saturday
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];


        // Start building advice/opportunities/challenges based on user's sign and the area
         advice = `As a ${userZodiacName}, today's focus in the area of ${area} involves... `;
         opportunities = `Opportunities for ${userZodiacName} in ${area} include... `;
         challenges = `Potential challenges for ${userZodiacName} in ${area} may be... `;


        // Add layer based on user's Element and Modality
        advice += `Your ${userElement} energy and ${userModality} approach influence how you navigate this area. `;


        // Add layer based on the Day of the Week
        advice += `The energy of ${dayName} impacts your ${area} outlook. `;
        opportunities += `The spirit of ${dayName} brings opportunities. `;
        challenges += `Be mindful of ${dayName}'s potential pitfalls. `;


        // Add layer based on the Moon Phase for the day
         advice += `The ${dailyMoonPhase.name} (${dailyMoonPhase.energy} energy) also plays a role. `;
         opportunities += `The Moon's energy favors: ${dailyMoonPhase.activities}. `;
         challenges += `The Moon's energy cautions against: ${dailyMoonPhase.avoid}. `;


        // Add layer based on relevant Simulated Planetary Positions and Retrogrades for the day
        const relevantPlanets = planetInfluence[area] || [];
        const activeInfluences = dailyTransits.filter(p => relevantPlanets.includes(p.name));

        if (activeInfluences.length > 0) {
            advice += `Planetary influences from `;
            opportunities += `Leverage the energy of `;
            challenges += `Navigate potential friction from `;

            activeInfluences.forEach((planet, idx) => {
                advice += `${planet.name} in ${planet.signName}${planet.retrograde ? ' (Retrograde)' : ''}${idx < activeInfluences.length - 1 ? ', ' : '.'} `;
                opportunities += `${planet.name}${planet.retrograde ? ' (Retrograde)' : ''}${idx < activeInfluences.length - 1 ? ', ' : '.'} `;
                challenges += `${planet.name}${planet.retrograde ? ' (Retrograde)' : ''}${idx < activeInfluences.length - 1 ? ', ' : '.'} `;

                // Add a very simplified interpretation based on planet/retrograde status
                if (planet.retrograde) {
                     advice += ` Review and be patient.`;
                     opportunities += ` Inner work and refinement.`;
                     challenges += ` Delays or miscommunication.`;
                } else {
                     advice += ` Forward movement is favored.`;
                     opportunities += ` Action and progress.`;
                     challenges += ` Impulsiveness.`;
                }
            });
        } else {
             advice += `No major direct planetary influences on ${area} today. Focus on fundamentals.`;
             opportunities += `A stable day for routine activities.`;
             challenges += `Lack of dynamic energy.`;
        }


        dayForecast[area] = { rating, advice, opportunities, challenges };
      });
      forecast[dayKey] = dayForecast;
    }

    setWeeklyForecast(forecast);
  };


  // Check for current retrogrades - Modified to accept retrogrades as a parameter
  const checkRetrogrades = (date, currentRetrogrades) => {
       // Ensure currentRetrogrades is an array, if not, fetch them (should be fetched in generateAstrologicalData)
        const retrogradesList = Array.isArray(currentRetrogrades) ? currentRetrogrades : getCurrentRetrogrades(date);

        // Add personalized impact based on user's zodiac sign and element
        if (userZodiac && Array.isArray(retrogradesList)) {
            retrogradesList.forEach(retrograde => {
                // Prevent adding impact/strategies multiple times if function is called repeatedly with the same data
                 if (retrograde.personal) return;

                const planetaryRuler = getPlanetaryRuler(userZodiac); // Use utility function
                if (retrograde.planet === planetaryRuler) {
                    retrograde.personal = `As ${retrograde.planet} is your ruling planet, this retrograde particularly affects your core identity and expression. Pay special attention to the coping strategies.`;
                } else {
                    const element = getElementForSign(userZodiac); // Use utility function
                    switch (element) {
                        case 'Fire':
                            retrograde.personal = `This retrograde may challenge your natural enthusiasm and forward momentum. Practice patience and introspection.`;
                            break;
                        case 'Earth':
                            retrograde.personal = `This retrograde may affect your practical systems and material security. Use this time to reorganize and strengthen foundations.`;
                            break;
                        case 'Air':
                            retrograde.personal = `This retrograde particularly affects your mental processes and social connections. Focus on clarifying thoughts and strengthening existing relationships.`;
                            break;
                        case 'Water':
                            retrograde.personal = `This retrograde deeply impacts your emotional landscape and intuitive capabilities. Honor your feelings while maintaining healthy boundaries.`;
                            break;
                         default: // Added default case
                            retrograde.personal = `This retrograde will have unique effects on your zodiac sign. Pay attention to subtle shifts in the affected areas.`;
                            break;
                    }
                }
                 // Add placeholder impact and coping strategies if they are missing
                 if (!retrograde.impact) {
                     retrograde.impact = `Potential shifts or slowdowns related to ${retrograde.planet}'s energies.`;
                 }
                 // Ensure copingStrategies is an array or default to empty array if missing or not array
                 if (!Array.isArray(retrograde.copingStrategies) || retrograde.copingStrategies.length === 0) {
                      retrograde.copingStrategies = [
                         `Review and refine plans related to ${retrograde.planet}'s domain.`,
                         `Practice patience and flexibility.`,
                         `Use this time for introspection and inner work.`
                      ];
                 }
             });
        }

       // Set the state with the processed list (or empty array if input was not an array)
       setRetrogrades(Array.isArray(retrogradesList) ? retrogradesList : []);
   };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

    // Format date for display (e.g., "Mon, Jan 1") for weekly forecast
   const formatWeeklyDate = (date) => {
       return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
   };


  // Generate stars for rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'}
      />
    ));
  };

  // Change date and regenerate data
  const changeDate = (daysToAdd) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    generateAstrologicalData(newDate);
  };


  // Check if user has zodiac data
  if (!userZodiac) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Dashboard
        </button>

        <div className="text-center py-10">
          <Star className="mx-auto mb-4 text-amber-500 dark:text-amber-400" size={48} />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Set Your Birth Date First
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            To view your personalized astrological transits and horoscope, please set your birth date in the Zodiac section first.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg text-sm font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2 transition-colors">
            <Sparkles className="text-amber-500 dark:text-amber-400" size={24} />
            Your Astrological Forecast
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Personalized celestial insights for {formatDate(currentDate)}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
            title="Previous Day"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => generateAstrologicalData(new Date())}
            className="p-2 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300"
            title="Today"
          >
            <Calendar size={18} />
          </button>
          <button
            onClick={() => changeDate(1)}
            className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
            title="Next Day"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none min-w-[120px] ${
            activeTab === 'daily'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center">
            <Sun size={18} className="mr-2" />
            Daily Transit
          </div>
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none min-w-[120px] ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center">
            <Calendar size={18} className="mr-2" />
            Weekly Forecast
          </div>
        </button>
        <button
          onClick={() => setActiveTab('retrogrades')}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none min-w-[120px] ${
            activeTab === 'retrogrades'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-center">
            <RefreshCw size={18} className="mr-2" />
            Retrogrades
          </div>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Consulting the stars...</p>
        </div>
      ) : (
        <>
          {/* Daily Transit Tab */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {/* Moon Phase Card */}
              {/* Using moonPhase state calculated by generateAstrologicalData */}
              {moonPhase && (
                 <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-3xl">{moonPhase.icon}</span> {/* Use moonPhase.icon from utility */}
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                          {moonPhase.name} ({moonPhase.percent}%) {/* Use name and percent from utility */}
                        </h3>
                         {/* Simplified description as detailed one is in utility */}
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                           {moonPhase.description}
                        </p>

                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/30">
                          <h4 className="font-medium text-indigo-700 dark:text-indigo-400 mb-2 flex items-center">
                            <Moon size={16} className="mr-2" />
                            How this affects you as a {zodiacSigns[userZodiac]?.name}:
                          </h4>
                           {/* Generate personalized effect based on moon phase and user zodiac here or in utility */}
                           {/* For now, using a simplified message */}
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                             {/* You would need a utility function like getMoonPhasePersonalEffect(moonPhase.phase, userZodiac) */}
                             {/* Using a placeholder for now, or re-implementing similar logic */}
                              {moonPhase.name === 'Full Moon'
                                ? 'This moon amplifies your energy. Channel it productively.'
                                : moonPhase.name === 'New Moon'
                                ? 'Set intentions for new beginnings. Your inner energy is renewing.'
                                : 'The current moon phase brings general energy shifts that affect your daily rhythms.'
                              }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
              )}


              {/* Planetary Positions */}
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                  <Compass className="text-amber-500 dark:text-amber-400 mr-2" size={20} />
                  Planetary Positions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {transits.map((planet, index) => {
                    const zodiacData = zodiacSigns[planet.sign] || {};
                    const colors = getZodiacColors(planet.sign); // Use utility function

                    return (
                      <div
                        key={index}
                        className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <span className="text-xl" dangerouslySetInnerHTML={{ __html: getPlanetSymbol(planet.name) }}></span> {/* Use utility function */}
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className={`font-medium ${colors.text}`}>
                                {planet.name} in {zodiacData.name || 'Unknown Sign'} {/* Use signName from utility */}
                              </h4>
                               {/* House is a simulation and might not be in utility's basic planet object */}
                              {planet.house && (
                                  <span className="text-xs bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                                    House {planet.house}
                                  </span>
                              )}
                            </div>

                             {/* Description and effect might need to be added to the planet objects in getPlanetaryPositions utility */}
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {planet.description || 'Planetary influence.'} {planet.effect || ''}
                            </p>

                             {/* Personal impact would need to be calculated and added to the transit objects in generateAstrologicalData or utility */}
                            {/* For now, using a placeholder */}
                             {userZodiac && (
                                <div className="mt-2 text-xs p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-200">
                                  <strong>Personal Impact:</strong> {planet.name} in {zodiacData.name} is transiting your charts. {/* Placeholder */}
                                </div>
                             )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today's Advice */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3 flex items-center">
                  <Sparkles className="text-amber-500 dark:text-amber-400 mr-2" size={20} />
                  Today's Cosmic Advice
                </h3>

                <p className="text-slate-600 dark:text-slate-400 italic">
                  {/* Use the generateDailyHoroscope from astrologyUtils for a more detailed daily text */}
                  {userZodiac ? generateDailyHoroscope(userZodiac, currentDate) : 'Please set your zodiac sign to see your daily horoscope.'}
                </p>
              </div>
            </div>
          )}

          {/* Weekly Forecast Tab - Category based, with more dynamic text */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <Calendar className="text-amber-500 dark:text-amber-400 mr-2" size={20} />
                Your {zodiacSigns[userZodiac]?.name} Forecast for the Week
              </h3>

              {/* Iterate over the 7 days in weeklyForecast */}
              {Object.entries(weeklyForecast).map(([dayKey, dayForecast], index) => (
                 <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                     <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-3">
                         {dayKey} {/* Display the formatted date */}
                     </h4>

                     {Object.entries(dayForecast).map(([area, forecast], areaIndex) => (
                        <div key={areaIndex} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0 border-slate-100 dark:border-slate-700">
                           <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                                 {area}
                              </h5>
                              <div className="flex">
                                 {renderStars(forecast.rating)} {/* Use the random rating */}
                              </div>
                           </div>

                           <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                              <strong>Advice:</strong> {forecast.advice} {/* Use generated advice */}
                           </p>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                             <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-3">
                               <div className="flex items-center text-green-700 dark:text-green-300 font-medium mb-2">
                                 <ArrowUp className="mr-1" size={16} />
                                 Opportunities
                               </div>
                               <p className="text-slate-700 dark:text-slate-300">
                                 {forecast.opportunities} {/* Use generated opportunities */}
                               </p>
                             </div>

                             <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
                               <div className="flex items-center text-amber-700 dark:text-amber-300 font-medium mb-2">
                                 <AlertTriangle className="mr-1" size={16} />
                                 Challenges
                               </div>
                               <p className="text-slate-700 dark:text-slate-300">
                                 {forecast.challenges} {/* Use generated challenges */}
                               </p>
                             </div>
                           </div>
                        </div>
                     ))}
                 </div>
              ))}
            </div>
          )}

          {/* Retrogrades Tab */}
          {activeTab === 'retrogrades' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <RefreshCw className="text-amber-500 dark:text-amber-400 mr-2" size={20} />
                Current Retrogrades
              </h3>

              {/* Ensure retrogrades is an array and not empty */}
              {Array.isArray(retrogrades) && retrogrades.length === 0 ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-4 text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                    No Current Retrogrades
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Good news! There are no major planets in retrograde at this time. This is an excellent period for forward progress.
                  </p>
                </div>
              ) : (
                 // Ensure retrogrades is an array before mapping
                <div className="space-y-4">
                  {Array.isArray(retrogrades) && retrogrades.map((retrograde, index) => (
                    <div
                      key={index}
                      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                        <span className="text-xl mr-2" dangerouslySetInnerHTML={{ __html: getPlanetSymbol(retrograde.planet) }}></span> {/* Use utility function */}
                        {retrograde.planet} Retrograde
                      </h4>

                      {/* Use optional chaining for potentially missing properties */}
                      {retrograde.impact && (
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                           {retrograde.impact}
                        </p>
                      )}


                      {/* Assuming retrogradeStartDate and retrogradeEndDate are Date objects */}
                       {retrograde.retrogradeStartDate && retrograde.retrogradeEndDate && (
                           <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
                             <Calendar size={14} className="mr-1" />
                             {formatDate(new Date(retrograde.retrogradeStartDate))} - {formatDate(new Date(retrograde.retrogradeEndDate))}
                           </div>
                       )}


                      {retrograde.personal && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-200 dark:border-amber-800/50 mb-4">
                          <p className="text-amber-800 dark:text-amber-200 text-sm">
                            <strong>Personal Impact:</strong> {retrograde.personal}
                          </p>
                        </div>
                      )}

                      {/* Ensure copingStrategies is an array before mapping */}
                      {Array.isArray(retrograde.copingStrategies) && retrograde.copingStrategies.length > 0 && (
                        <div>
                          <h5 className="font-medium text-amber-700 dark:text-amber-300 mb-2">
                            Coping Strategies:
                          </h5>
                          <ul className="space-y-1">
                            {retrograde.copingStrategies.map((strategy, idx) => (
                              <li key={idx} className="flex items-start text-sm">
                                <ChevronRight size={16} className="text-amber-500 dark:text-amber-400 mr-1 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-700 dark:text-slate-300">{strategy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming Retrogrades - Keep as is, it's hardcoded data */}
              {/* This section is hardcoded in the original and not dynamic based on calculations */}
               <div>
                 <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                   <Calendar className="text-slate-500 dark:text-slate-400 mr-2" size={20} />
                   Upcoming Retrogrades (Simulated)
                 </h3>

                 <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                   <ul className="space-y-3">
                     <li className="flex items-start">
                       <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mr-3 shadow-sm">
                         <span className="text-lg">☿</span>
                       </div>
                       <div>
                         <p className="font-medium text-slate-700 dark:text-slate-300">
                           Mercury Retrograde
                         </p>
                         <p className="text-slate-500 dark:text-slate-400 text-sm">
                           August 23 - September 15, 2025
                         </p>
                       </div>
                     </li>
                     <li className="flex items-start">
                       <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mr-3 shadow-sm">
                         <span className="text-lg">♃</span>
                       </div>
                       <div>
                         <p className="font-medium text-slate-700 dark:text-slate-300">
                           Jupiter Retrograde
                         </p>
                         <p className="text-slate-500 dark:text-slate-400 text-sm">
                           July 28 - November 24, 2025
                         </p>
                       </div>
                     </li>
                     <li className="flex items-start">
                       <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mr-3 shadow-sm">
                         <span className="text-lg">♄</span>
                       </div>
                       <div>
                         <p className="font-medium text-slate-700 dark:text-slate-300">
                           Saturn Retrograde
                         </p>
                         <p className="text-slate-500 dark:text-slate-400 text-sm">
                           June 29 - November 15, 2025
                         </p>
                       </div>
                     </li>
                   </ul>
                 </div>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AstrologicalTransits;