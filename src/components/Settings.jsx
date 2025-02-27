import React, { useState, useEffect } from 'react';
import { X, Download, Upload, AlertCircle, Info, ArrowRight, CheckCircle, Settings as SettingsIcon, HelpCircle, Save } from 'lucide-react';
import { getStorage, setStorage } from '../utils/storage';
import { BackupRestoreDemo } from './BackupRestoreDemo';
import { AI_PROVIDERS, getAIProvider, isProviderConfigured } from '../utils/ai-service';
import { getOpenAISettings } from '../utils/openai-service';

export const Settings = ({ onClose }) => {
  const [backupStatus, setBackupStatus] = useState(null);
  const [restoreStatus, setRestoreStatus] = useState(null);
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  const [showHelpDemo, setShowHelpDemo] = useState(false);
  
  // AI Provider settings
  const [showAISettings, setShowAISettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(getAIProvider());
  const [openaiKey, setOpenaiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [useEnvVariableKey, setUseEnvVariableKey] = useState(true);
  const [openaiModel, setOpenaiModel] = useState('gpt-3.5-turbo');
  const [openaiTemperature, setOpenaiTemperature] = useState(0.7);
  const [aiSettingsStatus, setAISettingsStatus] = useState(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
  
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
    
    const openaiSettings = getOpenAISettings();
    setOpenaiModel(openaiSettings.model);
    setOpenaiTemperature(openaiSettings.temperature);
  }, []);
  
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
      link.download = `zentrack-backup-${new Date().toISOString().split('T')[0]}.json`;
      
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
      
      // Save AI provider
      storage.settings.aiProvider = selectedProvider;
      
      // Save whether to use environment variable for API key
      storage.settings.useEnvVariableKey = useEnvVariableKey;
      
      // If NOT using environment variable and we have a key, save it
      if (!useEnvVariableKey && openaiKey) {
        storage.settings.openaiApiKey = openaiKey;
        setSavedKey(maskApiKey(openaiKey));
        setOpenaiKey(''); // Clear input after saving for security
      }
      
      // OpenAI model settings
      storage.settings.openaiSettings = {
        model: openaiModel,
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
          {/* AI Provider Settings */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 transition-colors">
            <button
              onClick={() => setShowAISettings(!showAISettings)}
              className="w-full flex items-center justify-between text-lg font-medium text-slate-800 dark:text-slate-200 mb-2 transition-colors"
            >
              <span>AI Provider Settings</span>
              <ArrowRight className={`transition-transform duration-300 ${showAISettings ? 'rotate-90' : ''}`} size={20} />
            </button>
            
            {showAISettings && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                    Select AI Provider
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="aiProvider"
                        value={AI_PROVIDERS.GEMINI}
                        checked={selectedProvider === AI_PROVIDERS.GEMINI}
                        onChange={() => setSelectedProvider(AI_PROVIDERS.GEMINI)}
                        className="form-radio text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300 transition-colors">Gemini</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="aiProvider"
                        value={AI_PROVIDERS.OPENAI}
                        checked={selectedProvider === AI_PROVIDERS.OPENAI}
                        onChange={() => setSelectedProvider(AI_PROVIDERS.OPENAI)}
                        className="form-radio text-green-500 focus:ring-green-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300 transition-colors">OpenAI</span>
                    </label>
                  </div>
                </div>
                
                {selectedProvider === AI_PROVIDERS.GEMINI && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-700 dark:text-blue-300 text-sm transition-colors">
                    Gemini uses the API key configured in your environment variables (.env file). For local development, add REACT_APP_GEMINI_API_KEY to your .env file.
                  </div>
                )}
                
                {selectedProvider === AI_PROVIDERS.OPENAI && (
                  <div className="space-y-4">
                    {/* API Key Source Selection */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                        OpenAI API Key Source
                      </label>
                      <div className="flex flex-col space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="apiKeySource"
                            checked={useEnvVariableKey}
                            onChange={() => setUseEnvVariableKey(true)}
                            className="form-radio text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300 transition-colors">
                            Use environment variable (REACT_APP_OPENAI_API_KEY)
                          </span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="apiKeySource"
                            checked={!useEnvVariableKey}
                            onChange={() => setUseEnvVariableKey(false)}
                            className="form-radio text-blue-500 focus:ring-blue-500"
                          />
                          <span className="text-slate-700 dark:text-slate-300 transition-colors">
                            Use custom API key
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Environment variable status */}
                    {useEnvVariableKey && (
                      <div className={`p-3 rounded-lg text-sm ${
                        isApiKeyConfigured 
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        } transition-colors`}>
                        {isApiKeyConfigured 
                          ? 'OpenAI API key is configured in environment variables.' 
                          : 'OpenAI API key is not configured in environment variables. Add REACT_APP_OPENAI_API_KEY to your environment.'}
                      </div>
                    )}
                    
                    {/* Custom API key input */}
                    {!useEnvVariableKey && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                          OpenAI API Key
                        </label>
                        <input
                          type="password"
                          value={openaiKey}
                          onChange={(e) => setOpenaiKey(e.target.value)}
                          placeholder={savedKey || "Enter your OpenAI API key"}
                          className="input-field"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                          {savedKey ? "API key saved. Enter a new key to update." : "Your API key will be stored locally and never sent to our servers."}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                        OpenAI Model
                      </label>
                      <select
                        value={openaiModel}
                        onChange={(e) => setOpenaiModel(e.target.value)}
                        className="input-field"
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">
                        Temperature ({openaiTemperature})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={openaiTemperature}
                        onChange={(e) => setOpenaiTemperature(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 transition-colors">
                        <span>More focused (0)</span>
                        <span>More creative (1)</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSaveAISettings}
                  className="btn-primary flex items-center gap-2 mt-4"
                >
                  <Save size={18} />
                  Save AI Settings
                </button>
                
                {aiSettingsStatus && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center gap-2
                    ${aiSettingsStatus.success 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'} 
                    transition-colors`}
                  >
                    {aiSettingsStatus.success ? (
                      <CheckCircle size={18} />
                    ) : (
                      <AlertCircle size={18} />
                    )}
                    <span>{aiSettingsStatus.message}</span>
                  </div>
                )}
              </div>
            )}
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