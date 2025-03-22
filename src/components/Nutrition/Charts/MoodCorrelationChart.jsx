import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStorage } from '../../../utils/storage';

export const MoodCorrelationChart = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Generate correlation data
    const correlationData = generateCorrelationData();
    setData(correlationData);
  }, []);
  
  const generateCorrelationData = () => {
    const storage = getStorage();
    const correlationData = [];
    
    // Skip if no nutrition data
    if (!storage.nutrition) return [];
    
    // Get all food entries
    const foodEntries = [];
    Object.keys(storage.nutrition).forEach(dateKey => {
      // Only process date entries
      if (dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dayData = storage.nutrition[dateKey];
        if (dayData.entries && dayData.entries.length > 0) {
          // Get corresponding mood/energy data if available
          const moodValue = storage[dateKey]?.morningMood || storage[dateKey]?.mood;
          const energyValue = storage[dateKey]?.morningEnergy || storage[dateKey]?.energyLevel;
          
          // Convert mood to numeric value
          const moodNumeric = convertMoodToValue(moodValue);
          
          // Add entries with mood/energy correlation
          dayData.entries.forEach(entry => {
            foodEntries.push({
              food: entry.name,
              category: entry.category || 'Uncategorized',
              mood: moodNumeric,
              energy: energyValue || 0,
              date: dateKey
            });
          });
        }
      }
    });
    
    // Group by food and calculate average mood/energy
    const foodGroups = {};
    foodEntries.forEach(entry => {
      if (!foodGroups[entry.food]) {
        foodGroups[entry.food] = {
          food: entry.food,
          category: entry.category,
          moodTotal: 0,
          energyTotal: 0,
          count: 0
        };
      }
      
      if (entry.mood) {
        foodGroups[entry.food].moodTotal += entry.mood;
      }
      
      if (entry.energy) {
        foodGroups[entry.food].energyTotal += entry.energy;
      }
      
      foodGroups[entry.food].count++;
    });
    
    // Convert to array and calculate averages
    Object.values(foodGroups).forEach(group => {
      if (group.count > 0) {
        correlationData.push({
          food: group.food,
          category: group.category,
          mood: group.moodTotal / group.count,
          energy: group.energyTotal / group.count,
          count: group.count
        });
      }
    });
    
    return correlationData;
  };
  
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
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md">
          <p className="font-medium text-slate-800 dark:text-slate-200">{data.food}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">Category: {data.category}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Mood Impact: {data.mood.toFixed(1)}/5</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Energy Impact: {data.energy.toFixed(1)}/3</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Based on {data.count} entries</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {data.length > 0 ? (
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
        >
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="mood" 
            name="Mood" 
            domain={[0, 5]} 
            label={{ value: 'Mood Impact', position: 'bottom', offset: 0 }}
          />
          <YAxis 
            type="number" 
            dataKey="energy" 
            name="Energy" 
            domain={[0, 3]} 
            label={{ value: 'Energy Impact', angle: -90, position: 'left' }}
          />
          <ZAxis 
            type="number" 
            dataKey="count" 
            range={[40, 200]} 
            name="Frequency" 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Scatter 
            name="Food-Mood Correlation" 
            data={data} 
            fill="#8884d8" 
          />
        </ScatterChart>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 dark:text-slate-400">
            Not enough data to generate correlation chart.
          </p>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default MoodCorrelationChart;