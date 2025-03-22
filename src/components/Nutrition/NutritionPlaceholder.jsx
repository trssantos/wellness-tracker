import React from 'react';
import { Apple, BarChart2, Camera, Search, Book, ChefHat, PieChart, Brain, Battery, Clock, Droplets, Utensils, Zap, Award, Calendar, TrendingUp, MessageCircle } from 'lucide-react';

export const NutritionPlaceholder = () => {
  // Features for nutrition section
  const features = [
    { icon: <Camera size={18} />, title: "Snap & Log", description: "Quick photo logging of meals with AI-powered food recognition" },
    { icon: <BarChart2 size={18} />, title: "Mood Food Insights", description: "Discover how different foods affect your energy and mood" },
    { icon: <ChefHat size={18} />, title: "Smart Recipes", description: "Personalized recommendations based on your mood patterns" },
    { icon: <PieChart size={18} />, title: "Nutrient Tracking", description: "Balanced nutrition overview without calorie obsession" }
  ];

  // Example food-mood correlation data
  const correlationData = [
    { food: "Leafy Greens", moodImpact: "+27%", energyImpact: "+31%", emoji: "🥬" },
    { food: "Whole Grains", moodImpact: "+18%", energyImpact: "+24%", emoji: "🌾" },
    { food: "Processed Foods", moodImpact: "-15%", energyImpact: "-23%", emoji: "🍟" },
    { food: "Dark Chocolate", moodImpact: "+22%", energyImpact: "+12%", emoji: "🍫" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 transition-colors">
          <Apple className="text-red-500 dark:text-red-400" size={24} />
          Nutrition
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-red-50 dark:bg-red-900/30 p-8 rounded-xl mb-4 flex items-center justify-center flex-shrink-0">
            <Apple className="text-red-500 dark:text-red-400" size={80} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors">
              Coming Soon
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 transition-colors">
              Discover the connection between what you eat and how you feel. Our nutrition
              tracker links your food choices with mood and energy patterns, helping you identify
              which foods fuel your best days without complex calorie counting.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg text-red-600 dark:text-red-400">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Logging Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Utensils className="text-red-500 dark:text-red-400" size={20} />
          Quick Logging
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-slate-700 dark:text-slate-200">Snap & Log</h4>
            </div>
            <div className="p-4 flex flex-col items-center justify-center">
              <div className="mb-4 w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Camera size={40} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="grid grid-cols-3 gap-2 w-full">
                <button className="bg-red-500 text-white p-2 rounded-lg text-sm font-medium">Take Photo</button>
                <button className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-lg text-sm font-medium">Quick Add</button>
                <button className="border border-red-500 text-red-500 p-2 rounded-lg text-sm font-medium">Favorites</button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-slate-700 dark:text-slate-200">Quick Search</h4>
            </div>
            <div className="p-4">
              <div className="mb-4 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search foods..."
                  className="w-full pl-10 p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥗</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Garden Salad</span>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded">Energy+</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍳</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Eggs & Avocado</span>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">Focus+</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥐</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Pastries</span>
                  </div>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded">Mood-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Correlation Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Brain className="text-red-500 dark:text-red-400" size={20} />
          Mood & Energy Correlation
        </h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Food-Mood Patterns</h4>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={14} />
              <span>Last 30 days</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Food Category</th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Mood Impact</th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Energy Impact</th>
                  <th className="py-2 px-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {correlationData.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-3 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.food}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        item.moodImpact.startsWith('+') 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {item.moodImpact}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        item.energyImpact.startsWith('+') 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      }`}>
                        {item.energyImpact}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div className={`h-2 rounded-full ${i === 0 || i === 1 ? 'bg-red-400' : 'bg-red-300'}`} style={{ width: i === 0 ? '70%' : i === 1 ? '60%' : i === 2 ? '45%' : '25%' }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={18} className="text-purple-500 dark:text-purple-400" />
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Mood Boosters</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Berries 🫐</span>
                <span className="text-purple-600 dark:text-purple-400">+18%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Nuts 🥜</span>
                <span className="text-purple-600 dark:text-purple-400">+15%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Fatty Fish 🐟</span>
                <span className="text-purple-600 dark:text-purple-400">+12%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Battery size={18} className="text-blue-500 dark:text-blue-400" />
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Energy Boosters</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Oats 🥣</span>
                <span className="text-blue-600 dark:text-blue-400">+22%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Bananas 🍌</span>
                <span className="text-blue-600 dark:text-blue-400">+19%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Sweet Potato 🍠</span>
                <span className="text-blue-600 dark:text-blue-400">+16%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={18} className="text-red-500 dark:text-red-400" />
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Hydration Impact</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Morning Water 💧</span>
                <span className="text-blue-600 dark:text-blue-400">+25% Energy</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Tea ☕</span>
                <span className="text-purple-600 dark:text-purple-400">+14% Mood</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Dehydration 📉</span>
                <span className="text-red-600 dark:text-red-400">-20% Focus</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Integration Showcase */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Zap className="text-red-500 dark:text-red-400" size={20} />
          Integration with Other Modules
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h4 className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp size={16} /> Stats Integration
              </h4>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Your nutrition data flows seamlessly into Stats, showing correlations between:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Food choices and mood fluctuations</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Meal timing and energy levels</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Hydration and focus session performance</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Nutrition quality and sleep metrics</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h4 className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <MessageCircle size={16} /> Coach Integration
              </h4>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full flex-shrink-0">
                  <MessageCircle size={16} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg max-w-[75%]">
                  <p className="text-sm text-slate-700 dark:text-slate-200">I noticed your energy dips around 2pm. Your lunch is often low in protein. Try adding some chickpeas or nuts tomorrow!</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 mb-3 self-end">
                <div className="bg-blue-500 p-3 rounded-lg max-w-[75%]">
                  <p className="text-sm text-white">Thanks, that's a great idea! Any quick recipes?</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full flex-shrink-0">
                  <MessageCircle size={16} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg max-w-[75%]">
                  <p className="text-sm text-slate-700 dark:text-slate-200">Try this quick chickpea salad: chickpeas, cucumber, cherry tomatoes, olive oil, lemon juice, and herbs. Takes 5 mins!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <h4 className="font-medium text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
            <Award size={16} className="text-amber-500 dark:text-amber-400" /> Habit Integration
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Automatically generate food-related habits based on your patterns:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Drink water before coffee</span>
              </div>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded">+20% Energy</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-purple-500 dark:text-purple-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Protein-rich breakfast</span>
              </div>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">+15% Mood</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recipe Generator Preview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 transition-colors">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-4 transition-colors flex items-center gap-2">
          <Book className="text-red-500 dark:text-red-400" size={20} />
          Personalized Recipe Suggestions
        </h3>
        
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-4">
          <div className="bg-red-50 dark:bg-red-900/30 p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-700 dark:text-slate-200">Based on your patterns</h4>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">Mood & Energy Boost</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-slate-700 dark:text-slate-300">Mediterranean Bowl</h5>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Prep time:</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">15 mins</span>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="col-span-3">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  This bowl combines foods that correlate with your best mood and energy days.
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Quinoa</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Chickpeas</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Avocado</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Cucumber</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Cherry Tomatoes</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Olive Oil</span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">Lemon</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <ChefHat size={32} className="text-red-500 dark:text-red-400" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded flex items-center gap-1">
                  <Brain size={12} /> +18% Mood
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                  <Battery size={12} /> +22% Energy
                </span>
              </div>
              <button className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg font-medium opacity-60 cursor-not-allowed">
                View Full Recipe
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium opacity-60 cursor-not-allowed">
            Coming soon...
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionPlaceholder;