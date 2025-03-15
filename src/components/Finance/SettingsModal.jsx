import React, { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw, Calendar } from 'lucide-react';
import ModalContainer from './ModalContainer';
import { getFinanceData, saveFinanceData } from '../../utils/financeUtils';

const SettingsModal = ({ onClose, onSettingsUpdated }) => {
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load current settings
    const financeData = getFinanceData();
    if (financeData.settings) {
      setCurrency(financeData.settings.currency || 'USD');
      setCurrencySymbol(financeData.settings.currencySymbol || '$');
      setDateFormat(financeData.settings.dateFormat || 'MM/DD/YYYY');
    }
  }, []);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', display: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', display: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', display: 'YYYY-MM-DD (ISO)' }
  ];

  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.target.value;
    setCurrency(selectedCurrency);
    
    // Also update the symbol based on selected currency
    const currencyData = currencies.find(c => c.code === selectedCurrency);
    if (currencyData) {
      setCurrencySymbol(currencyData.symbol);
    }
  };

  const handleSave = () => {
    const financeData = getFinanceData();
    
    // Update settings
    financeData.settings = {
      ...(financeData.settings || {}),
      currency,
      currencySymbol,
      dateFormat
    };
    
    saveFinanceData(financeData);
    
    // Show success message
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    
    if (onSettingsUpdated) {
      onSettingsUpdated();
    }
  };

  return (
    <ModalContainer title="Finance Settings" onClose={onClose}>
      {success && (
        <div className="bg-green-900/30 text-green-400 p-3 rounded-lg mb-4 flex items-center">
          <Save className="mr-2" size={18} />
          Settings saved successfully!
        </div>
      )}
      
      <div className="space-y-6">
        {/* Currency Settings */}
        <div>
          <h4 className="text-white dark:text-white font-medium mb-4 flex items-center gap-2">
            <DollarSign className="text-amber-400" size={18} />
            Currency Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={3}
              />
            </div>
          </div>
        </div>
        
        {/* Date Format Settings */}
        <div>
          <h4 className="text-white dark:text-white font-medium mb-4 flex items-center gap-2">
            <Calendar className="text-amber-400" size={18} />
            Date Format
          </h4>
          
          <div>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {dateFormats.map(format => (
                <option key={format.value} value={format.value}>
                  {format.display}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Budget Reset Settings */}
        <div>
          <h4 className="text-white dark:text-white font-medium mb-4 flex items-center gap-2">
            <RefreshCw className="text-amber-400" size={18} />
            Budget Reset
          </h4>
          
          <div className="bg-blue-900/30 p-4 rounded-lg">
            <p className="text-white dark:text-white mb-3">
              Budgets are automatically reset at the beginning of each month, while maintaining your budget history.
            </p>
            
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all budgets to zero? This action cannot be undone.')) {
                  // Logic to reset budgets
                  onSettingsUpdated();
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Reset All Budgets Now
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2"
        >
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </ModalContainer>
  );
};

export default SettingsModal;