
/**
 * Type definitions for the task parser
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  status: 'todo' | 'in_progress' | 'completed' | string | null;
  assignee: string | null;
  workspace_id: string | null;
  isRecurring: boolean;
  frequency: string | null;
  project: string | null;
  projectId?: string | null; // Add projectId field
  duration?: string | null;
  timeEstimate?: number | null; // Add timeEstimate field
}

export interface RecurringTaskInfo {
  isRecurring: boolean;
  frequency: string | null;
}

// Add the missing validation result interfaces
export interface TaskValidationResult {
  valid: boolean;
  missingFields: string[];
}

export interface MultiTaskValidationResult {
  allValid: boolean;
  tasksWithMissingFields: Array<{
    task: Task;
    missingFields: string[];
  }>;
}
