import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Moon, Sun, Clock, Zap, Brain, Star, ChevronRight, AlertCircle } from 'lucide-react';

export const SleepAnalyticsChart = ({ data, moodData }) => {
  const [chartType, setChartType] = useState('duration'); // 'duration', 'quality', 'correlation'
  
  // If no data is available, show a message
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 text-center">No sleep data available for this month. Start tracking your sleep to see analytics here.</p>
      </div>
    );
  }

  // Process daily factors for distribution chart
  const getFactorDistribution = () => {
    const factors = {};
    
    data.forEach(day => {
      if (day.factors && day.factors.length > 0) {
        day.factors.forEach(factor => {
          factors[factor] = (factors[factor] || 0) + 1;
        });
      }
    });
    
    return Object.entries(factors).map(([factor, count]) => ({
      factor: formatFactorName(factor),
      count
    })).sort((a, b) => b.count - a.count);
  };
  
  const formatFactorName = (factorId) => {
    const factorMap = {
      'interrupted': 'Interrupted',
      'vivid_dreams': 'Vivid Dreams',
      'caffeine': 'Caffeine',
      'screen_time': 'Screen Time',
      'stress': 'Stress/Anxiety',
      'exercise': 'Exercise',
      'alcohol': 'Alcohol',
      'noise': 'Noise'
    };
    
    return factorMap[factorId] || factorId;
  };
  
  // Format duration in HH:MM format
  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes < 10 ? '0' + minutes : minutes}m`;
  };
  
  // Prepare data for correlation chart between sleep and mood/energy
  const prepareCorrelationData = () => {
    // Only include days that have both sleep and mood data
    const combinedData = data.filter(sleepDay => {
      const hasMoodData = moodData.some(moodDay => 
        moodDay.date === sleepDay.date && 
        (moodDay.morningMood !== undefined || moodDay.eveningMood !== undefined)
      );
      return hasMoodData;
    }).map(sleepDay => {
      // Find corresponding mood data
      const moodDay = moodData.find(m => m.date === sleepDay.date);
      return {
        ...sleepDay,
        morningMood: moodDay?.morningMood || 0,
        eveningMood: moodDay?.eveningMood || 0
      };
    });
    
    return combinedData;
  };
  
  // Calculate average values for key metrics
  const calculateAverages = () => {
    if (data.length === 0) return { avgDuration: 0, avgQuality: 0 };
    
    const totalDuration = data.reduce((sum, day) => sum + day.duration, 0);
    const totalQuality = data.reduce((sum, day) => sum + day.quality, 0);
    
    return {
      avgDuration: totalDuration / data.length,
      avgQuality: totalQuality / data.length
    };
  };
  
  // Analyze correlation between sleep and mood/energy
  const analyzeSleepMoodCorrelation = () => {
    const correlationData = prepareCorrelationData();
    if (correlationData.length < 5) return null; // Need enough data for meaningful correlation
    
    // Simplified correlation analysis
    let qualityMoodCorrelation = 0;
    let durationMoodCorrelation = 0;
    
    correlationData.forEach(day => {
      if (day.quality >= 4 && day.morningMood >= 4) qualityMoodCorrelation++;
      if (day.quality <= 2 && day.morningMood <= 2) qualityMoodCorrelation++;
      
      if (day.duration >= 7 && day.morningMood >= 4) durationMoodCorrelation++;
      if (day.duration < 6 && day.morningMood <= 2) durationMoodCorrelation++;
    });
    
    // Calculate correlation strength as percentage of data points showing correlation
    const qualityCorrelationStrength = (qualityMoodCorrelation / correlationData.length) * 100;
    const durationCorrelationStrength = (durationMoodCorrelation / correlationData.length) * 100;
    
    return {
      qualityCorrelationStrength,
      durationCorrelationStrength,
      hasStrongQualityCorrelation: qualityCorrelationStrength > 60,
      hasStrongDurationCorrelation: durationCorrelationStrength > 60
    };
  };
  
  // Generate sleep insights based on the data
  const generateSleepInsights = () => {
    if (data.length < 5) return [];
    
    const { avgDuration, avgQuality } = calculateAverages();
    const correlation = analyzeSleepMoodCorrelation();
    const factorDistribution = getFactorDistribution();
    
    const insights = [];
    
    // Duration insights
    if (avgDuration < 6) {
      insights.push({
        type: 'warning',
        icon: <Clock size={16} className="text-amber-500" />,
        title: 'Sleep Duration Below Recommended',
        description: 'You\'re averaging less than 6 hours of sleep. Adults typically need 7-9 hours for optimal health.'
      });
    } else if (avgDuration > 9) {
      insights.push({
        type: 'info',
        icon: <Clock size={16} className="text-blue-500" />,
        title: 'Extended Sleep Duration',
        description: 'You\'re averaging more than 9 hours of sleep. While some people need more sleep, consistently sleeping too much can be linked to certain health conditions.'
      });
    } else if (avgDuration >= 7 && avgDuration <= 8) {
      insights.push({
        type: 'success',
        icon: <Clock size={16} className="text-green-500" />,
        title: 'Optimal Sleep Duration',
        description: 'Your average sleep duration is within the recommended 7-8 hour range.'
      });
    }
    
    // Quality insights
    if (avgQuality < 3) {
      insights.push({
        type: 'warning',
        icon: <Star size={16} className="text-amber-500" />,
        title: 'Low Sleep Quality',
        description: 'Your sleep quality has been low. Consider examining your sleep environment and evening routine.'
      });
    } else if (avgQuality >= 4) {
      insights.push({
        type: 'success',
        icon: <Star size={16} className="text-green-500" />,
        title: 'High Sleep Quality',
        description: 'You\'re reporting good sleep quality overall. Keep up your current sleep hygiene practices.'
      });
    }
    
    // Correlation insights
    if (correlation && correlation.hasStrongQualityCorrelation) {
      insights.push({
        type: 'insight',
        icon: <Brain size={16} className="text-purple-500" />,
        title: 'Strong Sleep-Mood Connection',
        description: 'Your data shows a strong correlation between sleep quality and morning mood. Prioritizing sleep may help improve your daily outlook.'
      });
    }
    
    // Factor insights
    if (factorDistribution.length > 0) {
      const topFactor = factorDistribution[0];
      if (topFactor.count > data.length * 0.3) { // If factor appears in >30% of entries
        let recommendation = '';
        
        switch(topFactor.factor) {
          case 'Interrupted':
            recommendation = 'Consider strategies to minimize interruptions, such as white noise machines or addressing potential causes of waking.';
            break;
          case 'Caffeine':
            recommendation = 'Try limiting caffeine after noon, as it can stay in your system for up to 8 hours.';
            break;
          case 'Screen Time':
            recommendation = 'Consider implementing a digital curfew 1-2 hours before bedtime to reduce exposure to blue light.';
            break;
          case 'Stress/Anxiety':
            recommendation = 'A relaxation routine before bed, such as meditation or deep breathing, may help reduce stress-related sleep problems.';
            break;
          default:
            recommendation = `${topFactor.factor} seems to be affecting your sleep frequently. Consider ways to address this factor to improve sleep.`;
        }
        
        insights.push({
          type: 'action',
          icon: <AlertCircle size={16} className="text-red-500" />,
          title: `${topFactor.factor} Affecting Your Sleep`,
          description: recommendation
        });
      }
    }
    
    // Consistency insights
    const durationVariability = calculateVariability(data.map(d => d.duration));
    if (durationVariability > 2) {
      insights.push({
        type: 'warning',
        icon: <Zap size={16} className="text-amber-500" />,
        title: 'Inconsistent Sleep Schedule',
        description: 'Your sleep duration varies significantly day to day. A consistent sleep schedule helps regulate your body clock and may improve sleep quality.'
      });
    }
    
    return insights;
  };
  
  // Calculate variability (standard deviation)
  const calculateVariability = (values) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  };
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md text-sm">
          <p className="font-medium text-slate-800 dark:text-slate-200">Day {label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Duration' ? formatDuration(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'duration' 
                ? 'bg-indigo-500 text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setChartType('duration')}
          >
            Duration
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'quality' 
                ? 'bg-amber-500 text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setChartType('quality')}
          >
            Quality
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'correlation' 
                ? 'bg-blue-500 text-white' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setChartType('correlation')}
          >
            Correlation
          </button>
        </div>
      </div>

      {/* Duration Chart */}
      {chartType === 'duration' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
            <Clock className="text-indigo-500 dark:text-indigo-400" size={20} />
            Sleep Duration
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
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
                  domain={[0, 12]}
                  ticks={[0, 2, 4, 6, 8, 10, 12]}
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="duration" 
                  name="Duration" 
                  stroke="#818cf8" 
                  fill="#818cf8" 
                  fillOpacity={0.3} 
                />
                {/* Reference line for recommended sleep (8 hours) */}
                <Line
                  type="monotone"
                  dataKey={() => 8}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Recommended"
                  dot={false}
                />
                {/* Reference line for minimum sleep (6 hours) */}
                <Line
                  type="monotone"
                  dataKey={() => 6}
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  name="Minimum"
                  dot={false}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-indigo-500 rounded-full opacity-70"></div>
              <span>Your sleep duration</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 w-6 bg-green-500 rounded-full"></div>
              <span>Recommended (8h)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1 w-6 bg-amber-500 rounded-full"></div>
              <span>Minimum (6h)</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Quality Chart */}
      {chartType === 'quality' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
            <Star className="text-amber-500 dark:text-amber-400" size={20} />
            Sleep Quality
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
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
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  label={{ value: 'Quality', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="quality" 
                  name="Quality" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ fill: '#f59e0b', stroke: '#fef3c7', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sleep Factors Affecting Quality</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getFactorDistribution()}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="factor" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {/* Correlation Chart */}
      {chartType === 'correlation' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
            <Brain className="text-purple-500 dark:text-purple-400" size={20} />
            Sleep-Mood Correlation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={prepareCorrelationData()}
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
                  yAxisId="left"
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  label={{ value: 'Rating', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 12]}
                  ticks={[3, 6, 9, 12]}
                  tick={{ fill: '#6b7280' }}
                  axisLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  tickLine={{ stroke: '#9ca3af', strokeOpacity: 0.4 }}
                  label={{ value: 'Hours', angle: 90, position: 'insideRight', fill: '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="quality" 
                  name="Sleep Quality" 
                  stroke="#f59e0b" 
                  yAxisId="left"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  name="Sleep Duration" 
                  stroke="#818cf8" 
                  yAxisId="right"
                  strokeWidth={2}
                  dot={{ fill: '#818cf8', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="morningMood" 
                  name="Morning Mood" 
                  stroke="#a855f7" 
                  yAxisId="left"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Sleep Insights Section */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 transition-colors">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
          <Brain className="text-indigo-500 dark:text-indigo-400" size={20} />
          Sleep Insights
        </h3>
        
        <div className="space-y-3">
          {generateSleepInsights().map((insight, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-3 p-3 rounded-lg ${
                insight.type === 'warning' 
                  ? 'bg-amber-100/50 dark:bg-amber-900/20' 
                  : insight.type === 'success' 
                  ? 'bg-green-100/50 dark:bg-green-900/20'
                  : insight.type === 'action'
                  ? 'bg-red-100/50 dark:bg-red-900/20'
                  : 'bg-blue-100/50 dark:bg-blue-900/20'
              }`}
            >
              {insight.icon}
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-100">{insight.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{insight.description}</p>
              </div>
            </div>
          ))}
          
          {generateSleepInsights().length === 0 && (
            <div className="flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
              <p className="text-slate-500 dark:text-slate-400">Track sleep for at least 5 days to see personalized insights.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sleep Tips Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 transition-colors">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 transition-colors flex items-center gap-2">
          <Sun className="text-amber-500 dark:text-amber-400" size={20} />
          Sleep Improvement Tips
        </h3>
        
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4">
              <div className="min-w-[280px] max-w-[280px] bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full">
                    <Moon size={18} className="text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">Consistent Schedule</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">Go to bed and wake up at the same time every day, even on weekends. This helps regulate your body's internal clock.</p>
                <button className="mt-3 flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm self-end">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="min-w-[280px] max-w-[280px] bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-full">
                    <Zap size={18} className="text-amber-600 dark:text-amber-300" />
                  </div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">Limit Caffeine</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">Avoid caffeine (coffee, tea, soda, chocolate) at least 6 hours before bedtime as it can disrupt your ability to fall asleep.</p>
                <button className="mt-3 flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm self-end">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="min-w-[280px] max-w-[280px] bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                    <Brain size={18} className="text-blue-600 dark:text-blue-300" />
                  </div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">Wind Down Routine</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">Create a pre-sleep routine to help your body recognize it's time for bed: dim lights, read, meditate, or take a warm bath.</p>
                <button className="mt-3 flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm self-end">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="min-w-[280px] max-w-[280px] bg-green-50 dark:bg-green-900/30 rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                    <Sun size={18} className="text-green-600 dark:text-green-300" />
                  </div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-100">Morning Light</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">Get exposure to natural morning light for 15-30 minutes after waking up to help regulate your circadian rhythm.</p>
                <button className="mt-3 flex items-center gap-1 text-green-600 dark:text-green-400 text-sm self-end">
                  <span>Learn more</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepAnalyticsChart;