import React from 'react';
import { X } from 'lucide-react';

export const FlowGuide = () => {
  const steps = [
    {
      title: "Morning Start",
      options: [
        {
          condition: "Low Energy",
          actions: "Gentle stretching, Natural light, Water",
          color: "bg-blue-50 dark:bg-blue-900/30"
        },
        {
          condition: "Normal Energy",
          actions: "Regular routine, Light exercise",
          color: "bg-green-50 dark:bg-green-900/30"
        }
      ]
    },
    {
      title: "Focus Time",
      options: [
        {
          condition: "Scattered Mind",
          actions: "5min meditation, Simple task first",
          color: "bg-purple-50 dark:bg-purple-900/30"
        },
        {
          condition: "Clear Mind",
          actions: "Important work, Creative projects",
          color: "bg-teal-50 dark:bg-teal-900/30"
        }
      ]
    },
    {
      title: "Creative Block",
      options: [
        {
          condition: "Feeling Stuck",
          actions: "Take a photo, Quick coding practice",
          color: "bg-amber-50 dark:bg-amber-900/30"
        },
        {
          condition: "Flowing Well",
          actions: "Continue progress, Document learning",
          color: "bg-indigo-50 dark:bg-indigo-900/30"
        }
      ]
    },
    {
      title: "Energy Dip",
      options: [
        {
          condition: "Need Break",
          actions: "Short walk, Water, Stretching",
          color: "bg-rose-50 dark:bg-rose-900/30"
        },
        {
          condition: "Can Continue",
          actions: "Switch tasks, Change environment",
          color: "bg-cyan-50 dark:bg-cyan-900/30"
        }
      ]
    }
  ];

  return (
    <dialog id="guide-modal" className="modal-base">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">Daily Navigation Guide</h2>
          <button
            onClick={() => document.getElementById('guide-modal').close()}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
              <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-3 transition-colors">{step.title}</h3>
              <div className="grid grid-cols-2 gap-4">
                {step.options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`${option.color} border border-slate-200 dark:border-slate-700 p-3 rounded-lg transition-colors`}
                  >
                    <div className="font-medium text-slate-700 dark:text-slate-200 mb-1 transition-colors">
                      {option.condition}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                      {option.actions}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
};