import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MOODS } from '../../MoodSelector';

export const MoodTrendChart = ({ data }) => {
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

  // Map mood data for chart
  const chartData = data.map(item => ({
    ...item,
    moodValue: getMoodValue(item.mood)
  }));

  // If no data is available, show a message
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 text-center">No mood data available for this month.</p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const moodKey = Object.keys(MOODS).find(
        key => getMoodValue(key) === payload[0].value
      );
      const mood = moodKey ? MOODS[moodKey] : null;

      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-sm">
          <p className="font-medium text-slate-800 dark:text-slate-200">Day {label}</p>
          <p className="flex items-center gap-2">
            <span>Mood: </span>
            {mood && (
              <>
                <span className="text-lg">{mood.emoji}</span>
                <span className="text-purple-600 dark:text-purple-400">{mood.label}</span>
              </>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Y-axis tick formatter to show mood labels
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
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
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
        <Line 
          type="monotone" 
          dataKey="moodValue" 
          name="Mood" 
          stroke="#a855f7" 
          strokeWidth={3}
          dot={{ fill: '#a855f7', r: 4 }}
          activeDot={{ fill: '#a855f7', stroke: '#f3e8ff', strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MoodTrendChart;