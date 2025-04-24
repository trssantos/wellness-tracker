// src/utils/transitUtils.js
import { zodiacSigns, getZodiacSign } from './zodiacData';
import { getBiorhythmInterpretation, calculateBiorhythm } from './biorhythmUtils';
import { calculateUniversalDay, getUniversalDayInterpretation } from './timelineUtils';

/**
 * Moon phases (simplified) for transit calculations
 */
const MOON_PHASES = [
  {
    name: "New Moon",
    description: "Time for setting intentions and new beginnings",
    energy: "reflective",
    activities: "Planning, meditation, setting intentions, rest",
    avoid: "Major decisions, confrontations, overexertion"
  },
  {
    name: "Waxing Crescent",
    description: "Time for gathering energy and taking initial steps",
    energy: "building",
    activities: "Learning, research, preparation, networking",
    avoid: "Rushing ahead, skipping steps, overcommitment"
  },
  {
    name: "First Quarter",
    description: "Time for action and overcoming obstacles",
    energy: "assertive",
    activities: "Taking action, making decisions, addressing challenges",
    avoid: "Inaction, doubt, procrastination"
  },
  {
    name: "Waxing Gibbous",
    description: "Time for refinement and problem-solving",
    energy: "focused",
    activities: "Adjusting plans, problem-solving, improving",
    avoid: "Perfectionism, overanalyzing, criticism"
  },
  {
    name: "Full Moon",
    description: "Time for illumination, completion, and celebration",
    energy: "high",
    activities: "Celebration, revelation, manifestation, awareness",
    avoid: "Emotional reactivity, impulsiveness, overextension"
  },
  {
    name: "Waning Gibbous",
    description: "Time for gratitude, sharing, and teaching",
    energy: "communicative",
    activities: "Teaching, sharing knowledge, expressing gratitude",
    avoid: "Withholding, isolation, ingratitude"
  },
  {
    name: "Last Quarter",
    description: "Time for release, forgiveness, and letting go",
    energy: "clearing",
    activities: "Releasing, forgiving, clearing, completing",
    avoid: "Holding on, resentment, starting new things"
  },
  {
    name: "Waning Crescent",
    description: "Time for rest, reflection, and surrender",
    energy: "low",
    activities: "Resting, reflecting, surrendering, accepting",
    avoid: "Forced action, resistance, pushing ahead"
  }
];

/**
 * Get current moon phase (simplified calculation)
 * @param {Date} date - The date to calculate for
 * @return {Object} - Moon phase data
 */
export const getMoonPhase = (date = new Date()) => {
  // This is a simplified calculation for demonstration
  // A real implementation would use astronomical calculations
  
  // Get day of the month
  const day = date.getDate();
  
  // Determine approximate phase based on day of month
  // This is just for demonstration - not astronomically accurate
  let phaseIndex = Math.floor((day % 29.5) / 3.69);
  if (phaseIndex >= 8) phaseIndex = 7; // Ensure valid index
  
  return MOON_PHASES[phaseIndex];
};

/**
 * Generate "Mercury Retrograde" periods (simplified)
 * @param {number} year - The year to generate for
 * @return {Array} - Mercury retrograde periods
 */
export const getMercuryRetrogradePeriods = (year) => {
  // This is simplified for demonstration
  // Real implementation would use ephemeris or astronomical API
  
  // Typical pattern: 3 Mercury retrogrades per year, ~3 weeks each
  // Usually in Jan-Feb, May-Jun, Sep-Oct
  if (!year) year = new Date().getFullYear();
  
  return [
    {
      start: new Date(year, 0, 14), // January 14
      end: new Date(year, 1, 3),    // February 3
      impact: "Communication issues, tech problems, travel delays"
    },
    {
      start: new Date(year, 4, 10), // May 10
      end: new Date(year, 5, 3),    // June 3
      impact: "Misunderstandings, contract issues, connection problems"
    },
    {
      start: new Date(year, 8, 9),  // September 9
      end: new Date(year, 9, 2),    // October 2
      impact: "Decision reversals, communication confusion, travel disruptions"
    }
  ];
};

/**
 * Check if a date is in Mercury Retrograde
 * @param {Date} date - The date to check
 * @return {Object|null} - Retrograde period if in one, null otherwise
 */
export const isInMercuryRetrograde = (date = new Date()) => {
  const year = date.getFullYear();
  const periods = getMercuryRetrogradePeriods(year);
  
  for (const period of periods) {
    if (date >= period.start && date <= period.end) {
      return {
        isRetrograde: true,
        start: period.start,
        end: period.end,
        impact: period.impact,
        advice: "Double-check communications, back up data, avoid signing contracts, expect delays"
      };
    }
  }
  
  return {
    isRetrograde: false,
    advice: "Good time for new agreements, purchases, and clear communication"
  };
};

/**
 * Simplified monthly horoscope themes by sign
 */
const MONTHLY_THEMES = {
  aries: [
    "Career focus", "Relationships", "Learning", "Home life",
    "Creativity", "Health", "Partnerships", "Transformation",
    "Adventure", "Professional growth", "Social connections", "Reflection"
  ],
  taurus: [
    "Financial planning", "Self-expression", "Local connections", "Domesticity",
    "Romance", "Organization", "Relationships", "Shared resources",
    "Expansion", "Career advancement", "Community", "Rest and renewal"
  ],
  gemini: [
    "Money matters", "Communication", "Short trips", "Family matters",
    "Pleasure", "Health routines", "Partnerships", "Transformation",
    "Learning", "Public image", "Social networks", "Spiritual growth"
  ],
  cancer: [
    "Identity renewal", "Resources", "Communication", "Domestic focus",
    "Creativity", "Organization", "Partnerships", "Shared finances",
    "Worldview", "Achievement", "Friendship", "Recovery"
  ],
  leo: [
    "Self-discovery", "Finances", "Local activity", "Home improvement",
    "Self-expression", "Health focus", "Relationships", "Transformation",
    "Travel opportunities", "Career spotlight", "Social expansion", "Reflection"
  ],
  virgo: [
    "Renewal", "Personal resources", "Communication", "Grounding",
    "Creativity", "Self-improvement", "Partnership", "Intimacy",
    "Mental expansion", "Professional growth", "Community", "Rest"
  ],
  libra: [
    "Personal growth", "Financial planning", "Communication", "Home focus",
    "Romance", "Organization", "Relationship focus", "Transformation",
    "New horizons", "Career advancement", "Social connections", "Inner work"
  ],
  scorpio: [
    "Recovery", "Financial focus", "Self-expression", "Family matters",
    "Creativity", "Health routines", "Partnerships", "Personal power",
    "Adventures", "Achievement", "Group activities", "Spiritual renewal"
  ],
  sagittarius: [
    "Identity", "Resources", "Learning", "Domestic life",
    "Pleasure", "Organization", "Relationships", "Transformation",
    "Philosophy", "Career growth", "Social networks", "Introspection"
  ],
  capricorn: [
    "Personal focus", "Finances", "Communication", "Home life",
    "Self-expression", "Health", "Partnerships", "Shared resources",
    "Expansion", "Professional spotlight", "Community", "Renewal"
  ],
  aquarius: [
    "Self-discovery", "Resources", "Ideas", "Family focus",
    "Creativity", "Routines", "Relationships", "Transformation",
    "Learning", "Career advancement", "Social activity", "Reflection"
  ],
  pisces: [
    "Personal renewal", "Financial matters", "Communication", "Home and roots",
    "Self-expression", "Health focus", "Relationships", "Shared resources",
    "Spirituality", "Career growth", "Community", "Inner work"
  ]
};

/**
 * Get month theme for a zodiac sign
 * @param {string} sign - Zodiac sign
 * @param {number} month - Month (1-12)
 * @return {string} - Theme for that month
 */
export const getMonthTheme = (sign, month) => {
  if (!sign || !month || month < 1 || month > 12) return "General growth";
  
  // Adjust month to 0-11 index
  const monthIndex = month - 1;
  
  // Get theme if available
  return MONTHLY_THEMES[sign.toLowerCase()]?.[monthIndex] || "Personal development";
};

/**
 * Get daily transit advice for a person
 * @param {Date|string} birthDate - The person's birth date
 * @param {Date} date - The date to generate advice for (defaults to today)
 * @return {Object} - Daily transit advice
 */
export const getDailyTransitAdvice = (birthDate, date = new Date()) => {
  if (!birthDate) return { success: false, error: "Birth date is required" };
  
  try {
    // Get zodiac sign
    const sign = getZodiacSign(birthDate);
    const signData = zodiacSigns[sign];
    
    // Get biorhythm data
    const biorhythm = calculateBiorhythm(birthDate, date);
    
    // Get numerology day
    const universalDay = calculateUniversalDay(date);
    const universalDayInfo = getUniversalDayInterpretation(universalDay);
    
    // Get moon phase
    const moonPhase = getMoonPhase(date);
    
    // Check Mercury retrograde
    const mercuryStatus = isInMercuryRetrograde(date);
    
    // Get month theme
    const month = date.getMonth() + 1;
    const monthTheme = getMonthTheme(sign, month);
    
    // Physical, emotional, intellectual insights
    const physicalInsight = getBiorhythmInterpretation(biorhythm.physical, 'physical');
    const emotionalInsight = getBiorhythmInterpretation(biorhythm.emotional, 'emotional');
    const intellectualInsight = getBiorhythmInterpretation(biorhythm.intellectual, 'intellectual');
    
    // Generate combined advice
    const insights = {
      // Overall daily theme
      theme: `${universalDayInfo.theme} with ${monthTheme.toLowerCase()} influences`,
      
      // Physical dimension
      physical: {
        level: biorhythm.physical,
        description: physicalInsight.description,
        advice: generateAdviceForDimension('physical', biorhythm.physical)
      },
      
      // Emotional dimension
      emotional: {
        level: biorhythm.emotional,
        description: emotionalInsight.description,
        advice: generateAdviceForDimension('emotional', biorhythm.emotional)
      },
      
      // Intellectual dimension
      intellectual: {
        level: biorhythm.intellectual,
        description: intellectualInsight.description,
        advice: generateAdviceForDimension('intellectual', biorhythm.intellectual)
      },
      
      // Zodiac influence
      zodiac: {
        sign,
        element: signData.element,
        monthlyTheme: monthTheme,
        advice: generateZodiacDailyAdvice(sign, date)
      },
      
      // Astrological influences
      astrology: {
        moonPhase: moonPhase.name,
        moonEnergy: moonPhase.energy,
        moonAdvice: moonPhase.activities,
        mercuryRetrograde: mercuryStatus.isRetrograde,
        mercuryAdvice: mercuryStatus.advice
      },
      
      // Numerology influence
      numerology: {
        universalDay,
        theme: universalDayInfo.theme,
        recommendedActivities: universalDayInfo.activities,
        avoidToday: universalDayInfo.avoid
      },
      
      // Overall optimal activities
      optimalActivities: generateOptimalActivities(biorhythm, universalDay, moonPhase, sign),
      
      // Things to be cautious about
      cautionAreas: generateCautionAreas(biorhythm, universalDay, mercuryStatus.isRetrograde, moonPhase)
    };
    
    return {
      success: true,
      date: date,
      insights
    };
  } catch (error) {
    console.error("Error generating daily transit advice:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate advice based on biorhythm dimension
 * @param {string} dimension - 'physical', 'emotional', or 'intellectual'
 * @param {number} level - Biorhythm level (-100 to 100)
 * @return {string} - Personalized advice
 */
const generateAdviceForDimension = (dimension, level) => {
  // Critical day (near zero)
  if (Math.abs(level) <= 5) {
    switch (dimension) {
      case 'physical':
        return "Take extra caution with physical activities today. Rest more and avoid strenuous work if possible.";
      case 'emotional':
        return "Be mindful of emotional reactions today. Avoid making important emotional decisions or difficult conversations.";
      case 'intellectual':
        return "Be extra careful with important decisions today. Double-check your work and seek additional perspectives.";
      default:
        return "Take extra care in this area today as you're at a sensitive transition point.";
    }
  }
  
  // High energy (above 70)
  if (level > 70) {
    switch (dimension) {
      case 'physical':
        return "Great day for physical activities and tasks requiring stamina. Make the most of your high energy.";
      case 'emotional':
        return "Excellent day for social connections and emotional expression. Share your feelings and connect with loved ones.";
      case 'intellectual':
        return "Ideal day for complex mental work, learning, and making important decisions. Your mental clarity is enhanced.";
      default:
        return "Excellent conditions in this area today - use this peak to your advantage.";
    }
  }
  
  // Good energy (30 to 70)
  if (level > 30) {
    switch (dimension) {
      case 'physical':
        return "Good day for regular physical activity and routine tasks requiring endurance.";
      case 'emotional':
        return "Favorable day for emotional stability and healthy relationships. Express yourself with confidence.";
      case 'intellectual':
        return "Good day for mental work, studying, and solving problems with a clear mind.";
      default:
        return "Favorable conditions in this area today - proceed with confidence.";
    }
  }
  
  // Low energy (-30 to 30)
  if (level > -30) {
    switch (dimension) {
      case 'physical':
        return "Moderate physical energy today. Focus on routine tasks and take breaks as needed.";
      case 'emotional':
        return "Neutral emotional day. Good for reflection and maintaining routine emotional connections.";
      case 'intellectual':
        return "Average mental clarity today. Focus on familiar tasks rather than new complex problems.";
      default:
        return "Moderate conditions in this area - focus on routine and familiar activities.";
    }
  }
  
  // Very low energy (-70 to -30)
  if (level > -70) {
    switch (dimension) {
      case 'physical':
        return "Consider a lighter schedule for physical activities today. Don't push yourself too hard.";
      case 'emotional':
        return "Take time for yourself emotionally today. Keep social interactions light and avoid intense discussions.";
      case 'intellectual':
        return "Focus on simpler tasks and routine work today. Save complex problem-solving for another day.";
      default:
        return "Conserve energy in this area today - focus on lighter activities and self-care.";
    }
  }
  
  // Extremely low energy (below -70)
  switch (dimension) {
    case 'physical':
      return "Focus on rest and recovery today. Postpone demanding physical tasks if possible.";
    case 'emotional':
      return "Give yourself emotional space today. Self-care and quiet time are beneficial now.";
    case 'intellectual':
      return "Routine tasks are best today. Avoid major decisions and complex problems requiring deep focus.";
    default:
      return "Rest and recovery are important in this area today - minimal activity is recommended.";
  }
};

/**
 * Generate zodiac-specific daily advice
 * @param {string} sign - Zodiac sign
 * @param {Date} date - The date
 * @return {string} - Personalized advice
 */
const generateZodiacDailyAdvice = (sign, date) => {
  // Get day of week (0-6, 0 is Sunday)
  const dayOfWeek = date.getDay();
  
  // Get sign data
  const signData = zodiacSigns[sign];
  if (!signData) return "Focus on your natural strengths today.";
  
  // Day of week themes
  const themes = [
    "reflection and renewal", // Sunday
    "fresh starts and planning", // Monday
    "communication and connection", // Tuesday
    "creativity and expression", // Wednesday
    "growth and expansion", // Thursday
    "completion and celebration", // Friday
    "balance and enjoyment" // Saturday
  ];
  
  const dayTheme = themes[dayOfWeek];
  
  // Generate advice based on sign and day theme
  switch (sign) {
    case 'aries':
      return `Channel your natural ${signData.details.strengths.split(', ')[0]} energy into ${dayTheme}. Your ${signData.element} element helps you take initiative.`;
    case 'taurus':
      return `Use your innate ${signData.details.strengths.split(', ')[0]} approach for ${dayTheme}. Your ${signData.element} element provides stability.`;
    case 'gemini':
      return `Your ${signData.details.strengths.split(', ')[0]} nature enhances today's ${dayTheme}. Your ${signData.element} element facilitates communication.`;
    case 'cancer':
      return `Draw on your ${signData.details.strengths.split(', ')[0]} qualities for today's ${dayTheme}. Your ${signData.element} element deepens intuition.`;
    case 'leo':
      return `Express your ${signData.details.strengths.split(', ')[0]} energy through ${dayTheme}. Your ${signData.element} element amplifies your presence.`;
    case 'virgo':
      return `Apply your ${signData.details.strengths.split(', ')[0]} approach to ${dayTheme}. Your ${signData.element} element grounds your efforts.`;
    case 'libra':
      return `Your ${signData.details.strengths.split(', ')[0]} nature harmonizes with today's ${dayTheme}. Your ${signData.element} element facilitates connection.`;
    case 'scorpio':
      return `Channel your ${signData.details.strengths.split(', ')[0]} intensity into ${dayTheme}. Your ${signData.element} element deepens experiences.`;
    case 'sagittarius':
      return `Your ${signData.details.strengths.split(', ')[0]} spirit enhances today's ${dayTheme}. Your ${signData.element} element ignites passion.`;
    case 'capricorn':
      return `Apply your ${signData.details.strengths.split(', ')[0]} approach to ${dayTheme}. Your ${signData.element} element provides endurance.`;
    case 'aquarius':
      return `Your ${signData.details.strengths.split(', ')[0]} perspective enhances ${dayTheme}. Your ${signData.element} element brings fresh ideas.`;
    case 'pisces':
      return `Draw on your ${signData.details.strengths.split(', ')[0]} nature for today's ${dayTheme}. Your ${signData.element} element deepens intuition.`;
    default:
      return `Focus on ${dayTheme} today in a way that honors your authentic self.`;
  }
};

/**
 * Generate optimal activities based on all factors
 * @param {Object} biorhythm - Biorhythm data
 * @param {number} universalDay - Universal day number
 * @param {Object} moonPhase - Moon phase data
 * @param {string} sign - Zodiac sign
 * @return {Array} - List of optimal activities
 */
const generateOptimalActivities = (biorhythm, universalDay, moonPhase, sign) => {
  const activities = [];
  
  // Add activities based on biorhythm
  if (biorhythm.physical > 70) {
    activities.push("Physical exercise", "Sports", "Tasks requiring stamina");
  }
  
  if (biorhythm.emotional > 70) {
    activities.push("Social connections", "Emotional conversations", "Creative expression");
  }
  
  if (biorhythm.intellectual > 70) {
    activities.push("Complex problem solving", "Learning new skills", "Important decision making");
  }
  
  // Add activities based on universal day
  switch (universalDay) {
    case 1:
      activities.push("Starting new projects", "Independent work", "Taking initiative");
      break;
    case 2:
      activities.push("Collaborating with others", "Diplomatic conversations", "Detail work");
      break;
    case 3:
      activities.push("Creative projects", "Communication", "Social activities");
      break;
    case 4:
      activities.push("Organizing", "Planning", "Building foundations");
      break;
    case 5:
      activities.push("Trying something new", "Travel", "Flexible activities");
      break;
    case 6:
      activities.push("Family matters", "Beauty and harmony", "Service to others");
      break;
    case 7:
      activities.push("Research", "Reflection", "Spiritual practices");
      break;
    case 8:
      activities.push("Financial matters", "Business activities", "Leadership tasks");
      break;
    case 9:
      activities.push("Completing projects", "Letting go", "Humanitarian efforts");
      break;
  }
  
  // Add activities based on moon phase
  if (moonPhase.activities) {
    // Split the activities string and add individual activities
    moonPhase.activities.split(', ').forEach(activity => {
      activities.push(activity);
    });
  }
  
  // Add activities based on zodiac sign
  const signData = zodiacSigns[sign];
  if (signData) {
    // Add one hobby from the sign's details
    const hobbies = signData.details.hobbies.split(', ');
    if (hobbies.length > 0) {
      activities.push(hobbies[0]);
    }
  }
  
  // Filter out duplicates and return
  return [...new Set(activities)];
};

/**
 * Generate caution areas based on all factors
 * @param {Object} biorhythm - Biorhythm data
 * @param {number} universalDay - Universal day number
 * @param {boolean} mercuryRetrograde - If Mercury is retrograde
 * @param {Object} moonPhase - Moon phase data
 * @return {Array} - List of caution areas
 */
const generateCautionAreas = (biorhythm, universalDay, mercuryRetrograde, moonPhase) => {
  const cautions = [];
  
  // Add cautions based on biorhythm
  if (Math.abs(biorhythm.physical) <= 5) {
    cautions.push("Physical exertion", "Activities requiring coordination");
  } else if (biorhythm.physical < -50) {
    cautions.push("Demanding physical tasks", "Endurance activities");
  }
  
  if (Math.abs(biorhythm.emotional) <= 5) {
    cautions.push("Emotionally charged situations", "Important relationship discussions");
  } else if (biorhythm.emotional < -50) {
    cautions.push("Difficult emotional conversations", "Situations requiring empathy");
  }
  
  if (Math.abs(biorhythm.intellectual) <= 5) {
    cautions.push("Complex decision making", "Technical problem solving");
  } else if (biorhythm.intellectual < -50) {
    cautions.push("Analytical tasks", "Learning new complex information");
  }
  
  // Add cautions based on universal day
  switch (universalDay) {
    case 1:
      cautions.push("Dependence on others", "Indecisiveness");
      break;
    case 2:
      cautions.push("Confrontation", "Rushing decisions");
      break;
    case 3:
      cautions.push("Scattering energy", "Excessive criticism");
      break;
    case 4:
      cautions.push("Cutting corners", "Resistance to structure");
      break;
    case 5:
      cautions.push("Overcommitment", "Excessive risk-taking");
      break;
    case 6:
      cautions.push("Perfectionism", "Neglecting self-care");
      break;
    case 7:
      cautions.push("Overthinking", "Information overload");
      break;
    case 8:
      cautions.push("Financial impulsiveness", "Power struggles");
      break;
    case 9:
      cautions.push("Starting new projects", "Holding onto past issues");
      break;
  }
  
  // Add cautions based on Mercury retrograde
  if (mercuryRetrograde) {
    cautions.push("Signing contracts", "Major purchases", "Important communications", "Travel plans");
  }
  
  // Add cautions based on moon phase
  if (moonPhase.avoid) {
    // Split the avoid string and add individual cautions
    moonPhase.avoid.split(', ').forEach(caution => {
      cautions.push(caution);
    });
  }
  
  // Filter out duplicates and return
  return [...new Set(cautions)];
};