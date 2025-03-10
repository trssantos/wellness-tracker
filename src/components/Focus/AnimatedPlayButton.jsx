import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const AnimatedPlayButton = ({ onClick }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        {/* Outer glow/pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/30 dark:bg-blue-600/20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Second pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-500/20 dark:bg-indigo-600/10"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        
        {/* Main button with gradient background */}
        <motion.button
          onClick={onClick}
          className="relative w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 z-10"
          whileHover={{ 
            scale: 1.05,
            background: "linear-gradient(to right, #3b82f6, #4f46e5)"
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
              "0 20px 30px -10px rgba(59, 130, 246, 0.6)",
              "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
            ],
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }
          }}
        >
          {/* Play icon with floating animation */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              y: [0, -2, 0]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Play size={48} fill="currentColor" />
          </motion.div>
        </motion.button>
      </div>
      
      {/* Title and subtitle with staggered fade-in */}
      <motion.h2 
        className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Start a Focus Session
      </motion.h2>
      <motion.p 
        className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-center transition-colors"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Boost your productivity with focused time blocks. Track your progress and build better work habits.
      </motion.p>
    </div>
  );
};

export default AnimatedPlayButton;