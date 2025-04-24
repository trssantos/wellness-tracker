// src/components/Lifestyle/BiorhythmChart.jsx
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { generateBiorhythmData, getBiorhythmColor } from '../../utils/biorhythmUtils';
import { formatDateForStorage } from '../../utils/dateUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    
    const isToday = formatDateForStorage(date) === formatDateForStorage(new Date());
    
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
          {isToday ? 'Today - ' : ''}{formattedDate}
        </p>
        {payload.map((entry, index) => {
          const colors = getBiorhythmColor(entry.dataKey);
          return (
            <p 
              key={`item-${index}`} 
              className="text-sm" 
              style={{ color: colors.normal }}
            >
              {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: {entry.value}%
            </p>
          );
        })}
      </div>
    );
  }

  return null;
};

const BiorhythmChart = ({ birthDate, selectedDate, cycles = ['physical', 'emotional', 'intellectual'] }) => {
  const [data, setData] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);
  
  useEffect(() => {
    if (!birthDate) return;
    
    const biorhythmData = generateBiorhythmData(birthDate, selectedDate, 15);
    setData(biorhythmData);
    
    // Find the index of the selected date for reference line
    const selectedDateStr = formatDateForStorage(selectedDate);
    const centerIdx = biorhythmData.findIndex(item => item.date === selectedDateStr);
    setCenterIndex(centerIdx >= 0 ? centerIdx : biorhythmData.length / 2);
  }, [birthDate, selectedDate]);
  
  if (!birthDate || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">Please enter your birth date to view biorhythm chart</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" strokeOpacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }} 
            tickFormatter={(date) => {
              const dateObj = new Date(date);
              // Show day of month with condensed day name
              return `${dateObj.getDate()}${['Su','Mo','Tu','We','Th','Fr','Sa'][dateObj.getDay()]}`;
            }}
          />
          <YAxis 
            domain={[-100, 100]} 
            tick={{ fontSize: 10 }} 
            tickFormatter={(value) => `${value}%`} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" />
          <ReferenceLine y={0} stroke="#6b7280" strokeOpacity={0.5} />
          
          {/* Vertical line for selected date */}
          {centerIndex >= 0 && (
            <ReferenceLine
              x={data[centerIndex]?.date}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{ 
                value: 'Today', 
                position: 'top', 
                fill: '#8b5cf6',
                fontSize: 12,
              }}
            />
          )}
          
          {/* Draw the three cycles with appropriate colors */}
          {cycles.includes('physical') && (
            <Line
              type="monotone"
              dataKey="physical"
              name="Physical"
              stroke={getBiorhythmColor('physical').normal}
              dot={false}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          )}
          
          {cycles.includes('emotional') && (
            <Line
              type="monotone"
              dataKey="emotional"
              name="Emotional"
              stroke={getBiorhythmColor('emotional').normal}
              dot={false}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          )}
          
          {cycles.includes('intellectual') && (
            <Line
              type="monotone"
              dataKey="intellectual"
              name="Intellectual"
              stroke={getBiorhythmColor('intellectual').normal}
              dot={false}
              activeDot={{ r: 6 }}
              strokeWidth={2}
            />
          )}
          
          {cycles.includes('average') && (
            <Line
              type="monotone"
              dataKey="average"
              name="Combined"
              stroke={getBiorhythmColor('average').normal}
              dot={false}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BiorhythmChart;