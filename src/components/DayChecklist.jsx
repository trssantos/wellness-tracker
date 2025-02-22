import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, BarChart } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';

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

export const DayChecklist = ({ date, onClose }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [checked, setChecked] = useState({});
  
  const categories = [
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

  useEffect(() => {
    const savedData = getStorage()[date];
    if (savedData?.checked) {
      setChecked(savedData.checked);
    } else {
      const initialState = {};
      categories.forEach(category => {
        category.items.forEach(item => {
          initialState[item] = false;
        });
      });
      setChecked(initialState);
    }
  }, [date]);

  const handleCheck = (item) => {
    const newChecked = {
      ...checked,
      [item]: !checked[item]
    };
    setChecked(newChecked);
    
    // Preserve mood when updating progress
    const storage = getStorage();
    const mood = storage[date]?.mood;
    storage[date] = { 
      checked: newChecked,
      mood: mood // Keep existing mood if it exists
    };
    setStorage(storage);
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'checklist-modal') {
      onClose();
    }
  };

  return (
    <dialog 
      id="checklist-modal" 
      className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50"
      onClick={handleClickOutside}
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
              onClick={() => {
                document.getElementById('checklist-modal').close();
                onClose();
              }}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

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
            {categories[activeCategory].items.map((item) => (
              <div
                key={item}
                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => handleCheck(item)}
              >
                <div className="flex items-center justify-center w-5 h-5 mr-3">
                  {checked[item] ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} className="text-slate-300" />
                  )}
                </div>
                <span className={`text-slate-700 ${checked[item] ? 'line-through text-slate-500' : ''}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default DayChecklist;