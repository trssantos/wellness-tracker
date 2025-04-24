// src/utils/numerologyUtils.js
/**
 * Utility functions for numerology calculations
 */

// Reduce a number to a single digit (except master numbers 11, 22, 33)
export const reduceToSingleDigit = (number, preserveMasterNumbers = true) => {
    // Convert to string to process each digit
    const numStr = String(number);
    
    // If it's already a single digit, return it
    if (numStr.length === 1) {
      return parseInt(numStr);
    }
    
    // Check for master numbers if preservation is requested
    if (preserveMasterNumbers) {
      if (numStr === '11' || numStr === '22' || numStr === '33') {
        return parseInt(numStr);
      }
    }
    
    // Sum the digits
    const sum = numStr.split('').reduce((total, digit) => total + parseInt(digit), 0);
    
    // Recursively reduce until we get a single digit or master number
    return reduceToSingleDigit(sum, preserveMasterNumbers);
  };
  
  // Calculate Life Path Number from birth date
  export const calculateLifePathNumber = (birthDate) => {
    if (!birthDate) return null;
    
    // Ensure birthDate is a Date object
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return null;
    
    const day = date.getDate();
    const month = date.getMonth() + 1; // getMonth() is 0-based
    const year = date.getFullYear();
    
    // Reduce each component
    const reducedDay = reduceToSingleDigit(day);
    const reducedMonth = reduceToSingleDigit(month);
    
    // For the year, first sum all digits, then reduce
    const yearSum = String(year).split('').reduce((total, digit) => total + parseInt(digit), 0);
    const reducedYear = reduceToSingleDigit(yearSum);
    
    // Sum all reduced values and reduce again to get Life Path Number
    const sum = reducedDay + reducedMonth + reducedYear;
    
    return reduceToSingleDigit(sum);
  };
  
  // Convert name to numbers for numerology
  const letterToNumber = (letter) => {
    const letterMap = {
      'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
      'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
      's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    };
    
    return letterMap[letter.toLowerCase()] || 0;
  };
  
  // Calculate Destiny/Expression Number from full name
  export const calculateDestinyNumber = (fullName) => {
    if (!fullName) return null;
    
    // Remove non-alphabetic characters and spaces
    const name = fullName.replace(/[^a-zA-Z]/g, '');
    
    // Convert each letter to a number and sum
    const sum = name.split('').reduce((total, letter) => total + letterToNumber(letter), 0);
    
    // Reduce to a single digit or master number
    return reduceToSingleDigit(sum);
  };
  
  // Check if a letter is a vowel
  const isVowel = (letter) => {
    return ['a', 'e', 'i', 'o', 'u'].includes(letter.toLowerCase());
  };
  
  // Calculate Soul Urge/Heart's Desire Number from vowels
  export const calculateSoulUrgeNumber = (fullName) => {
    if (!fullName) return null;
    
    // Remove non-alphabetic characters
    const name = fullName.replace(/[^a-zA-Z]/g, '');
    
    // Extract vowels and convert to numbers
    const vowels = name.split('').filter(letter => isVowel(letter));
    const sum = vowels.reduce((total, vowel) => total + letterToNumber(vowel), 0);
    
    // Reduce to a single digit or master number
    return reduceToSingleDigit(sum);
  };
  
  // Calculate Personality Number from consonants
  export const calculatePersonalityNumber = (fullName) => {
    if (!fullName) return null;
    
    // Remove non-alphabetic characters
    const name = fullName.replace(/[^a-zA-Z]/g, '');
    
    // Extract consonants and convert to numbers
    const consonants = name.split('').filter(letter => !isVowel(letter));
    const sum = consonants.reduce((total, consonant) => total + letterToNumber(consonant), 0);
    
    // Reduce to a single digit or master number
    return reduceToSingleDigit(sum);
  };
  
  // Calculate Birthday Number
  export const calculateBirthdayNumber = (birthDate) => {
    if (!birthDate) return null;
    
    // Ensure birthDate is a Date object
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return null;
    
    const day = date.getDate();
    
    // Reduce to single digit (but preserve 11 and 22 if birth day is exactly that)
    if (day === 11 || day === 22) {
      return day;
    }
    
    return reduceToSingleDigit(day);
  };
  
  // Interpretation for Life Path Number
  export const getLifePathInterpretation = (number) => {
    const interpretations = {
      1: {
        title: "The Leader",
        strengths: "Independent, pioneering, ambitious, confident, creative, determined",
        challenges: "Can be egotistical, stubborn, or overly dominant",
        career: "Leadership positions, entrepreneurship, self-employment, management",
        explanation: "You're a natural leader with strong drive and determination. As a Life Path 1, your purpose is to develop independence, self-confidence, and innovative thinking. You're here to pioneer new ways of doing things and to lead by example."
      },
      2: {
        title: "The Mediator",
        strengths: "Diplomatic, cooperative, sensitive, empathetic, patient, detail-oriented",
        challenges: "Can be overly sensitive, indecisive, or dependent on others",
        career: "Counseling, human resources, customer service, team environments, education",
        explanation: "You're naturally diplomatic and cooperative. As a Life Path 2, your purpose is to develop patience, cooperation, and emotional intelligence. You're here to build bridges between people and create harmony in relationships."
      },
      3: {
        title: "The Expressive Creator",
        strengths: "Creative, communicative, social, optimistic, inspiring, artistic",
        challenges: "Can scatter energy, lack focus, or be overly critical",
        career: "Arts, writing, entertainment, communication, teaching, design",
        explanation: "You're naturally creative and expressive. As a Life Path 3, your purpose is to develop creativity, joy, and authentic self-expression. You're here to inspire others through your ideas and vision."
      },
      4: {
        title: "The Builder",
        strengths: "Practical, reliable, organized, hardworking, systematic, honest",
        challenges: "Can be rigid, stubborn, or too focused on routine",
        career: "Administration, finance, engineering, construction, planning, process management",
        explanation: "You're naturally organized and methodical. As a Life Path 4, your purpose is to develop discipline, stability, and practical solutions. You're here to build solid foundations for yourself and others."
      },
      5: {
        title: "The Freedom Seeker",
        strengths: "Adaptable, versatile, curious, adventurous, progressive, resourceful",
        challenges: "Can be restless, impatient, or averse to commitment",
        career: "Travel, sales, marketing, entertainment, entrepreneurship, varied careers",
        explanation: "You're naturally adaptable and freedom-loving. As a Life Path 5, your purpose is to develop versatility, constructive use of freedom, and courage. You're here to experience life fully and inspire others to embrace change."
      },
      6: {
        title: "The Nurturer",
        strengths: "Responsible, caring, supportive, nurturing, creative, service-oriented",
        challenges: "Can be controlling, self-sacrificing, or perfectionistic",
        career: "Healthcare, counseling, education, home-related professions, community service",
        explanation: "You're naturally nurturing and responsible. As a Life Path 6, your purpose is to develop compassion, balance, and service. You're here to create harmony in your home and community."
      },
      7: {
        title: "The Seeker",
        strengths: "Analytical, introspective, intuitive, spiritual, curious, knowledgeable",
        challenges: "Can be isolated, critical, or overly analytical",
        career: "Research, academia, science, spirituality, psychology, technology",
        explanation: "You're naturally analytical and thoughtful. As a Life Path 7, your purpose is to develop wisdom, spirituality, and specialized knowledge. You're here to seek deeper truths and understanding."
      },
      8: {
        title: "The Powerhouse",
        strengths: "Ambitious, organized, efficient, practical, goal-oriented, authoritative",
        challenges: "Can be workaholic, materialistic, or controlling",
        career: "Business, finance, management, law, investment, executive positions",
        explanation: "You're naturally business-minded and capable. As a Life Path 8, your purpose is to develop personal power, abundance, and good judgment. You're here to achieve material and spiritual balance."
      },
      9: {
        title: "The Humanitarian",
        strengths: "Compassionate, giving, creative, tolerant, idealistic, wise",
        challenges: "Can be aloof, impractical, or emotionally distant",
        career: "Arts, healing professions, counseling, non-profit work, international relations",
        explanation: "You're naturally compassionate and idealistic. As a Life Path 9, your purpose is to develop universal compassion, selfless service, and completion. You're here to give back to the world and inspire higher ideals."
      },
      11: {
        title: "The Inspirational Messenger",
        strengths: "Intuitive, inspiring, idealistic, visionary, sensitive, spiritual",
        challenges: "Can be overly nervous, impractical, or extremely sensitive",
        career: "Teaching, counseling, spiritual leadership, inspirational speaking, healing arts",
        explanation: "You possess heightened intuition and inspiration. As a Life Path 11, your purpose is to develop spiritual insight, inspire others, and bring illumination. You're here to channel higher wisdom and elevate consciousness."
      },
      22: {
        title: "The Master Builder",
        strengths: "Visionary, practical, powerful, disciplined, ambitious, influential",
        challenges: "Can experience great internal pressure or overwhelming expectations",
        career: "Architecture, large-scale projects, business leadership, innovation, engineering",
        explanation: "You have extraordinary capacity to manifest ideas into reality. As a Life Path 22, your purpose is to build lasting structures that benefit many. You're here to transform dreams into practical realities on a large scale."
      },
      33: {
        title: "The Master Teacher",
        strengths: "Compassionate, inspiring, nurturing, healing, creative, influential",
        challenges: "Can be self-sacrificing or have difficulty with personal boundaries",
        career: "Education, spiritual teaching, healing, counseling, arts, community leadership",
        explanation: "You have exceptional abilities to nurture, teach, and heal. As a Life Path 33, your purpose is to elevate others through compassionate guidance and wisdom. You're here to create positive transformation through selfless love and service."
      }
    };
    
    return interpretations[number] || {
      title: "Unknown",
      strengths: "Not available",
      challenges: "Not available",
      career: "Not available",
      explanation: "Interpretation not available for this number."
    };
  };
  
  // Interpretation for Destiny/Expression Number
  export const getDestinyInterpretation = (number) => {
    const interpretations = {
      1: {
        title: "The Independent Achiever",
        message: "Your destiny is to be a leader and pioneer. You express yourself with originality and independence. You're meant to forge new paths and develop your individuality and leadership abilities."
      },
      2: {
        title: "The Cooperative Partner",
        message: "Your destiny is to be a mediator and peacemaker. You express yourself through relationships and cooperation. You're meant to create harmony and develop your diplomacy and intuition."
      },
      3: {
        title: "The Creative Communicator",
        message: "Your destiny is to express yourself creatively. You naturally communicate in engaging ways. You're meant to inspire others through your self-expression and develop your creative gifts."
      },
      4: {
        title: "The Practical Builder",
        message: "Your destiny is to create stability and order. You express yourself through organization and hard work. You're meant to build solid foundations and develop your practical skills."
      },
      5: {
        title: "The Freedom Lover",
        message: "Your destiny is to experience life fully. You express yourself through versatility and adaptability. You're meant to embrace change and develop your ability to make constructive use of freedom."
      },
      6: {
        title: "The Responsible Nurturer",
        message: "Your destiny is to create harmony and beauty. You express yourself through service and care for others. You're meant to nurture and develop your sense of responsibility and creativity."
      },
      7: {
        title: "The Philosophical Thinker",
        message: "Your destiny is to seek understanding and truth. You express yourself through analysis and introspection. You're meant to develop wisdom and your spiritual and intellectual capacities."
      },
      8: {
        title: "The Capable Achiever",
        message: "Your destiny is to achieve material and spiritual balance. You express yourself through organization and ambition. You're meant to develop good judgment and the wise use of power."
      },
      9: {
        title: "The Humanitarian",
        message: "Your destiny is to serve humanity. You express yourself through compassion and artistic endeavors. You're meant to develop universal love and learn to let go of attachments."
      },
      11: {
        title: "The Inspirational Channel",
        message: "Your destiny is to inspire and illuminate. You express yourself through intuition and idealism. You're meant to channel higher wisdom and develop your spiritual awareness."
      },
      22: {
        title: "The Practical Visionary",
        message: "Your destiny is to build significant structures or systems. You express yourself through practical vision and large-scale endeavors. You're meant to manifest ambitious dreams into reality."
      },
      33: {
        title: "The Compassionate Teacher",
        message: "Your destiny is to uplift others. You express yourself through nurturing guidance and wisdom. You're meant to develop selfless service and create positive transformation through love."
      }
    };
    
    return interpretations[number] || {
      title: "Unknown",
      message: "Interpretation not available for this number."
    };
  };
  
  // Interpretation for Soul Urge Number
  export const getSoulUrgeInterpretation = (number) => {
    const interpretations = {
      1: {
        title: "The Independent Soul",
        message: "Your heart desires independence and achievement. You find fulfillment when leading and pioneering new paths. Deep down, you want to make a unique mark on the world through your individuality and self-reliance."
      },
      2: {
        title: "The Harmonious Soul",
        message: "Your heart desires peace and cooperation. You find fulfillment in close partnerships and creating harmony. Deep down, you want to connect with others and experience love and balanced relationships."
      },
      3: {
        title: "The Expressive Soul",
        message: "Your heart desires creative expression and joy. You find fulfillment in communicating and sharing ideas. Deep down, you want to inspire others and experience the fullness of emotional and creative life."
      },
      4: {
        title: "The Stable Soul",
        message: "Your heart desires order and security. You find fulfillment in creating solid foundations. Deep down, you want a stable, predictable environment where you can build something of lasting value."
      },
      5: {
        title: "The Freedom-Loving Soul",
        message: "Your heart desires freedom and variety. You find fulfillment in adventure and new experiences. Deep down, you want to explore life's possibilities without restriction or routine."
      },
      6: {
        title: "The Nurturing Soul",
        message: "Your heart desires harmony and beauty. You find fulfillment in caring for others and creating comfort. Deep down, you want to love and be loved, and to create an ideal environment."
      },
      7: {
        title: "The Seeking Soul",
        message: "Your heart desires wisdom and understanding. You find fulfillment in spiritual and intellectual pursuits. Deep down, you want to uncover life's mysteries and understand the deeper truths."
      },
      8: {
        title: "The Abundant Soul",
        message: "Your heart desires achievement and recognition. You find fulfillment in material success and influence. Deep down, you want to create abundance and experience personal power."
      },
      9: {
        title: "The Compassionate Soul",
        message: "Your heart desires to serve humanity. You find fulfillment in giving and creating universal harmony. Deep down, you want to make the world better and transcend personal limitations."
      },
      11: {
        title: "The Intuitive Soul",
        message: "Your heart desires spiritual connection and inspiration. You find fulfillment in pursuing idealistic visions. Deep down, you want to access higher wisdom and share profound insights."
      },
      22: {
        title: "The Visionary Soul",
        message: "Your heart desires to build something significant. You find fulfillment in manifesting ambitious dreams. Deep down, you want to create lasting structures that benefit humanity."
      },
      33: {
        title: "The Nurturing Master Soul",
        message: "Your heart desires to uplift humanity through compassion. You find fulfillment in selfless service and teaching. Deep down, you want to heal and transform others through unconditional love."
      }
    };
    
    return interpretations[number] || {
      title: "Unknown",
      message: "Interpretation not available for this number."
    };
  };
  
  // Interpretation for Personality Number
  export const getPersonalityInterpretation = (number) => {
    const interpretations = {
      1: {
        title: "Strong & Independent",
        message: "You present yourself as confident, capable, and self-reliant. Others see you as decisive and original, with leadership abilities. You appear independent and pioneering in your approach to life."
      },
      2: {
        title: "Diplomatic & Considerate",
        message: "You present yourself as cooperative, gentle, and considerate. Others see you as a good listener and mediator. You appear tactful and supportive, with sensitivity to others' needs."
      },
      3: {
        title: "Expressive & Sociable",
        message: "You present yourself as optimistic, friendly, and outgoing. Others see you as creative and communicative. You appear entertaining and engaging, with a vibrant approach to life."
      },
      4: {
        title: "Reliable & Practical",
        message: "You present yourself as organized, hardworking, and dependable. Others see you as trustworthy and methodical. You appear stable and practical, with attention to detail."
      },
      5: {
        title: "Versatile & Adventurous",
        message: "You present yourself as adaptable, progressive, and adventurous. Others see you as versatile and exciting. You appear freedom-loving and dynamic, with a progressive approach to life."
      },
      6: {
        title: "Responsible & Harmonious",
        message: "You present yourself as nurturing, responsible, and balanced. Others see you as reliable and caring. You appear family-oriented and protective, with an eye for beauty and harmony."
      },
      7: {
        title: "Analytical & Reserved",
        message: "You present yourself as thoughtful, introspective, and private. Others see you as analytical and wise. You appear mysterious and intellectual, with a contemplative approach to life."
      },
      8: {
        title: "Powerful & Authoritative",
        message: "You present yourself as confident, goal-oriented, and capable. Others see you as ambitious and strong. You appear business-minded and driven, with good organizational abilities."
      },
      9: {
        title: "Sophisticated & Compassionate",
        message: "You present yourself as compassionate, sophisticated, and wise. Others see you as global-minded and artistic. You appear selfless and idealistic, with a humanitarian approach to life."
      },
      11: {
        title: "Inspiring & Intuitive",
        message: "You present yourself as sensitive, inspirational, and idealistic. Others see you as visionary and intuitive. You appear spiritually aware and insightful, with a high-minded approach to life."
      },
      22: {
        title: "Practical & Visionary",
        message: "You present yourself as capable, structured, and ambitious. Others see you as a master organizer with practical vision. You appear powerful and determined, with extraordinary capacities."
      },
      33: {
        title: "Nurturing Master Teacher",
        message: "You present yourself as compassionate, inspiring, and wise. Others see you as a natural healer and teacher. You appear selfless and spiritually aware, with extraordinary capacities for service."
      }
    };
    
    return interpretations[number] || {
      title: "Unknown",
      message: "Interpretation not available for this number."
    };
  };
  
  // Interpretation for Birthday Number
  export const getBirthdayInterpretation = (number) => {
    const interpretations = {
      1: {
        title: "The Individualist",
        message: "Your birth day indicates individualistic qualities, leadership abilities, and original thinking. Your natural gifts include independence, determination, and pioneering spirit."
      },
      2: {
        title: "The Partner",
        message: "Your birth day indicates cooperative qualities, intuition, and sensitivity. Your natural gifts include diplomacy, harmony-creation, and attention to detail."
      },
      3: {
        title: "The Communicator",
        message: "Your birth day indicates creative expression, sociability, and optimism. Your natural gifts include communications, artistic ability, and bringing joy to others."
      },
      4: {
        title: "The Builder",
        message: "Your birth day indicates organizational ability, reliability, and methodical thinking. Your natural gifts include creating stable structures, practical thinking, and diligent work."
      },
      5: {
        title: "The Freedom Lover",
        message: "Your birth day indicates versatility, adaptability, and love of freedom. Your natural gifts include versatility, resourcefulness, and progressive thinking."
      },
      6: {
        title: "The Responsible One",
        message: "Your birth day indicates nurturing qualities, responsibility, and artistic sensibility. Your natural gifts include caring for others, creating harmony, and balancing situations."
      },
      7: {
        title: "The Thinker",
        message: "Your birth day indicates analytical ability, depth of thought, and intuition. Your natural gifts include intellectual prowess, spiritual awareness, and investigative mind."
      },
      8: {
        title: "The Achiever",
        message: "Your birth day indicates executive ability, ambition, and practical thinking. Your natural gifts include business sense, organization, and the ability to attain goals."
      },
      9: {
        title: "The Humanitarian",
        message: "Your birth day indicates compassion, artistic sensibility, and idealism. Your natural gifts include generosity, creativity, and universal perspective."
      },
      10: {
        title: "The Leader",
        message: "Your birth day indicates independence with higher awareness, leadership with cooperative elements. Your natural gifts blend individuality with consideration for others."
      },
      11: {
        title: "The Intuitive",
        message: "Your birth day indicates high intuition, inspiration, and idealism. Your natural gifts include visionary thinking, sensitivity, and healing abilities."
      },
      12: {
        title: "The Creative Perfectionist",
        message: "Your birth day blends creative expression with practical skills. Your natural gifts include articulate communication and detailed organization."
      },
      13: {
        title: "The Transformer",
        message: "Your birth day indicates adaptability, expression, and capacity for transformation. Your natural gifts include versatility and bringing new perspectives to situations."
      },
      14: {
        title: "The Practical Free Spirit",
        message: "Your birth day blends practicality with a need for freedom. Your natural gifts include creating stable innovations and practical applications of new ideas."
      },
      15: {
        title: "The Communicative Adventurer",
        message: "Your birth day indicates versatility, enthusiasm, and expressiveness. Your natural gifts include adaptability, creativity, and promoting change."
      },
      16: {
        title: "The Visionary Builder",
        message: "Your birth day indicates insight, practicality, and capacity for transformation. Your natural gifts include seeing beyond conventional perspectives and manifesting visions."
      },
      17: {
        title: "The Analytical Explorer",
        message: "Your birth day indicates analytical ability with progressive thinking. Your natural gifts include intellectual exploration and finding unconventional paths to truth."
      },
      18: {
        title: "The Manifesting Humanitarian",
        message: "Your birth day indicates executive ability with compassionate awareness. Your natural gifts include creating material success that benefits others."
      },
      19: {
        title: "The Independent Humanitarian",
        message: "Your birth day indicates independent thinking with universal perspective. Your natural gifts include pioneering new approaches to global challenges."
      },
      20: {
        title: "The Sensitive Diplomat",
        message: "Your birth day indicates heightened intuition and cooperative abilities. Your natural gifts include creating partnerships and nurturing connections."
      },
      21: {
        title: "The Creative Partner",
        message: "Your birth day blends creative expression with cooperative awareness. Your natural gifts include creative collaboration and inspiring others through harmony."
      },
      22: {
        title: "The Master Builder",
        message: "Your birth day indicates extraordinary practical vision and manifestation ability. Your natural gifts include transforming ambitious dreams into tangible realities."
      },
      23: {
        title: "The Expressive Humanitarian",
        message: "Your birth day blends creative communication with service orientation. Your natural gifts include inspiring others through artistic expression for universal benefit."
      },
      24: {
        title: "The Balanced Builder",
        message: "Your birth day blends practical organization with harmonious awareness. Your natural gifts include creating stable structures while maintaining harmony."
      },
      25: {
        title: "The Progressive Freedom Seeker",
        message: "Your birth day indicates adaptability, flexibility, and progressive thinking. Your natural gifts include catalyzing change and embracing new possibilities."
      },
      26: {
        title: "The Responsible Leader",
        message: "Your birth day blends nurturing qualities with leadership abilities. Your natural gifts include creating environments where others can thrive under your guidance."
      },
      27: {
        title: "The Intuitive Teacher",
        message: "Your birth day blends spiritual insight with analytical abilities. Your natural gifts include teaching profound truths with intellectual clarity."
      },
      28: {
        title: "The Visionary Leader",
        message: "Your birth day blends leadership with vision and practical abilities. Your natural gifts include inspiring and organizing others toward shared goals."
      },
      29: {
        title: "The Compassionate Leader",
        message: "Your birth day blends humanitarian awareness with leadership. Your natural gifts include inspiring others toward service and universal perspective."
      },
      30: {
        title: "The Expressive Communicator",
        message: "Your birth day indicates heightened creative and expressive abilities. Your natural gifts include communication, creativity, and bringing joy to others."
      },
      31: {
        title: "The Creative Individualist",
        message: "Your birth day blends creative expression with individuality. Your natural gifts include original and pioneering artistic expressions."
      }
    };
    
    // For numbers above 31, return a default message
    if (number > 31) {
      return {
        title: "Unknown",
        message: "Interpretation not available for this number."
      };
    }
    
    return interpretations[number] || {
      title: "Unknown",
      message: "Interpretation not available for this number."
    };
  };
  
  // Get color theme for a numerology number
  export const getNumerologyColor = (number) => {
    // Map each number to a color theme
    const colorMap = {
      1: { main: 'red-500', light: 'red-100', dark: 'red-700' },
      2: { main: 'blue-500', light: 'blue-100', dark: 'blue-700' },
      3: { main: 'yellow-500', light: 'yellow-100', dark: 'yellow-700' },
      4: { main: 'green-500', light: 'green-100', dark: 'green-700' },
      5: { main: 'orange-500', light: 'orange-100', dark: 'orange-700' },
      6: { main: 'pink-500', light: 'pink-100', dark: 'pink-700' },
      7: { main: 'purple-500', light: 'purple-100', dark: 'purple-700' },
      8: { main: 'indigo-500', light: 'indigo-100', dark: 'indigo-700' },
      9: { main: 'teal-500', light: 'teal-100', dark: 'teal-700' },
      11: { main: 'violet-500', light: 'violet-100', dark: 'violet-700' },
      22: { main: 'amber-500', light: 'amber-100', dark: 'amber-700' },
      33: { main: 'rose-500', light: 'rose-100', dark: 'rose-700' }
    };
    
    // Return the appropriate color theme or a default
    return colorMap[number] || { main: 'slate-500', light: 'slate-100', dark: 'slate-700' };
  };