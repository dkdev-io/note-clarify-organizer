
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
    
    // Log a masked version of the key for debugging
    const maskedKey = usedKey.substring(0, 3) + '...' + usedKey.substring(usedKey.length - 3);
    console.log(`Validating API key: ${maskedKey}`);
    
    // Try the workspaces endpoint instead of /me which might not exist (with retry logic)
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const response = await fetch('https://api.usemotion.com/v1/workspaces', {
          method: 'GET',
          headers: {
            'X-API-Key': usedKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // Don't include credentials for cross-origin API calls
          mode: 'cors',
        });
        
        console.log('API validation response status:', response.status);
        
        if (response.status === 429) {
          // Rate limited, wait and retry
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Rate limited, waiting ${waitTime}ms before retry ${retryCount + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }
        
        if (response.ok) {
          const data = await response.json();
          console.log('API validation successful, workspaces:', data);
          
          // Store the validated key globally
          setMotionApiKey(usedKey);
          
          return true;
        } else {
          // Handle specific error responses with more detail
          if (response.status === 401) {
            console.error('API key validation failed: Unauthorized (401)');
            
            throw new Error("Authentication failed: Invalid API key or insufficient permissions. Make sure you've created a valid API key with read/write permissions in Motion settings.");
          } else if (response.status === 403) {
            console.error('API key validation failed: Forbidden (403)');
            throw new Error("Access forbidden: Your API key doesn't have sufficient permissions for this operation.");
          } else if (response.status === 404) {
            console.error('API key validation failed: Not Found (404)');
            throw new Error("API endpoint not found. The Motion API may have changed. Please check documentation for updates.");
          } else {
            console.error(`API key validation failed with status: ${response.status}`);
            throw new Error(`API request failed with status ${response.status}. Please check your network connection and try again.`);
          }
        }
      } catch (fetchError) {
        if (retryCount === maxRetries - 1) {
          throw fetchError;
        }
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`Fetch error, waiting ${waitTime}ms before retry ${retryCount}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  } catch (error) {
    console.error('Exception during API key validation:', error);
    throw error; // Propagate the error for better handling in components
  }
};
