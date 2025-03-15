
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
  projectId: string | null; // Required field with null default
  duration: string | null; // Required field with null default
  timeEstimate: number | null; // Required field with null default
}

export interface RecurringTaskInfo {
  isRecurring: boolean;
  frequency: string | null;
}

// Ensure these validation interfaces are properly exported
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
