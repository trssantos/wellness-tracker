import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Zap, Target, Calendar, Check, Clock, Flame, TrendingUp, Medal, Sparkles, BookOpen, ThumbsUp, Moon, Sun } from 'lucide-react';
import { getHabits } from '../../utils/habitTrackerUtils';

const HabitBadges = () => {
  const [habits, setHabits] = useState([]);
  const [badges, setBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  useEffect(() => {
    const allHabits = getHabits();
    setHabits(allHabits);
    
    // Calculate badges
    const calculatedBadges = calculateBadges(allHabits);
    setBadges(calculatedBadges);
  }, []);
  
  const calculateBadges = (habits) => {
    if (!habits || habits.length === 0) return [];
    
    const allBadges = [];
    
    // ========== GLOBAL ACHIEVEMENT BADGES ==========
    
    // Habit count badges - FOUNDATIONAL TIER
    const habitCount = habits.length;
    if (habitCount >= 1) {
      allBadges.push({
        id: 'habit-starter',
        name: 'Habit Starter',
        description: 'Created your first habit',
        icon: <Zap size={28} className="text-amber-500" />,
        unlocked: true,
        tier: 'bronze',
        color: 'bg-amber-100 dark:bg-amber-900/30',
        borderColor: 'border-amber-300 dark:border-amber-800'
      });
    }
    
    if (habitCount >= 3) {
      allBadges.push({
        id: 'habit-builder',
        name: 'Habit Builder',
        description: 'Created 3 or more habits',
        icon: <Target size={28} className="text-blue-500" />,
        unlocked: true,
        tier: 'silver',
        color: 'bg-blue-100 dark:bg-blue-900/30',
        borderColor: 'border-blue-300 dark:border-blue-800'
      });
    }
    
    if (habitCount >= 5) {
      allBadges.push({
        id: 'habit-master',
        name: 'Habit Master',
        description: 'Created 5 or more habits',
        icon: <Trophy size={28} className="text-purple-500" />,
        unlocked: true,
        tier: 'gold',
        color: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-300 dark:border-purple-800'
      });
    }
    
    if (habitCount >= 10) {
      allBadges.push({
        id: 'habit-expert',
        name: 'Habit Expert',
        description: 'Created 10 or more habits',
        icon: <Sparkles size={28} className="text-rose-500" />,
        unlocked: true,
        tier: 'platinum',
        color: 'bg-rose-100 dark:bg-rose-900/30',
        borderColor: 'border-rose-300 dark:border-rose-800'
      });
    }
    
    // ========== BALANCED LIFESTYLE BADGES ==========
    
    // Check for balanced lifestyle (having different types of habits)
    const habitCategories = {
      health: ['exercise', 'workout', 'gym', 'run', 'jog', 'walk', 'fitness', 'yoga'],
      mental: ['meditat', 'mindful', 'journal', 'gratitude', 'reflect', 'breath'],
      learning: ['read', 'book', 'study', 'learn', 'course', 'skill', 'practice'],
      productivity: ['work', 'focus', 'task', 'project', 'goal', 'plan', 'schedule']
    };
    
    const categorizedHabits = { health: 0, mental: 0, learning: 0, productivity: 0 };
    habits.forEach(habit => {
      const habitNameLower = habit.name.toLowerCase();
      const habitDescLower = (habit.description || '').toLowerCase();
      
      // Check each category
      Object.entries(habitCategories).forEach(([category, keywords]) => {
        for (const keyword of keywords) {
          if (habitNameLower.includes(keyword) || habitDescLower.includes(keyword)) {
            categorizedHabits[category]++;
            break;
          }
        }
      });
    });
    
    // Balance badges
    const categoriesWithHabits = Object.values(categorizedHabits).filter(count => count > 0).length;
    
    if (categoriesWithHabits >= 2) {
      allBadges.push({
        id: 'balanced-beginner',
        name: 'Balanced Beginner',
        description: 'Created habits in 2 different life areas',
        icon: <ThumbsUp size={28} className="text-teal-500" />,
        unlocked: true,
        tier: 'bronze',
        color: 'bg-teal-100 dark:bg-teal-900/30',
        borderColor: 'border-teal-300 dark:border-teal-800'
      });
    }
    
    if (categoriesWithHabits >= 3) {
      allBadges.push({
        id: 'balance-enthusiast',
        name: 'Balance Enthusiast',
        description: 'Created habits in 3 different life areas',
        icon: <Medal size={28} className="text-indigo-500" />,
        unlocked: true,
        tier: 'silver',
        color: 'bg-indigo-100 dark:bg-indigo-900/30',
        borderColor: 'border-indigo-300 dark:border-indigo-800'
      });
    }
    
    if (categoriesWithHabits >= 4) {
      allBadges.push({
        id: 'balanced-life-master',
        name: 'Balanced Life Master',
        description: 'Created habits in all 4 major life areas: health, mental wellbeing, learning, and productivity',
        icon: <Star size={28} className="text-amber-500" />,
        unlocked: true,
        tier: 'gold',
        color: 'bg-amber-100 dark:bg-amber-900/30',
        borderColor: 'border-amber-300 dark:border-amber-800'
      });
    }
    
    // ========== TIME OF DAY PREFERENCES ==========
    
    // Check for time of day preferences
    const timePreferences = { morning: 0, afternoon: 0, evening: 0, anytime: 0 };
    habits.forEach(habit => {
      if (habit.timeOfDay) {
        timePreferences[habit.timeOfDay]++;
      }
    });
    
    if (timePreferences.morning >= 2) {
      allBadges.push({
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Created 2 or more morning habits',
        icon: <Sun size={28} className="text-amber-500" />,
        unlocked: true,
        tier: 'bronze',
        color: 'bg-amber-100 dark:bg-amber-900/30',
        borderColor: 'border-amber-300 dark:border-amber-800'
      });
    }
    
    if (timePreferences.evening >= 2) {
      allBadges.push({
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Created 2 or more evening habits',
        icon: <Moon size={28} className="text-indigo-500" />,
        unlocked: true,
        tier: 'bronze',
        color: 'bg-indigo-100 dark:bg-indigo-900/30',
        borderColor: 'border-indigo-300 dark:border-indigo-800'
      });
    }
    
    // ========== HABIT-SPECIFIC STREAK BADGES ==========
    
    // Streak badges for individual habits
    habits.forEach(habit => {
      const { streakCurrent, streakLongest } = habit.stats;
      const longestStreak = Math.max(streakCurrent, streakLongest);
      
      if (longestStreak >= 7) {
        allBadges.push({
          id: `streak-7-${habit.id}`,
          name: 'Week Warrior',
          description: `Maintained a 7-day streak`,
          habitName: habit.name,  // Add the habit name
          icon: <Calendar size={28} className="text-green-500" />,
          unlocked: true,
          tier: 'bronze',
          habitId: habit.id,
          color: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-300 dark:border-green-800'
        });
      }
      
      if (longestStreak >= 21) {
        allBadges.push({
          id: `streak-21-${habit.id}`,
          name: 'Habit Formed',
          description: `Maintained a 21-day streak`,
          habitName: habit.name,  // Add the habit name
          icon: <Award size={28} className="text-yellow-500" />,
          unlocked: true,
          tier: 'silver',
          habitId: habit.id,
          color: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-300 dark:border-yellow-800'
        });
      }
      
      if (longestStreak >= 30) {
        allBadges.push({
          id: `streak-30-${habit.id}`,
          name: 'Monthly Master',
          description: `Maintained a 30-day streak`,
          habitName: habit.name,  // Add the habit name
          icon: <Award size={28} className="text-blue-500" />,
          unlocked: true,
          tier: 'silver',
          habitId: habit.id,
          color: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-300 dark:border-blue-800'
        });
      }
      
      if (longestStreak >= 60) {
        allBadges.push({
          id: `streak-60-${habit.id}`,
          name: 'Two Month Triumph',
          description: `Maintained a 60-day streak`,
          habitName: habit.name,  // Add the habit name
          icon: <Award size={28} className="text-purple-500" />,
          unlocked: true,
          tier: 'gold',
          habitId: habit.id,
          color: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-300 dark:border-purple-800'
        });
      }
      
      if (longestStreak >= 66) {
        allBadges.push({
          id: `streak-66-${habit.id}`,
          name: 'Habit Mastery',
          description: `Maintained a 66-day streak (scientific habit formation)`,
          habitName: habit.name,  // Add the habit name
          icon: <Star size={28} className="text-amber-500" />,
          unlocked: true,
          tier: 'gold',
          habitId: habit.id,
          color: 'bg-amber-100 dark:bg-amber-900/30',
          borderColor: 'border-amber-300 dark:border-amber-800'
        });
      }
      
      if (longestStreak >= 100) {
        allBadges.push({
          id: `streak-100-${habit.id}`,
          name: 'Century Club',
          description: `Maintained a 100-day streak`,
          habitName: habit.name,  // Add the habit name
          icon: <Trophy size={28} className="text-amber-500" />,
          unlocked: true,
          tier: 'platinum',
          habitId: habit.id,
          color: 'bg-amber-100 dark:bg-amber-900/30',
          borderColor: 'border-amber-300 dark:border-amber-800'
        });
      }
      
      if (longestStreak >= 365) {
        allBadges.push({
          id: `streak-365-${habit.id}`,
          name: 'Year-Long Legend',
          description: `Maintained a 365-day streak`,
          habitName: habit.name,  // Add the habit name
          icon: <Trophy size={28} className="text-purple-500" />,
          unlocked: true,
          tier: 'diamond',
          habitId: habit.id,
          color: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-300 dark:border-purple-800'
        });
      }
    });
    
    // ========== COMPLETION COUNT BADGES ==========
    
    // Completion count badges for individual habits
    habits.forEach(habit => {
      const totalCompletions = habit.stats.totalCompletions;
      
      if (totalCompletions >= 10) {
        allBadges.push({
          id: `completions-10-${habit.id}`,
          name: 'Getting Started',
          description: `Completed 10+ times`,
          habitName: habit.name,  // Add the habit name
          icon: <Check size={28} className="text-green-500" />,
          unlocked: true,
          tier: 'bronze',
          habitId: habit.id,
          color: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-300 dark:border-green-800'
        });
      }
      
      if (totalCompletions >= 25) {
        allBadges.push({
          id: `completions-25-${habit.id}`,
          name: 'Consistency Builder',
          description: `Completed 25+ times`,
          habitName: habit.name,  // Add the habit name
          icon: <Clock size={28} className="text-teal-500" />,
          unlocked: true,
          tier: 'bronze',
          habitId: habit.id,
          color: 'bg-teal-100 dark:bg-teal-900/30',
          borderColor: 'border-teal-300 dark:border-teal-800'
        });
      }
      
      if (totalCompletions >= 50) {
        allBadges.push({
          id: `completions-50-${habit.id}`,
          name: 'Halfway to Century',
          description: `Completed 50+ times`,
          habitName: habit.name,  // Add the habit name
          icon: <TrendingUp size={28} className="text-blue-500" />,
          unlocked: true,
          tier: 'silver',
          habitId: habit.id,
          color: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-300 dark:border-blue-800'
        });
      }
      
      if (totalCompletions >= 100) {
        allBadges.push({
          id: `completions-100-${habit.id}`,
          name: 'Century Milestone',
          description: `Completed 100+ times`,
          habitName: habit.name,  // Add the habit name
          icon: <Award size={28} className="text-yellow-500" />,
          unlocked: true,
          tier: 'gold',
          habitId: habit.id,
          color: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-300 dark:border-yellow-800'
        });
      }
      
      if (totalCompletions >= 500) {
        allBadges.push({
          id: `completions-500-${habit.id}`,
          name: 'Expert Level',
          description: `Completed 500+ times`,
          habitName: habit.name,  // Add the habit name
          icon: <Award size={28} className="text-purple-500" />,
          unlocked: true,
          tier: 'platinum',
          habitId: habit.id,
          color: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-300 dark:border-purple-800'
        });
      }
      
      if (totalCompletions >= 1000) {
        allBadges.push({
          id: `completions-1000-${habit.id}`,
          name: 'Habit Legend',
          description: `Completed 1000+ times`,
          habitName: habit.name,  // Add the habit name
          icon: <Trophy size={28} className="text-rose-500" />,
          unlocked: true,
          tier: 'diamond',
          habitId: habit.id,
          color: 'bg-rose-100 dark:bg-rose-900/30',
          borderColor: 'border-rose-300 dark:border-rose-800'
        });
      }
    });
    
    // ========== CONSISTENCY BADGES ==========
    
    // Consistency badges for individual habits
    habits.forEach(habit => {
      const completionRate = habit.stats.completionRate;
      
      if (completionRate >= 0.7 && habit.stats.totalCompletions >= 10) {
        allBadges.push({
          id: `consistency-70-${habit.id}`,
          name: 'Consistency Champion',
          description: `Maintained 70%+ consistency`,
          habitName: habit.name,  // Add the habit name
          icon: <Flame size={28} className="text-orange-500" />,
          unlocked: true,
          tier: 'silver',
          habitId: habit.id,
          color: 'bg-orange-100 dark:bg-orange-900/30',
          borderColor: 'border-orange-300 dark:border-orange-800'
        });
      }
      
      if (completionRate >= 0.8 && habit.stats.totalCompletions >= 20) {
        allBadges.push({
          id: `consistency-80-${habit.id}`,
          name: 'Consistency King',
          description: `Maintained 80%+ consistency over 20+ completions`,
          habitName: habit.name,  // Add the habit name
          icon: <Flame size={28} className="text-red-500" />,
          unlocked: true,
          tier: 'gold',
          habitId: habit.id,
          color: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-300 dark:border-red-800'
        });
      }
      
      if (completionRate >= 0.9 && habit.stats.totalCompletions >= 30) {
        allBadges.push({
          id: `consistency-90-${habit.id}`,
          name: 'Elite Performer',
          description: `Maintained 90%+ consistency over 30+ completions`,
          habitName: habit.name,  // Add the habit name
          icon: <Trophy size={28} className="text-purple-500" />,
          unlocked: true,
          tier: 'platinum',
          habitId: habit.id,
          color: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-300 dark:border-purple-800'
        });
      }
    });
    
    // ========== LOCKED BADGE PLACEHOLDERS ==========
    
    // Add placeholders for locked badges
    if (habitCount < 3) {
      allBadges.push({
        id: 'habit-builder-locked',
        name: 'Habit Builder',
        description: 'Create 3 or more habits',
        icon: <Target size={28} className="text-slate-400 dark:text-slate-600" />,
        unlocked: false,
        tier: 'silver',
        color: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-700'
      });
    }
    
    if (habitCount < 5) {
      allBadges.push({
        id: 'habit-master-locked',
        name: 'Habit Master',
        description: 'Create 5 or more habits',
        icon: <Trophy size={28} className="text-slate-400 dark:text-slate-600" />,
        unlocked: false,
        tier: 'gold',
        color: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-700'
      });
    }
    
    if (habitCount < 10) {
      allBadges.push({
        id: 'habit-expert-locked',
        name: 'Habit Expert',
        description: 'Create 10 or more habits',
        icon: <Sparkles size={28} className="text-slate-400 dark:text-slate-600" />,
        unlocked: false,
        tier: 'platinum',
        color: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-700'
      });
    }
    
    // Add generic streak badges if no habits have reached them yet
    const anyHabitWith7DayStreak = habits.some(habit => habit.stats.streakLongest >= 7);
    if (!anyHabitWith7DayStreak) {
      allBadges.push({
        id: 'streak-7-locked',
        name: 'Week Warrior',
        description: 'Maintain any habit for 7+ days',
        icon: <Calendar size={28} className="text-slate-400 dark:text-slate-600" />,
        unlocked: false,
        tier: 'bronze',
        color: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-700'
      });
    }
    
    const anyHabitWith21DayStreak = habits.some(habit => habit.stats.streakLongest >= 21);
    if (!anyHabitWith21DayStreak) {
      allBadges.push({
        id: 'streak-21-locked',
        name: 'Habit Formed',
        description: 'Maintain any habit for 21+ days',
        icon: <Award size={28} className="text-slate-400 dark:text-slate-600" />,
        unlocked: false,
        tier: 'silver',
        color: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-700'
      });
    }
    
    const anyHabitWith100DayStreak = habits.some(habit => habit.stats.streakLongest >= 100);
    if (!anyHabitWith100DayStreak) {
      allBadges.push({
        id: 'streak-100-locked',
        name: 'Century Club',
        description: 'Maintain any habit for 100+ days',
        icon: <Trophy size={28} className="text-slate-400 dark:text-slate-600" />,
        unlocked: false,
        tier: 'platinum',
        color: 'bg-slate-100 dark:bg-slate-800',
        borderColor: 'border-slate-300 dark:border-slate-700'
      });
    }
    
    return allBadges;
  };
  
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
  };
  
  const closeModal = () => {
    setSelectedBadge(null);
  };
  
  // Count unlocked badges
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  
  // Get badge tier icon
  const getTierIcon = (tier) => {
    switch(tier) {
      case 'bronze': return <Medal size={16} className="text-amber-600" />;
      case 'silver': return <Medal size={16} className="text-slate-400" />;
      case 'gold': return <Medal size={16} className="text-yellow-500" />;
      case 'platinum': return <Star size={16} className="text-blue-500" />;
      case 'diamond': return <Sparkles size={16} className="text-purple-500" />;
      default: return null;
    }
  };
  
  return (
    <div>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2 transition-colors">
          <Trophy className="text-amber-500" size={20} />
          Achievements & Badges
        </h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-600 dark:text-slate-400 transition-colors">Your progress</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
            <div 
              className="h-full bg-amber-500 dark:bg-amber-600 transition-colors"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`
                aspect-square rounded-lg border ${badge.borderColor} ${badge.color}
                flex flex-col items-center justify-center p-3 cursor-pointer
                hover:shadow-md transition-all
                ${badge.unlocked ? '' : 'opacity-60 grayscale'}
              `}
              onClick={() => handleBadgeClick(badge)}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-1
                ${badge.unlocked ? 'streak-pulse' : ''}
              `}>
                {badge.icon}
              </div>
              <p className="font-medium text-center text-slate-700 dark:text-slate-300 text-sm transition-colors">
                {badge.name}
              </p>
              {badge.habitName && badge.unlocked && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">
                  {badge.habitName}
                </p>
              )}
              {badge.tier && badge.unlocked && (
                <div className="flex items-center mt-1">
                  {getTierIcon(badge.tier)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Badge detail modal with improved readability */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={closeModal}
        >
          <div 
            className={`
              ${selectedBadge.color} border-2 ${selectedBadge.borderColor} 
              rounded-xl p-6 max-w-xs w-full 
              badge-unlock relative
              ${selectedBadge.unlocked ? 'bg-opacity-95 dark:bg-opacity-90' : 'bg-opacity-90 dark:bg-opacity-85'}
            `}
            onClick={e => e.stopPropagation()}
          >
            {selectedBadge.unlocked && <div className="firework"></div>}
            
            <div className="flex justify-center mb-4">
              <div className={`
                w-20 h-20 rounded-full flex items-center justify-center
                ${selectedBadge.unlocked ? 'shimmer-effect' : ''}
              `}>
                {selectedBadge.icon}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2 transition-colors">
              {selectedBadge.name}
            </h3>
            
            {/* Show habit name for habit-specific badges */}
            {selectedBadge.habitName && selectedBadge.unlocked && (
              <p className="text-center text-slate-700 dark:text-slate-300 font-medium mb-2 transition-colors">
                {selectedBadge.habitName}
              </p>
            )}
            
            {/* Show tier if available */}
            {selectedBadge.tier && selectedBadge.unlocked && (
              <div className="flex justify-center mb-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/30 dark:bg-black/30">
                  {getTierIcon(selectedBadge.tier)}
                  <span className="text-xs font-medium capitalize text-slate-700 dark:text-slate-200">
                    {selectedBadge.tier} Tier
                  </span>
                </div>
              </div>
            )}
            
            <p className="text-center text-slate-700 dark:text-slate-200 font-medium mb-4 transition-colors">
              {selectedBadge.description}
            </p>
            
            <div className="flex justify-center">
              <div className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${selectedBadge.unlocked 
                  ? 'bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}
                transition-colors
              `}>
                {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitBadges;