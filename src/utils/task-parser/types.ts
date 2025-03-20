
/**
 * Type definitions for the task parser
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  startDate: string | null;  // Added for Motion's start date
  hardDeadline: boolean;     // Added for Motion's hard deadline flag
  priority: 'low' | 'medium' | 'high' | null;
  status: 'todo' | 'in_progress' | 'completed' | string | null;
  assignee: string | null;
  workspace_id: string | null;
  isRecurring: boolean;
  frequency: string | null;
  project: string | null;
  projectId: string | null;
  duration: string | null;
  timeEstimate: number | null;
  folder: string | null;      // Added for Motion's folder organization
  autoScheduled: boolean;     // Added for auto-scheduled flag
  isPending: boolean;         // Added for pending status
  schedule: string | null;    // Added for schedule preference (e.g., "Work hours")
  labels: string[] | null;    // Added for task labels
  customFields: Record<string, any> | null;  // Added for custom fields
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
