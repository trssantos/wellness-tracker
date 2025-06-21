// components/Navigation/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, StickyNote, Trophy, Apple, Coins, Focus, Menu, X, Home, BarChart2, Brain, Dumbbell, 
  MessageCircle, Layout, Bell, Settings, HelpCircle, Moon, Sun, Zap, LayoutDashboard, Target
} from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { hasUnreadMessages } from '../../utils/dayCoachUtils';
import { getStorage } from '../../utils/storage';

export const Sidebar = ({ activeSection, onSectionChange, onReminderSettingsOpen, onSettingsOpen, onHelpOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Add state for unread messages
  const [hasUnreadCoachMessages, setHasUnreadCoachMessages] = useState(false);

  // Add this function directly inside your Sidebar component
  const checkForUnreadMessages = () => {
    try {
      const storage = getStorage();
      
      if (!storage.dayCoach) return false;
      
      // Check if any messages are unread
      return storage.dayCoach.messages.some(msg => 
        msg.sender === 'coach' && !msg.isRead
      );
    } catch (error) {
      console.error('Error checking unread messages:', error);
      return false;
    }
  };

  // Then use this function instead of the imported one
  useEffect(() => {
    // Initial check
    setHasUnreadCoachMessages(checkForUnreadMessages());
    
    // Set up interval
    const checkUnreadInterval = setInterval(() => {
      setHasUnreadCoachMessages(checkForUnreadMessages());
    }, 5000); // Check every 5 seconds
    
    // Cleanup
    return () => clearInterval(checkUnreadInterval);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add touch handlers on mobile
  useEffect(() => {
    // Only add touch handlers on mobile
    if (!isMobile) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e) => {
      touchEndX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
      // If swipe right (from left edge of screen)
      if (touchEndX - touchStartX > 75 && touchStartX < 30) {
        setIsOpen(true);
      }
      
      // If swipe left while menu is open
      if (touchStartX - touchEndX > 75 && isOpen) {
        setIsOpen(false);
      }
    };
    
    // Add event listeners to document
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isOpen]); // Add isOpen as dependency to react to changes

  // Close sidebar on mobile when changing sections
  const handleSectionClick = (section) => {
    onSectionChange(section);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Navigation sections - Complete list with dashboard at the top
  const sections = [
    { id: 'dashboard', label: 'Today', icon: <LayoutDashboard size={20} /> },
    { id: 'overview', label: 'Tasks', icon: <Home size={20} /> },
    { id: 'stats', label: 'Stats', icon: <BarChart2 size={20} /> },
    { id: 'habits', label: 'Habits', icon: <Target size={20} /> },
    { id: 'meditation', label: 'Mental Health', icon: <Brain size={20} /> },
    { id: 'workout', label: 'Workout', icon: <Dumbbell size={20} /> },
    { 
      id: 'coach', 
      label: 'Day Coach', 
      icon: <MessageCircle size={20} />,
      hasNotification: hasUnreadCoachMessages
    },
    { id: 'focus', label: 'Focus', icon: <Focus size={20} /> },
    { id: 'finance', label: 'Finance', icon: <Coins size={20} /> },
    { id: 'nutrition', label: 'Nutrition', icon: <Apple size={20} /> },
    { id: 'bucketList', label: 'Bucket List', icon: <Trophy size={20} /> },
    { id: 'templates', label: 'Templates', icon: <Layout size={20} /> },
    { id: 'notes', label: 'Notes', icon: <StickyNote size={20} /> },
    { id: 'lifestyle', label: 'Lifestyle', icon: <Heart size={20} /> },
    { id: 'habitsShowcase', label: 'Habits - Showcase', icon: <Zap size={20} /> },
    { id: 'focusShowcase', label: 'Focus - Showcase', icon: <Focus size={20} /> },
    { id: 'financeShowcase', label: 'Finance - Showcase', icon: <Coins size={20} /> },
    { id: 'nutritionShowcase', label: 'Nutrition - Showcase', icon: <Apple size={20} /> },
    { id: 'goalsShowcase', label: 'Goals - Showcase', icon: <Trophy size={20} /> },
    { id: 'meditationShowcase', label: 'Meditation - Showcase', icon: <Brain size={20} /> },
  ];

  return (
    <>
      {/* Mobile hamburger menu */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md text-slate-700 dark:text-slate-300 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          style={{ transform: isOpen ? 'translateZ(0)' : 'none' }} // Ensure button is above all other elements
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 z-40
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0 relative'}
          ${isMobile ? 'w-64' : 'w-64 md:w-20 lg:w-64 md:group'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* App Logo/Name - Changed to right alignment */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-end"> {/* Changed to justify-end for right alignment */}
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors mr-2">
                <span className="md:hidden lg:inline">ZenTrack</span>
                <span className="hidden md:inline lg:hidden sr-only">ZT</span>
              </h1>
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white">
                <span className="text-lg font-bold">Z</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-2 overflow-y-auto">
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className={`
                      w-full flex items-center p-2 rounded-lg transition-colors
                      ${activeSection === section.id 
                        ? 'bg-blue-500 dark:bg-blue-600 text-white' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <span className="flex-shrink-0 relative">
                      {section.icon}
                      {section.hasNotification && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </span>
                    <span className="ml-3 md:hidden lg:inline transition-all duration-300">
                      {section.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              <span className="ml-3 md:hidden lg:inline">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            
            <button
              onClick={onReminderSettingsOpen}
              className="w-full flex items-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Bell size={20} />
              <span className="ml-3 md:hidden lg:inline">Reminders</span>
            </button>
            
            <button
              onClick={onSettingsOpen}
              className="w-full flex items-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings size={20} />
              <span className="ml-3 md:hidden lg:inline">Settings</span>
            </button>
            
            <button
              onClick={onHelpOpen}
              className="w-full flex items-center p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <HelpCircle size={20} />
              <span className="ml-3 md:hidden lg:inline">Help</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};