import React, { useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const CategoriesChart = ({ data }) => {
  // Prepare data for the chart
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
  
  // Define colors for different categories
  const COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#FFD166', // Yellow
    '#6A0572', // Purple
    '#1A535C', // Dark Teal
    '#FF9F1C', // Orange
    '#2EC4B6', // Turquoise
    '#8675A9'  // Lavender
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [`${value} entries`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoriesChart;