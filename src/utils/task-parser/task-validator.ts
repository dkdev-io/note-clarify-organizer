
/**
 * Validation utilities for tasks
 */

import { Task, TaskValidationResult, MultiTaskValidationResult } from './types';

// Function to check if a task has all required fields
export const validateTask = (task: Task): TaskValidationResult => {
  const missingFields: string[] = [];
  
  if (!task.title || task.title.trim() === '') {
    missingFields.push('title');
  }
  
  if (!task.workspace_id) {
    missingFields.push('workspace_id');
  }
  
  if (task.isRecurring && !task.frequency) {
    missingFields.push('frequency');
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};

// Function to validate multiple tasks
export const validateTasks = (tasks: Task[]): MultiTaskValidationResult => {
  const tasksWithMissingFields = tasks.map(task => {
    const validation = validateTask(task);
    return {
      task,
      missingFields: validation.missingFields
    };
  }).filter(result => result.missingFields.length > 0);
  
  return {
    allValid: tasksWithMissingFields.length === 0,
    tasksWithMissingFields
  };
};
