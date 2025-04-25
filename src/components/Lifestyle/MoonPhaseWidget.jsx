// src/components/Lifestyle/MoonPhaseWidget.jsx
import React from 'react';
import { Moon } from 'lucide-react';
import { calculateMoonPhase } from '../../utils/astrologyUtils';

const MoonPhaseWidget = ({ moonPhase = null, zodiacSign = null }) => {

    // If no moonPhase data is provided, calculate it
  const moonData = moonPhase || calculateMoonPhase(new Date());

  // Check if calculation succeeded
  if (!moonData) {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/30">
        <p className="text-slate-600 dark:text-slate-400">
          Moon phase data is currently unavailable.
        </p>
      </div>
    );
  }
  
  // Get moon phase emoji
  const getMoonIcon = () => {
    switch(moonData.phase) {
      case 'New Moon': return '🌑';
      case 'Waxing Crescent': return '🌒';
      case 'First Quarter': return '🌓';
      case 'Waxing Gibbous': return '🌔';
      case 'Full Moon': return '🌕';
      case 'Waning Gibbous': return '🌖';
      case 'Last Quarter': return '🌗';
      case 'Waning Crescent': return '🌘';
      default: return '🌓';
    }
  };
  
  // Get personalized message based on moon phase and zodiac sign
  const getPersonalizedMessage = () => {
    if (!zodiacSign) return moonData.phase === 'Full Moon' || moonData.phase === 'New Moon' 
      ? "Major shifts in energy are occurring. Pay attention to your intuition."
      : "Regular daily energy flows. Balance activity with reflection.";
    
    // Fire signs
    if (['aries', 'leo', 'sagittarius'].includes(zodiacSign)) {
      if (moonData.phase === 'Full Moon') {
        return "Your fire energy is amplified. Channel it into creative expression rather than impulsivity.";
      } else if (moonData.phase === 'New Moon') {
        return "Set intentions around personal identity and creative projects. Your inner fire is renewing.";
      } else if (moonData.phase.includes('Waxing')) {
        return "Your energy is building. Take action on important projects and express yourself.";
      } else {
        return "Time to reflect and gather wisdom from recent experiences. Let your fire burn steadily.";
      }
    }
    
    // Earth signs
    if (['taurus', 'virgo', 'capricorn'].includes(zodiacSign)) {
      if (moonData.phase === 'Full Moon') {
        return "Your practical abilities peak. Complete projects and harvest the results of your efforts.";
      } else if (moonData.phase === 'New Moon') {
        return "Excellent time to plant seeds for material goals and establish new habits.";
      } else if (moonData.phase.includes('Waxing')) {
        return "Build upon your foundations systematically. Your persistence is your strength now.";
      } else {
        return "Release what's no longer serving your growth. Simplify and reorganize your resources.";
      }
    }
    
    // Air signs
    if (['gemini', 'libra', 'aquarius'].includes(zodiacSign)) {
      if (moonData.phase === 'Full Moon') {
        return "Your mental clarity is heightened. Insights and solutions to problems come more easily.";
      } else if (moonData.phase === 'New Moon') {
        return "Set intentions around communication projects and intellectual growth.";
      } else if (moonData.phase.includes('Waxing')) {
        return "Share your ideas and connect with others. Your social energy is increasing.";
      } else {
        return "Process information you've gathered recently. Edit your work and refine your ideas.";
      }
    }
    
    // Water signs
    if (['cancer', 'scorpio', 'pisces'].includes(zodiacSign)) {
      if (moonData.phase === 'Full Moon') {
        return "Your emotional and intuitive awareness peaks. Honor your feelings and creative inspiration.";
      } else if (moonData.phase === 'New Moon') {
        return "Set intentions around emotional healing and spiritual connection. Your intuition is renewing.";
      } else if (moonData.phase.includes('Waxing')) {
        return "Your emotional depth is increasing. Nurture important relationships and creative pursuits.";
      } else {
        return "Release emotional patterns that no longer serve you. Allow for rest and spiritual reflection.";
      }
    }
    
    return "The current moon phase is influencing your energy in unique ways.";
  };
  
  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800/30">
      <div className="flex items-center mb-3">
        <Moon className="text-indigo-500 dark:text-indigo-400 mr-2" size={20} />
        <h3 className="font-medium text-slate-800 dark:text-slate-200">Current Moon Phase</h3>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-3">{getMoonIcon()}</span>
          <div>
            <h4 className="font-medium text-indigo-700 dark:text-indigo-300">
              {moonData.phase}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {moonData.percent}% illumination
            </p>
          </div>
        </div>
        
        <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
          <div 
            className="h-8 w-8 rounded-full bg-indigo-700 dark:bg-indigo-400 relative overflow-hidden"
            style={{
              boxShadow: moonData.percent <= 50 
                ? `inset ${-4 + (moonData.percent / 12.5)}px 0 0 0 white` 
                : `inset ${-4 + ((100 - moonData.percent) / 12.5)}px 0 0 0 rgba(79, 70, 229, 0.2)`
            }}
          ></div>
        </div>
      </div>
      
      <div className="text-sm text-slate-600 dark:text-slate-400">
        <p>{getPersonalizedMessage()}</p>
      </div>
    </div>
  );
};

export default MoonPhaseWidget;