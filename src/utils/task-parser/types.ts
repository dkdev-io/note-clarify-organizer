
/**
 * Shared types for the task parser system
 */

// Task type definition
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  status: 'todo' | 'in-progress' | 'done';
  assignee: string | null;
  workspace_id: string | null;
  isRecurring: boolean;
  frequency: string | null;
  project: string | null;
  projectId?: string | null; // Project ID for Motion API
}

// Type for task validation results
export interface TaskValidationResult {
  valid: boolean;
  missingFields: string[];
}

// Type for validating multiple tasks
export interface MultiTaskValidationResult {
  allValid: boolean;
  tasksWithMissingFields: { task: Task; missingFields: string[] }[];
}
