
/**
 * Utility functions for interacting with the Motion API
 */

import { Task } from './parser';

// Motion API Types
interface MotionTask {
  name: string;
  description: string;
  due_date?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  assignee_id?: string;
  workspace_id: string;
  project_id?: string;
  recurring?: {
    frequency: string;
  };
}

interface MotionProject {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
}

interface MotionApiError {
  message: string;
  code?: string;
}

interface MotionWorkspace {
  id: string;
  name: string;
}

// Format a date in YYYY-MM-DD format for the Motion API
const formatDateForMotion = (dateString: string | null): string | undefined => {
  if (!dateString) return undefined;
  
  try {
    // Ensure the date is in the correct format for the API (YYYY-MM-DD)
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;
    
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error("Error formatting date:", e);
    return undefined;
  }
};

// Function to find or create a project in Motion
export const findOrCreateProject = async (
  projectName: string, 
  workspaceId: string
): Promise<{ id: string; isNew: boolean; error?: MotionApiError }> => {
  console.log(`Searching for project: ${projectName} in workspace: ${workspaceId}`);
  
  try {
    // First try to find the project
    const projects = await searchProjects(projectName, workspaceId);
    const existingProject = projects.find(p => 
      p.name.toLowerCase() === projectName.toLowerCase()
    );
    
    if (existingProject) {
      return { id: existingProject.id, isNew: false };
    }
    
    // Project doesn't exist, create a new one
    console.log(`Creating new project: ${projectName}`);
    const result = await createProject(projectName, workspaceId);
    
    if (!result.success || !result.project) {
      return { 
        id: '', 
        isNew: false, 
        error: result.error || { message: 'Failed to create project' } 
      };
    }
    
    return { id: result.project.id, isNew: true };
  } catch (error) {
    console.error('Error in findOrCreateProject:', error);
    return { 
      id: '', 
      isNew: false, 
      error: { message: 'Error finding or creating project' } 
    };
  }
};

// Function to add a task to Motion
export const addTaskToMotion = async (task: Task): Promise<{ success: boolean; error?: MotionApiError }> => {
  console.log('Adding task to Motion:', task);
  
  try {
    // Validate required fields
    if (!task.title) {
      return {
        success: false,
        error: {
          message: 'Task name is required',
          code: 'MISSING_FIELD'
        }
      };
    }
    
    if (!task.workspace_id) {
      return {
        success: false,
        error: {
          message: 'Workspace ID is required',
          code: 'MISSING_FIELD'
        }
      };
    }
    
    // If the task has a project name but no project ID, find or create the project
    let projectId = undefined;
    if (task.project) {
      const projectResult = await findOrCreateProject(task.project, task.workspace_id);
      if (projectResult.error) {
        return {
          success: false,
          error: projectResult.error
        };
      }
      projectId = projectResult.id;
    }
    
    // Convert our task format to Motion's format
    const motionTask: MotionTask = {
      name: task.title,
      description: task.description,
      status: convertStatusToMotion(task.status),
      workspace_id: task.workspace_id,
      project_id: projectId
    };
    
    if (task.dueDate) {
      motionTask.due_date = formatDateForMotion(task.dueDate);
    }
    
    if (task.priority) {
      motionTask.priority = task.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
    }
    
    if (task.assignee) {
      // In a real implementation, you would look up the assignee's ID in Motion
      motionTask.assignee_id = task.assignee;
    }
    
    if (task.isRecurring && task.frequency) {
      motionTask.recurring = {
        frequency: task.frequency
      };
    }
    
    // Make the API call to create the task
    const response = await fetch('https://api.usemotion.com/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-motion-api-key': window.localStorage.getItem('motion_api_key') || '',
      },
      body: JSON.stringify(motionTask),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to add task to Motion',
          code: errorData.code || 'API_ERROR'
        }
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding task to Motion:', error);
    return { 
      success: false, 
      error: { 
        message: 'Failed to add task to Motion',
        code: 'API_ERROR'
      } 
    };
  }
};

// Function to validate Motion API key
export const validateMotionApiKey = async (apiKey: string): Promise<boolean> => {
  console.log('Validating Motion API key...');
  
  try {
    // Store the API key in localStorage for other functions to use
    window.localStorage.setItem('motion_api_key', apiKey);
    
    // Try to fetch workspaces to validate the API key
    const response = await fetch('https://api.usemotion.com/v1/workspaces', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-motion-api-key': apiKey,
      },
    });
    
    const responseText = await response.text();
    console.log('Motion API validation response status:', response.status);
    console.log('Motion API validation response:', responseText);
    
    if (!response.ok) {
      console.error('Motion API validation failed with status:', response.status);
      console.error('Response body:', responseText);
      
      // Check if the API key format is valid (simple check)
      if (!apiKey || apiKey.length < 10) {
        console.error('API key appears to be invalid or too short');
      }
      
      // Clear the API key from localStorage if validation fails
      window.localStorage.removeItem('motion_api_key');
      return false;
    }
    
    try {
      // Try to parse the response as JSON to make sure it's valid
      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      // Check if the response has the expected workspaces array
      if (!data.workspaces) {
        console.error('Response missing workspaces array');
        window.localStorage.removeItem('motion_api_key');
        return false;
      }
      
      return true;
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      window.localStorage.removeItem('motion_api_key');
      return false;
    }
  } catch (error) {
    console.error('Error validating Motion API key:', error);
    window.localStorage.removeItem('motion_api_key');
    return false;
  }
};

// Batch add multiple tasks
export const addTasksToMotion = async (tasks: Task[]): Promise<{ 
  success: boolean; 
  successCount: number; 
  failedCount: number; 
  errors?: MotionApiError[];
  taskErrors?: {taskId: string; errors: string[]}[];
}> => {
  const results = await Promise.all(tasks.map(task => addTaskToMotion(task)));
  
  const successCount = results.filter(result => result.success).length;
  const failedCount = results.length - successCount;
  const errors = results
    .filter(result => !result.success && result.error)
    .map(result => result.error as MotionApiError);
  
  // Track errors by task
  const taskErrors = tasks
    .map((task, index) => ({
      taskId: task.id,
      success: results[index].success,
      error: results[index].error
    }))
    .filter(item => !item.success && item.error)
    .map(item => ({
      taskId: item.taskId,
      errors: [item.error?.message || 'Unknown error']
    }));
  
  return {
    success: failedCount === 0,
    successCount,
    failedCount,
    errors: errors.length > 0 ? errors : undefined,
    taskErrors: taskErrors.length > 0 ? taskErrors : undefined
  };
};

// Helper function to convert status to Motion format
const convertStatusToMotion = (status: 'todo' | 'in-progress' | 'done'): string => {
  switch (status) {
    case 'todo':
      return 'TODO';
    case 'in-progress':
      return 'IN_PROGRESS';
    case 'done':
      return 'DONE';
    default:
      return 'TODO';
  }
};

// Fetch workspaces from Motion API
export const fetchWorkspaces = async (): Promise<MotionWorkspace[]> => {
  console.log('Fetching workspaces from Motion API...');
  
  try {
    const apiKey = window.localStorage.getItem('motion_api_key');
    if (!apiKey) {
      console.error('No API key found in localStorage');
      return [];
    }

    const response = await fetch('https://api.usemotion.com/v1/workspaces', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-motion-api-key': apiKey,
      },
    });
    
    console.log('Fetch workspaces response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch workspaces:', response.status, errorText);
      return [];
    }
    
    const responseText = await response.text();
    console.log('Fetched workspaces response:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed workspaces data:', data);
      return data.workspaces || [];
    } catch (parseError) {
      console.error('Error parsing workspaces response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return [];
  }
};

// Search for projects in Motion
export const searchProjects = async (
  query: string = '', 
  workspaceId?: string
): Promise<MotionProject[]> => {
  console.log(`Searching for projects in workspace: ${workspaceId}`);
  
  if (!workspaceId) {
    return [];
  }
  
  try {
    const apiKey = window.localStorage.getItem('motion_api_key');
    if (!apiKey) {
      console.error('No API key found in localStorage');
      return [];
    }

    const response = await fetch(`https://api.usemotion.com/v1/workspaces/${workspaceId}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-motion-api-key': apiKey,
      },
    });
    
    console.log('Fetch projects response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to search projects:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log('Fetched projects:', data);
    let projects = data.projects || [];
    
    // Filter by query if provided
    if (query) {
      const lowerQuery = query.toLowerCase();
      projects = projects.filter((p: any) => 
        p.name.toLowerCase().includes(lowerQuery)
      );
    }
    
    return projects;
  } catch (error) {
    console.error('Error searching projects:', error);
    return [];
  }
};

// Create a new project in Motion
export const createProject = async (
  name: string,
  workspaceId: string,
  description?: string
): Promise<{ success: boolean; project?: MotionProject; error?: MotionApiError }> => {
  console.log(`Creating project: ${name} in workspace: ${workspaceId}`);
  
  // Validate required fields
  if (!name) {
    return {
      success: false,
      error: {
        message: 'Project name is required',
        code: 'MISSING_FIELD'
      }
    };
  }
  
  if (!workspaceId) {
    return {
      success: false,
      error: {
        message: 'Workspace ID is required',
        code: 'MISSING_FIELD'
      }
    };
  }
  
  try {
    const apiKey = window.localStorage.getItem('motion_api_key');
    if (!apiKey) {
      console.error('No API key found in localStorage');
      return {
        success: false,
        error: {
          message: 'API key not found',
          code: 'MISSING_API_KEY'
        }
      };
    }

    const response = await fetch(`https://api.usemotion.com/v1/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-motion-api-key': apiKey,
      },
      body: JSON.stringify({
        name,
        description
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          message: errorData.message || 'Failed to create project',
          code: errorData.code || 'API_ERROR'
        }
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      project: data.project
    };
  } catch (error) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: {
        message: 'Failed to create project',
        code: 'API_ERROR'
      }
    };
  }
};

// New function to get all workspaces for dropdown
export const getWorkspacesForDropdown = async (): Promise<{label: string, value: string}[]> => {
  try {
    const workspaces = await fetchWorkspaces();
    console.log('Workspaces for dropdown:', workspaces);
    return workspaces.map(workspace => ({
      label: workspace.name,
      value: workspace.id
    }));
  } catch (error) {
    console.error('Error fetching workspaces for dropdown:', error);
    return [];
  }
};

// New function to get projects for dropdown
export const getProjectsForDropdown = async (
  workspaceId?: string
): Promise<{label: string, value: string}[]> => {
  if (!workspaceId) {
    console.log('No workspace ID provided for projects dropdown');
    return [];
  }
  
  try {
    // Get all projects, no query filter
    const projects = await searchProjects('', workspaceId);
    console.log('Projects for dropdown:', projects);
    return projects.map(project => ({
      label: project.name,
      value: project.id
    }));
  } catch (error) {
    console.error('Error fetching projects for dropdown:', error);
    return [];
  }
};
