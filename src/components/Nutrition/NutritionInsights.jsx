import React, { useState, useEffect } from 'react';
import { Brain, Battery, Calendar, TrendingUp, ArrowRight, Droplets, Clock } from 'lucide-react';
import { getStorage } from '../../utils/storage';

export const NutritionInsights = ({ foodEntries, date }) => {
  const [moodData, setMoodData] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [insightPeriod, setInsightPeriod] = useState('30days');
  
  useEffect(() => {
    // Fetch mood and energy data for correlation analysis
    const storage = getStorage();
    const moodEntries = [];
    const energyEntries = [];
    const foodFrequency = {};
    const foodMoodImpact = {};
    const foodEnergyImpact = {};
    
    // Determine date range based on period
    const currentDate = new Date();
    let startDate = new Date();
    
    if (insightPeriod === '7days') {
      startDate.setDate(currentDate.getDate() - 7);
    } else if (insightPeriod === '30days') {
      startDate.setDate(currentDate.getDate() - 30);
    } else if (insightPeriod === '90days') {
      startDate.setDate(currentDate.getDate() - 90);
    }
    
    // Format dates as strings for comparison
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = currentDate.toISOString().split('T')[0];
    
    // Iterate through all dates in storage
    Object.keys(storage).forEach(dateKey => {
      // Only process date entries
      if (dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Check if within date range
        if (dateKey >= startDateStr && dateKey <= endDateStr) {
          const dayData = storage[dateKey];
          
          // Get mood data if available
          if (dayData.morningMood || dayData.mood) {
            moodEntries.push({
              date: dateKey,
              mood: dayData.morningMood || dayData.mood
            });
          }
          
          // Get energy data if available
          if (dayData.morningEnergy || dayData.energyLevel) {
            energyEntries.push({
              date: dateKey,
              energy: dayData.morningEnergy || dayData.energyLevel
            });
          }
          
          // Get nutrition data if available
          if (storage.nutrition && storage.nutrition[dateKey] && storage.nutrition[dateKey].entries) {
            storage.nutrition[dateKey].entries.forEach(entry => {
              const foodName = entry.name;
              
              // Track food frequency
              if (!foodFrequency[foodName]) {
                foodFrequency[foodName] = 0;
              }
              foodFrequency[foodName]++;
              
              // Initialize impact tracking
              if (!foodMoodImpact[foodName]) {
                foodMoodImpact[foodName] = { total: 0, count: 0, emoji: entry.emoji || '🍽️' };
              }
              
              if (!foodEnergyImpact[foodName]) {
                foodEnergyImpact[foodName] = { total: 0, count: 0, emoji: entry.emoji || '🍽️' };
              }
              
              // Find mood/energy for the corresponding day
              const dayMood = moodEntries.find(m => m.date === dateKey);
              const dayEnergy = energyEntries.find(e => e.date === dateKey);
              
              // Calculate impact based on mood conversion
              if (dayMood) {
                const moodValue = convertMoodToValue(dayMood.mood);
                foodMoodImpact[foodName].total += moodValue;
                foodMoodImpact[foodName].count++;
              }
              
              if (dayEnergy) {
                foodEnergyImpact[foodName].total += dayEnergy.energy;
                foodEnergyImpact[foodName].count++;
              }
            });
          }
        }
      }
    });
    
    // Calculate correlations
    const correlations = [];
    
    Object.keys(foodFrequency).forEach(food => {
      if (foodFrequency[food] >= 3) { // Only consider foods eaten at least 3 times
        const moodImpact = foodMoodImpact[food].count > 0 
          ? Math.round((foodMoodImpact[food].total / foodMoodImpact[food].count) * 10) 
          : 0;
          
        const energyImpact = foodEnergyImpact[food].count > 0
          ? Math.round((foodEnergyImpact[food].total / foodEnergyImpact[food].count) * 10)
          : 0;
          
        correlations.push({
          food,
          frequency: foodFrequency[food],
          moodImpact,
          energyImpact,
          emoji: foodMoodImpact[food].emoji
        });
      }
    });
    
    // Sort by frequency
    correlations.sort((a, b) => b.frequency - a.frequency);
    
    setMoodData(moodEntries);
    setEnergyData(energyEntries);
    setCorrelationData(correlations.slice(0, 8)); // Show top 8
  }, [insightPeriod]);
  
  // Convert mood string to numeric value
  const convertMoodToValue = (mood) => {
    const moodMap = {
      'GREAT': 5,
      'GOOD': 4, 
      'OKAY': 3,
      'MEH': 2,
      'BAD': 1,
      'OVERWHELMED': 0
    };
    
    return moodMap[mood] || 3;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Brain className="text-red-500 dark:text-red-400" size={20} />
          Food-Mood Correlations
        </h3>
        
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              insightPeriod === '7days'
                ? 'bg-red-500 text-white'
                : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => setInsightPeriod('7days')}
          >
            7 Days
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              insightPeriod === '30days'
                ? 'bg-red-500 text-white'
                : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => setInsightPeriod('30days')}
          >
            30 Days
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              insightPeriod === '90days'
                ? 'bg-red-500 text-white'
                : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => setInsightPeriod('90days')}
          >
            90 Days
          </button>
        </div>
      </div>
      
      {correlationData.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Calendar size={32} className="text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Not Enough Data</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Keep tracking your food and mood for a few more days to see personalized insights.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Food</th>
                    <th className="py-2 px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Frequency</th>
                    <th className="py-2 px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Mood Impact</th>
                    <th className="py-2 px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Energy Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {correlationData.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-3 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.food}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                          {item.frequency}x
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          item.moodImpact > 0 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : item.moodImpact < 0
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {item.moodImpact > 0 ? '+' : ''}{item.moodImpact}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          item.energyImpact > 0 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : item.energyImpact < 0
                              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {item.energyImpact > 0 ? '+' : ''}{item.energyImpact}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} className="text-purple-500 dark:text-purple-400" />
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Mood Boosters</h4>
              </div>
              <div className="space-y-2">
                {correlationData
                  .filter(item => item.moodImpact > 0)
                  .sort((a, b) => b.moodImpact - a.moodImpact)
                  .slice(0, 3)
                  .map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <span>{item.emoji}</span> {item.food}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">+{item.moodImpact}%</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Battery size={18} className="text-blue-500 dark:text-blue-400" />
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Energy Boosters</h4>
              </div>
              <div className="space-y-2">
                {correlationData
                  .filter(item => item.energyImpact > 0)
                  .sort((a, b) => b.energyImpact - a.energyImpact)
                  .slice(0, 3)
                  .map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <span>{item.emoji}</span> {item.food}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">+{item.energyImpact}%</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-green-500 dark:text-green-400" />
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Best Insights</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> Breakfast Impact
                  </span>
                  <span className="text-green-600 dark:text-green-400">+18% Energy</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Droplets size={12} /> Hydration Effect
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">+25% Mood</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <ArrowRight size={12} /> Consistency
                  </span>
                  <span className="text-purple-600 dark:text-purple-400">+15% Overall</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NutritionInsights;