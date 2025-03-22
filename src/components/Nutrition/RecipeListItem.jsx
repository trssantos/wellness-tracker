import React from 'react';
import { Brain, Battery, ExternalLink } from 'lucide-react';

export const RecipeListItem = ({ recipe, isSelected, onClick }) => {
  return (
    <button
      onClick={() => onClick(recipe)}
      className={`shrink-0 flex-1 min-w-[200px] p-3 rounded-lg text-left transition-colors ${
        isSelected
          ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-500'
          : 'bg-slate-50 dark:bg-slate-700 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-600'
      }`}
    >
      {recipe.strMealThumb && (
        <div className="mb-2 overflow-hidden rounded-lg h-24 bg-slate-200 dark:bg-slate-600">
          <img 
            src={recipe.strMealThumb} 
            alt={recipe.strMeal} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm line-clamp-2">
          {recipe.strMeal}
        </h4>
      </div>
      
      <div className="flex flex-wrap gap-1">
        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
          <Brain size={10} /> +{recipe.moodImpact}%
        </span>
        <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center gap-1">
          <Battery size={10} /> +{recipe.energyImpact}%
        </span>
      </div>
      
      {recipe.strSource && (
        <div className="mt-2">
          <a
            href={recipe.strSource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-red-500 hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={10} /> Source
          </a>
        </div>
      )}
    </button>
  );
};

export default RecipeListItem;