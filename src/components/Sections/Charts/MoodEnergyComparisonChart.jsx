import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { MOODS } from '../../MoodSelector';

export const MoodEnergyComparisonChart = ({ data }) => {
  // If no data is available, show a message
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 text-center">No mood/energy comparison data available for this month.</p>
      </div>
    );
  }

  // Convert mood to numerical value for chart
  const getMoodValue = (mood) => {
    const moodMap = {
      'GREAT': 5,
      'GOOD': 4,
      'OKAY': 3,
      'MEH': 2,
      'BAD': 1,
      'OVERWHELMED': 0
    };
    return moodMap[mood] || 3; // Default to OKAY if mood not found
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the mood keys based on values
      const getMoodKey = (value) => 
        Object.keys(MOODS).find(key => getMoodValue(key) === value);
      
      const morningMoodKey = getMoodKey(payload.find(p => p.name === 'Morning Mood')?.value);
      const eveningMoodKey = getMoodKey(payload.find(p => p.name === 'Evening Mood')?.value);
      
      const morningMood = morningMoodKey ? MOODS[morningMoodKey] : null;
      const eveningMood = eveningMoodKey ? MOODS[eveningMoodKey] : null;

      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-sm">
          <p className="font-medium text-slate-800 dark:text-slate-200 mb-2">Day {label}</p>
          
          {/* Morning Data */}
          {payload.find(p => p.name === 'Morning Mood') && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-amber-700 dark:text-amber-300">Morning:</span>
              {morningMood && <span className="text-lg ml-1">{morningMood.emoji}</span>}
              <span className="text-slate-600 dark:text-slate-400">
                (Energy: {payload.find(p => p.name === 'Morning Energy')?.value || '-'}/3)
              </span>
            </div>
          )}
          
          {/* Evening Data */}
          {payload.find(p => p.name === 'Evening Mood') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-indigo-700 dark:text-indigo-300">Evening:</span>
              {eveningMood && <span className="text-lg ml-1">{eveningMood.emoji}</span>}
              <span className="text-slate-600 dark:text-slate-400">
                (Energy: {payload.find(p => p.name === 'Evening Energy')?.value || '-'}/3)
              </span>
            </div>
          )}
          
          {/* Change Value */}
          {payload.find(p => p.name === 'Morning Mood') && payload.find(p => p.name === 'Evening Mood') && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-medium">Mood Change: </span>
              <span className={
                payload.find(p => p.name === 'Change')?.value > 0 
                  ? 'text-green-600 dark:text-green-400'
                  : payload.find(p => p.name === 'Change')?.value < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-600 dark:text-slate-400'
              }>
                {payload.find(p => p.name === 'Change')?.value > 0 ? '+' : ''}
                {payload.find(p => p.name === 'Change')?.value || 0}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Y-axis tick formatter to show mood labels as emoji
  const formatYAxisTick = (value) => {
    const moodKey = Object.keys(MOODS).find(
      key => getMoodValue(key) === value
    );
    if (moodKey) {
      return MOODS[moodKey].emoji;
    }
    return '';
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 20, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
        <XAxis 
          dataKey="day" 
          tick={{ fill: '#6b7280' }} 
          axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
          tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
        />
        <YAxis 
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          tickFormatter={formatYAxisTick}
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
          tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Reference line for neutral mood */}
        <ReferenceLine y={3} stroke="#9ca3af" strokeDasharray="3 3" />
        
        {/* Morning Mood Line */}
        <Line 
          type="monotone" 
          dataKey="morningMood" 
          name="Morning Mood" 
          stroke="#f59e0b" 
          strokeWidth={2}
          dot={{ fill: '#f59e0b', r: 4 }}
          activeDot={{ fill: '#f59e0b', stroke: '#fef3c7', strokeWidth: 2, r: 6 }}
        />
        
        {/* Evening Mood Line */}
        <Line 
          type="monotone" 
          dataKey="eveningMood" 
          name="Evening Mood" 
          stroke="#6366f1" 
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 4 }}
          activeDot={{ fill: '#6366f1', stroke: '#e0e7ff', strokeWidth: 2, r: 6 }}
        />
        
        {/* Morning Energy Points */}
        <Scatter 
          dataKey="morningEnergy" 
          name="Morning Energy"
          fill="#fcd34d" 
          shape="triangle" 
          legendType="diamond"
        />
        
        {/* Evening Energy Points */}
        <Scatter 
          dataKey="eveningEnergy" 
          name="Evening Energy"
          fill="#a5b4fc" 
          shape="triangle" 
          legendType="diamond"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default MoodEnergyComparisonChart;