
/**
 * Core Motion API utilities for authentication and common functionality
 */

import { retrieveApiKey } from '../keyStorage';

// Store API key in memory for reuse across components
let globalApiKey: string | null = null;
// Flag to track if we're using proxy mode
let isProxyMode = false;

// Set the API key for use across components
export const setMotionApiKey = (apiKey: string | null) => {
  if (apiKey) {
    // Clean the API key to remove any whitespace, quotes, etc.
    const cleanedApiKey = apiKey.trim().replace(/^["']|["']$/g, '');
    
    // Check if we're in proxy mode
    if (cleanedApiKey === 'proxy_mode') {
      isProxyMode = true;
      console.log('Setting API key mode to proxy');
      sessionStorage.setItem('using_motion_proxy', 'true');
    } else {
      isProxyMode = false;
      sessionStorage.removeItem('using_motion_proxy');
    }
    
    globalApiKey = cleanedApiKey;
    console.log('API key set in motion utils:', isProxyMode ? 'proxy_mode' : (cleanedApiKey.substring(0, 3) + '...' + cleanedApiKey.substring(cleanedApiKey.length - 3)));
    return cleanedApiKey;
  } else {
    globalApiKey = null;
    isProxyMode = false;
    sessionStorage.removeItem('using_motion_proxy');
    return null;
  }
};

// Get the API key (or use the provided one)
export const getApiKey = (providedApiKey?: string): string | null => {
  // Use provided key first (and clean it), then fall back to global key, then localStorage
  if (providedApiKey) {
    return providedApiKey.trim().replace(/^["']|["']$/g, '');
  }
  
  if (globalApiKey) {
    return globalApiKey;
  }
  
  // Try to get from localStorage as last resort
  return retrieveApiKey();
};

// Check if we're in proxy mode
export const isUsingProxyMode = () => {
  return isProxyMode || getApiKey() === 'proxy_mode' || sessionStorage.getItem('using_motion_proxy') === 'true';
};

// Fix the React Fragment warning in Index.tsx
export const fixReactFragmentWarning = () => {
  // This is a dummy function to remind us to fix the React Fragment warning
  console.warn('Remember to fix React Fragment warning in Index.tsx');
};
