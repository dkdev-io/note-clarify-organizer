
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
  duration?: string | null; // Add duration field
}

export interface RecurringTaskInfo {
  isRecurring: boolean;
  frequency: string | null;
}
