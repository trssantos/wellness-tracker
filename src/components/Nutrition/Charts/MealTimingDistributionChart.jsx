import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const MealTimingDistributionChart = ({ data }) => {
  // Prepare data for the chart
  const chartData = Object.entries(data).map(([timeRange, mealTypes]) => ({
    timeRange,
    breakfast: mealTypes.breakfast || 0,
    lunch: mealTypes.lunch || 0,
    dinner: mealTypes.dinner || 0,
    snack: mealTypes.snack || 0
  }));
  
  // Sort data by time range
  const timeRangeOrder = ['5-8', '9-11', '12-14', '15-17', '18-20', '21-23', '0-4'];
  chartData.sort((a, b) => {
    return timeRangeOrder.indexOf(a.timeRange) - timeRangeOrder.indexOf(b.timeRange);
  });
  
  // Map time ranges to more readable labels
  const timeLabels = {
    '5-8': 'Early Morning',
    '9-11': 'Morning',
    '12-14': 'Midday',
    '15-17': 'Afternoon',
    '18-20': 'Evening',
    '21-23': 'Night',
    '0-4': 'Late Night'
  };
  
  // Update time range labels
  chartData.forEach(item => {
    item.name = timeLabels[item.timeRange] || item.timeRange;
  });
  
  // Define colors for different meal types
  const colors = {
    breakfast: '#FF9F1C', // Orange
    lunch: '#4ECDC4',     // Teal
    dinner: '#6A0572',    // Purple
    snack: '#FF6B6B'      // Red
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-md">
          <p className="font-medium text-slate-800 dark:text-slate-200">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={60} 
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="breakfast" name="Breakfast" fill={colors.breakfast} />
        <Bar dataKey="lunch" name="Lunch" fill={colors.lunch} />
        <Bar dataKey="dinner" name="Dinner" fill={colors.dinner} />
        <Bar dataKey="snack" name="Snack" fill={colors.snack} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MealTimingDistributionChart;