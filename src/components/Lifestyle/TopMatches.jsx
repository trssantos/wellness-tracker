// src/components/Lifestyle/TopMatches.jsx
import React from 'react';
import { Heart, Star, Type, Brain, Info, Award, ThumbsUp } from 'lucide-react';
import { getZodiacCompatibility, getZodiacColors } from '../../utils/zodiacData';
import { personalityTypes } from '../../utils/personalityData';
import { enneagramTypes } from '../../utils/enneagramData';

const TopMatches = ({ userProfiles }) => {
  // Get top matches for each category
  const mbtiMatches = userProfiles.mbti ? getTopMBTIMatches(userProfiles.mbti) : [];
  const enneagramMatches = userProfiles.enneagram ? getTopEnneagramMatches(userProfiles.enneagram) : [];
  const zodiacMatches = userProfiles.zodiac ? getTopZodiacMatches(userProfiles.zodiac) : [];

  // Determine if we have enough data to show matches
  const hasMatches = mbtiMatches.length > 0 || enneagramMatches.length > 0 || zodiacMatches.length > 0;

  if (!hasMatches) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" size={18} />
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Complete your personality profiles to see your most compatible matches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center">
        <Award className="text-pink-500 dark:text-pink-400 mr-2" size={20} />
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Your Top Matches
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MBTI Top Matches */}
        {mbtiMatches.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 border-b border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-center">
                <Brain className="text-indigo-500 dark:text-indigo-400 mr-2" size={16} />
                <h4 className="font-medium text-slate-800 dark:text-slate-200">MBTI Compatibility</h4>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {mbtiMatches.map((match, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm mr-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{match.type}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{match.type}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{personalityTypes[match.type]?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mr-1">{match.score}%</span>
                    <ThumbsUp className="text-indigo-500 dark:text-indigo-400" size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enneagram Top Matches */}
        {enneagramMatches.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800/30 overflow-hidden">
            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 border-b border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center">
                <Type className="text-purple-500 dark:text-purple-400 mr-2" size={16} />
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Enneagram Compatibility</h4>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {enneagramMatches.map((match, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm mr-2">
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{match.type}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Type {match.type}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{enneagramTypes[match.type]?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400 mr-1">{match.score}%</span>
                    <ThumbsUp className="text-purple-500 dark:text-purple-400" size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zodiac Top Matches */}
        {zodiacMatches.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800/30 overflow-hidden">
            <div className="bg-amber-50 dark:bg-amber-900/30 p-3 border-b border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center">
                <Star className="text-amber-500 dark:text-amber-400 mr-2" size={16} />
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Zodiac Compatibility</h4>
              </div>
            </div>
            <div className="p-3 space-y-2">
              {zodiacMatches.map((match, index) => {
                const colors = getZodiacColors(match.sign);
                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg ${colors.bg}`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm mr-2">
                        <span className={`text-lg ${colors.accent}`} dangerouslySetInnerHTML={{ __html: match.symbol }}></span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {match.sign.charAt(0).toUpperCase() + match.sign.slice(1)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{match.element}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400 mr-1">{match.score}%</span>
                      <ThumbsUp className="text-amber-500 dark:text-amber-400" size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions to get top matches
const getTopMBTIMatches = (userType) => {
  // This would ideally be replaced with your actual compatibility algorithm
  // Here's a simplified version that returns hardcoded matches based on type
  
  // Ideal matches for each MBTI type
  const idealMatches = {
    'INTJ': [
      { type: 'ENFP', score: 87 }, 
      { type: 'ENTP', score: 85 }, 
      { type: 'INFJ', score: 82 }
    ],
    'INTP': [
      { type: 'ENTJ', score: 89 }, 
      { type: 'ENFJ', score: 84 }, 
      { type: 'INFJ', score: 80 }
    ],
    'ENTJ': [
      { type: 'INTP', score: 89 }, 
      { type: 'INFP', score: 83 }, 
      { type: 'ENTP', score: 81 }
    ],
    'ENTP': [
      { type: 'INFJ', score: 88 }, 
      { type: 'INTJ', score: 85 }, 
      { type: 'ENFJ', score: 82 }
    ],
    'INFJ': [
      { type: 'ENTP', score: 88 }, 
      { type: 'ENFP', score: 86 }, 
      { type: 'INTJ', score: 82 }
    ],
    'INFP': [
      { type: 'ENFJ', score: 90 }, 
      { type: 'ENTJ', score: 83 }, 
      { type: 'INFJ', score: 81 }
    ],
    'ENFJ': [
      { type: 'INFP', score: 90 }, 
      { type: 'ISFP', score: 85 }, 
      { type: 'INTP', score: 84 }
    ],
    'ENFP': [
      { type: 'INTJ', score: 87 }, 
      { type: 'INFJ', score: 86 }, 
      { type: 'ENFJ', score: 81 }
    ],
    'ISTJ': [
      { type: 'ESFP', score: 86 }, 
      { type: 'ESTP', score: 85 }, 
      { type: 'ESTJ', score: 82 }
    ],
    'ISFJ': [
      { type: 'ESFP', score: 87 }, 
      { type: 'ESTP', score: 84 }, 
      { type: 'ISFP', score: 81 }
    ],
    'ESTJ': [
      { type: 'ISTP', score: 85 }, 
      { type: 'ISFP', score: 83 }, 
      { type: 'ISTJ', score: 82 }
    ],
    'ESFJ': [
      { type: 'ISFP', score: 88 }, 
      { type: 'ISTP', score: 84 }, 
      { type: 'ESFP', score: 81 }
    ],
    'ISTP': [
      { type: 'ESFJ', score: 84 }, 
      { type: 'ESTJ', score: 85 }, 
      { type: 'ISFJ', score: 80 }
    ],
    'ISFP': [
      { type: 'ESFJ', score: 88 }, 
      { type: 'ESTJ', score: 83 }, 
      { type: 'ENFJ', score: 85 }
    ],
    'ESTP': [
      { type: 'ISFJ', score: 84 }, 
      { type: 'ISTJ', score: 85 }, 
      { type: 'ESTP', score: 81 }
    ],
    'ESFP': [
      { type: 'ISFJ', score: 87 }, 
      { type: 'ISTJ', score: 86 }, 
      { type: 'ESFJ', score: 81 }
    ]
  };
  
  return idealMatches[userType] || [];
};

const getTopEnneagramMatches = (userType) => {
  // This is a simplified version - in reality, you would have a more complex algorithm
  // Extract the core type without wing
  const coreType = userType.split('w')[0];
  
  // Compatibility matches for each Enneagram type
  const compatibilityMatches = {
    '1': [
      { type: '7', score: 85 },
      { type: '9', score: 82 },
      { type: '2', score: 78 }
    ],
    '2': [
      { type: '4', score: 86 },
      { type: '8', score: 84 },
      { type: '1', score: 78 }
    ],
    '3': [
      { type: '9', score: 83 },
      { type: '6', score: 81 },
      { type: '7', score: 77 }
    ],
    '4': [
      { type: '2', score: 86 },
      { type: '9', score: 82 },
      { type: '5', score: 79 }
    ],
    '5': [
      { type: '1', score: 84 },
      { type: '7', score: 82 },
      { type: '9', score: 80 }
    ],
    '6': [
      { type: '9', score: 88 },
      { type: '8', score: 83 },
      { type: '3', score: 81 }
    ],
    '7': [
      { type: '5', score: 82 },
      { type: '1', score: 85 },
      { type: '3', score: 77 }
    ],
    '8': [
      { type: '2', score: 84 },
      { type: '6', score: 83 },
      { type: '4', score: 80 }
    ],
    '9': [
      { type: '6', score: 88 },
      { type: '3', score: 83 },
      { type: '4', score: 82 }
    ]
  };
  
  return compatibilityMatches[coreType] || [];
};

const getTopZodiacMatches = (userSign) => {
  // Element-based compatibility
  const elements = {
    'aries': 'fire', 'leo': 'fire', 'sagittarius': 'fire',
    'taurus': 'earth', 'virgo': 'earth', 'capricorn': 'earth',
    'gemini': 'air', 'libra': 'air', 'aquarius': 'air',
    'cancer': 'water', 'scorpio': 'water', 'pisces': 'water'
  };
  
  // Zodiac compatibility matches
  const compatibilityMatches = {
    'aries': [
      { sign: 'leo', element: 'Fire', score: 92, symbol: '♌' },
      { sign: 'sagittarius', element: 'Fire', score: 90, symbol: '♐' },
      { sign: 'libra', element: 'Air', score: 85, symbol: '♎' }
    ],
    'taurus': [
      { sign: 'virgo', element: 'Earth', score: 91, symbol: '♍' },
      { sign: 'capricorn', element: 'Earth', score: 90, symbol: '♑' },
      { sign: 'cancer', element: 'Water', score: 87, symbol: '♋' }
    ],
    'gemini': [
      { sign: 'libra', element: 'Air', score: 92, symbol: '♎' },
      { sign: 'aquarius', element: 'Air', score: 91, symbol: '♒' },
      { sign: 'aries', element: 'Fire', score: 84, symbol: '♈' }
    ],
    'cancer': [
      { sign: 'scorpio', element: 'Water', score: 90, symbol: '♏' },
      { sign: 'pisces', element: 'Water', score: 90, symbol: '♓' },
      { sign: 'taurus', element: 'Earth', score: 87, symbol: '♉' }
    ],
    'leo': [
      { sign: 'aries', element: 'Fire', score: 92, symbol: '♈' },
      { sign: 'sagittarius', element: 'Fire', score: 91, symbol: '♐' },
      { sign: 'gemini', element: 'Air', score: 85, symbol: '♊' }
    ],
    'virgo': [
      { sign: 'taurus', element: 'Earth', score: 91, symbol: '♉' },
      { sign: 'capricorn', element: 'Earth', score: 90, symbol: '♑' },
      { sign: 'cancer', element: 'Water', score: 85, symbol: '♋' }
    ],
    'libra': [
      { sign: 'gemini', element: 'Air', score: 92, symbol: '♊' },
      { sign: 'aquarius', element: 'Air', score: 91, symbol: '♒' },
      { sign: 'leo', element: 'Fire', score: 85, symbol: '♌' }
    ],
    'scorpio': [
      { sign: 'cancer', element: 'Water', score: 90, symbol: '♋' },
      { sign: 'pisces', element: 'Water', score: 90, symbol: '♓' },
      { sign: 'capricorn', element: 'Earth', score: 84, symbol: '♑' }
    ],
    'sagittarius': [
      { sign: 'aries', element: 'Fire', score: 90, symbol: '♈' },
      { sign: 'leo', element: 'Fire', score: 91, symbol: '♌' },
      { sign: 'aquarius', element: 'Air', score: 85, symbol: '♒' }
    ],
    'capricorn': [
      { sign: 'taurus', element: 'Earth', score: 90, symbol: '♉' },
      { sign: 'virgo', element: 'Earth', score: 90, symbol: '♍' },
      { sign: 'scorpio', element: 'Water', score: 84, symbol: '♏' }
    ],
    'aquarius': [
      { sign: 'gemini', element: 'Air', score: 91, symbol: '♊' },
      { sign: 'libra', element: 'Air', score: 91, symbol: '♎' },
      { sign: 'sagittarius', element: 'Fire', score: 85, symbol: '♐' }
    ],
    'pisces': [
      { sign: 'cancer', element: 'Water', score: 90, symbol: '♋' },
      { sign: 'scorpio', element: 'Water', score: 90, symbol: '♏' },
      { sign: 'capricorn', element: 'Earth', score: 85, symbol: '♑' }
    ]
  };
  
  return compatibilityMatches[userSign] || [];
};

export default TopMatches;