
/**
 * Motion API utilities for workspace operations
 */

import { getApiKey, isUsingProxyMode } from './api-core';

// Fetch workspaces from Motion API
export const fetchWorkspaces = async (apiKey?: string): Promise<any[]> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    // If we're in proxy mode, return mock workspaces
    if (usedKey === 'proxy_mode' || isUsingProxyMode()) {
      console.log('Using proxy mode, returning mock workspaces');
      return [
        {
          id: 'proxy-workspace-1',
          name: 'Default Workspace'
        },
        {
          id: 'proxy-workspace-2',
          name: 'Marketing'
        },
        {
          id: 'proxy-workspace-3',
          name: 'Development'
        }
      ];
    }
    
    if (!usedKey) {
      console.error('No API key provided for fetching workspaces');
      return [];
    }
    
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
    
    console.log('Workspace fetch response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Workspaces fetched successfully:', data);
      
      // Check if the response has a workspaces property
      if (data && data.workspaces && Array.isArray(data.workspaces)) {
        console.log('Found workspaces array in response:', data.workspaces.length);
        return data.workspaces;
      } else {
        // If response is already an array, return it
        if (Array.isArray(data)) {
          return data;
        }
        console.error('Unexpected response format, no workspaces array found:', data);
        return [];
      }
    } else {
      if (response.status === 401) {
        console.error('Unauthorized when fetching workspaces. API key may be invalid or missing permissions');
        throw new Error("Authentication failed: Your API key doesn't have permission to access workspaces. Check your API key permissions in Motion settings.");
      } else {
        console.error(`Failed to fetch workspaces with status: ${response.status}`);
        throw new Error(`Failed to fetch workspaces with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Exception during workspaces fetch:', error);
    throw error;
  }
};

// Format workspaces for dropdown selection
export const getWorkspacesForDropdown = async (apiKey?: string): Promise<{label: string, value: string}[]> => {
  try {
    const workspaces = await fetchWorkspaces(apiKey);
    
    if (!workspaces || workspaces.length === 0) {
      console.log('No workspaces returned from API');
      return [];
    }
    
    return workspaces.map(workspace => ({
      label: workspace.name,
      value: workspace.id
    }));
  } catch (error) {
    console.error('Error getting workspaces for dropdown:', error);
    throw error;
  }
};

// Create a new workspace in Motion
export const createWorkspace = async (name: string, apiKey?: string): Promise<any> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    // If we're in proxy mode, return a mock workspace
    if (usedKey === 'proxy_mode' || isUsingProxyMode()) {
      console.log('Using proxy mode, returning mock workspace creation response');
      return {
        id: `proxy-workspace-${Date.now()}`,
        name: name
      };
    }
    
    if (!usedKey) {
      console.error('No API key provided for creating workspace');
      throw new Error('API key is required');
    }
    
    const response = await fetch('https://api.usemotion.com/v1/workspaces', {
      method: 'POST',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ name }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Workspace created successfully:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('Failed to create workspace:', errorData);
      if (response.status === 401) {
        throw new Error("Authentication failed: Your API key doesn't have permission to create workspaces. Check your API key permissions in Motion settings.");
      } else {
        throw new Error(errorData.message || 'Failed to create workspace');
      }
    }
  } catch (error) {
    console.error('Exception during workspace creation:', error);
    throw error;
  }
};
