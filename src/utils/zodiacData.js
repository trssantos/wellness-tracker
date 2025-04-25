// src/utils/zodiacData.js

// Zodiac signs data
export const zodiacSigns = {
    'aries': {
      name: 'Aries',
      dates: 'March 21 - April 19',
      symbol: '♈',
      element: 'Fire',
      ruling_planet: 'Mars',
      description: 'Aries are energetic, assertive, and independent, often taking initiative and leading the way with courage and determination.',
      details: {
        strengths: 'Courageous, determined, confident, enthusiastic, optimistic, honest, passionate',
        weaknesses: 'Impatient, moody, short-tempered, impulsive, aggressive',
        compatibility: 'Leo, Sagittarius, Gemini',
        careers: 'Military, sports, leadership, entrepreneurship, firefighting',
        hobbies: 'Competitive sports, adventure activities, physical challenges, leadership roles',
        wellness: 'Benefit from high-intensity exercise, competition, and activities that release excess energy'
      }
    },
    'taurus': {
      name: 'Taurus',
      dates: 'April 20 - May 20',
      symbol: '♉',
      element: 'Earth',
      ruling_planet: 'Venus',
      description: 'Taurus are reliable, practical, and sensual, with a deep appreciation for beauty and comfort, valuing stability and security.',
      details: {
        strengths: 'Reliable, patient, practical, devoted, responsible, stable',
        weaknesses: 'Stubborn, possessive, uncompromising, inflexible',
        compatibility: 'Virgo, Capricorn, Cancer',
        careers: 'Finance, culinary arts, agriculture, luxury goods, real estate',
        hobbies: 'Gardening, cooking, art collecting, singing, comfort-oriented activities',
        wellness: 'Thrive with consistent, grounding routines and nature-based activities'
      }
    },
    'gemini': {
      name: 'Gemini',
      dates: 'May 21 - June 20',
      symbol: '♊',
      element: 'Air',
      ruling_planet: 'Mercury',
      description: 'Gemini are versatile, curious, and communicative, with quick wit and adaptability, always seeking variety and mental stimulation.',
      details: {
        strengths: 'Gentle, affectionate, curious, adaptable, quick learning, versatile',
        weaknesses: 'Nervous, inconsistent, indecisive, restless',
        compatibility: 'Libra, Aquarius, Sagittarius',
        careers: 'Communications, journalism, teaching, sales, social media',
        hobbies: 'Reading, writing, puzzles, social activities, learning new skills',
        wellness: 'Need variety in exercise and benefit from activities that engage the mind'
      }
    },
    'cancer': {
      name: 'Cancer',
      dates: 'June 21 - July 22',
      symbol: '♋',
      element: 'Water',
      ruling_planet: 'Moon',
      description: 'Cancer are nurturing, emotional, and intuitive, with strong protective instincts and deep emotional connections to home and family.',
      details: {
        strengths: 'Tenacious, highly imaginative, loyal, emotional, sympathetic, persuasive',
        weaknesses: 'Moody, pessimistic, suspicious, manipulative, insecure',
        compatibility: 'Scorpio, Pisces, Taurus',
        careers: 'Healthcare, education, counseling, culinary arts, real estate',
        hobbies: 'Cooking, gardening, genealogy, home decoration, water activities',
        wellness: 'Benefit from water-based activities and emotionally nurturing practices'
      }
    },
    'leo': {
      name: 'Leo',
      dates: 'July 23 - August 22',
      symbol: '♌',
      element: 'Fire',
      ruling_planet: 'Sun',
      description: 'Leo are confident, dramatic, and ambitious, with natural leadership qualities and a generous spirit that draws others to them.',
      details: {
        strengths: 'Creative, passionate, generous, warm-hearted, cheerful, humorous',
        weaknesses: 'Arrogant, stubborn, self-centered, lazy, inflexible',
        compatibility: 'Aries, Sagittarius, Libra',
        careers: 'Entertainment, management, politics, performance, teaching',
        hobbies: 'Performing arts, social activities, luxury experiences, creative expression',
        wellness: 'Thrive with active, social exercise and activities that allow self-expression'
      }
    },
    'virgo': {
      name: 'Virgo',
      dates: 'August 23 - September 22',
      symbol: '♍',
      element: 'Earth',
      ruling_planet: 'Mercury',
      description: 'Virgo are analytical, practical, and meticulous, with a deep sense of duty and attention to detail that drives their methodical approach.',
      details: {
        strengths: 'Loyal, analytical, kind, hardworking, practical, detail-oriented',
        weaknesses: 'Overly critical, perfectionist, shy, worrisome, overly conservative',
        compatibility: 'Taurus, Capricorn, Cancer',
        careers: 'Healthcare, analytics, editing, research, administrative work',
        hobbies: 'Crafts, DIY projects, organization, puzzles, health-focused activities',
        wellness: 'Benefit from structured fitness routines and health-optimization practices'
      }
    },
    'libra': {
      name: 'Libra',
      dates: 'September 23 - October 22',
      symbol: '♎',
      element: 'Air',
      ruling_planet: 'Venus',
      description: 'Libra are diplomatic, fair-minded, and social, with a strong sense of justice and harmony, valuing balanced relationships and aesthetics.',
      details: {
        strengths: 'Cooperative, diplomatic, gracious, fair-minded, social',
        weaknesses: 'Indecisive, avoids confrontation, holds grudges, self-pitying',
        compatibility: 'Gemini, Aquarius, Leo',
        careers: 'Law, diplomacy, design, counseling, human resources',
        hobbies: 'Art appreciation, social events, fashion, relationship-building activities',
        wellness: 'Thrive with partner-based exercise and aesthetically pleasing environments'
      }
    },
    'scorpio': {
      name: 'Scorpio',
      dates: 'October 23 - November 21',
      symbol: '♏',
      element: 'Water',
      ruling_planet: 'Pluto, Mars',
      description: 'Scorpio are passionate, resourceful, and intense, with deep emotional connections and a powerful determination to uncover hidden truths.',
      details: {
        strengths: 'Resourceful, brave, passionate, stubborn, loyal, focused',
        weaknesses: 'Distrusting, jealous, secretive, manipulative, resentful',
        compatibility: 'Cancer, Pisces, Capricorn',
        careers: 'Psychology, investigation, research, surgery, crisis management',
        hobbies: 'Mystery solving, research, strategic games, intense physical activities',
        wellness: 'Benefit from transformative practices and exercises that channel intensity'
      }
    },
    'sagittarius': {
      name: 'Sagittarius',
      dates: 'November 22 - December 21',
      symbol: '♐',
      element: 'Fire',
      ruling_planet: 'Jupiter',
      description: 'Sagittarius are adventurous, optimistic, and philosophical, with a love for freedom and exploration that drives their quest for meaning.',
      details: {
        strengths: 'Generous, idealistic, great sense of humor, adventurous, enthusiastic',
        weaknesses: 'Promises more than can deliver, impatient, says hurtful things',
        compatibility: 'Aries, Leo, Aquarius',
        careers: 'Travel, education, philosophy, outdoor work, entrepreneurship',
        hobbies: 'Travel, outdoor adventures, learning, philosophical discussions',
        wellness: 'Thrive with outdoor activities and exercise that feels like adventure'
      }
    },
    'capricorn': {
      name: 'Capricorn',
      dates: 'December 22 - January 19',
      symbol: '♑',
      element: 'Earth',
      ruling_planet: 'Saturn',
      description: 'Capricorn are disciplined, responsible, and ambitious, with a practical approach to achieving long-term goals through perseverance.',
      details: {
        strengths: 'Responsible, disciplined, ambitious, practical, patient, careful',
        weaknesses: 'Know-it-all, unforgiving, pessimistic, expecting the worst',
        compatibility: 'Taurus, Virgo, Scorpio',
        careers: 'Business, finance, management, government, architecture',
        hobbies: 'Mountain climbing, traditional crafts, collecting, strategic games',
        wellness: 'Benefit from goal-oriented fitness programs and structured routines'
      }
    },
    'aquarius': {
      name: 'Aquarius',
      dates: 'January 20 - February 18',
      symbol: '♒',
      element: 'Air',
      ruling_planet: 'Uranus, Saturn',
      description: 'Aquarius are progressive, original, and independent, with humanitarian ideals and innovative thinking that challenge the status quo.',
      details: {
        strengths: 'Progressive, original, independent, humanitarian, inventive',
        weaknesses: 'Emotionally detached, temperamental, uncompromising, aloof',
        compatibility: 'Gemini, Libra, Sagittarius',
        careers: 'Science, technology, social activism, research, psychology',
        hobbies: 'Technology, social causes, unique activities, scientific exploration',
        wellness: 'Thrive with innovative exercise programs and intellectual approaches to health'
      }
    },
    'pisces': {
      name: 'Pisces',
      dates: 'February 19 - March 20',
      symbol: '♓',
      element: 'Water',
      ruling_planet: 'Neptune, Jupiter',
      description: 'Pisces are intuitive, compassionate, and artistic, with spiritual depth and emotional sensitivity that connect them to universal experiences.',
      details: {
        strengths: 'Compassionate, intuitive, artistic, gentle, wise, musical',
        weaknesses: 'Fearful, overly trusting, sad, desire to escape reality',
        compatibility: 'Cancer, Scorpio, Capricorn',
        careers: 'Arts, healthcare, spiritual work, counseling, veterinary',
        hobbies: 'Music, poetry, water activities, meditation, creative expression',
        wellness: 'Benefit from gentle, flowing exercises and mind-body practices'
      }
    }
  };

export const getZodiacSign = (birthDate) => {
    // Check if birthDate is valid
    if (!birthDate || !(birthDate instanceof Date) || isNaN(birthDate.getTime())) {
      console.warn('Invalid birth date provided to getZodiacSign:', birthDate);
      return null; // Return null for invalid date
    }

    const month = birthDate.getMonth() + 1; // JavaScript months are 0-based
    const day = birthDate.getDate();

    // Determine zodiac sign based on month and day
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return 'aries';
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return 'taurus';
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return 'gemini';
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return 'cancer';
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return 'leo';
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return 'virgo';
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return 'libra';
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return 'scorpio';
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return 'sagittarius';
    } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
      return 'capricorn';
    } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return 'aquarius';
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return 'pisces';
    }

    return null; // Return null if date doesn't match any sign
  };

// Get color scheme for zodiac sign
  export const getZodiacColors = (sign) => {
    // Default colors if sign not found
    const defaultColors = {
      bg: 'bg-slate-50 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      accent: 'text-slate-500 dark:text-slate-400',
      icon: 'text-slate-500 dark:text-slate-400'
    };
    // Define colors by element
    const elementColors = {
      fire: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800/40',
        accent: 'text-red-500 dark:text-red-400',
        icon: 'text-red-500 dark:text-red-400'
      },
      earth: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800/40',
        accent: 'text-green-500 dark:text-green-400',
        icon: 'text-green-500 dark:text-green-400'
      },
      air: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800/40',
        accent: 'text-blue-500 dark:text-blue-400',
        icon: 'text-blue-500 dark:text-blue-400'
      },
      water: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800/40',
        accent: 'text-purple-500 dark:text-purple-400',
        icon: 'text-purple-500 dark:text-purple-400'
      }
    };
    // If sign not found or invalid, return default colors
    if (!sign || !zodiacSigns[sign]) {
      return defaultColors;
    }

    // Get element for the sign
    const element = zodiacSigns[sign].element.toLowerCase();
    // Return colors based on element
    return elementColors[element] || defaultColors;
  };

// Get zodiac compatibility between two signs
  export const getZodiacCompatibility = (sign1, sign2) => {
    // Validate input
    if (!sign1 || !sign2 || !zodiacSigns[sign1] || !zodiacSigns[sign2]) {
      return { score: 50, description: 'Unknown compatibility' };
    }

    // Get elements for both signs
    const element1 = zodiacSigns[sign1].element.toLowerCase();
    const element2 = zodiacSigns[sign2].element.toLowerCase();

    // Get modalities for both signs
    const getModality = (sign) => {
      const cardinalSigns = ['aries', 'cancer', 'libra', 'capricorn'];
      const fixedSigns = ['taurus', 'leo', 'scorpio', 'aquarius'];
      const mutableSigns = ['gemini', 'virgo', 'sagittarius', 'pisces'];

      if (cardinalSigns.includes(sign)) return 'cardinal';
      if (fixedSigns.includes(sign)) return 'fixed';
      if (mutableSigns.includes(sign)) return 'mutable';
      return null;
    };

    const modality1 = getModality(sign1);
    const modality2 = getModality(sign2);
    // Calculate base score
    let score = 50;
    // Same sign has good compatibility
    if (sign1 === sign2) {
      score += 20;
    }

    // Element compatibility
    if (element1 === element2) {
      // Same element is harmonious
      score += 20;
    } else {
      // Complementary elements (fire-air, earth-water)
      const complementaryPairs = [
        ['fire', 'air'],
        ['earth', 'water']
      ];
      const areComplementary = complementaryPairs.some(pair =>
        (pair[0] === element1 && pair[1] === element2) ||
        (pair[0] === element2 && pair[1] === element1)
      );
      if (areComplementary) {
        score += 15;
      } else {
        // Challenging elements (fire-water, earth-air)
        score -= 10;
      }
    }

    // Modality compatibility
    if (modality1 === modality2) {
      // Same modality can create friction
      score -= 5;
    }

    // Check if in each other's compatibility lists
    const isInCompatibilityList = (sign, targetSign) => {
      const compatibilityList = zodiacSigns[sign]?.details.compatibility.toLowerCase().split(', ');
      return compatibilityList && compatibilityList.includes(targetSign);
    };

    if (isInCompatibilityList(sign1, sign2) || isInCompatibilityList(sign2, sign1)) {
      score += 20;
    }

    // Special combinations with strong compatibility
    const strongPairs = [
      ['aries', 'leo'], ['taurus', 'cancer'], ['gemini', 'aquarius'],
      ['cancer', 'pisces'], ['leo', 'sagittarius'], ['virgo', 'capricorn'],
      ['libra', 'gemini'], ['scorpio', 'pisces'], ['sagittarius', 'aries'],
      ['capricorn', 'taurus'], ['aquarius', 'gemini'], ['pisces', 'scorpio']
    ];
    const isStrongPair = strongPairs.some(pair =>
      (pair[0] === sign1 && pair[1] === sign2) ||
      (pair[0] === sign2 && pair[1] === sign1)
    );
    if (isStrongPair) {
      score += 10;
    }

    // Ensure score is between 0-100
    score = Math.min(100, Math.max(0, score));

    // Generate description
    let description = '';
    if (score >= 80) {
      description = 'Exceptional compatibility with natural harmony and understanding.';
    } else if (score >= 70) {
      description = 'Strong compatibility with complementary energies that balance each other.';
    } else if (score >= 60) {
      description = 'Good compatibility with some differences that can strengthen the relationship.';
    } else if (score >= 50) {
      description = 'Average compatibility requiring effort to understand different perspectives.';
    } else if (score >= 40) {
      description = 'Challenging compatibility with considerable differences to navigate.';
    } else {
      description = 'Difficult compatibility requiring significant work on understanding each other.';
    }

    return {
      score,
      description,
      elementMatch: element1 === element2,
      complementaryElements: element1 !== element2 && (
        (element1 === 'fire' && element2 === 'air') ||
        (element1 === 'air' && element2 === 'fire') ||
        (element1 === 'earth' && element2 === 'water') ||
        (element1 === 'water' && element2 === 'earth')
      ),
      modalityMatch: modality1 === modality2
    };
  };

export default zodiacSigns;