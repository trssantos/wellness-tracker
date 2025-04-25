// src/utils/enneagramData.js

// Enneagram types information
export const enneagramTypes = {
    '1': {
      name: "The Perfectionist",
      description: "Ethical, dedicated and reliable, they are motivated by a desire to live the right way, improve the world, and avoid fault and blame.",
      wingInfluence: "elements of creativity and emotional awareness to your perfectionistic tendencies.",
      strengths: "Honest, responsible, improvement-oriented, ethical, fair",
      weaknesses: "Critical, perfectionistic, judgmental, tense, controlling",
      compatibleWith: ["2", "7", "9"],
      challengingWith: ["8", "4"]
    },
    '2': {
      name: "The Helper",
      description: "Warm, caring and generous, they are motivated by a need to be loved and needed, and to avoid acknowledging their own needs.",
      wingInfluence: "a mix of supportiveness with either organization or self-expression.",
      strengths: "Caring, interpersonal, warm, supporting, giving",
      weaknesses: "People-pleasing, possessive, manipulative, emotional",
      compatibleWith: ["1", "4", "8"],
      challengingWith: ["5", "3"]
    },
    '3': {
      name: "The Achiever",
      description: "Success-oriented, image-conscious and wired for productivity, they are motivated by a need to be successful and to avoid failure.",
      wingInfluence: "either emotional depth or reflective inquiry to your achievement orientation.",
      strengths: "Efficient, practical, ambitious, inspiring, competent",
      weaknesses: "Image-conscious, competitive, narcissistic, workaholic",
      compatibleWith: ["6", "9", "1"],
      challengingWith: ["4", "7"]
    },
    '4': {
      name: "The Individualist",
      description: "Creative, sensitive and moody, they are motivated by a need to be understood, experience their oversized feelings and avoid being ordinary.",
      wingInfluence: "either a helping attitude or analytical thinking to your emotional depth.",
      strengths: "Creative, authentic, emotional depth, inspiration, compassion",
      weaknesses: "Moody, self-absorbed, melancholic, withdrawn, envious",
      compatibleWith: ["2", "9", "5"],
      challengingWith: ["3", "8"]
    },
    '5': {
      name: "The Investigator",
      description: "Analytical, detached and private, they are motivated by a need to gain knowledge, conserve energy and avoid relying on others.",
      wingInfluence: "either artistic sensitivity or methodical conscientiousness to your analytical nature.",
      strengths: "Analytical, thoughtful, innovative, objective, perceptive",
      weaknesses: "Detached, isolated, overthinking, provocative, stingy",
      compatibleWith: ["1", "7", "9"],
      challengingWith: ["2", "6"]
    },
    '6': {
      name: "The Loyalist",
      description: "Committed, practical and witty, they are motivated by fear and the need for security.",
      wingInfluence: "either adventurousness or methodical thinking to your loyalty-focused perspective.",
      strengths: "Loyal, responsible, committed, practical, problem-solving",
      weaknesses: "Anxious, doubtful, fearful, suspicious, indecisive",
      compatibleWith: ["3", "8", "9"],
      challengingWith: ["5", "1"]
    },
    '7': {
      name: "The Enthusiast",
      description: "Fun, spontaneous and versatile, they are motivated by a need to be happy, plan stimulating experiences and avoid pain.",
      wingInfluence: "either strategic thinking or responsible diligence to your enthusiastic outlook.",
      strengths: "Optimistic, enthusiastic, productive, versatile, adventurous",
      weaknesses: "Scattered, impulsive, escapist, undisciplined, excessive",
      compatibleWith: ["3", "5", "9"],
      challengingWith: ["1", "4"]
    },
    '8': {
      name: "The Challenger",
      description: "Commanding, intense and confrontational, they are motivated by a need to be strong and avoid feeling weak or vulnerable.",
      wingInfluence: "either adventure-seeking or purpose-driven loyalty to your powerful presence.",
      strengths: "Strong, assertive, protective, decisive, resilient",
      weaknesses: "Controlling, domineering, confrontational, aggressive",
      compatibleWith: ["2", "4", "6"],
      challengingWith: ["5", "1"]
    },
    '9': {
      name: "The Peacemaker",
      description: "Pleasant, laid back and accommodating, they are motivated by a need to keep the peace, merge with others and avoid conflict.",
      wingInfluence: "either assertiveness or perfectionism to your harmonious nature.",
      strengths: "Harmonious, accepting, stable, supportive, optimistic",
      weaknesses: "Complacent, conflict-avoidant, stubborn, disengaged",
      compatibleWith: ["1", "3", "5"],
      challengingWith: ["6", "8"]
    }
  };
  
  // Type motivations (expanded)
  export const typeMotivations = {
    '1': "Type 1s are motivated by a deep desire to be good, right, and above reproach. They strive to reform and improve the world according to their high internal standards.",
    '2': "Type 2s are motivated by a need to feel loved, appreciated, and connected to others. They focus on helping others to fulfill this need.",
    '3': "Type 3s are motivated by a desire to be successful, admired, and validated for their achievements. They adapt their image to be what they believe others will value.",
    '4': "Type 4s are motivated by a need to express their individuality and be understood for their authentic self. They seek deeper meaning and emotional connection.",
    '5': "Type 5s are motivated by a need to understand the world, master skills, and preserve their energy and resources. They gather knowledge to feel competent.",
    '6': "Type 6s are motivated by a need for security, guidance, and certainty in an unpredictable world. They seek safety through allegiance to people or belief systems.",
    '7': "Type 7s are motivated by a desire to experience all of life's possibilities and avoid pain or limitation. They seek variety, stimulation, and freedom.",
    '8': "Type 8s are motivated by a need to be strong, powerful, and in control of their own destiny. They protect themselves and others from being controlled or manipulated.",
    '9': "Type 9s are motivated by a desire for harmony, peace, and stability. They avoid conflict and merge with others' agendas to maintain connection."
  };
  
  // Type fears (core)
  export const typeFears = {
    '1': "Being corrupt, evil, defective, or imperfect",
    '2': "Being unworthy of love, unwanted, or unnecessary",
    '3': "Being worthless, unsuccessful, or exposed as incompetent",
    '4': "Having no identity, personal significance, or being fundamentally flawed",
    '5': "Being helpless, incapable, depleted, or overwhelmed by others' demands",
    '6': "Being without security, guidance, or support",
    '7': "Being trapped in emotional pain, deprived, or limited",
    '8': "Being harmed, controlled, violated, or vulnerable",
    '9': "Being in conflict, separate, or losing connection with others"
  };
  
  // Type desires (core)
  export const typeDesires = {
    '1': "To be good, right, balanced, and have integrity",
    '2': "To be loved, appreciated, and needed",
    '3': "To be valuable, successful, and admired",
    '4': "To be authentic, unique, and deeply understood",
    '5': "To be knowledgeable, competent, and self-sufficient",
    '6': "To be secure, safe, and supported",
    '7': "To be happy, satisfied, and fulfilled",
    '8': "To be strong, protective, and in control of their own life",
    '9': "To be at peace, comfortable, and unified with others"
  };
  
  // Growth directions (arrows)
  export const typeGrowthDirections = {
    '1': '7',
    '2': '4',
    '3': '6',
    '4': '1',
    '5': '8',
    '6': '9',
    '7': '5',
    '8': '2',
    '9': '3'
  };
  
  // Stress directions (arrows)
  export const typeStressDirections = {
    '1': '4',
    '2': '8',
    '3': '9',
    '4': '2',
    '5': '7',
    '6': '3',
    '7': '1',
    '8': '5',
    '9': '6'
  };
  
  // Returns type with its wing (e.g., "1w9" or "9w1")
  export const getTypeWithWing = (type) => {
    const typeNumber = parseInt(type);
    
    if (isNaN(typeNumber) || typeNumber < 1 || typeNumber > 9) {
      return null;
    }
    
    // Determine possible wings (adjacent types with wrapping)
    const leftWing = typeNumber === 1 ? 9 : typeNumber - 1;
    const rightWing = typeNumber === 9 ? 1 : typeNumber + 1;
    
    return { 
      primary: `${typeNumber}`,
      wings: [`${typeNumber}w${leftWing}`, `${typeNumber}w${rightWing}`]
    };
  };
  
  // Get compatibility percentage between two enneagram types
  export const getCompatibilityPercentage = (type1, type2) => {
    // Extract core types if wing notation is used
    const coreType1 = type1.includes('w') ? type1.split('w')[0] : type1;
    const coreType2 = type2.includes('w') ? type2.split('w')[0] : type2;
    
    // Calculate compatibility percentage
    let score = 50; // Start with baseline
    
    // Same type has decent compatibility
    if (coreType1 === coreType2) {
      score += 20;
    }
    
    // Check if types are complementary
    if (enneagramTypes[coreType1]?.compatibleWith.includes(coreType2)) {
      score += 30;
    }
    
    // Check if types are challenging
    if (enneagramTypes[coreType1]?.challengingWith.includes(coreType2)) {
      score -= 20;
    }
    
    // Check if connected by growth or stress arrows
    if (typeGrowthDirections[coreType1] === coreType2 || 
        typeGrowthDirections[coreType2] === coreType1) {
      score += 15;
    }
    
    if (typeStressDirections[coreType1] === coreType2 || 
        typeStressDirections[coreType2] === coreType1) {
      score -= 5;
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  };
  
  // Get compatibility description between two enneagram types
  export const getCompatibilityDescription = (type1, type2) => {
    // Extract core types if wing notation is used
    const coreType1 = type1.includes('w') ? type1.split('w')[0] : type1;
    const coreType2 = type2.includes('w') ? type2.split('w')[0] : type2;
    
    // Same type
    if (coreType1 === coreType2) {
      return `As two Type ${coreType1}s, you deeply understand each other's core motivations, strengths, and challenges. This creates strong empathy, but you may also amplify each other's blind spots and patterns.`;
    }
    
    // Check for special combinations
    const specialCombos = {
      '1-7': "You balance structure and spontaneity, with the Type 1 bringing discipline and the Type 7 bringing joy and possibility thinking.",
      '2-8': "You create a powerful dynamic of nurturing and protection, with the Type 2 offering care and the Type 8 providing strength.",
      '3-9': "You balance achievement with harmony, with the Type 3 bringing direction and the Type 9 bringing peace and acceptance.",
      '4-5': "You combine emotional depth with intellectual insight, with the Type 4 bringing authentic feeling and the Type 5 bringing analytical clarity.",
      '6-9': "You balance vigilance with peace, with the Type 6 bringing awareness of potential problems and the Type 9 bringing acceptance and harmony."
    };
    
    const combo1 = `${coreType1}-${coreType2}`;
    const combo2 = `${coreType2}-${coreType1}`;
    
    if (specialCombos[combo1]) {
      return specialCombos[combo1];
    } else if (specialCombos[combo2]) {
      return specialCombos[combo2];
    }
    
    // Check if types are complementary
    if (enneagramTypes[coreType1]?.compatibleWith.includes(coreType2)) {
      return `Types ${coreType1} and ${coreType2} naturally complement each other, with strengths that can balance each other's growth areas.`;
    }
    
    // Check if types are challenging
    if (enneagramTypes[coreType1]?.challengingWith.includes(coreType2)) {
      return `Types ${coreType1} and ${coreType2} can challenge each other, requiring conscious effort to understand each other's core motivations and fears.`;
    }
    
    // Growth arrow connection
    if (typeGrowthDirections[coreType1] === coreType2) {
      return `Type ${coreType1} grows by integrating qualities of Type ${coreType2}, creating a relationship with growth potential.`;
    }
    
    if (typeGrowthDirections[coreType2] === coreType1) {
      return `Type ${coreType2} grows by integrating qualities of Type ${coreType1}, creating a relationship with growth potential.`;
    }
    
    // Default
    return `Types ${coreType1} and ${coreType2} bring different perspectives and strengths to a relationship, requiring mutual understanding and appreciation.`;
  };
  
  export default enneagramTypes;