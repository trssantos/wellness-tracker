import React, { useState } from 'react';
import { Clock, Target, Calendar, CheckSquare, ArrowLeft, Star, MessageCircle, AlertTriangle, Timer, HelpCircle, Info } from 'lucide-react';

// Simple tooltip component
const Tooltip = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div 
        className="inline-flex items-center cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className="absolute z-50 w-64 p-3 text-xs bg-slate-800 text-white rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="relative">
            {content}
            <div className="absolute w-3 h-3 bg-slate-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1.5"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const FocusHistory = ({ sessions }) => {
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Improved time formatter to avoid decimal places
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "0m";
    
    // Round to integer seconds
    seconds = Math.round(seconds);
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return minutes > 0 
        ? `${hours}h ${minutes}m` 
        : `${hours}h`;
    } else if (minutes > 0) {
      return remainingSeconds > 0 
        ? `${minutes}m ${remainingSeconds}s` 
        : `${minutes}m`;
    } else {
      return `${remainingSeconds}s`;
    }
  };
  
  // Helper function to get a readable name for a technique
  const getTechniqueName = (techniqueId) => {
    const techniqueMap = {
      'pomodoro': 'Pomodoro Technique',
      'flowtime': 'Flowtime Method',
      '5217': '52/17 Method',
      'desktime': '90-Minute Focus',
      'custom': 'Custom Timer',
      'shortBreak': 'Short Break',
      'longBreak': 'Long Break',
      'stopwatch': 'Stopwatch'
    };
    
    return techniqueMap[techniqueId] || techniqueId;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Return to session list
  const handleBackClick = () => {
    setSelectedSession(null);
  };
  
  // Calculate efficiency percentage
  const calculateEfficiency = (session) => {
    // If there are tasks, base efficiency on task completion rate
    if (session.allTasks && session.allTasks.length > 0) {
      const completedCount = session.tasks ? session.tasks.length : 0;
      return Math.round((completedCount / session.allTasks.length) * 100);
    }
    
    // If we have interruption data and no tasks, base it on actual focus time
    if (session.totalPauseDuration !== undefined && session.duration > 0) {
      const actualFocusTime = Math.max(0, session.duration - session.totalPauseDuration);
      return Math.round((actualFocusTime / session.duration) * 100);
    }
    
    return 100; // Default only if no tasks AND no interruption data
  };
  
  // Render the session details view  
  const renderSessionDetails = (session) => {
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);
    const completedTasksCount = session.tasks ? session.tasks.length : 0;
    const totalTasksCount = session.allTasks ? session.allTasks.length : 0;
    const efficiency = calculateEfficiency(session);
    
    return (
      <div className="focus-session-details">
        {/* Header with back button */}
        <div className="mb-6 flex items-center gap-3">
          <button 
            onClick={handleBackClick}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 transition-colors">
            Focus Session Details
          </h3>
        </div>
        
        {/* Session header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 mb-6 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 transition-colors">
                {formatDate(session.startTime)} at {formatTime(session.startTime)}
              </div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-1 transition-colors">
                {session.objective || 'Focus Session'}
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 transition-colors">
                <Target size={14} />
                <span>{getTechniqueName(session.technique || session.preset || 'custom')}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors">
                {formatDuration(session.duration)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                Duration
              </div>
            </div>
          </div>
        </div>
        
        {/* Session metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {/* Session time */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-blue-500 dark:text-blue-400" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Time</div>
            </div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300 transition-colors">
              {formatTime(session.startTime)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              to {formatTime(session.endTime)}
            </div>
          </div>
          
          {/* Task completion */}
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={18} className="text-green-500 dark:text-green-400" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Tasks</div>
            </div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300 transition-colors">
              {completedTasksCount}
              {totalTasksCount > 0 && <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/{totalTasksCount}</span>}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              {completedTasksCount === 1 ? 'task' : 'tasks'} completed
            </div>
          </div>
          
          {/* Efficiency - NOW WITH TOOLTIP */}
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} className="text-amber-500 dark:text-amber-400" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Efficiency
                <Tooltip content={
                  <div>
                    <p className="font-medium mb-1">Efficiency Score</p>
                    <p>
                      {session.allTasks && session.allTasks.length > 0
                        ? "Percentage of tasks you completed during this session."
                        : "Percentage of time spent actively focused (not paused)."}
                    </p>
                  </div>
                }>
                  <Info size={14} className="text-amber-400 dark:text-amber-300 ml-1" />
                </Tooltip>
              </div>
            </div>
            <div className="text-xl font-bold text-amber-700 dark:text-amber-300 transition-colors">
              {efficiency}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              productivity rate
            </div>
          </div>
          
          {/* Productivity Rating */}
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} className="text-purple-500 dark:text-purple-400" />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                Rating
                <Tooltip content={
                  <div>
                    <p className="font-medium mb-1">Self-Assessment Rating</p>
                    <p>Your personal rating of how productive this session felt to you, from 1-5 stars.</p>
                  </div>
                }>
                  <Info size={14} className="text-purple-400 dark:text-purple-300 ml-1" />
                </Tooltip>
              </div>
            </div>
            <div className="text-xl font-bold text-purple-700 dark:text-purple-300 transition-colors">
              {session.productivityRating || session.focusRating || '-'}/5
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              self-assessment
            </div>
          </div>
        </div>
        
        {/* Interruption data - WITH TOOLTIPS */}
        {(session.interruptionsCount !== undefined) && (
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 transition-colors">
              <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />
              Interruption Data
              <Tooltip content={
                <div>
                  <p className="font-medium mb-1">Interruption Metrics</p>
                  <p>These measurements track how consistently you maintained focus during your session.</p>
                </div>
              }>
                <Info size={14} className="text-slate-400 dark:text-slate-500" />
              </Tooltip>
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center transition-colors">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1 transition-colors">
                  {session.interruptionsCount || 0}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center gap-1">
                  <span>{session.interruptionsCount === 1 ? 'Interruption' : 'Interruptions'}</span>
                  <Tooltip content={
                    <div>
                      <p className="font-medium mb-1">Interruptions</p>
                      <p>Number of times your focus session was paused.</p>
                    </div>
                  }>
                    <Info size={12} className="text-blue-400 dark:text-blue-300" />
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 text-center transition-colors">
                <div className="text-lg font-bold text-amber-700 dark:text-amber-300 mb-1 transition-colors">
                  {formatDuration(session.totalPauseDuration || 0)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center gap-1">
                  <span>Total Pause Time</span>
                  <Tooltip content={
                    <div>
                      <p className="font-medium mb-1">Pause Duration</p>
                      <p>Total time spent paused during this session.</p>
                    </div>
                  }>
                    <Info size={12} className="text-amber-400 dark:text-amber-300" />
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center transition-colors">
                <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-1 transition-colors">
                  {session.focusScore || '-'}/100
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors flex items-center justify-center gap-1">
                  <span>Focus Score</span>
                  <Tooltip content={
                    <div>
                      <p className="font-medium mb-1">Focus Score</p>
                      <p>Measures your ability to maintain uninterrupted focus.</p>
                      <p className="mt-1">Formula: Starting from 100%, points are deducted for interruptions and total pause time.</p>
                    </div>
                  }>
                    <Info size={12} className="text-green-400 dark:text-green-300" />
                  </Tooltip>
                </div>
              </div>
            </div>
            
            {/* Add context about interruptions */}
            {session.totalPauseDuration > 0 && (
              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <Timer size={12} className="text-slate-500 dark:text-slate-400" />
                  <span>
                    Actual focus time: <span className="font-medium">{formatDuration(Math.max(0, session.duration - session.totalPauseDuration))}</span> 
                    {session.interruptionsCount > 0 && ` with ${session.interruptionsCount} ${session.interruptionsCount === 1 ? 'break' : 'breaks'}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Task list */}
        {session.allTasks && session.allTasks.length > 0 && (
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 transition-colors">
              Focus Tasks
            </h4>
            <div className="space-y-2">
              {session.allTasks.map(task => {
                const isCompleted = session.tasks && session.tasks.some(t => t.id === task.id);
                const timeSpent = session.taskTimeData && session.taskTimeData.find(t => t.id === task.id)?.timeSpent;
                
                return (
                  <div 
                    key={task.id}
                    className={`
                      p-3 rounded-lg border transition-colors
                      ${isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50' 
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <div className={`
                          w-5 h-5 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-colors
                          ${isCompleted 
                            ? 'bg-green-500 dark:bg-green-600 text-white' 
                            : 'border border-slate-300 dark:border-slate-500'}
                        `}>
                          {isCompleted && <CheckSquare size={12} />}
                        </div>
                        <span className={`text-sm ${
                          isCompleted 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-slate-700 dark:text-slate-300'
                        } transition-colors`}>
                          {task.text}
                        </span>
                      </div>
                      {timeSpent > 0 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                          {formatDuration(timeSpent)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Session notes */}
        {session.notes && (
          <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 transition-colors">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 transition-colors">
              <MessageCircle size={16} className="text-blue-500 dark:text-blue-400" />
              Notes
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap transition-colors">
              {session.notes}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Render the session list
  const renderSessionList = () => {
    if (sessions.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4 transition-colors">
            <Calendar size={40} className="text-slate-400 dark:text-slate-500 transition-colors" />
          </div>
          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
            No Focus Sessions Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto transition-colors">
            Your completed focus sessions will appear here. Start your first session to begin tracking your productivity.
          </p>
        </div>
      );
    }
    
    // Group sessions by date
    const sessionsByDate = {};
    sessions.forEach(session => {
      const date = new Date(session.startTime || session.timestamp);
      const dateString = date.toISOString().split('T')[0];
      
      if (!sessionsByDate[dateString]) {
        sessionsByDate[dateString] = [];
      }
      sessionsByDate[dateString].push(session);
    });
    
    // Sort dates in descending order
    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a));
    
    // For sessions within the same day, sort by time (newest first)
    Object.values(sessionsByDate).forEach(sessionsForDay => {
      sessionsForDay.sort((a, b) => {
        const dateA = new Date(a.startTime || a.timestamp);
        const dateB = new Date(b.startTime || b.timestamp);
        return dateB - dateA; // Descending (newest first)
      });
    });
    
    return (
      <div className="space-y-6">
        {sortedDates.map(dateString => (
          <div key={dateString}>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2 transition-colors">
              <Calendar size={16} className="text-slate-400 dark:text-slate-500" />
              {formatDate(dateString)}
            </h3>
            
            <div className="space-y-3">
              {sessionsByDate[dateString].map(session => {
                const startDate = new Date(session.startTime || session.timestamp);
                const completedTasksCount = session.tasks ? session.tasks.length : 0;
                const totalTasksCount = session.allTasks ? session.allTasks.length : 0;
                
                return (
                  <div 
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 transition-colors">
                          {session.objective || 'Focus Session'}
                        </h4>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4 mt-1 transition-colors">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{formatTime(session.startTime || session.timestamp)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Target size={14} />
                            <span>{getTechniqueName(session.technique || session.preset || 'custom')}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 transition-colors">
                          {formatDuration(session.duration)}
                        </div>
                        
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {/* Show interruption count if available */}
                          {session.interruptionsCount !== undefined && (
                            <Tooltip content="Number of times the session was paused">
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                                <AlertTriangle size={12} />
                                <span>{session.interruptionsCount}</span>
                              </span>
                            </Tooltip>
                          )}
                          
                          {/* Always show completed tasks if we have them */}
                          {totalTasksCount > 0 && (
                            <Tooltip content="Completed tasks / Total tasks">
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5 ml-2">
                                <CheckSquare size={12} />
                                <span>{completedTasksCount}/{totalTasksCount}</span>
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Add interruption info in a badge if available */}
                    {session.totalPauseDuration > 0 && (
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <Tooltip content="Total time session was paused">
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">
                            <span>Paused: {formatDuration(session.totalPauseDuration)}</span>
                          </span>
                        </Tooltip>
                        
                        {session.focusScore && (
                          <Tooltip content="Score measuring your ability to maintain uninterrupted focus (100 is best)">
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                              <span>Focus: {session.focusScore}/100</span>
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="focus-history">
      {selectedSession ? renderSessionDetails(selectedSession) : renderSessionList()}
    </div>
  );
};

export default FocusHistory;