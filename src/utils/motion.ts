
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
    
    // Call the /me endpoint to validate the key
    const response = await fetch('https://api.usemotion.com/v1/me', {
      method: 'GET',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API validation response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API validation successful, user data:', data);
      
      // Store the validated key globally
      setMotionApiKey(usedKey);
      
      return true;
    } else {
      // Handle specific error responses with more detail
      if (response.status === 401) {
        console.error('API key validation failed: Unauthorized (401)');
        
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          console.error('No error details available');
        }
        
        return false;
      } else {
        console.error(`API key validation failed with status: ${response.status}`);
        return false;
      }
    }
  } catch (error) {
    console.error('Exception during API key validation:', error);
    return false;
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
      },
    });
    
    console.log('Workspace fetch response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Workspaces fetched successfully:', data);
      return data;
    } else {
      console.error(`Failed to fetch workspaces with status: ${response.status}`);
      
      if (response.status === 401) {
        console.error('Unauthorized. API key may be invalid or expired');
      }
      
      return [];
    }
  } catch (error) {
    console.error('Exception during workspaces fetch:', error);
    return [];
  }
};

// Format workspaces for dropdown selection
export const getWorkspacesForDropdown = async (apiKey?: string): Promise<{label: string, value: string}[]> => {
  const workspaces = await fetchWorkspaces(apiKey);
  
  if (!workspaces || workspaces.length === 0) {
    console.log('No workspaces returned from API');
    return [];
  }
  
  return workspaces.map(workspace => ({
    label: workspace.name,
    value: workspace.id
  }));
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
    
    const response = await fetch(`https://api.usemotion.com/v1/workspaces/${workspaceId}/projects`, {
      method: 'GET',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Projects fetch response for workspace ${workspaceId} status:`, response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Projects fetched successfully:', data);
      return data;
    } else {
      console.error(`Failed to fetch projects with status: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error('Exception during projects fetch:', error);
    return [];
  }
};

// Format projects for dropdown selection
export const getProjectsForDropdown = async (workspaceId: string, apiKey?: string): Promise<{label: string, value: string}[]> => {
  const projects = await fetchProjects(workspaceId, apiKey);
  
  if (!projects || projects.length === 0) {
    console.log('No projects returned from API');
    return [];
  }
  
  return projects.map(project => ({
    label: project.name,
    value: project.id
  }));
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
      },
      body: JSON.stringify({ name }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Workspace created successfully:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('Failed to create workspace:', errorData);
      throw new Error(errorData.message || 'Failed to create workspace');
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
    
    const response = await fetch(`https://api.usemotion.com/v1/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      headers: {
        'X-API-Key': usedKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Project created successfully:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('Failed to create project:', errorData);
      throw new Error(errorData.message || 'Failed to create project');
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
