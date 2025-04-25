// src/components/Lifestyle/AstrologicalTransits.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Moon, Sparkles, AlertTriangle, Sun, Cloud, Sunrise, RefreshCw, ArrowDown, ArrowUp, Star, ChevronRight, Compass, ArrowLeft, ArrowRight } from 'lucide-react'; // Added ArrowLeft, ArrowRight
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

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(baseDate);
      currentDay.setDate(baseDate.getDate() + i);
      const dayKey = currentDay.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); // e.g., "Mon, Jan 1"

      const dayForecast = {};

      // Simulate transits for the current day of the week to add some variation
      const dailyTransits = getPlanetaryPositions(currentDay); // Use utility function

      areas.forEach(area => {
         // Keep random rating for now - a true non-random rating needs complex logic
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars

        // Generate more dynamic advice/opportunities/challenges
        let advice, opportunities, challenges;

        const dayOfWeek = currentDay.getDay(); // 0 for Sunday, 6 for Saturday
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];


        // Base text on area and user's element/modality, add variation based on day/simulated transits
        let baseAdvice, baseOpportunities, baseChallenges;

         // Base on Element
        if (userElement === 'Fire') {
           baseAdvice = "Channel your energy and take initiative.";
           baseOpportunities = "Dynamic action and creative expression.";
           baseChallenges = "Impatience and potential conflict.";
        } else if (userElement === 'Earth') {
           baseAdvice = "Ground yourself and focus on practical matters.";
           baseOpportunities = "Stability and tangible results.";
           baseChallenges = "Resistance to change and being stuck in routine.";
        } else if (userElement === 'Air') {
           baseAdvice = "Engage your mind and communicate clearly.";
           baseOpportunities = "New ideas and social connections.";
           baseChallenges = "Overthinking and scattered energy.";
        } else { // Water
           baseAdvice = "Trust your intuition and connect emotionally.";
           baseOpportunities = "Deep emotional bonds and creative flow.";
           baseChallenges = "Emotional sensitivity and difficulty setting boundaries.";
        }

         // Layer on Modality influence (simplified)
         if (userModality === 'Cardinal') {
             baseAdvice += " This is a good day to start something new.";
             baseOpportunities += " Leadership roles and initiating projects.";
             baseChallenges += " Starting too many things at once.";
         } else if (userModality === 'Fixed') {
             baseAdvice += " Focus on seeing things through.";
             baseOpportunities += " Building stability and mastering skills.";
             baseChallenges += " Stubbornness and resistance to compromise.";
         } else { // Mutable
             baseAdvice += " Adaptability is your strength today.";
             baseOpportunities += " Exploring different options and versatile approaches.";
             baseChallenges += " Indecisiveness and inconsistency.";
         }

        // Add variation based on the day of the week
        if (dayOfWeek === 5) { // Friday (ruled by Venus) - generally good for love/social
            if (area === 'love' || area === 'social') {
                baseOpportunities += " Enhanced opportunities for connection and harmony.";
            }
        } else if (dayOfWeek === 2) { // Tuesday (ruled by Mars) - generally good for action/career
             if (area === 'career' || area === 'health') {
                baseOpportunities += " Increased energy for pursuing goals.";
             }
        }
         // Add other day of week influences...

         // Add variation based on simulated key transits for the day (simplified)
         const sunTransit = dailyTransits.find(p => p.name === 'Sun');
         const moonTransit = dailyTransits.find(p => p.name === 'Moon');
         const mercuryTransit = dailyTransits.find(p => p.name === 'Mercury');

         if (sunTransit?.sign === userZodiac) { // Sun in your sign
             baseAdvice = `With the Sun in your sign, ${baseAdvice.replace('Channel your energy', 'Your personal power is highlighted today. Channel it')}`;
         }
         if (moonTransit?.sign === userZodiac) { // Moon in your sign
             baseAdvice = `Your emotions align with the cosmos today. ${baseAdvice.replace('Trust your intuition', 'Your intuition is particularly strong.')}`;
         }
         if (mercuryTransit?.retrograde && area === 'communication') { // Mercury retrograde affecting communication
              baseChallenges += " Be mindful of misunderstandings in communication.";
         }


        // Refine text based on area
        switch (area) {
            case 'love':
                 advice = `In love, ${baseAdvice.replace('Channel your energy and take initiative.', 'Take initiative in romance.').replace('Ground yourself and focus on practical matters.', 'Build stable connections.').replace('Engage your mind and communicate clearly.', 'Communicate your feelings.').replace('Trust your intuition and connect emotionally.', 'Deepen emotional bonds.')}`;
                 opportunities = `Opportunities for ${baseOpportunities.replace('Dynamic action', 'Romantic gestures').replace('Stability and tangible results', 'Lasting intimacy').replace('New ideas and social connections', 'Meaningful conversations').replace('Deep emotional bonds', 'Empathetic connection')}`;
                 challenges = `Challenges may arise from ${baseChallenges.replace('Impatience', 'Romantic impatience').replace('Resistance to change', 'Resistance to vulnerability').replace('Overthinking', 'Overthinking relationships').replace('Emotional sensitivity', 'Boundary issues in relationships')}`;
                break;
            case 'career':
                 advice = `For career, ${baseAdvice.replace('Channel your energy and take initiative.', 'Take the lead at work.').replace('Ground yourself and focus on practical matters.', 'Focus on practical work goals.').replace('Engage your mind and communicate clearly.', 'Communicate effectively with colleagues.').replace('Trust your intuition and connect emotionally.', 'Use intuition in problem-solving.')}`;
                 opportunities = `Opportunities for ${baseOpportunities.replace('Dynamic action', 'Advancement').replace('Stability and tangible results', 'Steady progress').replace('New ideas and social connections', 'Networking').replace('Deep emotional bonds', 'Collaborative success')}`;
                 challenges = `Challenges may arise from ${baseChallenges.replace('Impatience', 'Impatience with projects').replace('Resistance to change', 'Resistance to new methods').replace('Overthinking', 'Difficulty focusing on tasks').replace('Emotional sensitivity', 'Work-life balance issues')}`;
                break;
             case 'health':
                advice = `In terms of health, ${baseAdvice.replace('Channel your energy and take initiative.', 'Start a new fitness routine.').replace('Ground yourself and focus on practical matters.', 'Maintain consistent healthy habits.').replace('Engage your mind and communicate clearly.', 'Research wellness strategies.').replace('Trust your intuition and connect emotionally.', 'Listen to your body\'s needs.')}`;
                opportunities = `Opportunities for ${baseOpportunities.replace('Dynamic action', 'Increased vitality').replace('Stability and tangible results', 'Building physical strength').replace('New ideas and social connections', 'Finding new workout buddies').replace('Deep emotional bonds', 'Emotional well-being supporting health')}`;
                challenges = `Challenges may arise from ${baseChallenges.replace('Impatience', 'Risk of overexertion').replace('Resistance to change', 'Difficulty adapting to new diets').replace('Overthinking', 'Anxiety affecting health').replace('Emotional sensitivity', 'Stress impacting well-being')}`;
                break;
             case 'social':
                 advice = `Socially, ${baseAdvice.replace('Channel your energy and take initiative.', 'Plan social activities.').replace('Ground yourself and focus on practical matters.', 'Nurture stable friendships.').replace('Engage your mind and communicate clearly.', 'Engage in stimulating group discussions.').replace('Trust your intuition and connect emotionally.', 'Deepen connections with empathy.')}`;
                 opportunities = `Opportunities for ${baseOpportunities.replace('Dynamic action', 'Meeting new people').replace('Stability and tangible results', 'Strengthening bonds').replace('New ideas and social connections', 'Networking').replace('Deep emotional bonds', 'Empathetic connections')}`;
                 challenges = `Challenges may arise from ${baseChallenges.replace('Impatience', 'Dominating conversations').replace('Resistance to change', 'Being too reserved').replace('Overthinking', 'Social anxiety').replace('Emotional sensitivity', 'Taking on others\' problems')}`;
                break;
             case 'finances':
                 advice = `Financially, ${baseAdvice.replace('Channel your energy and take initiative.', 'Take calculated financial risks.').replace('Ground yourself and focus on practical matters.', 'Focus on budgeting and saving.').replace('Engage your mind and communicate clearly.', 'Analyze financial data.').replace('Trust your intuition and connect emotionally.', 'Trust your gut on investments.')}`;
                 opportunities = `Opportunities for ${baseOpportunities.replace('Dynamic action', 'Quick gains').replace('Stability and tangible results', 'Steady growth').replace('New ideas and social connections', 'Innovative financial ideas').replace('Deep emotional bonds', 'Financial security supporting peace of mind')}`;
                 challenges = `Challenges may arise from ${baseChallenges.replace('Impatience', 'Impulsive spending').replace('Resistance to change', 'Fear of investing').replace('Overthinking', 'Financial anxiety').replace('Emotional sensitivity', 'Stress over money affecting mood')}`;
                break;
            default:
              advice = 'Balance your energy across all life areas today.';
              opportunities = 'Growth through a balanced approach.';
              challenges = 'Spreading yourself too thin.';
        }


        dayForecast[area] = { rating, advice, opportunities, challenges };
      });
      forecast[dayKey] = dayForecast;
    }

    setWeeklyForecast(forecast);
  };


  // Check for current retrogrades - Modified to accept retrogrades as a parameter
  const checkRetrogrades = (date, currentRetrogrades) => {
       // Ensure currentRetrogrades is an array, if not, fetch them
        const retrogradesList = Array.isArray(currentRetrogrades) ? currentRetrogrades : getCurrentRetrogrades(date);

        // Add personalized impact based on user's zodiac sign and element
        if (userZodiac && Array.isArray(retrogradesList)) {
            retrogradesList.forEach(retrograde => {
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
                 if (!retrograde.copingStrategies) {
                      retrograde.copingStrategies = [
                         `Review and refine plans related to ${retrograde.planet}'s domain.`,
                         `Practice patience and flexibility.`,
                         `Use this time for introspection and inner work.`
                      ];
                 }
             });
        }

       // Set the state with the processed list
       setRetrogrades(retrogradesList || []);
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