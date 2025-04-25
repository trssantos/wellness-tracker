// src/components/Lifestyle/CompatibilityFinder.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Search, Users, ThumbsUp, ThumbsDown, Percent, X, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { getStorage } from '../../utils/storage';
import { enneagramTypes } from '../../utils/enneagramData';
import { personalityTypes } from '../../utils/personalityData';
import { zodiacSigns, getZodiacCompatibility } from '../../utils/zodiacData';
import TopMatches from './TopMatches';


const CompatibilityFinder = ({ onBack }) => {
  // User's profiles
  const [userProfiles, setUserProfiles] = useState({
    mbti: null,
    enneagram: null,
    zodiac: null
  });
  
  // Partner selection
  const [partnerType, setPartnerType] = useState('mbti');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  
  // Load user's saved profiles
  useEffect(() => {
    const storage = getStorage();
    const lifestyleData = storage.lifestyle || {};
    
    const userTypes = {
      mbti: lifestyleData.personalityResults?.type || null,
      enneagram: lifestyleData.enneagramResults?.primaryType 
        ? `${lifestyleData.enneagramResults.primaryType}w${lifestyleData.enneagramResults.wing}`
        : null,
      zodiac: lifestyleData.zodiacSign || null
    };
    
    setUserProfiles(userTypes);
  }, []);
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Handle partner selection
  const handlePartnerSelect = (type) => {
    setSelectedPartner(type);
    calculateCompatibility(type);
  };
  
  // Calculate compatibility between user and partner
  const calculateCompatibility = (partnerValue) => {
    if (!partnerValue) return;
    
    const results = {
      overall: 0,
      categories: [],
      strengths: [],
      challenges: [],
      advice: ""
    };
    
    // MBTI Compatibility
    if (partnerType === 'mbti' && userProfiles.mbti) {
      results.overall = calculateMBTICompatibility(userProfiles.mbti, partnerValue);
      results.categories = getMBTICompatibilityCategories(userProfiles.mbti, partnerValue);
      const mbtiAnalysis = getMBTICompatibilityAnalysis(userProfiles.mbti, partnerValue);
      results.strengths = mbtiAnalysis.strengths;
      results.challenges = mbtiAnalysis.challenges;
      results.advice = mbtiAnalysis.advice;
    }
    
    // Enneagram Compatibility
    else if (partnerType === 'enneagram' && userProfiles.enneagram) {
      const userCore = userProfiles.enneagram.split('w')[0];
      const partnerCore = partnerValue.split('w')[0];
      results.overall = calculateEnneagramCompatibility(userCore, partnerCore);
      results.categories = getEnneagramCompatibilityCategories(userCore, partnerCore);
      const enneagramAnalysis = getEnneagramCompatibilityAnalysis(userCore, partnerCore);
      results.strengths = enneagramAnalysis.strengths;
      results.challenges = enneagramAnalysis.challenges;
      results.advice = enneagramAnalysis.advice;
    }
    
    // Zodiac Compatibility
    else if (partnerType === 'zodiac' && userProfiles.zodiac) {
      results.overall = calculateZodiacCompatibility(userProfiles.zodiac, partnerValue);
      results.categories = getZodiacCompatibilityCategories(userProfiles.zodiac, partnerValue);
      const zodiacAnalysis = getZodiacCompatibilityAnalysis(userProfiles.zodiac, partnerValue);
      results.strengths = zodiacAnalysis.strengths;
      results.challenges = zodiacAnalysis.challenges;
      results.advice = zodiacAnalysis.advice;
    }
    
    setMatchResults(results);
  };
  
  // MBTI Compatibility calculation
  const calculateMBTICompatibility = (type1, type2) => {
    // Calculate compatibility percentage
    let score = 0;
    
    // Same type is a good starting point (75%)
    if (type1 === type2) {
      score = 75;
    } else {
      // Start with 50% baseline
      score = 50;
      
      // Add points for each shared letter
      for (let i = 0; i < 4; i++) {
        if (type1[i] === type2[i]) {
          score += 10;
        }
      }
      
      // Special compatibility cases
      const idealMatches = {
        'INFJ': ['ENFP', 'ENTP'],
        'INFP': ['ENFJ', 'ENTJ'],
        'ENFJ': ['INFP', 'ISFP'],
        'ENFP': ['INFJ', 'INTJ'],
        'INTJ': ['ENFP', 'ENTP'],
        'INTP': ['ENTJ', 'ENFJ'],
        'ENTJ': ['INTP', 'INFP'],
        'ENTP': ['INFJ', 'INTJ'],
        'ISFJ': ['ESFP', 'ESTP'],
        'ISFP': ['ESFJ', 'ESTJ'],
        'ESFJ': ['ISFP', 'ISTP'],
        'ESFP': ['ISFJ', 'ISTJ'],
        'ISTJ': ['ESFP', 'ESTP'],
        'ISTP': ['ESFJ', 'ESTJ'],
        'ESTJ': ['ISTP', 'ISFP'],
        'ESTP': ['ISFJ', 'ISTJ']
      };
      
      // Boost score for ideal matches
      if (idealMatches[type1] && idealMatches[type1].includes(type2)) {
        score += 25;
      }
      
      // Boost score for complementary functions
      // For example, if one is a Thinker (T) and one is a Feeler (F)
      if ((type1.includes('T') && type2.includes('F')) || (type1.includes('F') && type2.includes('T'))) {
        score += 5;
      }
      
      // Boost score for complementary energy (E/I)
      if ((type1[0] === 'E' && type2[0] === 'I') || (type1[0] === 'I' && type2[0] === 'E')) {
        score += 5;
      }
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  };
  
  // MBTI Compatibility categories
  const getMBTICompatibilityCategories = (type1, type2) => {
    return [
      { 
        name: "Communication", 
        score: calculateMBTICommunicationScore(type1, type2),
        description: getMBTICommunicationDescription(type1, type2)
      },
      { 
        name: "Values Alignment", 
        score: calculateMBTIValuesScore(type1, type2),
        description: getMBTIValuesDescription(type1, type2)
      },
      { 
        name: "Problem Solving", 
        score: calculateMBTIProblemSolvingScore(type1, type2),
        description: getMBTIProblemSolvingDescription(type1, type2)
      },
      { 
        name: "Emotional Connection", 
        score: calculateMBTIEmotionalScore(type1, type2),
        description: getMBTIEmotionalDescription(type1, type2)
      }
    ];
  };
  
  // MBTI Communication score
  // MBTI Communication score calculation
const calculateMBTICommunicationScore = (type1, type2) => {
    // First determine if this is a naturally good pairing
    const idealMatches = {
      'INTJ': ['ENFP', 'ENTP'],
      'INTP': ['ENTJ', 'ENFJ'],
      'ENTJ': ['INTP', 'INFP'],
      'ENTP': ['INTJ', 'INFJ'],
      'INFJ': ['ENTP', 'ENFP'],
      'INFP': ['ENTJ', 'ENFJ'],
      'ENFJ': ['INTP', 'INFP'],
      'ENFP': ['INTJ', 'INFJ'],
      'ISTJ': ['ESFP', 'ESTP'],
      'ISFJ': ['ESFP', 'ESTP'],
      'ESTJ': ['ISFP', 'ISTP'],
      'ESFJ': ['ISFP', 'ISTP'],
      'ISTP': ['ESFJ', 'ESTJ'],
      'ISFP': ['ESFJ', 'ESTJ'],
      'ESTP': ['ISFJ', 'ISTJ'],
      'ESFP': ['ISFJ', 'ISTJ']
    };
    
    const isIdealMatch = idealMatches[type1]?.includes(type2) || idealMatches[type2]?.includes(type1);
    
    // For ideal matches, start with a higher baseline
    let score = isIdealMatch ? 70 : 40;
    
    // Extroversion/Introversion - E/I
    if (type1[0] === type2[0]) {
      // Same communication energy can be good but...
      score += 5;
    } else {
      // Different E/I can be complementary in ideal matches
      score += isIdealMatch ? 10 : -5;
    }
    
    // Sensing/Intuition - S/N
    if (type1[1] === type2[1]) {
      // Same information processing generally helps communication
      score += 15;
    } else {
      // Different S/N can be challenging unless it's an ideal match
      score += isIdealMatch ? 5 : -15;
    }
    
    // Thinking/Feeling - T/F
    if (type1[2] === type2[2]) {
      // Same decision-making approach helps communication
      score += 10;
    } else {
      // In ideal matches, T/F difference can be complementary
      score += isIdealMatch ? 5 : -10;
    }
    
    // Judging/Perceiving - J/P
    if (type1[3] === type2[3]) {
      // Same approach to structure helps avoid friction
      score += 10;
    } else {
      // In ideal matches, J/P difference can be helpful
      score += isIdealMatch ? 5 : -15;
    }
    
    // For truly compatible types, boost the score
    if (isIdealMatch) {
      score += 10;
    }
    
    // For pairs known to struggle, reduce the score
    const challengingPairs = {
      'INTJ': ['ESFJ', 'ISFP'],
      'INTP': ['ESFJ', 'ESTJ'],
      'ENTJ': ['ISFP', 'ISFJ'],
      'ENTP': ['ISFJ', 'ISTJ'],
      'INFJ': ['ESTP', 'ISTP'],
      'INFP': ['ESTJ', 'ESTP'],
      'ENFJ': ['ISTP', 'ISTJ'],
      'ENFP': ['ISTJ', 'ESTJ'],
      'ISTJ': ['ENFP', 'ENTP'],
      'ISFJ': ['ENTP', 'ENTJ'],
      'ESTJ': ['INFP', 'INTP'],
      'ESFJ': ['INTJ', 'INTP'],
      'ISTP': ['ENFJ', 'INFJ'],
      'ISFP': ['ENTJ', 'INTJ'],
      'ESTP': ['INFJ', 'INFP'],
      'ESFP': ['INTJ', 'INTP']
    };
    
    if (challengingPairs[type1]?.includes(type2) || challengingPairs[type2]?.includes(type1)) {
      score -= 20;
    }
    
    // If it's the same type, communication is naturally smoother
    if (type1 === type2) {
      score += 15;
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  // MBTI Communication description
  const getMBTICommunicationDescription = (type1, type2) => {
    // E/I difference
    if (type1[0] !== type2[0]) {
      return "You may have different communication energies - one of you processes thoughts externally through discussion, while the other needs time for internal reflection.";
    }
    
    // S/N difference
    if (type1[1] !== type2[1]) {
      return "You may focus on different types of information - one of you concentrates on concrete details, while the other gravitates toward patterns and possibilities.";
    }
    
    // T/F difference
    if (type1[2] !== type2[2]) {
      return "You may have different communication priorities - one of you focuses on logic and consistency, while the other emphasizes harmony and emotional impact.";
    }
    
    // J/P difference
    if (type1[3] !== type2[3]) {
      return "You may have different communication styles - one of you prefers structure and closure, while the other values flexibility and openness.";
    }
    
    // Similar types
    return "You share similar communication preferences which creates natural understanding and flow in your conversations.";
  };
  
  // MBTI Values score
  const calculateMBTIValuesScore = (type1, type2) => {
    // First determine if this is a naturally good pairing
    const idealMatches = {
      'INTJ': ['ENFP', 'ENTP'],
      'INTP': ['ENTJ', 'ENFJ'],
      'ENTJ': ['INTP', 'INFP'],
      'ENTP': ['INTJ', 'INFJ'],
      'INFJ': ['ENTP', 'ENFP'],
      'INFP': ['ENTJ', 'ENFJ'],
      'ENFJ': ['INTP', 'INFP'],
      'ENFP': ['INTJ', 'INFJ'],
      'ISTJ': ['ESFP', 'ESTP'],
      'ISFJ': ['ESFP', 'ESTP'],
      'ESTJ': ['ISFP', 'ISTP'],
      'ESFJ': ['ISFP', 'ISTP'],
      'ISTP': ['ESFJ', 'ESTJ'],
      'ISFP': ['ESFJ', 'ESTJ'],
      'ESTP': ['ISFJ', 'ISTJ'],
      'ESFP': ['ISFJ', 'ISTJ']
    };
    
    const isIdealMatch = idealMatches[type1]?.includes(type2) || idealMatches[type2]?.includes(type1);
    
    // For ideal matches, start with a higher baseline
    let score = isIdealMatch ? 75 : 40;
    
    // Sensing/Intuition strongly affects values
    if (type1[1] === type2[1]) {
      // Same information preference suggests similar worldviews
      score += 15;
    } else {
      // Different worldviews can create value conflicts unless complementary
      score += isIdealMatch ? 5 : -20;
    }
    
    // Thinking/Feeling strongly affects values
    if (type1[2] === type2[2]) {
      // Same decision approach suggests similar values
      score += 15;
    } else {
      // In ideal matches, T/F difference can be complementary
      score += isIdealMatch ? 10 : -15;
    }
    
    // Judging/Perceiving affects values around structure
    if (type1[3] === type2[3]) {
      // Same approach to planning and structure
      score += 10;
    } else {
      // In ideal matches, J/P difference can be complementary
      score += isIdealMatch ? 5 : -10;
    }
    
    // For truly compatible types, boost the score
    if (isIdealMatch) {
      score += 10;
    }
    
    // For pairs known to struggle, reduce the score
    const challengingPairs = {
      'INTJ': ['ESFJ', 'ISFP'],
      'INTP': ['ESFJ', 'ESTJ'],
      'ENTJ': ['ISFP', 'ISFJ'],
      'ENTP': ['ISFJ', 'ISTJ'],
      'INFJ': ['ESTP', 'ISTP'],
      'INFP': ['ESTJ', 'ESTP'],
      'ENFJ': ['ISTP', 'ISTJ'],
      'ENFP': ['ISTJ', 'ESTJ'],
      'ISTJ': ['ENFP', 'ENTP'],
      'ISFJ': ['ENTP', 'ENTJ'],
      'ESTJ': ['INFP', 'INTP'],
      'ESFJ': ['INTJ', 'INTP'],
      'ISTP': ['ENFJ', 'INFJ'],
      'ISFP': ['ENTJ', 'INTJ'],
      'ESTP': ['INFJ', 'INFP'],
      'ESFP': ['INTJ', 'INTP']
    };
    
    if (challengingPairs[type1]?.includes(type2) || challengingPairs[type2]?.includes(type1)) {
      score -= 20;
    }
    
    // Same type will have very similar values
    if (type1 === type2) {
      score += 20;
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  // MBTI Values description
  const getMBTIValuesDescription = (type1, type2) => {
    // S/N difference (biggest worldview impact)
    if (type1[1] !== type2[1]) {
      return "You likely have different value systems. One of you values practicality and tradition, while the other values innovation and theoretical possibilities.";
    }
    
    // T/F difference
    if (type1[2] !== type2[2]) {
      return "You may prioritize different aspects in decisions. One values objective analysis, while the other emphasizes harmony and emotional outcomes.";
    }
    
    // J/P difference
    if (type1[3] !== type2[3]) {
      return "You may have different approaches to life structure. One values organization and closure, while the other values flexibility and keeping options open.";
    }
    
    // Similar types
    return "You share fundamental values and worldviews, creating a strong foundation for mutual understanding.";
  };
  
  // MBTI Problem Solving score
  const calculateMBTIProblemSolvingScore = (type1, type2) => {
    // First determine if this is a naturally good pairing
    const idealMatches = {
      'INTJ': ['ENFP', 'ENTP'],
      'INTP': ['ENTJ', 'ENFJ'],
      'ENTJ': ['INTP', 'INFP'],
      'ENTP': ['INTJ', 'INFJ'],
      'INFJ': ['ENTP', 'ENFP'],
      'INFP': ['ENTJ', 'ENFJ'],
      'ENFJ': ['INTP', 'INFP'],
      'ENFP': ['INTJ', 'INFJ'],
      'ISTJ': ['ESFP', 'ESTP'],
      'ISFJ': ['ESFP', 'ESTP'],
      'ESTJ': ['ISFP', 'ISTP'],
      'ESFJ': ['ISFP', 'ISTP'],
      'ISTP': ['ESFJ', 'ESTJ'],
      'ISFP': ['ESFJ', 'ESTJ'],
      'ESTP': ['ISFJ', 'ISTJ'],
      'ESFP': ['ISFJ', 'ISTJ']
    };
    
    const isIdealMatch = idealMatches[type1]?.includes(type2) || idealMatches[type2]?.includes(type1);
    
    // For ideal matches, start with a higher baseline
    let score = isIdealMatch ? 75 : 40;
    
    // Sensing/Intuition affects problem-solving approach
    if (type1[1] === type2[1]) {
      // Same information gathering approach
      score += 15;
    } else {
      // Different approaches can be complementary in ideal matches
      score += isIdealMatch ? 15 : -10;
    }
    
    // Thinking/Feeling strongly affects problem-solving
    if (type1[2] === type2[2]) {
      // Same decision-making approach
      score += 15;
    } else {
      // In ideal matches, T/F difference creates balanced approach
      score += isIdealMatch ? 15 : -15;
    }
    
    // Judging/Perceiving affects problem-solving process
    if (type1[3] === type2[3]) {
      // Same approach to structure and planning
      score += 10;
    } else {
      // In ideal matches, J/P difference can be helpful
      score += isIdealMatch ? 10 : -10;
    }
    
    // For truly compatible types, boost the score
    if (isIdealMatch) {
      score += 15;
    }
    
    // For challenging pairs, lower the score
    const challengingPairs = {
      'INTJ': ['ESFJ', 'ISFP'],
      'INTP': ['ESFJ', 'ESTJ'],
      'ENTJ': ['ISFP', 'ISFJ'],
      'ENTP': ['ISFJ', 'ISTJ'],
      'INFJ': ['ESTP', 'ISTP'],
      'INFP': ['ESTJ', 'ESTP'],
      'ENFJ': ['ISTP', 'ISTJ'],
      'ENFP': ['ISTJ', 'ESTJ'],
      'ISTJ': ['ENFP', 'ENTP'],
      'ISFJ': ['ENTP', 'ENTJ'],
      'ESTJ': ['INFP', 'INTP'],
      'ESFJ': ['INTJ', 'INTP'],
      'ISTP': ['ENFJ', 'INFJ'],
      'ISFP': ['ENTJ', 'INTJ'],
      'ESTP': ['INFJ', 'INFP'],
      'ESFP': ['INTJ', 'INTP']
    };
    
    if (challengingPairs[type1]?.includes(type2) || challengingPairs[type2]?.includes(type1)) {
      score -= 20;
    }
    
    // Same type will be aligned on problem-solving
    if (type1 === type2) {
      score += 15;
    }
    
    return Math.min(100, Math.max(15, score));
  };
  
  // MBTI Problem Solving description
  const getMBTIProblemSolvingDescription = (type1, type2) => {
    // S/N difference
    if (type1[1] !== type2[1]) {
      return "You approach problems differently. One focuses on practical details and proven methods, while the other looks at patterns and explores innovative solutions.";
    }
    
    // T/F difference
    if (type1[2] !== type2[2]) {
      return "Your decision criteria differ. One prioritizes logical analysis and consistency, while the other considers impact on people and values.";
    }
    
    // J/P difference
    if (type1[3] !== type2[3]) {
      return "Your problem-solving processes differ. One prefers structure and decisive action, while the other values flexibility and exploring multiple options.";
    }
    
    // Similar types
    return "You share compatible problem-solving approaches, making collaboration and decision-making smoother.";
  };
  
  // MBTI Emotional score
  const calculateMBTIEmotionalScore = (type1, type2) => {
    // First determine if this is a naturally good pairing
    const idealMatches = {
      'INTJ': ['ENFP', 'ENTP'],
      'INTP': ['ENTJ', 'ENFJ'],
      'ENTJ': ['INTP', 'INFP'],
      'ENTP': ['INTJ', 'INFJ'],
      'INFJ': ['ENTP', 'ENFP'],
      'INFP': ['ENTJ', 'ENFJ'],
      'ENFJ': ['INTP', 'INFP'],
      'ENFP': ['INTJ', 'INFJ'],
      'ISTJ': ['ESFP', 'ESTP'],
      'ISFJ': ['ESFP', 'ESTP'],
      'ESTJ': ['ISFP', 'ISTP'],
      'ESFJ': ['ISFP', 'ISTP'],
      'ISTP': ['ESFJ', 'ESTJ'],
      'ISFP': ['ESFJ', 'ESTJ'],
      'ESTP': ['ISFJ', 'ISTJ'],
      'ESFP': ['ISFJ', 'ISTJ']
    };
    
    const isIdealMatch = idealMatches[type1]?.includes(type2) || idealMatches[type2]?.includes(type1);
    
    // For ideal matches, start with a higher baseline
    let score = isIdealMatch ? 70 : 35;
    
    // Extroversion/Introversion affects emotional expression
    if (type1[0] === type2[0]) {
      // Same emotional energy
      score += 10;
    } else {
      // Different energies create balance in ideal matches
      score += isIdealMatch ? 15 : 0;
    }
    
    // Sensing/Intuition affects emotional perception
    if (type1[1] === type2[1]) {
      // Similar perception of emotional data
      score += 10;
    } else {
      score += isIdealMatch ? 10 : -5;
    }
    
    // Thinking/Feeling strongly affects emotional connection
    if (type1[2] === type2[2]) {
      // Same approach to emotions
      score += 15;
    } else {
      // In ideal matches, T/F difference creates balance
      if (isIdealMatch) {
        score += 15;
      } else {
        // Otherwise can be challenging
        score -= 15;
      }
    }
    
    // Judging/Perceiving affects emotional flexibility
    if (type1[3] === type2[3]) {
      // Same approach to structure
      score += 5;
    } else {
      score += isIdealMatch ? 5 : -5;
    }
    
    // For truly compatible types, boost the score
    if (isIdealMatch) {
      score += 15;
    }
    
    // For challenging pairs, lower the score
    const challengingPairs = {
      'INTJ': ['ESFJ', 'ISFP'],
      'INTP': ['ESFJ', 'ESTJ'],
      'ENTJ': ['ISFP', 'ISFJ'],
      'ENTP': ['ISFJ', 'ISTJ'],
      'INFJ': ['ESTP', 'ISTP'],
      'INFP': ['ESTJ', 'ESTP'],
      'ENFJ': ['ISTP', 'ISTJ'],
      'ENFP': ['ISTJ', 'ESTJ'],
      'ISTJ': ['ENFP', 'ENTP'],
      'ISFJ': ['ENTP', 'ENTJ'],
      'ESTJ': ['INFP', 'INTP'],
      'ESFJ': ['INTJ', 'INTP'],
      'ISTP': ['ENFJ', 'INFJ'],
      'ISFP': ['ENTJ', 'INTJ'],
      'ESTP': ['INFJ', 'INFP'],
      'ESFP': ['INTJ', 'INTP']
    };
    
    if (challengingPairs[type1]?.includes(type2) || challengingPairs[type2]?.includes(type1)) {
      score -= 25;
    }
    
    // Same type will have similar emotional approaches
    if (type1 === type2) {
      score += 15;
    }
    
    // Having at least one F type helps with emotional connection
    if (type1[2] === 'F' || type2[2] === 'F') {
      score += 5;
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  // MBTI Emotional description
  const getMBTIEmotionalDescription = (type1, type2) => {
    // T/F difference (biggest emotional impact)
    if (type1[2] !== type2[2]) {
      return "You have different emotional styles. One tends to process emotions logically, while the other naturally attunes to feelings and emotional nuances.";
    }
    
    // E/I difference
    if (type1[0] !== type2[0]) {
      return "You have different emotional expression styles. One is more outwardly expressive, while the other processes emotions more internally.";
    }
    
    // J/P difference
    if (type1[3] !== type2[3]) {
      return "You have different approaches to emotional situations. One seeks closure and resolution, while the other remains open to emotional processing.";
    }
    
    // Similar types
    return "You share similar emotional styles, creating natural understanding of each other's emotional needs.";
  };
  
  // MBTI Compatibility analysis
  const getMBTICompatibilityAnalysis = (type1, type2) => {
    const strengths = [];
    const challenges = [];
    let advice = "";
    
    // Check for same or different preferences
    const isSameE_I = type1[0] === type2[0];
    const isSameS_N = type1[1] === type2[1];
    const isSameT_F = type1[2] === type2[2];
    const isSameJ_P = type1[3] === type2[3];
    
    // E/I dimension
    if (isSameE_I) {
      if (type1[0] === 'E') {
        strengths.push("You both enjoy social activities and external engagement");
        challenges.push("You may compete for attention or overwhelm each other");
        advice += "Make sure to also plan some quiet time together. ";
      } else {
        strengths.push("You both value deep conversation and personal space");
        challenges.push("You may struggle with initiating social connections");
        advice += "Challenge yourselves to engage with others as a team. ";
      }
    } else {
      strengths.push("You balance each other's social energy");
      challenges.push("You may have different needs for socializing vs. alone time");
      advice += "Respect each other's different energy needs and find a balance. ";
    }
    
    // S/N dimension
    if (isSameS_N) {
      if (type1[1] === 'S') {
        strengths.push("You both focus on practical matters and details");
        challenges.push("You may miss bigger patterns or future possibilities");
        advice += "Try to occasionally brainstorm future possibilities together. ";
      } else {
        strengths.push("You both enjoy theoretical discussion and exploring possibilities");
        challenges.push("You may overlook practical details or implementation");
        advice += "Set aside time to address practical logistics together. ";
      }
    } else {
      strengths.push("You complement each other with details and big-picture thinking");
      challenges.push("You may focus on different types of information");
      advice += "Value what each brings: practical knowledge and imaginative insights. ";
    }
    
    // T/F dimension
    if (isSameT_F) {
      if (type1[2] === 'T') {
        strengths.push("You both value logical analysis and objectivity");
        challenges.push("You may neglect emotional considerations");
        advice += "Schedule check-ins about feelings and emotional needs. ";
      } else {
        strengths.push("You both prioritize emotional harmony and connection");
        challenges.push("You may avoid difficult truths to maintain harmony");
        advice += "Practice addressing logical inconsistencies objectively when necessary. ";
      }
    } else {
      strengths.push("You balance logical and emotional considerations");
      challenges.push("You may have different priorities in decision-making");
      advice += "Recognize the value in both approaches: logical analysis and emotional intelligence. ";
    }
    
    // J/P dimension
    if (isSameJ_P) {
      if (type1[3] === 'J') {
        strengths.push("You both value structure, planning, and closure");
        challenges.push("You may be inflexible or resistant to spontaneity");
        advice += "Schedule occasional unplanned activities to add spontaneity. ";
      } else {
        strengths.push("You both value flexibility, openness, and adaptation");
        challenges.push("You may struggle with follow-through or organization");
        advice += "Create some basic systems to ensure important tasks get completed. ";
      }
    } else {
      strengths.push("You balance structure and flexibility");
      challenges.push("You may clash over planning vs. spontaneity");
      advice += "Appreciate how each approach has its benefits in different contexts. ";
    }
    
    return {
      strengths,
      challenges,
      advice
    };
  };
  
  // Enneagram Compatibility calculation
  const calculateEnneagramCompatibility = (type1, type2) => {
    // Calculate compatibility percentage
    let score = 0;
    
    // Same type starts at 70%
    if (type1 === type2) {
      score = 70;
    } else {
      // Start with 50% baseline
      score = 50;
      
      // Check if types are complementary
      const compatibilityPairs = {
        '1': ['7', '9'],
        '2': ['4', '8'],
        '3': ['6', '9'],
        '4': ['2', '9'],
        '5': ['1', '7'],
        '6': ['9', '3'],
        '7': ['5', '1'],
        '8': ['2', '4'],
        '9': ['3', '6']
      };
      
      if (compatibilityPairs[type1] && compatibilityPairs[type1].includes(type2)) {
        score += 30;
      }
      
      // Check if types are in conflict
      const challengingPairs = {
        '1': ['8', '4'],
        '2': ['5', '3'],
        '3': ['4', '7'],
        '4': ['3', '8'],
        '5': ['2', '6'],
        '6': ['5', '1'],
        '7': ['1', '4'],
        '8': ['5', '1'],
        '9': ['6', '8']
      };
      
      if (challengingPairs[type1] && challengingPairs[type1].includes(type2)) {
        score -= 15;
      }
      
      // Check if types are in the same triad (head, heart, gut)
      const headTypes = ['5', '6', '7'];
      const heartTypes = ['2', '3', '4'];
      const gutTypes = ['8', '9', '1'];
      
      if ((headTypes.includes(type1) && headTypes.includes(type2)) ||
          (heartTypes.includes(type1) && heartTypes.includes(type2)) ||
          (gutTypes.includes(type1) && gutTypes.includes(type2))) {
        score += 10;
      }
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  };
  
  // Enneagram Compatibility categories
  const getEnneagramCompatibilityCategories = (type1, type2) => {
    return [
      { 
        name: "Communication", 
        score: calculateEnneagramCommunicationScore(type1, type2),
        description: getEnneagramCommunicationDescription(type1, type2)
      },
      { 
        name: "Emotional Support", 
        score: calculateEnneagramEmotionalScore(type1, type2),
        description: getEnneagramEmotionalDescription(type1, type2)
      },
      { 
        name: "Growth Potential", 
        score: calculateEnneagramGrowthScore(type1, type2),
        description: getEnneagramGrowthDescription(type1, type2)
      },
      { 
        name: "Conflict Resolution", 
        score: calculateEnneagramConflictScore(type1, type2),
        description: getEnneagramConflictDescription(type1, type2)
      }
    ];
  };
  
  // Calculate Enneagram communication score
  const calculateEnneagramCommunicationScore = (type1, type2) => {
    // Communication is influenced by centers/triads and wing influence
    const headTypes = ['5', '6', '7'];
    const heartTypes = ['2', '3', '4'];
    const gutTypes = ['8', '9', '1'];
    
    // Start with a baseline score
    let score = 40;
    
    // Same center/triad often communicates similarly
    if ((headTypes.includes(type1) && headTypes.includes(type2)) ||
        (heartTypes.includes(type1) && heartTypes.includes(type2)) ||
        (gutTypes.includes(type1) && gutTypes.includes(type2))) {
      score += 25;
    }
    
    // Head and heart types can bridge analytical and emotional communication
    if ((headTypes.includes(type1) && heartTypes.includes(type2)) ||
        (headTypes.includes(type2) && heartTypes.includes(type1))) {
      score += 15;
    }
    
    // Head and gut types may struggle with different communication priorities
    if ((headTypes.includes(type1) && gutTypes.includes(type2)) ||
        (headTypes.includes(type2) && gutTypes.includes(type1))) {
      score -= 10;
    }
    
    // Heart and gut types may have power struggles in communication
    if ((heartTypes.includes(type1) && gutTypes.includes(type2)) ||
        (heartTypes.includes(type2) && gutTypes.includes(type1))) {
      score -= 5;
    }
    
    // Types that naturally communicate well together
    const goodCommunicators = {
      '1': ['3', '5'],
      '2': ['7', '9'],
      '3': ['1', '7'],
      '4': ['5', '9'],
      '5': ['1', '4'],
      '6': ['9', '1'],
      '7': ['2', '3'],
      '8': ['2', '7'],
      '9': ['2', '4', '6']
    };
    
    if (goodCommunicators[type1]?.includes(type2) || goodCommunicators[type2]?.includes(type1)) {
      score += 15;
    }
    
    // Types that often struggle to communicate effectively
    const challengingCommunicators = {
      '1': ['4', '8'],
      '2': ['5', '8'],
      '3': ['4', '6'],
      '4': ['1', '3', '8'],
      '5': ['2', '7', '8'],
      '6': ['3', '8'],
      '7': ['1', '5'],
      '8': ['1', '4', '5', '6'],
      '9': ['8', '3']
    };
    
    if (challengingCommunicators[type1]?.includes(type2) || challengingCommunicators[type2]?.includes(type1)) {
      score -= 20;
    }
    
    // Integration (growth) arrows often improve communication
    const integrationArrows = {
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
    
    if (integrationArrows[type1] === type2 || integrationArrows[type2] === type1) {
      score += 10;
    }
    
    // Type 9 is generally adaptable in communication
    if (type1 === '9' || type2 === '9') {
      score += 5;
    }
    
    // Type 1 and 8 often have power struggles in communication
    if ((type1 === '1' && type2 === '8') || (type1 === '8' && type2 === '1')) {
      score -= 15;
    }
    
    // Same type understands each other's communication style
    if (type1 === type2) {
      score += 20;
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  // Get Enneagram communication description
  const getEnneagramCommunicationDescription = (type1, type2) => {
    const headTypes = ['5', '6', '7'];
    const heartTypes = ['2', '3', '4'];
    const gutTypes = ['8', '9', '1'];
    
    // Same triad
    if ((headTypes.includes(type1) && headTypes.includes(type2))) {
      return "You both process information intellectually, which creates a shared language of ideas, analysis, and concepts.";
    } else if ((heartTypes.includes(type1) && heartTypes.includes(type2))) {
      return "You both communicate with emotional awareness, creating a shared language of feelings, relationships, and self-image.";
    } else if ((gutTypes.includes(type1) && gutTypes.includes(type2))) {
      return "You both communicate with an instinctual awareness, creating a shared language of boundaries, control, and principles.";
    }
    
    // Special combinations
    if ((type1 === '1' && type2 === '7') || (type1 === '7' && type2 === '1')) {
      return "You balance structured thinking with possibility thinking, which can lead to rich, productive conversations if you respect each approach.";
    }
    
    if ((type1 === '2' && type2 === '8') || (type1 === '8' && type2 === '2')) {
      return "You combine nurturing connection with direct assertion, which creates powerful communication when you understand each other's intentions.";
    }
    
    if ((type1 === '3' && type2 === '9') || (type1 === '9' && type2 === '3')) {
      return "You balance achievement-oriented communication with harmonious perspective, creating effective discourse when you slow down enough to truly hear each other.";
    }
    
    if ((type1 === '4' && type2 === '5') || (type1 === '5' && type2 === '4')) {
      return "You combine emotional depth with intellectual analysis, creating rich conversations when you bridge the gap between feeling and thinking.";
    }
    
    if ((type1 === '6' && type2 === '9') || (type1 === '9' && type2 === '6')) {
      return "You balance cautious questioning with peaceful mediation, which works well when you create enough safety for honest exchange.";
    }
    
    // Default for remaining combinations
    return "Your different communication styles require conscious effort to understand each other's perspectives and priorities.";
  };
  
  // Calculate Enneagram emotional support score
  const calculateEnneagramEmotionalScore = (type1, type2) => {
    // Emotional support is highly influenced by heart types
    const headTypes = ['5', '6', '7'];
    const heartTypes = ['2', '3', '4'];
    const gutTypes = ['8', '9', '1'];
    
    // Start with a baseline score
    let score = 35;
    
    // Heart types naturally provide emotional support
    if (heartTypes.includes(type1) || heartTypes.includes(type2)) {
      score += 15;
    }
    
    // Two heart types can be emotionally intense or supportive
    if (heartTypes.includes(type1) && heartTypes.includes(type2)) {
      if ((type1 === '2' && type2 === '4') || (type1 === '4' && type2 === '2')) {
        score += 20; // 2 and 4 understand emotional needs
      } else if ((type1 === '3' && type2 === '4') || (type1 === '4' && type2 === '3')) {
        score -= 10; // 3 and 4 can have emotional disconnects
      } else {
        score += 10; // Other heart type combinations
      }
    }
    
    // Head types may struggle with emotional expression
    if (headTypes.includes(type1) && headTypes.includes(type2)) {
      score -= 15;
    }
    
    // Type 9 provides peaceful emotional support
    if (type1 === '9' || type2 === '9') {
      score += 20;
    }
    
    // Type 2 is naturally emotionally supportive
    if (type1 === '2' || type2 === '2') {
      score += 20;
    }
    
    // Type 5 may struggle with emotional expression
    if (type1 === '5' || type2 === '5') {
      score -= 15;
    }
    
    // Specific combinations with strong emotional support
    const emotionalSupporters = {
      '2': ['4', '7', '9'],
      '4': ['2', '9'],
      '6': ['9', '2'],
      '7': ['2', '9'],
      '8': ['2'],
      '9': ['2', '4', '6', '7']
    };
    
    if (emotionalSupporters[type1]?.includes(type2) || emotionalSupporters[type2]?.includes(type1)) {
      score += 20;
    }
    
    // Specific combinations with emotional support challenges
    const emotionalChallenges = {
      '1': ['5', '8'],
      '3': ['5', '8'],
      '4': ['3', '5', '8'],
      '5': ['1', '3', '4', '8'],
      '8': ['1', '3', '4', '5']
    };
    
    if (emotionalChallenges[type1]?.includes(type2) || emotionalChallenges[type2]?.includes(type1)) {
      score -= 20;
    }
    
    // Integration (growth) arrows often improve emotional support
    const integrationArrows = {
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
    
    if (integrationArrows[type1] === type2 || integrationArrows[type2] === type1) {
      score += 10;
    }
    
    // Same type may understand emotional needs but might reinforce issues
    if (type1 === type2) {
      if (['2', '4', '9'].includes(type1)) {
        score += 15; // Emotionally aware types connect well with same type
      } else if (['5', '8', '3'].includes(type1)) {
        score -= 5; // Less emotionally expressive types may reinforce detachment
      } else {
        score += 5; // Other types
      }
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  // Get Enneagram emotional support description
  const getEnneagramEmotionalDescription = (type1, type2) => {
    const heartTypes = ['2', '3', '4'];
    
    if (heartTypes.includes(type1) && heartTypes.includes(type2)) {
      return "You're both emotionally aware and sensitive to relational dynamics, creating a connection rich in empathy and emotional understanding.";
    }
    
    if (type1 === '2' || type2 === '2') {
      return "One of you has a natural ability to sense and respond to emotional needs, creating a supportive foundation.";
    }
    
    if (type1 === '5' && type2 === '5') {
      return "You both need significant emotional space, which you'll naturally respect in each other, though you may need to practice explicit emotional sharing.";
    }
    
    if ((type1 === '8' && type2 === '2') || (type1 === '2' && type2 === '8')) {
      return "You create a powerful dynamic of strength and care, with one providing protection and the other emotional nurturing.";
    }
    
    if ((type1 === '9' && type2 === '4') || (type1 === '4' && type2 === '9')) {
      return "You combine emotional depth with peaceful acceptance, creating a space where feelings can be safely expressed and held.";
    }
    
    // Default for remaining combinations
    return "Your different approaches to emotions require conscious effort to create mutual emotional support and understanding.";
  };
  
  // Calculate Enneagram growth score
  const calculateEnneagramGrowthScore = (type1, type2) => {
    // Growth happens when types challenge each other in healthy ways
    
    // Start with a baseline score
    let score = 45;
    
    // Integration (growth) arrows create strong growth potential
    const integrationArrows = {
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
    
    if (integrationArrows[type1] === type2 || integrationArrows[type2] === type1) {
      score += 30;
    }
    
    // Disintegration arrows can also create growth through challenge
    const disintegrationArrows = {
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
    
    if (disintegrationArrows[type1] === type2 || disintegrationArrows[type2] === type1) {
      score += 15;
    }
    
    // Types in the same triad may reinforce patterns rather than challenge
    const headTypes = ['5', '6', '7'];
    const heartTypes = ['2', '3', '4'];
    const gutTypes = ['8', '9', '1'];
    
    if ((headTypes.includes(type1) && headTypes.includes(type2)) ||
        (heartTypes.includes(type1) && heartTypes.includes(type2)) ||
        (gutTypes.includes(type1) && gutTypes.includes(type2))) {
      score -= 10;
    }
    
    // Specific combinations known for mutual growth
    const growthPairs = {
      '1': ['7', '9', '2'],
      '2': ['4', '1', '7'],
      '3': ['6', '9', '1'],
      '4': ['1', '9', '2'],
      '5': ['8', '7', '1'],
      '6': ['9', '3', '2'],
      '7': ['5', '1', '4'],
      '8': ['2', '5', '9'],
      '9': ['3', '6', '1', '4']
    };
    
    if (growthPairs[type1]?.includes(type2) || growthPairs[type2]?.includes(type1)) {
      score += 15;
    }
    
    // Challenging combinations that can lead to growth through friction
    const challengingGrowth = {
      '1': ['8', '7', '4'],
      '2': ['5', '3', '8'],
      '3': ['4', '1', '6'],
      '4': ['3', '7', '8'],
      '5': ['2', '7', '8'],
      '6': ['8', '3', '7'],
      '7': ['1', '6', '5'],
      '8': ['1', '5', '6'],
      '9': ['8', '7', '3']
    };
    
    if (challengingGrowth[type1]?.includes(type2) || challengingGrowth[type2]?.includes(type1)) {
      score += 10;
    }
    
    // Same type understands but may not challenge growth
    if (type1 === type2) {
      score -= 15;
    }
    
    return Math.min(100, Math.max(15, score));
  };
  
  
  // Get Enneagram growth description
  const getEnneagramGrowthDescription = (type1, type2) => {
    // Check for arrow connections
    const growthConnections = {
      '1': ['4', '7'],
      '2': ['4', '8'],
      '3': ['6', '9'],
      '4': ['1', '2'],
      '5': ['7', '8'],
      '6': ['3', '9'],
      '7': ['1', '5'],
      '8': ['2', '5'],
      '9': ['3', '6']
    };
    
    if (growthConnections[type1] && growthConnections[type1].includes(type2)) {
      return "Your connection has significant growth potential as you naturally challenge each other to develop in complementary ways.";
    }
    
    if (type1 === type2) {
      return "You understand each other's growth challenges intimately, though you may reinforce rather than challenge each other's patterns.";
    }
    
    // Special growth combinations
    if ((type1 === '1' && type2 === '7') || (type1 === '7' && type2 === '1')) {
      return "You balance structure with spontaneity, helping each other develop both discipline and joy.";
    }
    
    if ((type1 === '3' && type2 === '9') || (type1 === '9' && type2 === '3')) {
      return "You balance achievement with acceptance, helping each other develop both productivity and peace.";
    }
    
    if ((type1 === '4' && type2 === '5') || (type1 === '5' && type2 === '4')) {
      return "You balance emotional depth with intellectual clarity, helping each other develop both feeling and thinking capacities.";
    }
    
    if ((type1 === '2' && type2 === '8') || (type1 === '8' && type2 === '2')) {
      return "You balance nurturing with assertion, helping each other develop both care and strength.";
    }
    
    // Default for remaining combinations
    return "Your different approaches to life can spark growth when you learn from each other's strengths.";
  };
  
  // Calculate Enneagram conflict resolution score
  const calculateEnneagramConflictScore = (type1, type2) => {
    // Conflict resolution varies greatly by type strategy
    
    // Start with a baseline score
    let score = 40;
    
    // Types that withdraw during conflict
    const withdrawTypes = ['4', '5', '9'];
    
    // Types that move against in conflict
    const againstTypes = ['1', '3', '8'];
    
    // Types that move toward in conflict
    const towardTypes = ['2', '6', '7'];
    
    // Different conflict styles can create challenges
    if ((withdrawTypes.includes(type1) && againstTypes.includes(type2)) ||
        (withdrawTypes.includes(type2) && againstTypes.includes(type1))) {
      score -= 25; // This combination often struggles with conflict
    }
    
    // Similar conflict styles understand each other
    if ((withdrawTypes.includes(type1) && withdrawTypes.includes(type2)) ||
        (againstTypes.includes(type1) && againstTypes.includes(type2)) ||
        (towardTypes.includes(type1) && towardTypes.includes(type2))) {
      score += 15; // Similar styles create understanding
    }
    
    // Type 9s avoid conflict which can be problematic
    if (type1 === '9' || type2 === '9') {
      if (againstTypes.includes(type1) || againstTypes.includes(type2)) {
        score -= 20; // 9 with assertive type can struggle
      }
    }
    
    // Type 8s can be overwhelming in conflict
    if (type1 === '8' || type2 === '8') {
      if (withdrawTypes.includes(type1) || withdrawTypes.includes(type2)) {
        score -= 25; // 8 with withdrawn type is challenging
      }
    }
    
    // Type 1s can be critical in conflict
    if (type1 === '1' || type2 === '1') {
      if (['4', '7', '9'].includes(type1) || ['4', '7', '9'].includes(type2)) {
        score -= 15; // 1's criticism can be hard for these types
      }
    }
    
    // Type 9 and 5 both avoid conflict but in different ways
    if ((type1 === '9' && type2 === '5') || (type1 === '5' && type2 === '9')) {
      score -= 10; // Can lead to unresolved issues
    }
    
    // Specific combinations that handle conflict well
    const goodConflictResolution = {
      '1': ['3', '6'],
      '2': ['6', '7'],
      '3': ['1', '7'],
      '5': ['1', '3'],
      '6': ['1', '2', '9'],
      '7': ['2', '3', '9'],
      '8': ['3', '6', '7'],
      '9': ['2', '6', '7']
    };
    
    if (goodConflictResolution[type1]?.includes(type2) || goodConflictResolution[type2]?.includes(type1)) {
      score += 15;
    }
    
    // Integration (growth) pairs often handle conflict better
    const integrationArrows = {
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
    
    if (integrationArrows[type1] === type2 || integrationArrows[type2] === type1) {
      score += 10;
    }
    
    // Same type can either understand each other's conflict style or amplify it
    if (type1 === type2) {
      if (againstTypes.includes(type1)) {
        score -= 10; // Can escalate conflicts
      } else if (withdrawTypes.includes(type1)) {
        score -= 15; // May never address issues
      } else {
        score += 5; // Toward types may handle conflict similarly
      }
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  // Get Enneagram conflict description
  const getEnneagramConflictDescription = (type1, type2) => {
    // Types that withdraw during conflict
    const withdrawTypes = ['4', '5', '9'];
    
    // Types that move against in conflict
    const againstTypes = ['1', '3', '8'];
    
    // Types that move toward in conflict
    const towardTypes = ['2', '6', '7'];
    
    if (withdrawTypes.includes(type1) && withdrawTypes.includes(type2)) {
      return "You both tend to withdraw during conflict, which may lead to unresolved issues as neither person brings them up directly.";
    }
    
    if (againstTypes.includes(type1) && againstTypes.includes(type2)) {
      return "You both tend to be assertive during conflict, which can lead to intense exchanges that clear the air but might feel overwhelming.";
    }
    
    if (towardTypes.includes(type1) && towardTypes.includes(type2)) {
      return "You both tend to engage actively during conflict, which helps address issues but may lead to excessive focus on problems.";
    }
    
    if ((withdrawTypes.includes(type1) && againstTypes.includes(type2)) ||
        (withdrawTypes.includes(type2) && againstTypes.includes(type1))) {
      return "One of you tends to withdraw during conflict while the other becomes more assertive, creating a challenging dynamic that requires conscious navigation.";
    }
    
    if ((withdrawTypes.includes(type1) && towardTypes.includes(type2)) ||
        (withdrawTypes.includes(type2) && towardTypes.includes(type1))) {
      return "One of you tends to withdraw during conflict while the other seeks engagement, creating a pursuit-distance pattern that needs awareness.";
    }
    
    // Special cases
    if ((type1 === '9' && type2 === '1') || (type1 === '1' && type2 === '9')) {
      return "The Nine avoids conflict while the One may focus on what's wrong, requiring clear communication about issues without blame.";
    }
    
    if ((type1 === '9' && type2 === '8') || (type1 === '8' && type2 === '9')) {
      return "The Nine's conflict avoidance meets the Eight's directness, creating a challenging dynamic that requires the Nine to speak up and the Eight to soften.";
    }
    
    if ((type1 === '5' && type2 === '2') || (type1 === '2' && type2 === '5')) {
      return "The Five's withdrawal meets the Two's emotional engagement, requiring the Five to stay present and the Two to respect boundaries.";
    }
    
    // Default
    return "Your different approaches to conflict require conscious effort to develop healthy resolution strategies together.";
  };
  
  // Enneagram Compatibility analysis
  const getEnneagramCompatibilityAnalysis = (type1, type2) => {
    const strengths = [];
    const challenges = [];
    let advice = "";
    
    // Add core strengths based on the combination
    const headTypes = ['5', '6', '7'];
    const heartTypes = ['2', '3', '4'];
    const gutTypes = ['8', '9', '1'];
    
    // Same triad
    if ((headTypes.includes(type1) && headTypes.includes(type2))) {
      strengths.push("You share an intellectual approach to understanding the world");
      strengths.push("You both value clarity, analysis, and thoughtful consideration");
    } else if ((heartTypes.includes(type1) && heartTypes.includes(type2))) {
      strengths.push("You share an emotional sensitivity and awareness");
      strengths.push("You both value connection, feelings, and identity");
    } else if ((gutTypes.includes(type1) && gutTypes.includes(type2))) {
      strengths.push("You share an instinctual approach to navigating life");
      strengths.push("You both value action, boundaries, and physical presence");
    }
    
    // Different triads create complementary strengths
    if ((headTypes.includes(type1) && heartTypes.includes(type2)) ||
        (headTypes.includes(type2) && heartTypes.includes(type1))) {
      strengths.push("You balance thinking and feeling in your relationship");
      challenges.push("You may prioritize different kinds of information (thoughts vs. emotions)");
    }
    
    if ((heartTypes.includes(type1) && gutTypes.includes(type2)) ||
        (heartTypes.includes(type2) && gutTypes.includes(type1))) {
      strengths.push("You balance emotional awareness with action and boundaries");
      challenges.push("You may have different priorities (emotional connection vs. autonomy)");
    }
    
    if ((gutTypes.includes(type1) && headTypes.includes(type2)) ||
        (gutTypes.includes(type2) && headTypes.includes(type1))) {
      strengths.push("You balance action with thoughtful consideration");
      challenges.push("You may move at different paces (action vs. analysis)");
    }
    
    // Special combinations
    if ((type1 === '2' && type2 === '8') || (type1 === '8' && type2 === '2')) {
      strengths.push("You create a powerful dynamic of nurturing and protection");
      challenges.push("You may struggle with directness vs. indirectness in asking for needs");
      advice += "The Two should practice direct communication about needs, while the Eight should practice gentleness. ";
    }
    
    if ((type1 === '1' && type2 === '7') || (type1 === '7' && type2 === '1')) {
      strengths.push("You balance structure and responsibility with joy and spontaneity");
      challenges.push("You may clash over planning vs. flexibility");
      advice += "The One should embrace occasional spontaneity, while the Seven should honor commitments and plans. ";
    }
    
    if ((type1 === '4' && type2 === '5') || (type1 === '4' && type2 === '5')) {
      strengths.push("You combine emotional depth with intellectual curiosity");
      challenges.push("You may struggle with emotional expression vs. detachment");
      advice += "The Four should respect the Five's need for space, while the Five should engage with emotional content. ";
    }
    
    if ((type1 === '3' && type2 === '9') || (type1 === '9' && type2 === '3')) {
      strengths.push("You balance achievement and recognition with peace and stability");
      challenges.push("You may struggle with pace and priorities");
      advice += "The Three should appreciate the Nine's calming presence, while the Nine should voice their needs clearly. ";
    }
    
    if ((type1 === '6' && type2 === '9') || (type1 === '6' && type2 === '9')) {
      strengths.push("You balance vigilance and questioning with peace and acceptance");
      challenges.push("You may struggle with addressing vs. avoiding potential problems");
      advice += "The Six should trust the Nine's calming perspective, while the Nine should engage with the Six's legitimate concerns. ";
    }
    
    // Same type
    if (type1 === type2) {
      strengths.push("You deeply understand each other's core motivations and fears");
      strengths.push("You naturally empathize with each other's struggles");
      challenges.push("You may amplify each other's typical patterns and blind spots");
      advice += "Seek relationships with other types to balance and challenge your shared patterns. ";
    }
    
    // General advice for all combinations
    advice += "Learn about each other's core fears and motivations to develop deeper understanding. ";
    
    return {
      strengths,
      challenges,
      advice
    };
  };
  
  // Zodiac Compatibility calculation
  const calculateZodiacCompatibility = (sign1, sign2) => {
    // Calculate compatibility percentage
    let score = 0;
    
    // Same sign starts at 70%
    if (sign1 === sign2) {
      score = 70;
    } else {
      // Start with 50% baseline
      score = 50;
      
      // Check element compatibility
      const elements = {
        'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
        'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
        'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
        'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
      };
      
      const sign1Element = elements[sign1];
      const sign2Element = elements[sign2];
      
      // Same element is compatible
      if (sign1Element === sign2Element) {
        score += 20;
      }
      
      // Complementary elements
      const complementaryElements = {
        'fire': 'air',
        'air': 'fire',
        'earth': 'water',
        'water': 'earth'
      };
      
      if (complementaryElements[sign1Element] === sign2Element) {
        score += 15;
      }
      
      // Challenging elements
      const challengingElements = {
        'fire': 'water',
        'water': 'fire',
        'earth': 'air',
        'air': 'earth'
      };
      
      if (challengingElements[sign1Element] === sign2Element) {
        score -= 10;
      }
      
      // Check modality compatibility
      const modalities = {
        'aries': 'cardinal', 'cancer': 'cardinal', 'libra': 'cardinal', 'capricorn': 'cardinal',
        'taurus': 'fixed', 'leo': 'fixed', 'scorpio': 'fixed', 'aquarius': 'fixed',
        'gemini': 'mutable', 'virgo': 'mutable', 'sagittarius': 'mutable', 'pisces': 'mutable'
      };
      
      const sign1Modality = modalities[sign1];
      const sign2Modality = modalities[sign2];
      
      // Same modality can create friction
      if (sign1Modality === sign2Modality) {
        score -= 5;
      }
      
      // Special traditional match pairs
      const traditionalPairs = {
        'aries': ['leo', 'sagittarius', 'libra'],
        'taurus': ['virgo', 'capricorn', 'cancer'],
        'gemini': ['libra', 'aquarius', 'sagittarius'],
        'cancer': ['scorpio', 'pisces', 'taurus'],
        'leo': ['aries', 'sagittarius', 'libra'],
        'virgo': ['taurus', 'capricorn', 'cancer'],
        'libra': ['gemini', 'aquarius', 'leo'],
        'scorpio': ['cancer', 'pisces', 'capricorn'],
        'sagittarius': ['aries', 'leo', 'aquarius'],
        'capricorn': ['taurus', 'virgo', 'scorpio'],
        'aquarius': ['gemini', 'libra', 'sagittarius'],
        'pisces': ['cancer', 'scorpio', 'capricorn']
      };
      
      if (traditionalPairs[sign1] && traditionalPairs[sign1].includes(sign2)) {
        score += 20;
      }
      
      // Special challenging pairs
      const challengingPairs = {
        'aries': ['cancer', 'capricorn'],
        'taurus': ['leo', 'aquarius'],
        'gemini': ['virgo', 'pisces'],
        'cancer': ['aries', 'libra'],
        'leo': ['scorpio', 'taurus'],
        'virgo': ['sagittarius', 'gemini'],
        'libra': ['capricorn', 'cancer'],
        'scorpio': ['leo', 'aquarius'],
        'sagittarius': ['virgo', 'pisces'],
        'capricorn': ['aries', 'libra'],
        'aquarius': ['taurus', 'scorpio'],
        'pisces': ['gemini', 'sagittarius']
      };
      
      if (challengingPairs[sign1] && challengingPairs[sign1].includes(sign2)) {
        score -= 15;
      }
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  };
  
  // Zodiac Compatibility categories
  const getZodiacCompatibilityCategories = (sign1, sign2) => {
    return [
      { 
        name: "Emotional Connection", 
        score: calculateZodiacEmotionalScore(sign1, sign2),
        description: getZodiacEmotionalDescription(sign1, sign2)
      },
      { 
        name: "Communication", 
        score: calculateZodiacCommunicationScore(sign1, sign2),
        description: getZodiacCommunicationDescription(sign1, sign2)
      },
      { 
        name: "Values & Goals", 
        score: calculateZodiacValuesScore(sign1, sign2),
        description: getZodiacValuesDescription(sign1, sign2)
      },
      { 
        name: "Physical Chemistry", 
        score: calculateZodiacPhysicalScore(sign1, sign2),
        description: getZodiacPhysicalDescription(sign1, sign2)
      }
    ];
  };
  
  // Calculate Zodiac emotional score
  const calculateZodiacEmotionalScore = (sign1, sign2) => {
    // Element compatibility is key for emotional connection
    const elements = {
      'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
      'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
      'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
      'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
    };
    
    const sign1Element = elements[sign1];
    const sign2Element = elements[sign2];
    
    // Start with a baseline score
    let score = 30;
    
    // Same element - strong emotional understanding
    if (sign1Element === sign2Element) {
      score += 40;
    }
    
    // Complementary elements have good emotional connection
    const complementaryElements = {
      'water': 'earth',
      'earth': 'water',
      'fire': 'air',
      'air': 'fire'
    };
    
    if (complementaryElements[sign1Element] === sign2Element) {
      score += 30;
    }
    
    // Challenging elements struggle emotionally
    const challengingElements = {
      'fire': 'water',
      'water': 'fire',
      'earth': 'air',
      'air': 'earth'
    };
    
    if (challengingElements[sign1Element] === sign2Element) {
      score -= 20;
    }
    
    // Water signs are naturally emotionally attuned
    if (sign1Element === 'water' && sign2Element === 'water') {
      score += 15;
    }
    
    // Some specific sign combinations have special emotional connections
    const specialConnections = {
      'taurus': ['cancer', 'pisces', 'capricorn', 'virgo'],
      'cancer': ['taurus', 'pisces', 'scorpio'],
      'leo': ['libra', 'sagittarius', 'aries'],
      'libra': ['leo', 'aquarius', 'gemini'],
      'scorpio': ['cancer', 'pisces'],
      'pisces': ['cancer', 'scorpio']
    };
    
    if (specialConnections[sign1]?.includes(sign2) || specialConnections[sign2]?.includes(sign1)) {
      score += 15;
    }
    
    // Specifically challenging emotional combinations
    const challengingCombinations = {
      'aries': ['cancer', 'capricorn'],
      'taurus': ['aquarius', 'sagittarius'],
      'gemini': ['scorpio', 'capricorn'],
      'cancer': ['aries', 'sagittarius'],
      'leo': ['taurus', 'capricorn'],
      'virgo': ['sagittarius', 'pisces'],
      'libra': ['cancer', 'capricorn'],
      'scorpio': ['gemini', 'leo'],
      'sagittarius': ['taurus', 'cancer'],
      'capricorn': ['aries', 'leo'],
      'aquarius': ['taurus', 'scorpio'],
      'pisces': ['gemini', 'virgo']
    };
    
    if (challengingCombinations[sign1]?.includes(sign2) || challengingCombinations[sign2]?.includes(sign1)) {
      score -= 25;
    }
    
    // Traditional compatibility pairs have strong emotional connection
    const traditionalPairs = {
      'aries': ['leo', 'sagittarius', 'libra'],
      'taurus': ['virgo', 'capricorn', 'cancer'],
      'gemini': ['libra', 'aquarius'],
      'cancer': ['scorpio', 'pisces', 'taurus'],
      'leo': ['aries', 'sagittarius'],
      'virgo': ['taurus', 'capricorn'],
      'libra': ['gemini', 'aquarius'],
      'scorpio': ['cancer', 'pisces'],
      'sagittarius': ['aries', 'leo'],
      'capricorn': ['taurus', 'virgo'],
      'aquarius': ['gemini', 'libra'],
      'pisces': ['cancer', 'scorpio']
    };
    
    if (traditionalPairs[sign1]?.includes(sign2) || traditionalPairs[sign2]?.includes(sign1)) {
      score += 20;
    }
    
    // Same sign - can understand but may be too similar
    if (sign1 === sign2) {
      score += 25;
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  // Get Zodiac emotional description
  const getZodiacEmotionalDescription = (sign1, sign2) => {
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    
    if (waterSigns.includes(sign1) && waterSigns.includes(sign2)) {
      return "You both experience emotions deeply and intuitively understand each other's feelings, creating a profound emotional bond.";
    }
    
    if ((waterSigns.includes(sign1) && earthSigns.includes(sign2)) ||
        (waterSigns.includes(sign2) && earthSigns.includes(sign1))) {
      return "You balance emotional depth with practicality, creating a supportive and grounding connection.";
    }
    
    if ((fireSigns.includes(sign1) && airSigns.includes(sign2)) ||
        (fireSigns.includes(sign2) && airSigns.includes(sign1))) {
      return "You share enthusiasm and excitement, fueling each other's passions and ideas.";
    }
    
    if ((waterSigns.includes(sign1) && fireSigns.includes(sign2)) ||
        (waterSigns.includes(sign2) && fireSigns.includes(sign1))) {
      return "Your emotional styles differ significantly—one is deeply feeling while the other is action-oriented, requiring conscious effort to understand each other.";
    }
    
    if ((earthSigns.includes(sign1) && airSigns.includes(sign2)) ||
        (earthSigns.includes(sign2) && airSigns.includes(sign1))) {
      return "Your emotional approaches differ—one is practical and stable while the other is intellectual and changeable, requiring adaptation to connect.";
    }
    
    if (sign1 === sign2) {
      return "You naturally understand each other's emotional needs and responses, creating an intuitive connection.";
    }
    
    return "Your different emotional styles can complement each other when you take time to understand each other's needs.";
  };
  
  // Calculate Zodiac communication score
  const calculateZodiacCommunicationScore = (sign1, sign2) => {
    // Element compatibility for communication style
    const elements = {
      'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
      'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
      'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
      'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
    };
    
    // Start with a baseline score
    let score = 40;
    
    const sign1Element = elements[sign1];
    const sign2Element = elements[sign2];
    
    // Air signs excel at communication
    if (sign1Element === 'air' && sign2Element === 'air') {
      score += 35;
    }
    
    // Air + Fire have dynamic communication
    if ((sign1Element === 'air' && sign2Element === 'fire') ||
        (sign1Element === 'fire' && sign2Element === 'air')) {
      score += 30;
    }
    
    // Earth + Water have supportive communication
    if ((sign1Element === 'earth' && sign2Element === 'water') ||
        (sign1Element === 'water' && sign2Element === 'earth')) {
      score += 25;
    }
    
    // Earth + Earth have practical communication
    if (sign1Element === 'earth' && sign2Element === 'earth') {
      score += 25;
    }
    
    // Water + Water have intuitive communication but can lack clarity
    if (sign1Element === 'water' && sign2Element === 'water') {
      score += 20;
    }
    
    // Fire + Fire can be competitive in communication
    if (sign1Element === 'fire' && sign2Element === 'fire') {
      score += 15;
    }
    
    // Earth + Air have significant communication challenges
    if ((sign1Element === 'earth' && sign2Element === 'air') ||
        (sign1Element === 'air' && sign2Element === 'earth')) {
      score -= 20;
    }
    
    // Fire + Water have communication clashes
    if ((sign1Element === 'fire' && sign2Element === 'water') ||
        (sign1Element === 'water' && sign2Element === 'fire')) {
      score -= 15;
    }
    
    // Specific signs with communication compatibility
    const goodCommunicators = {
      'gemini': ['libra', 'aquarius', 'leo', 'aries'],
      'libra': ['gemini', 'aquarius', 'leo', 'sagittarius'],
      'aquarius': ['gemini', 'libra', 'sagittarius'],
      'leo': ['gemini', 'libra', 'aries'],
      'virgo': ['capricorn', 'taurus'],
      'taurus': ['virgo', 'capricorn'],
      'capricorn': ['virgo', 'taurus']
    };
    
    if (goodCommunicators[sign1]?.includes(sign2) || goodCommunicators[sign2]?.includes(sign1)) {
      score += 15;
    }
    
    // Specific challenging communication pairs
    const difficultCommunicators = {
      'taurus': ['leo', 'aquarius', 'sagittarius'],
      'scorpio': ['gemini', 'leo', 'aquarius'],
      'capricorn': ['aries', 'libra'],
      'virgo': ['sagittarius', 'pisces'],
      'cancer': ['aries', 'libra']
    };
    
    if (difficultCommunicators[sign1]?.includes(sign2) || difficultCommunicators[sign2]?.includes(sign1)) {
      score -= 15;
    }
    
    // Same sign communication can be either very smooth or too similar
    if (sign1 === sign2) {
      if (['gemini', 'libra', 'aquarius'].includes(sign1)) {
        score += 20; // Air signs enjoy similar communication
      } else if (['cancer', 'scorpio', 'pisces'].includes(sign1)) {
        score += 15; // Water signs connect emotionally but may lack clarity
      } else if (['taurus', 'virgo', 'capricorn'].includes(sign1)) {
        score += 15; // Earth signs are straightforward with each other
      } else {
        score += 10; // Fire signs may compete for attention
      }
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
  
  // Get Zodiac communication description
  const getZodiacCommunicationDescription = (sign1, sign2) => {
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const fireSigns = ['aries', 'leo', 'sagittarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    
    if (airSigns.includes(sign1) && airSigns.includes(sign2)) {
      return "You both value intellectual exchange and verbal communication, creating stimulating and flowing conversations.";
    }
    
    if ((airSigns.includes(sign1) && fireSigns.includes(sign2)) ||
        (airSigns.includes(sign2) && fireSigns.includes(sign1))) {
      return "You combine intellectual clarity with passionate expression, creating dynamic and inspiring exchanges.";
    }
    
    if (earthSigns.includes(sign1) && earthSigns.includes(sign2)) {
      return "You share practical, straightforward communication styles, focusing on concrete information and solutions.";
    }
    
    if (waterSigns.includes(sign1) && waterSigns.includes(sign2)) {
      return "You connect through emotional undertones and intuitive understanding, often communicating beyond words.";
    }
    
    if ((earthSigns.includes(sign1) && waterSigns.includes(sign2)) ||
        (earthSigns.includes(sign2) && waterSigns.includes(sign1))) {
      return "You balance practical communication with emotional sensitivity, creating supportive exchanges.";
    }
    
    if ((earthSigns.includes(sign1) && airSigns.includes(sign2)) ||
        (earthSigns.includes(sign2) && airSigns.includes(sign1))) {
      return "Your communication styles differ significantly—one is practical and literal while the other is abstract and conceptual, requiring patience.";
    }
    
    if ((waterSigns.includes(sign1) && airSigns.includes(sign2)) ||
        (waterSigns.includes(sign2) && airSigns.includes(sign1))) {
      return "You have different communication priorities—one focuses on emotional content while the other emphasizes logical clarity, requiring translation.";
    }
    
    if (sign1 === sign2) {
      return "You naturally understand each other's communication style and priorities, creating easy flowing exchanges.";
    }
    
    return "Your different communication styles require conscious effort to understand each other's approaches and needs.";
  };
  
  // Calculate Zodiac values score
  const calculateZodiacValuesScore = (sign1, sign2) => {
    // Element and modality strongly affect values
    const elements = {
      'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
      'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
      'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
      'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
    };
    
    const modalities = {
      'cardinal': ['aries', 'cancer', 'libra', 'capricorn'],
      'fixed': ['taurus', 'leo', 'scorpio', 'aquarius'],
      'mutable': ['gemini', 'virgo', 'sagittarius', 'pisces']
    };
    
    // Get element and modality for each sign
    const sign1Element = elements[sign1];
    const sign2Element = elements[sign2];
    
    let sign1Modality = '';
    let sign2Modality = '';
    
    for (const [modality, signs] of Object.entries(modalities)) {
      if (signs.includes(sign1)) sign1Modality = modality;
      if (signs.includes(sign2)) sign2Modality = modality;
    }
    
    // Start with a baseline score
    let score = 35;
    
    // Same element typically means shared values
    if (sign1Element === sign2Element) {
      score += 30;
    }
    
    // Compatible elements often share values
    const compatibleElements = {
      'fire': 'air',
      'air': 'fire',
      'earth': 'water',
      'water': 'earth'
    };
    
    if (compatibleElements[sign1Element] === sign2Element) {
      score += 20;
    }
    
    // Challenging elements often have different values
    const challengingElements = {
      'fire': 'water',
      'water': 'fire',
      'earth': 'air',
      'air': 'earth'
    };
    
    if (challengingElements[sign1Element] === sign2Element) {
      score -= 25;
    }
    
    // Same modality can either align or compete on values
    if (sign1Modality === sign2Modality) {
      if (sign1Modality === 'cardinal') {
        score += 15; // Both value initiative and leadership
      } else if (sign1Modality === 'fixed') {
        score += 20; // Both value stability and commitment
      } else { // mutable
        score += 10; // Both value flexibility but may lack direction
      }
    }
    
    // Different modalities can complement each other
    if (sign1Modality !== sign2Modality) {
      if ((sign1Modality === 'cardinal' && sign2Modality === 'fixed') ||
          (sign1Modality === 'fixed' && sign2Modality === 'cardinal')) {
        score += 15; // One initiates, one stabilizes
      } else if ((sign1Modality === 'fixed' && sign2Modality === 'mutable') ||
                 (sign1Modality === 'mutable' && sign2Modality === 'fixed')) {
        score += 10; // One provides stability, one adapts
      } else {
        score += 5; // Cardinal and mutable can be scattered
      }
    }
    
    // Signs that traditionally share values
    const sharedValues = {
      'aries': ['leo', 'sagittarius', 'aquarius'],
      'taurus': ['virgo', 'capricorn', 'cancer'],
      'gemini': ['libra', 'aquarius', 'aries'],
      'cancer': ['scorpio', 'pisces', 'taurus'],
      'leo': ['aries', 'sagittarius', 'libra'],
      'virgo': ['taurus', 'capricorn', 'scorpio'],
      'libra': ['gemini', 'aquarius', 'leo'],
      'scorpio': ['cancer', 'pisces', 'virgo'],
      'sagittarius': ['aries', 'leo', 'aquarius'],
      'capricorn': ['taurus', 'virgo', 'scorpio'],
      'aquarius': ['gemini', 'libra', 'sagittarius'],
      'pisces': ['cancer', 'scorpio', 'capricorn']
    };
    
    if (sharedValues[sign1]?.includes(sign2) || sharedValues[sign2]?.includes(sign1)) {
      score += 15;
    }
    
    // Signs with particularly challenging value differences
    const valueClashes = {
      'aries': ['cancer', 'capricorn', 'taurus'],
      'taurus': ['aquarius', 'sagittarius', 'aries'],
      'gemini': ['capricorn', 'pisces', 'virgo'],
      'cancer': ['aries', 'libra', 'sagittarius'],
      'leo': ['scorpio', 'taurus', 'aquarius'],
      'virgo': ['sagittarius', 'pisces', 'gemini'],
      'libra': ['cancer', 'capricorn', 'scorpio'],
      'scorpio': ['leo', 'aquarius', 'libra'],
      'sagittarius': ['virgo', 'pisces', 'taurus'],
      'capricorn': ['aries', 'libra', 'gemini'],
      'aquarius': ['taurus', 'leo', 'scorpio'],
      'pisces': ['gemini', 'virgo', 'sagittarius']
    };
    
    if (valueClashes[sign1]?.includes(sign2) || valueClashes[sign2]?.includes(sign1)) {
      score -= 20;
    }
    
    // Same sign will typically share core values
    if (sign1 === sign2) {
      score += 25;
    }
    
    return Math.min(100, Math.max(10, score));
  };
  
    // Get Zodiac values description
    const getZodiacValuesDescription = (sign1, sign2) => {
        const elements = {
          'fire': ['aries', 'leo', 'sagittarius'],
          'earth': ['taurus', 'virgo', 'capricorn'],
          'air': ['gemini', 'libra', 'aquarius'],
          'water': ['cancer', 'scorpio', 'pisces']
        };
        
        // Find elements
        let sign1Element = '';
        let sign2Element = '';
        
        for (const [element, signs] of Object.entries(elements)) {
          if (signs.includes(sign1)) sign1Element = element;
          if (signs.includes(sign2)) sign2Element = element;
        }
        
        if (sign1Element === sign2Element) {
          if (sign1Element === 'fire') {
            return "You both value passion, action, and self-expression, creating alignment around ambition and adventure.";
          } else if (sign1Element === 'earth') {
            return "You both value stability, practicality, and tangible results, creating alignment around security and achievement.";
          } else if (sign1Element === 'air') {
            return "You both value ideas, social connection, and intellectual growth, creating alignment around communication and principles.";
          } else if (sign1Element === 'water') {
            return "You both value emotional depth, intuition, and meaningful connection, creating alignment around relationships and inner experience.";
          }
        }
        
        const complementaryElements = {
          'fire': 'air',
          'air': 'fire',
          'earth': 'water',
          'water': 'earth'
        };
        
        if (complementaryElements[sign1Element] === sign2Element) {
          if ((sign1Element === 'fire' && sign2Element === 'air') || 
              (sign1Element === 'air' && sign2Element === 'fire')) {
            return "You balance enthusiasm with intellectual clarity, creating complementary approaches to goals and ideals.";
          } else if ((sign1Element === 'earth' && sign2Element === 'water') || 
                     (sign1Element === 'water' && sign2Element === 'earth')) {
            return "You balance practicality with emotional depth, creating complementary approaches to security and relationships.";
          }
        }
        
        const challengingElements = {
          'fire': 'water',
          'water': 'fire',
          'earth': 'air',
          'air': 'earth'
        };
        
        if (challengingElements[sign1Element] === sign2Element) {
          if ((sign1Element === 'fire' && sign2Element === 'water') || 
              (sign1Element === 'water' && sign2Element === 'fire')) {
            return "Your core values differ—one prioritizes action and expression while the other values emotional security and connection.";
          } else if ((sign1Element === 'earth' && sign2Element === 'air') || 
                     (sign1Element === 'air' && sign2Element === 'earth')) {
            return "Your core values differ—one prioritizes stability and practicality while the other values ideas and social connection.";
          }
        }
        
        if (sign1 === sign2) {
          return "You naturally share core values and life priorities, creating a strong foundation for understanding.";
        }
        
        return "Your different value systems require conscious effort to appreciate each other's priorities and worldviews.";
      };
      
      // Calculate Zodiac physical score
      const calculateZodiacPhysicalScore = (sign1, sign2) => {
        // Element compatibility is important for physical chemistry
        const elements = {
          'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
          'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
          'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
          'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
        };
        
        const sign1Element = elements[sign1];
        const sign2Element = elements[sign2];
        
        // Start with a baseline score
        let score = 40;
        
        // Fire and Air signs have strong physical chemistry
        if ((sign1Element === 'fire' && sign2Element === 'air') ||
            (sign1Element === 'air' && sign2Element === 'fire')) {
          score += 35;
        }
        
        // Earth and Water signs have sensual physical chemistry
        if ((sign1Element === 'earth' && sign2Element === 'water') ||
            (sign1Element === 'water' && sign2Element === 'earth')) {
          score += 30;
        }
        
        // Fire and Fire can be passionate but competitive
        if (sign1Element === 'fire' && sign2Element === 'fire') {
          score += 25;
        }
        
        // Earth and Earth share sensuality but can be slow
        if (sign1Element === 'earth' && sign2Element === 'earth') {
          score += 20;
        }
        
        // Water and Water have deep connection but can be too emotional
        if (sign1Element === 'water' && sign2Element === 'water') {
          score += 20;
        }
        
        // Air and Air have mental connection but may lack physicality
        if (sign1Element === 'air' && sign2Element === 'air') {
          score += 15;
        }
        
        // Challenging combinations
        if ((sign1Element === 'fire' && sign2Element === 'water') ||
            (sign1Element === 'water' && sign2Element === 'fire')) {
          score -= 15;
        }
        
        if ((sign1Element === 'earth' && sign2Element === 'air') ||
            (sign1Element === 'air' && sign2Element === 'earth')) {
          score -= 15;
        }
        
        // Signs with notable physical chemistry
        const strongPhysical = {
          'aries': ['leo', 'sagittarius', 'libra', 'scorpio'],
          'taurus': ['cancer', 'scorpio', 'virgo', 'capricorn'],
          'gemini': ['libra', 'aquarius', 'aries', 'leo'],
          'cancer': ['taurus', 'scorpio', 'pisces', 'capricorn'],
          'leo': ['aries', 'sagittarius', 'libra', 'gemini'],
          'virgo': ['taurus', 'capricorn', 'scorpio', 'cancer'],
          'libra': ['leo', 'aquarius', 'gemini', 'sagittarius'],
          'scorpio': ['cancer', 'pisces', 'taurus', 'capricorn', 'aries'],
          'sagittarius': ['aries', 'leo', 'libra', 'aquarius'],
          'capricorn': ['taurus', 'virgo', 'scorpio', 'pisces'],
          'aquarius': ['gemini', 'libra', 'sagittarius', 'aries'],
          'pisces': ['cancer', 'scorpio', 'capricorn', 'taurus']
        };
        
        if (strongPhysical[sign1]?.includes(sign2) || strongPhysical[sign2]?.includes(sign1)) {
          score += 20;
        }
        
        // Signs with specific physical chemistry challenges
        const weakPhysical = {
          'taurus': ['aquarius', 'sagittarius'],
          'virgo': ['aries', 'sagittarius'],
          'capricorn': ['aries', 'gemini'],
          'aquarius': ['taurus', 'scorpio'],
          'pisces': ['gemini', 'sagittarius']
        };
        
        if (weakPhysical[sign1]?.includes(sign2) || weakPhysical[sign2]?.includes(sign1)) {
          score -= 15;
        }
        
        // Specific high-chemistry pairs get extra points
        const specialChemistry = [
          ['aries', 'scorpio'],
          ['taurus', 'scorpio'],
          ['leo', 'scorpio'],
          ['scorpio', 'pisces'],
          ['cancer', 'scorpio']
        ];
        
        for (const pair of specialChemistry) {
          if ((sign1 === pair[0] && sign2 === pair[1]) || (sign1 === pair[1] && sign2 === pair[0])) {
            score += 15;
            break;
          }
        }
        
        // Same sign chemistry varies
        if (sign1 === sign2) {
          if (['scorpio', 'taurus', 'leo'].includes(sign1)) {
            score += 15; // These signs enjoy their own kind
          } else {
            score += 5; // Others may find same-sign chemistry too predictable
          }
        }
        
        return Math.min(100, Math.max(15, score));
      };
      
      
      // Get Zodiac physical description
      const getZodiacPhysicalDescription = (sign1, sign2) => {
        const fireSigns = ['aries', 'leo', 'sagittarius'];
        const earthSigns = ['taurus', 'virgo', 'capricorn'];
        const airSigns = ['gemini', 'libra', 'aquarius'];
        const waterSigns = ['cancer', 'scorpio', 'pisces'];
        
        if ((fireSigns.includes(sign1) && airSigns.includes(sign2)) ||
            (fireSigns.includes(sign2) && airSigns.includes(sign1))) {
          return "You have natural physical chemistry with one bringing passion and intensity and the other bringing playfulness and variety.";
        }
        
        if (fireSigns.includes(sign1) && fireSigns.includes(sign2)) {
          return "You share passionate, enthusiastic physical energy that creates intense and exciting chemistry.";
        }
        
        if ((earthSigns.includes(sign1) && waterSigns.includes(sign2)) ||
            (earthSigns.includes(sign2) && waterSigns.includes(sign1))) {
          return "You have sensual, nurturing physical chemistry that combines earthly pleasure with emotional connection.";
        }
        
        if ((sign1 === 'scorpio' && fireSigns.includes(sign2)) ||
            (sign2 === 'scorpio' && fireSigns.includes(sign1))) {
          return "You create intense, transformative physical energy together with powerful attraction and magnetism.";
        }
        
        if ((sign1 === 'taurus' && waterSigns.includes(sign2)) ||
            (sign2 === 'taurus' && waterSigns.includes(sign1))) {
          return "You share a deeply sensual connection that combines physical pleasure with emotional security.";
        }
        
        if (sign1 === sign2) {
          return "You naturally understand each other's physical rhythms and preferences, creating comfortable compatibility.";
        }
        
        if ((earthSigns.includes(sign1) && earthSigns.includes(sign2))) {
          return "You share a grounded, sensual approach to physical connection based on comfort and reliability.";
        }
        
        if ((airSigns.includes(sign1) && airSigns.includes(sign2))) {
          return "You share a playful, communicative approach to physical connection with variety and mental stimulation.";
        }
        
        if ((waterSigns.includes(sign1) && waterSigns.includes(sign2))) {
          return "You share a deeply emotional approach to physical connection with intuitive understanding of each other's needs.";
        }
        
        return "Your different physical styles can create an interesting dynamic when you take time to understand each other's needs.";
      };
      
      // Zodiac Compatibility analysis
      const getZodiacCompatibilityAnalysis = (sign1, sign2) => {
        const strengths = [];
        const challenges = [];
        let advice = "";
        
        // Get element information
        const elements = {
          'fire': ['aries', 'leo', 'sagittarius'],
          'earth': ['taurus', 'virgo', 'capricorn'],
          'air': ['gemini', 'libra', 'aquarius'],
          'water': ['cancer', 'scorpio', 'pisces']
        };
        
        // Find elements
        let sign1Element = '';
        let sign2Element = '';
        
        for (const [element, signs] of Object.entries(elements)) {
          if (signs.includes(sign1)) sign1Element = element;
          if (signs.includes(sign2)) sign2Element = element;
        }
        
        // Get modality information
        const modalities = {
          'cardinal': ['aries', 'cancer', 'libra', 'capricorn'],
          'fixed': ['taurus', 'leo', 'scorpio', 'aquarius'],
          'mutable': ['gemini', 'virgo', 'sagittarius', 'pisces']
        };
        
        // Find modalities
        let sign1Modality = '';
        let sign2Modality = '';
        
        for (const [modality, signs] of Object.entries(modalities)) {
          if (signs.includes(sign1)) sign1Modality = modality;
          if (signs.includes(sign2)) sign2Modality = modality;
        }
        
        // Add strengths based on elements
        if (sign1Element === sign2Element) {
          strengths.push(`You share ${sign1Element} element qualities, creating natural understanding`);
          
          if (sign1Element === 'fire') {
            strengths.push("You both bring enthusiasm, passion, and creative energy");
          } else if (sign1Element === 'earth') {
            strengths.push("You both value stability, practicality, and reliability");
          } else if (sign1Element === 'air') {
            strengths.push("You both appreciate intellectual connection, communication, and social interaction");
          } else if (sign1Element === 'water') {
            strengths.push("You both understand emotional depth, intuition, and sensitivity");
          }
        } else {
          // Complementary elements
          if ((sign1Element === 'fire' && sign2Element === 'air') ||
              (sign1Element === 'air' && sign2Element === 'fire')) {
            strengths.push("You have complementary elements that enhance each other's energy");
            strengths.push("You balance inspiration with ideas, action with communication");
          } else if ((sign1Element === 'earth' && sign2Element === 'water') ||
                     (sign1Element === 'water' && sign2Element === 'earth')) {
            strengths.push("You have complementary elements that support each other's needs");
            strengths.push("You balance practicality with emotion, structure with flow");
          }
          
          // Challenging elements
          if ((sign1Element === 'fire' && sign2Element === 'water') ||
              (sign1Element === 'water' && sign2Element === 'fire')) {
            challenges.push("Your elements can create tension between action and emotion");
            challenges.push("You may have different paces and priorities");
            advice += "Respect each other's fundamentally different approaches to life. ";
          } else if ((sign1Element === 'earth' && sign2Element === 'air') ||
                     (sign1Element === 'air' && sign2Element === 'earth')) {
            challenges.push("Your elements can create tension between practicality and theory");
            challenges.push("You may have different communication needs");
            advice += "Appreciate the balance you can bring to each other's perspectives. ";
          }
        }
        
        // Add insights based on modality
        if (sign1Modality === sign2Modality) {
          if (sign1Modality === 'cardinal') {
            strengths.push("You both initiate and value leadership and new beginnings");
            challenges.push("You may compete for control or direction");
            advice += "Take turns leading and learn to collaborate on initiatives. ";
          } else if (sign1Modality === 'fixed') {
            strengths.push("You both offer stability, loyalty, and perseverance");
            challenges.push("You may struggle with flexibility and compromise");
            advice += "Practice openness to change and respect each other's boundaries. ";
          } else if (sign1Modality === 'mutable') {
            strengths.push("You both bring adaptability, versatility, and openness");
            challenges.push("You may lack direction or consistency together");
            advice += "Create some structure and commitments to anchor your relationship. ";
          }
        } else {
          // Complementary modalities
          if ((sign1Modality === 'cardinal' && sign2Modality === 'fixed') ||
              (sign1Modality === 'fixed' && sign2Modality === 'cardinal')) {
            strengths.push("One of you initiates while the other stabilizes, creating productive balance");
          } else if ((sign1Modality === 'fixed' && sign2Modality === 'mutable') ||
                     (sign1Modality === 'mutable' && sign2Modality === 'fixed')) {
            strengths.push("One of you provides stability while the other adapts, creating flexible consistency");
          } else if ((sign1Modality === 'cardinal' && sign2Modality === 'mutable') ||
                     (sign1Modality === 'mutable' && sign2Modality === 'cardinal')) {
            strengths.push("One of you initiates while the other adapts, creating innovative flow");
          }
        }
        
        // Same sign
        if (sign1 === sign2) {
          strengths.push("You naturally understand each other's core tendencies and needs");
          challenges.push("You may amplify each other's characteristic challenges");
          advice += "Seek balance by developing your less dominant traits together. ";
        }
        
        // Special combinations
        if ((sign1 === 'leo' && sign2 === 'aquarius') || (sign1 === 'aquarius' && sign2 === 'leo')) {
          strengths.push("You balance self-expression with community focus");
          advice += "Appreciate how you each approach recognition and social connection differently. ";
        }
        
        if ((sign1 === 'taurus' && sign2 === 'scorpio') || (sign1 === 'scorpio' && sign2 === 'taurus')) {
          strengths.push("You share sensuality while balancing security with transformation");
          advice += "Respect different approaches to change and stability. ";
        }
        
        // General advice
        advice += "Learn about each other's planetary rulers to understand motivations. ";
        
        return {
          strengths,
          challenges,
          advice
        };
      };
      
      // Render the component UI
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={onBack}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 transition-colors">
                  Compatibility Finder
                </h2>
              </div>
            </div>
            
            {/* Your Profile Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Your Profiles</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* MBTI Profile */}
                <div className={`p-3 rounded-lg border ${userProfiles.mbti 
                  ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/40' 
                  : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">MBTI Type</span>
                    {userProfiles.mbti && (
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">
                        {userProfiles.mbti}
                      </span>
                    )}
                  </div>
                  {!userProfiles.mbti && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Take the personality test to set your MBTI type
                    </p>
                  )}
                </div>
                
                {/* Enneagram Profile */}
                <div className={`p-3 rounded-lg border ${userProfiles.enneagram 
                  ? 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-800/40' 
                  : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Enneagram Type</span>
                    {userProfiles.enneagram && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                        {userProfiles.enneagram}
                      </span>
                    )}
                  </div>
                  {!userProfiles.enneagram && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Take the enneagram test to set your type
                    </p>
                  )}
                </div>
                
                {/* Zodiac Profile */}
                <div className={`p-3 rounded-lg border ${userProfiles.zodiac 
                  ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800/40' 
                  : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Zodiac Sign</span>
                    {userProfiles.zodiac && (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                        {userProfiles.zodiac.charAt(0).toUpperCase() + userProfiles.zodiac.slice(1)}
                      </span>
                    )}
                  </div>
                  {!userProfiles.zodiac && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Set your birth date to determine your sign
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Matches Display */}
<TopMatches userProfiles={userProfiles} />
            
            {/* Partner Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">Find Compatibility With</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setPartnerType('mbti')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    partnerType === 'mbti' 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  } ${!userProfiles.mbti ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!userProfiles.mbti}
                >
                  MBTI Type
                </button>
                
                <button
                  onClick={() => setPartnerType('enneagram')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    partnerType === 'enneagram' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  } ${!userProfiles.enneagram ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!userProfiles.enneagram}
                >
                  Enneagram Type
                </button>
                
                <button
                  onClick={() => setPartnerType('zodiac')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    partnerType === 'zodiac' 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  } ${!userProfiles.zodiac ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!userProfiles.zodiac}
                >
                  Zodiac Sign
                </button>
              </div>
              
              {/* MBTI Partner Options */}
              {partnerType === 'mbti' && userProfiles.mbti && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                       'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map(type => (
                      <button
                        key={type}
                        onClick={() => handlePartnerSelect(type)}
                        className={`px-3 py-2 rounded-lg text-center ${
                          selectedPartner === type 
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-300 dark:border-indigo-700' 
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                        } ${type === userProfiles.mbti ? 'relative' : ''}`}
                      >
                        {type}
                        {type === userProfiles.mbti && (
                          <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            You
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Enneagram Partner Options */}
              {partnerType === 'enneagram' && userProfiles.enneagram && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => {
                      const type = `${i + 1}`;
                      const wings = i === 0 ? [9, 2] : 
                                  i === 8 ? [8, 1] : 
                                  [i, i + 2];
                      
                      return (
                        <div key={type} className="space-y-2">
                          <button
                            onClick={() => handlePartnerSelect(`${type}w${wings[0]}`)}
                            className={`w-full px-3 py-2 rounded-lg text-center ${
                              selectedPartner === `${type}w${wings[0]}` 
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700' 
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                            } ${`${type}w${wings[0]}` === userProfiles.enneagram ? 'relative' : ''}`}
                          >
                            {type}w{wings[0]}
                            {`${type}w${wings[0]}` === userProfiles.enneagram && (
                              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                You
                              </span>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handlePartnerSelect(`${type}w${wings[1]}`)}
                            className={`w-full px-3 py-2 rounded-lg text-center ${
                              selectedPartner === `${type}w${wings[1]}` 
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-700' 
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                            } ${`${type}w${wings[1]}` === userProfiles.enneagram ? 'relative' : ''}`}
                          >
                            {type}w{wings[1]}
                            {`${type}w${wings[1]}` === userProfiles.enneagram && (
                              <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                You
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Zodiac Partner Options */}
              {partnerType === 'zodiac' && userProfiles.zodiac && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                       'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'].map(sign => (
                      <button
                        key={sign}
                        onClick={() => handlePartnerSelect(sign)}
                        className={`px-3 py-2 rounded-lg text-center ${
                          selectedPartner === sign 
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-700' 
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                        } ${sign === userProfiles.zodiac ? 'relative' : ''}`}
                      >
                        {sign.charAt(0).toUpperCase() + sign.slice(1)}
                        {sign === userProfiles.zodiac && (
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            You
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Messages for missing types */}
              {partnerType === 'mbti' && !userProfiles.mbti && (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    Take the personality test first to compare MBTI types
                  </p>
                </div>
              )}
              
              {partnerType === 'enneagram' && !userProfiles.enneagram && (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    Take the enneagram test first to compare enneagram types
                  </p>
                </div>
              )}
              
              {partnerType === 'zodiac' && !userProfiles.zodiac && (
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                Set your birth date first to compare zodiac signs
              </p>
            </div>
          )}
        </div>
        
        {/* Compatibility Results */}
        {matchResults && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-md mr-4">
                  <Percent className="text-pink-500 dark:text-pink-400" size={32} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {matchResults.overall}% Compatibility
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {matchResults.overall >= 80 ? 'Exceptional Match' :
                     matchResults.overall >= 70 ? 'Strong Match' :
                     matchResults.overall >= 60 ? 'Good Match' :
                     matchResults.overall >= 50 ? 'Average Match' :
                     matchResults.overall >= 40 ? 'Challenging Match' :
                     'Difficult Match'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {matchResults.categories.map((category, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {category.name}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {category.score}%
                      </span>
                    </div>
                    <div className="w-full bg-white/50 dark:bg-slate-700/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          category.score >= 80 ? 'bg-green-500 dark:bg-green-400' :
                          category.score >= 60 ? 'bg-blue-500 dark:bg-blue-400' :
                          category.score >= 40 ? 'bg-amber-500 dark:bg-amber-400' :
                          'bg-red-500 dark:bg-red-400'
                        }`}
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
                <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-3 flex items-center">
                  <ThumbsUp className="text-green-500 dark:text-green-400 mr-2" size={18} />
                  Relationship Strengths
                </h3>
                
                <ul className="space-y-2">
                  {matchResults.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mt-2"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Challenges */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300 mb-3 flex items-center">
                  <ThumbsDown className="text-amber-500 dark:text-amber-400 mr-2" size={18} />
                  Potential Challenges
                </h3>
                
                <ul className="space-y-2">
                  {matchResults.challenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mt-2"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Advice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30">
              <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">
                Relationship Advice
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {matchResults.advice}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompatibilityFinder;