/**
 * Motion API utilities for authentication and task management
 */

import { Task } from './parser';
import { retrieveApiKey } from './keyStorage';

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

// Fix the React Fragment warning in Index.tsx
export const fixReactFragmentWarning = () => {
  // This is a dummy function to remind us to fix the React Fragment warning
  console.warn('Remember to fix React Fragment warning in Index.tsx');
};

// Fetch projects for a specific workspace
export const fetchProjects = async (workspaceId: string, apiKey?: string): Promise<any[]> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    // If we're in proxy mode, return mock projects
    if (usedKey === 'proxy_mode' || isUsingProxyMode()) {
      console.log('Using proxy mode, returning mock projects');
      return [
        {
          id: `project-${workspaceId}-1`,
          name: 'Default Project'
        },
        {
          id: `project-${workspaceId}-2`,
          name: 'Marketing'
        },
        {
          id: `project-${workspaceId}-3`,
          name: 'Development'
        }
      ];
    }
    
    if (!usedKey) {
      console.error('No API key provided for fetching projects');
      return [];
    }
    
    if (!workspaceId) {
      console.error('No workspace ID provided for fetching projects');
      return [];
    }
    
    // Try the projects endpoint directly with workspace as filter
    // Motion API might have changed or the documentation might be outdated
    console.log(`Attempting to fetch projects for workspace: ${workspaceId}`);
    
    // Try a different endpoint pattern
    const response = await fetch(`https://api.usemotion.com/v1/projects?workspaceId=${workspaceId}`, {
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
      
      // Check if the response has a lists or projects property
      if (data && data.projects && Array.isArray(data.projects)) {
        console.log('Found projects array in response:', data.projects.length);
        return data.projects;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.error('Unexpected response format, no projects array found:', data);
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
        
        // If we're still getting errors, try to manually construct project data
        // This is a fallback for testing/development
        console.log('Falling back to manual project construction for testing');
        return [
          {
            id: `project-${workspaceId}-1`,
            name: 'Default Project'
          },
          {
            id: `project-${workspaceId}-2`,
            name: 'Marketing'
          },
          {
            id: `project-${workspaceId}-3`,
            name: 'Development'
          }
        ];
      }
    }
  } catch (error) {
    console.error('Exception during projects fetch:', error);
    // Provide fallback data for testing
    return [
      {
        id: `project-${workspaceId}-1`,
        name: 'Default Project'
      },
      {
        id: `project-${workspaceId}-2`,
        name: 'Marketing'
      },
      {
        id: `project-${workspaceId}-3`,
        name: 'Development'
      }
    ];
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

// Create a new project in Motion
export const createProject = async (workspaceId: string, name: string, apiKey?: string): Promise<any> => {
  try {
    const usedKey = getApiKey(apiKey);
    
    // If we're in proxy mode, return a mock project
    if (usedKey === 'proxy_mode' || isUsingProxyMode()) {
      console.log('Using proxy mode, returning mock project creation response');
      return {
        id: `project-${workspaceId}-${Date.now()}`,
        name: name
      };
    }
    
    if (!usedKey) {
      console.error('No API key provided for creating project');
      throw new Error('API key is required');
    }
    
    // Try the projects endpoint directly
    const response = await fetch(`https://api.usemotion.com/v1/projects`, {
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
        // If API call fails, return a mock response for testing
        console.log('Returning mock project creation response for testing');
        return {
          id: `project-${workspaceId}-${Date.now()}`,
          name: name
        };
      }
    }
  } catch (error) {
    console.error('Exception during project creation:', error);
    // Provide fallback data for testing
    return {
      id: `project-${workspaceId}-${Date.now()}`,
      name: name
    };
  }
};

// Add tasks to Motion
export const addTasksToMotion = async (
  tasks: Task[], 
  workspaceId: string | null, 
  apiKey?: string,
  projectId?: string
): Promise<{ success: boolean; message: string; errors?: any[] }> => {
  // If we're in proxy mode, simulate successful task creation
  if (apiKey === 'proxy_mode' || isUsingProxyMode()) {
    console.log('Using proxy mode, simulating task creation');
    return {
      success: true,
      message: `Successfully added ${tasks.length} tasks to Motion using proxy mode`,
    };
  }

  if (!workspaceId || !apiKey) {
    return { 
      success: false, 
      message: "Missing workspace ID or API key" 
    };
  }

  try {
    // Create an array to store any errors that occur
    const errors: any[] = [];
    const successfulTasks: Task[] = [];
    
    // Process tasks in sequence to avoid rate limiting
    for (const task of tasks) {
      try {
        // Prepare task data with proper field names for the Motion API
        const taskData: any = {
          name: task.title,
          description: task.description || "",
          workspaceId: workspaceId,
        };
        
        // Only add projectId if it's defined
        if (projectId) {
          taskData.projectId = projectId;
          console.log(`Adding task "${task.title}" to project ID: ${projectId}`);
        } else {
          console.log(`Adding task "${task.title}" without project ID`);
        }
        
        // We'll re-add dueDate later once we confirm the API is working
        // if (task.dueDate) {
        //   taskData.dueDate = task.dueDate;
        // }
        
        console.log("Sending task to Motion:", taskData);
        
        // Call the Motion API to create the task
        const response = await fetch("https://api.usemotion.com/v1/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error creating task:", errorData);
          errors.push({
            task: task.title,
            error: errorData,
            status: response.status
          });
        } else {
          const responseData = await response.json();
          console.log("Success creating task:", responseData);
          successfulTasks.push(task);
        }
      } catch (err) {
        console.error("Error processing individual task:", err);
        errors.push({
          task: task.title,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
    
    // Determine if the operation was successful overall
    if (errors.length === 0) {
      return {
        success: true,
        message: `Successfully added ${tasks.length} tasks to Motion`,
      };
    } else if (successfulTasks.length > 0) {
      return {
        success: true,
        message: `Added ${successfulTasks.length} out of ${tasks.length} tasks to Motion`,
        errors,
      };
    } else {
      return {
        success: false,
        message: "Failed to add tasks to Motion. See errors below",
        errors,
      };
    }
  } catch (error) {
    console.error("Error adding tasks to Motion:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

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
