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
  
  // Simulate API call to search for existing project
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Mock implementation - in a real app, this would search Motion for the project
  const mockProjects: MotionProject[] = [
    { id: 'project-1', name: 'Website Redesign', workspace_id: 'workspace-1' },
    { id: 'project-2', name: 'Marketing Campaign', workspace_id: 'workspace-2' },
    { id: 'project-3', name: 'Product Launch', workspace_id: 'workspace-3' }
  ];
  
  // Check if project already exists (case-insensitive partial match)
  const existingProject = mockProjects.find(p => 
    p.name.toLowerCase().includes(projectName.toLowerCase()) && 
    p.workspace_id === workspaceId
  );
  
  if (existingProject) {
    return { id: existingProject.id, isNew: false };
  }
  
  // Project doesn't exist, create a new one
  console.log(`Creating new project: ${projectName}`);
  
  // Simulate API call to create project
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate a mock project ID
  const newProjectId = `project-${Math.random().toString(36).substring(2, 8)}`;
  
  return { id: newProjectId, isNew: true };
};

// Mock function for Motion API integration
// This would be replaced with actual API calls once the API key is provided
export const addTaskToMotion = async (task: Task): Promise<{ success: boolean; error?: MotionApiError }> => {
  console.log('Simulating API call to Motion with task:', task);
  
  // Simulate API call
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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate success
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
  console.log('Validating Motion API key:', apiKey);
  
  // This is a placeholder for actual API validation
  // In a real implementation, you would make a test call to the Motion API
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demonstration, we'll consider any non-empty key as valid
  return apiKey.trim().length > 0;
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

// Fetch workspaces (mock function)
export const fetchWorkspaces = async (): Promise<MotionWorkspace[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Return mock workspaces
  return [
    { id: 'workspace-1', name: 'Personal' },
    { id: 'workspace-2', name: 'Team Projects' },
    { id: 'workspace-3', name: 'Client Work' }
  ];
};

// Search for projects in Motion
export const searchProjects = async (
  query: string, 
  workspaceId?: string
): Promise<MotionProject[]> => {
  console.log(`Searching for projects with query: ${query}${workspaceId ? ` in workspace: ${workspaceId}` : ''}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Mock projects
  const allProjects: MotionProject[] = [
    { id: 'project-1', name: 'Website Redesign', workspace_id: 'workspace-1' },
    { id: 'project-2', name: 'Marketing Campaign', workspace_id: 'workspace-2' },
    { id: 'project-3', name: 'Product Launch', workspace_id: 'workspace-3' },
    { id: 'project-4', name: 'Q1 Planning', workspace_id: 'workspace-1' },
    { id: 'project-5', name: 'Mobile App Development', workspace_id: 'workspace-2' },
    { id: 'project-6', name: 'Annual Report', workspace_id: 'workspace-3' }
  ];
  
  // Filter by workspace if provided
  let filteredProjects = workspaceId 
    ? allProjects.filter(p => p.workspace_id === workspaceId)
    : allProjects;
  
  // Filter by query if provided
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredProjects = filteredProjects.filter(p => 
      p.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  return filteredProjects;
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
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Create a mock project
  const newProject: MotionProject = {
    id: `project-${Math.random().toString(36).substring(2, 8)}`,
    name,
    description,
    workspace_id: workspaceId
  };
  
  return {
    success: true,
    project: newProject
  };
};

// New function to get all workspaces for dropdown
export const getWorkspacesForDropdown = async (): Promise<{label: string, value: string}[]> => {
  try {
    const workspaces = await fetchWorkspaces();
    return workspaces.map(workspace => ({
      label: workspace.name,
      value: workspace.id
    }));
  } catch (error) {
    console.error('Error fetching workspaces for dropdown:', error);
    return [];
  }
};

// New function to search projects for dropdown
export const getProjectsForDropdown = async (
  query: string = '',
  workspaceId?: string
): Promise<{label: string, value: string}[]> => {
  try {
    const projects = await searchProjects(query, workspaceId);
    return projects.map(project => ({
      label: project.name,
      value: project.id
    }));
  } catch (error) {
    console.error('Error fetching projects for dropdown:', error);
    return [];
  }
};
