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
  recurring?: {
    frequency: string;
  };
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
    
    // Convert our task format to Motion's format
    const motionTask: MotionTask = {
      name: task.title,
      description: task.description,
      status: convertStatusToMotion(task.status),
      workspace_id: task.workspace_id
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
