
/**
 * Utilities for editing and refining tasks
 */

import { Task } from './types';

// Function to refine a task based on user feedback
export const refineTask = (task: Task, updates: Partial<Task>): Task => {
  return {
    ...task,
    ...updates
  };
};
