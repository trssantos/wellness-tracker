import React, { useState } from 'react';
import { Calendar } from './components/Calendar';
import { FlowGuide } from './components/FlowGuide';
import { FloatingMenu } from './components/FloatingMenu';
import { DayChecklist } from './components/DayChecklist';
import { HelpCircle } from 'lucide-react';


const App = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  const handleLogProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDay(today);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Daily Progress Tracker</h1>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            onClick={() => document.getElementById('guide-modal').showModal()}
          >
            <HelpCircle size={20} />
            <span>Guide</span>
          </button>
        </header>
        <main>
          <Calendar selectedDay={selectedDay} onSelectDay={setSelectedDay} />
        </main>
      </div>

      <FloatingMenu onLogProgress={handleLogProgress} />
      <FlowGuide />
      
      {selectedDay && (
        <DayChecklist 
          date={selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
};

export default App;