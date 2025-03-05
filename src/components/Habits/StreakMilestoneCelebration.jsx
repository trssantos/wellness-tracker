import React, { useState, useEffect } from 'react';
import { Trophy, Award, Star, Zap, PartyPopper } from 'lucide-react';

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

const StreakMilestoneCelebration = ({ streak, onClose, habitName }) => {
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
  
  // Determine which icon to show based on streak length
  const getIcon = () => {
    if (streak >= 100) return <Trophy size={48} className="text-amber-500" />;
    if (streak >= 50) return <Award size={48} className="text-blue-500" />;
    if (streak >= 25) return <Star size={48} className="text-purple-500" />;
    return <Zap size={48} className="text-yellow-500" />;
  };
  
  // Get congratulatory message based on streak
  const getMessage = () => {
    if (streak >= 100) return "Incredible Achievement!";
    if (streak >= 50) return "Amazing Dedication!";
    if (streak >= 25) return "Fantastic Progress!";
    if (streak >= 10) return "Great Job!";
    return "Streak Milestone!";
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
      
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full z-10 text-center shadow-xl transform animate-bounce-in">
        <div className="flex justify-center mb-4">
          {getIcon()}
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {getMessage()}
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          You've maintained <span className="font-bold text-amber-500">{streak} days</span> of your "{habitName}" habit!
        </p>
        
        <div className="flex justify-center items-center gap-2 mb-6">
          <PartyPopper className="text-amber-500" size={20} />
          <span className="text-slate-700 dark:text-slate-200">Keep up the great work!</span>
          <PartyPopper className="text-amber-500" size={20} />
        </div>
        
        <button 
          onClick={onClose}
          className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Thanks!
        </button>
      </div>
    </div>
  );
};

export default StreakMilestoneCelebration;