import React from 'react';
import { Utensils, Coffee, ShoppingCart, Package, BarChart2 } from 'lucide-react';

const FoodAnalysis = ({ spendingByGroup, totalExpenses, currency = '$' }) => {
  // Format currency amount
  const formatCurrency = (amount) => {
    return `${currency}${parseFloat(amount).toFixed(2)}`;
  };
  
  // Find the food group in the spending data
  const foodGroup = spendingByGroup.find(group => group.name === 'Food');
  
  if (!foodGroup) {
    return (
      <div className="text-center p-6 bg-slate-700/50 rounded-lg">
        <Utensils size={48} className="text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400">No food expenses to analyze.</p>
      </div>
    );
  }
  
  // Find specific food categories
  const groceries = foodGroup.subcategories.find(sub => sub.id === 'expense-food-groceries');
  const restaurants = foodGroup.subcategories.find(sub => sub.id === 'expense-food-restaurants');
  const takeaway = foodGroup.subcategories.find(sub => sub.id === 'expense-food-takeaway');
  const coffee = foodGroup.subcategories.find(sub => sub.id === 'expense-food-coffee');
  
  // Calculate totals
  const diningOutTotal = (restaurants?.total || 0) + (takeaway?.total || 0);
  const groceryTotal = groceries?.total || 0;
  const coffeeTotal = coffee?.total || 0;
  const foodTotal = foodGroup.total;
  
  // Calculate ratios and percentages
  const homeVsOutRatio = groceryTotal > 0 ? diningOutTotal / groceryTotal : 0;
  const groceryPercent = (groceryTotal / foodTotal) * 100;
  const diningOutPercent = (diningOutTotal / foodTotal) * 100;
  const coffeePercent = (coffeeTotal / foodTotal) * 100;
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
        <Utensils className="text-green-400" size={24} />
        Food Spending Analysis
      </h3>
      
      {/* Food spending summary */}
      <div className="bg-slate-800/60 rounded-lg border border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-slate-400">Total Food Spending</div>
            <div className="text-xl font-bold text-white">{formatCurrency(foodTotal)}</div>
            <div className="text-xs text-slate-400 mt-1">
              {Math.round((foodTotal / totalExpenses) * 100)}% of your total expenses
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(groceryPercent)}%</div>
              <div className="text-xs text-slate-400">Groceries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(diningOutPercent)}%</div>
              <div className="text-xs text-slate-400">Dining Out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(coffeePercent)}%</div>
              <div className="text-xs text-slate-400">Coffee</div>
            </div>
          </div>
        </div>
        
        {/* Category breakdown */}
        <div className="space-y-3">
          <div className="h-8 bg-slate-700 rounded-full overflow-hidden flex">
            {groceries && (
              <div 
                className="h-full bg-green-500 dark:bg-green-600"
                style={{ width: `${Math.max(5, groceryPercent)}%` }}
                title={`Groceries: ${formatCurrency(groceryTotal)}`}
              ></div>
            )}
            
            {restaurants && (
              <div 
                className="h-full bg-amber-500 dark:bg-amber-600"
                style={{ width: `${Math.max(5, (restaurants.total / foodTotal) * 100)}%` }}
                title={`Restaurants: ${formatCurrency(restaurants.total)}`}
              ></div>
            )}
            
            {takeaway && (
              <div 
                className="h-full bg-red-500 dark:bg-red-600"
                style={{ width: `${Math.max(5, (takeaway.total / foodTotal) * 100)}%` }}
                title={`Takeaway: ${formatCurrency(takeaway.total)}`}
              ></div>
            )}
            
            {coffee && (
              <div 
                className="h-full bg-purple-500 dark:bg-purple-600"
                style={{ width: `${Math.max(5, (coffee.total / foodTotal) * 100)}%` }}
                title={`Coffee: ${formatCurrency(coffee.total)}`}
              ></div>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-sm">
            {groceries && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-white">Groceries</span>
              </div>
            )}
            
            {restaurants && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-white">Restaurants</span>
              </div>
            )}
            
            {takeaway && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-white">Takeaway</span>
              </div>
            )}
            
            {coffee && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-white">Coffee</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Food Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Groceries */}
        {groceries && (
          <div className="bg-green-900/30 border border-green-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/50 rounded-lg text-green-400">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h5 className="font-medium text-white">Groceries</h5>
                <div className="text-lg font-bold text-white">{formatCurrency(groceryTotal)}</div>
                <div className="text-xs text-slate-300">
                  {Math.round(groceryPercent)}% of food budget
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Restaurants */}
        {restaurants && (
          <div className="bg-amber-900/30 border border-amber-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-900/50 rounded-lg text-amber-400">
                <Utensils size={20} />
              </div>
              <div>
                <h5 className="font-medium text-white">Restaurants</h5>
                <div className="text-lg font-bold text-white">{formatCurrency(restaurants.total)}</div>
                <div className="text-xs text-slate-300">
                  {Math.round((restaurants.total / foodTotal) * 100)}% of food budget
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Takeaway */}
        {takeaway && (
          <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/50 rounded-lg text-red-400">
                <Package size={20} />
              </div>
              <div>
                <h5 className="font-medium text-white">Takeaway</h5>
                <div className="text-lg font-bold text-white">{formatCurrency(takeaway.total)}</div>
                <div className="text-xs text-slate-300">
                  {Math.round((takeaway.total / foodTotal) * 100)}% of food budget
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Coffee */}
        {coffee && (
          <div className="bg-purple-900/30 border border-purple-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-900/50 rounded-lg text-purple-400">
                <Coffee size={20} />
              </div>
              <div>
                <h5 className="font-medium text-white">Coffee & Cafes</h5>
                <div className="text-lg font-bold text-white">{formatCurrency(coffee.total)}</div>
                <div className="text-xs text-slate-300">
                  {Math.round((coffee.total / foodTotal) * 100)}% of food budget
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Analysis Cards */}
      <div className="space-y-4 mt-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <BarChart2 size={16} className="text-amber-400" />
          Food Spending Analysis
        </h4>
        
        {/* Home vs Eating Out Analysis */}
        {homeVsOutRatio > 0 && (
          <div className={`p-4 rounded-lg ${
            homeVsOutRatio > 1.5 ? 'bg-red-900/30 border border-red-800/50' :
            homeVsOutRatio > 1 ? 'bg-amber-900/30 border border-amber-800/50' :
            'bg-green-900/30 border border-green-800/50'
          }`}>
            <h5 className="font-medium text-white mb-2">
              {homeVsOutRatio > 1.5 ? 'High Eating Out Expenses' :
               homeVsOutRatio > 1 ? 'Moderate Eating Out Expenses' :
               'Good Home Cooking Balance'}
            </h5>
            
            <p className="text-slate-300 mb-3">
              You're spending {homeVsOutRatio.toFixed(1)}x more on eating out than on groceries.
              {homeVsOutRatio > 1.5 && ' The average household spends about 0.8x as much on eating out as groceries.'}
            </p>
            
            <div className="bg-slate-800/50 p-3 rounded-lg">
              {homeVsOutRatio > 1.2 ? (
                <div className="text-sm text-slate-300">
                  <strong className="text-white">Potential monthly savings:</strong> Cooking at home more often could save you approximately {formatCurrency(diningOutTotal * 0.3)} per month.
                </div>
              ) : (
                <div className="text-sm text-slate-300">
                  <strong className="text-white">Good balance:</strong> You have a healthy balance between home cooking and dining out.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Coffee Shop Analysis */}
        {coffee && coffeePercent > 10 && (
          <div className="bg-amber-900/30 border border-amber-800/50 p-4 rounded-lg">
            <h5 className="font-medium text-white mb-2">Coffee Shop Spending</h5>
            
            <p className="text-slate-300 mb-3">
              Coffee shops represent {Math.round(coffeePercent)}% of your food budget, or about {formatCurrency(coffeeTotal)} per month.
            </p>
            
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-sm text-slate-300">
                <strong className="text-white">Potential savings:</strong> Making coffee at home more often could save approximately {formatCurrency(coffeeTotal * 0.7)} per month.
              </div>
            </div>
          </div>
        )}
        
        {/* Food Budget Tips */}
        <div className="bg-blue-900/30 border border-blue-800/50 p-4 rounded-lg">
          <h5 className="font-medium text-white mb-2">Food Budget Tips</h5>
          
          <ul className="text-slate-300 text-sm space-y-2 list-disc pl-5">
            <li>Meal planning can reduce grocery costs by up to 25%</li>
            <li>Buying in bulk for staple items typically saves 15-20%</li>
            <li>Cooking at home is typically 5x cheaper than dining out</li>
            <li>Home-brewed coffee costs about $0.50/cup vs $5+ at cafes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalysis;