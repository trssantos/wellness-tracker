import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const JunkVsHealthyChart = ({ data }) => {
  // Prepare data for the chart
  const chartData = [
    { name: 'Healthy', value: data.healthy, color: '#22c55e' }, // Green
    { name: 'Junk', value: data.junk, color: '#ef4444' },     // Red
    { name: 'Neutral', value: data.neutral, color: '#94a3b8' } // Slate
  ].filter(item => item.value > 0);

  // Custom legend
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 pt-2">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-xs text-slate-600 dark:text-slate-300">
              {entry.value}: {entry.payload.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-slate-600 dark:text-slate-400">
            Count: {payload[0].value}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            {Math.round((payload[0].value / (data.healthy + data.junk + data.neutral)) * 100)}% of total
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartData.length > 0 ? (
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 dark:text-slate-400">
            Not enough data to generate chart.
          </p>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default JunkVsHealthyChart;