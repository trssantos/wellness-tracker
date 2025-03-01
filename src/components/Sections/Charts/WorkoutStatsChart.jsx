import React, { useState } from 'react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Area
} from 'recharts';

export const WorkoutStatsChart = ({ data }) => {
  const [chartType, setChartType] = useState('duration'); // 'duration', 'calories', or 'both'
  
  // If no data is available, show a message
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 text-center">No workout data available for this month.</p>
      </div>
    );
  }
  
  // Add workout type counts
  const getWorkoutTypeCounts = () => {
    const typeCounts = {};
    data.forEach(workout => {
      if (workout.types && workout.types.length > 0) {
        workout.types.forEach(type => {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
      }
    });
    return typeCounts;
  };
  
  const workoutTypeCounts = getWorkoutTypeCounts();
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-sm">
          <p className="font-medium text-slate-800 dark:text-slate-200">Day {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.name === 'Duration' ? 'min' : 'kcal'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      {/* Chart Type Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'duration' 
                ? 'bg-green-500 text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setChartType('duration')}
          >
            Duration
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'calories' 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setChartType('calories')}
          >
            Calories
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'both' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setChartType('both')}
          >
            Combined
          </button>
        </div>
      </div>
      
      {/* Types Summary (small pills above the chart) */}
      {Object.keys(workoutTypeCounts).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {Object.entries(workoutTypeCounts).map(([type, count]) => (
            <div key={type} className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">{type}:</span> {count}
            </div>
          ))}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 20, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
          <XAxis 
            dataKey="day" 
            tick={{ fill: '#6b7280' }} 
            axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
            tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
          />
          
          {/* Y-axis for Duration */}
          {(chartType === 'duration' || chartType === 'both') && (
            <YAxis 
              yAxisId="duration"
              orientation="left"
              domain={[0, 'auto']}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
              tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
              label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
            />
          )}
          
          {/* Y-axis for Calories */}
          {(chartType === 'calories' || chartType === 'both') && (
            <YAxis 
              yAxisId="calories"
              orientation={chartType === 'both' ? "right" : "left"}
              domain={[0, 'auto']}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
              tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
              label={{ 
                value: 'Calories (kcal)', 
                angle: -90, 
                position: chartType === 'both' ? 'insideRight' : 'insideLeft', 
                fill: '#6b7280', 
                fontSize: 12 
              }}
            />
          )}
          
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Duration Bar */}
          {(chartType === 'duration' || chartType === 'both') && (
            <Bar 
              dataKey="duration" 
              name="Duration" 
              yAxisId="duration"
              fill="#10b981" 
              radius={[4, 4, 0, 0]}
              fillOpacity={0.8} 
            />
          )}
          
          {/* Calories Line */}
          {(chartType === 'calories' || chartType === 'both') && (
            <Line 
              type="monotone" 
              dataKey="calories" 
              name="Calories" 
              yAxisId="calories"
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ fill: '#f97316', r: 4 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WorkoutStatsChart;