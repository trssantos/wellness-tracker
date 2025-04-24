// src/utils/biorhythmUtils.js
/**
 * Utility functions for biorhythm calculations
 */

// Calculate days since birth
export const daysSinceBirth = (birthDate, targetDate = new Date()) => {
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    
    // Reset time component to ensure consistent calculations
    birth.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(target - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Calculate biorhythm values for a specific date
  export const calculateBiorhythm = (birthDate, targetDate = new Date()) => {
    const days = daysSinceBirth(birthDate, targetDate);
    
    // Calculate the three main cycles
    // sin(2π × days ÷ period) gives a value between -1 and 1
    const physical = Math.sin(2 * Math.PI * days / 23);
    const emotional = Math.sin(2 * Math.PI * days / 28);
    const intellectual = Math.sin(2 * Math.PI * days / 33);
    
    // Calculate combined average (used by some interpretations)
    const average = (physical + emotional + intellectual) / 3;
    
    // Convert from -1...1 to -100...100 for percentage display
    return {
      date: new Date(targetDate).toISOString().split('T')[0],
      physical: Math.round(physical * 100),
      emotional: Math.round(emotional * 100),
      intellectual: Math.round(intellectual * 100),
      average: Math.round(average * 100)
    };
  };
  
  // Generate biorhythm data for a range of dates
  export const generateBiorhythmData = (birthDate, centerDate = new Date(), daysRange = 15) => {
    if (!birthDate) return [];
    
    const centerDateObj = new Date(centerDate);
    const startDate = new Date(centerDateObj);
    startDate.setDate(centerDateObj.getDate() - daysRange);
    
    const data = [];
    
    for (let i = 0; i <= daysRange * 2; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      data.push(calculateBiorhythm(birthDate, currentDate));
    }
    
    return data;
  };
  
  // Check if a date is critical (crosses zero line)
  export const isCriticalDay = (biorhythmValue) => {
    // A value is critical if it's very close to 0 (zero-crossing)
    return Math.abs(biorhythmValue) <= 5;
  };
  
  // Get interpretation for a biorhythm value
  export const getBiorhythmInterpretation = (value, type) => {
    if (isCriticalDay(value)) {
      return {
        level: 'critical',
        description: `Critical day for your ${type} cycle. Take extra care.`,
        emoji: '⚠️'
      };
    }
    
    if (value > 70) {
      return {
        level: 'peak',
        description: `Peak ${type} performance. Excellent time for ${type === 'physical' ? 'activity and exercise' : type === 'emotional' ? 'social connections' : 'learning and problem-solving'}.`,
        emoji: '🔥'
      };
    }
    
    if (value > 30) {
      return {
        level: 'high',
        description: `Good ${type} energy. Favorable time for ${type === 'physical' ? 'physical tasks' : type === 'emotional' ? 'emotional expression' : 'mental work'}.`,
        emoji: '👍'
      };
    }
    
    if (value > -30) {
      return {
        level: 'neutral',
        description: `Moderate ${type} level. Balanced state.`,
        emoji: '➖'
      };
    }
    
    if (value > -70) {
      return {
        level: 'low',
        description: `Low ${type} energy. Take it easy on ${type === 'physical' ? 'strenuous activities' : type === 'emotional' ? 'emotional situations' : 'complex mental tasks'}.`,
        emoji: '👎'
      };
    }
    
    return {
      level: 'valley',
      description: `Very low ${type} capacity. Focus on rest and recovery.`,
      emoji: '💤'
    };
  };
  
  // Get color for a biorhythm type
  export const getBiorhythmColor = (type) => {
    switch (type) {
      case 'physical':
        return { normal: '#ef4444', light: '#fee2e2', dark: '#b91c1c' }; // Red
      case 'emotional':
        return { normal: '#3b82f6', light: '#dbeafe', dark: '#1d4ed8' }; // Blue
      case 'intellectual':
        return { normal: '#10b981', light: '#d1fae5', dark: '#047857' }; // Green
      case 'average':
        return { normal: '#8b5cf6', light: '#ede9fe', dark: '#6d28d9' }; // Purple
      default:
        return { normal: '#6b7280', light: '#f3f4f6', dark: '#374151' }; // Gray
    }
  };
  
  // Get descriptions for biorhythm types
  export const getBiorhythmDescriptions = () => {
    return {
      physical: {
        title: 'Physical',
        description: 'Influences strength, coordination, stamina, resistance to disease, and physical confidence.',
        cycle: '23 days',
        icon: 'Activity'
      },
      emotional: {
        title: 'Emotional',
        description: 'Affects creativity, sensitivity, mood, perception, awareness, and emotional stability.',
        cycle: '28 days',
        icon: 'Heart'
      },
      intellectual: {
        title: 'Intellectual',
        description: 'Governs memory, alertness, logical reasoning, reaction time, and ambition.',
        cycle: '33 days',
        icon: 'Brain'
      },
      average: {
        title: 'Combined',
        description: 'Average of all three cycles, representing overall biorhythm state.',
        cycle: 'Varies',
        icon: 'BarChart2'
      }
    };
  };