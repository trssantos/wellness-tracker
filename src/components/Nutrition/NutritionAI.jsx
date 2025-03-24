import React, { useState } from 'react';
import { ArrowLeft, Brain, Send, Loader } from 'lucide-react';
import { generateContent } from '../../utils/ai-service';

const NutritionAI = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare the AI prompt with context about nutrition
      const aiPrompt = `You are a knowledgeable nutrition coach and dietitian. Answer the following nutrition-related question with accurate, helpful information. Consider scientific evidence and provide practical advice.

User question: ${prompt}`;

      const result = await generateContent(aiPrompt);
      setResponse(result);
    } catch (err) {
      console.error("Error getting AI response:", err);
      setError("Failed to get a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="modal-header">
        <div className="flex items-center gap-2">
          <h3 className="modal-title text-slate-800 dark:text-slate-100">Nutrition AI Assistant</h3>
        </div>
        <button onClick={onClose} className="modal-close-button text-slate-700 dark:text-slate-300">
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="p-4 bg-white dark:bg-slate-800">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Brain size={20} className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <p>
                Ask anything about nutrition, diet, or healthy eating habits. The AI can help with recipe ideas, nutrient information, dietary advice, and more.
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 mb-6">
            {error}
          </div>
        )}
        
        {response && (
          <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden mb-6">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-600">
              <h3 className="font-medium text-slate-800 dark:text-slate-100">AI Response</h3>
            </div>
            <div className="p-4">
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                {response.split('\n').map((paragraph, i) => (
                  paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-2 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            While our AI provides useful information, always consult with a healthcare professional before making significant dietary changes.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a nutrition question..."
              className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 min-h-32"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className={`absolute right-3 bottom-3 p-2 rounded-full ${
                isLoading || !prompt.trim()
                  ? 'bg-slate-100 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
                  : 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700'
              } transition-colors`}
            >
              {isLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NutritionAI;