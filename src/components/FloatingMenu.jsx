import React, { useState } from 'react';
import { Plus, CheckCircle2, SmilePlus, X } from 'lucide-react';

export const FloatingMenu = ({ onLogProgress, onLogMood }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    setIsOpen(false);
    if (action === 'log') {
      onLogProgress();
    } else if (action === 'mood') {
      onLogMood();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
            <button
              onClick={() => handleAction('log')}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <CheckCircle2 size={18} />
              <span>Log today's progress</span>
            </button>
            
            <button
              onClick={() => handleAction('mood')}
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <SmilePlus size={18} />
              <span>Track mood</span>
            </button>
          </div>
        </>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-4 rounded-full shadow-lg text-white
          transition-all duration-200 ease-in-out
          ${isOpen ? 'bg-red-500 rotate-45' : 'bg-blue-500 hover:bg-blue-600'}
        `}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};