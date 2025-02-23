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

const AIContextSummary = ({ aiContext }) => {
  if (!aiContext) return null;

  const { mood, energyLevel, objective, context } = aiContext;
  const energyIcons = Array(3).fill(0).map((_, i) => (
    <Zap
      key={i}
      size={16}
      className={`
        ${i < energyLevel ? 'fill-current' : 'fill-none'}
        ${energyLevel === 1 ? 'text-red-500' : energyLevel === 2 ? 'text-yellow-500' : 'text-green-500'}
      `}
    />
  ));

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-6">
      <h4 className="font-medium text-slate-700 mb-3">Generated Task Context</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Mood:</span>
          <span>{mood}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Energy:</span>
          <div className="flex">{energyIcons}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Focus:</span>
          <span>{objective}</span>
          {context && (
            <div className="relative group">
              <HelpCircle size={16} className="text-blue-500 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-white rounded-lg shadow-lg text-sm text-slate-600">
                {context}
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
    const completed = categoryItems.filter(item => checked[item]).length;
    const total = categoryItems.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const totalCompleted = Object.values(checked).filter(Boolean).length;
  const totalItems = Object.keys(checked).length;
  const totalPercentage = Math.round((totalCompleted / totalItems) * 100);

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
  const [aiContext, setAiContext] = useState(null);
  
  // Reset active category when categories change
  useEffect(() => {
    setActiveCategory(0);
  }, [categories]);

  // Load data whenever date or storageVersion changes
  useEffect(() => {
    if (!date) return;

    const savedData = getStorage()[date];
    
    if (savedData?.aiTasks && Array.isArray(savedData.aiTasks)) {
        // Validate each category and its items
        const validCategories = savedData.aiTasks
          .filter(category => 
            category && 
            typeof category.title === 'string' && 
            Array.isArray(category.items)
          )
          .map(category => ({
            title: category.title,
            items: category.items
              .filter(item => item !== null && item !== undefined)  // Remove null/undefined items
              .map(item => item.toString().trim())  // Convert to string and trim
              .filter(item => item.length > 0)  // Remove empty strings
          }))
          .filter(category => category.items.length > 0);  // Remove empty categories
  
        if (validCategories.length > 0) {
          console.log('Using AI tasks:', validCategories);
          setCategories(validCategories);
          setAiContext({
            ...savedData.aiContext,
            mood: MOODS[savedData.aiContext.mood]?.label || savedData.aiContext.mood // Convert mood key to label if needed
          });
        } else {
          console.log('No valid AI tasks found, using defaults');
          setCategories(DEFAULT_CATEGORIES);
          setAiContext(null);
        }
      } else {
        console.log('No AI tasks found, using defaults');
        setCategories(DEFAULT_CATEGORIES);
        setAiContext(null);
      }

    if (savedData?.checked) {
      setChecked(savedData.checked);
    } else {
      const initialState = {};
      const tasksToUse = (savedData?.aiTasks || DEFAULT_CATEGORIES);
      
      tasksToUse.forEach(category => {
        (category.items || []).forEach(item => {
          const taskText = typeof item === 'string' ? item : 
                         typeof item === 'object' && item.task ? item.task :
                         String(item);
          initialState[taskText] = false;
        });
      });
      
      setChecked(initialState);

      // Save initial state
      const storage = getStorage();
      storage[date] = {
        ...storage[date],
        checked: initialState
      };
      setStorage(storage);
    }
  }, [date, storageVersion]); // Add storageVersion to dependencies

  const handleCheck = (item) => {
    const newChecked = {
      ...checked,
      [item]: !checked[item]
    };
    setChecked(newChecked);
    
    // Preserve AI context and tasks when updating progress
    const storage = getStorage();
    const currentData = storage[date] || {};
    storage[date] = { 
      ...currentData,
      checked: newChecked
    };
    setStorage(storage);
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

          {aiContext && <AIContextSummary aiContext={aiContext} />}
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