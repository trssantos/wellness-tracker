// src/utils/timelineUtils.js
import { reduceToSingleDigit } from './numerologyUtils';

/**
 * Calculates a person's Personal Year number for a given year
 * @param {Date|string} birthDate - The person's birth date
 * @param {number} year - The year to calculate for
 * @return {number} - The Personal Year number (1-9)
 */
export const calculatePersonalYear = (birthDate, year) => {
  if (!birthDate || !year) return null;
  
  // Get month and day from birth date
  const birthDateObj = new Date(birthDate);
  const birthMonth = birthDateObj.getMonth() + 1; // JS months are 0-indexed
  const birthDay = birthDateObj.getDate();
  
  // Sum: birth month + birth day + year
  const sum = birthMonth + birthDay + year;
  
  // Reduce to a single digit (1-9)
  return reduceToSingleDigit(sum, false);
};

/**
 * Generates a personal year timeline for a given range of years
 * @param {Date|string} birthDate - The person's birth date
 * @param {number} startYear - The start year of the timeline
 * @param {number} endYear - The end year of the timeline
 * @return {Array} - Array of personal year data objects
 */
export const generatePersonalYearTimeline = (birthDate, startYear, endYear) => {
  if (!birthDate || !startYear || !endYear) return [];
  if (startYear > endYear) return [];
  
  const timeline = [];
  
  for (let year = startYear; year <= endYear; year++) {
    const personalYear = calculatePersonalYear(birthDate, year);
    
    timeline.push({
      year,
      personalYear,
      ...getPersonalYearInterpretation(personalYear)
    });
  }
  
  return timeline;
};

/**
 * Get interpretation for a personal year number
 * @param {number} number - The personal year number (1-9)
 * @return {Object} - Interpretation data
 */
export const getPersonalYearInterpretation = (number) => {
  const interpretations = {
    1: {
      title: "New Beginnings",
      theme: "Starting fresh, initiating projects, independence",
      energy: "high",
      description: "A year for new beginnings, planting seeds for the future, and starting fresh. It's ideal for launching new projects, developing independence, and taking initiative. Focus on building your identity and creating new opportunities.",
      advice: "Take initiative, embrace change, start new projects, be assertive",
      color: "red"
    },
    2: {
      title: "Cooperation & Patience",
      theme: "Partnerships, diplomacy, patience, attention to detail",
      energy: "moderate",
      description: "A year for developing relationships, partnerships, and cooperation. Progress comes through patience and diplomacy rather than force. Focus on details, find balance, and nurture connections with others.",
      advice: "Be patient, build relationships, pay attention to details, cooperate",
      color: "blue"
    },
    3: {
      title: "Creative Expression",
      theme: "Creativity, communication, social connections, joy",
      energy: "high",
      description: "A year for creative self-expression, social connections, and communication. Your creativity and charisma are heightened. Focus on expressing yourself, enjoying life, and expanding your social circle.",
      advice: "Express yourself, socialize, create, communicate your ideas",
      color: "yellow"
    },
    4: {
      title: "Building Foundations",
      theme: "Work, stability, organization, practical matters",
      energy: "moderate",
      description: "A year for building solid foundations through hard work and organization. Focus on creating stability, establishing routines, and addressing practical matters. Progress comes through discipline and methodical effort.",
      advice: "Work hard, get organized, create stability, be practical",
      color: "green"
    },
    5: {
      title: "Change & Freedom",
      theme: "Change, freedom, adventure, versatility",
      energy: "high",
      description: "A year of significant change, freedom, and new experiences. Expect the unexpected and embrace flexibility. Focus on adapting to change, exploring new possibilities, and embracing freedom of expression.",
      advice: "Embrace change, try new experiences, be adaptable, seek freedom",
      color: "orange"
    },
    6: {
      title: "Responsibility & Harmony",
      theme: "Responsibility, relationships, harmony, service",
      energy: "moderate",
      description: "A year focused on responsibilities, especially to home and family. Relationships take center stage, and creating harmony becomes important. Focus on service to others, creating beauty, and finding balance.",
      advice: "Focus on family, create harmony, fulfill responsibilities, serve others",
      color: "pink"
    },
    7: {
      title: "Reflection & Analysis",
      theme: "Inner work, analysis, spirituality, wisdom",
      energy: "low",
      description: "A year for reflection, analysis, and inner development. You may feel drawn to solitude or spiritual pursuits. Focus on gaining wisdom, doing research, and developing your inner life.",
      advice: "Reflect, analyze, study, develop spiritually, seek wisdom",
      color: "purple"
    },
    8: {
      title: "Manifestation & Power",
      theme: "Achievement, power, finances, recognition",
      energy: "high",
      description: "A year for achievements in the material world, particularly in career and finances. Personal power and recognition increase. Focus on achieving goals, improving finances, and exercising good judgment.",
      advice: "Focus on finances, pursue goals, develop leadership, seek balance",
      color: "indigo"
    },
    9: {
      title: "Completion & Transformation",
      theme: "Endings, completion, letting go, humanitarian concerns",
      energy: "moderate",
      description: "A year of completions, endings, and letting go of what no longer serves you. Doors close to make way for new beginnings. Focus on forgiveness, service to others, and completion of unfinished business.",
      advice: "Let go of the past, forgive, serve others, complete projects",
      color: "teal"
    }
  };
  
  return interpretations[number] || {
    title: "Unknown",
    theme: "Not available",
    energy: "unknown",
    description: "Interpretation not available for this number.",
    advice: "Not available",
    color: "gray"
  };
};

/**
 * Calculates a person's Life Path Periods based on numerology
 * Divides life into three periods based on birth date components
 * @param {Date|string} birthDate - The person's birth date
 * @return {Object} - Life path periods with timing and meaning
 */
export const calculateLifePathPeriods = (birthDate) => {
  if (!birthDate) return null;
  
  const birthDateObj = new Date(birthDate);
  const birthDay = birthDateObj.getDate();
  const birthMonth = birthDateObj.getMonth() + 1; // JS months are 0-indexed
  const birthYear = birthDateObj.getFullYear();
  
  // Calculate the three Life Path Period numbers
  // First period: influenced by month of birth
  const firstPeriodNumber = reduceToSingleDigit(birthMonth, false);
  
  // Second period: influenced by day of birth
  const secondPeriodNumber = reduceToSingleDigit(birthDay, false);
  
  // Third period: influenced by year of birth
  const thirdPeriodNumber = reduceToSingleDigit(
    String(birthYear).split('').reduce((sum, digit) => sum + parseInt(digit), 0),
    false
  );
  
  // Calculate the timing of each period
  // Each period lasts approximately (36 - Life Path Number) years
  // For simplicity, we'll use 28 years per period

  // Calculate Life Path Number
  const birthMonthSum = reduceToSingleDigit(birthMonth, false);
  const birthDaySum = reduceToSingleDigit(birthDay, false);
  const birthYearSum = reduceToSingleDigit(
    String(birthYear).split('').reduce((sum, digit) => sum + parseInt(digit), 0),
    false
  );
  const lifePathNumber = reduceToSingleDigit(birthMonthSum + birthDaySum + birthYearSum, true);
  
  // Calculate period lengths (roughly 36 - Life Path Number) years each
  // But ensure minimum of 20 years and maximum of 35 years
  const periodLength = Math.max(20, Math.min(35, 36 - lifePathNumber));
  
  const firstPeriodEnd = birthYear + periodLength;
  const secondPeriodEnd = firstPeriodEnd + periodLength;
  
  return {
    lifePathNumber,
    periods: [
      {
        number: firstPeriodNumber,
        startYear: birthYear,
        endYear: firstPeriodEnd,
        age: { start: 0, end: periodLength },
        interpretation: getLifePathPeriodInterpretation(firstPeriodNumber)
      },
      {
        number: secondPeriodNumber,
        startYear: firstPeriodEnd,
        endYear: secondPeriodEnd,
        age: { start: periodLength, end: periodLength * 2 },
        interpretation: getLifePathPeriodInterpretation(secondPeriodNumber)
      },
      {
        number: thirdPeriodNumber,
        startYear: secondPeriodEnd,
        endYear: null, // Continues for the rest of life
        age: { start: periodLength * 2, end: null },
        interpretation: getLifePathPeriodInterpretation(thirdPeriodNumber)
      }
    ]
  };
};

/**
 * Provides interpretation for each Life Path Period number
 * @param {number} number - The period number (1-9)
 * @return {Object} - Interpretation data
 */
export const getLifePathPeriodInterpretation = (number) => {
  const interpretations = {
    1: {
      focus: "Identity & Independence",
      description: "A period focused on developing independence, leadership skills, and individuality. Learning to rely on yourself and develop confidence is key.",
      challenges: "Ego issues, stubbornness, difficulties working with others",
      lessons: "Self-reliance, initiative, courage, assertiveness",
      color: "red"
    },
    2: {
      focus: "Relationships & Diplomacy",
      description: "A period focused on developing cooperation, sensitivity to others, and emotional intelligence. Learning to create harmony and work with others is key.",
      challenges: "Over-sensitivity, indecision, codependency",
      lessons: "Cooperation, patience, diplomacy, intuition",
      color: "blue"
    },
    3: {
      focus: "Self-Expression & Creativity",
      description: "A period focused on developing creative expression, social skills, and joy. Learning to communicate effectively and express yourself authentically is key.",
      challenges: "Superficiality, scattered energy, emotional sensitivity",
      lessons: "Self-expression, creativity, optimism, communication",
      color: "yellow"
    },
    4: {
      focus: "Stability & Discipline",
      description: "A period focused on developing practical skills, discipline, and order. Learning to create stability through hard work and organization is key.",
      challenges: "Rigidity, overwork, narrow perspective",
      lessons: "Discipline, organization, practical thinking, stability",
      color: "green"
    },
    5: {
      focus: "Freedom & Change",
      description: "A period focused on developing adaptability, versatility, and progressive thinking. Learning to embrace change and use freedom constructively is key.",
      challenges: "Restlessness, inconsistency, excess",
      lessons: "Adaptability, resourcefulness, courage to change",
      color: "orange"
    },
    6: {
      focus: "Responsibility & Balance",
      description: "A period focused on developing responsibility, nurturing abilities, and creating harmony. Learning to balance giving to others with self-care is key.",
      challenges: "Perfectionism, self-sacrifice, controlling tendencies",
      lessons: "Balance, responsibility, nurturing, service",
      color: "pink"
    },
    7: {
      focus: "Wisdom & Self-Discovery",
      description: "A period focused on developing intellectual depth, spirituality, and introspection. Learning to seek wisdom and trust your inner guidance is key.",
      challenges: "Isolation, overthinking, skepticism",
      lessons: "Analysis, spiritual connection, introspection, wisdom",
      color: "purple"
    },
    8: {
      focus: "Empowerment & Achievement",
      description: "A period focused on developing personal power, material success, and leadership. Learning to balance material and spiritual wealth is key.",
      challenges: "Workaholism, power struggles, materialism",
      lessons: "Personal power, achievement, financial wisdom",
      color: "indigo"
    },
    9: {
      focus: "Completion & Universal Connection",
      description: "A period focused on developing compassion, universal perspective, and letting go. Learning to serve humanity and transcend personal limitations is key.",
      challenges: "Emotional detachment, struggle with endings",
      lessons: "Compassion, surrender, completion, universal love",
      color: "teal"
    }
  };
  
  return interpretations[number] || {
    focus: "Unknown",
    description: "Interpretation not available for this number.",
    challenges: "Not available",
    lessons: "Not available",
    color: "gray"
  };
};

/**
 * Calculates Saturn Return periods in a person's life
 * @param {Date|string} birthDate - The person's birth date
 * @return {Array} - Saturn return periods
 */
export const calculateSaturnReturns = (birthDate) => {
  if (!birthDate) return [];
  
  const birthYear = new Date(birthDate).getFullYear();
  
  // Saturn returns occur approximately every 29.5 years
  const firstReturn = {
    title: "First Saturn Return",
    description: "A period of maturity and accepting adult responsibility. Often brings major life changes and reassessment of career, relationships, and life direction.",
    startYear: birthYear + 27,
    endYear: birthYear + 30,
    age: { start: 27, end: 30 },
    intensity: "very high",
    color: "indigo"
  };
  
  const secondReturn = {
    title: "Second Saturn Return",
    description: "A period of reassessing life achievements and legacy. Often brings retirement considerations, health focus, and wisdom sharing.",
    startYear: birthYear + 56,
    endYear: birthYear + 60,
    age: { start: 56, end: 60 },
    intensity: "high",
    color: "purple"
  };
  
  const thirdReturn = {
    title: "Third Saturn Return",
    description: "A period of reflection on life's wisdom and spiritual maturity. Often brings focus on legacy, mentorship, and spiritual fulfillment.",
    startYear: birthYear + 84,
    endYear: birthYear + 88,
    age: { start: 84, end: 88 },
    intensity: "moderate",
    color: "blue"
  };
  
  return [firstReturn, secondReturn, thirdReturn];
};

/**
 * Generates a complete life timeline including personal year cycles,
 * life path periods, and major astrological transits
 * @param {Date|string} birthDate - The person's birth date
 * @param {number} yearsForward - How many years into the future to calculate
 * @return {Object} - Complete timeline data
 */
export const generateLifeTimeline = (birthDate, yearsForward = 10) => {
  if (!birthDate) return { success: false, error: "Birth date is required" };
  
  try {
    const birthDateObj = new Date(birthDate);
    const birthYear = birthDateObj.getFullYear();
    const currentYear = new Date().getFullYear();
    
    // Calculate end year for timeline
    const endYear = currentYear + yearsForward;
    
    // Get personal year cycles
    const personalYears = generatePersonalYearTimeline(birthDate, birthYear, endYear);
    
    // Get life path periods
    const lifePathInfo = calculateLifePathPeriods(birthDate);
    
    // Get Saturn Returns
    const saturnReturns = calculateSaturnReturns(birthDate);
    
    // Combine all data into a complete timeline
    return {
      success: true,
      birthDate: birthDateObj,
      lifePathNumber: lifePathInfo.lifePathNumber,
      currentPersonalYear: calculatePersonalYear(birthDate, currentYear),
      lifePathPeriods: lifePathInfo.periods,
      saturnReturns,
      personalYears,
      significantYears: identifySignificantYears(birthDate, birthYear, endYear)
    };
  } catch (error) {
    console.error("Error generating life timeline:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Identifies particularly significant years in a person's timeline
 * These include pinnacle years, challenge years, and personal year 1 years
 * @param {Date|string} birthDate - The person's birth date
 * @param {number} startYear - Start year for calculation
 * @param {number} endYear - End year for calculation
 * @return {Array} - Significant years with descriptions
 */
export const identifySignificantYears = (birthDate, startYear, endYear) => {
  if (!birthDate || !startYear || !endYear) return [];
  
  const significantYears = [];
  const birthDateObj = new Date(birthDate);
  const birthYear = birthDateObj.getFullYear();
  
  // Loop through each year in the range
  for (let year = startYear; year <= endYear; year++) {
    const personalYear = calculatePersonalYear(birthDate, year);
    const age = year - birthYear;
    
    // Add personal year 1 years (beginning of new cycles)
    if (personalYear === 1) {
      significantYears.push({
        year,
        age,
        type: "New Cycle",
        description: "Beginning of a new 9-year cycle. Ideal for setting intentions for the coming years.",
        intensity: "high",
        color: "red"
      });
    }
    
    // Add transition years (personal year 9 to 1)
    if (personalYear === 9) {
      significantYears.push({
        year,
        age,
        type: "Transition Year",
        description: "Final year of a 9-year cycle. Focus on completion and preparation for new beginnings.",
        intensity: "high",
        color: "teal"
      });
    }
    
    // Add pinnacle years (11, 29, 38, 56, 65, 74)
    if ([11, 29, 38, 56, 65, 74].includes(age)) {
      significantYears.push({
        year,
        age,
        type: "Pinnacle Year",
        description: `Age ${age} marks a significant shift in life focus and direction.`,
        intensity: "very high",
        color: "purple"
      });
    }
    
    // Add double-digit master years
    if ([11, 22, 33, 44, 55, 66, 77, 88, 99].includes(age)) {
      significantYears.push({
        year,
        age,
        type: "Master Number Year",
        description: `Age ${age} carries special spiritual significance and potential for heightened awareness.`,
        intensity: "high",
        color: "indigo"
      });
    }
  }
  
  return significantYears;
};

/**
 * Calculate universal day number for a specific date
 * @param {Date|string} date - The date to calculate for
 * @return {number} - The universal day number (1-9)
 */
export const calculateUniversalDay = (date = new Date()) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1; // JS months are 0-indexed
  const year = dateObj.getFullYear();
  
  // Sum: month + day + year
  const sum = month + day + year;
  
  // Reduce to a single digit (1-9)
  return reduceToSingleDigit(sum, false);
};

/**
 * Get interpretation for a universal day number
 * @param {number} number - The universal day number (1-9)
 * @return {Object} - Interpretation data
 */
export const getUniversalDayInterpretation = (number) => {
  const interpretations = {
    1: {
      theme: "New Beginnings & Initiative",
      activities: "Starting projects, taking initiative, being independent",
      avoid: "Procrastination, dependence on others, indecision",
      energy: "high",
      color: "red"
    },
    2: {
      theme: "Cooperation & Patience",
      activities: "Teamwork, diplomatic conversations, attention to detail",
      avoid: "Confrontation, rushing, impatience, being overly emotional",
      energy: "moderate",
      color: "blue"
    },
    3: {
      theme: "Creative Expression & Socialization",
      activities: "Creative projects, social gatherings, communication",
      avoid: "Isolation, negativity, criticism, scattered energy",
      energy: "high",
      color: "yellow"
    },
    4: {
      theme: "Organization & Hard Work",
      activities: "Planning, organizing, methodical work, practical tasks",
      avoid: "Cutting corners, disorganization, resistance to structure",
      energy: "moderate",
      color: "green"
    },
    5: {
      theme: "Change & Freedom",
      activities: "Travel, trying new experiences, adaptable thinking",
      avoid: "Rigid thinking, excessive risk-taking, overindulgence",
      energy: "high",
      color: "orange"
    },
    6: {
      theme: "Responsibility & Balance",
      activities: "Family matters, helping others, creating harmony",
      avoid: "Perfectionism, overcommitment, neglecting self-care",
      energy: "moderate",
      color: "pink"
    },
    7: {
      theme: "Introspection & Analysis",
      activities: "Research, meditation, planning, spiritual pursuits",
      avoid: "Overthinking, isolation, skepticism, information overload",
      energy: "low",
      color: "purple"
    },
    8: {
      theme: "Action & Achievement",
      activities: "Business matters, financial decisions, leadership",
      avoid: "Power struggles, materialism, imbalance, overwork",
      energy: "high",
      color: "indigo"
    },
    9: {
      theme: "Completion & Letting Go",
      activities: "Finishing projects, forgiveness, humanitarian efforts",
      avoid: "Starting new projects, clinging to the past, selfishness",
      energy: "moderate",
      color: "teal"
    }
  };
  
  return interpretations[number] || {
    theme: "Unknown",
    activities: "Not available",
    avoid: "Not available",
    energy: "unknown",
    color: "gray"
  };
};