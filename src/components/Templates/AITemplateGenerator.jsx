import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, X, Brain, Lightbulb, Loader, Save, ArrowRight, Tag } from 'lucide-react';
import { generateContent } from '../../utils/ai-service';
import { createTemplate } from '../../utils/templateUtils';

const AITemplateGenerator = ({ onTemplateGenerated, onCancel }) => {
  const [templateInput, setTemplateInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [selectedTab, setSelectedTab] = useState('basic');
  const [error, setError] = useState(null);
  
  const handleGenerate = async () => {
    if (!templateInput.trim()) {
      setError("Please enter a template description first");
      return;
    }
    
    setError(null);
    setGenerating(true);
    
    try {
      const result = await generateTemplateFromAI(templateInput);
      setSuggestion(result);
      setSelectedTab('basic');
    } catch (err) {
      setError("Failed to generate template suggestion: " + (err.message || "Please try again."));
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };
  
  const handleAccept = () => {
    if (suggestion) {
      // Create the template directly here using templateUtils
      const newTemplate = createTemplate(suggestion);
      
      // Then pass it to the parent component
      onTemplateGenerated(newTemplate);
    }
  };
  
  const generateTemplateFromAI = async (input) => {
    const prompt = `
      Create a task template for: "${input}"
      
      Please generate a complete template with the following structure:
      - name: A short, clear name for the template
      - description: A brief description of what this template is for and when to use it
      - difficulty: The difficulty level (easy, medium, or hard)
      - categories: An array of categories, each containing:
        - title: A name for the category
        - items: An array of specific, actionable tasks within that category
      
      For example, if creating a "Morning Routine" template, you might include categories like "Wake Up", "Self-Care", "Planning", etc., each with 4-6 specific tasks.
      
      Design the template to be practical and specific with tasks that take 5-15 minutes each. Include 3-5 categories with 4-6 tasks each.
      
      Format the response as a JSON object.
      Example:
      {
        "name": "Morning Routine",
        "description": "A structured sequence of tasks to start your day with clarity and energy",
        "difficulty": "medium",
        "categories": [
          {
            "title": "Wake Up Rituals",
            "items": [
              "Drink a full glass of water",
              "Open curtains for natural light",
              "Make your bed",
              "Do 2 minutes of gentle stretching",
              "Take three deep breaths"
            ]
          },
          {
            "title": "Self-Care",
            "items": [
              "Brush teeth and wash face",
              "Take a quick shower",
              "Get dressed in prepared outfit",
              "Apply moisturizer/sunscreen"
            ]
          }
        ]
      }
      
      Only respond with the JSON object and nothing else. No explanations or additional text.
    `;
    
    try {
      const responseText = await generateContent(prompt);
      
      // Try to parse the response to extract the JSON object
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        // Clean the response before parsing
        const cleanedJson = jsonMatch[0]
          .replace(/\n/g, '')
          .replace(/,\s*}/, '}') // Remove trailing commas
          .replace(/,\s*]/, ']') // Remove trailing commas in arrays
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'); // Ensure property names are quoted
        
        try {
          const parsedTemplate = JSON.parse(cleanedJson);
          
          // Validate the template structure and provide fallbacks for missing fields
          return {
            name: parsedTemplate.name || input,
            description: parsedTemplate.description || `A template for ${input}`,
            difficulty: parsedTemplate.difficulty || 'medium',
            categories: Array.isArray(parsedTemplate.categories) && parsedTemplate.categories.length > 0 
              ? parsedTemplate.categories 
              : [
                  {
                    title: "General",
                    items: ["Task 1", "Task 2", "Task 3", "Task 4"]
                  }
                ]
          };
        } catch (parseError) {
          console.error("Error parsing template JSON:", parseError, cleanedJson);
          throw new Error('Failed to parse template suggestion');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error("Error generating template suggestion with AI:", error);
      throw error;
    }
  };
  
  // Handle updating categories and tasks
  const handleUpdateCategory = (index, field, value) => {
    if (!suggestion) return;
    
    const updatedCategories = [...suggestion.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };
    
    setSuggestion({
      ...suggestion,
      categories: updatedCategories
    });
  };
  
  const handleUpdateTask = (categoryIndex, taskIndex, value) => {
    if (!suggestion) return;
    
    const updatedCategories = [...suggestion.categories];
    const updatedItems = [...updatedCategories[categoryIndex].items];
    updatedItems[taskIndex] = value;
    
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      items: updatedItems
    };
    
    setSuggestion({
      ...suggestion,
      categories: updatedCategories
    });
  };
  
  const addTask = (categoryIndex) => {
    if (!suggestion) return;
    
    const updatedCategories = [...suggestion.categories];
    updatedCategories[categoryIndex].items.push("");
    
    setSuggestion({
      ...suggestion,
      categories: updatedCategories
    });
  };
  
  const removeTask = (categoryIndex, taskIndex) => {
    if (!suggestion) return;
    
    const updatedCategories = [...suggestion.categories];
    const updatedItems = [...updatedCategories[categoryIndex].items];
    
    if (updatedItems.length <= 1) {
      setError("Each category must have at least one task");
      return;
    }
    
    updatedItems.splice(taskIndex, 1);
    updatedCategories[categoryIndex].items = updatedItems;
    
    setSuggestion({
      ...suggestion,
      categories: updatedCategories
    });
  };
  
  const addCategory = () => {
    if (!suggestion) return;
    
    const updatedCategories = [...suggestion.categories, {
      title: "",
      items: [""]
    }];
    
    setSuggestion({
      ...suggestion,
      categories: updatedCategories
    });
  };
  
  const removeCategory = (categoryIndex) => {
    if (!suggestion) return;
    
    if (suggestion.categories.length <= 1) {
      setError("You must have at least one category");
      return;
    }
    
    const updatedCategories = [...suggestion.categories];
    updatedCategories.splice(categoryIndex, 1);
    
    setSuggestion({
      ...suggestion,
      categories: updatedCategories
    });
  };
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md w-full sm:w-[90%] md:w-3/4 lg:w-2/3 mx-auto overflow-hidden p-3 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20} />
          AI Template Creator
        </h2>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
      )}
      
      {/* Input Section */}
      {!suggestion && (
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            What kind of template would you like to create?
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={templateInput}
              onChange={(e) => setTemplateInput(e.target.value)}
              placeholder="e.g., Morning routine, Work planning, Project setup"
              className="flex-1 p-2 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 w-full"
              disabled={generating}
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !templateInput.trim()}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 mt-2 sm:mt-0 whitespace-nowrap ${
                generating || !templateInput.trim()
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                  : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {generating ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Brain size={18} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 p-3 sm:p-4 rounded-lg flex items-start gap-3">
            <Lightbulb className="text-amber-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                Tell the AI what kind of template you'd like to create, and it will generate categories and tasks based on your description.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                <strong>Try:</strong> "Morning routine for productivity" or "Weekly work planning template"
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Template Result */}
      {suggestion && (
        <div className="mb-4 sm:mb-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 mb-4">
            <button
              className={`px-3 sm:px-4 py-2 text-sm font-medium flex-shrink-0 ${
                selectedTab === 'basic'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setSelectedTab('basic')}
            >
              Basic Info
            </button>
            <button
              className={`px-3 sm:px-4 py-2 text-sm font-medium flex-shrink-0 ${
                selectedTab === 'categories'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setSelectedTab('categories')}
            >
              Categories & Tasks
            </button>
          </div>
          
          {/* Basic Info Tab */}
          {selectedTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={suggestion.name}
                  onChange={(e) => setSuggestion({...suggestion, name: e.target.value})}
                  className="w-full p-2 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={suggestion.description}
                  onChange={(e) => setSuggestion({...suggestion, description: e.target.value})}
                  className="w-full p-2 sm:p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 h-24"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Difficulty Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSuggestion({...suggestion, difficulty: level})}
                      className={`px-3 py-1.5 rounded-full text-sm capitalize ${
                        suggestion.difficulty === level
                          ? difficultyColors[level]
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Categories Tab */}
          {selectedTab === 'categories' && (
            <div className="space-y-6">
              {suggestion.categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => handleUpdateCategory(categoryIndex, 'title', e.target.value)}
                      placeholder="Category Name"
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                    />
                    <button
                      onClick={() => removeCategory(categoryIndex)}
                      className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                    {category.items.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                        <input
                          type="text"
                          value={task}
                          onChange={(e) => handleUpdateTask(categoryIndex, taskIndex, e.target.value)}
                          placeholder="Task"
                          className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm"
                        />
                        <button
                          onClick={() => removeTask(categoryIndex, taskIndex)}
                          className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={() => addTask(categoryIndex)}
                      className="text-blue-500 dark:text-blue-400 text-sm flex items-center gap-1 mt-2"
                    >
                      <Tag size={12} />
                      Add Task
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addCategory}
                className="w-full p-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Tag size={16} />
                Add Category
              </button>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
            >
              Cancel
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSuggestion(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm"
              >
                Back
              </button>
              <button 
                onClick={handleAccept}
                className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <Save size={18} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITemplateGenerator;