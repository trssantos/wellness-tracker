import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Zap, PartyPopper,Flame,CheckCircle2,Calendar,TrendingUp,Target } from 'lucide-react';

const ConfettiParticle = ({ index }) => {
  // Generate random properties for each confetti particle
  const randomColor = () => {
    const colors = ['#FCD34D', '#60A5FA', '#34D399', '#F87171', '#A78BFA', '#FBBF24'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const size = Math.floor(Math.random() * 10) + 5;
  const color = randomColor();
  const left = `${Math.random() * 100}%`;
  const animationDuration = Math.random() * 3 + 2;
  const animationDelay = Math.random() * 0.5;
  
  const style = {
    position: 'absolute',
    backgroundColor: color,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '0',
    top: '-20px',
    left: left,
    opacity: Math.random() + 0.5,
    animation: `fall-${index % 3} ${animationDuration}s ease-in forwards`,
    animationDelay: `${animationDelay}s`,
    transform: `rotate(${Math.random() * 360}deg)`,
  };
  
  return <div className="confetti-particle" style={style} />;
};

const StreakMilestoneCelebration = ({ streak, onClose, habitName, milestoneName, milestoneType }) => {
  const [isVisible, setIsVisible] = useState(true);
  const numParticles = 100;

  useEffect(() => {
    // Auto-hide the celebration after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  // Get icon based on milestone type or streak
  const getIcon = () => {
    // If we have a milestone type, use that for icon selection
    if (milestoneType) {
      switch (milestoneType) {
        case 'streak':
          return <Flame size={48} className="text-amber-500" />;
        case 'completion': 
          return <CheckCircle2 size={48} className="text-green-500" />;
        case 'time':
          return <Calendar size={48} className="text-blue-500" />;
        case 'consistency':
          return <TrendingUp size={48} className="text-teal-500" />;
        case 'manual':
          return <Target size={48} className="text-purple-500" />;
        default:
          // Fall back to streak-based icon
          break;
      }
    }
    
    // Default to streak-based icons
    if (streak >= 100) return <Trophy size={48} className="text-amber-500" />;
    if (streak >= 50) return <Award size={48} className="text-blue-500" />;
    if (streak >= 25) return <Star size={48} className="text-purple-500" />;
    return <Zap size={48} className="text-yellow-500" />;
  };
  
  // Get congratulatory message based on milestone type or streak
  const getMessage = () => {
    // If we have a milestone name, use that
    if (milestoneName) {
      return `Milestone Achieved: ${milestoneName}`;
    }
    
    // Otherwise use streak-based messages
    if (streak >= 100) return "Incredible Achievement!";
    if (streak >= 50) return "Amazing Dedication!";
    if (streak >= 25) return "Fantastic Progress!";
    if (streak >= 10) return "Great Job!";
    return "Streak Milestone!";
  };
  
  // Get background color based on milestone type
  const getBgColor = () => {
    if (milestoneType === 'streak') return "bg-amber-100 dark:bg-amber-900/40";
    if (milestoneType === 'completion') return "bg-green-100 dark:bg-green-900/40";
    if (milestoneType === 'time') return "bg-blue-100 dark:bg-blue-900/40";
    if (milestoneType === 'consistency') return "bg-teal-100 dark:bg-teal-900/40";
    if (milestoneType === 'manual') return "bg-purple-100 dark:bg-purple-900/40";
    return "bg-white dark:bg-slate-800"; // Default
  };
  
  // Get description text based on milestone type
  const getDescription = () => {
    // Special case - if no streak, we're showing only the milestone
    if (streak === 0 && milestoneName) {
      return `You achieved "${milestoneName}" for your "${habitName}" habit!`;
    }
    
    // Regular case - show streak and milestone if available
    return (
      <>
        You've maintained <span className="font-bold text-amber-500">{streak} days</span> of your "{habitName}" habit!
        {milestoneName && (
          <div className="mt-2 text-sm font-medium">
            And achieved: <span className="italic">{milestoneName}</span>
          </div>
        )}
      </>
    );
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-black bg-opacity-50 absolute inset-0" onClick={onClose}></div>
      
      <div className="confetti-container w-full h-full absolute overflow-hidden pointer-events-none">
        {Array.from({ length: numParticles }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
      </div>
      
      <div className={`${getBgColor()} rounded-xl p-6 max-w-md w-full z-10 text-center shadow-xl transform animate-bounce-in border-2 ${
        milestoneType === 'streak' ? "border-amber-300 dark:border-amber-700" :
        milestoneType === 'completion' ? "border-green-300 dark:border-green-700" :
        milestoneType === 'time' ? "border-blue-300 dark:border-blue-700" :
        milestoneType === 'consistency' ? "border-teal-300 dark:border-teal-700" :
        milestoneType === 'manual' ? "border-purple-300 dark:border-purple-700" :
        "border-slate-300 dark:border-slate-700"
      }`}>
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {getMessage()}
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {getDescription()}
        </p>
        
        <div className="flex justify-center items-center gap-2 mb-6">
          <PartyPopper className="text-amber-500" size={20} />
          <span className="text-slate-700 dark:text-slate-200">Keep up the great work!</span>
          <PartyPopper className="text-amber-500" size={20} />
        </div>
        
        <button 
          onClick={onClose}
          className={`px-6 py-2 text-white rounded-lg transition-colors ${
            milestoneType === 'streak' ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700" :
            milestoneType === 'completion' ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700" :
            milestoneType === 'time' ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700" :
            milestoneType === 'consistency' ? "bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700" :
            milestoneType === 'manual' ? "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700" :
            "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          }`}
        >
          Thanks!
        </button>
      </div>
    </div>
  );
};

export default StreakMilestoneCelebration;