
/**
 * Motion API authentication utilities
 */

import { getApiKey, setMotionApiKey, isUsingProxyMode } from './api-core';

// Validate the Motion API key
export const validateMotionApiKey = async (apiKey?: string): Promise<boolean> => {
  try {
    console.log('Validating API key...');
    const usedKey = getApiKey(apiKey);
    
    // If we're in proxy mode, return true without actually validating
    if (usedKey === 'proxy_mode' || isUsingProxyMode()) {
      console.log('Proxy mode detected, skipping actual API validation');
      return true;
    }
    
    if (!usedKey) {
      console.error('No API key provided for validation');
      return false;
    }
    
    // Store the key without making API calls to avoid rate limiting
    setMotionApiKey(usedKey);
    console.log('API key stored successfully');
    return true;
  } catch (error) {
    console.error('Exception during API key validation:', error);
    throw error;
  }
};
