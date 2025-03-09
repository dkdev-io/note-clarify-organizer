
/**
 * Motion API utilities for authentication and task management
 */

import { Task } from './parser';

// Store API key in memory for reuse across components
let globalApiKey: string | null = null;

// Set the API key for use across components
export const setMotionApiKey = (apiKey: string | null) => {
  if (apiKey) {
    // Clean the API key to remove any whitespace, quotes, etc.
    const cleanedApiKey = apiKey.trim().replace(/^["']|["']$/g, '');
    globalApiKey = cleanedApiKey;
    console.log('API key set in motion utils:', cleanedApiKey.substring(0, 3) + '...' + cleanedApiKey.substring(cleanedApiKey.length - 3));
    return cleanedApiKey;
  } else {
    globalApiKey = null;
    return null;
  }
};

// Get the API key (or use the provided one)
export const getApiKey = (providedApiKey?: string) => {
  // Use provided key first (and clean it), then fall back to global key
  if (providedApiKey) {
    return providedApiKey.trim().replace(/^["']|["']$/g, '');
  }
  return globalApiKey;
};

// Validate the Motion API key
export const validateMotionApiKey = async (apiKey?: string): Promise<boolean> => {
  try {
    console.log('Validating API key...');
    const usedKey = getApiKey(apiKey);
    
    if (!usedKey) {
      console.error('No API key provided for validation');
      return false;
    }
    
    // Log a masked version of the key for debugging
    const maskedKey = usedKey.substring(0, 3) + '...' + usedKey.substring(usedKey.length - 3);
    console.log(`Validating API key: ${maskedKey}`);
    
    // Try the workspaces endpoint instead of /me which might not exist
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
  } catch (error) {
    console.error('Exception during API key validation:', error);
    throw error; // Propagate the error for better handling in components
  }
};

// Fetch workspaces from Motion API
export const fetchWorkspaces = async (apiKey?: string): Promise<any[]> => {
  try {
    const usedKey = getApiKey(apiKey);
    
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

// Fix the React Fragment warning in Index.tsx
export const fixReactFragmentWarning = () => {
  // This is a dummy function to remind us to fix the React Fragment warning
  console.warn('Remember to fix React Fragment warning in Index.tsx');
};

// Fetch projects for a specific workspace
export const fetchProjects = async (workspaceId: string, apiKey?: string): Promise<any[]> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    if (!usedKey) {
      console.error('No API key provided for fetching projects');
      return [];
    }
    
    if (!workspaceId) {
      console.error('No workspace ID provided for fetching projects');
      return [];
    }
    
    // Based on API error and documentation, try the /v1/lists endpoint with workspace ID as a query parameter
    // This seems to be the correct approach according to errors and network requests
    const response = await fetch(`https://api.usemotion.com/v1/lists?workspaceId=${workspaceId}`, {
      method: 'GET',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
    });
    
    console.log(`Projects fetch response for workspace ${workspaceId} status:`, response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Projects fetched successfully:', data);
      
      // Check if the response has a lists property
      if (data && data.lists && Array.isArray(data.lists)) {
        console.log('Found lists array in response:', data.lists.length);
        return data.lists;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.error('Unexpected response format, no lists array found:', data);
        return [];
      }
    } else {
      if (response.status === 401) {
        console.error('Unauthorized when fetching projects. API key may be invalid or missing permissions');
        throw new Error("Authentication failed: Your API key doesn't have permission to access projects. Check your API key permissions in Motion settings.");
      } else {
        console.error(`Failed to fetch projects with status: ${response.status}`);
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch projects with status: ${response.status}. API response: ${errorData}`);
      }
    }
  } catch (error) {
    console.error('Exception during projects fetch:', error);
    throw error;
  }
};

// Format projects for dropdown selection
export const getProjectsForDropdown = async (workspaceId: string, apiKey?: string): Promise<{label: string, value: string}[]> => {
  try {
    const projects = await fetchProjects(workspaceId, apiKey);
    
    if (!projects || projects.length === 0) {
      console.log('No projects returned from API');
      return [];
    }
    
    return projects.map(project => ({
      label: project.name,
      value: project.id
    }));
  } catch (error) {
    console.error('Error getting projects for dropdown:', error);
    throw error;
  }
};

// Create a new workspace in Motion
export const createWorkspace = async (name: string, apiKey?: string): Promise<any> => {
  try {
    const usedKey = getApiKey(apiKey);
    
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

// Create a new project in Motion
export const createProject = async (workspaceId: string, name: string, apiKey?: string): Promise<any> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    if (!usedKey) {
      console.error('No API key provided for creating project');
      throw new Error('API key is required');
    }
    
    // Based on the tested endpoint for fetching projects, use the same pattern for creating
    const response = await fetch(`https://api.usemotion.com/v1/lists`, {
      method: 'POST',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ 
        name,
        workspaceId 
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Project created successfully:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('Failed to create project:', errorData);
      if (response.status === 401) {
        throw new Error("Authentication failed: Your API key doesn't have permission to create projects. Check your API key permissions in Motion settings.");
      } else {
        throw new Error(errorData.message || 'Failed to create project');
      }
    }
  } catch (error) {
    console.error('Exception during project creation:', error);
    throw error;
  }
};

// Add tasks to Motion
export const addTasksToMotion = async (tasks: Task[], apiKey?: string): Promise<{
  success: boolean;
  successCount: number;
  failedCount: number;
  taskErrors?: { taskId: string; errors: string[] }[];
}> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    if (!usedKey) {
      console.error('No API key provided for adding tasks');
      return {
        success: false,
        successCount: 0,
        failedCount: tasks.length,
        taskErrors: tasks.map(task => ({
          taskId: task.id,
          errors: ['API key is required']
        }))
      };
    }
    
    let successCount = 0;
    let failedCount = 0;
    const taskErrors: { taskId: string; errors: string[] }[] = [];
    
    // Process each task one by one (for better error handling)
    for (const task of tasks) {
      try {
        // Basic task validation
        if (!task.title) {
          failedCount++;
          taskErrors.push({
            taskId: task.id,
            errors: ['Task title is required']
          });
          continue;
        }
        
        // Prepare task data for Motion API
        const taskData = {
          title: task.title,
          description: task.description || '',
          workspace_id: task.workspace_id,
          // Add other fields as needed by Motion API
        };
        
        // Call Motion API to create task
        // This is a mock implementation - replace with actual Motion API endpoint
        // const response = await fetch('https://api.usemotion.com/v1/tasks', {
        //   method: 'POST',
        //   headers: {
        //     'X-API-Key': usedKey,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(taskData),
        // });
        
        // If the API call was successful, increment success count
        // For now, we'll simulate success
        successCount++;
        
      } catch (error) {
        failedCount++;
        console.error(`Error adding task ${task.id}:`, error);
        taskErrors.push({
          taskId: task.id,
          errors: [(error as Error).message || 'Unknown error']
        });
      }
    }
    
    return {
      success: failedCount === 0,
      successCount,
      failedCount,
      taskErrors: taskErrors.length > 0 ? taskErrors : undefined
    };
  } catch (error) {
    console.error('Exception during tasks addition:', error);
    return {
      success: false,
      successCount: 0,
      failedCount: tasks.length,
      taskErrors: [{ 
        taskId: 'batch', 
        errors: [(error as Error).message || 'Unknown error'] 
      }]
    };
  }
};
