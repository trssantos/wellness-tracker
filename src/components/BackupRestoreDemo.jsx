import React, { useState } from 'react';
import { Download, Upload, Settings, ArrowRight, CheckCircle } from 'lucide-react';

export const BackupRestoreDemo = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showRestore, setShowRestore] = useState(false);
  
  const steps = [
    { id: 1, text: "Click the Settings icon" },
    { id: 2, text: "Select 'Download Backup'" },
    { id: 3, text: "Save the JSON file" },
    { id: 4, text: "Success! Your data is backed up" }
  ];
  
  const restoreSteps = [
    { id: 1, text: "Click the Settings icon" },
    { id: 2, text: "Select 'Upload Backup File'" },
    { id: 3, text: "Choose your backup file" },
    { id: 4, text: "Success! Your data is restored" }
  ];
  
  const nextStep = () => {
    if (activeStep < (showRestore ? restoreSteps.length - 1 : steps.length - 1)) {
      setActiveStep(activeStep + 1);
    } else {
      setActiveStep(0);
    }
  };
  
  const toggleMode = () => {
    setShowRestore(!showRestore);
    setActiveStep(0);
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden w-full max-w-2xl">
      <div className="p-4 bg-blue-500 dark:bg-blue-600 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold">ZenTrack</h2>
        <button className="p-2 bg-white/10 rounded-full" onClick={nextStep}>
          <Settings size={20} />
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 p-6">
        {/* Illustration */}
        <div className="w-full sm:w-1/2 flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg transition-colors">
          {activeStep === 0 && (
            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-300 transition-colors">
              <Settings size={64} className="text-blue-500 dark:text-blue-400" />
              <p className="text-center mt-4">Click the Settings icon to get started</p>
            </div>
          )}
          
          {activeStep === 1 && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full max-w-xs transition-colors">
              <h3 className="font-medium mb-4 text-slate-700 dark:text-slate-200 transition-colors">Settings</h3>
              <div className="flex items-center gap-2 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors">
                {showRestore ? <Upload size={18} /> : <Download size={18} />}
                <span>{showRestore ? "Upload Backup File" : "Download Backup"}</span>
              </div>
            </div>
          )}
          
          {activeStep === 2 && !showRestore && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full max-w-xs flex flex-col items-center transition-colors">
              <h3 className="font-medium mb-4 text-slate-700 dark:text-slate-200 transition-colors">Save File</h3>
              <Download size={40} className="text-blue-500 dark:text-blue-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center transition-colors">
                zentrack-backup-2025-02-26.json
              </p>
            </div>
          )}
          
          {activeStep === 2 && showRestore && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md w-full max-w-xs flex flex-col items-center transition-colors">
              <h3 className="font-medium mb-4 text-slate-700 dark:text-slate-200 transition-colors">Choose File</h3>
              <Upload size={40} className="text-blue-500 dark:text-blue-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center transition-colors">
                Select your backup file
              </p>
            </div>
          )}
          
          {activeStep === 3 && (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 transition-colors">
                <CheckCircle size={40} className="text-green-500 dark:text-green-400" />
              </div>
              <p className="font-medium text-green-600 dark:text-green-400 mt-2 text-center transition-colors">
                {showRestore ? "Data successfully restored!" : "Backup successfully downloaded!"}
              </p>
            </div>
          )}
        </div>
        
        {/* Process steps */}
        <div className="w-full sm:w-1/2 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-slate-700 dark:text-slate-200 transition-colors">
              {showRestore ? "Restore Process" : "Backup Process"}
            </h3>
            <button 
              onClick={toggleMode}
              className="text-sm text-blue-500 dark:text-blue-400 flex items-center gap-1 transition-colors"
            >
              Switch to {showRestore ? "Backup" : "Restore"}
              <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="space-y-2">
            {(showRestore ? restoreSteps : steps).map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  activeStep === index 
                    ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" 
                    : activeStep > index
                      ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                      : "bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
                }`}
              >
                <div className={`rounded-full w-6 h-6 flex items-center justify-center ${
                  activeStep === index 
                    ? "bg-blue-500 text-white"
                    : activeStep > index
                      ? "bg-green-500 text-white"
                      : "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                }`}>
                  {activeStep > index ? <CheckCircle size={12} /> : step.id}
                </div>
                
                <div className="flex-1">
                  <p className={`font-medium ${
                    activeStep === index
                      ? "text-blue-700 dark:text-blue-300"
                      : activeStep > index
                        ? "text-green-700 dark:text-green-300"
                        : "text-slate-700 dark:text-slate-300"
                  } transition-colors`}>
                    {step.text}
                  </p>
                  {activeStep === index && (
                    <button 
                      onClick={nextStep}
                      className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600 transition-colors">
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center transition-colors">
          Click "Continue" to step through the demonstration
        </p>
      </div>
    </div>
  );
};

export default BackupRestoreDemo;