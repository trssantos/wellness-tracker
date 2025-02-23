import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, BarChart, HelpCircle, Zap } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import { MOODS } from './MoodSelector';

const DEFAULT_CATEGORIES = [
  {
    title: "Morning Essentials",
    items: [
      "Open curtains for natural light",
      "Drink water with lemon",
      "3 deep breaths",
      "Gentle 2-min stretch",
      "Make bed",
      "Basic hygiene without rushing",
      "Simple breakfast"
    ]
  },
  {
    title: "Work Focus",
    items: [
      "Clear desk space",
      "Write top 3 tasks",
      "Check calendar",
      "Fill water bottle",
      "Close unnecessary tabs",
      "Set first timer (25min)",
      "Quick workspace tidy"
    ]
  },
  {
    title: "Creative Time",
    items: [
      "15-min coding practice",
      "Take one photo",
      "Write new project ideas",
      "Document progress",
      "Quick inspiration browse",
      "Review learning notes"
    ]
  },
  {
    title: "Self Care",
    items: [
      "Eat regular meal",
      "Take vitamins",
      "Stand/walk break",
      "Eye rest break",
      "Shoulder stretches",
      "Hydration check",
      "5-min meditation"
    ]
  },
  {
    title: "Evening Routine",
    items: [
      "Clean workspace",
      "Tomorrow's simple plan",
      "Relaxing activity",
      "Dim lights",
      "Device wind-down",
      "Gratitude moment",
      "Set out tomorrow's clothes"
    ]
  }
];

const DayContext = ({ context, onUpdate }) => {
  const { mood, energyLevel, objective, isAIGenerated, context: aiContext } = context;

  const getEnergyColor = (level, currentLevel) => {
    if (level > currentLevel) return 'text-slate-300';
    if (currentLevel === 1) return 'text-red-500';
    if (currentLevel === 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <h4 className="font-medium text-slate-700 mb-3">
        {isAIGenerated ? "Generated Task Context" : "Day Context"}
      </h4>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-slate-600 w-16">Mood:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MOODS).map(([key, { emoji, label, color }]) => {
              const isSelected = mood === key;
              return (
                <button
                  key={key}
                  onClick={() => onUpdate({ ...context, mood: key })}
                  className={`
                    p-2 rounded-lg transition-all
                    ${isSelected ? `${color} shadow-md ring-2 ring-blue-500` : 'hover:bg-slate-100'}
                    ${!isSelected && mood ? 'opacity-40' : 'opacity-100'}
                  `}
                  title={label}
                >
                  <span className="text-xl">{emoji}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 w-16">Energy:</span>
          <div className="flex gap-1">
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                onClick={() => onUpdate({ ...context, energyLevel: level })}
                className="transition-colors cursor-pointer"
              >
                <Zap
                  size={16}
                  className={`
                    ${level <= energyLevel ? 'fill-current' : 'fill-none'}
                    ${getEnergyColor(level, energyLevel)}
                  `}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 w-16">Focus:</span>
          <span className="flex-1">{objective || "Another regular day"}</span>
          {isAIGenerated && aiContext && (
            <div className="group relative">
              <HelpCircle 
                size={16} 
                className="text-blue-500 cursor-help"
              />
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 hidden group-hover:block z-10">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                Additional Context: {aiContext}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProgressSummary = ({ checked, categories }) => {
  const getCategoryProgress = (categoryItems) => {
    if (!categoryItems || categoryItems.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = categoryItems.filter(item => checked[item]).length;
    const total = categoryItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const allItems = categories.flatMap(cat => cat.items);
  const totalCompleted = allItems.filter(item => checked[item]).length;
  const totalItems = allItems.length;
  const totalPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const getProgressColor = (percentage) => {
    if (percentage <= 25) return 'text-red-500';
    if (percentage <= 50) return 'text-yellow-500';
    if (percentage <= 75) return 'text-lime-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart size={20} className="text-blue-500" />
        <h4 className="font-medium text-slate-700">Progress Summary</h4>
      </div>
      
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
        <span className="font-medium text-slate-700">Overall Progress</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${getProgressColor(totalPercentage)}`}>
            {totalPercentage}%
          </span>
          <span className="text-sm text-slate-500">
            ({totalCompleted}/{totalItems} tasks)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {categories.map((category, idx) => {
          const progress = getCategoryProgress(category.items);
          return (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{category.title}</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getProgressColor(progress.percentage)}`}>
                  {progress.percentage}%
                </span>
                <span className="text-slate-400">
                  ({progress.completed}/{progress.total})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DayChecklist = ({ date, storageVersion, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [checked, setChecked] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [dayContext, setDayContext] = useState({
    mood: null,
    energyLevel: 0,
    objective: '',
    isAIGenerated: false
  });
  
  useEffect(() => {
    setActiveCategory(0);
  }, [categories]);

  useEffect(() => {
    if (!date) return;

    const savedData = getStorage()[date] || {};
    
    if (savedData?.aiTasks && Array.isArray(savedData.aiTasks)) {
      const validCategories = savedData.aiTasks
        .filter(category => 
          category && 
          typeof category.title === 'string' && 
          Array.isArray(category.items)
        )
        .map(category => ({
          title: category.title,
          items: category.items
            .filter(item => item !== null && item !== undefined)
            .map(item => item.toString().trim())
            .filter(item => item.length > 0)
        }))
        .filter(category => category.items.length > 0);

      if (validCategories.length > 0) {
        setCategories(validCategories);
        setDayContext({
          mood: savedData.mood || savedData.aiContext?.mood || null,
          energyLevel: savedData.energyLevel || savedData.aiContext?.energyLevel || 0,
          objective: savedData.aiContext?.objective || '',
          context: savedData.aiContext?.context || '',
          isAIGenerated: true
        });
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
      setDayContext({
        mood: savedData.mood || null,
        energyLevel: savedData.energyLevel || 0,
        objective: '',
        context: '',
        isAIGenerated: false
      });
    }

    if (savedData?.checked) {
      setChecked(savedData.checked);
    } else {
      const initialChecked = {};
      const categoriesData = savedData?.aiTasks || DEFAULT_CATEGORIES;
      categoriesData.forEach(category => {
        category.items.forEach(item => {
          initialChecked[item] = false;
        });
      });
      setChecked(initialChecked);
    }
  }, [date, storageVersion]);

  const handleContextUpdate = (newContext) => {
    setDayContext(newContext);
    
    const storage = getStorage();
    const currentData = storage[date] || {};
    
    storage[date] = {
      ...currentData,
      mood: newContext.mood,
      energyLevel: newContext.energyLevel
    };

    // If this is an AI-generated task list, also update the aiContext
    if (currentData.aiTasks) {
      storage[date].aiContext = {
        ...currentData.aiContext,
        mood: newContext.mood,
        energyLevel: newContext.energyLevel
      };
    }
    
    setStorage(storage);
  };

  const handleCheck = (item) => {
    const newChecked = {
      ...checked,
      [item]: !checked[item]
    };
    setChecked(newChecked);
    
    const hasCheckedItems = Object.values(newChecked).some(Boolean);
    if (hasCheckedItems) {
      const storage = getStorage();
      const currentData = storage[date] || {};
      storage[date] = {
        ...currentData,
        checked: newChecked
      };
      setStorage(storage);
    }
  };

  if (!date) return null;

  return (
    <dialog 
      id="checklist-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={(e) => e.target.id === 'checklist-modal' && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-800">
              {new Date(date).toLocaleDateString('default', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <DayContext context={dayContext} onUpdate={handleContextUpdate} />
          <ProgressSummary checked={checked} categories={categories} />

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${activeCategory === idx 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {categories[activeCategory].items.map((item, idx) => {
              const taskText = typeof item === 'string' ? item : 
                           typeof item === 'object' && item.task ? item.task :
                           String(item);
              return (
                <div
                  key={`${activeCategory}-${idx}`}
                  className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => handleCheck(taskText)}
                >
                  <div className="flex items-center justify-center w-5 h-5 mr-3">
                    {checked[taskText] ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <Circle size={20} className="text-slate-300" />
                    )}
                  </div>
                  <span className={`text-slate-700 ${checked[taskText] ? 'line-through text-slate-500' : ''}`}>
                    {taskText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default DayChecklist;