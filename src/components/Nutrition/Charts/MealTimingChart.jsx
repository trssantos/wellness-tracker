import React from 'react';
import { Cell,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MealTimingChart = ({ data }) => {
  // Prepare data for the chart
  const chartData = Object.entries(data).map(([name, value]) => ({ 
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value 
  }));
  
  // Define colors for different meal types
  const COLOR_MAP = {
    'Breakfast': '#FF9F1C', // Orange
    'Lunch': '#4ECDC4',     // Teal
    'Dinner': '#6A0572',    // Purple
    'Snack': '#FF6B6B'      // Red
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => [`${value} meals`, 'Count']}
          labelFormatter={(label) => `${label}`}
        />
        <Bar 
          dataKey="count" 
          name="Meals"
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name] || '#8884d8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MealTimingChart;