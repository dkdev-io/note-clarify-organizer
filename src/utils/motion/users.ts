
/**
 * Motion API utilities for user operations
 */

import { getApiKey, isUsingProxyMode } from './api-core';

// Fetch users for a specific workspace
export const fetchUsers = async (workspaceId: string, apiKey?: string): Promise<any[]> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    // If we're in proxy mode, return mock users
    if (usedKey === 'proxy_mode' || isUsingProxyMode()) {
      console.log('Using proxy mode, returning mock users');
      return [
        {
          id: `user-${workspaceId}-1`,
          name: 'John Doe',
          email: 'john@example.com',
          avatar: null
        },
        {
          id: `user-${workspaceId}-2`,
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: null
        },
        {
          id: `user-${workspaceId}-3`,
          name: 'Alex Johnson',
          email: 'alex@example.com',
          avatar: null
        }
      ];
    }
    
    if (!usedKey) {
      console.error('No API key provided for fetching users');
      return [];
    }
    
    if (!workspaceId) {
      console.error('No workspace ID provided for fetching users');
      return [];
    }
    
    console.log(`Attempting to fetch users for workspace: ${workspaceId}`);
    
    // Try the users endpoint with workspace filter
    const response = await fetch(`https://api.usemotion.com/v1/users?workspaceId=${workspaceId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log(`Users fetch response for workspace ${workspaceId} status:`, response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Users fetched successfully:', data);
      
      // Check if the response has a users property
      if (data && data.users && Array.isArray(data.users)) {
        console.log('Found users array in response:', data.users.length);
        return data.users;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.error('Unexpected response format, no users array found:', data);
        return [];
      }
    } else {
      if (response.status === 401) {
        console.error('Unauthorized when fetching users. API key may be invalid or missing permissions');
        throw new Error("Authentication failed: Your API key doesn't have permission to access users. Check your API key permissions in Motion settings.");
      } else {
        console.error(`Failed to fetch users with status: ${response.status}`);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        
        // Fallback to mock users for testing/development
        console.log('Falling back to mock users for testing');
        return [
          {
            id: `user-${workspaceId}-1`,
            name: 'John Doe',
            email: 'john@example.com',
            avatar: null
          },
          {
            id: `user-${workspaceId}-2`,
            name: 'Jane Smith',
            email: 'jane@example.com',
            avatar: null
          },
          {
            id: `user-${workspaceId}-3`,
            name: 'Alex Johnson',
            email: 'alex@example.com',
            avatar: null
          }
        ];
      }
    }
  } catch (error) {
    console.error('Exception during users fetch:', error);
    // Provide fallback data for testing
    return [
      {
        id: `user-${workspaceId}-1`,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null
      },
      {
        id: `user-${workspaceId}-2`,
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: null
      },
      {
        id: `user-${workspaceId}-3`,
        name: 'Alex Johnson',
        email: 'alex@example.com',
        avatar: null
      }
    ];
  }
};

// Format users for dropdown selection
export const getUsersForDropdown = async (workspaceId: string, apiKey?: string): Promise<{label: string, value: string}[]> => {
  try {
    const users = await fetchUsers(workspaceId, apiKey);
    
    if (!users || users.length === 0) {
      console.log('No users returned from API');
      return [];
    }
    
    return users.map(user => ({
      label: user.name || user.email,
      value: user.id
    }));
  } catch (error) {
    console.error('Error getting users for dropdown:', error);
    throw error;
  }
};
