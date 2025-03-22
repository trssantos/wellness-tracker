import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const FoodFrequencyChart = ({ data }) => {
  // Format data for the chart
  const chartData = data.map(item => ({
    name: item.food,
    count: item.count
  }));
  
  // Format the name to prevent overflow
  const formatXAxis = (value) => {
    if (value.length > 10) {
      return `${value.substring(0, 10)}...`;
    }
    return value;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartData.length > 0 ? (
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            tickFormatter={formatXAxis} 
            width={100}
          />
          <Tooltip 
            formatter={(value, name) => [`${value} times`, 'Frequency']}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="count" fill="#FF6B6B" barSize={20} radius={[0, 4, 4, 0]} />
        </BarChart>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 dark:text-slate-400">
            Not enough data to show most frequent foods.
          </p>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default FoodFrequencyChart;