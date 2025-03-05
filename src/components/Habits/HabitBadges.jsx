import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Zap, Target, Calendar, Check, Clock, Flame, TrendingUp } from 'lucide-react';
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
    
    // Habit count badges
    const habitCount = habits.length;
    if (habitCount >= 1) {
      allBadges.push({
        id: 'habit-starter',
        name: 'Habit Starter',
        description: 'Created your first habit',
        icon: <Zap size={28} className="text-amber-500" />,
        unlocked: true,
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
        color: 'bg-purple-100 dark:bg-purple-900/30',
        borderColor: 'border-purple-300 dark:border-purple-800'
      });
    }
    
    // Streak badges
    habits.forEach(habit => {
      const { streakCurrent, streakLongest } = habit.stats;
      
      if (streakLongest >= 7) {
        allBadges.push({
          id: `streak-7-${habit.id}`,
          name: 'Week Warrior',
          description: `Maintained "${habit.name}" for 7+ days`,
          icon: <Calendar size={28} className="text-green-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-300 dark:border-green-800'
        });
      }
      
      if (streakLongest >= 21) {
        allBadges.push({
          id: `streak-21-${habit.id}`,
          name: 'Habit Formed',
          description: `Maintained "${habit.name}" for 21+ days`,
          icon: <Award size={28} className="text-yellow-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-300 dark:border-yellow-800'
        });
      }
      
      if (streakLongest >= 66) {
        allBadges.push({
          id: `streak-66-${habit.id}`,
          name: 'Habit Master',
          description: `Maintained "${habit.name}" for 66+ days (scientifically proven habit formation)`,
          icon: <Star size={28} className="text-amber-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-amber-100 dark:bg-amber-900/30',
          borderColor: 'border-amber-300 dark:border-amber-800'
        });
      }
      
      if (streakLongest >= 100) {
        allBadges.push({
          id: `streak-100-${habit.id}`,
          name: 'Century Club',
          description: `Maintained "${habit.name}" for 100+ days!`,
          icon: <Trophy size={28} className="text-amber-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-amber-100 dark:bg-amber-900/30',
          borderColor: 'border-amber-300 dark:border-amber-800'
        });
      }
      
      if (streakLongest >= 365) {
        allBadges.push({
          id: `streak-365-${habit.id}`,
          name: 'Year-Long Legend',
          description: `Maintained "${habit.name}" for a full year!`,
          icon: <Trophy size={28} className="text-purple-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-300 dark:border-purple-800'
        });
      }
    });
    
    // Completion badges
    habits.forEach(habit => {
      const totalCompletions = habit.stats.totalCompletions;
      
      if (totalCompletions >= 10) {
        allBadges.push({
          id: `completions-10-${habit.id}`,
          name: 'Getting Started',
          description: `Completed "${habit.name}" 10+ times`,
          icon: <Check size={28} className="text-green-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-300 dark:border-green-800'
        });
      }
      
      if (totalCompletions >= 50) {
        allBadges.push({
          id: `completions-50-${habit.id}`,
          name: 'Halfway to Century',
          description: `Completed "${habit.name}" 50+ times`,
          icon: <TrendingUp size={28} className="text-blue-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-300 dark:border-blue-800'
        });
      }
      
      if (totalCompletions >= 100) {
        allBadges.push({
          id: `completions-100-${habit.id}`,
          name: 'Century Milestone',
          description: `Completed "${habit.name}" 100+ times`,
          icon: <Award size={28} className="text-yellow-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-300 dark:border-yellow-800'
        });
      }
    });
    
    // Consistency badges
    habits.forEach(habit => {
      const completionRate = habit.stats.completionRate;
      
      if (completionRate >= 0.8) {
        allBadges.push({
          id: `consistency-80-${habit.id}`,
          name: 'Consistency King',
          description: `Maintained "${habit.name}" with 80%+ consistency`,
          icon: <Flame size={28} className="text-red-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-300 dark:border-red-800'
        });
      }
      
      if (completionRate >= 0.9) {
        allBadges.push({
          id: `consistency-90-${habit.id}`,
          name: 'Elite Performer',
          description: `Maintained "${habit.name}" with 90%+ consistency`,
          icon: <Trophy size={28} className="text-purple-500" />,
          unlocked: true,
          habitId: habit.id,
          color: 'bg-purple-100 dark:bg-purple-900/30',
          borderColor: 'border-purple-300 dark:border-purple-800'
        });
      }
    });
    
    // Add placeholders for locked badges
    if (habitCount < 3) {
      allBadges.push({
        id: 'habit-builder-locked',
        name: 'Habit Builder',
        description: 'Create 3 or more habits',
        icon: <Target size={28} className="text-slate-400 dark:text-slate-600" />,
        unlocked: false,
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
                w-12 h-12 rounded-full flex items-center justify-center mb-2
                ${badge.unlocked ? 'streak-pulse' : ''}
              `}>
                {badge.icon}
              </div>
              <p className="font-medium text-center text-slate-700 dark:text-slate-300 text-sm transition-colors">
                {badge.name}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Badge detail modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div 
            className={`
              ${selectedBadge.color} border-2 ${selectedBadge.borderColor} 
              rounded-xl p-6 max-w-xs w-full 
              badge-unlock
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
            
            <p className="text-center text-slate-600 dark:text-slate-400 mb-4 transition-colors">
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