
/**
 * Utility functions for interacting with the Motion API
 */

import { Task } from './parser';

// Motion API Types
interface MotionTask {
  title: string;
  description: string;
  due_date?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  assignee_id?: string;
}

interface MotionApiError {
  message: string;
  code?: string;
}

// Mock function for Motion API integration
// This would be replaced with actual API calls once the API key is provided
export const addTaskToMotion = async (task: Task): Promise<{ success: boolean; error?: MotionApiError }> => {
  console.log('Simulating API call to Motion with task:', task);
  
  // Simulate API call
  try {
    // Convert our task format to Motion's format
    const motionTask: MotionTask = {
      title: task.title,
      description: task.description,
      status: 'TODO',
    };
    
    if (task.dueDate) {
      motionTask.due_date = task.dueDate;
    }
    
    if (task.priority) {
      motionTask.priority = task.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
    }
    
    if (task.assignee) {
      // In a real implementation, you would look up the assignee's ID in Motion
      motionTask.assignee_id = task.assignee;
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
export const addTasksToMotion = async (tasks: Task[]): Promise<{ success: boolean; successCount: number; failedCount: number; errors?: MotionApiError[] }> => {
  const results = await Promise.all(tasks.map(task => addTaskToMotion(task)));
  
  const successCount = results.filter(result => result.success).length;
  const failedCount = results.length - successCount;
  const errors = results
    .filter(result => !result.success && result.error)
    .map(result => result.error as MotionApiError);
  
  return {
    success: failedCount === 0,
    successCount,
    failedCount,
    errors: errors.length > 0 ? errors : undefined
  };
};
