
/**
 * Utility for storing and retrieving API keys in localStorage
 */

const MOTION_API_KEY_STORAGE_KEY = 'motion_api_key_storage';

// Store the API key in localStorage
export const storeApiKey = (apiKey: string): void => {
  if (!apiKey) return;
  
  try {
    localStorage.setItem(MOTION_API_KEY_STORAGE_KEY, apiKey);
    console.log('API key stored in localStorage');
  } catch (error) {
    console.error('Failed to store API key in localStorage:', error);
  }
};

// Retrieve the API key from localStorage
export const retrieveApiKey = (): string | null => {
  try {
    const storedKey = localStorage.getItem(MOTION_API_KEY_STORAGE_KEY);
    return storedKey;
  } catch (error) {
    console.error('Failed to retrieve API key from localStorage:', error);
    return null;
  }
};

// Clear the API key from localStorage
export const clearStoredApiKey = (): void => {
  try {
    localStorage.removeItem(MOTION_API_KEY_STORAGE_KEY);
    console.log('API key removed from localStorage');
  } catch (error) {
    console.error('Failed to remove API key from localStorage:', error);
  }
};
