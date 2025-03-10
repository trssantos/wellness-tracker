// src/utils/ai-service.js
import { getStorage } from './storage';
import * as geminiService from './gemini-service';
import * as openaiService from './openai-service';

// AI Providers
export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OPENAI: 'openai'
};

// Get the currently selected AI provider
export const getAIProvider = () => {
  const storage = getStorage();
  return storage.settings?.aiProvider || AI_PROVIDERS.OPENAI; // Default to OpenAI
};

// Check if a provider is properly configured
export const isProviderConfigured = (provider) => {
  try {
    const storage = getStorage();
    
    if (provider === AI_PROVIDERS.GEMINI) {
      return !!process.env.REACT_APP_GEMINI_API_KEY;
    } else if (provider === AI_PROVIDERS.OPENAI) {
      // Check if using environment variable or custom key
      const useEnvVariableKey = storage.settings?.useEnvVariableKey !== false;
      
      if (useEnvVariableKey) {
        return !!process.env.REACT_APP_OPENAI_API_KEY;
      } else {
        return !!storage.settings?.openaiApiKey;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking provider configuration:", error);
    return false;
  }
};

// Generate content with the selected provider - generic function
export const generateContent = async (prompt) => {
  console.log('CALLING AI FOR ANALYSIS!');
  const provider = getAIProvider();
  
  if (provider === AI_PROVIDERS.OPENAI) {
    return await openaiService.generateContent(prompt);
  } else {
    // Use Gemini as fallback
    // Implementation would go here if we want to support Gemini for general prompts
    return await openaiService.generateContent(prompt); // Fallback to OpenAI for now
  }
};

// Generate tasks using the selected provider
export const generateTasks = async (userContext) => {
  const provider = getAIProvider();
  
  if (provider === AI_PROVIDERS.OPENAI) {
    try {
      return await openaiService.generateTasks(userContext);
    } catch (error) {
      // If the error is about API key configuration, provide a helpful error message
      if (error.message && error.message.includes('API key not configured')) {
        const storage = getStorage();
        const useEnvVariableKey = storage.settings?.useEnvVariableKey !== false;
        
        if (useEnvVariableKey) {
          throw new Error("OpenAI API key not found in environment variables. Add REACT_APP_OPENAI_API_KEY to your environment or choose 'Use custom API key' in Settings.");
        } else {
          throw new Error("OpenAI API key not configured. Please add your API key in Settings.");
        }
      }
      
      // Otherwise, rethrow the original error
      throw error;
    }
  } else {
    // Default to Gemini
    try {
      return await geminiService.generateTasks(userContext);
    } catch (error) {
      // If the error is about API key configuration
      if (error.message && error.message.includes('API key not configured')) {
        throw new Error("Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your environment.");
      }
      
      // Otherwise, rethrow the original error
      throw error;
    }
  }
};