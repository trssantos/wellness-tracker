import React, { useState } from 'react';
import { X,Lightbulb, ArrowLeft, ArrowRight, BookOpen, Brain, Timer, Heart, Moon, Coffee, Wind } from 'lucide-react';

const MeditationTips = ({ onClose }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // Collection of meditation tips and best practices
  const tips = [
    {
      title: "Finding the Right Time",
      icon: <Timer className="text-amber-500 dark:text-amber-400" size={24} />,
      content: "Consistency is key with meditation. Try to meditate at the same time each day to build a habit. Many find that early morning works best before the day's distractions begin, while others prefer evening meditation to unwind before sleep. Experiment to find what works best for you.",
      color: "bg-amber-50 dark:bg-amber-900/30"
    },
    {
      title: "Posture Basics",
      icon: <Moon className="text-indigo-500 dark:text-indigo-400" size={24} />,
      content: "Sit with your spine straight but not rigid. You can sit on a chair with your feet flat on the floor, or cross-legged on a cushion. Keep your hands relaxed, resting on your thighs or in your lap. A good posture helps prevent discomfort and sleepiness during meditation.",
      color: "bg-indigo-50 dark:bg-indigo-900/30"
    },
    {
      title: "Handling Wandering Thoughts",
      icon: <Brain className="text-purple-500 dark:text-purple-400" size={24} />,
      content: "It's natural for your mind to wander during meditation. When you notice your thoughts drifting, gently acknowledge this without judgment and return your focus to your breath or meditation object. Each time you bring your attention back, you're strengthening your mindfulness.",
      color: "bg-purple-50 dark:bg-purple-900/30"
    },
    {
      title: "Start Small",
      icon: <Lightbulb className="text-yellow-500 dark:text-yellow-400" size={24} />,
      content: "Begin with just 5 minutes of meditation daily. It's better to meditate for 5 minutes every day than 30 minutes once a week. As it becomes a habit, gradually increase your time. Consistency matters more than duration, especially when starting out.",
      color: "bg-yellow-50 dark:bg-yellow-900/30"
    },
    {
      title: "Breathing Techniques",
      icon: <Wind className="text-blue-500 dark:text-blue-400" size={24} />,
      content: "Your breath is a powerful tool for meditation. Try the 4-7-8 technique: inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Or simply observe your natural breath without changing it, noticing the sensation at your nostrils or the rise and fall of your chest.",
      color: "bg-blue-50 dark:bg-blue-900/30"
    },
    {
      title: "Creating a Space",
      icon: <Coffee className="text-orange-500 dark:text-orange-400" size={24} />,
      content: "Designate a specific area for meditation in your home. It doesn't need to be large - just a corner with a cushion or chair. Keep this space clean and free of distractions. Having a dedicated meditation spot helps signal to your brain that it's time to focus.",
      color: "bg-orange-50 dark:bg-orange-900/30"
    },
    {
      title: "Working with Emotions",
      icon: <Heart className="text-rose-500 dark:text-rose-400" size={24} />,
      content: "When difficult emotions arise during meditation, practice allowing them to be present without trying to change them. Observe where you feel them in your body. By acknowledging emotions without judgment, you develop emotional resilience and self-compassion.",
      color: "bg-rose-50 dark:bg-rose-900/30"
    },
    {
      title: "Different Meditation Styles",
      icon: <BookOpen className="text-green-500 dark:text-green-400" size={24} />,
      content: "There are many paths to mindfulness. If focusing on the breath doesn't resonate with you, try body scans, loving-kindness meditation, walking meditation, or guided visualization. Each approach offers unique benefits and might suit different moods or situations.",
      color: "bg-green-50 dark:bg-green-900/30"
    },
    {
      title: "Technology and Meditation",
      icon: <Brain className="text-cyan-500 dark:text-cyan-400" size={24} />,
      content: "While apps and guided audio can be helpful, consider occasionally practicing without technology. This builds self-reliance in your practice. If using guided meditations, gradually transition to shorter guidance and longer periods of silence.",
      color: "bg-cyan-50 dark:bg-cyan-900/30"
    },
    {
      title: "Progress in Meditation",
      icon: <Lightbulb className="text-amber-500 dark:text-amber-400" size={24} />,
      content: "Meditation progress isn't linear. Some days will feel peaceful, others frustrating. The real benefits often emerge gradually in your daily life: increased patience, better focus, or greater emotional balance. Trust the process rather than seeking specific experiences.",
      color: "bg-amber-50 dark:bg-amber-900/30"
    }
  ];
  
  // Go to previous tip
  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev === 0 ? tips.length - 1 : prev - 1));
  };
  
  // Go to next tip
  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev === tips.length - 1 ? 0 : prev + 1));
  };
  
  // Current tip
  const currentTip = tips[currentTipIndex];
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
          <Lightbulb className="text-amber-500 dark:text-amber-400" size={20} />
          Meditation Tips & Best Practices
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Tip card */}
        <div className={`${currentTip.color} rounded-xl p-6 shadow-sm transition-colors mb-6`}>
          <div className="flex items-start gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-full p-3 flex-shrink-0 shadow-sm transition-colors">
              {currentTip.icon}
            </div>
            <div>
              <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2 transition-colors">
                {currentTip.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                {currentTip.content}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevTip}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Previous Tip</span>
          </button>
          
          <div className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
            {currentTipIndex + 1} of {tips.length}
          </div>
          
          <button
            onClick={nextTip}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <span>Next Tip</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Additional links or resources */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors">
        <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
          Additional Resources
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a 
            href="https://www.mindful.org/meditation/mindfulness-getting-started/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors text-sm flex items-center gap-1"
          >
            <BookOpen size={14} />
            Getting Started with Mindfulness
          </a>
          <a 
            href="https://www.headspace.com/meditation-101/what-is-meditation" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors text-sm flex items-center gap-1"
          >
            <Brain size={14} />
            Meditation 101
          </a>
          <a 
            href="https://www.verywellmind.com/benefits-of-meditation-for-stress-management-3145204" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors text-sm flex items-center gap-1"
          >
            <Heart size={14} />
            Benefits of Meditation
          </a>
          <a 
            href="https://www.nytimes.com/guides/well/meditation-for-sleep" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors text-sm flex items-center gap-1"
          >
            <Moon size={14} />
            Meditation for Sleep
          </a>
        </div>
      </div>
    </div>
  );
};

export default MeditationTips;