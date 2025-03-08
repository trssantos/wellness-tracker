import React, { useState } from 'react';
import { Calendar, Clock, CheckSquare, Trash2, Info, Search, X, Download, MessageSquare, AlertCircle, BarChart2 } from 'lucide-react';
import { deleteFocusSession } from '../../utils/focusUtils';

const FocusHistory = ({ sessions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, detail
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(a.startTime || a.timestamp);
    const dateB = new Date(b.startTime || b.timestamp);
    return dateB - dateA;
  });
  
  // Filter sessions based on search query
  const filteredSessions = sortedSessions.filter(session => {
    // Search in tasks
    const taskMatch = session.tasks && session.tasks.some(task => 
      task.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Search in notes
    const notesMatch = session.notes && 
      session.notes.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Search in preset name
    const presetMatch = session.preset && 
      session.preset.toLowerCase().includes(searchQuery.toLowerCase());
    
    return taskMatch || notesMatch || presetMatch || !searchQuery;
  });
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('default', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time to readable format
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('default', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format duration from seconds to readable time
  const formatDuration = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '0m';
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${secs}s`;
    }
  };
  
  // Handle session deletion
  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this focus session?')) {
      deleteFocusSession(sessionId);
      
      // If the deleted session was selected, unselect it
      if (selectedSession && selectedSession.id === sessionId) {
        setSelectedSession(null);
      }
      
      // Reload sessions (we'd need to update the parent component)
      window.location.reload();
    }
  };
  
  // Handle session selection
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setViewMode('detail');
  };
  
  // Export session history as JSON
  const handleExportHistory = () => {
    const exportData = {
      sessions: filteredSessions,
      exportDate: new Date().toISOString(),
      totalSessions: filteredSessions.length
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `focus-history-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Calculate total focus time
  const getTotalFocusTime = () => {
    return sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  };
  
  // Calculate total tasks completed
  const getTotalTasksCompleted = () => {
    return sessions.reduce((sum, session) => sum + (session.tasks ? session.tasks.length : 0), 0);
  };
  
  // Calculate average session duration
  const getAverageSessionDuration = () => {
    if (sessions.length === 0) return 0;
    return getTotalFocusTime() / sessions.length;
  };
  
  // If no sessions, show empty state
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
          Complete your first focus session to see your history here. Each session will be automatically recorded.
        </p>
      </div>
    );
  }
  
  // List view
  if (viewMode === 'list') {
    return (
      <div className="focus-history">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 transition-colors">
              Focus Session History
            </h3>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full pl-8 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500 h-4 w-4 transition-colors" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <button
                onClick={handleExportHistory}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                title="Export History"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
          
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center transition-colors">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1 transition-colors">
                {formatDuration(getTotalFocusTime())}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                Total Focus Time
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center transition-colors">
              <div className="text-lg font-bold text-green-700 dark:text-green-300 mb-1 transition-colors">
                {getTotalTasksCompleted()}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                Tasks Completed
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center transition-colors">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-1 transition-colors">
                {formatDuration(getAverageSessionDuration())}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 transition-colors">
                Avg Session Duration
              </div>
            </div>
          </div>
        </div>
        
        {/* Sessions list */}
        <div className="space-y-3">
          {filteredSessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 text-center transition-colors">
              <AlertCircle size={24} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
              <p className="text-slate-600 dark:text-slate-400 transition-colors">
                No matching sessions found.
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      session.preset === 'pomodoro'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : session.preset === 'short-break' || session.preset === 'long-break'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    } transition-colors`}>
                      <Clock size={24} />
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 transition-colors">
                          {formatDuration(session.duration)}
                        </h4>
                        {session.preset && (
                          <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs transition-colors">
                            {session.preset}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                        {formatDate(session.startTime || session.timestamp)} at {formatTime(session.startTime || session.timestamp)}
                      </div>
                      
                      {/* Task completion summary */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {session.tasks && session.tasks.length > 0 ? (
                          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded transition-colors">
                            <CheckSquare size={12} />
                            <span>{session.tasks.length} task{session.tasks.length !== 1 ? 's' : ''} completed</span>
                          </div>
                        ) : null}
                        
                        {session.notes && (
                          <div className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded transition-colors">
                            <MessageSquare size={12} />
                            <span>Has notes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
  
  // Detail view
  return (
    <div className="focus-history-detail">
      <div className="mb-4">
        <button 
          onClick={() => setViewMode('list')}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <X size={16} />
          <span>Back to Sessions List</span>
        </button>
      </div>
      
      {selectedSession ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1 transition-colors">
                  Focus Session Details
                </h3>
                <div className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
                  {formatDate(selectedSession.startTime || selectedSession.timestamp)} at {formatTime(selectedSession.startTime || selectedSession.timestamp)}
                </div>
              </div>
              
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                {formatDuration(selectedSession.duration)}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Session Info */}
              <div>
                <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 transition-colors">
                  <BarChart2 size={16} className="text-slate-500 dark:text-slate-400" />
                  Session Info
                </h4>
                
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 transition-colors">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4 text-slate-500 dark:text-slate-400 transition-colors">Session Type:</td>
                        <td className="py-1 font-medium text-slate-700 dark:text-slate-300 transition-colors">{selectedSession.preset || 'Custom'}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-slate-500 dark:text-slate-400 transition-colors">Duration:</td>
                        <td className="py-1 font-medium text-slate-700 dark:text-slate-300 transition-colors">{formatDuration(selectedSession.duration)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-slate-500 dark:text-slate-400 transition-colors">Started:</td>
                        <td className="py-1 font-medium text-slate-700 dark:text-slate-300 transition-colors">{formatTime(selectedSession.startTime || selectedSession.timestamp)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-slate-500 dark:text-slate-400 transition-colors">Ended:</td>
                        <td className="py-1 font-medium text-slate-700 dark:text-slate-300 transition-colors">{formatTime(selectedSession.endTime || selectedSession.timestamp)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-slate-500 dark:text-slate-400 transition-colors">Tasks Completed:</td>
                        <td className="py-1 font-medium text-slate-700 dark:text-slate-300 transition-colors">{selectedSession.tasks ? selectedSession.tasks.length : 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Tasks */}
              <div>
                <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 transition-colors">
                  <CheckSquare size={16} className="text-green-500 dark:text-green-400" />
                  Completed Tasks
                </h4>
                
                {selectedSession.tasks && selectedSession.tasks.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto pr-1">
                    <div className="divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-colors">
                      {selectedSession.tasks.map((task, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-green-500 dark:bg-green-600 text-white flex items-center justify-center mr-3 transition-colors">
                              <CheckSquare size={12} />
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300 transition-colors">
                              {task.text}
                            </span>
                          </div>
                          
                          {/* Show time spent if available */}
                          {selectedSession.taskTimeData && selectedSession.taskTimeData.length > 0 && (
                            <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded transition-colors">
                              {formatDuration(selectedSession.taskTimeData.find(t => t.id === task.id)?.timeSpent || 
                                selectedSession.duration / selectedSession.tasks.length)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center transition-colors">
                    <Info size={24} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                    <p className="text-slate-600 dark:text-slate-400 transition-colors">
                      No tasks were completed during this focus session.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Notes */}
            {selectedSession.notes && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 transition-colors">
                  <MessageSquare size={16} className="text-blue-500 dark:text-blue-400" />
                  Session Notes
                </h4>
                
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 transition-colors">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap transition-colors">
                    {selectedSession.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 text-center transition-colors">
          <Info size={32} className="mx-auto mb-3 text-slate-400 dark:text-slate-500" />
          <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
            No Session Selected
          </h4>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">
            Select a session to view details.
          </p>
        </div>
      )}
    </div>
  );
};

export default FocusHistory;