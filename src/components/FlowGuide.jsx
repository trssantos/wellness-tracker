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
          color: "bg-blue-50"
        },
        {
          condition: "Normal Energy",
          actions: "Regular routine, Light exercise",
          color: "bg-green-50"
        }
      ]
    },
    {
      title: "Focus Time",
      options: [
        {
          condition: "Scattered Mind",
          actions: "5min meditation, Simple task first",
          color: "bg-purple-50"
        },
        {
          condition: "Clear Mind",
          actions: "Important work, Creative projects",
          color: "bg-teal-50"
        }
      ]
    },
    {
      title: "Creative Block",
      options: [
        {
          condition: "Feeling Stuck",
          actions: "Take a photo, Quick coding practice",
          color: "bg-amber-50"
        },
        {
          condition: "Flowing Well",
          actions: "Continue progress, Document learning",
          color: "bg-indigo-50"
        }
      ]
    },
    {
      title: "Energy Dip",
      options: [
        {
          condition: "Need Break",
          actions: "Short walk, Water, Stretching",
          color: "bg-rose-50"
        },
        {
          condition: "Can Continue",
          actions: "Switch tasks, Change environment",
          color: "bg-cyan-50"
        }
      ]
    }
  ];

  return (
    <dialog id="guide-modal" className="rounded-xl p-0 bg-transparent backdrop:bg-black backdrop:bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Daily Navigation Guide</h2>
            <button
              onClick={() => document.getElementById('guide-modal').close()}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium text-slate-700 mb-3">{step.title}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {step.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`${option.color} border p-3 rounded-lg`}
                    >
                      <div className="font-medium text-slate-700 mb-1">
                        {option.condition}
                      </div>
                      <div className="text-sm text-slate-600">
                        {option.actions}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
};