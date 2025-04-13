import React, { useState, useEffect } from 'react';
import { X, Download, Upload, AlertCircle, Info, ArrowRight, CheckCircle, Settings as SettingsIcon, HelpCircle, Save } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import { BackupRestoreDemo } from './BackupRestoreDemo';
import { AI_PROVIDERS } from '../utils/ai-service';
import { formatDateForStorage } from '../utils/dateUtils';
import { rebuildTaskStats } from '../utils/migrateTaskStats';

export const Settings = ({ onClose }) => {
  const [backupStatus, setBackupStatus] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState(null);
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  const [showHelpDemo, setShowHelpDemo] = useState(false);
  
  // AI Provider settings
  const [showAISettings, setShowAISettings] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [useEnvVariableKey, setUseEnvVariableKey] = useState(true);
  const [openaiTemperature, setOpenaiTemperature] = useState(0.7);
  const [aiSettingsStatus, setAISettingsStatus] = useState(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);

  const [weightUnit, setWeightUnit] = useState('lbs');
  
  // Load saved OpenAI settings
  useEffect(() => {
    const storage = getStorage();
    
    // Check if using environment variable
    setUseEnvVariableKey(storage.settings?.useEnvVariableKey !== false);
    
    // Check if OpenAI API key is configured via environment variables
    setIsApiKeyConfigured(!!process.env.REACT_APP_OPENAI_API_KEY);
    
    if (storage.settings?.openaiApiKey) {
      // Show masked key for security
      setSavedKey(maskApiKey(storage.settings.openaiApiKey));
    }
    
    // Load temperature setting
    if (storage.settings?.openaiSettings?.temperature !== undefined) {
      setOpenaiTemperature(storage.settings.openaiSettings.temperature);
    }
  }, []);

  // Load saved weight unit
useEffect(() => {
  const storage = getStorage();
  setWeightUnit(storage.settings?.weightUnit || 'lbs');
}, []);

// Handler for weight unit change
const handleWeightUnitChange = (unit) => {
  const storage = getStorage();
  if (!storage.settings) {
    storage.settings = {};
  }
  storage.settings.weightUnit = unit;
  setStorage(storage);
  setWeightUnit(unit);
};
  
  const maskApiKey = (key) => {
    if (!key) return '';
    if (key.length <= 8) return '********';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  };

  const handleBackup = () => {
    try {
      // Get all app data from localStorage
      const storageData = getStorage();
      
      // Convert to a JSON string
      const dataStr = JSON.stringify(storageData, null, 2);
      
      // Create a Blob with the data
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create a download URL
      const url = URL.createObjectURL(dataBlob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `zentrack-backup-${formatDateForStorage(new Date())}.json`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL to free memory
      URL.revokeObjectURL(url);
      
      setBackupStatus({ success: true, message: 'Backup successfully downloaded!' });
      
      setTimeout(() => {
        setBackupStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Backup failed:', error);
      setBackupStatus({ success: false, message: 'Failed to create backup: ' + error.message });
    }
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setRestoreStatus({ success: null, message: 'Reading backup file...' });
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate the data (basic check)
        if (typeof data !== 'object') {
          throw new Error('Invalid backup file format');
        }
        
        // Store the restored data
        setStorage(data);
        
        setRestoreStatus({ success: true, message: 'Data successfully restored!' });
        
        // Clear the input
        event.target.value = '';
        
        setTimeout(() => {
          setRestoreStatus(null);
          onClose(true); // Close with refresh flag
        }, 2000);
      } catch (error) {
        console.error('Restore failed:', error);
        setRestoreStatus({ success: false, message: 'Failed to restore: ' + error.message });
        
        // Clear the input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      setRestoreStatus({ success: false, message: 'Failed to read backup file' });
      
      // Clear the input
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };
  
  const handleSaveAISettings = () => {
    try {
      const storage = getStorage();
      
      // Initialize settings object if needed
      if (!storage.settings) {
        storage.settings = {};
      }
      
      // Save AI provider - now always OpenAI
      storage.settings.aiProvider = AI_PROVIDERS.OPENAI;
      
      // Save whether to use environment variable for API key
      storage.settings.useEnvVariableKey = useEnvVariableKey;
      
      // If NOT using environment variable and we have a key, save it
      if (!useEnvVariableKey && openaiKey) {
        storage.settings.openaiApiKey = openaiKey;
        setSavedKey(maskApiKey(openaiKey));
        setOpenaiKey(''); // Clear input after saving for security
      }
      
      // OpenAI temperature settings (but not model, which is fixed)
      storage.settings.openaiSettings = {
        temperature: parseFloat(openaiTemperature)
      };
      
      setStorage(storage);
      
      setAISettingsStatus({ success: true, message: 'AI settings saved successfully!' });
      
      setTimeout(() => {
        setAISettingsStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      setAISettingsStatus({ success: false, message: 'Failed to save settings: ' + error.message });
    }
  };

  const RebuildTaskStats = () => {
    const [isRebuilding, setIsRebuilding] = useState(false);
    const [result, setResult] = useState(null);
  
    const handleRebuild = async () => {
      if (window.confirm('This will rebuild your task completion statistics. Continue?')) {
        setIsRebuilding(true);
        try {
          // Wrap in setTimeout to allow UI to update
          setTimeout(() => {
            const rebuiltStats = rebuildTaskStats();
            setResult(rebuiltStats);
            setIsRebuilding(false);
          }, 100);
        } catch (error) {
          console.error('Error rebuilding task stats:', error);
          setIsRebuilding(false);
          setResult({ error: error.message });
        }
      }
    };
  
    return (
      <div className="setting-group">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-2">Task Statistics</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Rebuild task completion statistics if numbers appear incorrect or inconsistent.
        </p>
        
        <button
          onClick={handleRebuild}
          disabled={isRebuilding}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors disabled:opacity-50"
        >
          {isRebuilding ? 'Rebuilding...' : 'Rebuild Task Statistics'}
        </button>
        
        {result && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            {result.error ? (
              <p className="text-red-600 dark:text-red-400">Error: {result.error}</p>
            ) : (
              <p className="text-green-600 dark:text-green-400">
                Success! Found {result.completionsFound} completions across {result.daysProcessed} days.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };
  

  return (
    <dialog 
      id="settings-modal" 
      className="modal-base"
      onClick={(e) => e.target.id === 'settings-modal' && onClose()}
    >
      <div className="modal-content max-w-xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title flex items-center gap-2">
              <SettingsIcon className="text-slate-600 dark:text-slate-400" size={20} />
              Settings
            </h3>
            <p className="modal-subtitle">
              Configure your app settings
            </p>
          </div>
          <button
            onClick={() => onClose()}
            className="modal-close-button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Weight Unit Preference */}
<div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 transition-colors">
  <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3 transition-colors">
    Workout Settings
  </h4>
  
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
      Weight Unit
    </label>
    <div className="flex space-x-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="weightUnit"
          checked={weightUnit === 'lbs'}
          onChange={() => handleWeightUnitChange('lbs')}
          className="form-radio text-blue-500 focus:ring-blue-500"
        />
        <span className="text-slate-700 dark:text-slate-300 transition-colors">
          Pounds (lbs)
        </span>
      </label>
      
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="weightUnit"
          checked={weightUnit === 'kg'}
          onChange={() => handleWeightUnitChange('kg')}
          className="form-radio text-blue-500 focus:ring-blue-500"
        />
        <span className="text-slate-700 dark:text-slate-300 transition-colors">
          Kilograms (kg)
        </span>
      </label>
    </div>
  </div>
</div>
          
          {/* Backup section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 transition-colors">
            <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3 transition-colors">
              Data Backup
            </h4>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4 transition-colors">
              Download a backup file containing all your ZenTrack data. 
              You can use this file to restore your data later or on another device.
            </p>
            
            <button
              onClick={handleBackup}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={18} />
              Download Backup
            </button>
            
            {backupStatus && (
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2
                ${backupStatus.success 
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'} 
                transition-colors`}
              >
                {backupStatus.success ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{backupStatus.message}</span>
              </div>
            )}
          </div>
          
          {/* Restore section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 transition-colors">
            <h4 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-3 transition-colors">
              Data Restore
            </h4>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4 transition-colors">
              Restore your data from a previously created backup file.
              <span className="block mt-1 text-amber-600 dark:text-amber-400 font-medium transition-colors">
                Warning: This will replace all your current data!
              </span>
            </p>
            
            <div className="relative">
              <label className="btn-primary flex items-center gap-2 justify-center cursor-pointer">
                <Upload size={18} />
                <span>Upload Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
            
            {restoreStatus && (
              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2
                ${restoreStatus.success === true 
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : restoreStatus.success === false
                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'} 
                transition-colors`}
              >
                {restoreStatus.success === true ? (
                  <CheckCircle size={18} />
                ) : restoreStatus.success === false ? (
                  <AlertCircle size={18} />
                ) : (
                  <Info size={18} />
                )}
                <span>{restoreStatus.message}</span>
              </div>
            )}
          </div>
          
          {/* Synchronization information */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 transition-colors">
            <button
              onClick={() => setShowSyncInfo(!showSyncInfo)}
              className="w-full flex items-center justify-between text-lg font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors"
            >
              <span>Data Synchronization Options</span>
              <ArrowRight className={`transition-transform duration-300 ${showSyncInfo ? 'rotate-90' : ''}`} size={20} />
            </button>
            
            {showSyncInfo && (
              <div className="mt-3 text-slate-600 dark:text-slate-400 space-y-4 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-full text-blue-600 dark:text-blue-400 transition-colors">
                    <Info size={18} />
                  </div>
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 transition-colors">
                      About Chrome Sync
                    </h5>
                    <p className="mt-1">
                      The Chrome Sync API is only available to Chrome Extensions, not regular web applications.
                      However, there are alternative ways to keep your data in sync:
                    </p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-4">
                  <div>
                    <h6 className="font-medium text-slate-700 dark:text-slate-300 transition-colors">
                      Manual Backup & Restore
                    </h6>
                    <p>
                      Use the backup and restore features above to manually transfer your data
                      between devices when needed.
                    </p>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-slate-700 dark:text-slate-300 transition-colors">
                      Cloud Storage Services
                    </h6>
                    <p>
                      Save your backup file to a cloud storage service like Google Drive, Dropbox,
                      or OneDrive to access it from multiple devices.
                    </p>
                  </div>
                  
                  <div>
                    <h6 className="font-medium text-slate-700 dark:text-slate-300 transition-colors">
                      Browser Extensions
                    </h6>
                    <p>
                      There are third-party browser extensions that can automatically sync your localStorage data
                      across devices, though we recommend caution with extensions that access your data.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <RebuildTaskStats />
        
        {/* Help section with interactive demo */}
        <div className="mt-6 bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 transition-colors">
          <button
            onClick={() => setShowHelpDemo(!showHelpDemo)}
            className="w-full flex items-center justify-between text-lg font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-blue-500 dark:text-blue-400" />
              <span>How to Backup & Restore</span>
            </div>
            <ArrowRight className={`transition-transform duration-300 ${showHelpDemo ? 'rotate-90' : ''}`} size={20} />
          </button>
          
          {showHelpDemo && (
            <div className="mt-4">
              <p className="text-slate-600 dark:text-slate-400 mb-4 transition-colors">
                Follow this interactive guide to learn how to backup and restore your data:
              </p>
              <BackupRestoreDemo />
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default Settings;