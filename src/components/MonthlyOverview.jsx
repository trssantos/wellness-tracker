import React from 'react';
import { BarChart, Calendar as CalendarIcon, SmilePlus } from 'lucide-react';
import { MOODS } from './MoodSelector';

export const MonthlyOverview = ({ currentMonth, storageData }) => {
  const getMonthData = () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    let totalProgress = 0;
    let moodCounts = Object.keys(MOODS).reduce((acc, mood) => ({ ...acc, [mood]: 0 }), {});
    let progressDays = 0;
    let daysWithData = new Set(); // Track unique days with any data
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayData = storageData[dateStr];
      
      if (dayData) {
        // Track progress
        if (dayData.checked) {
          const completed = Object.values(dayData.checked).filter(Boolean).length;
          const total = Object.values(dayData.checked).length;
          totalProgress += (completed / total) * 100;
          progressDays++;
          daysWithData.add(dateStr);
        }
        
        // Track mood
        if (dayData.mood) {
          moodCounts[dayData.mood]++;
          daysWithData.add(dateStr);
        }
      }
    }
    
    const totalDaysTracked = daysWithData.size;
    const avgProgress = progressDays > 0 ? Math.round(totalProgress / progressDays) : 0;
    
    // Find predominant mood, if there are any moods
    const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const predominantMood = totalMoods > 0 
      ? Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0][0]
      : 'OKAY'; // Default mood when none is set
    
    return { avgProgress, moodCounts, totalDaysTracked, predominantMood };
  };

  const { avgProgress, moodCounts, totalDaysTracked, predominantMood } = getMonthData();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Monthly Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Average Progress */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart size={20} className="text-blue-500" />
            <h3 className="font-medium text-slate-700">Average Progress</h3>
          </div>
          <p className="text-2xl font-bold text-blue-700">{avgProgress}%</p>
        </div>

        {/* Predominant Mood */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <SmilePlus size={20} className="text-purple-500" />
            <h3 className="font-medium text-slate-700">Predominant Mood</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{MOODS[predominantMood].emoji}</span>
            <span className="text-purple-700 font-medium">{MOODS[predominantMood].label}</span>
          </div>
        </div>

        {/* Days Tracked */}
        <div className="bg-teal-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon size={20} className="text-teal-500" />
            <h3 className="font-medium text-slate-700">Days Tracked</h3>
          </div>
          <p className="text-2xl font-bold text-teal-700">
            {totalDaysTracked} days
          </p>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="mt-6">
        <h3 className="font-medium text-slate-700 mb-3">Mood Distribution</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(MOODS).map(([key, { emoji, label, color }]) => (
            <div key={key} className={`${color} rounded-lg p-3 text-center`}>
              <div className="text-xl mb-1">{emoji}</div>
              <div className="text-sm font-medium text-slate-600">{moodCounts[key]}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};