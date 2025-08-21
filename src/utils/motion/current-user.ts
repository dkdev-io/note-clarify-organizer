/**
 * Utilities for getting current Motion user information
 */

import { getApiKey, isUsingProxyMode } from './api-core';

// Get current user information from Motion API
export const getCurrentUser = async (apiKey?: string): Promise<any> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    // If we're in proxy mode, return mock user
    if (usedKey === 'proxy_mode' || isUsingProxyMode()) {
      console.log('Using proxy mode, returning mock current user');
      return {
        id: 'current-user-1',
        name: 'Current User',
        email: 'current@example.com'
      };
    }
    
    if (!usedKey) {
      console.error('No API key provided for getting current user');
      return null;
    }
    
    console.log('Fetching current user information...');
    
    // Try the /me endpoint or workspaces to get user info
    const response = await fetch('https://api.usemotion.com/v1/workspaces', {
      method: 'GET',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Try to extract user info from workspaces response
      if (data && data.workspaces && data.workspaces.length > 0) {
        // For now, we'll use a generic "Me" as the user name
        // In a real implementation, you'd need to call a proper user endpoint
        return {
          id: 'current-user',
          name: 'Me',
          email: 'current@user.com'
        };
      }
    }
    
    // Fallback to generic current user
    return {
      id: 'current-user',
      name: 'Me',
      email: 'current@user.com'
    };
    
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Return fallback user
    return {
      id: 'current-user',
      name: 'Me',
      email: 'current@user.com'
    };
  }
};

// Get current user name for task assignment
export const getCurrentUserName = async (apiKey?: string): Promise<string> => {
  try {
    const user = await getCurrentUser(apiKey);
    return user?.name || 'Me';
  } catch (error) {
    console.error('Error getting current user name:', error);
    return 'Me';
  }
};