import React from 'react';
import { Brain, Battery, ArrowRight, Info } from 'lucide-react';

export const MoodBasedSuggestions = ({ mood, energy }) => {
  // Map of food suggestions based on mood
  const moodFoodMap = {
    'GREAT': {
      foods: ['Berries', 'Greek Yogurt', 'Almonds', 'Avocado', 'Dark Leafy Greens'],
      description: 'Maintain your great mood with these nutrient-dense foods that support brain health.',
      emoji: '😊'
    },
    'GOOD': {
      foods: ['Fatty Fish', 'Whole Grains', 'Bananas', 'Dark Chocolate', 'Nuts'],
      description: 'Keep your positive mood going with these serotonin-supporting foods.',
      emoji: '🙂'
    },
    'OKAY': {
      foods: ['Eggs', 'Salmon', 'Blueberries', 'Fermented Foods', 'Broccoli'],
      description: 'Boost your mood with these foods rich in omega-3s and probiotics.',
      emoji: '😐'
    },
    'MEH': {
      foods: ['Turkey', 'Chickpeas', 'Leafy Greens', 'Lentils', 'Oats'],
      description: 'These tryptophan and protein-rich foods can help elevate your mood.',
      emoji: '😕'
    },
    'BAD': {
      foods: ['Fatty Fish', 'Walnuts', 'Dark Chocolate', 'Bananas', 'Spinach'],
      description: 'These omega-3 and magnesium-rich foods can help improve your mood.',
      emoji: '😔'
    },
    'OVERWHELMED': {
      foods: ['Green Tea', 'Dark Chocolate', 'Blueberries', 'Avocados', 'Brazil Nuts'],
      description: 'These foods contain antioxidants and compounds that may reduce stress and anxiety.',
      emoji: '🤯'
    }
  };
  
  // Map of food suggestions based on energy level
  const energyFoodMap = {
    1: {
      foods: ['Oatmeal', 'Sweet Potatoes', 'Bananas', 'Quinoa', 'Eggs'],
      description: 'These complex carbs and protein-rich foods provide sustained energy.',
      level: 'Low'
    },
    2: {
      foods: ['Lean Proteins', 'Nuts', 'Seeds', 'Fruits', 'Yogurt'],
      description: 'Maintain your energy with these balanced protein and carb options.',
      level: 'Medium'
    },
    3: {
      foods: ['Water', 'Leafy Greens', 'Lean Proteins', 'Berries', 'Legumes'],
      description: 'Keep your high energy going with hydration and nutrient-dense foods.',
      level: 'High'
    }
  };
  
  // Get suggestions based on mood and energy
  const moodSuggestions = mood ? moodFoodMap[mood] : null;
  const energySuggestions = energy > 0 ? energyFoodMap[energy] : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
        <Info className="text-red-500 dark:text-red-400" size={20} />
        Personalized Food Recommendations
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood-Based Suggestions */}
        {moodSuggestions && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="text-purple-500 dark:text-purple-400" size={18} />
              <h4 className="font-medium text-slate-700 dark:text-slate-300">
                Based on your {mood.toLowerCase()} mood {moodSuggestions.emoji}
              </h4>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {moodSuggestions.description}
            </p>
            
            <div className="space-y-2">
              {moodSuggestions.foods.map((food, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <span className="text-slate-700 dark:text-slate-300">{food}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Energy-Based Suggestions */}
        {energySuggestions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Battery className="text-blue-500 dark:text-blue-400" size={18} />
              <h4 className="font-medium text-slate-700 dark:text-slate-300">
                Based on your {energySuggestions.level.toLowerCase()} energy
              </h4>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {energySuggestions.description}
            </p>
            
            <div className="space-y-2">
              {energySuggestions.foods.map((food, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700 dark:text-slate-300">{food}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {!moodSuggestions && !energySuggestions && (
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Track your mood and energy to get personalized food recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodBasedSuggestions;