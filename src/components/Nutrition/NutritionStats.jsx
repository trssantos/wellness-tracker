import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart, Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Brain, Battery, Clock, Apple, Coffee, Salad, Pizza } from 'lucide-react';
import { getStorage } from '../../utils/storage';
import { CategoriesChart } from './Charts/CategoriesChart';
import { MealTimingChart } from './Charts/MealTimingChart';
import { MoodCorrelationChart } from './Charts/MoodCorrelationChart';
import { FoodFrequencyChart } from './Charts/FoodFrequencyChart';
import { JunkVsHealthyChart } from './Charts/JunkVsHealthyChart';
import { MealTimingDistributionChart } from './Charts/MealTimingDistributionChart';

export const NutritionStats = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [statsData, setStatsData] = useState({
    totalEntries: 0,
    categoryCounts: {},
    mealTimings: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    },
    mostFrequentFoods: [],
    topMoodBoosters: [],
    topEnergyBoosters: [],
    moodImpact: {},
    energyImpact: {},
    averageMealsPerDay: 0,
    trackingConsistency: 0,
    foodGroups: {},
    junkVsHealthy: {
      junk: 0,
      healthy: 0,
      neutral: 0
    },
    mealTimingDistribution: {},
    waterIntakeAvg: 0,
    totalWaterIntake: 0,
    daysWithWater: 0
  });
  
  // Define healthy and junk food categories/keywords
  const healthyFoodKeywords = [
    'vegetable', 'fruit', 'whole grain', 'lean protein', 'fish', 'nuts', 
    'seeds', 'legume', 'bean', 'yogurt', 'oatmeal', 'salad', 'avocado',
    'quinoa', 'organic', 'chicken', 'turkey', 'egg'
  ];
  
  const junkFoodKeywords = [
    'candy', 'soda', 'pizza', 'burger', 'fries', 'fried', 'chips', 'cake',
    'cookie', 'ice cream', 'chocolate', 'processed', 'fast food', 'donut',
    'pastry', 'sugary', 'sweet', 'beer', 'alcohol'
  ];
  
  // Fetch stats data when month changes
  useEffect(() => {
    const data = processStorageData(currentMonth);
    setStatsData(data);
  }, [currentMonth]);
  
  // Process data from storage
  const processStorageData = (month) => {
    const storage = getStorage();
    
    // Get start and end date for the current month
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const daysInMonth = end.getDate();
    
    // Initialize counters and data structures
    let totalEntries = 0;
    const categoryCounts = {};
    const mealTimings = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    };
    const foodFrequency = {};
    const foodMoodImpact = {};
    const foodEnergyImpact = {};
    const daysTracked = new Set();
    const foodGroups = {
      'Fruits': 0,
      'Vegetables': 0,
      'Proteins': 0,
      'Grains': 0,
      'Dairy': 0,
      'Sweets': 0,
      'Beverages': 0,
      'Other': 0
    };
    let junkFoodCount = 0;
    let healthyFoodCount = 0;
    let neutralFoodCount = 0;
    let totalWaterIntake = 0;
    let daysWithWater = 0;
    
    // Track meal timing distribution
    const mealTimingDistribution = {
      '5-8': { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      '9-11': { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      '12-14': { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      '15-17': { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      '18-20': { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      '21-23': { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
      '0-4': { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
    };
    
    // Process each day in the month
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if nutrition data exists for this date
      if (storage.nutrition && storage.nutrition[dateStr]) {
        const dayData = storage.nutrition[dateStr];
        
        // Track water intake
        if (dayData.waterIntake) {
          totalWaterIntake += dayData.waterIntake;
          daysWithWater++;
        }
        
        if (dayData.entries && dayData.entries.length > 0) {
          daysTracked.add(dateStr);
          
          // Process each food entry
          dayData.entries.forEach(entry => {
            totalEntries++;
            
            // Count by category
            const category = entry.category || 'Uncategorized';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            
            // Count by food group
            if (foodGroups.hasOwnProperty(category)) {
              foodGroups[category]++;
            } else {
              foodGroups['Other']++;
            }
            
            // Count by meal type
            const mealType = entry.mealType || 'snack';
            if (mealTimings.hasOwnProperty(mealType)) {
              mealTimings[mealType]++;
            }
            
            // Track meal timing distribution
            if (entry.time) {
              const hour = parseInt(entry.time.split(':')[0]);
              let timeRange;
              
              if (hour >= 5 && hour <= 8) timeRange = '5-8';
              else if (hour >= 9 && hour <= 11) timeRange = '9-11';
              else if (hour >= 12 && hour <= 14) timeRange = '12-14';
              else if (hour >= 15 && hour <= 17) timeRange = '15-17';
              else if (hour >= 18 && hour <= 20) timeRange = '18-20';
              else if (hour >= 21 && hour <= 23) timeRange = '21-23';
              else timeRange = '0-4';
              
              // Increment the count for this meal type in this time range
              if (mealTimingDistribution[timeRange] && mealType) {
                mealTimingDistribution[timeRange][mealType]++;
              }
            }
            
            // Track food frequency
            const foodName = entry.name;
            foodFrequency[foodName] = (foodFrequency[foodName] || 0) + 1;
            
            // Determine if food is healthy or junk
            const foodNameLower = foodName.toLowerCase();
            const categoryLower = category.toLowerCase();
            const tagsLower = entry.tags ? entry.tags.map(tag => tag.toLowerCase()) : [];
            
            // Check if any of the keywords match
            const isHealthy = healthyFoodKeywords.some(keyword => 
              foodNameLower.includes(keyword) || 
              categoryLower.includes(keyword) || 
              tagsLower.some(tag => tag.includes(keyword))
            );
            
            const isJunk = junkFoodKeywords.some(keyword => 
              foodNameLower.includes(keyword) || 
              categoryLower.includes(keyword) || 
              tagsLower.some(tag => tag.includes(keyword))
            );
            
            if (isHealthy) healthyFoodCount++;
            else if (isJunk) junkFoodCount++;
            else neutralFoodCount++;
            
            // Initialize mood and energy impact tracking if needed
            if (!foodMoodImpact[foodName]) {
              foodMoodImpact[foodName] = {
                total: 0, count: 0, emoji: entry.emoji || '🍽️'
              };
            }
            
            if (!foodEnergyImpact[foodName]) {
              foodEnergyImpact[foodName] = {
                total: 0, count: 0, emoji: entry.emoji || '🍽️'
              };
            }
            
            // Track mood impact (if available from entry)
            if (entry.moodImpact) {
              foodMoodImpact[foodName].total += entry.moodImpact;
              foodMoodImpact[foodName].count++;
            }
            
            // Track energy impact (if available from entry)
            if (entry.energyImpact) {
              foodEnergyImpact[foodName].total += entry.energyImpact;
              foodEnergyImpact[foodName].count++;
            }
          });
        }
      }
    }
    
    // Calculate most frequent foods
    const mostFrequentFoods = Object.entries(foodFrequency)
      .map(([food, count]) => ({ food, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate foods with highest mood impact
    const topMoodBoosters = Object.entries(foodMoodImpact)
      .filter(([_, data]) => data.count > 0)
      .map(([food, data]) => ({
        food,
        impact: data.total / data.count,
        emoji: data.emoji
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);
    
    // Calculate foods with highest energy impact
    const topEnergyBoosters = Object.entries(foodEnergyImpact)
      .filter(([_, data]) => data.count > 0)
      .map(([food, data]) => ({
        food,
        impact: data.total / data.count,
        emoji: data.emoji
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5);
    
    // Calculate average meals per day
    const averageMealsPerDay = daysTracked.size > 0
      ? totalEntries / daysTracked.size
      : 0;
    
    // Calculate tracking consistency percentage
    const trackingConsistency = Math.round((daysTracked.size / daysInMonth) * 100);
    
    // Calculate water intake average
    const waterIntakeAvg = daysWithWater > 0 
      ? totalWaterIntake / daysWithWater 
      : 0;
    
    return {
      totalEntries,
      categoryCounts,
      mealTimings,
      mostFrequentFoods,
      topMoodBoosters,
      topEnergyBoosters,
      averageMealsPerDay,
      trackingConsistency,
      foodGroups,
      junkVsHealthy: {
        junk: junkFoodCount,
        healthy: healthyFoodCount,
        neutral: neutralFoodCount
      },
      mealTimingDistribution,
      waterIntakeAvg,
      totalWaterIntake,
      daysWithWater,
      daysTracked: daysTracked.size,
      daysInMonth
    };
  };
  
  // Handle navigation between months
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Get a color class based on a value (for percentage indicators)
  const getColorClass = (value) => {
    if (value > 75) return 'text-green-500';
    if (value > 50) return 'text-blue-500';
    if (value > 25) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Calculate junk food percentage
  const calculateJunkPercentage = () => {
    const total = statsData.junkVsHealthy.junk + statsData.junkVsHealthy.healthy + statsData.junkVsHealthy.neutral;
    return total > 0 ? Math.round((statsData.junkVsHealthy.junk / total) * 100) : 0;
  };
  
  // Calculate healthy food percentage
  const calculateHealthyPercentage = () => {
    const total = statsData.junkVsHealthy.junk + statsData.junkVsHealthy.healthy + statsData.junkVsHealthy.neutral;
    return total > 0 ? Math.round((statsData.junkVsHealthy.healthy / total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header with date selection */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <BarChart2 className="text-red-500 dark:text-red-400" size={24} />
            Nutrition Stats & Insights
          </h2>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handlePreviousMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
            
            <span className="px-2 text-slate-700 dark:text-slate-300">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
        
        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Entries Card */}
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Food Entries</p>
                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{statsData.totalEntries}</p>
              </div>
              <Apple className="text-red-500 dark:text-red-400" size={20} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {statsData.averageMealsPerDay.toFixed(1)} meals per day
            </p>
          </div>
          
          {/* Tracking Consistency Card */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Consistency</p>
                <p className={`text-2xl font-bold ${getColorClass(statsData.trackingConsistency)}`}>
                  {statsData.trackingConsistency}%
                </p>
              </div>
              <Calendar className="text-blue-500 dark:text-blue-400" size={20} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {statsData.daysTracked} of {statsData.daysInMonth} days tracked
            </p>
          </div>
          
          {/* Healthy Food Card */}
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Healthy Foods</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {calculateHealthyPercentage()}%
                </p>
              </div>
              <Salad className="text-green-500 dark:text-green-400" size={20} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {statsData.junkVsHealthy.healthy} healthy items tracked
            </p>
          </div>
          
          {/* Water Intake Card */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Water Intake</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statsData.waterIntakeAvg.toFixed(1)}
                </p>
              </div>
              <div className="text-blue-500 dark:text-blue-400 text-xl">💧</div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Avg. glasses per day tracked
            </p>
          </div>
        </div>
      </div>
      
      {/* Junk vs Healthy Foods Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Pizza className="text-red-500 dark:text-red-400" size={20} />
          Junk vs. Healthy Foods Analysis
        </h3>
        
        <div className="h-64">
          <JunkVsHealthyChart data={statsData.junkVsHealthy} />
        </div>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-1">Healthy Foods Ratio</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Salad size={16} className="text-green-500" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">{calculateHealthyPercentage()}%</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{statsData.junkVsHealthy.healthy} items</span>
            </div>
            <div className="w-full h-1.5 mt-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${calculateHealthyPercentage()}%` }}></div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-1">Junk Foods Ratio</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Pizza size={16} className="text-red-500" />
                <span className="text-slate-600 dark:text-slate-400 text-sm">{calculateJunkPercentage()}%</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{statsData.junkVsHealthy.junk} items</span>
            </div>
            <div className="w-full h-1.5 mt-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${calculateJunkPercentage()}%` }}></div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
            <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-1">Neutral Foods</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-500"></div>
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                  {statsData.junkVsHealthy.neutral}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">items</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Meal Timing Distribution */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Clock className="text-red-500 dark:text-red-400" size={20} />
          Meal Timing Distribution
        </h3>
        
        <div className="h-64">
          <MealTimingDistributionChart data={statsData.mealTimingDistribution} />
        </div>
      </div>
      
      {/* Food Groups Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <PieChart className="text-red-500 dark:text-red-400" size={20} />
          Food Categories Distribution
        </h3>
        
        <div className="h-64">
          <CategoriesChart data={statsData.foodGroups} />
        </div>
      </div>
      
      {/* Meal Types Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Clock className="text-red-500 dark:text-red-400" size={20} />
          Meal Types Distribution
        </h3>
        
        <div className="h-64">
          <MealTimingChart data={statsData.mealTimings} />
        </div>
      </div>
      
      {/* Most Frequent Foods */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Coffee className="text-red-500 dark:text-red-400" size={20} />
          Most Frequent Foods
        </h3>
        
        <div className="h-64">
          <FoodFrequencyChart data={statsData.mostFrequentFoods} />
        </div>
      </div>
      
      {/* Mood & Energy Impact Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Boosters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Brain className="text-purple-500 dark:text-purple-400" size={20} />
            Top Mood Boosters
          </h3>
          
          <div className="space-y-3">
            {statsData.topMoodBoosters.length > 0 ? (
              statsData.topMoodBoosters.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-slate-700 dark:text-slate-300">{item.food}</span>
                  </div>
                  <span className="font-medium text-green-500 dark:text-green-400">
                    +{item.impact.toFixed(1)}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-6">
                Not enough data to analyze mood impact yet.
              </p>
            )}
          </div>
        </div>
        
        {/* Energy Boosters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Battery className="text-blue-500 dark:text-blue-400" size={20} />
            Top Energy Boosters
          </h3>
          
          <div className="space-y-3">
            {statsData.topEnergyBoosters.length > 0 ? (
              statsData.topEnergyBoosters.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-slate-700 dark:text-slate-300">{item.food}</span>
                  </div>
                  <span className="font-medium text-blue-500 dark:text-blue-400">
                    +{item.impact.toFixed(1)}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-6">
                Not enough data to analyze energy impact yet.
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Mood Correlation Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="text-red-500 dark:text-red-400" size={20} />
          Food-Mood Correlation Analysis
        </h3>
        
        <div className="h-64">
          <MoodCorrelationChart />
        </div>
      </div>
      
      {/* Insights & Recommendations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-500 dark:text-green-400" size={20} />
          Personalized Insights
        </h3>
        
        <div className="space-y-4">
          {statsData.totalEntries > 5 ? (
            <>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={16} />
                  Dietary Patterns
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {statsData.trackingConsistency > 50 
                    ? `You've been consistently tracking your nutrition ${statsData.trackingConsistency}% of the days this month. Great job!`
                    : `Try to track your nutrition more consistently to get better insights. You've tracked ${statsData.trackingConsistency}% of days this month.`}
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <Salad className="text-green-500" size={16} />
                  Healthy vs. Junk Foods
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {calculateHealthyPercentage() > 70 
                    ? `Great job! ${calculateHealthyPercentage()}% of your food entries are healthy options.`
                    : calculateHealthyPercentage() > 50 
                      ? `You're doing well with ${calculateHealthyPercentage()}% healthy food choices, but there's room for improvement.`
                      : `Only ${calculateHealthyPercentage()}% of your food entries are healthy. Try to increase your intake of fruits, vegetables, and whole grains.`}
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <Clock className="text-blue-500" size={16} />
                  Meal Timing
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {statsData.mealTimings.breakfast > 0 
                    ? `You've tracked breakfast ${statsData.mealTimings.breakfast} times this month, which is great for maintaining energy levels throughout the day.`
                    : `You haven't tracked any breakfasts this month. Starting your day with a balanced breakfast can help stabilize your energy levels.`}
                </p>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Not enough data to generate personalized insights yet.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keep tracking your meals and their impact on your mood and energy to see personalized recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionStats;