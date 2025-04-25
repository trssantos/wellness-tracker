// src/utils/astrologyUtils.js

// Import zodiac data
import { zodiacSigns, getZodiacSign } from './zodiacData'; // Assuming zodiacData.js is in the same directory

// Import functions from biorhythmUtils
import { calculateBiorhythm, getBiorhythmInterpretation } from './biorhythmUtils'; // Assuming biorhythmUtils.js is in the same directory

// Import functions from timelineUtils
import { calculateUniversalDay, getUniversalDayInterpretation } from './timelineUtils'; // Assuming timelineUtils.js is in the same directory
// NOTE: timelineUtils.js seems to depend on './numerologyUtils'. Ensure that file exists and is correct.


// Helper to calculate day of year (0-365)
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0); // Corrected from 0,.0 [cite: 283]
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Simulate zodiac position based on date and orbital period
const getSimulatedZodiacPosition = (date, orbitalPeriod) => {
  const zodiacList = Object.keys(zodiacSigns);
  const dayOfYear = getDayOfYear(date);
  // Use 365.25 for yearly cycles to better simulate movement across signs
  const effectivePeriod = orbitalPeriod === 365.25 ? 365.25 : orbitalPeriod;
  const position = Math.floor((dayOfYear % effectivePeriod) / (effectivePeriod / 12));
  return zodiacList[position % 12];
};

/**
 * Moon phases data with descriptions and advice
 */
const MOON_PHASES_DATA = [
  {
    name: "New Moon",
    icon: '🌑',
    percent: 0,
    description: "A time for new beginnings and setting intentions.",
    energy: "reflective",
    activities: "Planning, meditation, setting intentions, rest",
    avoid: "Major decisions, confrontations, overexertion"
  },
  {
    name: "Waxing Crescent",
    icon: '🌒',
    percent: 25,
    description: "A time for growth and building momentum.",
    energy: "building",
    activities: "Learning, research, preparation, networking",
    avoid: "Rushing ahead, skipping steps, overcommitment"
  },
  {
    name: "First Quarter",
    icon: '🌓',
    percent: 50,
    description: "A time for action and overcoming obstacles.",
    energy: "assertive",
    activities: "Taking action, making decisions, addressing challenges",
    avoid: "Inaction, doubt, procrastination"
  },
  {
    name: "Waxing Gibbous",
    icon: '🌔',
    percent: 75,
    description: "A time for refinement and problem-solving.",
    energy: "focused",
    activities: "Adjusting plans, problem-solving, improving",
    avoid: "Perfectionism, overanalyzing, criticism"
  },
  {
    name: "Full Moon",
    icon: '🌕',
    percent: 100,
    description: "A time of culmination, illumination, and heightened emotions.",
    energy: "high",
    activities: "Celebration, revelation, manifestation, awareness",
    avoid: "Emotional reactivity, impulsiveness, overextension"
  },
  {
    name: "Waning Gibbous",
    icon: '🌖',
    percent: 75, // Percentage decreases during waning phases
    description: "A time for gratitude and sharing with others.",
    energy: "communicative",
    activities: "Teaching, sharing knowledge, expressing gratitude",
    avoid: "Withholding, isolation, ingratitude"
  },
  {
    name: "Last Quarter",
    icon: '🌗',
    percent: 50, // Percentage decreases during waning phases
    description: "A time for release, letting go, and forgiveness.",
    energy: "clearing",
    activities: "Releasing, forgiving, clearing, completing",
    avoid: "Holding on, resentment, starting new things"
  },
  {
    name: "Waning Crescent",
    icon: '🌘',
    percent: 25, // Percentage decreases during waning phases
    description: "A time for rest, reflection, and surrender.",
    energy: "low",
    activities: "Resting, reflecting, surrendering, accepting",
    avoid: "Forced action, resistance, pushing ahead"
  }
];


// Calculate moon phase based on date (simplified simulation)
export const calculateMoonPhase = (date = new Date()) => {
  // This simplified version simulates moon phases based on day of month
  const day = date.getDate();

  // Approximate phase based on day of month (~29.5 day cycle)
  const phaseIndex = Math.floor((day % 29.5) / (29.5 / 8));

  return MOON_PHASES_DATA[phaseIndex] || MOON_PHASES_DATA[0]; // Fallback to New Moon if index is off
};

// Simulate retrograde state (simplified simulation)
const isRetrograde = (date, planet) => {
  // This is a simplified simulation
  // Real implementation would use ephemeris data

  const month = date.getMonth(); // 0-indexed
  const day = date.getDate(); // 1-indexed

  switch (planet) {
    case 'Mercury':
      // Combining simulation periods found in both files [cite: 286, 287, 288, 289, 350, 351]
      return (month === 0 && day >= 14 && day <= 31) || (month === 1 && day <= 3) || // Jan-Feb
             (month === 4 && day >= 10 && day <= 31) || (month === 5 && day <= 3) || // May-Jun
             (month === 8 && day >= 9 && day <= 30) || (month === 9 && day <= 2);    // Sep-Oct
    case 'Venus':
       // Combining simulation periods found [cite: 290, 350]
       return (month === 6 && day >= 20) || (month === 7 >=0 && month <= 11 && day <=30) || (month === 8 && day <=3); // Jul-Aug
    case 'Mars':
       // Simulation period found in astrologyUtils.txt [cite: 291]
       return (month === 9 && day >= 28) || (month === 10 >=0 && month <= 11) || (month === 11 && day <= 10); // Oct-Dec
    case 'Jupiter':
      // Simulation period found in astrologyUtils.txt [cite: 292]
      return month >= 5 && month <= 9; // June-Oct
    case 'Saturn':
      // Simulation period found in astrologyUtils.txt [cite: 293]
      return month >= 4 && month <= 8; // May-Sep
    // Note: Uranus, Neptune, Pluto retrogrades are not simulated in the provided files,
    // and they are retrograde for significant portions of the year.
    default:
      return false;
  }
};

// Get current retrograde planets
export const getCurrentRetrogrades = (date = new Date()) => {
 const allPlanets = [
   'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
   // Uranus, Neptune, Pluto are typically retrograde for long periods,
   // but not simulated in the provided files.
   // 'Uranus', 'Neptune', 'Pluto'
 ];
 return allPlanets.filter(planet => isRetrograde(date, planet));
};


// Get planetary positions for a specific date (simplified simulation)
export const getPlanetaryPositions = (date = new Date()) => {
  const planets = [
    { name: 'Sun', cycle: 365.25, symbol: '☉', description: 'The Sun represents your core identity and vitality.', effect: 'Illuminates your personal expression and ego.' },
    { name: 'Moon', cycle: 29.5, symbol: '☽', description: 'The Moon reflects your emotional landscape and intuition.', effect: 'Influences your moods, instincts, and inner feelings.' }, // Using synodic period for moon phase alignment
    { name: 'Mercury', cycle: 87.97, symbol: '☿', description: 'Mercury governs communication, thinking, and information processing.', effect: 'Shapes how you express ideas and process information.' },
    { name: 'Venus', cycle: 224.7, symbol: '♀', description: 'Venus represents love, beauty, values, and attraction.', effect: 'Influences your relationships and what you find beautiful.' },
    { name: 'Mars', cycle: 687, symbol: '♂', description: 'Mars embodies action, desire, drive, and assertion.', effect: 'Determines how you pursue goals and express anger.' },
    { name: 'Jupiter', cycle: 4333, symbol: '♃', description: 'Jupiter symbolizes expansion, growth, and opportunity.', effect: 'Brings optimism and favors areas for personal growth.' },
    { name: 'Saturn', cycle: 10759, symbol: '♄', description: 'Saturn represents discipline, responsibility, and limitations.', effect: 'Teaches important life lessons through challenges.' }
  ];

  // Convert planets to their current positions
  return planets.map(planet => {
    const zodiacKey = getSimulatedZodiacPosition(date, planet.cycle);
     // Simulate house randomly for demonstration
    const house = Math.floor(Math.random() * 12) + 1;
    return {
      ...planet,
      sign: zodiacKey,
      signName: zodiacSigns[zodiacKey]?.name || '',
      retrograde: isRetrograde(date, planet.name),
      house: house,
    };
  });
};


// Get planetary ruler for a sign
export const getPlanetaryRuler = (sign) => {
  const rulers = {
    'aries': 'Mars',
    'taurus': 'Venus',
    'gemini': 'Mercury',
    'cancer': 'Moon',
    'leo': 'Sun',
    'virgo': 'Mercury',
    'libra': 'Venus',
    'scorpio': 'Pluto', // Modern ruler
    'sagittarius': 'Jupiter',
    'capricorn': 'Saturn',
    'aquarius': 'Uranus', // Modern ruler
    'pisces': 'Neptune' // Modern ruler
  };
  return rulers[sign] || null; // Return null if sign not found [cite: 295]
};

// Get element for a sign
export const getElementForSign = (sign) => {
  if (['aries', 'leo', 'sagittarius'].includes(sign)) return 'Fire';
  if (['taurus', 'virgo', 'capricorn'].includes(sign)) return 'Earth';
  if (['gemini', 'libra', 'aquarius'].includes(sign)) return 'Air';
  if (['cancer', 'scorpio', 'pisces'].includes(sign)) return 'Water';
  return '';
};

// Get modality for a sign (Cardinal, Fixed, Mutable)
export const getModalityForSign = (sign) => {
  if (['aries', 'cancer', 'libra', 'capricorn'].includes(sign)) return 'Cardinal';
  if (['taurus', 'leo', 'scorpio', 'aquarius'].includes(sign)) return 'Fixed';
  if (['gemini', 'virgo', 'sagittarius', 'pisces'].includes(sign)) return 'Mutable';
  return '';
};


// Get planet symbols as HTML entities
export const getPlanetSymbol = (planet) => {
 const symbols = {
   'Sun': '☉',
   'Moon': '☽',
   'Mercury': '☿',
   'Venus': '♀',
   'Mars': '♂',
   'Jupiter': '♃',
   'Saturn': '♄',
   'Uranus': '♅',
   'Neptune': '♆',
   'Pluto': '♇'
 };
 return symbols[planet] || planet;
};

/**
 * Simplified monthly horoscope themes by sign [cite: 358]
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
    "Creativity", "Self-improvement", "PartnerShip", "Intimacy",
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
 * Get month theme for a zodiac sign [cite: 359]
 * @param {string} sign - Zodiac sign
 * @param {number} month - Month (1-12)
 * @return {string} - Theme for that month
 */
export const getMonthTheme = (sign, month) => {
  if (!sign || !month || month < 1 || month > 12) return "General growth";
  // Adjust month to 0-11 index [cite: 360]
  const monthIndex = month - 1;
  // Get theme if available, fallback to 'Personal development' or 'General theme' [cite: 361]
  const lowerSign = sign.toLowerCase();
  return MONTHLY_THEMES[lowerSign]?.[monthIndex] || "General theme";
};

// Generate actionable advice based on sign and moon phase percent [cite: 324]
const getActionableAdvice = (sign, moonPhasePercent) => {
 const isMoonFull = moonPhasePercent > 70;
 const isMoonNew = moonPhasePercent < 30;

 // Element-based advice
 const element = getElementForSign(sign);
 if (element === 'Fire') {
   if (isMoonFull) {
     return "Consider starting a new creative project or taking the lead in group activities. Express yourself with confidence.";
   } else if (isMoonNew) {
     return "Set intentions related to personal identity and future ambitions. Meditation on your passions will be particularly effective."; 
   } else {
     return "Balance action with reflection. This is a good time to evaluate your progress on current projects.";
   }
 } else if (element === 'Earth') {
   if (isMoonFull) {
     return "Complete practical tasks and organize your environment. Your attention to detail is heightened.";
   } else if (isMoonNew) {
     return "Plant seeds for future material growth. Review your budget and set new financial goals."; 
   } else {
     return "Find balance between work and relaxation. Nurture your physical body with healthy practices.";
   }
 } else if (element === 'Air') {
   if (isMoonFull) {
     return "Share your ideas widely and engage in intellectual discussions. Your mental clarity is at a peak.";
   } else if (isMoonNew) {
     return "Begin new studies or communication projects. Write down insights that come through quieter reflection."; 
   } else {
     return "Balance social activities with alone time for processing information. Your perspective is evolving."; 
   }
 } else { // Water
   if (isMoonFull) {
     return "Honor your emotional truth and express feelings that have been building. Creative and intuitive practices are favored."; 
   } else if (isMoonNew) {
     return "Set intentions around emotional healing and spiritual growth. Quiet time near water will be especially restorative.";
   } else {
     return "Find balance between emotional expression and boundaries. Journal about subtle feelings that arise.";
   }
 }
};


// Generate a daily horoscope based on astrological factors [cite: 299]
export const generateDailyHoroscope = (sign, date = new Date()) => {
  // In a real application, this would use actual astrological calculations
  // For this demo, we'll generate a plausible horoscope based on the sign's traits

  if (!sign || !zodiacSigns[sign]) return 'Invalid sign provided for horoscope.';

  const signData = zodiacSigns[sign]; 
  const element = getElementForSign(sign);
  const ruler = getPlanetaryRuler(sign); 
  const moonPhase = calculateMoonPhase(date); 
  const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday [cite: 300]

  // Random seed based on date and sign for consistent "randomness" per day/sign [cite: 301]
  const seed = date.getDate() + (date.getMonth() * 40) + sign.charCodeAt(0); // Increased month multiplier
  const rng = (s) => {
    const a = 1103515245;
    const c = 12345;
    const m = 2**31;
    s = (a * s + c) % m;
    return s / m;
  };
  let currentSeed = seed;
  const random = () => {
      currentSeed = rng(currentSeed) * (2**31); // Update seed for next call
      return currentSeed / (2**31);
  };

  // Areas of life [cite: 302]
  const lifeAreas = [
    'relationships', 'career', 'health', 'creativity',
    'communication', 'home', 'finance', 'spiritual growth',
    'learning', 'travel', 'social life', 'personal development' // Added more areas
  ];

  // Select focus areas based on random seed [cite: 303, 304]
  const focusArea1 = lifeAreas[Math.floor(random() * lifeAreas.length)];
  let focusArea2 = lifeAreas[Math.floor(random() * lifeAreas.length)];
  while(focusArea2 === focusArea1) { // Ensure area 2 is different from area 1
      focusArea2 = lifeAreas[Math.floor(random() * lifeAreas.length)];
  }


  // Generate advice based on element and moon phase energy [cite: 305, 306, 307, 308, 309, 310, 311, 312, 313, 314]
  let advice = '';
  if (element === 'Fire') {
    advice = moonPhase.energy === 'high' || moonPhase.energy === 'assertive'
      ? "Channel your abundant energy into passion projects and creative expression."
      : "Take time to recharge and strategize before taking action.";
  } else if (element === 'Earth') {
    advice = moonPhase.energy === 'high' || moonPhase.energy === 'focused'
      ? "Focus on practical matters and solidifying your foundations."
      : "Review your resources and release what no longer serves your growth.";
  } else if (element === 'Air') {
    advice = moonPhase.energy === 'high' || moonPhase.energy === 'communicative'
      ? "Communication flows easily today, so express your ideas and connect with others."
      : "Take time for mental clarity and reassess your social connections.";
  } else if (element === 'Water') {
    advice = moonPhase.energy === 'high' || moonPhase.energy === 'clearing'
      ? "Your emotional intelligence is heightened, making this ideal for deep connections."
      : "Honor your need for emotional boundaries and self-care.";
  } else {
      advice = "Focus on balancing your energy levels today."
  }

 // Day quality based on weekday's traditional ruler [cite: 315, 316, 317, 318, 319, 320, 321, 322]
 let dayQuality = '';
 switch(dayOfWeek) {
   case 0: // Sunday (ruled by Sun)
     dayQuality = "illuminating your true purpose";
     break;
   case 1: // Monday (ruled by Moon)
     dayQuality = "connecting you with your emotional needs";
     break;
   case 2: // Tuesday (ruled by Mars)
     dayQuality = "energizing your ambitions and courage";
     break;
   case 3: // Wednesday (ruled by Mercury)
     dayQuality = "enhancing your communication and mental agility";
     break;
   case 4: // Thursday (ruled by Jupiter)
     dayQuality = "expanding your horizons and opportunities";
     break;
   case 5: // Friday (ruled by Venus)
     dayQuality = "highlighting relationships and pleasure";
     break;
   case 6: // Saturday (ruled by Saturn)
     dayQuality = "bringing structure and clarity to your responsibilities";
     break;
 }

 // Access strengths and weaknesses safely [cite: 323]
 const strength = signData.details?.strengths?.split(', ')[0] || 'inherent';
 const weakness = signData.details?.weaknesses?.split(', ')[0] || 'challenging';

 // Generate the horoscope [cite: 323]
 const horoscope = `With ${ruler || 'celestial energies'} influencing your sign and the ${moonPhase.name} ${dayQuality}, today brings focus to your ${focusArea1} and ${focusArea2}.
 ${advice} Your ${strength} nature will serve you well, but be mindful of potential ${weakness} tendencies. ${getActionableAdvice(sign, moonPhase.percent)}`;

 return horoscope;
};

/**
 * Generate zodiac-specific daily advice (Simplified - similar to generateDailyHoroscope but focused on sign interaction with day theme)
 * @param {string} sign - Zodiac sign
 * @param {Date} date - The date
 * @return {string} - Personalized advice
 */
const generateZodiacDailyAdvice = (sign, date) => {
  // Get day of week (0-6, 0 is Sunday) [cite: 405]
  const dayOfWeek = date.getDay();
  // Get sign data [cite: 406]
  const signData = zodiacSigns[sign];
  if (!signData) return "Focus on your natural strengths today.";

  // Day of week themes [cite: 407]
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

  // Generate advice based on sign and day theme [cite: 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420]
  // Using template literals and accessing details safely
  const strength = signData.details?.strengths?.split(', ')[0] || 'inherent';
  const element = getElementForSign(sign);

  switch (sign) {
    case 'aries':
      return `Channel your natural ${strength} energy into ${dayTheme}. Your ${element} element helps you take initiative.`;
    case 'taurus':
      return `Use your innate ${strength} approach for ${dayTheme}. Your ${element} element provides stability.`;
    case 'gemini':
      return `Your ${strength} nature enhances today's ${dayTheme}. Your ${element} element facilitates communication.`;
    case 'cancer':
      return `Draw on your ${strength} qualities for today's ${dayTheme}. Your ${element} element deepens intuition.`;
    case 'leo':
      return `Express your ${strength} energy through ${dayTheme}. Your ${element} element amplifies your presence.`;
    case 'virgo':
      return `Apply your ${strength} approach to ${dayTheme}. Your ${element} element grounds your efforts.`;
    case 'libra':
      return `Your ${strength} nature harmonizes with today's ${dayTheme}. Your ${element} element facilitates connection.`;
    case 'scorpio':
      return `Channel your ${strength} intensity into ${dayTheme}. Your ${element} element deepens experiences.`;
    case 'sagittarius':
      return `Your ${strength} spirit enhances today's ${dayTheme}. Your ${element} element ignites passion.`;
    case 'capricorn':
      return `Apply your ${strength} approach to ${dayTheme}. Your ${element} element provides endurance.`;
    case 'aquarius':
      return `Your ${strength} perspective enhances ${dayTheme}. Your ${element} element brings fresh ideas.`;
    case 'pisces':
      return `Draw on your ${strength} nature for today's ${dayTheme}. Your ${element} element deepens intuition.`;
    default:
      return `Focus on ${dayTheme} today in a way that honors your authentic self.`;
  }
};


/**
 * Generate optimal activities based on various factors
 * @param {Object} biorhythm - Biorhythm data (physical, emotional, intellectual levels)
 * @param {number} universalDay - Universal day number
 * @param {Object} moonPhase - Moon phase data (from calculateMoonPhase)
 * @param {string} sign - Zodiac sign
 * @return {Array} - List of optimal activities
 */
export const generateOptimalActivities = (biorhythm, universalDay, moonPhase, sign) => {
  const activities = [];
  // Add activities based on biorhythm
  if (biorhythm?.physical > 70) { 
    activities.push("Physical exercise", "Sports", "Tasks requiring stamina");
  }

  if (biorhythm?.emotional > 70) { 
    activities.push("Social connections", "Emotional conversations", "Creative expression");
  }

  if (biorhythm?.intellectual > 70) {
    activities.push("Complex problem solving", "Learning new skills", "Important decision making");
  }

  // Add activities based on universal day [cite: 424, 425, 426, 427, 428, 429, 430, 431, 432, 433]
  switch (universalDay) {
    case 1: activities.push("Starting new projects", "Independent work", "Taking initiative"); break;
    case 2: activities.push("Collaborating with others", "Diplomatic conversations", "Detail work"); break;
    case 3: activities.push("Creative projects", "Social gatherings", "Communication"); break; // Adjusted based on timelineUtils
    case 4: activities.push("Planning", "Organizing", "Methodical work"); break; // Adjusted based on timelineUtils
    case 5: activities.push("Travel", "Trying new experiences", "Adaptable thinking"); break; // Adjusted based on timelineUtils
    case 6: activities.push("Family matters", "Helping others", "Creating harmony"); break; // Adjusted based on timelineUtils
    case 7: activities.push("Research", "Meditation", "Spiritual pursuits"); break; // Adjusted based on timelineUtils
    case 8: activities.push("Business matters", "Financial decisions", "Leadership"); break; // Adjusted based on timelineUtils
    case 9: activities.push("Finishing projects", "Forgiveness", "Humanitarian efforts"); break; // Adjusted based on timelineUtils
  }

  // Add activities based on moon phase [cite: 434]
  if (moonPhase?.activities) {
    // Split the activities string and add individual activities
    moonPhase.activities.split(', ').forEach(activity => {
      activities.push(activity.trim()); // Added trim
    });
  }

  // Add activities based on zodiac sign [cite: 435, 436, 437]
  const signData = zodiacSigns[sign];
  if (signData?.details?.hobbies) { // Access hobbies safely
    // Add one hobby from the sign's details randomly
    const hobbies = signData.details.hobbies.split(', ');
    if (hobbies.length > 0) {
      activities.push(hobbies[Math.floor(Math.random() * hobbies.length)].trim()); // Added trim and randomness
    }
  }

  // Filter out duplicates and return [cite: 438]
  return [...new Set(activities)];
};


/**
 * Generate caution areas based on various factors
 * @param {Object} biorhythm - Biorhythm data (physical, emotional, intellectual levels)
 * @param {number} universalDay - Universal day number
 * @param {boolean} mercuryRetrograde - If Mercury is retrograde (use isRetrograde)
 * @param {Object} moonPhase - Moon phase data (from calculateMoonPhase)
 * @return {Array} - List of caution areas
 */
export const generateCautionAreas = (biorhythm, universalDay, mercuryRetrograde, moonPhase) => {
  const cautions = [];
  // Add cautions based on biorhythm [cite: 439, 440, 441, 442, 443, 444, 445]
  if (Math.abs(biorhythm?.physical) <= 5) {
    cautions.push("Physical exertion", "Activities requiring coordination");
  } else if (biorhythm?.physical < -50) {
    cautions.push("Demanding physical tasks", "Endurance activities");
  }

  if (Math.abs(biorhythm?.emotional) <= 5) {
    cautions.push("Emotionally charged situations", "Important relationship discussions");
  } else if (biorhythm?.emotional < -50) {
    cautions.push("Difficult emotional conversations", "Situations requiring empathy");
  }

  if (Math.abs(biorhythm?.intellectual) <= 5) {
    cautions.push("Complex decision making", "Technical problem solving");
  } else if (biorhythm?.intellectual < -50) {
    cautions.push("Analytical tasks", "Learning new complex information");
  }

  // Add cautions based on universal day [cite: 446, 447, 448, 449, 450, 451, 452, 453, 454]
  switch (universalDay) {
    case 1: cautions.push("Dependence on others", "Indecisiveness"); break;
    case 2: cautions.push("Confrontation", "Rushing decisions", "Being overly emotional"); break; // Adjusted based on timelineUtils
    case 3: cautions.push("Isolation", "Negativity", "Excessive criticism", "Scattered energy"); break; // Adjusted based on timelineUtils
    case 4: cautions.push("Cutting corners", "Disorganization", "Resistance to structure"); break; // Adjusted based on timelineUtils
    case 5: cautions.push("Rigid thinking", "Excessive risk-taking", "Overindulgence"); break; // Adjusted based on timelineUtils
    case 6: cautions.push("Perfectionism", "Overcommitment", "Neglecting self-care"); break; // Adjusted based on timelineUtils
    case 7: cautions.push("Overthinking", "Isolation", "Skepticism", "Information overload"); break; // Adjusted based on timelineUtils
    case 8: cautions.push("Power struggles", "Materialism", "Imbalance", "Overwork"); break; // Adjusted based on timelineUtils
    case 9: cautions.push("Starting new projects", "Clinging to the past", "Selfishness"); break; // Adjusted based on timelineUtils
  }

  // Add cautions based on Mercury retrograde [cite: 455]
  if (mercuryRetrograde) { // Assumes mercuryRetrograde boolean is passed in
    cautions.push("Signing contracts", "Major purchases", "Important communications", "Travel plans");
  }

  // Add cautions based on moon phase [cite: 456]
  if (moonPhase?.avoid) {
    // Split the avoid string and add individual cautions
    moonPhase.avoid.split(', ').forEach(caution => {
      cautions.push(caution.trim()); // Added trim
    });
  }

  // Filter out duplicates and return [cite: 457]
  return [...new Set(cautions)];
};


/**
 * Generate daily transit advice for a person based on various factors.
 * @param {Date} birthDate - The person's birth date.
 * @param {Date} date - The date to generate advice for (defaults to today).
 * @return {Object} - Daily transit advice including insights or an error.
 */
export const getDailyTransitAdvice = (birthDate, date = new Date()) => {
  // Add defensive checks [cite: 362]
  if (!birthDate || !(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
      console.error("Invalid birth date provided to getDailyTransitAdvice.");
      return { success: false, error: "A valid birth date is required to generate personalized transit advice." };
  }

  const sign = getZodiacSign(birthDate); 
  if (!sign) {
    return { success: false, error: "Could not determine zodiac sign from birth date." };
  }

  try {
    // Use imported functions
    const biorhythm = calculateBiorhythm(birthDate, date); 
    const universalDay = calculateUniversalDay(date); 
    const universalDayInfo = getUniversalDayInterpretation(universalDay); 

    const moonPhase = calculateMoonPhase(date); // Use the consolidated moon phase function [cite: 369]
    const mercuryRetrograde = isRetrograde(date, 'Mercury'); // Use the consolidated retrograde check [cite: 370]

    // Get month theme [cite: 371]
    const month = date.getMonth() + 1;
    const monthTheme = getMonthTheme(sign, month);

    // Physical, emotional, intellectual insights [cite: 372, 373, 374]
    const physicalInsight = getBiorhythmInterpretation(biorhythm.physical, 'physical');
    const emotionalInsight = getBiorhythmInterpretation(biorhythm.emotional, 'emotional');
    const intellectualInsight = getBiorhythmInterpretation(biorhythm.intellectual, 'intellectual');

    // Generate combined advice [cite: 374]
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

      // Zodiac influence [cite: 375]
      zodiac: {
        sign: sign,
        element: getElementForSign(sign),
        monthlyTheme: monthTheme,
        advice: generateZodiacDailyAdvice(sign, date) // Use the consolidated zodiac daily advice
      },

      // Astrological influences [cite: 376]
      astrology: {
        moonPhase: moonPhase.name,
        moonEnergy: moonPhase.energy,
        moonAdvice: moonPhase.activities,
        mercuryRetrograde: mercuryRetrograde,
        mercuryAdvice: mercuryRetrograde ? "Double-check communications, back up data, avoid signing contracts, expect delays" : "Good time for new agreements, purchases, and clear communication"
      },

      // Numerology influence [cite: 377]
      numerology: {
        universalDay,
        theme: universalDayInfo.theme,
        recommendedActivities: universalDayInfo.activities,
        avoidToday: universalDayInfo.avoid
      },

      // Overall optimal activities [cite: 377]
      optimalActivities: generateOptimalActivities(biorhythm, universalDay, moonPhase, sign),

      // Things to be cautious about [cite: 377]
      cautionAreas: generateCautionAreas(biorhythm, universalDay, mercuryRetrograde, moonPhase)
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
 * Generate advice based on biorhythm dimension [cite: 380]
 * @param {string} dimension - 'physical', 'emotional', or 'intellectual'
 * @param {number} level - Biorhythm level (-100 to 100)
 * @return {string} - Personalized advice
 */
const generateAdviceForDimension = (dimension, level) => {
    // Handle cases where level might not be a number
    if (typeof level !== 'number' || isNaN(level)) {
        return `Review and focus on your ${dimension} energy today.`;
    }
  // Critical day (near zero) [cite: 380]
  if (Math.abs(level) <= 5) {
    switch (dimension) {
      case 'physical': return "Take extra caution with physical activities today. Rest more and avoid strenuous work if possible."; 
      case 'emotional': return "Be mindful of emotional reactions today. Avoid making important emotional decisions or difficult conversations."; 
      case 'intellectual': return "Be extra careful with important decisions today. Double-check your work and seek additional perspectives."; 
      default: return "Take extra care in this area today as you're at a sensitive transition point.";
    }
  }

  // High energy (above 70) [cite: 384]
  if (level > 70) {
    switch (dimension) {
      case 'physical': return "Great day for physical activities and tasks requiring stamina. Make the most of your high energy.";
      case 'emotional': return "Excellent day for social connections and emotional expression. Share your feelings and connect with loved ones."; 
      case 'intellectual': return "Ideal day for complex mental work, learning, and making important decisions. Your mental clarity is enhanced."; 
      default: return "Excellent conditions in this area today - use this peak to your advantage."; 
    }
  }

  // Good energy (30 to 70) [cite: 388]
  if (level > 30) {
    switch (dimension) {
      case 'physical': return "Good day for regular physical activity and routine tasks requiring endurance."; 
      case 'emotional': return "Favorable day for emotional stability and healthy relationships. Express yourself with confidence.";
      case 'intellectual': return "Good day for mental work, studying, and solving problems with a clear mind."; 
      default: return "Favorable conditions in this area today - proceed with confidence.";
    }
  }

  // Low energy (-30 to 30) [cite: 392]
  if (level > -30) {
    switch (dimension) {
      case 'physical': return "Moderate physical energy today. Focus on routine tasks and take breaks as needed."; 
      case 'emotional': return "Neutral emotional day. Good for reflection and maintaining routine emotional connections.";
      case 'intellectual': return "Average mental clarity today. Focus on familiar tasks rather than new complex problems."; 
      default: return "Moderate conditions in this area - focus on routine and familiar activities.";
    }
  }

  // Very low energy (-70 to -30) [cite: 396]
  if (level > -70) {
    switch (dimension) {
      case 'physical': return "Consider a lighter schedule for physical activities today. Don't push yourself too hard."; 
      case 'emotional': return "Take time for yourself emotionally today. Keep social interactions light and avoid intense discussions.";
      case 'intellectual': return "Focus on simpler tasks and routine work today. Save complex problem-solving for another day."; 
      default: return "Conserve energy in this area today - focus on lighter activities and self-care.";
    }
  }

  // Extremely low energy (below -70) [cite: 400]
  switch (dimension) {
    case 'physical': return "Focus on rest and recovery today. Postpone demanding physical tasks if possible."; 
    case 'emotional': return "Give yourself emotional space today. Self-care and quiet time are beneficial now."; 
    case 'intellectual': return "Routine tasks are best today. Avoid major decisions and complex problems requiring deep focus."; 
    default: return "Rest and recovery are important in this area today - minimal activity is recommended."; 
  }
};