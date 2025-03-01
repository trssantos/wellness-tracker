import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const ProgressChart = ({ data }) => {
  // If no data is available, show a message
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 text-center">No progress data available for this month.</p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-sm">
          <p className="font-medium text-slate-800 dark:text-slate-200">Day {label}</p>
          <p className="text-blue-600 dark:text-blue-400">Progress: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
        <XAxis 
          dataKey="day" 
          tick={{ fill: '#6b7280' }} 
          axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
          tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fill: '#6b7280' }}
          axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
          tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
          label={{ value: 'Completion %', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="progress" 
          name="Task Completion" 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
          fillOpacity={0.8} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;