import { CheckSquare, Book, Dumbbell, Coffee, Moon, Sunrise, Sunset } from 'lucide-react';

// Convert mood string to numerical value for calculations
export const getMoodValue = (mood) => {
  const moodMap = {
    'GREAT': 5,
    'GOOD': 4,
    'OKAY': 3,
    'MEH': 2,
    'BAD': 1,
    'OVERWHELMED': 0
  };
  return moodMap[mood] || 3; // Default to OKAY if mood not found
};

// Process data for morning/evening mood comparison chart
// Updated to handle category-based task IDs
export const processMoodComparisonData = (data, month) => {
  // Get start and end date for the current month
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  const comparisonData = [];
  
  // Process each day in the current month
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayData = data[dateStr];
    
    if (dayData) {
      // Check if we have both morning and evening moods
      const hasMorningMood = dayData.morningMood !== undefined;
      const hasEveningMood = dayData.eveningMood !== undefined;
      
      if (hasMorningMood || hasEveningMood) {
        // Calculate task completion percentage
        let completionRate = 0;
        
        if (dayData.checked) {
          // Count total and completed tasks using the new category-based format
          let totalTasks = 0;
          let completedTasks = 0;
          
          // Get all categories for this day
          const categories = dayData.customTasks || dayData.aiTasks || dayData.defaultTasks;
          
          if (categories && Array.isArray(categories)) {
            // Process all categories and items
            categories.forEach(category => {
              if (category && category.items && Array.isArray(category.items)) {
                category.items.forEach(item => {
                  if (item && item.trim()) {
                    totalTasks++;
                    // Check both formats for backward compatibility
                    const taskId = `${category.title}|${item}`;
                    if (dayData.checked[taskId] === true || dayData.checked[item] === true) {
                      completedTasks++;
                    }
                  }
                });
              }
            });
          }
          
          completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        }
        
        // Calculate mood change if we have both values
        let moodChange = 0;
        if (hasMorningMood && hasEveningMood) {
          // Map mood values to numbers
          const moodValues = {
            'GREAT': 5,
            'GOOD': 4,
            'OKAY': 3,
            'MEH': 2,
            'BAD': 1,
            'OVERWHELMED': 0
          };
          
          const morningValue = moodValues[dayData.morningMood] || 0;
          const eveningValue = moodValues[dayData.eveningMood] || 0;
          moodChange = eveningValue - morningValue;
        }
        
        comparisonData.push({
          date: dateStr,
          day: d.getDate(),
          morningMood: dayData.morningMood || null,
          eveningMood: dayData.eveningMood || null,
          morningEnergy: dayData.morningEnergy || 0,
          eveningEnergy: dayData.eveningEnergy || 0,
          completionRate,
          change: moodChange
        });
      }
    }
  }
  
  return comparisonData;
};

// Analyze mood impact factors
export const analyzeMoodImpacts = (storageData, month) => {
  // Get start and end date for the current month
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  // Arrays to store different types of impact data
  const daysWithJournal = [];
  const daysWithoutJournal = [];
  const daysWithHighTaskCompletion = [];
  const daysWithLowTaskCompletion = [];
  const daysWithWorkout = [];
  const daysWithoutWorkout = [];
  const morningToEveningChanges = [];
  
  // Process each day in the current month
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayData = storageData[dateStr];
    
    if (!dayData) continue;
    
    // Only analyze days with both morning and evening mood data
    if (dayData.morningMood && dayData.eveningMood) {
      const morningMoodValue = getMoodValue(dayData.morningMood);
      const eveningMoodValue = getMoodValue(dayData.eveningMood);
      const moodChange = eveningMoodValue - morningMoodValue;
      
      // Store the day's mood change data
      morningToEveningChanges.push({
        date: dateStr,
        morningMood: morningMoodValue,
        eveningMood: eveningMoodValue,
        change: moodChange,
        // Additional data about this day
        hasJournal: !!dayData.notes,
        hasTasks: !!(dayData.checked && Object.keys(dayData.checked).length > 0),
        taskCompletion: dayData.checked ? 
          Object.values(dayData.checked).filter(Boolean).length / Object.values(dayData.checked).length : 0,
        hasWorkout: !!dayData.workout
      });
      
      // Categorize days
      if (dayData.notes) {
        daysWithJournal.push({ date: dateStr, change: moodChange });
      } else {
        daysWithoutJournal.push({ date: dateStr, change: moodChange });
      }
      
      // Task completion impact
      if (dayData.checked && Object.keys(dayData.checked).length > 0) {
        const completion = Object.values(dayData.checked).filter(Boolean).length / 
                         Object.values(dayData.checked).length;
        
        if (completion >= 0.7) { // 70% or more completion
          daysWithHighTaskCompletion.push({ date: dateStr, change: moodChange, completion });
        } else if (completion < 0.3) { // Less than 30% completion
          daysWithLowTaskCompletion.push({ date: dateStr, change: moodChange, completion });
        }
      }
      
      // Workout impact
      if (dayData.workout) {
        daysWithWorkout.push({ 
          date: dateStr, 
          change: moodChange, 
          duration: dayData.workout.duration || 0,
          intensity: dayData.workout.intensity || 0
        });
      } else {
        daysWithoutWorkout.push({ date: dateStr, change: moodChange });
      }
    }
  }
  
  // Calculate average mood changes
  const calculateAverage = arr => arr.length > 0 
    ? arr.reduce((sum, item) => sum + item.change, 0) / arr.length 
    : 0;
  
  const journalAvgChange = calculateAverage(daysWithJournal);
  const noJournalAvgChange = calculateAverage(daysWithoutJournal);
  const journalImpact = journalAvgChange - noJournalAvgChange;
  
  const highTaskAvgChange = calculateAverage(daysWithHighTaskCompletion);
  const lowTaskAvgChange = calculateAverage(daysWithLowTaskCompletion);
  const taskImpact = highTaskAvgChange - lowTaskAvgChange;
  
  const workoutAvgChange = calculateAverage(daysWithWorkout);
  const noWorkoutAvgChange = calculateAverage(daysWithoutWorkout);
  const workoutImpact = workoutAvgChange - noWorkoutAvgChange;
  
  // Generate insights
  const insights = {
    summary: getInsightSummary(morningToEveningChanges),
    positiveFactors: getPositiveFactors(morningToEveningChanges),
    negativeFactors: getNegativeFactors(morningToEveningChanges),
  };
  
  // Add journal impact if we have data
  if (daysWithJournal.length > 0) {
    insights.journalImpact = {
      impact: journalImpact,
      description: getJournalImpactDescription(journalImpact, daysWithJournal.length)
    };
  }
  
  // Add task impact if we have data
  if (daysWithHighTaskCompletion.length > 0 || daysWithLowTaskCompletion.length > 0) {
    insights.taskImpact = {
      impact: taskImpact,
      description: getTaskImpactDescription(taskImpact, daysWithHighTaskCompletion.length, daysWithLowTaskCompletion.length)
    };
  }
  
  // Add workout impact if we have data
  if (daysWithWorkout.length > 0) {
    insights.workoutImpact = {
      impact: workoutImpact,
      description: getWorkoutImpactDescription(workoutImpact, daysWithWorkout.length)
    };
  }
  
  // Create day types analysis
  insights.dayTypes = getDayTypeAnalysis(morningToEveningChanges);
  
  return {
    morningToEveningChanges,
    insights
  };
};

// Helper functions for generating text insights
function getInsightSummary(changes) {
  if (changes.length === 0) return "Not enough data to analyze mood impacts.";
  
  const totalDays = changes.length;
  const positiveChanges = changes.filter(c => c.change > 0).length;
  const negativeChanges = changes.filter(c => c.change < 0).length;
  const neutralChanges = changes.filter(c => c.change === 0).length;
  
  const avgChange = changes.reduce((sum, c) => sum + c.change, 0) / totalDays;
  
  if (avgChange > 0.5) {
    return `Your mood generally improves throughout the day (average +${avgChange.toFixed(1)} points). ${positiveChanges} of ${totalDays} days showed mood improvement.`;
  } else if (avgChange < -0.5) {
    return `Your mood typically declines throughout the day (average ${avgChange.toFixed(1)} points). ${negativeChanges} of ${totalDays} days showed mood decline.`;
  } else {
    return `Your mood tends to remain stable throughout the day (average change ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(1)} points). ${neutralChanges} of ${totalDays} days had no mood change.`;
  }
}

function getPositiveFactors(changes) {
  if (changes.length < 3) return null;
  
  const factors = [];
  
  // Check if journaling is a positive factor
  const journalDays = changes.filter(c => c.hasJournal);
  const nonJournalDays = changes.filter(c => !c.hasJournal);
  
  if (journalDays.length >= 2 && nonJournalDays.length >= 1) {
    const journalAvg = journalDays.reduce((sum, c) => sum + c.change, 0) / journalDays.length;
    const nonJournalAvg = nonJournalDays.reduce((sum, c) => sum + c.change, 0) / nonJournalDays.length;
    
    if (journalAvg > nonJournalAvg + 0.5) {
      factors.push("Journaling");
    }
  }
  
  // Check if high task completion is a positive factor
  const highTaskDays = changes.filter(c => c.hasTasks && c.taskCompletion >= 0.7);
  const lowTaskDays = changes.filter(c => c.hasTasks && c.taskCompletion < 0.3);
  
  if (highTaskDays.length >= 2 && lowTaskDays.length >= 1) {
    const highTaskAvg = highTaskDays.reduce((sum, c) => sum + c.change, 0) / highTaskDays.length;
    const lowTaskAvg = lowTaskDays.reduce((sum, c) => sum + c.change, 0) / lowTaskDays.length;
    
    if (highTaskAvg > lowTaskAvg + 0.5) {
      factors.push("Task Completion");
    }
  }
  
  // Check if working out is a positive factor
  const workoutDays = changes.filter(c => c.hasWorkout);
  const nonWorkoutDays = changes.filter(c => !c.hasWorkout);
  
  if (workoutDays.length >= 2 && nonWorkoutDays.length >= 1) {
    const workoutAvg = workoutDays.reduce((sum, c) => sum + c.change, 0) / workoutDays.length;
    const nonWorkoutAvg = nonWorkoutDays.reduce((sum, c) => sum + c.change, 0) / nonWorkoutDays.length;
    
    if (workoutAvg > nonWorkoutAvg + 0.5) {
      factors.push("Exercise");
    }
  }
  
  return factors.length > 0 ? factors : null;
}

function getNegativeFactors(changes) {
  if (changes.length < 3) return null;
  
  const factors = [];
  
  // Check factors that might correlate with mood declines
  // Lack of task completion
  const lowTaskDays = changes.filter(c => c.hasTasks && c.taskCompletion < 0.3);
  const highTaskDays = changes.filter(c => c.hasTasks && c.taskCompletion >= 0.7);
  
  if (lowTaskDays.length >= 2 && highTaskDays.length >= 1) {
    const lowTaskAvg = lowTaskDays.reduce((sum, c) => sum + c.change, 0) / lowTaskDays.length;
    const highTaskAvg = highTaskDays.reduce((sum, c) => sum + c.change, 0) / highTaskDays.length;
    
    if (lowTaskAvg < highTaskAvg - 0.5 && lowTaskAvg < 0) {
      factors.push("Low Task Completion");
    }
  }
  
  // No journaling correlates with decreased mood
  const nonJournalDays = changes.filter(c => !c.hasJournal);
  const journalDays = changes.filter(c => c.hasJournal);
  
  if (nonJournalDays.length >= 2 && journalDays.length >= 1) {
    const nonJournalAvg = nonJournalDays.reduce((sum, c) => sum + c.change, 0) / nonJournalDays.length;
    const journalAvg = journalDays.reduce((sum, c) => sum + c.change, 0) / journalDays.length;
    
    if (nonJournalAvg < journalAvg - 0.5 && nonJournalAvg < 0) {
      factors.push("No Journaling");
    }
  }
  
  // No exercise correlates with decreased mood
  const nonWorkoutDays = changes.filter(c => !c.hasWorkout);
  const workoutDays = changes.filter(c => c.hasWorkout);
  
  if (nonWorkoutDays.length >= 2 && workoutDays.length >= 1) {
    const nonWorkoutAvg = nonWorkoutDays.reduce((sum, c) => sum + c.change, 0) / nonWorkoutDays.length;
    const workoutAvg = workoutDays.reduce((sum, c) => sum + c.change, 0) / workoutDays.length;
    
    if (nonWorkoutAvg < workoutAvg - 0.5 && nonWorkoutAvg < 0) {
      factors.push("Lack of Exercise");
    }
  }
  
  return factors.length > 0 ? factors : null;
}

function getJournalImpactDescription(impact, count) {
  if (count < 2) return "Not enough journal entries to analyze impact.";
  
  if (impact >= 1) {
    return `Journaling seems to significantly improve your daily mood (avg +${impact.toFixed(1)} points). Days with journal entries show better evening moods compared to morning.`;
  } else if (impact >= 0.3) {
    return `Journaling appears to have a positive effect on your mood (avg +${impact.toFixed(1)} points). Consider making it a regular habit.`;
  } else if (impact <= -0.3) {
    return `Interestingly, days when you journal show less mood improvement. This could be because you tend to journal on more challenging days.`;
  } else {
    return `Journaling doesn't seem to have a strong impact on your day-to-day mood changes (${impact.toFixed(1)} points difference).`;
  }
}

function getTaskImpactDescription(impact, highCount, lowCount) {
  if (highCount < 2 || lowCount < 1) return "Need more data on task completion to analyze impact.";
  
  if (impact >= 1) {
    return `High task completion has a strong positive effect on your mood (avg +${impact.toFixed(1)} points). Days when you complete 70%+ of tasks show significantly improved evening mood.`;
  } else if (impact >= 0.3) {
    return `Completing more tasks appears to boost your mood (avg +${impact.toFixed(1)} points). Task completion seems to correspond with better evening moods.`;
  } else if (impact <= -0.3) {
    return `Surprisingly, days with high task completion don't improve your mood. This could indicate your tasks may be draining or not aligned with your values.`;
  } else {
    return `Task completion doesn't show a strong correlation with mood changes (${impact.toFixed(1)} points difference).`;
  }
}

function getWorkoutImpactDescription(impact, count) {
  if (count < 2) return "Not enough workout data to analyze impact.";
  
  if (impact >= 1) {
    return `Exercise has a powerful positive effect on your mood (avg +${impact.toFixed(1)} points). Workout days consistently show better evening mood compared to morning.`;
  } else if (impact >= 0.3) {
    return `Working out appears to improve your daily mood (avg +${impact.toFixed(1)} points). Consider making it a regular habit for mood management.`;
  } else if (impact <= -0.3) {
    return `Interestingly, workout days don't show mood improvement. This could be because you tend to workout on more challenging days, or your workouts may be too intense.`;
  } else {
    return `Working out doesn't appear to have a significant impact on your daily mood changes (${impact.toFixed(1)} points difference).`;
  }
}

function getDayTypeAnalysis(changes) {
  if (changes.length < 5) return [];
  
  const dayTypes = [
    {
      name: "Productive Days",
      icon: <CheckSquare size={18} />,
      days: changes.filter(day => day.hasTasks && day.taskCompletion >= 0.7),
      getDescription: (avg) => avg > 0 
        ? `Days when you complete most tasks show an average mood boost of ${avg.toFixed(1)} points.`
        : `Even on productive days, your mood tends to ${avg < 0 ? 'decrease' : 'remain stable'}.`
    },
    {
      name: "Journal Days",
      icon: <Book size={18} />,
      days: changes.filter(day => day.hasJournal),
      getDescription: (avg) => avg > 0 
        ? `Journaling days show an average mood improvement of ${avg.toFixed(1)} points.`
        : `Your journal entries tend to happen on days with ${avg < 0 ? 'decreasing' : 'stable'} mood.`
    },
    {
      name: "Workout Days",
      icon: <Dumbbell size={18} />,
      days: changes.filter(day => day.hasWorkout),
      getDescription: (avg) => avg > 0 
        ? `Exercise days show an average mood boost of ${avg.toFixed(1)} points.`
        : `Your workout days tend to have ${avg < 0 ? 'declining' : 'stable'} mood.`
    },
    {
      name: "Morning Highs",
      icon: <Sunrise size={18} />,
      days: changes.filter(day => day.morningMood >= 4), // Good or Great morning mood
      getDescription: (avg) => avg > 0 
        ? `Days that start well tend to end even better (+${avg.toFixed(1)} points).`
        : `Days that start with high mood tend to ${avg < 0 ? 'decline' : 'remain stable'}.`
    },
    {
      name: "Morning Lows",
      icon: <Coffee size={18} />,
      days: changes.filter(day => day.morningMood <= 2), // Meh or worse morning mood
      getDescription: (avg) => avg > 0 
        ? `Days that start poorly tend to improve significantly (+${avg.toFixed(1)} points).`
        : `Days that start with low mood tend to ${avg < 0 ? 'get worse' : 'remain low'}.`
    },
    {
      name: "Evening Peaks",
      icon: <Sunset size={18} />,
      days: changes.filter(day => day.eveningMood >= 4), // Good or Great evening mood
      getDescription: (avg) => avg > 1 
        ? `Your best evenings show strong improvement from morning (+${avg.toFixed(1)} points).`
        : `Days with good evenings ${avg > 0 ? 'typically start well too' : 'often had mood drops'}.`
    }
  ];
  
  // Calculate averages and filter day types with enough data
  return dayTypes
    .map(type => {
      if (type.days.length >= 2) {
        const averageChange = type.days.reduce((sum, day) => sum + day.change, 0) / type.days.length;
        return {
          ...type,
          count: type.days.length,
          averageChange,
          description: type.getDescription(averageChange)
        };
      }
      return null;
    })
    .filter(type => type !== null)
    .sort((a, b) => Math.abs(b.averageChange) - Math.abs(a.averageChange));
}