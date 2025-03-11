import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { askSolaris } from '../utils/dayCoachUtils';

const SolarisQuickAccess = ({ moduleName }) => {
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAsk = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    
    try {
      const result = await askSolaris(question, { module: moduleName });
      setResponse(result);
      setQuestion('');
    } catch (error) {
      console.error('Error asking Solaris:', error);
      setResponse({
        message: "I'm sorry, I'm having trouble right now. Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };
  
  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all z-50"
        title="Ask Solaris"
      >
        <MessageCircle size={24} />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-6 right-6 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 transition-all">
      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-between items-center">
        <div className="text-white font-medium flex items-center gap-2">
          <MessageCircle size={16} />
          <span>Ask Solaris</span>
        </div>
        <button 
          onClick={() => {
            setExpanded(false);
            setResponse(null);
          }}
          className="text-white/80 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      
      {response ? (
        <div className="p-3">
          <div className="mb-3 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">
            {response.message}
          </div>
          
          {response.suggestions && response.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {response.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuestion(suggestion);
                    setResponse(null);
                  }}
                  className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setResponse(null)}
            className="w-full py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-sm"
          >
            Ask something else
          </button>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex mb-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Solaris something..."
              className="flex-1 p-2 border border-slate-200 dark:border-slate-600 rounded-l-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 resize-none"
              rows={2}
            />
            <button
              onClick={handleAsk}
              disabled={!question.trim() || isLoading}
              className={`p-2 rounded-r-lg ${
                !question.trim() || isLoading
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-500 dark:bg-indigo-600 text-white'
              }`}
            >
              <Send size={16} />
            </button>
          </div>
          
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ask about your tasks, habits, mood, or for advice
          </div>
        </div>
      )}
    </div>
  );
};

export default SolarisQuickAccess;