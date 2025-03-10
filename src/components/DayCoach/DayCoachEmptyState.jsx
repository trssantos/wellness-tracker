import React from 'react';
import { MessageCircle, Smile, Dumbbell, Zap, Brain, Heart } from 'lucide-react';

const DayCoachEmptyState = ({ onStartChat }) => {
  const suggestions = [
    {
      icon: <Smile size={20} className="text-amber-500 dark:text-amber-400" />,
      title: "Mood Analysis",
      description: "Ask about your mood patterns and how to improve your emotional wellbeing."
    },
    {
      icon: <Dumbbell size={20} className="text-blue-500 dark:text-blue-400" />,
      title: "Workout Insights",
      description: "Get feedback on your exercise routine and suggestions for improvement."
    },
    {
      icon: <Zap size={20} className="text-purple-500 dark:text-purple-400" />,
      title: "Habit Tracking",
      description: "Check on your habit progress and receive tips to build consistency."
    },
    {
      icon: <Brain size={20} className="text-green-500 dark:text-green-400" />,
      title: "Focus Session Analysis",
      description: "Learn about your productivity patterns and how to reduce interruptions."
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-full p-4 mb-4">
        <MessageCircle size={32} className="text-blue-500 dark:text-blue-400" />
      </div>
      
      <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
        Your Personal Day Coach
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
        I analyze your tracked data to provide personalized insights and support.
        Start a conversation to get advice on improving your wellbeing.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="flex items-start p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-left"
          >
            <div className="flex-shrink-0 mr-3 mt-1">
              {suggestion.icon}
            </div>
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                {suggestion.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {suggestion.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={onStartChat}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors flex items-center gap-2"
      >
        <Heart size={18} />
        <span>Start a Conversation</span>
      </button>
    </div>
  );
};

export default DayCoachEmptyState;